import type { ParsedOperationalCertificate } from "../../types/internal";
import { hex_to_buf, path_to_buf, uint64_to_buf, } from "../../utils/serialize";

export function serializeOperationalCertificate(
    { kesPublicKeyHex, kesPeriod, issueCounter, coldKeyPath }: ParsedOperationalCertificate
): Buffer {
    return Buffer.concat([
        hex_to_buf(kesPublicKeyHex),
        uint64_to_buf(kesPeriod),
        uint64_to_buf(issueCounter),
        path_to_buf(coldKeyPath)
    ]);
}
