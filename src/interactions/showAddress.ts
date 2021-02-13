import type {
  AddressTypeNibble,
  BIP32Path,
  SendFn,
  StakingBlockchainPointer,
} from "../Ada";
import cardano from "../cardano";
import { INS } from "./common/ins";

export async function showAddress(
  _send: SendFn,
  addressTypeNibble: AddressTypeNibble,
  networkIdOrProtocolMagic: number,
  spendingPath: BIP32Path,
  stakingPath: BIP32Path | null = null,
  stakingKeyHashHex: string | null = null,
  stakingBlockchainPointer: StakingBlockchainPointer | null = null
): Promise<void> {
  const P1_DISPLAY = 0x02;
  const P2_UNUSED = 0x00;
  const data = cardano.serializeAddressParams(
    addressTypeNibble,
    networkIdOrProtocolMagic,
    spendingPath,
    stakingPath,
    stakingKeyHashHex,
    stakingBlockchainPointer
  );
  await _send({
    ins: INS.DERIVE_ADDRESS,
    p1: P1_DISPLAY,
    p2: P2_UNUSED,
    data,
    expectedResponseLength: 0,
  });
}
