import {DeviceVersionUnsupported} from '../errors'
import {getVersionString} from '../utils'
import type {ParsedAddressParams, Version} from '../types/internal'
import {AddressType} from '../types/public'
import type {DerivedAddress} from '../types/public'
import type {Interaction} from './common/types'
import {
  ensureLedgerAppVersionCompatible,
  getCompatibility,
  isV8App,
} from './getVersion'
import {deriveAddressV7} from './v7/deriveAddress'
import {deriveAddress as deriveAddressV8} from './v8/deriveAddress'

export function ensureAddressDerivationSupportedByAppVersion(
  version: Version,
  addressParams: ParsedAddressParams,
): void {
  ensureLedgerAppVersionCompatible(version)

  if (isV8App(version)) {
    return
  }

  if (
    addressParams.type === AddressType.BYRON &&
    !getCompatibility(version).supportsByronAddressDerivation
  ) {
    throw new DeviceVersionUnsupported(
      `Byron address parameters not supported by Ledger app version ${getVersionString(
        version,
      )}.`,
    )
  }
}

export function* deriveAddress(
  version: Version,
  addressParams: ParsedAddressParams,
): Interaction<DerivedAddress> {
  ensureAddressDerivationSupportedByAppVersion(version, addressParams)
  if (isV8App(version)) {
    return yield* deriveAddressV8(version, addressParams)
  }
  return yield* deriveAddressV7(version, addressParams)
}
