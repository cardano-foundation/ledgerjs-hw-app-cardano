import {expect} from 'chai'

import {serializeCredential} from '../../../src/interactions/v8/serialization/credential'
import {CredentialType} from '../../../src/types/internal'
import type {ParsedCredential} from '../../../src/types/internal'

describe('v8 serializeCredential', () => {
  it('uses app wire encoding for key path, key hash, and script hash credentials', () => {
    expect(
      serializeCredential({
        type: CredentialType.KEY_PATH,
        path: [1, 2, 3],
      } as ParsedCredential).toString('hex'),
    ).to.equal('0203000000010000000200000003')

    expect(
      serializeCredential({
        type: CredentialType.KEY_HASH,
        keyHashHex: '11'.repeat(28),
      } as ParsedCredential).toString('hex'),
    ).to.equal(`00${'11'.repeat(28)}`)

    expect(
      serializeCredential({
        type: CredentialType.SCRIPT_HASH,
        scriptHashHex: '22'.repeat(28),
      } as ParsedCredential).toString('hex'),
    ).to.equal(`01${'22'.repeat(28)}`)
  })
})
