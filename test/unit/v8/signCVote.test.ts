import {expect} from 'chai'
import {createRequire} from 'module'

const nodeRequire = createRequire(__filename)
const {buildSignCVoteChunks, buildSignCVoteConfirm, buildSignCVoteInit} =
  nodeRequire('../../../src/interactions/v8/commandBuilder')
const {serializeApdu} = nodeRequire('../../../src/interactions/v8/common/apdu')
const {sendSignCVote} = nodeRequire(
  '../../../src/interactions/v8/commandSender',
)
const {expectedSignCVoteApdusHex, parsedSignCVoteFixture} = nodeRequire(
  '../__fixtures__/v8/signCVote',
)

describe('v8 signCVote', () => {
  it('builds the expected APDUs', () => {
    const apdus = [
      buildSignCVoteInit(parsedSignCVoteFixture),
      ...buildSignCVoteChunks(parsedSignCVoteFixture),
      buildSignCVoteConfirm(parsedSignCVoteFixture),
    ]

    expect(
      apdus.map((apdu: {data: Buffer}) => serializeApdu(apdu).toString('hex')),
    ).to.deep.equal(expectedSignCVoteApdusHex)
  })

  it('sends the expected APDU sequence', () => {
    const interaction = sendSignCVote(parsedSignCVoteFixture)
    const seen = []

    let cursor = interaction.next()
    while (!cursor.done) {
      seen.push(serializeApdu(cursor.value).toString('hex'))
      cursor = interaction.next(Buffer.alloc(0))
    }

    expect(seen).to.deep.equal(expectedSignCVoteApdusHex)
  })
})
