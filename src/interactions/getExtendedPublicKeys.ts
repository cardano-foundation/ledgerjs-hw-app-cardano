import type { BIP32Path, GetExtendedPublicKeyResponse, SendFn } from "../Ada";
import cardano from "../cardano";
import { parseBIP32Path, ValidBIP32Path } from "../parsing";
import { Assert, Precondition } from "../utils";
import utils from "../utils";
import { INS } from "./common/ins";
import { wrapRetryStillInCall } from "./common/retry";
import { ensureLedgerAppVersionAtLeast } from "./getVersion";


export async function getExtendedPublicKeys(
  _send: SendFn,
  paths: Array<ValidBIP32Path>
): Promise<Array<GetExtendedPublicKeyResponse>> {

  if (paths.length > 1) {
    await ensureLedgerAppVersionAtLeast(_send, 2, 1);
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
    const pathData = cardano.serializeGetExtendedPublicKeyParams(paths[i]);

    let response: Buffer;
    if (i === 0) {
      // initial APDU

      // passing empty Buffer for backwards compatibility
      // of single key export on Ledger app version 2.0.4
      const remainingKeysData =
        paths.length > 1
          ? utils.uint32_to_buf(paths.length - 1)
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
    Assert.assert(rest.length === 0);

    result.push({
      publicKeyHex: publicKey.toString("hex"),
      chainCodeHex: chainCode.toString("hex"),
    });
  }

  return result;
}
