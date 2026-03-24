import type {
  ParsedComplexNativeScript,
  ParsedSimpleNativeScript,
  Uint8_t,
  Uint32_t,
} from '../../../types/internal'
import {
  NativeScriptHashDisplayFormat,
  NativeScriptType,
} from '../../../types/internal'
import {
  hex_to_buf,
  path_to_buf,
  uint8_to_buf,
  uint32_to_buf,
  uint64_to_buf,
} from '../../../utils/serialize'

const TYPE_ENCODING = {
  [NativeScriptType.PUBKEY_DEVICE_OWNED]: 0 as Uint8_t,
  [NativeScriptType.PUBKEY_THIRD_PARTY]: 0 as Uint8_t,
  [NativeScriptType.ALL]: 1 as Uint8_t,
  [NativeScriptType.ANY]: 2 as Uint8_t,
  [NativeScriptType.N_OF_K]: 3 as Uint8_t,
  [NativeScriptType.INVALID_BEFORE]: 4 as Uint8_t,
  [NativeScriptType.INVALID_HEREAFTER]: 5 as Uint8_t,
} as const

const CREDENTIAL_ENCODING = {
  KEY_HASH: 1 as Uint8_t,
  KEY_PATH: 2 as Uint8_t,
} as const

const DISPLAY_FORMAT_ENCODING = {
  [NativeScriptHashDisplayFormat.BECH32]: 1 as Uint8_t,
  [NativeScriptHashDisplayFormat.POLICY_ID]: 2 as Uint8_t,
} as const

export function serializeComplexNativeScriptStart(
  script: ParsedComplexNativeScript,
): Buffer {
  if (script.type === NativeScriptType.ALL || script.type === NativeScriptType.ANY) {
    return Buffer.concat([
      uint8_to_buf(TYPE_ENCODING[script.type]),
      uint32_to_buf(script.params.scripts.length as Uint32_t),
    ])
  }

  if (script.type !== NativeScriptType.N_OF_K) {
    throw new Error('Unexpected complex native script type')
  }

  return Buffer.concat([
    uint8_to_buf(TYPE_ENCODING[script.type]),
    uint32_to_buf(script.params.scripts.length as Uint32_t),
    uint32_to_buf(script.params.requiredCount),
  ])
}

export function serializeSimpleNativeScript(
  script: ParsedSimpleNativeScript,
): Buffer {
  switch (script.type) {
    case NativeScriptType.PUBKEY_DEVICE_OWNED:
      return Buffer.concat([
        uint8_to_buf(TYPE_ENCODING[script.type]),
        uint8_to_buf(CREDENTIAL_ENCODING.KEY_PATH),
        path_to_buf(script.params.path),
      ])
    case NativeScriptType.PUBKEY_THIRD_PARTY:
      return Buffer.concat([
        uint8_to_buf(TYPE_ENCODING[script.type]),
        uint8_to_buf(CREDENTIAL_ENCODING.KEY_HASH),
        hex_to_buf(script.params.keyHashHex),
      ])
    case NativeScriptType.INVALID_BEFORE:
    case NativeScriptType.INVALID_HEREAFTER:
      return Buffer.concat([
        uint8_to_buf(TYPE_ENCODING[script.type]),
        uint64_to_buf(script.params.slot),
      ])
    default:
      throw new Error('Unexpected simple native script type')
  }
}

export function serializeWholeNativeScriptFinish(
  displayFormat: NativeScriptHashDisplayFormat,
): Buffer {
  return Buffer.concat([
    uint8_to_buf(DISPLAY_FORMAT_ENCODING[displayFormat]),
  ])
}
