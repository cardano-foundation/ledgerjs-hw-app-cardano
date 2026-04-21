import {expect} from 'chai'

import {buildSignOperationalCertificate} from '../../../src/interactions/v8/commandBuilder'
import {serializeApdu} from '../../../src/interactions/v8/common/apdu'
import {
  expectedSignOperationalCertificateApduHex,
  parsedOperationalCertificateFixture,
} from '../__fixtures__/v8/opcert'

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
