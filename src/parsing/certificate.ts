import { InvalidData } from "../errors"
import { InvalidDataReason } from "../errors/invalidDataReason"
import type { ParsedCertificate } from "../types/internal"
import { CertificateType, KEY_HASH_LENGTH } from "../types/internal"
import type { Certificate} from "../types/public"
import { parseBIP32Path, parseHexStringOfLength, parseStakeCredential, parseUint64_str, validate } from "../utils/parse"
import { parsePoolParams } from "./poolRegistration"

export function parseCertificate(cert: Certificate): ParsedCertificate {
    switch (cert.type) {
    case CertificateType.STAKE_REGISTRATION:
    case CertificateType.STAKE_DEREGISTRATION: {
        validate((cert.params as any).poolKeyHashHex == null, InvalidDataReason.CERTIFICATE_SUPERFLUOUS_POOL_KEY_HASH)
        return {
            type: cert.type,
            stakeCredential: parseStakeCredential(cert.params.stakeCredential, InvalidDataReason.CERTIFICATE_INVALID_SCRIPT_HASH),
        }
    }
    case CertificateType.STAKE_DELEGATION: {
        return {
            type: cert.type,
            stakeCredential: parseStakeCredential(cert.params.stakeCredential, InvalidDataReason.CERTIFICATE_INVALID_SCRIPT_HASH),
            poolKeyHashHex: parseHexStringOfLength(cert.params.poolKeyHashHex, KEY_HASH_LENGTH, InvalidDataReason.CERTIFICATE_INVALID_POOL_KEY_HASH),
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
            path: parseBIP32Path(cert.params.poolKeyPath, InvalidDataReason.CERTIFICATE_INVALID_PATH),
            retirementEpoch: parseUint64_str(cert.params.retirementEpoch, {}, InvalidDataReason.POOL_RETIREMENT_INVALID_RETIREMENT_EPOCH),
        }
    }

    default:
        throw new InvalidData(InvalidDataReason.CERTIFICATE_INVALID_TYPE)
    }
}
