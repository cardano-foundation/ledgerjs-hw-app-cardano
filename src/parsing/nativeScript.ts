import { InvalidData, InvalidDataReason } from "../errors"
import type { ParsedNativeScript } from "../types/internal"
import { KEY_HASH_LENGTH } from "../types/internal"
import type { bigint_like, BIP32Path, NativeScript } from "../types/public"
import { NativeScriptHashDisplayFormat, NativeScriptType } from "../types/public"
import { isArray, parseBIP32Path, parseHexStringOfLength, parseUint32_t, parseUint64_str, validate } from "../utils/parse"

export function parseNativeScript(
    script: NativeScript
): ParsedNativeScript {
    // union of all param fields
    const params = script.params as {
        path?: BIP32Path,
        keyHashHex?: string,
        requiredCount?: bigint_like,
        slot?: bigint_like,
        scripts?: NativeScript[],
    }

    switch (script.type) {
    case NativeScriptType.PUBKEY_DEVICE_OWNED: {
        validate(params.keyHashHex == null, InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_INVALID_DATA)
        validate(params.requiredCount == null, InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_INVALID_DATA)
        validate(params.slot == null, InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_INVALID_DATA)
        validate(params.scripts == null, InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_INVALID_DATA)

        return {
            type: script.type,
            params: {
                path: parseBIP32Path(params.path, InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_INVALID_KEY_PATH),
            },
        }
    }
    case NativeScriptType.PUBKEY_THIRD_PARTY: {
        validate(params.path == null, InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_INVALID_DATA)
        validate(params.requiredCount == null, InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_INVALID_DATA)
        validate(params.slot == null, InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_INVALID_DATA)
        validate(params.scripts == null, InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_INVALID_DATA)

        return {
            type: script.type,
            params: {
                keyHashHex: parseHexStringOfLength(params.keyHashHex, KEY_HASH_LENGTH, InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_INVALID_KEY_HASH),
            },
        }
    }
    case NativeScriptType.ALL:
    case NativeScriptType.ANY: {
        validate(params.path == null, InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_INVALID_DATA)
        validate(params.keyHashHex == null, InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_INVALID_DATA)
        validate(params.requiredCount == null, InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_INVALID_DATA)
        validate(params.slot == null, InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_INVALID_DATA)
        validate(isArray(params.scripts), InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_SCRIPTS_NOT_AN_ARRAY)

        return {
            type: script.type,
            params: {
                scripts: params.scripts.map(parseNativeScript),
            },
        }
    }
    case NativeScriptType.N_OF_K: {
        validate(params.path == null, InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_INVALID_DATA)
        validate(params.keyHashHex == null, InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_INVALID_DATA)
        validate(params.slot == null, InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_INVALID_DATA)
        validate(isArray(params.scripts), InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_SCRIPTS_NOT_AN_ARRAY)

        const requiredCount = parseUint32_t(params.requiredCount, InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_INVALID_REQUIRED_COUNT)
        validate(requiredCount <= params.scripts.length, InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_REQUIRED_COUNT_HIGHER_THAN_NUMBER_OF_SCRIPTS)

        return {
            type: script.type,
            params: {
                requiredCount,
                scripts: params.scripts.map(parseNativeScript),
            },
        }
    }
    case NativeScriptType.INVALID_BEFORE:
    case NativeScriptType.INVALID_HEREAFTER: {
        validate(params.path == null, InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_INVALID_DATA)
        validate(params.keyHashHex == null, InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_INVALID_DATA)
        validate(params.requiredCount == null, InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_INVALID_DATA)
        validate(params.scripts == null, InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_INVALID_DATA)

        return {
            type: script.type,
            params: {
                slot: parseUint64_str(params.slot, {}, InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_INVALID_TOKEN_LOCKING_SLOT),
            },
        }
    }
    default:
        throw new InvalidData(InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_UNKNOWN_TYPE)
    }
}

export function parseNativeScriptHashDisplayFormat(
    displayFormat: NativeScriptHashDisplayFormat
): NativeScriptHashDisplayFormat {
    // Validate whether the passed format is present in the enum
    switch (displayFormat) {
    case NativeScriptHashDisplayFormat.BECH32:
    case NativeScriptHashDisplayFormat.POLICY_ID:
        break
    default:
        throw new InvalidData(InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_INVALID_DISPLAY_FORMAT)
    }

    return displayFormat
}

