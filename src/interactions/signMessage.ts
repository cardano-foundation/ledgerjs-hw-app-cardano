import {DeviceVersionUnsupported} from '../errors'
import type {ParsedMessageData} from '../types/internal'
import type {SignedMessageData, Version} from '../types/public'
import {getVersionString} from '../utils'
import type {Interaction} from './common/types'
import {getCompatibility, isV8App} from './getVersion'
import {signMessageV7} from './v7/signMessage'
import {signMessage as signMessageV8} from './v8/signMessage'

export function* signMessage(
  version: Version,
  msgData: ParsedMessageData,
): Interaction<SignedMessageData> {
  if (!isV8App(version) && !getCompatibility(version).supportsMessageSigning) {
    throw new DeviceVersionUnsupported(
      `CIP-8 message signing not supported by Ledger app version ${getVersionString(
        version,
      )}.`,
    )
  }

  if (isV8App(version)) {
    return yield* signMessageV8(version, msgData)
  }
  return yield* signMessageV7(version, msgData)
}
