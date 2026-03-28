import {expect} from 'chai'
import {createRequire} from 'module'

const nodeRequire = createRequire(__filename)
const {buildSignOperationalCertificate} = nodeRequire(
  '../../../src/interactions/v8/commandBuilder',
)
const {serializeApdu} = nodeRequire('../../../src/interactions/v8/common/apdu')
const {
  expectedSignOperationalCertificateApduHex,
  parsedOperationalCertificateFixture,
} = nodeRequire('../__fixtures__/v8/opcert')

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
