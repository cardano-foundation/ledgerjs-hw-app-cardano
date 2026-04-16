import type {
  ParsedSigningRequest,
  ValidBIP32Path,
  Version,
} from '../../types/internal'
import {
  CertificateType,
  CredentialType,
  PoolKeyType,
  PoolOwnerType,
  RequiredSignerType,
} from '../../types/internal'
import type {SignedTransactionData} from '../../types/public'
import {
  TransactionSigningMode,
  TxAuxiliaryDataSupplementType,
  TxAuxiliaryDataType,
  VoterType,
} from '../../types/public'
import type {Interaction} from '../common/types'
import {sendSignTx} from './commandSender'
import {assert} from '../../utils/assert'

const AUXILIARY_DATA_HASH_LENGTH = 32
const ED25519_SIGNATURE_LENGTH = 64

function uniquify(witnessPaths: ValidBIP32Path[]): ValidBIP32Path[] {
  const uniquifier: Record<string, ValidBIP32Path> = {}
  witnessPaths.forEach((path) => {
    uniquifier[JSON.stringify(path)] = path
  })
  return Object.values(uniquifier)
}

function gatherWitnessPaths(request: ParsedSigningRequest): ValidBIP32Path[] {
  const {tx, signingMode, additionalWitnessPaths} = request
  const witnessPaths: ValidBIP32Path[] = []

  if (signingMode !== TransactionSigningMode.MULTISIG_TRANSACTION) {
    for (const input of tx.inputs) {
      if (input.path != null) {
        witnessPaths.push(input.path)
      }
    }
    // certificate witnesses
    for (const cert of tx.certificates) {
      switch (cert.type) {
        case CertificateType.STAKE_REGISTRATION:
        case CertificateType.STAKE_DEREGISTRATION:
        case CertificateType.STAKE_DEREGISTRATION_CONWAY:
        case CertificateType.STAKE_DELEGATION:
        case CertificateType.VOTE_DELEGATION:
          if (cert.stakeCredential.type === CredentialType.KEY_PATH) {
            witnessPaths.push(cert.stakeCredential.path)
          }
          break
        case CertificateType.STAKE_REGISTRATION_CONWAY:
          if (cert.stakeCredential.type === CredentialType.KEY_PATH) {
            witnessPaths.push(cert.stakeCredential.path)
          }
          break
        case CertificateType.AUTHORIZE_COMMITTEE_HOT:
        case CertificateType.RESIGN_COMMITTEE_COLD:
          if (cert.coldCredential.type === CredentialType.KEY_PATH) {
            witnessPaths.push(cert.coldCredential.path)
          }
          break
        case CertificateType.DREP_REGISTRATION:
        case CertificateType.DREP_DEREGISTRATION:
        case CertificateType.DREP_UPDATE:
          if (cert.dRepCredential.type === CredentialType.KEY_PATH) {
            witnessPaths.push(cert.dRepCredential.path)
          }
          break
        case CertificateType.STAKE_POOL_REGISTRATION:
          cert.pool.owners.forEach((owner) => {
            if (owner.type === PoolOwnerType.DEVICE_OWNED) {
              witnessPaths.push(owner.path)
            }
          })
          if (cert.pool.poolKey.type === PoolKeyType.DEVICE_OWNED) {
            witnessPaths.push(cert.pool.poolKey.path)
          }
          break
        case CertificateType.STAKE_POOL_RETIREMENT:
          witnessPaths.push(cert.path)
          break
        default:
          break
      }
    }

    for (const withdrawal of tx.withdrawals) {
      if (withdrawal.stakeCredential.type === CredentialType.KEY_PATH) {
        witnessPaths.push(withdrawal.stakeCredential.path)
      }
    }

    for (const signer of tx.requiredSigners) {
      if (signer.type === RequiredSignerType.PATH) {
        witnessPaths.push(signer.path)
      }
    }

    for (const collateral of tx.collateralInputs) {
      if (collateral.path != null) {
        witnessPaths.push(collateral.path)
      }
    }

    for (const voterVotes of tx.votingProcedures) {
      switch (voterVotes.voter.type) {
        case VoterType.COMMITTEE_KEY_PATH:
        case VoterType.DREP_KEY_PATH:
        case VoterType.STAKE_POOL_KEY_PATH:
          witnessPaths.push(voterVotes.voter.keyPath)
          break
        default:
          break
      }
    }
  }

  additionalWitnessPaths.forEach((path) => witnessPaths.push(path))
  return uniquify(witnessPaths)
}

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

  assert(
    witnessResponses.length === witnessPaths.length,
    'invalid v8 witness response count',
  )

  return {
    txHashHex: txHashResponse.toString('hex'),
    witnesses: witnessPaths.map((path, index) => ({
      path,
      witnessSignatureHex: witnessResponses[index].toString('hex'),
    })),
    auxiliaryDataSupplement,
  }
}
