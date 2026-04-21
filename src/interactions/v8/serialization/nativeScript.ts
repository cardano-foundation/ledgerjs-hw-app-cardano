import type {
  ParsedComplexNativeScript,
  ParsedSimpleNativeScript,
  Uint8_t,
  Uint32_t,
} from '../../../types/internal'
import {
  CredentialType,
  NativeScriptHashDisplayFormat,
  NativeScriptType,
} from '../../../types/internal'
import {unreachable} from '../../../utils/assert'
import {
  uint8_to_buf,
  uint32_to_buf,
  uint64_to_buf,
} from '../../../utils/serialize'
import {serializeCredential} from './credential'
import {NativeScriptHashDisplayFormatWire} from './wireTypes'

// deriveNativeScriptHash_types.h: native_script_type_t
const enum NativeScriptTypeWire {
  PUBKEY = 0,
  ALL = 1,
  ANY = 2,
  N_OF_K = 3,
  INVALID_BEFORE = 4,
  INVALID_HEREAFTER = 5,
}

const TYPE_ENCODING = {
  [NativeScriptType.PUBKEY_DEVICE_OWNED]:
    NativeScriptTypeWire.PUBKEY as Uint8_t,
  [NativeScriptType.PUBKEY_THIRD_PARTY]: NativeScriptTypeWire.PUBKEY as Uint8_t,
  [NativeScriptType.ALL]: NativeScriptTypeWire.ALL as Uint8_t,
  [NativeScriptType.ANY]: NativeScriptTypeWire.ANY as Uint8_t,
  [NativeScriptType.N_OF_K]: NativeScriptTypeWire.N_OF_K as Uint8_t,
  [NativeScriptType.INVALID_BEFORE]:
    NativeScriptTypeWire.INVALID_BEFORE as Uint8_t,
  [NativeScriptType.INVALID_HEREAFTER]:
    NativeScriptTypeWire.INVALID_HEREAFTER as Uint8_t,
} as const

const DISPLAY_FORMAT_ENCODING = {
  [NativeScriptHashDisplayFormat.BECH32]:
    NativeScriptHashDisplayFormatWire.BECH32 as Uint8_t,
  [NativeScriptHashDisplayFormat.POLICY_ID]:
    NativeScriptHashDisplayFormatWire.POLICY_ID as Uint8_t,
} as const

export function serializeComplexNativeScriptStart(
  script: ParsedComplexNativeScript,
): Buffer {
  if (
    script.type === NativeScriptType.ALL ||
    script.type === NativeScriptType.ANY
  ) {
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
        serializeCredential({
          type: CredentialType.KEY_PATH,
          path: script.params.path,
        }),
      ])
    case NativeScriptType.PUBKEY_THIRD_PARTY:
      return Buffer.concat([
        uint8_to_buf(TYPE_ENCODING[script.type]),
        serializeCredential({
          type: CredentialType.KEY_HASH,
          keyHashHex: script.params.keyHashHex,
        }),
      ])
    case NativeScriptType.INVALID_BEFORE:
    case NativeScriptType.INVALID_HEREAFTER:
      return Buffer.concat([
        uint8_to_buf(TYPE_ENCODING[script.type]),
        uint64_to_buf(script.params.slot),
      ])
    default:
      unreachable(script)
  }
}

export function serializeWholeNativeScriptFinish(
  displayFormat: NativeScriptHashDisplayFormat,
): Buffer {
  return Buffer.concat([uint8_to_buf(DISPLAY_FORMAT_ENCODING[displayFormat])])
}
