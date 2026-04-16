import {expect} from 'chai'
import {createRequire} from 'module'

const nodeRequire = createRequire(__filename)
const {buildSignMessageChunks, buildSignMessageConfirm, buildSignMessageInit} =
  nodeRequire('../../../src/interactions/v8/commandBuilder')
const {serializeApdu} = nodeRequire('../../../src/interactions/v8/common/apdu')
const {sendSignMessage} = nodeRequire(
  '../../../src/interactions/v8/commandSender',
)
const {signMessage} = nodeRequire('../../../src/interactions/v8/signMessage')
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

  it('parses a valid variable-length confirm response', () => {
    const interaction = signMessage(
      {major: 8, minor: 0, patch: 0, flags: {isDebug: false, isAppXS: false}},
      parsedSignMessageFixture,
    )

    let cursor = interaction.next()
    while (!cursor.done) {
      const response =
        serializeApdu(cursor.value).toString('hex') ===
        expectedSignMessageApdusHex[expectedSignMessageApdusHex.length - 1]
          ? Buffer.concat([
              Buffer.alloc(64, 0x11),
              Buffer.alloc(32, 0x22),
              Buffer.from([0x00, 0x00, 0x00, 0x1c]),
              Buffer.alloc(28, 0x33),
            ])
          : Buffer.alloc(0)
      cursor = interaction.next(response)
    }

    expect(cursor.value).to.deep.equal({
      signatureHex: '11'.repeat(64),
      signingPublicKeyHex: '22'.repeat(32),
      addressFieldHex: '33'.repeat(28),
    })
  })

  it('rejects truncated confirm responses', () => {
    const interaction = signMessage(
      {major: 8, minor: 0, patch: 0, flags: {isDebug: false, isAppXS: false}},
      parsedSignMessageFixture,
    )

    let cursor = interaction.next()
    while (!cursor.done) {
      if (
        serializeApdu(cursor.value).toString('hex') ===
        expectedSignMessageApdusHex[expectedSignMessageApdusHex.length - 1]
      ) {
        expect(() =>
          interaction.next(
            Buffer.concat([
              Buffer.alloc(64, 0x11),
              Buffer.alloc(32, 0x22),
              Buffer.from([0x00, 0x00, 0x00, 0x1c]),
              Buffer.alloc(27, 0x33),
            ]),
          ),
        ).to.throw('invalid v8 signMessage response length')
        return
      }
      cursor = interaction.next(Buffer.alloc(0))
    }

    expect.fail('expected confirm APDU')
  })
})
