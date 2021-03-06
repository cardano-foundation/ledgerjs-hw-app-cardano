import type { SendFn, } from "../Ada";
import type { Version } from "../types/internal"
import type { GetSerialResponse } from "../types/public"
import utils, { assert } from "../utils";
import { INS } from "./common/ins";
import { wrapRetryStillInCall } from "./common/retry";
import { ensureLedgerAppVersionAtLeast } from "./getVersion";

export async function getSerial(_send: SendFn, version: Version): Promise<GetSerialResponse> {
  ensureLedgerAppVersionAtLeast(version, 1, 2);

  const P1_UNUSED = 0x00;
  const P2_UNUSED = 0x00;
  const response = await wrapRetryStillInCall(_send)({
    ins: INS.GET_SERIAL,
    p1: P1_UNUSED,
    p2: P2_UNUSED,
    data: Buffer.alloc(0),
    expectedResponseLength: 7,
  });
  assert(response.length === 7, "invalid response length");

  const serial = utils.buf_to_hex(response);
  return { serial };
}
