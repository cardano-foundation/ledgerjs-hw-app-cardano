import type {ParsedAddressParams, Version} from '../../types/internal'
import type {Interaction} from '../common/types'
import {sendShowAddress} from './commandSender'

export function* showAddress(
  _version: Version,
  addressParams: ParsedAddressParams,
): Interaction<void> {
  yield* sendShowAddress(addressParams)
}
