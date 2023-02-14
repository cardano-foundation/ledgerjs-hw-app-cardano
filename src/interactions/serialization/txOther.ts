import { InvalidDataReason } from "../../errors/invalidDataReason"
import type { Int64_str, ParsedAssetGroup, ParsedInput, ParsedRequiredSigner, ParsedToken, ParsedWithdrawal, Uint8_t, Uint32_t, Uint64_str, ValidBIP32Path, Version} from "../../types/internal"
import      { RequiredSignerType , StakeCredentialType } from "../../types/internal"
import { assert, unreachable } from "../../utils/assert"
import { hex_to_buf, path_to_buf, stake_credential_to_buf, uint8_to_buf, uint32_to_buf, uint64_to_buf } from "../../utils/serialize"
import { getCompatibility } from "../getVersion"
import type {SerializeTokenAmountFn} from "../signTx"

export function serializeTxInput(
    input: ParsedInput
): Buffer {
    return Buffer.concat([
        hex_to_buf(input.txHashHex),
        uint32_to_buf(input.outputIndex),
    ])
}

export function serializeTxWithdrawal(
    withdrawal: ParsedWithdrawal,
    version: Version,
): Buffer {
    if (getCompatibility(version).supportsMultisigTransaction) {
        return Buffer.concat([
            uint64_to_buf(withdrawal.amount),
            stake_credential_to_buf(withdrawal.stakeCredential),
        ])
    } else {
        // pre-multisig
        assert(withdrawal.stakeCredential.type === StakeCredentialType.KEY_PATH, InvalidDataReason.WITHDRAWAL_INVALID_STAKE_CREDENTIAL)
        return Buffer.concat([
            uint64_to_buf(withdrawal.amount),
            path_to_buf(withdrawal.stakeCredential.path),
        ])
    }
}

export function serializeTxFee(
    fee: Uint64_str
): Buffer {
    return Buffer.concat([
        uint64_to_buf(fee),
    ])
}

export function serializeTxTtl(
    ttl: Uint64_str
): Buffer {
    return Buffer.concat([
        uint64_to_buf(ttl),
    ])
}

export function serializeTxValidityStart(
    validityIntervalStart: Uint64_str
): Buffer {
    return Buffer.concat([
        uint64_to_buf(validityIntervalStart),
    ])
}

export function serializeTxWitnessRequest(
    path: ValidBIP32Path
): Buffer {
    return Buffer.concat([
        path_to_buf(path),
    ])
}

export function serializeAssetGroup<T>(assetGroup: ParsedAssetGroup<T>): Buffer {
    return Buffer.concat([
        hex_to_buf(assetGroup.policyIdHex),
        uint32_to_buf(assetGroup.tokens.length as Uint32_t),
    ])
}

export function serializeToken<T>(token: ParsedToken<T>, serializeTokenAmountFn: SerializeTokenAmountFn<T>): Buffer {
    return Buffer.concat([
        uint32_to_buf(token.assetNameHex.length / 2 as Uint32_t),
        hex_to_buf(token.assetNameHex),
        serializeTokenAmountFn(token.amount),
    ])
}

export function serializeMintBasicParams(mint: Array<ParsedAssetGroup<Int64_str>>): Buffer {
    return Buffer.concat([
        uint32_to_buf(mint.length as Uint32_t),
    ])
}

export function serializeRequiredSigner(requiredSigner: ParsedRequiredSigner): Buffer {
    switch (requiredSigner.type) {
    case RequiredSignerType.PATH:
        return Buffer.concat([
            uint8_to_buf(requiredSigner.type as Uint8_t),
            path_to_buf(requiredSigner.path),
        ])
    case RequiredSignerType.HASH:
        return Buffer.concat([
            uint8_to_buf(requiredSigner.type as Uint8_t),
            hex_to_buf(requiredSigner.hashHex),
        ])
    default:
        unreachable(requiredSigner)
    }
}

export function serializeTotalCollateral(
    totalCollateral: Uint64_str
): Buffer {
    return Buffer.concat([
        uint64_to_buf(totalCollateral),
    ])
}
