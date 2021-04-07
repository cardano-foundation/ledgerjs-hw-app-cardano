import type { CatalystVotingPublicKey, ParsedAddressParams, Uint64_str,ValidBIP32Path } from "../../types/internal";
import { hex_to_buf, path_to_buf, uint64_to_buf } from "../../utils/serialize";
import { serializeAddressParams } from "./addressParams";

export function serializeCatalystRegistrationVotingKey(votingPublicKey: CatalystVotingPublicKey): Buffer {
    return Buffer.concat([
        hex_to_buf(votingPublicKey),
    ]);
}

export function serializeCatalystRegistrationStakingPath(stakingPath: ValidBIP32Path): Buffer {
    return Buffer.concat([
        path_to_buf(stakingPath),
    ]);
}

export function serializeCatalystRegistrationRewardsDestination(rewardsDestination: ParsedAddressParams): Buffer {
    return Buffer.concat([
        serializeAddressParams(rewardsDestination),
    ]);
}

export function serializeCatalystRegistrationNonce(nonce: Uint64_str): Buffer {
    return Buffer.concat([
        uint64_to_buf(nonce),
    ]);
}
