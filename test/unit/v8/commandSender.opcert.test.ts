import {expect} from 'chai'

import {serializeApdu} from '../../../src/interactions/v8/common/apdu'
import {sendSignOperationalCertificate} from '../../../src/interactions/v8/commandSender'
import {yieldValue} from '../../test_utils'
import {
  expectedSignOperationalCertificateApduHex,
  parsedOperationalCertificateFixture,
} from '../__fixtures__/v8/opcert'

describe('v8 commandSender signOperationalCertificate', () => {
  it('yields the same APDU as the Python application_client fixture', () => {
    const interaction = sendSignOperationalCertificate(
      parsedOperationalCertificateFixture,
    )

    const first = interaction.next()
    expect(serializeApdu(yieldValue(first)).toString('hex')).to.equal(
      expectedSignOperationalCertificateApduHex,
    )

    const signature = Buffer.alloc(64, 0xbb)
    const done = interaction.next(signature)
    if (!done.done) throw new Error('expected generator to be done')
    expect(done.value.equals(signature)).to.equal(true)
  })
})
