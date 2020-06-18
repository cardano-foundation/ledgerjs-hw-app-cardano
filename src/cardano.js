const HARDENED = 0x80000000;

function parseBIP32Index(str: string): number {
  let base = 0;
  if (str.endsWith("'")) {
    str = str.slice(0, -1);
    base = HARDENED;
  }
  const i = safe_parseInt(str);
  Precondition.check(i >= 0);
  Precondition.check(i < HARDENED);
  return base + i;
}
  
export function str_to_path(data: string): Array<number> {
  Precondition.checkIsString(data);
  Precondition.check(data.length > 0);

  return data.split("/").map(parseBIP32Index);
}

export function serializeStakingInfo(
    addressHeader: number, spendingPath: BIP32Path,
    stakingPath: ?BIP32Path = null,
    stakingKeyHash: ?Buffer = null,
    stakingBlockchainPointer: ?[number, number, number] = null
): Buffer {

  Precondition.checkIsUint8(addressHeader);
  const headerBuf = Buffer.from([addressHeader]);

  Precondition.checkIsValidPath(spendingPath);
  const spendingPathBuf = utils.path_to_buf(spendingPath);

  const stakingChoices = {
    NO_STAKING: 0x11,
    STAKING_KEY_PATH: 0x22,
    STAKING_KEY_HASH: 0x33,
    BLOCKCHAIN_POINTER: 0x44
  };
  type StakingChoice = $Values<typeof stakingChoices>;

  // serialize staking info
  var stakingChoice: StakingChoice;
  var stakingInfoBuf: Buffer;
  if (!stakingPath && !stakingKeyHash && !stakingBlockchainPointer) {
    stakingChoice = stakingChoices.NO_STAKING;
    stakingInfoBuf = Buffer.alloc(0);
  } else if ( stakingPath && !stakingKeyHash && !stakingBlockchainPointer) {
    stakingChoice = stakingChoices.STAKING_KEY_PATH;
    Precondition.checkIsValidPath(stakingPath);
    stakingInfoBuf = utils.path_to_buf(stakingPath);
  } else if (!stakingPath &&  stakingKeyHash && !stakingBlockchainPointer) {
    stakingChoice = stakingChoices.STAKING_KEY_HASH;
    Precondition.check(stakingKeyHash.length == 28); // TODO some global constant for key hash length
    stakingInfoBuf = stakingKeyHash;
  } else if (!stakingPath && !stakingKeyHash &&  stakingBlockchainPointer) {
    stakingChoice = stakingChoices.BLOCKCHAIN_POINTER;
    stakingInfoBuf = Buffer.alloc(3 * 4); // 3 x uint32
    Precondition.checkIsArray(stakingBlockchainPointer);
    Precondition.check(stakingBlockchainPointer.length == 3);
    for (var i = 0; i < 3; i++) {
      Precondition.checkIsUint32(stakingBlockchainPointer[i]);
      // $FlowFixMe
      stakingInfoBuf.writeUInt32BE(stakingBlockchainPointer[i], 4 * i);
    }
  } else {
    throw new Error("Invalid staking info");
  }
  const stakingChoiceBuf = Buffer.from([stakingChoice]);

  return Buffer.concat([headerBuf, spendingPathBuf, stakingChoiceBuf, stakingInfoBuf]);
}
  
export default {
  HARDENED,

  str_to_path,

  serializeStakingInfo
};
