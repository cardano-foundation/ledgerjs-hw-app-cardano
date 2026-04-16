import {expect} from 'chai'
import {Int64BE, Uint64BE} from 'int64-buffer'

import {InvalidDataReason} from '../../src/errors'
import {parseCVote} from '../../src/parsing/cVote'
import {parseNativeScript} from '../../src/parsing/nativeScript'
import {NativeScriptType} from '../../src/types/public'
import {assert} from '../../src/utils/assert'
import {str_to_path} from '../../src/utils/address'
import {isUintStr, parseInt64_str, parseUint64_str} from '../../src/utils/parse'

type BasicParseTest = {
  signed: boolean
  numberString: string
}

const basicParseTests: BasicParseTest[] = [
  {
    signed: true,
    numberString: '-123456',
  },
  {
    signed: true,
    numberString: '9223372036854775807',
  },
  {
    signed: true,
    numberString: '0',
  },
  {
    signed: true,
    numberString: '-9223372036854775808',
  },
  {
    signed: false,
    numberString: '0',
  },
  {
    signed: false,
    numberString: '9223372036854775807',
  },
  {
    signed: false,
    numberString: '18446744073709551615',
  },
]

describe('basicParseTest', () => {
  for (const {signed, numberString} of basicParseTests) {
    // eslint-disable-next-line no-console
    console.log(`parsing ${numberString} (${signed ? 'signed' : 'unsigned'})`)
    const objectRepresentation = signed
      ? new Int64BE(numberString, 10)
      : new Uint64BE(numberString, 10)
    const bufferRep = objectRepresentation.toBuffer()

    assert(bufferRep.length === 8, 'invalid binary length')

    expect(objectRepresentation.toString()).to.equal(numberString)
  }
})

describe('advancedParseTest', () => {
  it('parse int64 correctly', () => {
    const nmb = '1235543'
    const result = parseInt64_str(
      nmb,
      {},
      InvalidDataReason.INPUT_INVALID_TX_HASH,
    )
    expect(result).to.equal('1235543')
  })

  it('parse negative int64 correctly', () => {
    const nmb = '-123456'
    const result = parseInt64_str(
      nmb,
      {},
      InvalidDataReason.INPUT_INVALID_TX_HASH,
    )
    expect(result).to.equal('-123456')
  })

  it('throw error when trying to parse negative number as Uint', () => {
    const nmb = '-123456'
    // let result = parseUint64_str(nmb, {}, InvalidDataReason.INPUT_INVALID_TX_HASH)
    expect(() =>
      parseUint64_str(nmb, {}, InvalidDataReason.INPUT_INVALID_TX_HASH),
    ).to.throw(InvalidDataReason.INPUT_INVALID_TX_HASH)
  })

  it('rejects whitespace in bip32 path strings', () => {
    expect(() => str_to_path("1852'/1815'/0' /0/0")).to.throw(
      InvalidDataReason.INVALID_PATH,
    )
    expect(() => str_to_path("1852'/1815'/0'/0/0 ")).to.throw(
      InvalidDataReason.INVALID_PATH,
    )
    expect(() => str_to_path(" 1852'/1815'/0'/0/0")).to.throw(
      InvalidDataReason.INVALID_PATH,
    )
  })

  it('rejects native scripts deeper than the app limit', () => {
    let script = {
      type: NativeScriptType.PUBKEY_THIRD_PARTY,
      params: {
        keyHashHex: '3a55d9f68255dfbefa1efd711f82d005fae1be2e145d616c90cf0fa9',
      },
    }

    for (let i = 0; i < 11; i++) {
      script = {
        type: NativeScriptType.ALL,
        params: {scripts: [script]},
      }
    }

    expect(() => parseNativeScript(script)).to.throw(
      InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_DEPTH_LIMIT_EXCEEDED,
    )
  })

  it('rejects CIP36 votecast payloads shorter than the app minimum', () => {
    expect(() =>
      parseCVote({
        voteCastDataHex: 'aa'.repeat(33),
        witnessPath: [0x80000000, 0x80000000, 0x80000000, 0, 0],
      }),
    ).to.throw(InvalidDataReason.CVOTE_INVALID_VOTECAST_DATA)
  })

  it('accepts canonical uint strings and rejects non-canonical ones', () => {
    expect(isUintStr('0', {})).to.equal(true)
    expect(isUintStr('7', {})).to.equal(true)
    expect(isUintStr('42', {})).to.equal(true)

    expect(isUintStr('', {})).to.equal(false)
    expect(isUintStr('00', {})).to.equal(false)
    expect(isUintStr('007', {})).to.equal(false)
    expect(isUintStr('+7', {})).to.equal(false)
    expect(isUintStr(' 7', {})).to.equal(false)
    expect(isUintStr('7 ', {})).to.equal(false)
  })
})
