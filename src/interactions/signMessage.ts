import type {ParsedMessageData} from '../types/internal'
import type {SignedMessageData, Version} from '../types/public'
import {ensureMessageSigningSupported} from '../validation/requestCompatibility'
import type {Interaction} from './common/types'
import {isV7App} from './getVersion'
import {signMessageV7} from './v7/signMessage'
import {signMessage as signMessageV8} from './v8/signMessage'

export function* signMessage(
  version: Version,
  msgData: ParsedMessageData,
): Interaction<SignedMessageData> {
  ensureMessageSigningSupported(version, msgData)

  if (isV7App(version)) {
    return yield* signMessageV7(version, msgData)
  }

  return yield* signMessageV8(version, msgData)
}
