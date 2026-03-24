import type {ParsedAddressParams, Version} from '../types/internal'
import type {Interaction} from './common/types'
import {ensureAddressDerivationSupportedByAppVersion} from './deriveAddress'
import {isV8App} from './getVersion'
import {showAddressV7} from './v7/showAddress'
import {showAddress as showAddressV8} from './v8/showAddress'

export function* showAddress(
  version: Version,
  addressParams: ParsedAddressParams,
): Interaction<void> {
  ensureAddressDerivationSupportedByAppVersion(version, addressParams)
  if (isV8App(version)) {
    return yield* showAddressV8(version, addressParams)
  }
  return yield* showAddressV7(version, addressParams)
}
