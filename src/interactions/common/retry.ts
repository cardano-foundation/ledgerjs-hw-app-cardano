// It can happen that we try to send a message to the device
// when the device thinks it is still in a middle of previous ADPU stream.
// This happens mostly if host does abort communication for some reason
// leaving ledger mid-call.
// In this case Ledger will respond by ERR_STILL_IN_CALL *and* resetting its state to
// default. We can therefore transparently retry the request.

import { DeviceErrorCodes } from "../../Ada";

// Note though that only the *first* request in an multi-APDU exchange should be retried.
export function wrapRetryStillInCall<T extends Function>(fn: T): T {
  // @ts-ignore
  return async (...args: any) => {
    try {
      return await fn(...args);
    } catch (e) {
      if (
        e &&
        e.statusCode &&
        e.statusCode === DeviceErrorCodes.ERR_STILL_IN_CALL
      ) {
        // Do the retry
        return await fn(...args);
      }
      throw e;
    }
  };
}
