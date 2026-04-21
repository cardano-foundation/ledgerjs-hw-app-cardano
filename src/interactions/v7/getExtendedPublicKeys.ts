import type {Uint32_t, ValidBIP32Path, Version} from '../../types/internal'
import {EXTENDED_PUBLIC_KEY_LENGTH} from '../../types/internal'
import type {ExtendedPublicKey} from '../../types/public'
import {chunkBy} from '../../utils'
import {assert} from '../../utils/assert'
import {path_to_buf, uint32_to_buf} from '../../utils/serialize'
import {INS} from '../common/ins'
import type {Interaction, SendParams} from '../common/types'

const send = (params: {
  p1: number
  p2: number
  data: Buffer
  expectedResponseLength?: number
}): SendParams => ({ins: INS.GET_EXT_PUBLIC_KEY, ...params})

export function* getExtendedPublicKeysV7(
  version: Version,
  paths: Array<ValidBIP32Path>,
): Interaction<Array<ExtendedPublicKey>> {
  const enum P1 {
    INIT = 0x00,
    NEXT_KEY = 0x01,
  }
  const enum P2 {
    UNUSED = 0x00,
  }
  const result = []

  for (let i = 0; i < paths.length; i++) {
    const pathData = Buffer.concat([path_to_buf(paths[i])])

    let response: Buffer
    if (i === 0) {
      const remainingKeysData =
        paths.length > 1
          ? uint32_to_buf((paths.length - 1) as Uint32_t)
          : Buffer.from([])

      response = yield send({
        p1: P1.INIT,
        p2: P2.UNUSED,
        data: Buffer.concat([pathData, remainingKeysData]),
        expectedResponseLength: EXTENDED_PUBLIC_KEY_LENGTH,
      })
    } else {
      response = yield send({
        p1: P1.NEXT_KEY,
        p2: P2.UNUSED,
        data: pathData,
        expectedResponseLength: EXTENDED_PUBLIC_KEY_LENGTH,
      })
    }

    const VKEY_LENGTH = 32
    const CHAINCODE_LENGTH = 32
    const [publicKey, chainCode] = chunkBy(response, [
      VKEY_LENGTH,
      CHAINCODE_LENGTH,
    ])
    assert(
      response.length === VKEY_LENGTH + CHAINCODE_LENGTH,
      'invalid response length',
    )

    result.push({
      publicKeyHex: publicKey.toString('hex'),
      chainCodeHex: chainCode.toString('hex'),
    })
  }

  return result
}
