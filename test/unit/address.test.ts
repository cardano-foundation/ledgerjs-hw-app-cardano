import {expect} from 'chai'
import {createRequire} from 'module'

const nodeRequire = createRequire(__filename)
const {bech32_decodeAddress} = nodeRequire('../../src/utils/address')
const {InvalidDataReason} = nodeRequire('../../src/errors')

describe('address utils', () => {
  it('rewraps invalid bech32 decode errors as InvalidData', () => {
    expect(() => bech32_decodeAddress('definitely-not-bech32')).to.throw(
      InvalidDataReason.OUTPUT_INVALID_ADDRESS,
    )
  })
})
