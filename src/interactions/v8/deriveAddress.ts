import type {ParsedAddressParams, Version} from '../../types/internal'
import type {DerivedAddress} from '../../types/public'
import type {Interaction} from '../common/types'
import {sendDeriveAddress} from './commandSender'

export function* deriveAddress(
  _version: Version,
  addressParams: ParsedAddressParams,
): Interaction<DerivedAddress> {
  const response = yield* sendDeriveAddress(addressParams)
  return {
    addressHex: response.toString('hex'),
  }
}
