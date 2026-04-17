import type {ParsedSigningRequest, Version} from '../../types/internal'
import type {SignedTransactionData} from '../../types/public'
import {
  TxAuxiliaryDataSupplementType,
  TxAuxiliaryDataType,
} from '../../types/public'
import type {Interaction} from '../common/types'
import {gatherWitnessPaths} from '../common/witnessPaths'
import {sendSignTx} from './commandSender'
import {assert} from '../../utils/assert'

const AUXILIARY_DATA_HASH_LENGTH = 32
const ED25519_SIGNATURE_LENGTH = 64

export function* signTransaction(
  _version: Version,
  request: ParsedSigningRequest,
): Interaction<SignedTransactionData> {
  const witnessPaths = gatherWitnessPaths(request)
  const {auxiliaryDataResponse, txHashResponse, witnessResponses} =
    yield* sendSignTx(request, witnessPaths)

  const auxiliaryDataSupplement =
    request.tx.auxiliaryData?.type === TxAuxiliaryDataType.CIP36_REGISTRATION
      ? (() => {
          assert(
            auxiliaryDataResponse != null,
            'missing v8 auxiliary data response',
          )
          assert(
            auxiliaryDataResponse.length ===
              AUXILIARY_DATA_HASH_LENGTH + ED25519_SIGNATURE_LENGTH,
            'invalid v8 auxiliary data response length',
          )

          return {
            type: TxAuxiliaryDataSupplementType.CIP36_REGISTRATION,
            auxiliaryDataHashHex: auxiliaryDataResponse
              .slice(0, AUXILIARY_DATA_HASH_LENGTH)
              .toString('hex'),
            cip36VoteRegistrationSignatureHex: auxiliaryDataResponse
              .slice(AUXILIARY_DATA_HASH_LENGTH)
              .toString('hex'),
          }
        })()
      : null

  return {
    txHashHex: txHashResponse.toString('hex'),
    witnesses: witnessPaths.map((path, index) => ({
      path,
      witnessSignatureHex: witnessResponses[index].toString('hex'),
    })),
    auxiliaryDataSupplement,
  }
}
