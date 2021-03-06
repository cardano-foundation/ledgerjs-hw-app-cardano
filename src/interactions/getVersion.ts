import type { SendFn } from "../Ada";
import { Errors } from '../Ada'
import type { GetVersionResponse } from "../types/public"
import { INS } from "./common/ins";
import { wrapRetryStillInCall } from "./common/retry";

export async function getVersion(_send: SendFn): Promise<GetVersionResponse> {
  // moving getVersion() logic to private function in order
  // to disable concurrent execution protection done by this.transport.decorateAppAPIMethods()
  // when invoked from within other calls to check app version

  const P1_UNUSED = 0x00;
  const P2_UNUSED = 0x00;
  const response = await wrapRetryStillInCall(_send)({
    ins: INS.GET_VERSION,
    p1: P1_UNUSED,
    p2: P2_UNUSED,
    data: Buffer.alloc(0),
    expectedResponseLength: 4,
  });
  const [major, minor, patch, flags_value] = response;

  const FLAG_IS_DEBUG = 1;
  //const FLAG_IS_HEADLESS = 2;

  const flags = {
    isDebug: (flags_value & FLAG_IS_DEBUG) === FLAG_IS_DEBUG,
  };
  return { major, minor, patch, flags };
}

export async function isLedgerAppVersionAtLeast(
  _send: SendFn,
  minMajor: number,
  minMinor: number
): Promise<boolean> {
  const { major, minor } = await getVersion(_send);

  return major >= minMajor && (major > minMajor || minor >= minMinor);
}

export async function ensureLedgerAppVersionAtLeast(
  _send: SendFn,
  minMajor: number,
  minMinor: number
) {
  const versionCheckSuccess = await isLedgerAppVersionAtLeast(
    _send,
    minMajor,
    minMinor
  );

  if (!versionCheckSuccess) {
    throw new Error(Errors.INCORRECT_APP_VERSION);
  }
}
