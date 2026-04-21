import type {ParsedNativeScript} from '../types/internal'
import type {
  NativeScriptHash,
  NativeScriptHashDisplayFormat,
  Version,
} from '../types/public'
import {ensureNativeScriptHashDerivationSupported} from '../validation/requestCompatibility'
import type {Interaction} from './common/types'
import {isV7App} from '../validation/deviceCapabilities'
import {deriveNativeScriptHash as deriveNativeScriptHashV7} from './v7/deriveNativeScriptHash'
import {deriveNativeScriptHash as deriveNativeScriptHashV8} from './v8/deriveNativeScriptHash'

export function* deriveNativeScriptHash(
  version: Version,
  script: ParsedNativeScript,
  displayFormat: NativeScriptHashDisplayFormat,
): Interaction<NativeScriptHash> {
  ensureNativeScriptHashDerivationSupported(version, script)

  if (isV7App(version)) {
    return yield* deriveNativeScriptHashV7(script, displayFormat)
  }

  return yield* deriveNativeScriptHashV8(version, script, displayFormat)
}
