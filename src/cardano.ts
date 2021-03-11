import { hex_to_buf, path_to_buf, uint8_to_buf, uint16_to_buf, uint32_to_buf, uint64_to_buf } from "./serializeUtils";
import type { OutputDestination, ParsedAddressParams, ParsedOutput, ParsedPoolMetadata, ParsedPoolOwner, ParsedPoolParams, ParsedPoolRelay, StakingChoice, Uint8_t, Uint32_t, ValidBIP32Path } from "./types/internal";
import { AddressType, PoolOwnerType, RelayType, StakingChoiceType, TxOutputType } from "./types/internal";
import { unreachable } from "./utils";


export const SignTxIncluded = Object.freeze({
  SIGN_TX_INCLUDED_NO: 1,
  SIGN_TX_INCLUDED_YES: 2,
});

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

function serializeOutputDestination(destination: OutputDestination) {
  switch (destination.type) {
    case TxOutputType.SIGN_TX_OUTPUT_TYPE_ADDRESS_BYTES:
      return Buffer.concat([
        uint8_to_buf(destination.type as Uint8_t),
        uint32_to_buf(destination.addressHex.length / 2 as Uint32_t),
        hex_to_buf(destination.addressHex)
      ])
    case TxOutputType.SIGN_TX_OUTPUT_TYPE_ADDRESS_PARAMS:
      return Buffer.concat([
        uint8_to_buf(destination.type as Uint8_t),
        serializeAddressParams(destination.addressParams)
      ])
    default:
      unreachable(destination)
  }
}

export function serializeOutputBasicParams(
  output: ParsedOutput,
): Buffer {
  return Buffer.concat([
    serializeOutputDestination(output.destination),
    uint64_to_buf(output.amount),
    uint32_to_buf(output.tokenBundle.length as Uint32_t),
  ]);
}

export function serializePoolInitialParams(pool: ParsedPoolParams): Buffer {
  return Buffer.concat([
    hex_to_buf(pool.keyHashHex),
    hex_to_buf(pool.vrfHashHex),
    uint64_to_buf(pool.pledge),
    uint64_to_buf(pool.cost),
    uint64_to_buf(pool.margin.numerator),
    uint64_to_buf(pool.margin.denominator),
    hex_to_buf(pool.rewardAccountHex),
    uint32_to_buf(pool.owners.length as Uint32_t),
    uint32_to_buf(pool.relays.length as Uint32_t),
  ]);
}

export function serializePoolOwner(owner: ParsedPoolOwner): Buffer {
  switch (owner.type) {
    case PoolOwnerType.PATH: {
      return Buffer.concat([
        uint8_to_buf(owner.type as Uint8_t),
        path_to_buf(owner.path)
      ])
    }
    case PoolOwnerType.KEY_HASH: {
      return Buffer.concat([
        uint8_to_buf(owner.type as Uint8_t),
        hex_to_buf(owner.hashHex)
      ])
    }
    default:
      unreachable(owner)
  }
}

export function serializePoolRelay(relay: ParsedPoolRelay): Buffer {
  function serializeOptional<T>(x: T | null, cb: (t: T) => Buffer): Buffer {
    const enum Optional {
      None = 1,
      Some = 2
    }

    if (x == null) {
      return uint8_to_buf(Optional.None as Uint8_t)
    } else {
      return Buffer.concat([
        uint8_to_buf(Optional.Some as Uint8_t),
        cb(x)
      ])
    }
  }

  switch (relay.type) {
    case RelayType.SingleHostAddr: {
      return Buffer.concat([
        uint8_to_buf(relay.type as Uint8_t),
        serializeOptional(relay.port, port => uint16_to_buf(port)),
        serializeOptional(relay.ipv4, ipv4 => ipv4),
        serializeOptional(relay.ipv6, ipv6 => ipv6)
      ])
    }
    case RelayType.SingleHostName: {
      return Buffer.concat([
        uint8_to_buf(relay.type as Uint8_t),
        serializeOptional(relay.port, port => uint16_to_buf(port)),
        Buffer.from(relay.dnsName, "ascii")
      ])
    }
    case RelayType.MultiHostName: {
      return Buffer.concat([
        uint8_to_buf(relay.type as Uint8_t),
        Buffer.from(relay.dnsName, "ascii")
      ])
    }
    default:
      unreachable(relay)
  }
}

export function serializePoolMetadata(
  metadata: ParsedPoolMetadata | null
): Buffer {
  if (metadata == null) {
    return Buffer.concat([
      uint8_to_buf(SignTxIncluded.SIGN_TX_INCLUDED_NO as Uint8_t)
    ])
  } else {
    return Buffer.concat([
      uint8_to_buf(SignTxIncluded.SIGN_TX_INCLUDED_YES as Uint8_t),
      hex_to_buf(metadata.hashHex),
      Buffer.from(metadata.url, 'ascii')
    ])
  }
}

export function serializeGetExtendedPublicKeyParams(path: ValidBIP32Path): Buffer {
  return Buffer.concat([
    path_to_buf(path),
  ])
}

export default {
  serializeGetExtendedPublicKeyParams,
  serializeAddressParams,
  serializeOutputBasicParams,
  serializePoolInitialParams,
  serializePoolOwner,
  serializePoolRelay,
  serializePoolMetadata,
};
