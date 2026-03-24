import {expect} from 'chai'
import {createRequire} from 'module'

import type {Version} from '../../../src/types/public'
const require = createRequire(import.meta.url)
const {
  signOperationalCertificate,
} = require('../../../src/interactions/signOperationalCertificate')
const {serializeApdu} = require('../../../src/interactions/v8/common/apdu')
const {
  expectedSignOperationalCertificateApduHex,
  parsedOperationalCertificateFixture,
} = require('../__fixtures__/v8/opcert')

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
    expect(first.done).to.equal(false)
    expect(serializeApdu(first.value).toString('hex')).to.equal(
      expectedSignOperationalCertificateApduHex,
    )
  })

  it('uses the v8-compatible path for app 8', () => {
    const interaction = signOperationalCertificate(
      mkVersion(8),
      parsedOperationalCertificateFixture,
    )

    const first = interaction.next()
    expect(first.done).to.equal(false)
    expect(serializeApdu(first.value).toString('hex')).to.equal(
      expectedSignOperationalCertificateApduHex,
    )
  })
})
