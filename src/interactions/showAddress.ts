import type { SendFn } from "../Ada";
import cardano from "../cardano";
import type { ParsedAddressParams } from "../parsing";
import { INS } from "./common/ins";

export async function showAddress(
  _send: SendFn,
  addressParams: ParsedAddressParams,
): Promise<void> {
  const P1_DISPLAY = 0x02;
  const P2_UNUSED = 0x00;

  const data = cardano.serializeAddressParams(addressParams);

  await _send({
    ins: INS.DERIVE_ADDRESS,
    p1: P1_DISPLAY,
    p2: P2_UNUSED,
    data,
    expectedResponseLength: 0,
  });
}
