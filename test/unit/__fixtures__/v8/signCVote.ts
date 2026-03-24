import type {ParsedCVote} from '../../../../src/types/internal'

import {samplePath, samplePathHex} from './common'

export const parsedSignCVoteFixture = {
  voteCastDataHex: 'abcd',
  witnessPath: samplePath,
} as ParsedCVote

export const expectedSignCVoteApdusHex = [
  'd72350000600000002abcd',
  `d723520015${samplePathHex}`,
]
