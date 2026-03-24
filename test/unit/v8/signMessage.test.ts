import {expect} from 'chai'
import {createRequire} from 'module'

const require = createRequire(import.meta.url)
const {
  buildSignMessageChunks,
  buildSignMessageConfirm,
  buildSignMessageInit,
} = require('../../../src/interactions/v8/commandBuilder')
const {serializeApdu} = require('../../../src/interactions/v8/common/apdu')
const {sendSignMessage} = require('../../../src/interactions/v8/commandSender')
const {
  expectedSignMessageApdusHex,
  parsedSignMessageFixture,
} = require('../__fixtures__/v8/signMessage')

describe('v8 signMessage', () => {
  it('builds the expected APDUs', () => {
    const apdus = [
      buildSignMessageInit(parsedSignMessageFixture),
      ...buildSignMessageChunks(parsedSignMessageFixture),
      buildSignMessageConfirm(),
    ]

    expect(apdus.map((apdu: {data: Buffer}) => serializeApdu(apdu).toString('hex'))).to.deep.equal(
      expectedSignMessageApdusHex,
    )
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
