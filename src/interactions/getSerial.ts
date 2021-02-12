import type { GetSerialResponse, SendFn, } from "../Ada";
import utils, { Assert } from "../utils";
import { INS } from "./common/ins";
import { wrapRetryStillInCall } from "./common/retry";
import { ensureLedgerAppVersionAtLeast } from "./getVersion";

export async function getSerial(_send: SendFn): Promise<GetSerialResponse> {
  await ensureLedgerAppVersionAtLeast(_send, 1, 2);

  const P1_UNUSED = 0x00;
  const P2_UNUSED = 0x00;
  const response = await wrapRetryStillInCall(_send)({
    ins: INS.GET_SERIAL,
    p1: P1_UNUSED,
    p2: P2_UNUSED,
    data: Buffer.alloc(0),
    expectedResponseLength: 7,
  });
  Assert.assert(response.length === 7);

  const serial = utils.buf_to_hex(response);
  return { serial };
}
