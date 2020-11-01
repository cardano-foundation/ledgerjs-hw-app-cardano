import utils, { Precondition, Assert } from "./utils";
import { PoolParams, PoolOwnerParams, SingleHostIPRelay, SingleHostNameRelay, MultiHostNameRelay, PoolMetadataParams } from './Ada';
import { hex_to_buf } from "../lib/utils";

const HARDENED = 0x80000000;

export const AddressTypeNibbles = {
  BASE: 0b0000,
  POINTER: 0b0100,
  ENTERPRISE: 0b0110,
  BYRON: 0b1000,
  REWARD: 0b1110
}

export const CertificateTypes = {
	STAKE_REGISTRATION: 0,
	STAKE_DEREGISTRATION: 1,
	STAKE_DELEGATION: 2,
	STAKE_POOL_REGISTRATION : 3
}

const KEY_HASH_LENGTH = 28;
const TX_HASH_LENGTH = 32;

const POOL_REGISTRATION_OWNERS_MAX = 1000;
const POOL_REGISTRATION_RELAYS_MAX = 1000;

export const GetKeyErrors = {
  INVALID_PATH: "invalid key path",
}

export const TxErrors = {
  INVALID_PROTOCOL_MAGIC: "invalid protocol magic",
  INVALID_NETWORK_ID: "invalid network id",

  INPUTS_NOT_ARRAY: "inputs not an array",
  INPUT_WITH_PATH: "stake pool registration: inputs should not contain the witness path",
  INPUT_INVALID_TX_HASH: "invalid tx hash in an input",

  OUTPUTS_NOT_ARRAY: "outputs not an array",
  OUTPUT_INVALID_AMOUNT: "invalid amount in an output",
  OUTPUT_INVALID_ADDRESS: "invalid address in an output",
  OUTPUT_WITH_PATH: "outputs given by path are not allowed for stake pool registration transactions",
  OUTPUT_UNKNOWN_TYPE: "unknown output type",
  OUTPUT_INVALID_SPENDING_PATH: "invalid spending path in an output",
  OUTPUT_INVALID_BLOCKCHAIN_POINTER: "invalid blockchain pointer in an output",
  OUTPUT_INVALID_STAKING_KEY_PATH: "invalid staking key path in an output",
  OUTPUT_INVALID_STAKING_KEY_HASH: "invalid staking key hash in an output",
  OUTPUT_INVALID_STAKING_INFO: "Invalid staking info in an output",

  FEE_INVALID: "invalid fee",

  TTL_INVALID: "invalid ttl",

  CERTIFICATES_NOT_ARRAY: "certificates not an array",
  CERTIFICATES_COMBINATION_FORBIDDEN: "pool registration must not be combined with other certificates",
  CERTIFICATE_MISSING_PATH: "path is required for one of the certificates",
  CERTIFICATE_SUPERFLUOUS_PATH: "superfluous path in a certificate",
  CERTIFICATE_MISSING_POOL_KEY_HASH: "pool key hash missing in a certificate",
  CERTIFICATE_SUPERFLUOUS_POOL_KEY_HASH: "superfluous pool key hash in a certificate",
  CERTIFICATE_INVALID_POOL_KEY_HASH: "invalid pool key hash in a certificate",
  CERTIFICATE_INVALID: "invalid certificate",

  CERTIFICATE_POOL_MISSING_POOL_PARAMS: "missing stake pool params in a pool registration certificate",
  CERTIFICATE_POOL_INVALID_POOL_KEY_HASH: "invalid pool key hash in a pool registration certificate",
  CERTIFICATE_POOL_INVALID_VRF_KEY_HASH: "invalid vrf key hash in a pool registration certificate",
  CERTIFICATE_POOL_INVALID_PLEDGE: "invalid pledge in a pool registration certificate",
  CERTIFICATE_POOL_INVALID_COST: "invalid cost in a pool registration certificate",
  CERTIFICATE_POOL_INVALID_MARGIN: "invalid margin in a pool registration certificate",
  CERTIFICATE_POOL_INVALID_REWARD_ACCOUNT: "invalid reward account in a pool registration certificate",
  CERTIFICATE_POOL_OWNERS_NOT_ARRAY: "owners not an array in a pool registration certificate",
  CERTIFICATE_POOL_OWNERS_TOO_MANY: "too many owners in a pool registration certificate",
  CERTIFICATE_POOL_OWNERS_SINGLE_PATH: "there should be exactly one owner given by path in a pool registration certificate",
  CERTIFICATE_POOL_OWNER_INCOMPLETE: "incomplete owner params in a pool registration certificate",
  CERTIFICATE_POOL_OWNER_INVALID_PATH: "invalid owner path in a pool registration certificate",
  CERTIFICATE_POOL_OWNER_INVALID_KEY_HASH: "invalid owner key hash in a pool registration certificate",
  CERTIFICATE_POOL_RELAYS_NOT_ARRAY: "relays not an array in a pool registration certificate",
  CERTIFICATE_POOL_RELAYS_TOO_MANY: "too many pool relays in a pool registration certificate",
  CERTIFICATE_POOL_RELAY_INVALID_TYPE: "invalid type of a relay in a pool registration certificate",
  CERTIFICATE_POOL_RELAY_INVALID_PORT: "invalid port in a relay in a pool registration certificate",
  CERTIFICATE_POOL_RELAY_INVALID_IPV4: "invalid ipv4 in a relay in a pool registration certificate",
  CERTIFICATE_POOL_RELAY_INVALID_IPV6: "invalid ipv6 in a relay in a pool registration certificate",
  CERTIFICATE_POOL_RELAY_INVALID_DNS: "invalid dns record in a relay in a pool registration certificate",
  CERTIFICATE_POOL_RELAY_MISSING_DNS: "missing dns record in a relay in a pool registration certificate",
  CERTIFICATE_POOL_METADATA_INVALID_URL: "invalid metadata in a pool registration certificate: invalid url",
  CERTIFICATE_POOL_METADATA_INVALID_HASH: "invalid metadata in a pool registration certificate: invalid hash",

  WITHDRAWALS_NOT_ARRAY: "withdrawals not an array",
  WITHDRAWALS_FORBIDDEN: "no withdrawals allowed for transactions registering stake pools",

  METADATA_INVALID: "invalid metadata",
}


function validateCertificates(
  certificates: Array<Certificate>
)
{
  Precondition.checkIsArray(certificates, TxErrors.CERTIFICATES_NOT_ARRAY);
  const isSigningPoolRegistrationAsOwner = certificates.some(
    cert => cert.type === CertificateTypes.STAKE_POOL_REGISTRATION
  );

  for (const cert of certificates) {
    if (!cert) throw new Error(TxErrors.CERTIFICATE_INVALID);

    switch (cert.type) {
      case CertificateTypes.STAKE_REGISTRATION: {
        Precondition.check(!isSigningPoolRegistrationAsOwner, TxErrors.CERTIFICATES_COMBINATION_FORBIDDEN);
        Precondition.checkIsValidPath(cert.path, TxErrors.CERTIFICATE_MISSING_PATH);
        Precondition.check(!cert.poolKeyHashHex, TxErrors.CERTIFICATE_SUPERFLUOUS_POOL_KEY_HASH);
        break;
      }
      case CertificateTypes.STAKE_DEREGISTRATION: {
        Precondition.check(!isSigningPoolRegistrationAsOwner, TxErrors.CERTIFICATES_COMBINATION_FORBIDDEN);
        Precondition.checkIsValidPath(cert.path, TxErrors.CERTIFICATE_MISSING_PATH);
        Precondition.check(!cert.poolKeyHashHex, TxErrors.CERTIFICATE_SUPERFLUOUS_POOL_KEY_HASH);
        break;
      }
      case CertificateTypes.STAKE_DELEGATION: {
        Precondition.check(!isSigningPoolRegistrationAsOwner, TxErrors.CERTIFICATES_COMBINATION_FORBIDDEN);
        Precondition.checkIsValidPath(cert.path, TxErrors.CERTIFICATE_MISSING_PATH);
        Precondition.checkIsHexString(cert.poolKeyHashHex, TxErrors.CERTIFICATE_MISSING_POOL_KEY_HASH);
        Precondition.check(cert.poolKeyHashHex.length == KEY_HASH_LENGTH * 2, TxErrors.CERTIFICATE_INVALID_POOL_KEY_HASH);
        break;
      }
      case CertificateTypes.STAKE_POOL_REGISTRATION: {
        Assert.assert(isSigningPoolRegistrationAsOwner);
        Precondition.check(!cert.path, TxErrors.CERTIFICATE_SUPERFLUOUS_PATH);
        const poolParams = cert.poolRegistrationParams;
        Precondition.check(!!poolParams, TxErrors.CERTIFICATE_POOL_MISSING_POOL_PARAMS);

        // serialization succeeds if and only if params are valid
        serializePoolInitialParams(poolParams);

        // owners
        Precondition.checkIsArray(poolParams.poolOwners, TxErrors.CERTIFICATE_POOL_OWNERS_NOT_ARRAY);
        let numPathOwners = 0;
        for (const owner of poolParams.poolOwners) {
          if (owner.stakingPath) {
            numPathOwners++;
            serializePoolOwnerParams(owner);
          }
        }
        if (numPathOwners !== 1) throw new Error(TxErrors.CERTIFICATE_POOL_OWNERS_SINGLE_PATH);

        // relays
        Precondition.checkIsArray(poolParams.relays, TxErrors.CERTIFICATE_POOL_RELAYS_NOT_ARRAY);
        for (const relay of poolParams.relays) {
          serializePoolRelayParams(relay);
        }

        // metadata
        serializePoolMetadataParams(poolParams.metadata);

        break;
      }
      default:
        throw new Error(TxErrors.CERTIFICATE_INVALID);
    }
  }
}

export function validateTransaction(
  networkId: number,
  protocolMagic: number,
  inputs: Array<InputTypeUTxO>,
  outputs: Array<OutputTypeAddress | OutputTypeAddressParams>,
  feeStr: string,
  ttlStr: string,
  certificates: Array<Certificate>,
  withdrawals: Array<Withdrawal>,
  metadataHashHex: ?string
) {
  Precondition.checkIsArray(certificates, TxErrors.CERTIFICATES_NOT_ARRAY);
  const isSigningPoolRegistrationAsOwner = certificates.some(
    cert => cert.type === CertificateTypes.STAKE_POOL_REGISTRATION
  );

  // inputs
  Precondition.checkIsArray(inputs, TxErrors.INPUTS_NOT_ARRAY);
  for (const input of inputs) {
    Precondition.checkIsHexString(input.txHashHex, TxErrors.INPUT_INVALID_TX_HASH);
    Precondition.check(input.txHashHex.length === TX_HASH_LENGTH * 2, TxErrors.INPUT_INVALID_TX_HASH);

    if (isSigningPoolRegistrationAsOwner) {
      // input should not be given with a path
      // the path is not used, but we check just to avoid potential confusion of developers using this
      Precondition.check(!input.path, TxErrors.INPUT_WITH_PATH);
    }
  }

  // outputs
  Precondition.checkIsArray(outputs, TxErrors.OUTPUTS_NOT_ARRAY);
  for (const output of outputs) {
    Precondition.checkIsValidAmount(output.amountStr, TxErrors.OUTPUT_INVALID_AMOUNT);

    if (output.addressHex) {
      Precondition.checkIsHexString(output.addressHex, TxErrors.OUTPUT_INVALID_ADDRESS);
      Precondition.check(output.addressHex.length <= 128 * 2, TxErrors.OUTPUT_INVALID_ADDRESS);
    } else if (output.spendingPath) {
      Precondition.check(!isSigningPoolRegistrationAsOwner, TxErrors.OUTPUT_WITH_PATH);

      // we try to serialize the data, an error is thrown if output params are invalid
      serializeAddressParams(
        output.addressTypeNibble,
        output.addressTypeNibble === AddressTypeNibbles.BYRON ? protocolMagic : networkId,
        output.spendingPath,
        output.stakingPath,
        output.stakingKeyHashHex,
        output.stakingBlockchainPointer
      );
    } else {
      throw new Error(TxErrors.OUTPUT_UNKNOWN_TYPE);
    }
  }

  // fee
  Precondition.checkIsValidAmount(feeStr, TxErrors.FEE_INVALID);

  //  ttl
  const ttl = utils.safe_parseInt(ttlStr);
  Precondition.checkIsUint64(ttl, TxErrors.TTL_INVALID);
  Precondition.check(ttl > 0, TxErrors.TTL_INVALID);

  // certificates
  validateCertificates(certificates);

  // withdrawals
  Precondition.checkIsArray(withdrawals, TxErrors.WITHDRAWALS_NOT_ARRAY);
  if (isSigningPoolRegistrationAsOwner && withdrawals.length > 0) {
    throw new Error(TxErrors.WITHDRAWALS_FORBIDDEN);
  }
  for (const withdrawal of withdrawals) {
    Precondition.checkIsValidAmount(withdrawal.amountStr);
    Precondition.checkIsValidPath(withdrawal.path);
  }

  // metadata could be null
  if (metadataHashHex !== null) {
    Precondition.checkIsHexString(metadataHashHex, TxErrors.METADATA_INVALID);
    Precondition.check(metadataHashHex.length == 32 * 2, TxErrors.METADATA_INVALID);
  }
}

export function serializeAddressParams(
    addressTypeNibble: number,
    networkIdOrProtocolMagic: number,
    spendingPath: BIP32Path,
    stakingPath: ?BIP32Path = null,
    stakingKeyHashHex: ?string = null,
    stakingBlockchainPointer: ?StakingBlockchainPointer = null
): Buffer {
  Precondition.checkIsUint8(addressTypeNibble << 4, TxErrors.OUTPUT_INVALID_ADDRESS_TYPE_NIBBLE);
  const addressTypeNibbleBuf = utils.uint8_to_buf(addressTypeNibble);

  let networkIdOrProtocolMagicBuf;

  if (addressTypeNibble === AddressTypeNibbles.BYRON) {
    Precondition.checkIsUint32(networkIdOrProtocolMagic, TxErrors.INVALID_PROTOCOL_MAGIC);
    networkIdOrProtocolMagicBuf = utils.uint32_to_buf(networkIdOrProtocolMagic);
  } else {
    Precondition.checkIsUint8(networkIdOrProtocolMagic, TxErrors.INVALID_NETWORK_ID);
    networkIdOrProtocolMagicBuf = utils.uint8_to_buf(networkIdOrProtocolMagic);
  }

  Precondition.checkIsValidPath(spendingPath, TxErrors.OUTPUT_INVALID_SPENDING_PATH);
  const spendingPathBuf = utils.path_to_buf(spendingPath);

  const stakingChoices = {
    NO_STAKING: 0x11,
    STAKING_KEY_PATH: 0x22,
    STAKING_KEY_HASH: 0x33,
    BLOCKCHAIN_POINTER: 0x44
  };
  type StakingChoice = $Values<typeof stakingChoices>;

  // serialize staking info
  let stakingChoice: StakingChoice;
  let stakingInfoBuf: Buffer;
  if (!stakingPath && !stakingKeyHashHex && !stakingBlockchainPointer) {
    stakingChoice = stakingChoices.NO_STAKING;
    stakingInfoBuf = Buffer.alloc(0);
  } else if ( stakingPath && !stakingKeyHashHex && !stakingBlockchainPointer) {
    stakingChoice = stakingChoices.STAKING_KEY_PATH;
    Precondition.checkIsValidPath(stakingPath, TxErrors.OUTPUT_INVALID_STAKING_KEY_PATH);
    stakingInfoBuf = utils.path_to_buf(stakingPath);
  } else if (!stakingPath &&  stakingKeyHashHex && !stakingBlockchainPointer) {
    const stakingKeyHash = utils.hex_to_buf(stakingKeyHashHex);
    stakingChoice = stakingChoices.STAKING_KEY_HASH;
    Precondition.check(stakingKeyHash.length === KEY_HASH_LENGTH, TxErrors.OUTPUT_INVALID_STAKING_KEY_HASH);
    stakingInfoBuf = stakingKeyHash;
  } else if (!stakingPath && !stakingKeyHashHex &&  stakingBlockchainPointer) {
    stakingChoice = stakingChoices.BLOCKCHAIN_POINTER;
    stakingInfoBuf = Buffer.alloc(3 * 4); // 3 x uint32

    Precondition.checkIsUint32(stakingBlockchainPointer.blockIndex, TxErrors.OUTPUT_INVALID_BLOCKCHAIN_POINTER);
    stakingInfoBuf.writeUInt32BE(stakingBlockchainPointer.blockIndex, 0);
    Precondition.checkIsUint32(stakingBlockchainPointer.txIndex, TxErrors.OUTPUT_INVALID_BLOCKCHAIN_POINTER);
    stakingInfoBuf.writeUInt32BE(stakingBlockchainPointer.txIndex, 4);
    Precondition.checkIsUint32(stakingBlockchainPointer.certificateIndex, TxErrors.OUTPUT_INVALID_BLOCKCHAIN_POINTER);
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
    stakingInfoBuf
  ]);
}

export function serializePoolInitialParams(
  params: PoolParams
): Buffer {
  Precondition.checkIsHexString(params.poolKeyHashHex, TxErrors.CERTIFICATE_POOL_INVALID_POOL_KEY_HASH);
  Precondition.check(params.poolKeyHashHex.length === KEY_HASH_LENGTH * 2, TxErrors.CERTIFICATE_POOL_INVALID_POOL_KEY_HASH);

  Precondition.checkIsHexString(params.vrfKeyHashHex, TxErrors.CERTIFICATE_POOL_INVALID_VRF_KEY_HASH);
  Precondition.check(params.vrfKeyHashHex.length === 32 * 2, TxErrors.CERTIFICATE_POOL_INVALID_VRF_KEY_HASH);

  Precondition.checkIsValidAmount(params.pledgeStr, TxErrors.CERTIFICATE_POOL_INVALID_PLEDGE);
  Precondition.checkIsValidAmount(params.costStr, TxErrors.CERTIFICATE_POOL_INVALID_COST);

  const marginNumerator = utils.safe_parseInt(params.margin.numeratorStr);
  Precondition.checkIsUint64(marginNumerator, TxErrors.CERTIFICATE_POOL_INVALID_MARGIN);
  const marginDenominator = utils.safe_parseInt(params.margin.denominatorStr);
  Precondition.checkIsUint64(marginDenominator, TxErrors.CERTIFICATE_POOL_INVALID_MARGIN);
  Precondition.check(marginNumerator >= 0, TxErrors.CERTIFICATE_POOL_INVALID_MARGIN);
  Precondition.check(marginDenominator > 0, TxErrors.CERTIFICATE_POOL_INVALID_MARGIN);
  Precondition.check(marginNumerator <= marginDenominator, TxErrors.CERTIFICATE_POOL_INVALID_MARGIN);

  Precondition.checkIsHexString(params.rewardAccountHex, TxErrors.CERTIFICATE_POOL_INVALID_REWARD_ACCOUNT);
  Precondition.check(params.rewardAccountHex.length === 29 * 2, TxErrors.CERTIFICATE_POOL_INVALID_REWARD_ACCOUNT);

  Precondition.check(params.poolOwners.length <= POOL_REGISTRATION_OWNERS_MAX, TxErrors.CERTIFICATE_POOL_OWNERS_TOO_MANY);
  Precondition.check(params.relays.length <= POOL_REGISTRATION_RELAYS_MAX, TxErrors.CERTIFICATE_POOL_RELAYS_TOO_MANY);

  return Buffer.concat([
    utils.hex_to_buf(params.poolKeyHashHex),
    utils.hex_to_buf(params.vrfKeyHashHex),
    utils.amount_to_buf(params.pledgeStr),
    utils.amount_to_buf(params.costStr),
    utils.amount_to_buf(params.margin.numeratorStr), // TODO why amount? ... we should have uint64_to_buf?
    utils.amount_to_buf(params.margin.denominatorStr),
    utils.hex_to_buf(params.rewardAccountHex),
    utils.uint32_to_buf(params.poolOwners.length),
    utils.uint32_to_buf(params.relays.length)
  ]);
}

export function serializePoolOwnerParams(
  params: PoolOwnerParams
): Buffer {
  const SIGN_TX_POOL_OWNER_TYPE_PATH = 1;
  const SIGN_TX_POOL_OWNER_TYPE_KEY_HASH = 2;

  const path = params.stakingPath;
  const hashHex = params.stakingKeyHashHex;

  if (path) {
    Precondition.checkIsValidPath(path, TxErrors.CERTIFICATE_POOL_OWNER_INVALID_PATH);

    const pathBuf = utils.path_to_buf(path);
    const typeBuf = Buffer.alloc(1);
    typeBuf.writeUInt8(SIGN_TX_POOL_OWNER_TYPE_PATH);
    return Buffer.concat([typeBuf, pathBuf]);
  }

  if (hashHex) {
    Precondition.checkIsHexString(hashHex, TxErrors.CERTIFICATE_POOL_OWNER_INVALID_KEY_HASH);
    Precondition.check(hashHex.length === KEY_HASH_LENGTH * 2, TxErrors.CERTIFICATE_POOL_OWNER_INVALID_KEY_HASH);

    const hashBuf = utils.hex_to_buf(hashHex);
    const typeBuf = Buffer.alloc(1);
    typeBuf.writeUInt8(SIGN_TX_POOL_OWNER_TYPE_KEY_HASH);
    return Buffer.concat([typeBuf, hashBuf]);
  }

  throw new Error(TxErrors.CERTIFICATE_POOL_OWNER_INCOMPLETE);
}

export function serializePoolRelayParams(
  relayParams: RelayParams
): Buffer {
  const type = relayParams.type;
  const params = relayParams.params;

  const RELAY_NO = 1;
  const RELAY_YES = 2;

  const yesBuf = Buffer.alloc(1);
  yesBuf.writeUInt8(RELAY_YES);

  const noBuf = Buffer.alloc(1);
  noBuf.writeUInt8(RELAY_NO);

  let portBuf: Buffer;
  if (params.portNumber) {
    Precondition.checkIsUint32(params.portNumber, TxErrors.CERTIFICATE_POOL_RELAY_INVALID_PORT);
    Precondition.check(params.portNumber <= 65535, TxErrors.CERTIFICATE_POOL_RELAY_INVALID_PORT);
    portBuf = Buffer.concat([yesBuf, utils.uint16_to_buf(params.portNumber)]);
  } else {
    portBuf = noBuf;
  }

  let ipv4Buf: Buffer;
  if (params.ipv4) {
    Precondition.checkIsString(params.ipv4, TxErrors.CERTIFICATE_POOL_RELAY_INVALID_IPV4);
    let ipParts = params.ipv4.split('.');
    Precondition.check(ipParts.length === 4, TxErrors.CERTIFICATE_POOL_RELAY_INVALID_IPV4);
    let ipBytes = Buffer.alloc(4);
    for (let i = 0; i < 4; i++) {
      let ipPart = utils.safe_parseInt(ipParts[i]);
      Precondition.checkIsUint8(ipPart, TxErrors.CERTIFICATE_POOL_RELAY_INVALID_IPV4);
      ipBytes.writeUInt8(ipPart, i);
    }
    ipv4Buf = Buffer.concat([yesBuf, ipBytes]);
  } else {
    ipv4Buf = noBuf;
  }

  let ipv6Buf: Buffer;
  if (params.ipv6) {
    Precondition.checkIsString(params.ipv6, TxErrors.CERTIFICATE_POOL_RELAY_INVALID_IPV6);
    let ipHex = params.ipv6.split(':').join('');
    Precondition.checkIsHexString(ipHex, TxErrors.CERTIFICATE_POOL_RELAY_INVALID_IPV6);
    Precondition.check(ipHex.length === 16 * 2, TxErrors.CERTIFICATE_POOL_RELAY_INVALID_IPV6);
    ipv6Buf = Buffer.concat([yesBuf, hex_to_buf(ipHex)]);
  } else {
    ipv6Buf = noBuf;
  }

  let dnsBuf: Buffer;
  if (params.dnsName) {
    Precondition.checkIsString(params.dnsName);
    Precondition.check(params.dnsName.length <= 64, TxErrors.CERTIFICATE_POOL_RELAY_INVALID_DNS);
    Precondition.check(/^[\x00-\x7F]*$/.test(params.dnsName), TxErrors.CERTIFICATE_POOL_RELAY_INVALID_DNS);
    Precondition.check(
      params.dnsName.split('').every(c => (c.charCodeAt(0) >= 32 && c.charCodeAt(0) <= 126)),
      TxErrors.CERTIFICATE_POOL_RELAY_INVALID_DNS
    );
    dnsBuf = Buffer.from(params.dnsName, "ascii");
  }

  Precondition.checkIsUint8(type);

  let typeBuf = Buffer.alloc(1);
  typeBuf.writeUInt8(type);

  switch(type) {
    case 0:
      return Buffer.concat([typeBuf, portBuf, ipv4Buf, ipv6Buf]);

    case 1:
      Precondition.check(dnsBuf, TxErrors.CERTIFICATE_POOL_RELAY_MISSING_DNS);
      return Buffer.concat([typeBuf, portBuf, dnsBuf]);

    case 2:
      Precondition.check(dnsBuf, TxErrors.CERTIFICATE_POOL_RELAY_MISSING_DNS);
      return Buffer.concat([typeBuf, dnsBuf]);
  }
  throw new Error(TxErrors.CERTIFICATE_POOL_RELAY_INVALID_TYPE);
}

export function serializePoolMetadataParams(
  params: PoolMetadataParams
): Buffer {

  const POOL_CERTIFICATE_METADATA_NO = 1;
  const POOL_CERTIFICATE_METADATA_YES = 2;

  const includeMetadataBuffer = Buffer.alloc(1);
  if (!params) {
    // deal with null metadata
    includeMetadataBuffer.writeUInt8(POOL_CERTIFICATE_METADATA_NO);
    return includeMetadataBuffer;
  } else {
    includeMetadataBuffer.writeUInt8(POOL_CERTIFICATE_METADATA_YES);
  }

  const url = params.metadataUrl;
  Precondition.checkIsString(url, TxErrors.CERTIFICATE_POOL_METADATA_INVALID_URL);
  Precondition.check(url.length <= 64, TxErrors.CERTIFICATE_POOL_METADATA_INVALID_URL);
  Precondition.check(
    url.split('').every(c => (c.charCodeAt(0) >= 32 && c.charCodeAt(0) <= 126)),
    TxErrors.CERTIFICATE_POOL_METADATA_INVALID_URL
  );

  const hashHex = params.metadataHashHex;
  Precondition.checkIsHexString(hashHex, TxErrors.CERTIFICATE_POOL_METADATA_INVALID_HASH);
  Precondition.check(hashHex.length === 32 * 2, TxErrors.CERTIFICATE_POOL_METADATA_INVALID_HASH);

  return Buffer.concat([
    includeMetadataBuffer,
    utils.hex_to_buf(hashHex),
    Buffer.from(url)
  ]);
}

export function serializeGetExtendedPublicKeyParams(
  path: BIP32Path
): Buffer {
  Precondition.check(path, GetKeyErrors.INVALID_PATH);

  return utils.path_to_buf(path);
}



export default {
  HARDENED,
  AddressTypeNibbles,
  CertificateTypes,
  KEY_HASH_LENGTH,
  TX_HASH_LENGTH,

  serializeGetExtendedPublicKeyParams,

  validateTransaction,

  serializeAddressParams,

  serializePoolInitialParams,
  serializePoolOwnerParams,
  serializePoolRelayParams,
  serializePoolMetadataParams
};
