import type {ParsedAddressParams, Version} from '../types/internal'
import {ensureAddressDerivationSupported} from '../validation/requestCompatibility'
import type {Interaction} from './common/types'
import {isV7App} from '../validation/deviceCapabilities'
import {showAddressV7} from './v7/showAddress'
import {showAddress as showAddressV8} from './v8/showAddress'

export function* showAddress(
  version: Version,
  addressParams: ParsedAddressParams,
): Interaction<void> {
  ensureAddressDerivationSupported(version, addressParams)

  if (isV7App(version)) {
    return yield* showAddressV7(version, addressParams)
  }

  return yield* showAddressV8(version, addressParams)
}
