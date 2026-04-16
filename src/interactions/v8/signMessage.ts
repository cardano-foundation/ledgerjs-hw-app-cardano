import {assert} from '../../utils/assert'
import {buf_to_uint32} from '../../utils/serialize'
import type {ParsedMessageData} from '../../types/internal'
import {ED25519_SIGNATURE_LENGTH, PUBLIC_KEY_LENGTH} from '../../types/internal'
import type {SignedMessageData, Version} from '../../types/public'
import type {Interaction} from '../common/types'
import {sendSignMessage} from './commandSender'

const SIGN_MESSAGE_RESPONSE_PREFIX_LENGTH =
  ED25519_SIGNATURE_LENGTH + PUBLIC_KEY_LENGTH + 4
const MAX_ADDRESS_SIZE = 128

export function* signMessage(
  _version: Version,
  msgData: ParsedMessageData,
): Interaction<SignedMessageData> {
  const confirmResponse = yield* sendSignMessage(msgData)
  assert(
    confirmResponse.length >= SIGN_MESSAGE_RESPONSE_PREFIX_LENGTH,
    'invalid v8 signMessage response length',
  )

  let s = 0
  const signatureHex = confirmResponse
    .slice(s, s + ED25519_SIGNATURE_LENGTH)
    .toString('hex')
  s += ED25519_SIGNATURE_LENGTH

  const signingPublicKeyHex = confirmResponse
    .slice(s, s + PUBLIC_KEY_LENGTH)
    .toString('hex')
  s += PUBLIC_KEY_LENGTH

  const addressFieldSize = buf_to_uint32(confirmResponse.slice(s, s + 4))
  s += 4
  assert(addressFieldSize > 0, 'invalid v8 signMessage address field size')
  assert(
    addressFieldSize <= MAX_ADDRESS_SIZE,
    'invalid v8 signMessage address field size',
  )
  assert(
    s + addressFieldSize === confirmResponse.length,
    'invalid v8 signMessage response length',
  )
  const addressFieldHex = confirmResponse
    .slice(s, s + addressFieldSize)
    .toString('hex')

  return {
    signatureHex,
    signingPublicKeyHex,
    addressFieldHex,
  }
}
