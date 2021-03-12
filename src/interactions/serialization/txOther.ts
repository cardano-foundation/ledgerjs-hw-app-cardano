import type { HexString, ParsedInput, ParsedWithdrawal, Uint64_str, ValidBIP32Path } from "../../types/internal";
import { hex_to_buf, path_to_buf, uint32_to_buf, uint64_to_buf } from "../../utils/serialize";

export function serializeTxInput(
    input: ParsedInput
) {
    return Buffer.concat([
        hex_to_buf(input.txHashHex),
        uint32_to_buf(input.outputIndex),
    ])
}

export function serializeTxWithdrawal(
    withdrawal: ParsedWithdrawal
) {
    return Buffer.concat([
        uint64_to_buf(withdrawal.amount),
        path_to_buf(withdrawal.path),
    ]);
}

export function serializeTxFee(
    fee: Uint64_str
) {
    return Buffer.concat([
        uint64_to_buf(fee)
    ]);
}

export function serializeTxTtl(
    ttl: Uint64_str
) {
    return Buffer.concat([
        uint64_to_buf(ttl)
    ]);
}

export function serializeTxMetadata(
    metadataHashHex: HexString
) {
    return Buffer.concat([
        hex_to_buf(metadataHashHex)
    ])
}

export function serializeTxValidityStart(
    validityIntervalStart: Uint64_str
) {
    return Buffer.concat([
        uint64_to_buf(validityIntervalStart)
    ]);
}

export function serializeTxWitnessRequest(
    path: ValidBIP32Path
) {
    return Buffer.concat([
        path_to_buf(path)
    ]);
}