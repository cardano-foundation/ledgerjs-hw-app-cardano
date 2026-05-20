import {expect} from 'chai'

import {deriveAddress} from '../../src/interactions/deriveAddress'
import {deriveNativeScriptHash} from '../../src/interactions/deriveNativeScriptHash'
import {getExtendedPublicKeys} from '../../src/interactions/getExtendedPublicKeys'
import {showAddress} from '../../src/interactions/showAddress'
import {signCVote} from '../../src/interactions/signCVote'
import {signMessage} from '../../src/interactions/signMessage'
import {signOperationalCertificate} from '../../src/interactions/signOperationalCertificate'
import {signTransaction} from '../../src/interactions/signTx'
import {parseAddress} from '../../src/parsing/address'
import {parseNativeScript} from '../../src/parsing/nativeScript'
import {parseSignTransactionRequest} from '../../src/parsing/transaction'
import {
  AddressType,
  CertificateType,
  NativeScriptHashDisplayFormat,
  NativeScriptType,
  TransactionSigningMode,
  TxOutputDestinationType,
  VoterType,
  VoteOption,
} from '../../src/types/public'
import type {
  Certificate,
  TxInput,
  TxOutputAlonzo,
  Voter,
  Version,
} from '../../src/types/public'
import type {ParsedCertificate} from '../../src/types/internal'
import {parseBIP32Path} from '../../src/utils/parse'
import {DeviceVersionUnsupported, InvalidDataReason} from '../../src/errors'
import {parsedOperationalCertificateFixture} from './__fixtures__/v8/opcert'
import {parsedSignCVoteFixture} from './__fixtures__/v8/signCVote'
import {parsedSignMessageFixture} from './__fixtures__/v8/signMessage'
import {signTxAllElementsCombinedCertificates} from '../integration/__fixtures__/signTxAllElements'

const mkVersion = (major: number, minor = 0, isAppXS = false): Version => ({
  major,
  minor,
  patch: 0,
  flags: {
    isDebug: false,
    isAppXS,
  },
})

const v5 = mkVersion(5)
const v7 = mkVersion(7, 1)
const v7Xs = mkVersion(7, 1, true)
const v7WithoutMessageSigning = mkVersion(7, 0)
const v8 = mkVersion(8)

const byronAddressParams = parseAddress(
  {protocolMagic: 42, networkId: 0},
  {
    type: AddressType.BYRON,
    params: {
      spendingPath: [0x8000002c, 0x80000717, 0x80000000, 0, 0],
    },
  },
)

const parsedNativeScriptFixture = parseNativeScript({
  type: NativeScriptType.PUBKEY_THIRD_PARTY,
  params: {
    keyHashHex: '3a55d9f68255dfbefa1efd711f82d005fae1be2e145d616c90cf0fa9',
  },
})

const baseTx = {
  network: {
    protocolMagic: 42,
    networkId: 0,
  },
  inputs: [
    {
      txHashHex:
        '3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7',
      outputIndex: 0,
      path: [0x8000073c, 0x80000717, 0x80000000, 0, 0],
    },
  ],
  outputs: [
    {
      destination: {
        type: TxOutputDestinationType.DEVICE_OWNED,
        params: {
          type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
          params: {
            spendingPath: [0x8000073c, 0x80000717, 0x80000000, 0, 1],
            stakingPath: [0x8000073c, 0x80000717, 0x80000000, 2, 0],
          },
        },
      },
      amount: 1_500_000,
    } as TxOutputAlonzo,
  ],
  fee: 42,
  ttl: 10,
}

const voter1: Voter = {
  type: VoterType.COMMITTEE_KEY_PATH,
  keyPath: [0x8000073c, 0x80000717, 0x80000000, 5, 0],
}

const voter2: Voter = {
  type: VoterType.DREP_KEY_PATH,
  keyPath: [0x8000073c, 0x80000717, 0x80000000, 3, 0],
}

const vote1 = {
  govActionId: {
    txHashHex:
      '3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7',
    govActionIndex: 3,
  },
  votingProcedure: {
    vote: VoteOption.YES,
    anchor: null,
  },
}

const vote2 = {
  govActionId: {
    txHashHex:
      '3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7',
    govActionIndex: 4,
  },
  votingProcedure: {
    vote: VoteOption.ABSTAIN,
    anchor: null,
  },
}

const multiVoterRequest = parseSignTransactionRequest({
  tx: {
    ...baseTx,
    votingProcedures: [
      {
        voter: voter1,
        votes: [vote1],
      },
      {
        voter: voter2,
        votes: [vote2],
      },
    ],
  },
  signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
})

const multiVotePerVoterRequest = parseSignTransactionRequest({
  tx: {
    ...baseTx,
    votingProcedures: [
      {
        voter: voter1,
        votes: [vote1, vote2],
      },
    ],
  },
  signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
})

const poolOwnerCertificateBase = {
  type: 3,
  params: {
    poolKey: {
      type: 'third_party',
      params: {
        keyHashHex: '01234567890123456789012345678901234567890123456789012345',
      },
    },
    vrfKeyHashHex:
      '0123456789012345678901234567890123456789012345678901234567890123',
    pledge: 0,
    cost: 0,
    margin: {
      numerator: 0,
      denominator: 1,
    },
    rewardAccount: {
      type: 'third_party',
      params: {
        rewardAccountHex:
          'f123456789012345678901234567890123456789012345678901234567',
      },
    },
    poolOwners: [] as unknown[],
    relays: [],
  },
}

const manyPoolOwnersRequest = parseSignTransactionRequest({
  tx: {
    ...baseTx,
    inputs: [
      {
        txHashHex:
          '3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7',
        outputIndex: 0,
      } as TxInput,
    ],
    outputs: [
      {
        destination: {
          type: TxOutputDestinationType.THIRD_PARTY,
          params: {
            addressHex:
              '82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c2561',
          },
        },
        amount: 1_500_000,
      } as TxOutputAlonzo,
    ],
    certificates: [
      {
        ...poolOwnerCertificateBase,
        params: {
          ...poolOwnerCertificateBase.params,
          poolOwners: [
            {
              type: 'device_owned',
              params: {
                stakingPath: [0x8000073c, 0x80000717, 0x80000000, 2, 0],
              },
            },
            ...Array.from({length: 1000}, (_, index) => ({
              type: 'third_party',
              params: {
                stakingKeyHashHex: (index + 1).toString(16).padStart(56, '0'),
              },
            })),
          ],
        },
      } as Certificate,
    ],
  },
  signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
})

const manyAssetGroupsOutput = {
  destination: {
    type: TxOutputDestinationType.THIRD_PARTY,
    params: {
      addressHex:
        '82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c2561',
    },
  },
  amount: 1_500_000,
  tokenBundle: Array.from({length: 1001}, (_, index) => ({
    policyIdHex: index.toString(16).padStart(56, '0'),
    tokens: [
      {
        assetNameHex: '',
        amount: 1,
      },
    ],
  })),
} as TxOutputAlonzo

describe('request compatibility gating', () => {
  it('accepts parsing multiple Conway voters and rejects them only at v7 compatibility time', () => {
    expect(multiVoterRequest.tx.votingProcedures).to.have.length(2)

    const v7Interaction = signTransaction(v7, multiVoterRequest)
    expect(() => v7Interaction.next()).to.throw(DeviceVersionUnsupported)

    const v8Interaction = signTransaction(v8, multiVoterRequest)
    const first = v8Interaction.next()
    expect(first.done).to.equal(false)
  })

  it('accepts parsing multiple votes per voter and rejects them only at v7 compatibility time', () => {
    expect(multiVotePerVoterRequest.tx.votingProcedures).to.have.length(1)
    expect(
      multiVotePerVoterRequest.tx.votingProcedures[0].votes,
    ).to.have.length(2)

    const v7Interaction = signTransaction(v7, multiVotePerVoterRequest)
    expect(() => v7Interaction.next()).to.throw(DeviceVersionUnsupported)

    const v8Interaction = signTransaction(v8, multiVotePerVoterRequest)
    const first = v8Interaction.next()
    expect(first.done).to.equal(false)
  })

  it('accepts parsing more than 1000 pool owners and rejects them only at v7 compatibility time', () => {
    const poolCert = manyPoolOwnersRequest.tx
      .certificates[0] as ParsedCertificate
    if (poolCert.type !== CertificateType.STAKE_POOL_REGISTRATION)
      throw new Error()
    expect(poolCert.pool.owners).to.have.length(1001)

    const v7Interaction = signTransaction(v7, manyPoolOwnersRequest)
    expect(() => v7Interaction.next()).to.throw(DeviceVersionUnsupported)

    const v8Interaction = signTransaction(v8, manyPoolOwnersRequest)
    const first = v8Interaction.next()
    expect(first.done).to.equal(false)
  })

  it('accepts parsing combined certificates and rejects them only at v7 compatibility time', () => {
    const fixture = signTxAllElementsCombinedCertificates[0]
    const request = parseSignTransactionRequest({
      tx: fixture.tx,
      signingMode: fixture.signingMode,
      additionalWitnessPaths: fixture.additionalWitnessPaths,
    })

    expect(request.tx.certificates).to.have.length(16)

    const v7Interaction = signTransaction(v7, request)
    expect(() => v7Interaction.next()).to.throw(DeviceVersionUnsupported)

    const v8Interaction = signTransaction(v8, request)
    const first = v8Interaction.next()
    expect(first.done).to.equal(false)
  })

  it('accepts parsing token bundles with more than 1000 asset groups', () => {
    const parsed = parseSignTransactionRequest({
      tx: {
        ...baseTx,
        outputs: [manyAssetGroupsOutput],
      },
      signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    })

    expect(parsed.tx.outputs[0].tokenBundle).to.have.length(1001)
  })

  it('checks Byron address support before both derive and show dispatch', () => {
    expect(() => deriveAddress(v7Xs, byronAddressParams).next()).to.throw(
      DeviceVersionUnsupported,
    )
    expect(() => showAddress(v7Xs, byronAddressParams).next()).to.throw(
      DeviceVersionUnsupported,
    )

    expect(deriveAddress(v8, byronAddressParams).next().done).to.equal(false)
    expect(showAddress(v8, byronAddressParams).next().done).to.equal(false)
  })

  it('checks native script hash derivation support before dispatch', () => {
    expect(() =>
      deriveNativeScriptHash(
        v7Xs,
        parsedNativeScriptFixture,
        NativeScriptHashDisplayFormat.BECH32,
      ).next(),
    ).to.throw(DeviceVersionUnsupported)

    expect(
      deriveNativeScriptHash(
        v8,
        parsedNativeScriptFixture,
        NativeScriptHashDisplayFormat.BECH32,
      ).next().done,
    ).to.equal(false)
  })

  it('checks operational certificate signing support before dispatch', () => {
    expect(() =>
      signOperationalCertificate(
        v7Xs,
        parsedOperationalCertificateFixture,
      ).next(),
    ).to.throw(DeviceVersionUnsupported)

    expect(
      signOperationalCertificate(v8, parsedOperationalCertificateFixture).next()
        .done,
    ).to.equal(false)
  })

  it('checks CVote signing support before dispatch', () => {
    expect(() => signCVote(v5, parsedSignCVoteFixture).next()).to.throw(
      DeviceVersionUnsupported,
    )

    expect(signCVote(v8, parsedSignCVoteFixture).next().done).to.equal(false)
  })

  it('checks vote-key extended public key support before dispatch', () => {
    const voteKeyPath = parseBIP32Path(
      [1694 + 0x80000000, 1815 + 0x80000000, 0x80000000, 0, 0],
      InvalidDataReason.INVALID_PATH,
    )

    expect(() => getExtendedPublicKeys(v5, [voteKeyPath]).next()).to.throw(
      DeviceVersionUnsupported,
    )

    expect(getExtendedPublicKeys(v8, [voteKeyPath]).next().done).to.equal(false)
  })

  it('checks message signing support before dispatch', () => {
    expect(() =>
      signMessage(v7WithoutMessageSigning, parsedSignMessageFixture).next(),
    ).to.throw(DeviceVersionUnsupported)

    expect(signMessage(v8, parsedSignMessageFixture).next().done).to.equal(
      false,
    )
  })

  it('checks unrestricted transaction mode support before dispatch', () => {
    const unrestrictedRequest = parseSignTransactionRequest({
      tx: baseTx,
      signingMode: TransactionSigningMode.UNRESTRICTED_TRANSACTION,
    })

    expect(() => signTransaction(v7, unrestrictedRequest).next()).to.throw(
      DeviceVersionUnsupported,
    )

    const v8Interaction = signTransaction(v8, unrestrictedRequest)
    const first = v8Interaction.next()
    expect(first.done).to.equal(false)
  })
})
