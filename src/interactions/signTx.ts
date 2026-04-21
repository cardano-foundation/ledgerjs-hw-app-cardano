import type {ParsedSigningRequest, Version} from '../types/internal'
import type {SignedTransactionData} from '../types/public'
import {ensureSignTxRequestSupported} from '../validation/requestCompatibility'
import type {Interaction} from './common/types'
import {isV7App} from '../validation/deviceCapabilities'
import {signTransactionV7} from './v7/signTx'
import {signTransaction as signTransactionV8} from './v8/signTx'

export type SerializeTokenAmountFn<T> = (val: T) => Buffer

export function* signTransaction(
  version: Version,
  request: ParsedSigningRequest,
): Interaction<SignedTransactionData> {
  ensureSignTxRequestSupported(version, request)

  if (isV7App(version)) {
    return yield* signTransactionV7(version, request)
  }

  return yield* signTransactionV8(version, request)
}
