import {expect} from 'chai'
import {createRequire} from 'module'

const require = createRequire(import.meta.url)
const {
  sendSignOperationalCertificate,
} = require('../../../src/interactions/v8/commandSender')
const {serializeApdu} = require('../../../src/interactions/v8/common/apdu')
const {
  expectedSignOperationalCertificateApduHex,
  parsedOperationalCertificateFixture,
} = require('../__fixtures__/v8/opcert')

describe('v8 commandSender signOperationalCertificate', () => {
  it('yields the same APDU as the Python application_client fixture', () => {
    const interaction = sendSignOperationalCertificate(
      parsedOperationalCertificateFixture,
    )

    const first = interaction.next()
    expect(first.done).to.equal(false)
    expect(serializeApdu(first.value).toString('hex')).to.equal(
      expectedSignOperationalCertificateApduHex,
    )

    const signature = Buffer.alloc(64, 0xbb)
    const done = interaction.next(signature)
    expect(done.done).to.equal(true)
    expect(done.value.equals(signature)).to.equal(true)
  })
})
