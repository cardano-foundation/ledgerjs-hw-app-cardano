import type { SendFn } from "../Ada";
import { serializeGetExtendedPublicKeyParams } from "../cardano";
import { uint32_to_buf } from "../serializeUtils";
import type { Uint32_t, ValidBIP32Path, Version } from "../types/internal";
import type { GetExtendedPublicKeyResponse } from "../types/public"
import { assert } from "../utils";
import utils from "../utils";
import { INS } from "./common/ins";
import { wrapRetryStillInCall } from "./common/retry";
import { ensureLedgerAppVersionAtLeast } from "./getVersion";


export async function getExtendedPublicKeys(
  _send: SendFn,
  version: Version,
  paths: Array<ValidBIP32Path>
): Promise<Array<GetExtendedPublicKeyResponse>> {

  if (paths.length > 1) {
    ensureLedgerAppVersionAtLeast(version, 2, 1);
  }

  const enum P1 {
    INIT = 0x00,
    NEXT_KEY = 0x01
  }
  const enum P2 {
    UNUSED = 0x00
  }
  const result = [];

  for (let i = 0; i < paths.length; i++) {
    const pathData = serializeGetExtendedPublicKeyParams(paths[i]);

    let response: Buffer;
    if (i === 0) {
      // initial APDU

      // passing empty Buffer for backwards compatibility
      // of single key export on Ledger app version 2.0.4
      const remainingKeysData =
        paths.length > 1
          ? uint32_to_buf(paths.length - 1 as Uint32_t)
          : Buffer.from([]);

      response = await wrapRetryStillInCall(_send)({
        ins: INS.GET_EXT_PUBLIC_KEY,
        p1: P1.INIT,
        p2: P2.UNUSED,
        data: Buffer.concat([pathData, remainingKeysData]),
        expectedResponseLength: 64,
      });
    } else {
      // next key APDU
      response = await _send({
        ins: INS.GET_EXT_PUBLIC_KEY,
        p1: P1.NEXT_KEY,
        p2: P2.UNUSED,
        data: pathData,
        expectedResponseLength: 64,
      });
    }

    const [publicKey, chainCode, rest] = utils.chunkBy(response, [32, 32]);
    assert(rest.length === 0, "invalid response length");

    result.push({
      publicKeyHex: publicKey.toString("hex"),
      chainCodeHex: chainCode.toString("hex"),
    });
  }

  return result;
}
