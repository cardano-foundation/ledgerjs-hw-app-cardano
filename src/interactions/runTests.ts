import type { SendFn } from "../Ada";
import type { Version } from "../types/internal";
import { INS } from "./common/ins";
import { wrapRetryStillInCall } from "./common/retry";

export async function runTests(_send: SendFn, _version: Version): Promise<void> {
  await wrapRetryStillInCall(_send)({
    ins: INS.RUN_TESTS,
    p1: 0x00,
    p2: 0x00,
    data: Buffer.alloc(0),
    expectedResponseLength: 0,
  });
}
