import { InvalidDataReason } from "../../errors/invalidDataReason"
import type { ParsedCertificate, Uint8_t, Version } from "../../types/internal"
import { StakeCredentialType } from "../../types/internal"
import { CertificateType } from "../../types/internal"
import { assert, unreachable } from "../../utils/assert"
import { hex_to_buf, path_to_buf, stake_credential_to_buf,uint8_to_buf, uint64_to_buf } from "../../utils/serialize"
import { getCompatibility } from "../getVersion"

export function serializeTxCertificatePreMultisig(
    certificate: ParsedCertificate,
) {
    switch (certificate.type) {
    case CertificateType.STAKE_REGISTRATION:
    case CertificateType.STAKE_DEREGISTRATION: {
        assert(certificate.stakeCredential.type == StakeCredentialType.KEY_PATH, InvalidDataReason.CERTIFICATE_INVALID_STAKE_CREDENTIAL)
        return Buffer.concat([
            uint8_to_buf(certificate.type as Uint8_t),
            path_to_buf(certificate.stakeCredential.path),
        ])
    }
    case CertificateType.STAKE_DELEGATION: {
        assert(certificate.stakeCredential.type == StakeCredentialType.KEY_PATH, InvalidDataReason.CERTIFICATE_INVALID_STAKE_CREDENTIAL)
        return Buffer.concat([
            uint8_to_buf(certificate.type as Uint8_t),
            path_to_buf(certificate.stakeCredential.path),
            hex_to_buf(certificate.poolKeyHashHex),
        ])
    }
    case CertificateType.STAKE_POOL_REGISTRATION: {
        return Buffer.concat([
            uint8_to_buf(certificate.type as Uint8_t),
        ])
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

export function serializeTxCertificate(
    certificate: ParsedCertificate,
    version: Version,
) {
    if (!getCompatibility(version).supportsScriptTransaction) {
        return serializeTxCertificatePreMultisig(certificate)
    }

    switch (certificate.type) {
    case CertificateType.STAKE_REGISTRATION:
    case CertificateType.STAKE_DEREGISTRATION: {
        return Buffer.concat([
            uint8_to_buf(certificate.type as Uint8_t),
            stake_credential_to_buf(certificate.stakeCredential),
        ])
    }
    case CertificateType.STAKE_DELEGATION: {
        return Buffer.concat([
            uint8_to_buf(certificate.type as Uint8_t),
            stake_credential_to_buf(certificate.stakeCredential),
            hex_to_buf(certificate.poolKeyHashHex),
        ])
    }
    case CertificateType.STAKE_POOL_REGISTRATION: {
        return Buffer.concat([
            uint8_to_buf(certificate.type as Uint8_t),
        ])
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
