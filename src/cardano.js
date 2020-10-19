import utils, { Precondition } from "./utils";
import {AddressTypeNibbles, PoolParams, PoolOwnerParams, SingleHostIPRelay, SingleHostNameRelay, MultiHostNameRelay, PoolMetadataParams} from './Ada';

const HARDENED = 0x80000000;

const KEY_HASH_LENGTH = 28;

const POOL_REGISTRATION_OWNERS_MAX = 1000;
const POOL_REGISTRATION_RELAYS_MAX = 1000;

function parseBIP32Index(str: string, errMsg: ?str = null): number {
  let base = 0;
  if (str.endsWith("'")) {
    str = str.slice(0, -1);
    base = HARDENED;
  }
  const i = utils.safe_parseInt(str);
  Precondition.check(i >= 0, errMsg);
  Precondition.check(i < HARDENED, errMsg);
  return base + i;
}

export function str_to_path(data: string): Array<number> {
  const errMsg = "invalid bip32 path string";
  Precondition.checkIsString(data, errMsg);
  Precondition.check(data.length > 0, errMsg);

  return data.split("/").map(parseBIP32Index);
}

export function serializeAddressParams(
    addressTypeNibble: $Values<typeof AddressTypeNibbles>,
    networkIdOrProtocolMagic: number,
    spendingPath: BIP32Path,
    stakingPath: ?BIP32Path = null,
    stakingKeyHashHex: ?string = null,
    stakingBlockchainPointer: ?StakingBlockchainPointer = null
): Buffer {
  Precondition.checkIsUint8(addressTypeNibble << 4, "invalid address type nibble");
  const addressTypeNibbleBuf = utils.uint8_to_buf(addressTypeNibble);

  let networkIdOrProtocolMagicBuf;

  if (addressTypeNibble == AddressTypeNibbles.BYRON) {
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
    Precondition.check(stakingKeyHash.length == KEY_HASH_LENGTH, "invalid staking key hash length");
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
  Precondition.check(params.poolKeyHashHex.length == 28 * 2, errMsg);

  errMsg = "invalid vrf key hash";
  Precondition.checkIsHexString(params.vrfKeyHashHex, errMsg);
  Precondition.check(params.vrfKeyHashHex.length == 32 * 2, errMsg);

  Precondition.checkIsValidAmount(params.pledgeStr, "invalid pledge");
  Precondition.checkIsValidAmount(params.costStr, "invalid cost");

  errMsg = "invalid margin";
  const marginNumerator = utils.safe_parseInt(params.margin.numeratorStr);
  Precondition.checkIsUint64(marginNumerator, errMsg);
  const marginDenominator = utils.safe_parseInt(params.margin.denominatorStr);
  Precondition.checkIsUint64(marginDenominator, errMsg);

  errMsg = "invalid reward account";
  Precondition.checkIsHexString(params.rewardAccountHashHex, errMsg);
  Precondition.check(params.rewardAccountHashHex.length == 29 * 2, errMsg);

  Precondition.check(params.poolOwners.length <= POOL_REGISTRATION_OWNERS_MAX), "too many owners";
  Precondition.check(params.relays.length <= POOL_REGISTRATION_RELAYS_MAX), "too many relays";

  return Buffer.concat([
    utils.hex_to_buf(params.poolKeyHashHex),
    utils.hex_to_buf(params.vrfKeyHashHex),
    utils.amount_to_buf(params.pledgeStr),
    utils.amount_to_buf(params.costStr),
    utils.amount_to_buf(params.margin.numeratorStr), // TODO why amount? ... we should have uint64_to_buf?
    utils.amount_to_buf(params.margin.denominatorStr),
    utils.hex_to_buf(params.rewardAccountHashHex),
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
    Precondition.check(hashHex.length == KEY_HASH_LENGTH * 2, errMsg);

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
  if (params.ipv4Hex) {
    Precondition.checkIsHexString(params.ipv4Hex, "invalid ipv4");
    Precondition.check(params.ipv4Hex.length == 4 * 2, "invalid ipv4");
    ipv4Buf = Buffer.concat([yesBuf, utils.hex_to_buf(params.ipv4Hex)]);
  } else {
    ipv4Buf = noBuf;
  }

  let ipv6Buf: Buffer;
  if (params.ipv6Hex) {
    Precondition.checkIsHexString(params.ipv6Hex, "invalid ipv6");
    Precondition.check(params.ipv6Hex.length == 16 * 2, "invalid ipv6");
    ipv6Buf = Buffer.concat([yesBuf, utils.hex_to_buf(params.ipv6Hex)]);
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
    return buffer;
  } else {
    includeMetadataBuffer.writeUInt8(POOL_CERTIFICATE_METADATA_YES);
  }

  const url = params.metadataUrl;
  Precondition.checkIsString(url, "invalid pool metadata url");
  Precondition.check(url.length <= 64, "pool metadata url too long");

  const hashHex = params.metadataHashHex;
  const errMsg = "invalid pool metadata hash";
  Precondition.checkIsHexString(hashHex, errMsg);
  Precondition.check(hashHex.length == 32 * 2, errMsg);

  return Buffer.concat([
    includeMetadataBuffer,
    utils.hex_to_buf(hashHex),
    Buffer.from(url)
  ]);
}




export default {
  HARDENED,

  str_to_path,

  serializeAddressParams,

  serializePoolInitialParams,
  serializePoolOwnerParams,
  serializePoolRelayParams,
  serializePoolMetadataParams
};
