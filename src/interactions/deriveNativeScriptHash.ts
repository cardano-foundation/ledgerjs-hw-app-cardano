import type { ParsedNativeScript } from "../types/internal"
import type { NativeScriptHash, NativeScriptHashDisplayFormat, Version } from "../types/public"
import { INS } from "./common/ins"
import type { Interaction, SendParams } from "./common/types"
import { serializeNativeScript } from "./serialization/nativeScript"

const send = (params: {
    p1: number,
    p2: number,
    data: Buffer,
    expectedResponseLength?: number
  }): SendParams => ({ ins: INS.DERIVE_NATIVE_SCRIPT_HASH, ...params })

export function* deriveNativeScriptHash(
    _version: Version,
    script: ParsedNativeScript,
    _displayFormat: NativeScriptHashDisplayFormat,
): Interaction<NativeScriptHash> {
    const P1_RETURN = 0x01
    const P2_UNUSED = 0x00

    const response = yield send({
        p1: P1_RETURN,
        p2: P2_UNUSED,
        data: serializeNativeScript(script),
    })

    return {
        scriptHashHex: response.toString("hex"),
    }
}
