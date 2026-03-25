import type {ParsedCredential, Uint8_t} from '../../../types/internal'
import {CredentialType} from '../../../types/internal'
import {unreachable} from '../../../utils/assert'
import {hex_to_buf, path_to_buf, uint8_to_buf} from '../../../utils/serialize'

const enum CredentialWireType {
  KEY_HASH = 0,
  SCRIPT_HASH = 1,
  KEY_PATH = 2,
}

export function serializeCredential(credential: ParsedCredential): Buffer {
  switch (credential.type) {
    case CredentialType.KEY_PATH:
      return Buffer.concat([
        uint8_to_buf(CredentialWireType.KEY_PATH as Uint8_t),
        path_to_buf(credential.path),
      ])
    case CredentialType.KEY_HASH:
      return Buffer.concat([
        uint8_to_buf(CredentialWireType.KEY_HASH as Uint8_t),
        hex_to_buf(credential.keyHashHex),
      ])
    case CredentialType.SCRIPT_HASH:
      return Buffer.concat([
        uint8_to_buf(CredentialWireType.SCRIPT_HASH as Uint8_t),
        hex_to_buf(credential.scriptHashHex),
      ])
    default:
      unreachable(credential)
  }
}
