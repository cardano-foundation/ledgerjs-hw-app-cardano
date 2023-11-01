import {
  DRepType,
  Uint8_t,
  CredentialType,
  CertificateType,
} from '../../types/internal'
import type {ParsedCertificate, ParsedDRep, Version} from '../../types/internal'
import {assert, unreachable} from '../../utils/assert'
import {
  hex_to_buf,
  path_to_buf,
  serializeCredential,
  uint8_to_buf,
  uint64_to_buf,
  serializeCoin,
  serializeAnchor,
} from '../../utils/serialize'
import {getCompatibility} from '../getVersion'

export function serializeDRep(dRep: ParsedDRep): Buffer {
  switch (dRep.type) {
    case DRepType.KEY_PATH:
      return Buffer.concat([
        uint8_to_buf(dRep.type as Uint8_t),
        path_to_buf(dRep.path),
      ])
    case DRepType.KEY_HASH:
      return Buffer.concat([
        uint8_to_buf(dRep.type as Uint8_t),
        hex_to_buf(dRep.keyHashHex),
      ])
    case DRepType.SCRIPT_HASH:
      return Buffer.concat([
        uint8_to_buf(dRep.type as Uint8_t),
        hex_to_buf(dRep.scriptHashHex),
      ])
    case DRepType.ABSTAIN:
    case DRepType.NO_CONFIDENCE:
      return Buffer.concat([uint8_to_buf(dRep.type as Uint8_t)])
    default:
      unreachable(dRep)
  }
}

export function serializeTxCertificatePreMultisig(
  certificate: ParsedCertificate,
) {
  switch (certificate.type) {
    case CertificateType.STAKE_REGISTRATION:
    case CertificateType.STAKE_DEREGISTRATION: {
      assert(
        certificate.stakeCredential.type === CredentialType.KEY_PATH,
        'invalid stake credential',
      )
      return Buffer.concat([
        uint8_to_buf(certificate.type as Uint8_t),
        path_to_buf(certificate.stakeCredential.path),
      ])
    }
    case CertificateType.STAKE_DELEGATION: {
      assert(
        certificate.stakeCredential.type === CredentialType.KEY_PATH,
        'invalid stake credential',
      )
      return Buffer.concat([
        uint8_to_buf(certificate.type as Uint8_t),
        path_to_buf(certificate.stakeCredential.path),
        hex_to_buf(certificate.poolKeyHashHex),
      ])
    }
    case CertificateType.STAKE_POOL_REGISTRATION: {
      return Buffer.concat([uint8_to_buf(certificate.type as Uint8_t)])
    }
    case CertificateType.STAKE_POOL_RETIREMENT: {
      return Buffer.concat([
        uint8_to_buf(certificate.type as Uint8_t),
        path_to_buf(certificate.path),
        uint64_to_buf(certificate.retirementEpoch),
      ])
    }
    case CertificateType.STAKE_REGISTRATION_CONWAY:
    case CertificateType.STAKE_DEREGISTRATION_CONWAY:
    case CertificateType.VOTE_DELEGATION:
    case CertificateType.AUTHORIZE_COMMITTEE_HOT:
    case CertificateType.RESIGN_COMMITTEE_COLD:
    case CertificateType.DREP_REGISTRATION:
    case CertificateType.DREP_DEREGISTRATION:
    case CertificateType.DREP_UPDATE: {
      assert(false, 'Conway certificates in pre-multisig serialization')
      break
    }
    default:
      unreachable(certificate)
  }
}

export function serializeTxCertificate(
  certificate: ParsedCertificate,
  version: Version,
) {
  if (!getCompatibility(version).supportsMultisigTransaction) {
    return serializeTxCertificatePreMultisig(certificate)
  }

  switch (certificate.type) {
    case CertificateType.STAKE_REGISTRATION:
    case CertificateType.STAKE_DEREGISTRATION: {
      return Buffer.concat([
        uint8_to_buf(certificate.type as Uint8_t),
        serializeCredential(certificate.stakeCredential),
      ])
    }
    case CertificateType.STAKE_REGISTRATION_CONWAY:
    case CertificateType.STAKE_DEREGISTRATION_CONWAY: {
      return Buffer.concat([
        uint8_to_buf(certificate.type as Uint8_t),
        serializeCredential(certificate.stakeCredential),
        serializeCoin(certificate.deposit),
      ])
    }
    case CertificateType.STAKE_DELEGATION: {
      return Buffer.concat([
        uint8_to_buf(certificate.type as Uint8_t),
        serializeCredential(certificate.stakeCredential),
        hex_to_buf(certificate.poolKeyHashHex),
      ])
    }
    case CertificateType.VOTE_DELEGATION: {
      return Buffer.concat([
        uint8_to_buf(certificate.type as Uint8_t),
        serializeCredential(certificate.stakeCredential),
        serializeDRep(certificate.dRep),
      ])
    }
    case CertificateType.AUTHORIZE_COMMITTEE_HOT: {
      return Buffer.concat([
        uint8_to_buf(certificate.type as Uint8_t),
        serializeCredential(certificate.coldCredential),
        serializeCredential(certificate.hotCredential),
      ])
    }
    case CertificateType.RESIGN_COMMITTEE_COLD: {
      return Buffer.concat([
        uint8_to_buf(certificate.type as Uint8_t),
        serializeCredential(certificate.coldCredential),
        serializeAnchor(certificate.anchor),
      ])
    }
    case CertificateType.DREP_REGISTRATION: {
      return Buffer.concat([
        uint8_to_buf(certificate.type as Uint8_t),
        serializeCredential(certificate.dRepCredential),
        serializeCoin(certificate.deposit),
        serializeAnchor(certificate.anchor),
      ])
    }
    case CertificateType.DREP_DEREGISTRATION: {
      return Buffer.concat([
        uint8_to_buf(certificate.type as Uint8_t),
        serializeCredential(certificate.dRepCredential),
        serializeCoin(certificate.deposit),
      ])
    }
    case CertificateType.DREP_UPDATE: {
      return Buffer.concat([
        uint8_to_buf(certificate.type as Uint8_t),
        serializeCredential(certificate.dRepCredential),
        serializeAnchor(certificate.anchor),
      ])
    }
    case CertificateType.STAKE_POOL_REGISTRATION: {
      return Buffer.concat([uint8_to_buf(certificate.type as Uint8_t)])
    }
    case CertificateType.STAKE_POOL_RETIREMENT: {
      return Buffer.concat([
        uint8_to_buf(certificate.type as Uint8_t),
        path_to_buf(certificate.path),
        uint64_to_buf(certificate.retirementEpoch),
      ])
    }
    default:
      unreachable(certificate)
  }
}
