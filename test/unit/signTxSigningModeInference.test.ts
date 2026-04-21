import {expect} from 'chai'

import {InvalidData, InvalidDataReason} from '../../src/errors'
import {parseSignTransactionRequest} from '../../src/parsing/transaction'
import {
  AddressType,
  CertificateType,
  CredentialParamsType,
  PoolKeyType,
  PoolOwnerType,
  PoolRewardAccountType,
  type Transaction,
  TransactionSigningMode,
  TxOutputDestinationType,
  type TxOutputAlonzo,
} from '../../src/types/public'

const deviceOwnedOutput: TxOutputAlonzo = {
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
}

const thirdPartyOutput: TxOutputAlonzo = {
  destination: {
    type: TxOutputDestinationType.THIRD_PARTY,
    params: {
      addressHex:
        '82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c2561',
    },
  },
  amount: 1_500_000,
}

const baseTx: Transaction = {
  network: {
    protocolMagic: 42,
    networkId: 0,
  },
  inputs: [
    {
      txHashHex:
        '3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7',
      outputIndex: 0,
      path: null,
    },
  ],
  outputs: [thirdPartyOutput],
  fee: 42,
  ttl: 10,
}

function expectInvalidData(fn: () => unknown, reason: InvalidDataReason): void {
  expect(fn).to.throw(InvalidData).with.property('message', reason)
}

describe('sign tx signing mode inference', () => {
  it('infers ordinary mode from the transaction body', () => {
    const parsed = parseSignTransactionRequest({
      tx: {
        ...baseTx,
        outputs: [deviceOwnedOutput],
      },
    })

    expect(parsed.signingMode).to.equal(
      TransactionSigningMode.ORDINARY_TRANSACTION,
    )
  })

  it('infers multisig mode from transaction credentials', () => {
    const parsed = parseSignTransactionRequest({
      tx: {
        ...baseTx,
        withdrawals: [
          {
            amount: 1,
            stakeCredential: {
              type: CredentialParamsType.SCRIPT_HASH,
              scriptHashHex:
                '01234567890123456789012345678901234567890123456789012345',
            },
          },
        ],
      },
    })

    expect(parsed.signingMode).to.equal(
      TransactionSigningMode.MULTISIG_TRANSACTION,
    )
  })

  it('infers multisig mode from additional witness paths when the body is neutral', () => {
    const parsed = parseSignTransactionRequest({
      tx: baseTx,
      additionalWitnessPaths: [[0x8000073e, 0x80000717, 0x80000000, 0, 0]],
    })

    expect(parsed.signingMode).to.equal(
      TransactionSigningMode.MULTISIG_TRANSACTION,
    )
  })

  it('infers plutus mode from plutus-only fields', () => {
    const parsed = parseSignTransactionRequest({
      tx: {
        ...baseTx,
        scriptDataHashHex:
          '0123456789012345678901234567890123456789012345678901234567890123',
      },
    })

    expect(parsed.signingMode).to.equal(
      TransactionSigningMode.PLUTUS_TRANSACTION,
    )
  })

  it('infers pool owner mode from a single pool registration certificate', () => {
    const parsed = parseSignTransactionRequest({
      tx: {
        ...baseTx,
        certificates: [
          {
            type: CertificateType.STAKE_POOL_REGISTRATION,
            params: {
              poolKey: {
                type: PoolKeyType.THIRD_PARTY,
                params: {
                  keyHashHex:
                    '01234567890123456789012345678901234567890123456789012345',
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
                type: PoolRewardAccountType.THIRD_PARTY,
                params: {
                  rewardAccountHex:
                    'f123456789012345678901234567890123456789012345678901234567',
                },
              },
              poolOwners: [
                {
                  type: PoolOwnerType.DEVICE_OWNED,
                  params: {
                    stakingPath: [0x8000073c, 0x80000717, 0x80000000, 2, 0],
                  },
                },
              ],
              relays: [],
            },
          },
        ],
      },
    })

    expect(parsed.signingMode).to.equal(
      TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
    )
  })

  it('infers pool operator mode from a single pool registration certificate', () => {
    const parsed = parseSignTransactionRequest({
      tx: {
        ...baseTx,
        certificates: [
          {
            type: CertificateType.STAKE_POOL_REGISTRATION,
            params: {
              poolKey: {
                type: PoolKeyType.DEVICE_OWNED,
                params: {
                  path: [0x8000073d, 0x80000717, 0x80000000, 0],
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
                type: PoolRewardAccountType.THIRD_PARTY,
                params: {
                  rewardAccountHex:
                    'f123456789012345678901234567890123456789012345678901234567',
                },
              },
              poolOwners: [],
              relays: [],
            },
          },
        ],
      },
    })

    expect(parsed.signingMode).to.equal(
      TransactionSigningMode.POOL_REGISTRATION_AS_OPERATOR,
    )
  })

  it('throws when the mode cannot be determined automatically', () => {
    expectInvalidData(
      () =>
        parseSignTransactionRequest({
          tx: baseTx,
        }),
      InvalidDataReason.CANNOT_DETERMINE_TX_SIGNING_MODE,
    )
  })

  it('throws when ordinary and multisig witness paths are mixed', () => {
    expectInvalidData(
      () =>
        parseSignTransactionRequest({
          tx: baseTx,
          additionalWitnessPaths: [
            [0x8000073c, 0x80000717, 0x80000000, 0, 0],
            [0x8000073e, 0x80000717, 0x80000000, 0, 0],
          ],
        }),
      InvalidDataReason.CANNOT_DETERMINE_TX_SIGNING_MODE,
    )
  })

  it('throws when body and witness-path inference disagree', () => {
    expectInvalidData(
      () =>
        parseSignTransactionRequest({
          tx: {
            ...baseTx,
            outputs: [deviceOwnedOutput],
          },
          additionalWitnessPaths: [[0x8000073e, 0x80000717, 0x80000000, 0, 0]],
        }),
      InvalidDataReason.CANNOT_DETERMINE_TX_SIGNING_MODE,
    )
  })

  it('does not guess when an explicit mode is provided', () => {
    expectInvalidData(
      () =>
        parseSignTransactionRequest({
          tx: {
            ...baseTx,
            withdrawals: [
              {
                amount: 1,
                stakeCredential: {
                  type: CredentialParamsType.SCRIPT_HASH,
                  scriptHashHex:
                    '01234567890123456789012345678901234567890123456789012345',
                },
              },
            ],
          },
          signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        }),
      InvalidDataReason.SIGN_MODE_ORDINARY__WITHDRAWAL_ONLY_AS_PATH,
    )
  })
})
