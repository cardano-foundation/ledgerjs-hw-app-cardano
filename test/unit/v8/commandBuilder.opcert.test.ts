import {expect} from 'chai'
import {createRequire} from 'module'

const require = createRequire(import.meta.url)
const {
  buildSignOperationalCertificate,
} = require('../../../src/interactions/v8/commandBuilder')
const {serializeApdu} = require('../../../src/interactions/v8/common/apdu')
const {
  expectedSignOperationalCertificateApduHex,
  parsedOperationalCertificateFixture,
} = require('../__fixtures__/v8/opcert')

describe('v8 commandBuilder signOperationalCertificate', () => {
  it('builds the same APDU as the Python application_client fixture', () => {
    const apdu = buildSignOperationalCertificate(
      parsedOperationalCertificateFixture,
    )

    expect(serializeApdu(apdu).toString('hex')).to.equal(
      expectedSignOperationalCertificateApduHex,
    )
  })
})
