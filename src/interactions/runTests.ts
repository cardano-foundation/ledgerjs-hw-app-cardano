import type { Version } from "../types/internal";
import { INS } from "./common/ins";
import type { Interaction, SendParams } from "./common/types";

const send = (params: {
  p1: number,
  p2: number,
  data: Buffer,
  expectedResponseLength?: number
}): SendParams => ({ ins: INS.RUN_TESTS, ...params })


export function* runTests(_version: Version): Interaction<void> {
  yield send({
    p1: 0x00,
    p2: 0x00,
    data: Buffer.alloc(0),
    expectedResponseLength: 0,
  });
}
