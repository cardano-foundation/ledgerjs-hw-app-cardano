import type {
  AddressParams,
  SendFn,
} from "../Ada";
import cardano from "../cardano";
import { parseAddressParams } from "../parsing";
import { INS } from "./common/ins";

export async function showAddress(
  _send: SendFn,
  addressParams: AddressParams,
): Promise<void> {
  const P1_DISPLAY = 0x02;
  const P2_UNUSED = 0x00;
  const parsed = parseAddressParams(addressParams)

  const data = cardano.serializeAddressParams(parsed);

  await _send({
    ins: INS.DERIVE_ADDRESS,
    p1: P1_DISPLAY,
    p2: P2_UNUSED,
    data,
    expectedResponseLength: 0,
  });
}
