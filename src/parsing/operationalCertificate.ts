import { InvalidDataReason } from "../errors/invalidDataReason";
import type { ParsedOperationalCertificate } from "../types/internal";
import { KES_PUBLIC_KEY_LENGTH } from "../types/internal";
import type { OperationalCertificate } from "../types/public";
import { parseBIP32Path, parseHexStringOfLength, parseUint64_str } from "../utils/parse";

export function parseOperationalCertificate(
    operationalCertificate: OperationalCertificate
): ParsedOperationalCertificate {
    return {
        kesPublicKeyHex: parseHexStringOfLength(operationalCertificate.kesPublicKeyHex, KES_PUBLIC_KEY_LENGTH, InvalidDataReason.OPERATIONAL_CERTIFICATE_INVALID_KES_KEY),
        kesPeriod: parseUint64_str(operationalCertificate.kesPeriod, {}, InvalidDataReason.OPERATIONAL_CERTIFICATE_INVALID_KES_PERIOD),
        issueCounter: parseUint64_str(operationalCertificate.issueCounter, {}, InvalidDataReason.OPERATIONAL_CERTIFICATE_INVALID_ISSUE_COUNTER),
        coldKeyPath: parseBIP32Path(operationalCertificate.coldKeyPath, InvalidDataReason.OPERATIONAL_CERTIFICATE_INVALID_COLD_KEY_PATH),
    }
}
