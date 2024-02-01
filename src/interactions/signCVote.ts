import {DeviceVersionUnsupported} from '../errors'
import type {ParsedCVote, Uint32_t, Version} from '../types/internal'
import {ED25519_SIGNATURE_LENGTH} from '../types/internal'
import type {SignedCIP36VoteData} from '../types/public'
import {getVersionString} from '../utils'
import {hex_to_buf, path_to_buf, uint32_to_buf} from '../utils/serialize'
import {INS} from './common/ins'
import type {Interaction, SendParams} from './common/types'
import {getCompatibility} from './getVersion'

const send = (params: {
  p1: number
  p2: number
  data: Buffer
  expectedResponseLength?: number
}): SendParams => ({ins: INS.SIGN_CIP36_VOTE, ...params})

export function* signCVote(
  version: Version,
  cVote: ParsedCVote,
): Interaction<SignedCIP36VoteData> {
  if (!getCompatibility(version).supportsCIP36Vote) {
    throw new DeviceVersionUnsupported(
      `CIP36 voting not supported by Ledger app version ${getVersionString(
        version,
      )}.`,
    )
  }

  const enum P1 {
    STAGE_INIT = 0x01,
    STAGE_CHUNK = 0x02,
    STAGE_CONFIRM = 0x03,
    STAGE_WITNESS = 0x04,
  }
  const enum P2 {
    UNUSED = 0x00,
  }
  const MAX_VOTECAST_CHUNK_SIZE = 240

  const votecastBytes = hex_to_buf(cVote.voteCastDataHex)
  let start = 0
  let end = Math.min(votecastBytes.length, start + MAX_VOTECAST_CHUNK_SIZE)

  // INIT
  const initDataBuffer = Buffer.concat([
    uint32_to_buf(votecastBytes.length as Uint32_t),
    votecastBytes.slice(start, end),
  ])
  yield send({
    p1: P1.STAGE_INIT,
    p2: P2.UNUSED,
    data: initDataBuffer,
    expectedResponseLength: 0,
  })
  start = end

  // CHUNK
  while (start < votecastBytes.length) {
    end = Math.min(votecastBytes.length, start + MAX_VOTECAST_CHUNK_SIZE)

    yield send({
      p1: P1.STAGE_CHUNK,
      p2: P2.UNUSED,
      data: votecastBytes.slice(start, end),
      expectedResponseLength: 0,
    })
    start = end
  }

  // CONFIRM
  const VOTECAST_HASH_LENGTH = 32
  const confirmResponse = yield send({
    p1: P1.STAGE_CONFIRM,
    p2: P2.UNUSED,
    data: Buffer.concat([]),
    expectedResponseLength: VOTECAST_HASH_LENGTH,
  })

  // WITNESS
  const witnessResponse = yield send({
    p1: P1.STAGE_WITNESS,
    p2: P2.UNUSED,
    data: path_to_buf(cVote.witnessPath),
    expectedResponseLength: ED25519_SIGNATURE_LENGTH,
  })

  return {
    dataHashHex: confirmResponse.toString('hex'),
    witnessPath: cVote.witnessPath,
    witnessSignatureHex: witnessResponse.toString('hex'),
  }
}
