import type {ValidBIP32Path, Version} from '../types/internal'
import type {ExtendedPublicKey} from '../types/public'
import {ensureExtendedPublicKeysSupported} from '../validation/requestCompatibility'
import type {Interaction} from './common/types'
import {isV7App} from '../validation/deviceCapabilities'
import {getExtendedPublicKeysV7} from './v7/getExtendedPublicKeys'
import {getExtendedPublicKeys as getExtendedPublicKeysV8} from './v8/getExtendedPublicKeys'

export function* getExtendedPublicKeys(
  version: Version,
  paths: Array<ValidBIP32Path>,
): Interaction<Array<ExtendedPublicKey>> {
  ensureExtendedPublicKeysSupported(version, paths)

  if (isV7App(version)) {
    return yield* getExtendedPublicKeysV7(version, paths)
  }

  return yield* getExtendedPublicKeysV8(version, paths)
}
