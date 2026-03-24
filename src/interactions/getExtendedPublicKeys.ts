import {DeviceVersionUnsupported} from '../errors'
import type {ValidBIP32Path, Version} from '../types/internal'
import type {ExtendedPublicKey} from '../types/public'
import {HARDENED} from '../types/public'
import {getVersionString} from '../utils'
import type {Interaction} from './common/types'
import {
  ensureLedgerAppVersionCompatible,
  getCompatibility,
  isV8App,
} from './getVersion'
import {getExtendedPublicKeysV7} from './v7/getExtendedPublicKeys'
import {getExtendedPublicKeys as getExtendedPublicKeysV8} from './v8/getExtendedPublicKeys'

function ensureLedgerAppVersionCompatibleForPaths(
  version: Version,
  paths: Array<ValidBIP32Path>,
): void {
  const voteKeysPresent = paths.some((path) => path[0] === 1694 + HARDENED)
  if (voteKeysPresent && !getCompatibility(version).supportsCIP36Vote) {
    throw new DeviceVersionUnsupported(
      `CIP36 vote keys not supported by Ledger app version ${getVersionString(
        version,
      )}.`,
    )
  }
}

export function* getExtendedPublicKeys(
  version: Version,
  paths: Array<ValidBIP32Path>,
): Interaction<Array<ExtendedPublicKey>> {
  ensureLedgerAppVersionCompatible(version)
  ensureLedgerAppVersionCompatibleForPaths(version, paths)
  if (isV8App(version)) {
    return yield* getExtendedPublicKeysV8(version, paths)
  }
  return yield* getExtendedPublicKeysV7(version, paths)
}
