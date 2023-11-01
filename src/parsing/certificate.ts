import {unreachable} from '../utils/assert'
import {InvalidData} from '../errors'
import {InvalidDataReason} from '../errors/invalidDataReason'
import {
  DRepType,
  ParsedDRep,
  SCRIPT_HASH_LENGTH,
  CertificateType,
  KEY_HASH_LENGTH,
  Uint64_str,
} from '../types/internal'
import type {ParsedCertificate} from '../types/internal'
import {bigint_like, DRepParams, DRepParamsType} from '../types/public'
import type {Certificate} from '../types/public'
import {
  parseBIP32Path,
  parseHexStringOfLength,
  parseCredential,
  parseUint64_str,
  parseAnchor,
  parseCoin,
} from '../utils/parse'
import {parsePoolParams} from './poolRegistration'

function parseDRep(dRep: DRepParams, errMsg: InvalidDataReason): ParsedDRep {
  switch (dRep.type) {
    case DRepParamsType.KEY_PATH:
      return {
        type: DRepType.KEY_PATH,
        path: parseBIP32Path(dRep.keyPath, errMsg),
      }
    case DRepParamsType.KEY_HASH:
      return {
        type: DRepType.KEY_HASH,
        keyHashHex: parseHexStringOfLength(
          dRep.keyHashHex,
          KEY_HASH_LENGTH,
          errMsg,
        ),
      }
    case DRepParamsType.SCRIPT_HASH:
      return {
        type: DRepType.SCRIPT_HASH,
        scriptHashHex: parseHexStringOfLength(
          dRep.scriptHashHex,
          SCRIPT_HASH_LENGTH,
          errMsg,
        ),
      }
    case DRepParamsType.ABSTAIN:
      return {
        type: DRepType.ABSTAIN,
      }
    case DRepParamsType.NO_CONFIDENCE:
      return {
        type: DRepType.NO_CONFIDENCE,
      }
    default:
      unreachable(dRep)
  }
}

function parseDeposit(deposit: bigint_like): Uint64_str {
  return parseCoin(deposit, InvalidDataReason.CERTIFICATE_INVALID_DEPOSIT)
}

export function parseCertificate(cert: Certificate): ParsedCertificate {
  switch (cert.type) {
    case CertificateType.STAKE_REGISTRATION:
    case CertificateType.STAKE_DEREGISTRATION: {
      return {
        type: cert.type,
        stakeCredential: parseCredential(
          cert.params.stakeCredential,
          InvalidDataReason.CERTIFICATE_INVALID_STAKE_CREDENTIAL,
        ),
      }
    }
    case CertificateType.STAKE_REGISTRATION_CONWAY:
    case CertificateType.STAKE_DEREGISTRATION_CONWAY: {
      return {
        type: cert.type,
        stakeCredential: parseCredential(
          cert.params.stakeCredential,
          InvalidDataReason.CERTIFICATE_INVALID_STAKE_CREDENTIAL,
        ),
        deposit: parseDeposit(cert.params.deposit),
      }
    }
    case CertificateType.STAKE_DELEGATION: {
      return {
        type: cert.type,
        stakeCredential: parseCredential(
          cert.params.stakeCredential,
          InvalidDataReason.CERTIFICATE_INVALID_STAKE_CREDENTIAL,
        ),
        poolKeyHashHex: parseHexStringOfLength(
          cert.params.poolKeyHashHex,
          KEY_HASH_LENGTH,
          InvalidDataReason.CERTIFICATE_INVALID_POOL_KEY_HASH,
        ),
      }
    }
    case CertificateType.VOTE_DELEGATION: {
      return {
        type: cert.type,
        stakeCredential: parseCredential(
          cert.params.stakeCredential,
          InvalidDataReason.CERTIFICATE_INVALID_STAKE_CREDENTIAL,
        ),
        dRep: parseDRep(
          cert.params.dRep,
          InvalidDataReason.CERTIFICATE_INVALID_DREP,
        ),
      }
    }
    case CertificateType.AUTHORIZE_COMMITTEE_HOT: {
      return {
        type: cert.type,
        coldCredential: parseCredential(
          cert.params.coldCredential,
          InvalidDataReason.CERTIFICATE_INVALID_COMMITTEE_CREDENTIAL,
        ),
        hotCredential: parseCredential(
          cert.params.hotCredential,
          InvalidDataReason.CERTIFICATE_INVALID_COMMITTEE_CREDENTIAL,
        ),
      }
    }
    case CertificateType.RESIGN_COMMITTEE_COLD: {
      return {
        type: cert.type,
        coldCredential: parseCredential(
          cert.params.coldCredential,
          InvalidDataReason.CERTIFICATE_INVALID_COMMITTEE_CREDENTIAL,
        ),
        anchor:
          cert.params.anchor == null ? null : parseAnchor(cert.params.anchor),
      }
    }
    case CertificateType.DREP_REGISTRATION: {
      return {
        type: cert.type,
        dRepCredential: parseCredential(
          cert.params.dRepCredential,
          InvalidDataReason.CERTIFICATE_INVALID_DREP_CREDENTIAL,
        ),
        deposit: parseDeposit(cert.params.deposit),
        anchor:
          cert.params.anchor == null ? null : parseAnchor(cert.params.anchor),
      }
    }
    case CertificateType.DREP_DEREGISTRATION: {
      return {
        type: cert.type,
        dRepCredential: parseCredential(
          cert.params.dRepCredential,
          InvalidDataReason.CERTIFICATE_INVALID_DREP_CREDENTIAL,
        ),
        deposit: parseDeposit(cert.params.deposit),
      }
    }
    case CertificateType.DREP_UPDATE: {
      return {
        type: cert.type,
        dRepCredential: parseCredential(
          cert.params.dRepCredential,
          InvalidDataReason.CERTIFICATE_INVALID_DREP_CREDENTIAL,
        ),
        anchor:
          cert.params.anchor == null ? null : parseAnchor(cert.params.anchor),
      }
    }
    case CertificateType.STAKE_POOL_REGISTRATION: {
      return {
        type: cert.type,
        pool: parsePoolParams(cert.params),
      }
    }
    case CertificateType.STAKE_POOL_RETIREMENT: {
      return {
        type: cert.type,
        path: parseBIP32Path(
          cert.params.poolKeyPath,
          InvalidDataReason.CERTIFICATE_INVALID_PATH,
        ),
        retirementEpoch: parseUint64_str(
          cert.params.retirementEpoch,
          {},
          InvalidDataReason.POOL_RETIREMENT_INVALID_RETIREMENT_EPOCH,
        ),
      }
    }

    default:
      throw new InvalidData(InvalidDataReason.CERTIFICATE_INVALID_TYPE)
  }
}
