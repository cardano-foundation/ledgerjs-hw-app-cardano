import type {
  BIP32Path,
  Certificate,
  InputTypeUTxO,
  MultiHostNameRelay,
  Network,
  PoolMetadataParams,
  PoolOwnerParams,
  PoolParams,
  RelayParams,
  SingleHostIPRelay,
  SingleHostNameRelay,
  StakingBlockchainPointer,
  TxOutput,
  TxOutputTypeAddress,
  TxOutputTypeAddressParams,
  ValueOf,
  Withdrawal,
} from "./Ada";
import { TxOutputTypeCodes } from "./Ada";
import { TxErrors } from "./txErrors";
import utils, { Assert, invariant, Precondition, unreachable } from "./utils";
import { hex_to_buf } from "./utils";

const HARDENED = 0x80000000;

export enum AddressTypeNibble {
  BASE = 0b0000,
  POINTER = 0b0100,
  ENTERPRISE = 0b0110,
  BYRON = 0b1000,
  REWARD = 0b1110,
}

export enum CertificateType {
  STAKE_REGISTRATION = 0,
  STAKE_DEREGISTRATION = 1,
  STAKE_DELEGATION = 2,
  STAKE_POOL_REGISTRATION = 3,
}

export const SignTxIncluded = Object.freeze({
  SIGN_TX_INCLUDED_NO: 1,
  SIGN_TX_INCLUDED_YES: 2,
});

const KEY_HASH_LENGTH = 28;
const TX_HASH_LENGTH = 32;

const TOKEN_POLICY_LENGTH = 28;
const TOKEN_NAME_LENGTH = 32;

const ASSET_GROUPS_MAX = 1000;
const TOKENS_IN_GROUP_MAX = 1000;

const POOL_REGISTRATION_OWNERS_MAX = 1000;
const POOL_REGISTRATION_RELAYS_MAX = 1000;

export const GetKeyErrors = {
  INVALID_PATH: "invalid key path",
};

function validateCertificates(certificates: Array<Certificate>) {
  Precondition.checkIsArray(certificates, TxErrors.CERTIFICATES_NOT_ARRAY);
  const isSigningPoolRegistrationAsOwner = certificates.some(
    (cert) => cert.type === CertificateType.STAKE_POOL_REGISTRATION
  );

  for (const cert of certificates) {
    if (!cert) throw new Error(TxErrors.CERTIFICATE_INVALID);

    switch (cert.type) {
      case CertificateType.STAKE_REGISTRATION: {
        Precondition.check(
          !isSigningPoolRegistrationAsOwner,
          TxErrors.CERTIFICATES_COMBINATION_FORBIDDEN
        );
        Precondition.checkIsValidPath(
          cert.path,
          TxErrors.CERTIFICATE_MISSING_PATH
        );
        Precondition.check(
          !cert.poolKeyHashHex,
          TxErrors.CERTIFICATE_SUPERFLUOUS_POOL_KEY_HASH
        );
        break;
      }
      case CertificateType.STAKE_DEREGISTRATION: {
        Precondition.check(
          !isSigningPoolRegistrationAsOwner,
          TxErrors.CERTIFICATES_COMBINATION_FORBIDDEN
        );
        Precondition.checkIsValidPath(
          cert.path,
          TxErrors.CERTIFICATE_MISSING_PATH
        );
        Precondition.check(
          !cert.poolKeyHashHex,
          TxErrors.CERTIFICATE_SUPERFLUOUS_POOL_KEY_HASH
        );
        break;
      }
      case CertificateType.STAKE_DELEGATION: {
        Precondition.check(
          !isSigningPoolRegistrationAsOwner,
          TxErrors.CERTIFICATES_COMBINATION_FORBIDDEN
        );
        Precondition.checkIsValidPath(
          cert.path,
          TxErrors.CERTIFICATE_MISSING_PATH
        );
        Precondition.checkIsHexStringOfLength(
          cert.poolKeyHashHex,
          KEY_HASH_LENGTH,
          TxErrors.CERTIFICATE_MISSING_POOL_KEY_HASH
        );
        break;
      }
      case CertificateType.STAKE_POOL_REGISTRATION: {
        Assert.assert(isSigningPoolRegistrationAsOwner);
        Precondition.check(!cert.path, TxErrors.CERTIFICATE_SUPERFLUOUS_PATH);
        const poolParams = cert.poolRegistrationParams;
        Precondition.check(
          !!poolParams,
          TxErrors.CERTIFICATE_POOL_MISSING_POOL_PARAMS
        );
        invariant(!!poolParams)
        // serialization succeeds if and only if params are valid
        serializePoolInitialParams(poolParams);

        // owners
        Precondition.checkIsArray(
          poolParams.poolOwners,
          TxErrors.CERTIFICATE_POOL_OWNERS_NOT_ARRAY
        );
        let numPathOwners = 0;
        for (const owner of poolParams.poolOwners) {
          if (owner.stakingPath) {
            numPathOwners++;
            serializePoolOwnerParams(owner);
          }
        }
        if (numPathOwners !== 1)
          throw new Error(TxErrors.CERTIFICATE_POOL_OWNERS_SINGLE_PATH);

        // relays
        Precondition.checkIsArray(
          poolParams.relays,
          TxErrors.CERTIFICATE_POOL_RELAYS_NOT_ARRAY
        );
        for (const relay of poolParams.relays) {
          parsePoolRelayParams(relay);
        }

        // metadata
        parsePoolMetadataParams(poolParams.metadata);

        break;
      }
      default:
        throw new Error(TxErrors.CERTIFICATE_INVALID);
    }
  }
}

export function validateTransaction(
  network: Network,
  inputs: Array<InputTypeUTxO>,
  outputs: Array<TxOutputTypeAddress | TxOutputTypeAddressParams>,
  feeStr: string,
  ttlStr: string | undefined,
  certificates: Array<Certificate>,
  withdrawals: Array<Withdrawal>,
  metadataHashHex?: string,
  validityIntervalStartStr?: string
) {
  Precondition.checkIsArray(certificates, TxErrors.CERTIFICATES_NOT_ARRAY);
  const isSigningPoolRegistrationAsOwner = certificates.some(
    (cert) => cert.type === CertificateType.STAKE_POOL_REGISTRATION
  );

  // inputs
  Precondition.checkIsArray(inputs, TxErrors.INPUTS_NOT_ARRAY);
  for (const input of inputs) {
    Precondition.checkIsHexStringOfLength(
      input.txHashHex,
      TX_HASH_LENGTH,
      TxErrors.INPUT_INVALID_TX_HASH
    );

    if (isSigningPoolRegistrationAsOwner) {
      // input should not be given with a path
      // the path is not used, but we check just to avoid potential confusion of developers using this
      Precondition.check(!input.path, TxErrors.INPUT_WITH_PATH);
    }
  }

  // outputs
  Precondition.checkIsArray(outputs, TxErrors.OUTPUTS_NOT_ARRAY);
  for (const output of outputs) {
    // we try to serialize the data, an error is thrown if ada amount or address params are invalid
    serializeOutputBasicParams(output, network);

    if ("spendingPath" in output && output.spendingPath != null) {
      Precondition.check(
        !isSigningPoolRegistrationAsOwner,
        TxErrors.OUTPUT_WITH_PATH
      );
    }

    if (output.tokenBundle) {
      Precondition.checkIsArray(
        output.tokenBundle,
        TxErrors.OUTPUT_INVALID_TOKEN_BUNDLE
      );
      Precondition.check(output.tokenBundle.length <= ASSET_GROUPS_MAX);

      for (const assetGroup of output.tokenBundle) {
        Precondition.checkIsHexStringOfLength(
          assetGroup.policyIdHex,
          TOKEN_POLICY_LENGTH,
          TxErrors.OUTPUT_INVALID_TOKEN_POLICY
        );

        Precondition.checkIsArray(assetGroup.tokens);
        Precondition.check(assetGroup.tokens.length <= TOKENS_IN_GROUP_MAX);

        for (const token of assetGroup.tokens) {
          Precondition.checkIsHexString(
            token.assetNameHex,
            TxErrors.OUTPUT_INVALID_ASSET_NAME
          );
          Precondition.check(
            token.assetNameHex.length <= TOKEN_NAME_LENGTH * 2,
            TxErrors.OUTPUT_INVALID_ASSET_NAME
          );
          Precondition.checkIsUint64Str(token.amountStr);
        }
      }
    }
  }

  // fee
  Precondition.checkIsValidAdaAmount(feeStr, TxErrors.FEE_INVALID);

  //  ttl
  if (ttlStr != null) {
    Precondition.checkIsPositiveUint64Str(ttlStr, TxErrors.TTL_INVALID);
  }

  // certificates
  validateCertificates(certificates);

  // withdrawals
  Precondition.checkIsArray(withdrawals, TxErrors.WITHDRAWALS_NOT_ARRAY);
  if (isSigningPoolRegistrationAsOwner && withdrawals.length > 0) {
    throw new Error(TxErrors.WITHDRAWALS_FORBIDDEN);
  }
  for (const withdrawal of withdrawals) {
    Precondition.checkIsValidAdaAmount(withdrawal.amountStr);
    Precondition.checkIsValidPath(withdrawal.path);
  }

  // metadata could be null
  if (metadataHashHex != null) {
    Precondition.checkIsHexStringOfLength(metadataHashHex, 32, TxErrors.METADATA_INVALID);
  }

  //  validity interval start
  if (validityIntervalStartStr != null) {
    Precondition.checkIsPositiveUint64Str(
      validityIntervalStartStr,
      TxErrors.VALIDITY_INTERVAL_START_INVALID
    );
  }
}


export function serializeAddressParams(
  addressTypeNibble: AddressTypeNibble,
  networkIdOrProtocolMagic: number,
  spendingPath: BIP32Path,
  stakingPath: BIP32Path | null = null,
  stakingKeyHashHex: string | null = null,
  stakingBlockchainPointer: StakingBlockchainPointer | null = null
): Buffer {
  Precondition.checkIsUint8(
    addressTypeNibble << 4,
    TxErrors.OUTPUT_INVALID_ADDRESS_TYPE_NIBBLE
  );
  const addressTypeNibbleBuf = utils.uint8_to_buf(addressTypeNibble);

  let networkIdOrProtocolMagicBuf;

  if (addressTypeNibble === AddressTypeNibble.BYRON) {
    Precondition.checkIsUint32(
      networkIdOrProtocolMagic,
      TxErrors.INVALID_PROTOCOL_MAGIC
    );
    networkIdOrProtocolMagicBuf = utils.uint32_to_buf(networkIdOrProtocolMagic);
  } else {
    Precondition.checkIsUint8(
      networkIdOrProtocolMagic,
      TxErrors.INVALID_NETWORK_ID
    );
    networkIdOrProtocolMagicBuf = utils.uint8_to_buf(networkIdOrProtocolMagic);
  }

  Precondition.checkIsValidPath(
    spendingPath,
    TxErrors.OUTPUT_INVALID_SPENDING_PATH
  );
  const spendingPathBuf = utils.path_to_buf(spendingPath);

  const stakingChoices = {
    NO_STAKING: 0x11,
    STAKING_KEY_PATH: 0x22,
    STAKING_KEY_HASH: 0x33,
    BLOCKCHAIN_POINTER: 0x44,
  };
  type StakingChoice = ValueOf<typeof stakingChoices>;

  // serialize staking info
  let stakingChoice: StakingChoice;
  let stakingInfoBuf: Buffer;
  if (!stakingPath && !stakingKeyHashHex && !stakingBlockchainPointer) {
    stakingChoice = stakingChoices.NO_STAKING;
    stakingInfoBuf = Buffer.alloc(0);
  } else if (stakingPath && !stakingKeyHashHex && !stakingBlockchainPointer) {
    stakingChoice = stakingChoices.STAKING_KEY_PATH;
    Precondition.checkIsValidPath(
      stakingPath,
      TxErrors.OUTPUT_INVALID_STAKING_KEY_PATH
    );
    stakingInfoBuf = utils.path_to_buf(stakingPath);
  } else if (!stakingPath && stakingKeyHashHex && !stakingBlockchainPointer) {
    const stakingKeyHash = utils.hex_to_buf(stakingKeyHashHex);
    stakingChoice = stakingChoices.STAKING_KEY_HASH;
    Precondition.check(
      stakingKeyHash.length === KEY_HASH_LENGTH,
      TxErrors.OUTPUT_INVALID_STAKING_KEY_HASH
    );
    stakingInfoBuf = stakingKeyHash;
  } else if (!stakingPath && !stakingKeyHashHex && stakingBlockchainPointer) {
    stakingChoice = stakingChoices.BLOCKCHAIN_POINTER;
    stakingInfoBuf = Buffer.alloc(3 * 4); // 3 x uint32

    Precondition.checkIsUint32(
      stakingBlockchainPointer.blockIndex,
      TxErrors.OUTPUT_INVALID_BLOCKCHAIN_POINTER
    );
    stakingInfoBuf.writeUInt32BE(stakingBlockchainPointer.blockIndex, 0);
    Precondition.checkIsUint32(
      stakingBlockchainPointer.txIndex,
      TxErrors.OUTPUT_INVALID_BLOCKCHAIN_POINTER
    );
    stakingInfoBuf.writeUInt32BE(stakingBlockchainPointer.txIndex, 4);
    Precondition.checkIsUint32(
      stakingBlockchainPointer.certificateIndex,
      TxErrors.OUTPUT_INVALID_BLOCKCHAIN_POINTER
    );
    stakingInfoBuf.writeUInt32BE(stakingBlockchainPointer.certificateIndex, 8);
  } else {
    throw new Error(TxErrors.OUTPUT_INVALID_STAKING_INFO);
  }
  const stakingChoiceBuf = Buffer.from([stakingChoice]);

  return Buffer.concat([
    addressTypeNibbleBuf,
    networkIdOrProtocolMagicBuf,
    spendingPathBuf,
    stakingChoiceBuf,
    stakingInfoBuf,
  ]);
}

export function serializeOutputBasicParams(
  output: TxOutput,
  network: Network,
): Buffer {
  Precondition.checkIsValidAdaAmount(output.amountStr);
  let outputType;
  let addressBuf;

  if ("addressHex" in output && output.addressHex) {
    outputType = TxOutputTypeCodes.SIGN_TX_OUTPUT_TYPE_ADDRESS_BYTES;

    Precondition.checkIsHexString(
      output.addressHex,
      TxErrors.OUTPUT_INVALID_ADDRESS
    );
    Precondition.check(
      output.addressHex.length <= 128 * 2,
      TxErrors.OUTPUT_INVALID_ADDRESS
    );
    addressBuf = Buffer.concat([
      utils.uint32_to_buf(output.addressHex.length / 2),
      utils.hex_to_buf(output.addressHex),
    ]);
  } else if ("spendingPath" in output && output.spendingPath) {
    outputType = TxOutputTypeCodes.SIGN_TX_OUTPUT_TYPE_ADDRESS_PARAMS;

    addressBuf = serializeAddressParams(
      output.addressTypeNibble,
      output.addressTypeNibble === AddressTypeNibble.BYRON
        ? network.protocolMagic
        : network.networkId,
      output.spendingPath,
      output.stakingPath,
      output.stakingKeyHashHex,
      output.stakingBlockchainPointer
    );
  } else {
    throw new Error(TxErrors.OUTPUT_UNKNOWN_TYPE);
  }

  const numassetGroups = output.tokenBundle ? output.tokenBundle.length : 0;

  return Buffer.concat([
    utils.uint8_to_buf(outputType),
    addressBuf,
    utils.ada_amount_to_buf(output.amountStr),
    utils.uint32_to_buf(numassetGroups),
  ]);
}

// TODO remove after ledger app 2.2 is widespread
export function serializeOutputBasicParamsBefore_2_2(
  output: TxOutput,
  network: Network
): Buffer {
  Precondition.checkIsValidAdaAmount(output.amountStr);

  if ("addressHex" in output && output.addressHex) {
    Precondition.checkIsHexString(
      output.addressHex,
      TxErrors.OUTPUT_INVALID_ADDRESS
    );
    Precondition.check(
      output.addressHex.length <= 128 * 2,
      TxErrors.OUTPUT_INVALID_ADDRESS
    );

    return Buffer.concat([
      utils.ada_amount_to_buf(output.amountStr),
      utils.uint8_to_buf(TxOutputTypeCodes.SIGN_TX_OUTPUT_TYPE_ADDRESS_BYTES),
      utils.hex_to_buf(output.addressHex),
    ]);
  } else if ('spendingPath' in output && output.spendingPath) {
    return Buffer.concat([
      utils.ada_amount_to_buf(output.amountStr),
      utils.uint8_to_buf(TxOutputTypeCodes.SIGN_TX_OUTPUT_TYPE_ADDRESS_PARAMS),
      serializeAddressParams(
        output.addressTypeNibble,
        output.addressTypeNibble === AddressTypeNibble.BYRON
          ? network.protocolMagic
          : network.networkId,
        output.spendingPath,
        output.stakingPath,
        output.stakingKeyHashHex,
        output.stakingBlockchainPointer
      ),
    ]);
  } else {
    throw new Error(TxErrors.OUTPUT_UNKNOWN_TYPE);
  }
}

export function serializePoolInitialParams(params: PoolParams): Buffer {
  Precondition.checkIsHexStringOfLength(
    params.poolKeyHashHex,
    KEY_HASH_LENGTH,
    TxErrors.CERTIFICATE_POOL_INVALID_POOL_KEY_HASH
  );

  Precondition.checkIsHexStringOfLength(
    params.vrfKeyHashHex,
    32,
    TxErrors.CERTIFICATE_POOL_INVALID_VRF_KEY_HASH
  );

  Precondition.checkIsValidAdaAmount(
    params.pledgeStr,
    TxErrors.CERTIFICATE_POOL_INVALID_PLEDGE
  );
  Precondition.checkIsValidAdaAmount(
    params.costStr,
    TxErrors.CERTIFICATE_POOL_INVALID_COST
  );

  const marginNumeratorStr = params.margin.numeratorStr;
  const marginDenominatorStr = params.margin.denominatorStr;
  Precondition.checkIsUint64Str(
    marginNumeratorStr,
    TxErrors.CERTIFICATE_POOL_INVALID_MARGIN
  );
  Precondition.checkIsValidPoolMarginDenominator(
    marginDenominatorStr,
    TxErrors.CERTIFICATE_POOL_INVALID_MARGIN_DENOMINATOR
  );
  // given both are valid uint strings, the check below is equivalent to "marginNumerator <= marginDenominator"
  Precondition.checkIsValidUintStr(
    marginNumeratorStr,
    marginDenominatorStr,
    TxErrors.CERTIFICATE_POOL_INVALID_MARGIN
  );

  Precondition.checkIsHexStringOfLength(
    params.rewardAccountHex,
    29,
    TxErrors.CERTIFICATE_POOL_INVALID_REWARD_ACCOUNT
  );

  Precondition.check(
    params.poolOwners.length <= POOL_REGISTRATION_OWNERS_MAX,
    TxErrors.CERTIFICATE_POOL_OWNERS_TOO_MANY
  );
  Precondition.check(
    params.relays.length <= POOL_REGISTRATION_RELAYS_MAX,
    TxErrors.CERTIFICATE_POOL_RELAYS_TOO_MANY
  );

  return Buffer.concat([
    utils.hex_to_buf(params.poolKeyHashHex),
    utils.hex_to_buf(params.vrfKeyHashHex),
    utils.ada_amount_to_buf(params.pledgeStr),
    utils.ada_amount_to_buf(params.costStr),
    utils.uint64_to_buf(params.margin.numeratorStr),
    utils.uint64_to_buf(params.margin.denominatorStr),
    utils.hex_to_buf(params.rewardAccountHex),
    utils.uint32_to_buf(params.poolOwners.length),
    utils.uint32_to_buf(params.relays.length),
  ]);
}

export function serializePoolOwnerParams(params: PoolOwnerParams): Buffer {
  const SIGN_TX_POOL_OWNER_TYPE_PATH = 1;
  const SIGN_TX_POOL_OWNER_TYPE_KEY_HASH = 2;

  const path = params.stakingPath;
  const hashHex = params.stakingKeyHashHex;

  if (path) {
    Precondition.checkIsValidPath(
      path,
      TxErrors.CERTIFICATE_POOL_OWNER_INVALID_PATH
    );

    const pathBuf = utils.path_to_buf(path);
    const typeBuf = Buffer.alloc(1);
    typeBuf.writeUInt8(SIGN_TX_POOL_OWNER_TYPE_PATH);
    return Buffer.concat([typeBuf, pathBuf]);
  }

  if (hashHex) {
    Precondition.checkIsHexStringOfLength(
      hashHex,
      KEY_HASH_LENGTH,
      TxErrors.CERTIFICATE_POOL_OWNER_INVALID_KEY_HASH
    );

    const hashBuf = utils.hex_to_buf(hashHex);
    const typeBuf = Buffer.alloc(1);
    typeBuf.writeUInt8(SIGN_TX_POOL_OWNER_TYPE_KEY_HASH);
    return Buffer.concat([typeBuf, hashBuf]);
  }

  throw new Error(TxErrors.CERTIFICATE_POOL_OWNER_INCOMPLETE);
}

const enum RelayType {
  SingleHostAddr = 0,
  SingleHostName = 1,
  MultiHostName = 2,
}

type ParsedPoolRelay = {
  type: RelayType.SingleHostAddr,
  port: number | null,
  ipv4: Buffer | null,
  ipv6: Buffer | null,
} | {
  type: RelayType.SingleHostName,
  port: number | null,
  dnsName: string,
} | {
  type: RelayType.MultiHostName,
  dnsName: string
}

function parsePort(portNumber: number, err: string): number {
  Precondition.checkIsUint32(portNumber, err)
  Precondition.check(portNumber <= 65535, err)
  return portNumber
}

function parseIPv4(ipv4: string, err: string): Buffer {
  Precondition.checkIsString(ipv4, err);
  const ipParts = ipv4.split(".");
  Precondition.check(ipParts.length === 4, err)

  const ipBytes = Buffer.alloc(4);
  for (let i = 0; i < 4; i++) {
    const ipPart = utils.safe_parseInt(ipParts[i]);
    Precondition.checkIsUint8(ipPart, err)
    ipBytes.writeUInt8(ipPart, i);
  }
  return ipBytes
}

// FIXME(ppershing): This is terrible and wrong implementation
function parseIPv6(ipv6: string, err: string): Buffer {
  Precondition.checkIsString(ipv6, err)
  const ipHex = ipv6.split(":").join("");
  Precondition.checkIsHexStringOfLength(ipHex, 16, err)
  return hex_to_buf(ipHex);
}

function parseDnsName(dnsName: string, err: string): string {
  Precondition.checkIsString(dnsName, err);
  Precondition.check(dnsName.length <= 64, err)
  // eslint-disable-next-line no-control-regex
  Precondition.check(/^[\x00-\x7F]*$/.test(dnsName), err)
  Precondition.check(
    dnsName
      .split("")
      .every((c) => c.charCodeAt(0) >= 32 && c.charCodeAt(0) <= 126),
    err
  );
  return dnsName
}

function parsePoolRelayParams(relayParams: RelayParams): ParsedPoolRelay {
  switch (relayParams.type) {
    case RelayType.SingleHostAddr: {
      const params = relayParams.params as SingleHostIPRelay
      return {
        type: RelayType.SingleHostAddr,
        port: ('portNumber' in params && params.portNumber != null)
          ? parsePort(params.portNumber, TxErrors.CERTIFICATE_POOL_RELAY_INVALID_PORT)
          : null,
        ipv4: ('ipv4' in params && params.ipv4 != null)
          ? parseIPv4(params.ipv4, TxErrors.CERTIFICATE_POOL_RELAY_INVALID_IPV4)
          : null,
        ipv6: ('ipv6' in params && params.ipv6 != null)
          ? parseIPv6(params.ipv6, TxErrors.CERTIFICATE_POOL_RELAY_INVALID_IPV6)
          : null,
      }
    }
    case RelayType.SingleHostName: {
      const params = relayParams.params as SingleHostNameRelay

      return {
        type: RelayType.SingleHostName,
        port: ('portNumber' in params && params.portNumber != null)
          ? parsePort(params.portNumber, TxErrors.CERTIFICATE_POOL_RELAY_INVALID_PORT)
          : null,
        dnsName: parseDnsName(params.dnsName, TxErrors.CERTIFICATE_POOL_RELAY_INVALID_DNS)
      }
    }
    case RelayType.MultiHostName: {
      const params = relayParams.params as MultiHostNameRelay
      return {
        type: RelayType.MultiHostName,
        dnsName: parseDnsName(params.dnsName, TxErrors.CERTIFICATE_POOL_RELAY_INVALID_DNS)
      }
    }
    default:
      throw new Error(TxErrors.CERTIFICATE_POOL_RELAY_INVALID_TYPE);
  }
}

export function serializePoolRelay(relay: ParsedPoolRelay) {
  function serializeOptional<T>(x: T | null, cb: (t: T) => Buffer): Buffer {
    const enum Optional {
      None = 1,
      Some = 2
    }

    if (x == null) {
      return utils.uint8_to_buf(Optional.None)
    } else {
      return Buffer.concat([
        utils.uint8_to_buf(Optional.Some),
        cb(x)
      ])
    }
  }

  switch (relay.type) {
    case RelayType.SingleHostAddr: {
      return Buffer.concat([
        utils.uint8_to_buf(relay.type),
        serializeOptional(relay.port, port => utils.uint16_to_buf(port)),
        serializeOptional(relay.ipv4, ipv4 => ipv4),
        serializeOptional(relay.ipv6, ipv6 => ipv6)
      ])
    }
    case RelayType.SingleHostName: {
      return Buffer.concat([
        utils.uint8_to_buf(relay.type),
        serializeOptional(relay.port, port => utils.uint16_to_buf(port)),
        Buffer.from(relay.dnsName, "ascii")
      ])
    }
    case RelayType.MultiHostName: {
      return Buffer.concat([
        utils.uint8_to_buf(relay.type),
        Buffer.from(relay.dnsName, "ascii")
      ])
    }
    default:
      unreachable(relay)
  }
}

type ParsedPoolMetadata = {
  url: string,
  hashHex: string,
} & { __brand: 'pool_metadata' }

export function parsePoolMetadataParams(params: PoolMetadataParams | null): ParsedPoolMetadata | null {
  if (params == null) return null

  const url = params.metadataUrl;
  Precondition.checkIsString(
    url,
    TxErrors.CERTIFICATE_POOL_METADATA_INVALID_URL
  );
  Precondition.check(
    url.length <= 64,
    TxErrors.CERTIFICATE_POOL_METADATA_INVALID_URL
  );
  Precondition.check(
    url.split("").every((c) => c.charCodeAt(0) >= 32 && c.charCodeAt(0) <= 126),
    TxErrors.CERTIFICATE_POOL_METADATA_INVALID_URL
  );

  const hashHex = params.metadataHashHex;
  Precondition.checkIsHexStringOfLength(
    hashHex,
    32,
    TxErrors.CERTIFICATE_POOL_METADATA_INVALID_HASH
  );
  return {
    url,
    hashHex,
    __brand: 'pool_metadata' as const
  }
}

export function serializePoolMetadata(
  metadata: ParsedPoolMetadata | null
): Buffer {
  if (metadata == null) {
    return Buffer.concat([
      utils.uint8_to_buf(SignTxIncluded.SIGN_TX_INCLUDED_NO)
    ])
  } else {
    return Buffer.concat([
      utils.uint8_to_buf(SignTxIncluded.SIGN_TX_INCLUDED_YES),
      utils.hex_to_buf(metadata.hashHex),
      Buffer.from(metadata.url, 'ascii')
    ])
  }
}

export function serializeGetExtendedPublicKeyParams(path: BIP32Path): Buffer {
  Precondition.check(!!path, GetKeyErrors.INVALID_PATH);

  return utils.path_to_buf(path);
}

export default {
  HARDENED,
  AddressTypeNibble,
  CertificateType,
  KEY_HASH_LENGTH,
  TX_HASH_LENGTH,

  serializeGetExtendedPublicKeyParams,

  validateTransaction,

  serializeAddressParams,
  serializeOutputBasicParams,
  serializeOutputBasicParamsBefore_2_2,

  serializePoolInitialParams,
  serializePoolOwnerParams,
  serializePoolRelay,
  parsePoolRelayParams,
  serializePoolMetadata,
  parsePoolMetadataParams,
};
