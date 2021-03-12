import type { ParsedAddressParams, StakingChoice, Uint8_t } from "../../types/internal";
import { AddressType, StakingChoiceType, } from "../../types/internal";
import { hex_to_buf, path_to_buf, uint8_to_buf, uint32_to_buf, } from "../../utils/serialize";

function serializeStakingChoice(stakingChoice: StakingChoice): Buffer {
    const stakingChoicesEncoding = {
        [StakingChoiceType.NO_STAKING]: 0x11,
        [StakingChoiceType.STAKING_KEY_PATH]: 0x22,
        [StakingChoiceType.STAKING_KEY_HASH]: 0x33,
        [StakingChoiceType.BLOCKCHAIN_POINTER]: 0x44,
    } as const;

    switch (stakingChoice.type) {
        case StakingChoiceType.NO_STAKING: {
            return Buffer.concat([
                uint8_to_buf(stakingChoicesEncoding[stakingChoice.type] as Uint8_t)
            ])
        }
        case StakingChoiceType.STAKING_KEY_HASH: {
            return Buffer.concat([
                uint8_to_buf(stakingChoicesEncoding[stakingChoice.type] as Uint8_t),
                hex_to_buf(stakingChoice.hashHex)
            ])
        }
        case StakingChoiceType.STAKING_KEY_PATH: {
            return Buffer.concat([
                uint8_to_buf(stakingChoicesEncoding[stakingChoice.type] as Uint8_t),
                path_to_buf(stakingChoice.path)
            ])
        }
        case StakingChoiceType.BLOCKCHAIN_POINTER: {
            return Buffer.concat([
                uint8_to_buf(stakingChoicesEncoding[stakingChoice.type] as Uint8_t),
                uint32_to_buf(stakingChoice.pointer.blockIndex),
                uint32_to_buf(stakingChoice.pointer.txIndex),
                uint32_to_buf(stakingChoice.pointer.certificateIndex)
            ])
        }
    }
}

export function serializeAddressParams(
    params: ParsedAddressParams
): Buffer {
    return Buffer.concat([
        uint8_to_buf(params.type as Uint8_t),
        params.type === AddressType.BYRON
            ? uint32_to_buf(params.protocolMagic)
            : uint8_to_buf(params.networkId),
        path_to_buf(params.spendingPath),
        serializeStakingChoice(params.stakingChoice)
    ]);
}