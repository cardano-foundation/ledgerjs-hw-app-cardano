import {expect} from 'chai'

import {InvalidDataReason} from '../../src/errors'
import {parseCVote} from '../../src/parsing/cVote'
import {parseNativeScript} from '../../src/parsing/nativeScript'
import {parsePoolParams} from '../../src/parsing/poolRegistration'
import type {NativeScript, PoolRegistrationParams} from '../../src/types/public'
import {
  NativeScriptType,
  PoolKeyType,
  PoolOwnerType,
  PoolRewardAccountType,
  RelayType,
} from '../../src/types/public'
import {assert} from '../../src/utils/assert'
import {str_to_path} from '../../src/utils/address'
import {isUintStr, parseInt64_str, parseUint64_str} from '../../src/utils/parse'
import {int64_to_buf, uint64_to_buf} from '../../src/utils/serialize'

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

const basePoolRegistrationParams: PoolRegistrationParams = {
  poolKey: {
    type: PoolKeyType.THIRD_PARTY,
    params: {
      keyHashHex: 'f61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb4973',
    },
  },
  vrfKeyHashHex:
    '9d0f0f8a8c8f8e31a62a356f085676d42a0352f6b66df2e7f4ea8b6f2b1d87a3',
  pledge: '1000',
  cost: '500',
  margin: {
    numerator: '1',
    denominator: '2',
  },
  rewardAccount: {
    type: PoolRewardAccountType.THIRD_PARTY,
    params: {
      rewardAccountHex:
        'e1794d9b3408c9fb67b950a48a0690f070f117e9978f7fc1d120fc58ad',
    },
  },
  poolOwners: [
    {
      type: PoolOwnerType.THIRD_PARTY,
      params: {
        stakingKeyHashHex:
          '12d6c2f8c8a3b1745a65ec0c8b9d7c8e1df6a1d31c9f1e55cb0c7a11',
      },
    },
  ],
  relays: [
    {
      type: RelayType.SINGLE_HOST_IP_ADDR,
      params: {
        portNumber: 3000,
        ipv4: null,
        ipv6: '2001:db8::1',
      },
    },
  ],
  metadata: null,
}

describe('basicParseTest', () => {
  for (const {signed, numberString} of basicParseTests) {
    // eslint-disable-next-line no-console
    console.log(`parsing ${numberString} (${signed ? 'signed' : 'unsigned'})`)
    const bufferRep = Buffer.alloc(8)
    if (signed) {
      bufferRep.writeBigInt64BE(BigInt(numberString), 0)
    } else {
      bufferRep.writeBigUInt64BE(BigInt(numberString), 0)
    }

    assert(bufferRep.length === 8, 'invalid binary length')

    const serialized = signed
      ? int64_to_buf(
          parseInt64_str(
            numberString,
            {},
            InvalidDataReason.INPUT_INVALID_TX_HASH,
          ),
        )
      : uint64_to_buf(
          parseUint64_str(
            numberString,
            {},
            InvalidDataReason.INPUT_INVALID_TX_HASH,
          ),
        )
    expect(serialized.equals(bufferRep)).to.equal(true)
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
    let script: NativeScript = {
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

  it('accepts compressed IPv6 relay addresses', () => {
    const parsed = parsePoolParams(basePoolRegistrationParams)
    expect(parsed.relays[0].type).to.equal(RelayType.SINGLE_HOST_IP_ADDR)
    if (parsed.relays[0].type !== RelayType.SINGLE_HOST_IP_ADDR) {
      throw new Error('expected single-host IP relay')
    }
    expect(parsed.relays[0].ipv6?.toString('hex')).to.equal(
      '20010db8000000000000000000000001',
    )
  })

  it('accepts special compressed IPv6 relay forms', () => {
    const loopback = parsePoolParams({
      ...basePoolRegistrationParams,
      relays: [
        {
          type: RelayType.SINGLE_HOST_IP_ADDR,
          params: {
            portNumber: 3000,
            ipv4: null,
            ipv6: '::1',
          },
        },
      ],
    })

    const mappedIpv4 = parsePoolParams({
      ...basePoolRegistrationParams,
      relays: [
        {
          type: RelayType.SINGLE_HOST_IP_ADDR,
          params: {
            portNumber: 3000,
            ipv4: null,
            ipv6: '::ffff:192.168.0.1',
          },
        },
      ],
    })

    if (loopback.relays[0].type !== RelayType.SINGLE_HOST_IP_ADDR) {
      throw new Error('expected single-host IP relay')
    }
    if (mappedIpv4.relays[0].type !== RelayType.SINGLE_HOST_IP_ADDR) {
      throw new Error('expected single-host IP relay')
    }

    expect(loopback.relays[0].ipv6?.toString('hex')).to.equal(
      '00000000000000000000000000000001',
    )
    expect(mappedIpv4.relays[0].ipv6?.toString('hex')).to.equal(
      '00000000000000000000ffffc0a80001',
    )
  })

  it('rejects malformed IPv6 relay addresses', () => {
    const invalidIpv6Addresses = [
      '2001::db8::1',
      '2001:db8:1',
      '2001:db8:::1',
      '2001:db8::gggg',
      '2001:db8::192.168.0.1:1',
    ]

    for (const ipv6 of invalidIpv6Addresses) {
      expect(() =>
        parsePoolParams({
          ...basePoolRegistrationParams,
          relays: [
            {
              type: RelayType.SINGLE_HOST_IP_ADDR,
              params: {
                portNumber: 3000,
                ipv4: null,
                ipv6,
              },
            },
          ],
        }),
      ).to.throw(InvalidDataReason.RELAY_INVALID_IPV6)
    }
  })
})
