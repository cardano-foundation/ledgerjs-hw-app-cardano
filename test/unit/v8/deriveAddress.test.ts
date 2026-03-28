import {expect} from 'chai'
import {createRequire} from 'module'

const nodeRequire = createRequire(__filename)
const {buildDeriveAddress, V8AddressP1} = nodeRequire(
  '../../../src/interactions/v8/commandBuilder',
)
const {serializeApdu} = nodeRequire('../../../src/interactions/v8/common/apdu')
const {sendDeriveAddress, sendShowAddress} = nodeRequire(
  '../../../src/interactions/v8/commandSender',
)
const {
  expectedDeriveAddressDisplayApduHex,
  expectedDeriveAddressReturnApduHex,
  parsedDeriveAddressFixture,
} = nodeRequire('../__fixtures__/v8/deriveAddress')

describe('v8 deriveAddress', () => {
  it('builds the return APDU', () => {
    const apdu = buildDeriveAddress(
      V8AddressP1.RETURN,
      parsedDeriveAddressFixture,
    )
    expect(serializeApdu(apdu).toString('hex')).to.equal(
      expectedDeriveAddressReturnApduHex,
    )
  })

  it('builds the display APDU', () => {
    const apdu = buildDeriveAddress(
      V8AddressP1.DISPLAY,
      parsedDeriveAddressFixture,
    )
    expect(serializeApdu(apdu).toString('hex')).to.equal(
      expectedDeriveAddressDisplayApduHex,
    )
  })

  it('sends the return APDU in the derive flow', () => {
    const interaction = sendDeriveAddress(parsedDeriveAddressFixture)
    const first = interaction.next()
    expect(first.done).to.equal(false)
    expect(serializeApdu(first.value).toString('hex')).to.equal(
      expectedDeriveAddressReturnApduHex,
    )
  })

  it('sends the display APDU in the show flow', () => {
    const interaction = sendShowAddress(parsedDeriveAddressFixture)
    const first = interaction.next()
    expect(first.done).to.equal(false)
    expect(serializeApdu(first.value).toString('hex')).to.equal(
      expectedDeriveAddressDisplayApduHex,
    )
  })
})
