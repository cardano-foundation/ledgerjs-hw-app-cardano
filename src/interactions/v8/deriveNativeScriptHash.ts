import type {ParsedNativeScript} from '../../types/internal'
import type {
  NativeScriptHash,
  NativeScriptHashDisplayFormat,
  Version,
} from '../../types/public'
import type {Interaction} from '../common/types'
import {sendDeriveNativeScriptHash} from './commandSender'

export function* deriveNativeScriptHash(
  _version: Version,
  script: ParsedNativeScript,
  displayFormat: NativeScriptHashDisplayFormat,
): Interaction<NativeScriptHash> {
  const response = yield* sendDeriveNativeScriptHash(script, displayFormat)

  return {
    scriptHashHex: response.toString('hex'),
  }
}
