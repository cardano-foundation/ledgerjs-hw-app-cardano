import type { BIP32Path, GetExtendedPublicKeyResponse, SendFn } from "../Ada";
import cardano from "../cardano";
import { parseBIP32Path } from "../parsing";
import { Assert, Precondition } from "../utils";
import utils from "../utils";
import { INS } from "./common/ins";
import { wrapRetryStillInCall } from "./common/retry";
import { ensureLedgerAppVersionAtLeast } from "./getVersion";


export const GetKeyErrors = {
  INVALID_PATH: "invalid key path",
};

export async function getExtendedPublicKeys(
  _send: SendFn,
  paths: Array<BIP32Path>
): Promise<Array<GetExtendedPublicKeyResponse>> {
  // validate the input
  Precondition.checkIsArray(paths);
  for (const path of paths) {
    Precondition.checkIsValidPath(path);
  }

  if (paths.length > 1) {
    await ensureLedgerAppVersionAtLeast(_send, 2, 1);
  }

  const P1_INIT = 0x00;
  const P1_NEXT_KEY = 0x01;
  const P2_UNUSED = 0x00;

  const result = [];

  for (let i = 0; i < paths.length; i++) {
    // TODO: move to parsing
    const path = parseBIP32Path(paths[i], GetKeyErrors.INVALID_PATH);
    const pathData = cardano.serializeGetExtendedPublicKeyParams(path);

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
        p1: P1_INIT,
        p2: P2_UNUSED,
        data: Buffer.concat([pathData, remainingKeysData]),
        expectedResponseLength: 64,
      });
    } else {
      // next key APDU
      response = await _send({
        ins: INS.GET_EXT_PUBLIC_KEY,
        p1: P1_NEXT_KEY,
        p2: P2_UNUSED,
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
