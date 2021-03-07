import { serializeAddressParams } from "../cardano";
import type { ParsedAddressParams, Version } from "../types/internal";
import { INS } from "./common/ins";
import type { Interaction, SendParams } from "./common/types";

const send = (params: {
  p1: number,
  p2: number,
  data: Buffer,
  expectedResponseLength?: number
}): SendParams => ({ ins: INS.DERIVE_ADDRESS, ...params })


export function* showAddress(
  _version: Version,
  addressParams: ParsedAddressParams,
): Interaction<void> {
  const P1_DISPLAY = 0x02;
  const P2_UNUSED = 0x00;

  const data = serializeAddressParams(addressParams);

  yield send({
    p1: P1_DISPLAY,
    p2: P2_UNUSED,
    data,
    expectedResponseLength: 0,
  });
}
