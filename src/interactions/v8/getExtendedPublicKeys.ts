import type {ValidBIP32Path, Version} from '../../types/internal'
import type {ExtendedPublicKey} from '../../types/public'
import {assert} from '../../utils/assert'
import {chunkBy} from '../../utils'
import type {Interaction} from '../common/types'
import {sendGetExtendedPublicKey} from './commandSender'

export function* getExtendedPublicKeys(
  _version: Version,
  paths: Array<ValidBIP32Path>,
): Interaction<Array<ExtendedPublicKey>> {
  const result = []

  for (const path of paths) {
    const response = yield* sendGetExtendedPublicKey(path)
    const VKEY_LENGTH = 32
    const CHAINCODE_LENGTH = 32
    const [publicKey, chainCode, rest] = chunkBy(response, [
      VKEY_LENGTH,
      CHAINCODE_LENGTH,
    ])
    assert(rest.length === 0, 'invalid response length')

    result.push({
      publicKeyHex: publicKey.toString('hex'),
      chainCodeHex: chainCode.toString('hex'),
    })
  }

  return result
}
