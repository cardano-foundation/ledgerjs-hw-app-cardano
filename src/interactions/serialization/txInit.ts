import type { ParsedTransaction, Uint8_t, Uint32_t } from "../../types/internal";
import { uint8_to_buf, uint32_to_buf } from "../../utils/serialize";
import { SignTxIncluded } from "./txOutput";

const _serializePoolRegistrationCode = (
    isSigningPoolRegistrationAsOwner: boolean
): Buffer => {
    const PoolRegistrationCodes = {
        SIGN_TX_POOL_REGISTRATION_NO: 3,
        SIGN_TX_POOL_REGISTRATION_YES: 4,
    };

    return uint8_to_buf(
        (isSigningPoolRegistrationAsOwner
            ? PoolRegistrationCodes.SIGN_TX_POOL_REGISTRATION_YES
            : PoolRegistrationCodes.SIGN_TX_POOL_REGISTRATION_NO) as Uint8_t
    );
};

function _serializeOptionFlag(included: boolean) {
    return uint8_to_buf(
        (included
            ? SignTxIncluded.SIGN_TX_INCLUDED_YES
            : SignTxIncluded.SIGN_TX_INCLUDED_NO) as Uint8_t
    )
}

export function serializeTxInit(tx: ParsedTransaction, numWitnesses: number) {
    return Buffer.concat([
        uint8_to_buf(tx.network.networkId),
        uint32_to_buf(tx.network.protocolMagic),
        _serializeOptionFlag(tx.ttl != null),
        _serializeOptionFlag(tx.metadataHashHex != null),
        _serializeOptionFlag(tx.validityIntervalStart != null),
        _serializePoolRegistrationCode(tx.isSigningPoolRegistrationAsOwner),
        uint32_to_buf(tx.inputs.length as Uint32_t),
        uint32_to_buf(tx.outputs.length as Uint32_t),
        uint32_to_buf(tx.certificates.length as Uint32_t),
        uint32_to_buf(tx.withdrawals.length as Uint32_t),
        uint32_to_buf(numWitnesses as Uint32_t),
    ]);
}