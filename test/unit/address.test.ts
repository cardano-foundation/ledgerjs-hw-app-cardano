import {expect} from 'chai'

import {InvalidDataReason} from '../../src/errors'
import {bech32_decodeAddress} from '../../src/utils/address'

describe('address utils', () => {
  it('rewraps invalid bech32 decode errors as InvalidData', () => {
    expect(() => bech32_decodeAddress('definitely-not-bech32')).to.throw(
      InvalidDataReason.OUTPUT_INVALID_ADDRESS,
    )
  })

  it('allows callers to override the bech32 decode error reason', () => {
    expect(() =>
      bech32_decodeAddress(
        'definitely-not-bech32',
        InvalidDataReason.ADDRESS_INVALID_REWARD_ADDRESS,
      ),
    ).to.throw(InvalidDataReason.ADDRESS_INVALID_REWARD_ADDRESS)
  })
})
