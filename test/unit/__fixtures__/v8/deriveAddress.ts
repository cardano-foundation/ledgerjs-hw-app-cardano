import type {ParsedAddressParams} from '../../../../src/types/internal'
import {AddressType, SpendingDataSourceType, StakingDataSourceType} from '../../../../src/types/internal'

import {samplePath, samplePathHex} from './common'

export const parsedDeriveAddressFixture = {
  type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
  networkId: 0,
  spendingDataSource: {
    type: SpendingDataSourceType.PATH,
    path: samplePath,
  },
  stakingDataSource: {
    type: StakingDataSourceType.KEY_PATH,
    path: samplePath,
  },
} as ParsedAddressParams

const dataHex = `0000${samplePathHex}22${samplePathHex}`

export const expectedDeriveAddressReturnApduHex = `d71101002d${dataHex}`
export const expectedDeriveAddressDisplayApduHex = `d71102002d${dataHex}`
