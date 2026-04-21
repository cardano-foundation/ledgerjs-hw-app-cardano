import {expect} from 'chai'

import {
  buildSignCVoteChunks,
  buildSignCVoteConfirm,
  buildSignCVoteInit,
} from '../../../src/interactions/v8/commandBuilder'
import {serializeApdu} from '../../../src/interactions/v8/common/apdu'
import {sendSignCVote} from '../../../src/interactions/v8/commandSender'
import {yieldValue} from '../../test_utils'
import {
  expectedSignCVoteApdusHex,
  parsedSignCVoteFixture,
} from '../__fixtures__/v8/signCVote'

describe('v8 signCVote', () => {
  it('builds the expected APDUs', () => {
    const apdus = [
      buildSignCVoteInit(parsedSignCVoteFixture),
      ...buildSignCVoteChunks(parsedSignCVoteFixture),
      buildSignCVoteConfirm(parsedSignCVoteFixture),
    ]

    expect(
      apdus.map((apdu) => serializeApdu(apdu).toString('hex')),
    ).to.deep.equal(expectedSignCVoteApdusHex)
  })

  it('sends the expected APDU sequence', () => {
    const interaction = sendSignCVote(parsedSignCVoteFixture)
    const seen = []

    let cursor = interaction.next()
    while (!cursor.done) {
      seen.push(serializeApdu(yieldValue(cursor)).toString('hex'))
      cursor = interaction.next(Buffer.alloc(0))
    }

    expect(seen).to.deep.equal(expectedSignCVoteApdusHex)
  })
})
