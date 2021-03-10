import cardano from "../cardano";
import type { ParsedAddressParams, Version } from "../types/internal";
import type { DerivedAddress, } from '../types/public'
import { INS } from "./common/ins";
import type { Interaction, SendParams } from "./common/types";

const send = (params: {
  p1: number,
  p2: number,
  data: Buffer,
  expectedResponseLength?: number
}): SendParams => ({ ins: INS.DERIVE_ADDRESS, ...params })

export function* deriveAddress(
  _version: Version,
  addressParams: ParsedAddressParams,
): Interaction<DerivedAddress> {
  const P1_RETURN = 0x01;
  const P2_UNUSED = 0x00;

  const data = cardano.serializeAddressParams(addressParams);

  const response = yield send({
    p1: P1_RETURN,
    p2: P2_UNUSED,
    data: data,
  });

  return {
    addressHex: response.toString("hex"),
  };
}
