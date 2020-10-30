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

const POOL_REGISTRATION_OWNERS_MAX = 1000;
const POOL_REGISTRATION_RELAYS_MAX = 1000;

function validateCertificates(
  certificates: Array<Certificate>
)
{
  Precondition.checkIsArray(certificates, "certificates not an array");
  const isSigningPoolRegistrationAsOwner = certificates.some(
    cert => cert.type === CertificateTypes.STAKE_POOL_REGISTRATION
  );

  for (const cert of certificates) {
    if (!cert) throw new Error("invalid certificate");

    const CANNOT_COMBINE_CERTIFICATES = "cannot combine pool registration with other certificates";
    const PATH_IS_REQUIRED =  "path is required for a certificate of type " + cert.type;
    switch (cert.type) {
      case CertificateTypes.STAKE_REGISTRATION: {
        Precondition.check(!isSigningPoolRegistrationAsOwner, CANNOT_COMBINE_CERTIFICATES);
        Precondition.checkIsValidPath(cert.path, PATH_IS_REQUIRED);
        Precondition.check(!cert.poolKeyHashHex, "superfluous pool key hash in a certificate of type " + cert.type);
        break;
      }
      case CertificateTypes.STAKE_DEREGISTRATION: {
        Precondition.check(!isSigningPoolRegistrationAsOwner, CANNOT_COMBINE_CERTIFICATES);
        Precondition.checkIsValidPath(cert.path, PATH_IS_REQUIRED);
        Precondition.check(!cert.poolKeyHashHex, "superfluous pool key hash in a certificate of type " + cert.type);
        break;
      }
      case CertificateTypes.STAKE_DELEGATION: {
        Precondition.check(!isSigningPoolRegistrationAsOwner, CANNOT_COMBINE_CERTIFICATES);
        Precondition.checkIsValidPath(cert.path, PATH_IS_REQUIRED);
        Precondition.checkIsHexString(cert.poolKeyHashHex, "missing pool key hash in a certificate of type " + cert.type);
        Precondition.check(cert.poolKeyHashHex.length == KEY_HASH_LENGTH * 2, "invalid pool key hash in a certificate of type " + cert.type);
        break;
      }
      case CertificateTypes.STAKE_POOL_REGISTRATION: {
        Assert.assert(isSigningPoolRegistrationAsOwner);
        Precondition.check(!cert.path, "superfluous path for pool registration certificate");
        const poolParams = cert.poolRegistrationParams;
        Precondition.check(!!poolParams, "missing stake pool params in a pool registration certificate");

        // serialization succeeds if and only if params are valid
        serializePoolInitialParams(poolParams);

        // owners
        Precondition.checkIsArray(poolParams.poolOwners, "owners not an array");
        let numPathOwners = 0;
        for (const owner of poolParams.poolOwners) {
          if (owner.stakingPath) {
            numPathOwners++;
            serializePoolOwnerParams(owner);
          }
        }
        if (numPathOwners !== 1) throw new Error("there should be exactly one path owner");

        // relays
        Precondition.checkIsArray(poolParams.relays, "relays not an array");
        for (const relay of poolParams.relays) {
          serializePoolRelayParams(relay);
        }

        // metadata
        serializePoolMetadataParams(poolParams.metadata);

        break;
      }
      default:
        throw new Error("invalid certificate type");
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
  Precondition.checkIsArray(certificates, "certificates not an array");
  const isSigningPoolRegistrationAsOwner = certificates.some(
    cert => cert.type === CertificateTypes.STAKE_POOL_REGISTRATION
  );

  Precondition.checkIsArray(inputs, "inputs not an array");
  for (const input of inputs) {
    Precondition.checkIsHexString(input.txHashHex, "invalid tx hash");
    Precondition.check(input.txHashHex.length === 32 * 2, "invalid tx hash length");

    if (isSigningPoolRegistrationAsOwner) {
      // input should not be given with a path
      // the path is not used, but we check just to avoid potential confusion of developers using this
      Precondition.check(!input.path, "stake pool registration: inputs should not contain the witness path");
    }
  }

  Precondition.checkIsArray(inputs, "outputs not an array");
  for (const output of outputs) {
    Precondition.checkIsValidAmount(output.amountStr, "invalid amount in output");
    if (output.addressHex) {
      Precondition.checkIsHexString(output.addressHex, "invalid address in output");
      Precondition.check(output.addressHex.length <= 128 * 2, "invalid address in output: too long");
    } else if (output.spendingPath) {
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
      throw new Error("unknown output type");
    }
  }

  // fee
  Precondition.checkIsValidAmount(feeStr, "invalid fee");

  //  ttl
  const ttl = utils.safe_parseInt(ttlStr);
  Precondition.checkIsUint64(ttl, "invalid ttl");
  Precondition.check(ttl > 0, "invalid ttl: should be positive");

  // certificates
  validateCertificates(certificates);

  Precondition.checkIsArray(withdrawals, "withdrawals not an array");
  if (isSigningPoolRegistrationAsOwner && withdrawals.length > 0) {
    throw new Error("no withdrawals allowed for transactions registering stake pools");
  }
  for (const withdrawal of withdrawals) {
    Precondition.checkIsValidAmount(withdrawal.amountStr);
    Precondition.checkIsValidPath(withdrawal.path);
  }

  // metadata could be null
  if (metadataHashHex !== null) {
    Precondition.checkIsHexString(metadataHashHex, "invalid metadata");
    Precondition.check(metadataHashHex.length == 32 * 2, "invalid metadata");
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
  Precondition.checkIsUint8(addressTypeNibble << 4, "invalid address type nibble");
  const addressTypeNibbleBuf = utils.uint8_to_buf(addressTypeNibble);

  let networkIdOrProtocolMagicBuf;

  if (addressTypeNibble === AddressTypeNibbles.BYRON) {
    Precondition.checkIsUint32(networkIdOrProtocolMagic, "invalid protocol magic");
    networkIdOrProtocolMagicBuf = utils.uint32_to_buf(networkIdOrProtocolMagic);
  } else {
    Precondition.checkIsUint8(networkIdOrProtocolMagic, "invalid network id");
    networkIdOrProtocolMagicBuf = utils.uint8_to_buf(networkIdOrProtocolMagic);
  }

  Precondition.checkIsValidPath(spendingPath, "invalid spending path");
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
    Precondition.checkIsValidPath(stakingPath, "invalid staking key path");
    stakingInfoBuf = utils.path_to_buf(stakingPath);
  } else if (!stakingPath &&  stakingKeyHashHex && !stakingBlockchainPointer) {
    const stakingKeyHash = utils.hex_to_buf(stakingKeyHashHex);
    stakingChoice = stakingChoices.STAKING_KEY_HASH;
    Precondition.check(stakingKeyHash.length === KEY_HASH_LENGTH, "invalid staking key hash length");
    stakingInfoBuf = stakingKeyHash;
  } else if (!stakingPath && !stakingKeyHashHex &&  stakingBlockchainPointer) {
    stakingChoice = stakingChoices.BLOCKCHAIN_POINTER;
    stakingInfoBuf = Buffer.alloc(3 * 4); // 3 x uint32

    Precondition.checkIsUint32(stakingBlockchainPointer.blockIndex, "invalid blockchain pointer");
    stakingInfoBuf.writeUInt32BE(stakingBlockchainPointer.blockIndex, 0);
    Precondition.checkIsUint32(stakingBlockchainPointer.txIndex, "invalid blockchain pointer");
    stakingInfoBuf.writeUInt32BE(stakingBlockchainPointer.txIndex, 4);
    Precondition.checkIsUint32(stakingBlockchainPointer.certificateIndex, "invalid blockchain pointer");
    stakingInfoBuf.writeUInt32BE(stakingBlockchainPointer.certificateIndex, 8);
  } else {
    throw new Error("Invalid staking info");
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
  var errMsg = "invalid pool key hash";
  Precondition.checkIsHexString(params.poolKeyHashHex, errMsg);
  Precondition.check(params.poolKeyHashHex.length === 28 * 2, errMsg);

  errMsg = "invalid vrf key hash";
  Precondition.checkIsHexString(params.vrfKeyHashHex, errMsg);
  Precondition.check(params.vrfKeyHashHex.length === 32 * 2, errMsg);

  Precondition.checkIsValidAmount(params.pledgeStr, "invalid pledge");
  Precondition.checkIsValidAmount(params.costStr, "invalid cost");

  errMsg = "invalid margin";
  const marginNumerator = utils.safe_parseInt(params.margin.numeratorStr);
  Precondition.checkIsUint64(marginNumerator, errMsg);
  const marginDenominator = utils.safe_parseInt(params.margin.denominatorStr);
  Precondition.checkIsUint64(marginDenominator, errMsg);
  Precondition.check(marginNumerator >= 0, errMsg);
  Precondition.check(marginDenominator > 0, errMsg);
  Precondition.check(marginNumerator <= marginDenominator, errMsg);

  errMsg = "invalid reward account";
  Precondition.checkIsHexString(params.rewardAccountHex, errMsg);
  Precondition.check(params.rewardAccountHex.length === 29 * 2, errMsg);

  Precondition.check(params.poolOwners.length <= POOL_REGISTRATION_OWNERS_MAX), "too many owners";
  Precondition.check(params.relays.length <= POOL_REGISTRATION_RELAYS_MAX), "too many relays";

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

  Precondition.check(path || hashHex, "incomplete owner params");

  if (path) {
    Precondition.checkIsValidPath(path, "invalid owner path");

    const pathBuf = utils.path_to_buf(path);
    const typeBuf = Buffer.alloc(1);
    typeBuf.writeUInt8(SIGN_TX_POOL_OWNER_TYPE_PATH);
    return Buffer.concat([typeBuf, pathBuf]);
  }

  if (hashHex) {
    const errMsg = "invalid owner key hash";
    Precondition.checkIsHexString(hashHex, errMsg);
    Precondition.check(hashHex.length === KEY_HASH_LENGTH * 2, errMsg);

    const hashBuf = utils.hex_to_buf(hashHex);
    const typeBuf = Buffer.alloc(1);
    typeBuf.writeUInt8(SIGN_TX_POOL_OWNER_TYPE_KEY_HASH);
    return Buffer.concat([typeBuf, hashBuf]);
  }

  throw new Error("Invalid owner parameters");
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
    Precondition.checkIsUint32(params.portNumber, "invalid port");
    Precondition.check(params.portNumber <= 65535, "invalid port");
    portBuf = Buffer.concat([yesBuf, utils.uint16_to_buf(params.portNumber)]);
  } else {
    portBuf = noBuf;
  }

  let ipv4Buf: Buffer;
  if (params.ipv4) {
    const errorMsg = "invalid ipv4";
    Precondition.checkIsString(params.ipv4, errorMsg);
    let ipParts = params.ipv4.split('.');
    Precondition.check(ipParts.length === 4, errorMsg);
    let ipBytes = Buffer.alloc(4);
    for (let i = 0; i < 4; i++) {
      let ipPart = utils.safe_parseInt(ipParts[i]);
      Precondition.checkIsUint8(ipPart, errorMsg);
      ipBytes.writeUInt8(ipPart, i);
    }
    ipv4Buf = Buffer.concat([yesBuf, ipBytes]);
  } else {
    ipv4Buf = noBuf;
  }

  let ipv6Buf: Buffer;
  if (params.ipv6) {
    const errorMsg = "invalid ipv6";
    Precondition.checkIsString(params.ipv6, errorMsg);
    let ipParts = params.ipv6.split(':');
    Precondition.check(ipParts.length === 8, errorMsg);
    let ipBytes = Buffer.alloc(0);
    for (let i = 0; i < 8; i++) {
      Precondition.checkIsHexString(ipParts[i], errorMsg);
      Precondition.check(ipParts[i].length === 4, errorMsg);
      ipBytes = Buffer.concat([ipBytes, hex_to_buf(ipParts[i])]);
    }
    ipv6Buf = Buffer.concat([yesBuf, ipBytes]);
  } else {
    ipv6Buf = noBuf;
  }

  let dnsBuf: Buffer;
  if (params.dnsName) {
    Precondition.checkIsString(params.dnsName);
    Precondition.check(params.dnsName.length <= 64, "dns record too long")
    Precondition.check(/^[\x00-\x7F]*$/.test(params.dnsName), "invalid dns record")
    dnsBuf = Buffer.from(params.dnsName, "ascii");
  }

  Precondition.checkIsUint8(type);

  let typeBuf = Buffer.alloc(1);
  typeBuf.writeUInt8(type);

  switch(type) {
    case 0:
      return Buffer.concat([typeBuf, portBuf, ipv4Buf, ipv6Buf]);

    case 1:
      Precondition.check(dnsBuf, "missing dns record")
      return Buffer.concat([typeBuf, portBuf, dnsBuf]);

    case 2:
      Precondition.check(dnsBuf, "missing dns record")
      return Buffer.concat([typeBuf, dnsBuf]);
  }
  throw new Error("Invalid pool relay type");
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
  Precondition.checkIsString(url, "invalid pool metadata: invalid url");
  Precondition.check(url.length <= 64, "invalid pool metadata: url too long");

  const hashHex = params.metadataHashHex;
  const errMsg = "invalid pool metadata: invalid hash";
  Precondition.checkIsHexString(hashHex, errMsg);
  Precondition.check(hashHex.length === 32 * 2, errMsg);

  return Buffer.concat([
    includeMetadataBuffer,
    utils.hex_to_buf(hashHex),
    Buffer.from(url)
  ]);
}




export default {
  HARDENED,
  AddressTypeNibbles,
  CertificateTypes,

  validateTransaction,

  serializeAddressParams,

  serializePoolInitialParams,
  serializePoolOwnerParams,
  serializePoolRelayParams,
  serializePoolMetadataParams
};
