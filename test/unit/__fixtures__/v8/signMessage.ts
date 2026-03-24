import type {ParsedMessageData} from '../../../../src/types/internal'
import {MessageAddressFieldType} from '../../../../src/types/public'

import {samplePathHex, samplePath} from './common'

export const parsedSignMessageFixture = {
  messageHex: 'abcd',
  signingPath: samplePath,
  hashPayload: false,
  isAscii: false,
  addressFieldType: MessageAddressFieldType.KEY_HASH,
} as ParsedMessageData

export const expectedSignMessageApdusHex = [
  `d72401001c00000002${samplePathHex}000002`,
  'd72402000600000002abcd',
  'd724030000',
]
