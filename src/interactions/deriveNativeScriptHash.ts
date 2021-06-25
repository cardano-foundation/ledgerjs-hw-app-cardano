import { DeviceVersionUnsupported } from "../errors"
import type { ParsedComplexNativeScript, ParsedNativeScript, ParsedSimpleNativeScript } from "../types/internal"
import { NATIVE_SCRIPT_HASH_LENGTH } from "../types/internal"
import type { NativeScriptHash, NativeScriptHashDisplayFormat, Version } from "../types/public"
import { NativeScriptType } from "../types/public"
import { INS } from "./common/ins"
import type { Interaction, SendParams } from "./common/types"
import { ensureLedgerAppVersionCompatible, getCompatibility } from "./getVersion"
import { serializeComplexNativeScriptStart, serializeSimpleNativeScript, serializeWholeNativeScriptFinish } from "./serialization/nativeScript"

const send = (params: {
    p1: number,
    p2: number,
    data: Buffer,
    expectedResponseLength?: number
  }): SendParams => ({ ins: INS.DERIVE_NATIVE_SCRIPT_HASH, ...params })

const enum P1 {
    STAGE_COMPLEX_SCRIPT_START = 0x01,
    STAGE_ADD_SIMPLE_SCRIPT = 0x02,
    STAGE_WHOLE_NATIVE_SCRIPT_FINISH = 0x03,
}

const enum P2 {
    UNUSED = 0x00,
}

type ScriptHashResponse = { scriptHashHex: string }

function *deriveScriptHash_startComplexScript(
    script: ParsedComplexNativeScript,
): Interaction<void> {
    yield send({
        p1: P1.STAGE_COMPLEX_SCRIPT_START,
        p2: P2.UNUSED,
        data: serializeComplexNativeScriptStart(script),
        expectedResponseLength: 0,
    })
}

function *deriveNativeScriptHash_addSimpleScript(
    script: ParsedSimpleNativeScript,
): Interaction<void> {
    yield send({
        p1: P1.STAGE_ADD_SIMPLE_SCRIPT,
        p2: P2.UNUSED,
        data: serializeSimpleNativeScript(script),
        expectedResponseLength: 0,
    })
}

function isComplexScript(script: ParsedNativeScript): script is ParsedComplexNativeScript {
    switch (script.type) {
    case NativeScriptType.ALL:
    case NativeScriptType.ANY:
    case NativeScriptType.N_OF_K:
        return true
    default:
        return false
    }
}

function *deriveNativeScriptHash_addScript(
    script: ParsedNativeScript,
): Interaction<void> {
    if (isComplexScript(script)) {
        yield* deriveScriptHash_startComplexScript(script)
        for (const subscript of script.params.scripts) {
            yield* deriveNativeScriptHash_addScript(subscript)
        }
    } else {
        return yield* deriveNativeScriptHash_addSimpleScript(script)
    }
}

function *deriveNativeScriptHash_finishWholeNativeScript(
    displayFormat: NativeScriptHashDisplayFormat,
): Interaction<ScriptHashResponse> {
    const response = yield send({
        p1: P1.STAGE_WHOLE_NATIVE_SCRIPT_FINISH,
        p2: P2.UNUSED,
        data: serializeWholeNativeScriptFinish(displayFormat),
        expectedResponseLength: NATIVE_SCRIPT_HASH_LENGTH,
    })

    return {
        scriptHashHex: response.toString("hex"),
    }
}

function ensureScriptHashDerivationSupportedByAppVersion(
    version: Version
): void {
    if (!getCompatibility(version).supportsNativeScriptHashDerivation) {
        throw new DeviceVersionUnsupported(`Native script hash derivation not supported by Ledger app version ${version}.`)
    }
}

export function* deriveNativeScriptHash(
    version: Version,
    script: ParsedNativeScript,
    displayFormat: NativeScriptHashDisplayFormat,
): Interaction<NativeScriptHash> {
    ensureLedgerAppVersionCompatible(version)
    ensureScriptHashDerivationSupportedByAppVersion(version)

    yield* deriveNativeScriptHash_addScript(script)
    const { scriptHashHex } = yield* deriveNativeScriptHash_finishWholeNativeScript(displayFormat)

    return {
        scriptHashHex,
    }
}
