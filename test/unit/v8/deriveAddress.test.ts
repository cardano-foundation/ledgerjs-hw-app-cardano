import {expect} from 'chai'

import {
  buildDeriveAddressDisplay,
  buildDeriveAddressReturn,
} from '../../../src/interactions/v8/commandBuilder'
import {serializeApdu} from '../../../src/interactions/v8/common/apdu'
import {
  sendDeriveAddress,
  sendShowAddress,
} from '../../../src/interactions/v8/commandSender'
import {yieldValue} from '../../test_utils'
import {
  expectedDeriveAddressDisplayApduHex,
  expectedDeriveAddressReturnApduHex,
  parsedDeriveAddressFixture,
} from '../__fixtures__/v8/deriveAddress'

describe('v8 deriveAddress', () => {
  it('builds the return APDU', () => {
    const apdu = buildDeriveAddressReturn(parsedDeriveAddressFixture)
    expect(serializeApdu(apdu).toString('hex')).to.equal(
      expectedDeriveAddressReturnApduHex,
    )
  })

  it('builds the display APDU', () => {
    const apdu = buildDeriveAddressDisplay(parsedDeriveAddressFixture)
    expect(serializeApdu(apdu).toString('hex')).to.equal(
      expectedDeriveAddressDisplayApduHex,
    )
  })

  it('sends the return APDU in the derive flow', () => {
    const interaction = sendDeriveAddress(parsedDeriveAddressFixture)
    const first = interaction.next()
    expect(serializeApdu(yieldValue(first)).toString('hex')).to.equal(
      expectedDeriveAddressReturnApduHex,
    )
  })

  it('sends the display APDU in the show flow', () => {
    const interaction = sendShowAddress(parsedDeriveAddressFixture)
    const first = interaction.next()
    expect(serializeApdu(yieldValue(first)).toString('hex')).to.equal(
      expectedDeriveAddressDisplayApduHex,
    )
  })
})
