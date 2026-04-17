import type {ParsedSigningRequest, ValidBIP32Path} from '../../types/internal'
import {
  CertificateType,
  CredentialType,
  PoolKeyType,
  PoolOwnerType,
  RequiredSignerType,
} from '../../types/internal'
import {TransactionSigningMode, VoterType} from '../../types/public'

export function uniquify(witnessPaths: ValidBIP32Path[]): ValidBIP32Path[] {
  const uniquifier: Record<string, ValidBIP32Path> = {}
  witnessPaths.forEach((path) => {
    uniquifier[JSON.stringify(path)] = path
  })
  return Object.values(uniquifier)
}

export function gatherWitnessPaths(
  request: ParsedSigningRequest,
): ValidBIP32Path[] {
  const {tx, signingMode, additionalWitnessPaths} = request
  const witnessPaths: ValidBIP32Path[] = []

  if (signingMode !== TransactionSigningMode.MULTISIG_TRANSACTION) {
    for (const input of tx.inputs) {
      if (input.path != null) {
        witnessPaths.push(input.path)
      }
    }

    for (const cert of tx.certificates) {
      switch (cert.type) {
        // STAKE_REGISTRATION does not require a witness; it can be provided via additionalWitnessPaths if needed
        case CertificateType.STAKE_REGISTRATION_CONWAY:
        case CertificateType.STAKE_DEREGISTRATION:
        case CertificateType.STAKE_DEREGISTRATION_CONWAY:
        case CertificateType.STAKE_DELEGATION:
        case CertificateType.VOTE_DELEGATION:
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
