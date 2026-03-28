/* eslint-disable @typescript-eslint/no-require-imports -- fixture literals are not branded types */
const {expect} = require('chai')

const {
  serializeCredential,
} = require('../../../src/interactions/v8/serialization/credential')

const CredentialType = {
  KEY_PATH: 0,
  SCRIPT_HASH: 1,
  KEY_HASH: 2,
} as const

describe('v8 serializeCredential', () => {
  it('uses app wire encoding for key path, key hash, and script hash credentials', () => {
    expect(
      serializeCredential({
        type: CredentialType.KEY_PATH,
        path: [1, 2, 3],
      }).toString('hex'),
    ).to.equal('0203000000010000000200000003')

    expect(
      serializeCredential({
        type: CredentialType.KEY_HASH,
        keyHashHex: '11'.repeat(28),
      }).toString('hex'),
    ).to.equal(`00${'11'.repeat(28)}`)

    expect(
      serializeCredential({
        type: CredentialType.SCRIPT_HASH,
        scriptHashHex: '22'.repeat(28),
      }).toString('hex'),
    ).to.equal(`01${'22'.repeat(28)}`)
  })
})
