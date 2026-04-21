import {expect} from 'chai'

import {InvalidDataReason, Networks} from '../../src/Ada'
import {parseTransaction} from '../../src/parsing/transaction'
import {parseAnchor, parseCredential} from '../../src/utils/parse'
import {
  CredentialParamsType,
  VoterType,
  VoteOption,
} from '../../src/types/public'
import type {AnchorParams, CredentialParams, Transaction} from '../../src/types/public'

const VALID_TX_HASH =
  '3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7'
const VALID_KEY_HASH = 'a700088326a60dfcfb63bc7a90a3078c4594e9a062b6a69e6b67c190'
const VALID_PATH = [0x80000000 + 1852, 0x80000000 + 1815, 0x80000000 + 0, 0, 0]

const baseTx: Transaction = {
  network: Networks.Mainnet,
  inputs: [{txHashHex: VALID_TX_HASH, outputIndex: 0, path: null}],
  outputs: [],
  fee: '42',
  ttl: null,
}

const baseVoterVotes = {
  voter: {
    type: VoterType.DREP_KEY_PATH as const,
    keyPath: VALID_PATH,
  },
  votes: [
    {
      govActionId: {txHashHex: VALID_TX_HASH, govActionIndex: 0},
      votingProcedure: {vote: VoteOption.YES, anchor: null},
    },
  ],
}

describe('isObject guards', () => {
  describe('parseCredential', () => {
    it('throws InvalidData on null', () => {
      expect(() =>
        parseCredential(
          null as unknown as CredentialParams,
          InvalidDataReason.WITHDRAWAL_INVALID_STAKE_CREDENTIAL,
        ),
      ).to.throw(InvalidDataReason.WITHDRAWAL_INVALID_STAKE_CREDENTIAL)
    })

    it('throws InvalidData on non-object', () => {
      expect(() =>
        parseCredential(
          42 as unknown as CredentialParams,
          InvalidDataReason.CERTIFICATE_INVALID_STAKE_CREDENTIAL,
        ),
      ).to.throw(InvalidDataReason.CERTIFICATE_INVALID_STAKE_CREDENTIAL)
    })

    it('accepts valid key hash credential', () => {
      expect(() =>
        parseCredential(
          {type: CredentialParamsType.KEY_HASH, keyHashHex: VALID_KEY_HASH},
          InvalidDataReason.WITHDRAWAL_INVALID_STAKE_CREDENTIAL,
        ),
      ).not.to.throw()
    })
  })

  describe('parseAnchor', () => {
    it('throws InvalidData on null', () => {
      expect(() =>
        parseAnchor(null as unknown as AnchorParams),
      ).to.throw(InvalidDataReason.ANCHOR_INVALID)
    })

    it('throws InvalidData on non-object', () => {
      expect(() =>
        parseAnchor('not-an-anchor' as unknown as AnchorParams),
      ).to.throw(InvalidDataReason.ANCHOR_INVALID)
    })

    it('accepts valid anchor', () => {
      expect(() =>
        parseAnchor({
          url: 'https://example.com',
          hashHex: '1afd028b504c3668102b129b37a86c09a2872f76741dc7a68e2149c8deadbeef',
        }),
      ).not.to.throw()
    })
  })

  describe('parseTxInput', () => {
    it('throws InvalidData when input is null', () => {
      expect(() =>
        parseTransaction({
          ...baseTx,
          inputs: [null as unknown as NonNullable<Transaction['inputs']>[0]],
        }),
      ).to.throw(InvalidDataReason.INPUT_INVALID_TX_HASH)
    })
  })

  describe('parseWithdrawal', () => {
    it('throws InvalidData when withdrawal is null', () => {
      expect(() =>
        parseTransaction({
          ...baseTx,
          withdrawals: [null as unknown as NonNullable<Transaction['withdrawals']>[0]],
        }),
      ).to.throw(InvalidDataReason.WITHDRAWAL_INVALID_AMOUNT)
    })
  })

  describe('parseVoterVotes', () => {
    it('throws InvalidData when voterVotes is null', () => {
      expect(() =>
        parseTransaction({
          ...baseTx,
          votingProcedures: [null as unknown as NonNullable<Transaction['votingProcedures']>[0]],
        }),
      ).to.throw(InvalidDataReason.VOTER_VOTES_NOT_ARRAY)
    })
  })

  describe('parseVoter', () => {
    it('throws InvalidData when voter is null', () => {
      expect(() =>
        parseTransaction({
          ...baseTx,
          votingProcedures: [
            {
              ...baseVoterVotes,
              voter: null as unknown as typeof baseVoterVotes.voter,
            },
          ],
        }),
      ).to.throw(InvalidDataReason.VOTER_INVALID)
    })
  })

  describe('parseVote', () => {
    it('throws InvalidData when vote entry is null', () => {
      expect(() =>
        parseTransaction({
          ...baseTx,
          votingProcedures: [
            {
              ...baseVoterVotes,
              votes: [null as unknown as typeof baseVoterVotes.votes[0]],
            },
          ],
        }),
      ).to.throw(InvalidDataReason.GOV_ACTION_ID_INVALID)
    })

    it('throws InvalidData when govActionId is null', () => {
      expect(() =>
        parseTransaction({
          ...baseTx,
          votingProcedures: [
            {
              ...baseVoterVotes,
              votes: [
                {
                  ...baseVoterVotes.votes[0],
                  govActionId: null as unknown as typeof baseVoterVotes.votes[0]['govActionId'],
                },
              ],
            },
          ],
        }),
      ).to.throw(InvalidDataReason.GOV_ACTION_ID_INVALID)
    })

    it('throws InvalidData when votingProcedure is null', () => {
      expect(() =>
        parseTransaction({
          ...baseTx,
          votingProcedures: [
            {
              ...baseVoterVotes,
              votes: [
                {
                  ...baseVoterVotes.votes[0],
                  votingProcedure: null as unknown as typeof baseVoterVotes.votes[0]['votingProcedure'],
                },
              ],
            },
          ],
        }),
      ).to.throw(InvalidDataReason.VOTING_PROCEDURE_INVALID)
    })
  })
})
