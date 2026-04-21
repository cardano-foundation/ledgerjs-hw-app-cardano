import {expect} from 'chai'

import {signOperationalCertificate} from '../../../src/interactions/signOperationalCertificate'
import {serializeApdu} from '../../../src/interactions/v8/common/apdu'
import type {Version} from '../../../src/types/public'
import {yieldValue} from '../../test_utils'
import {
  expectedSignOperationalCertificateApduHex,
  parsedOperationalCertificateFixture,
} from '../__fixtures__/v8/opcert'

const mkVersion = (major: number): Version => ({
  major,
  minor: 0,
  patch: 0,
  flags: {
    isDebug: false,
    isAppXS: false,
  },
})

describe('signOperationalCertificate dispatch', () => {
  it('uses the v7-compatible path for app 7', () => {
    const interaction = signOperationalCertificate(
      mkVersion(7),
      parsedOperationalCertificateFixture,
    )

    const first = interaction.next()
    expect(serializeApdu(yieldValue(first)).toString('hex')).to.equal(
      expectedSignOperationalCertificateApduHex,
    )
  })

  it('uses the v8-compatible path for app 8', () => {
    const interaction = signOperationalCertificate(
      mkVersion(8),
      parsedOperationalCertificateFixture,
    )

    const first = interaction.next()
    expect(serializeApdu(yieldValue(first)).toString('hex')).to.equal(
      expectedSignOperationalCertificateApduHex,
    )
  })
})
