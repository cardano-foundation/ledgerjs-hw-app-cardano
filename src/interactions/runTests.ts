import type { SendFn } from "../Ada";
import { INS } from "./common/ins";
import { wrapRetryStillInCall } from "./common/retry";

export async function runTests(_send: SendFn): Promise<void> {
  await wrapRetryStillInCall(_send)({
    ins: INS.RUN_TESTS,
    p1: 0x00,
    p2: 0x00,
    data: Buffer.alloc(0),
    expectedResponseLength: 0,
  });
}
