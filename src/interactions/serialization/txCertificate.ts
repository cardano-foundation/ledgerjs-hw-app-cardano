import type { ParsedCertificate, Uint8_t } from "../../types/internal";
import { CertificateType } from "../../types/internal";
import { unreachable } from "../../utils/assert";
import { hex_to_buf, path_to_buf, uint8_to_buf } from "../../utils/serialize";

export function serializeTxCertificate(
    certificate: ParsedCertificate,
) {

    switch (certificate.type) {
        case CertificateType.STAKE_REGISTRATION:
        case CertificateType.STAKE_DEREGISTRATION: {
            return Buffer.concat([
                uint8_to_buf(certificate.type as Uint8_t),
                path_to_buf(certificate.path)
            ])
        }
        case CertificateType.STAKE_DELEGATION: {
            return Buffer.concat([
                uint8_to_buf(certificate.type as Uint8_t),
                path_to_buf(certificate.path),
                hex_to_buf(certificate.poolKeyHashHex)
            ])
        }
        case CertificateType.STAKE_POOL_REGISTRATION: {
            return Buffer.concat([
                uint8_to_buf(certificate.type as Uint8_t),
            ])
        }
        default:
            unreachable(certificate)
    }
}