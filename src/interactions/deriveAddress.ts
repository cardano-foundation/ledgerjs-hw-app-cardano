import type {ParsedAddressParams, Version} from '../types/internal'
import type {DerivedAddress} from '../types/public'
import {ensureAddressDerivationSupported} from '../validation/requestCompatibility'
import type {Interaction} from './common/types'
import {isV7App} from '../validation/deviceCapabilities'
import {deriveAddressV7} from './v7/deriveAddress'
import {deriveAddress as deriveAddressV8} from './v8/deriveAddress'

export function* deriveAddress(
  version: Version,
  addressParams: ParsedAddressParams,
): Interaction<DerivedAddress> {
  ensureAddressDerivationSupported(version, addressParams)

  if (isV7App(version)) {
    return yield* deriveAddressV7(version, addressParams)
  }

  return yield* deriveAddressV8(version, addressParams)
}
