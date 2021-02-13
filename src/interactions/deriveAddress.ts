import type {
  AddressTypeNibble,
  BIP32Path,
  DeriveAddressResponse,
  SendFn,
  StakingBlockchainPointer,
} from "../Ada";
import cardano from "../cardano";
import { INS } from "./common/ins";

export async function deriveAddress(
  _send: SendFn,
  addressTypeNibble: AddressTypeNibble,
  networkIdOrProtocolMagic: number,
  spendingPath: BIP32Path,
  stakingPath: BIP32Path | null = null,
  stakingKeyHashHex: string | null = null,
  stakingBlockchainPointer: StakingBlockchainPointer | null = null
): Promise<DeriveAddressResponse> {
  const P1_RETURN = 0x01;
  const P2_UNUSED = 0x00;

  const data = cardano.serializeAddressParams(
    addressTypeNibble,
    networkIdOrProtocolMagic,
    spendingPath,
    stakingPath,
    stakingKeyHashHex,
    stakingBlockchainPointer
  );

  const response = await _send({
    ins: INS.DERIVE_ADDRESS,
    p1: P1_RETURN,
    p2: P2_UNUSED,
    data: data,
  });

  return {
    addressHex: response.toString("hex"),
  };
}
