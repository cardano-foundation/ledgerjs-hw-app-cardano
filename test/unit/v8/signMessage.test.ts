import {expect} from 'chai'
import {createRequire} from 'module'

const nodeRequire = createRequire(__filename)
const {buildSignMessageChunks, buildSignMessageConfirm, buildSignMessageInit} =
  nodeRequire('../../../src/interactions/v8/commandBuilder')
const {serializeApdu} = nodeRequire('../../../src/interactions/v8/common/apdu')
const {sendSignMessage} = nodeRequire(
  '../../../src/interactions/v8/commandSender',
)
const {expectedSignMessageApdusHex, parsedSignMessageFixture} = nodeRequire(
  '../__fixtures__/v8/signMessage',
)

describe('v8 signMessage', () => {
  it('builds the expected APDUs', () => {
    const apdus = [
      buildSignMessageInit(parsedSignMessageFixture),
      ...buildSignMessageChunks(parsedSignMessageFixture),
      buildSignMessageConfirm(),
    ]

    expect(
      apdus.map((apdu: {data: Buffer}) => serializeApdu(apdu).toString('hex')),
    ).to.deep.equal(expectedSignMessageApdusHex)
  })

  it('sends the expected APDU sequence', () => {
    const interaction = sendSignMessage(parsedSignMessageFixture)
    const seen = []

    let cursor = interaction.next()
    while (!cursor.done) {
      seen.push(serializeApdu(cursor.value).toString('hex'))
      cursor = interaction.next(Buffer.alloc(0))
    }

    expect(seen).to.deep.equal(expectedSignMessageApdusHex)
  })
})
