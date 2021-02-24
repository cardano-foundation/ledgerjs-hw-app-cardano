import { TxOutputType } from "./Ada";
import type { OutputDestination, ParsedAddressParams, ParsedOutput, ParsedPoolMetadata, ParsedPoolOwner, ParsedPoolParams, ParsedPoolRelay, StakingChoice, ValidBIP32Path } from "./parsing";
import { StakingChoiceType } from "./parsing";
import { KEY_HASH_LENGTH, TX_HASH_LENGTH } from "./parsing";
import { AddressTypeNibble, PoolOwnerType, RelayType } from "./parsing";
import utils, { assert, unreachable } from "./utils";

const HARDENED = 0x80000000;

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
        utils.uint8_to_buf(stakingChoicesEncoding[stakingChoice.type])
      ])
    }
    case StakingChoiceType.STAKING_KEY_HASH: {
      return Buffer.concat([
        utils.uint8_to_buf(stakingChoicesEncoding[stakingChoice.type]),
        utils.hex_to_buf(stakingChoice.hashHex)
      ])
    }
    case StakingChoiceType.STAKING_KEY_PATH: {
      return Buffer.concat([
        utils.uint8_to_buf(stakingChoicesEncoding[stakingChoice.type]),
        utils.path_to_buf(stakingChoice.path)
      ])
    }
    case StakingChoiceType.BLOCKCHAIN_POINTER: {
      return Buffer.concat([
        utils.uint8_to_buf(stakingChoicesEncoding[stakingChoice.type]),
        utils.uint32_to_buf(stakingChoice.pointer.blockIndex),
        utils.uint32_to_buf(stakingChoice.pointer.txIndex),
        utils.uint32_to_buf(stakingChoice.pointer.certificateIndex)
      ])
    }
  }
}

export function serializeAddressParams(
  params: ParsedAddressParams
): Buffer {
  return Buffer.concat([
    utils.uint8_to_buf(params.type),
    params.type === AddressTypeNibble.BYRON
      ? utils.uint32_to_buf(params.protocolMagic)
      : utils.uint8_to_buf(params.networkId),
    utils.path_to_buf(params.spendingPath),
    serializeStakingChoice(params.stakingChoice)
  ]);
}

function serializeOutputDestination(destination: OutputDestination) {
  switch (destination.type) {
    case TxOutputType.SIGN_TX_OUTPUT_TYPE_ADDRESS_BYTES:
      return Buffer.concat([
        utils.uint8_to_buf(destination.type),
        utils.uint32_to_buf(destination.addressHex.length / 2),
        utils.hex_to_buf(destination.addressHex)
      ])
    case TxOutputType.SIGN_TX_OUTPUT_TYPE_ADDRESS_PARAMS:
      return Buffer.concat([
        utils.uint8_to_buf(destination.type),
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
    utils.ada_amount_to_buf(output.amountStr),
    utils.uint32_to_buf(output.tokenBundle.length),
  ]);
}

// TODO remove after ledger app 2.2 is widespread
export function serializeOutputBasicParamsBefore_2_2(
  output: ParsedOutput,
): Buffer {
  assert(output.tokenBundle.length === 0, 'Invalid assets length')

  return Buffer.concat([
    // Note: different ordering from 2.2 version
    utils.ada_amount_to_buf(output.amountStr),
    serializeOutputDestination(output.destination)
  ])
}

export function serializePoolInitialParams(pool: ParsedPoolParams): Buffer {
  return Buffer.concat([
    utils.hex_to_buf(pool.keyHashHex),
    utils.hex_to_buf(pool.vrfHashHex),
    utils.uint64_to_buf(pool.pledgeStr),
    utils.uint64_to_buf(pool.costStr),
    utils.uint64_to_buf(pool.margin.numeratorStr),
    utils.uint64_to_buf(pool.margin.denominatorStr),
    utils.hex_to_buf(pool.rewardAccountHex),
    utils.uint32_to_buf(pool.owners.length),
    utils.uint32_to_buf(pool.relays.length),
  ]);
}

export function serializePoolOwner(owner: ParsedPoolOwner): Buffer {
  switch (owner.type) {
    case PoolOwnerType.PATH: {
      return Buffer.concat([
        utils.uint8_to_buf(owner.type),
        utils.path_to_buf(owner.path)
      ])
    }
    case PoolOwnerType.KEY_HASH: {
      return Buffer.concat([
        utils.uint8_to_buf(owner.type),
        utils.hex_to_buf(owner.hashHex)
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
      return utils.uint8_to_buf(Optional.None)
    } else {
      return Buffer.concat([
        utils.uint8_to_buf(Optional.Some),
        cb(x)
      ])
    }
  }

  switch (relay.type) {
    case RelayType.SingleHostAddr: {
      return Buffer.concat([
        utils.uint8_to_buf(relay.type),
        serializeOptional(relay.port, port => utils.uint16_to_buf(port)),
        serializeOptional(relay.ipv4, ipv4 => ipv4),
        serializeOptional(relay.ipv6, ipv6 => ipv6)
      ])
    }
    case RelayType.SingleHostName: {
      return Buffer.concat([
        utils.uint8_to_buf(relay.type),
        serializeOptional(relay.port, port => utils.uint16_to_buf(port)),
        Buffer.from(relay.dnsName, "ascii")
      ])
    }
    case RelayType.MultiHostName: {
      return Buffer.concat([
        utils.uint8_to_buf(relay.type),
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
      utils.uint8_to_buf(SignTxIncluded.SIGN_TX_INCLUDED_NO)
    ])
  } else {
    return Buffer.concat([
      utils.uint8_to_buf(SignTxIncluded.SIGN_TX_INCLUDED_YES),
      utils.hex_to_buf(metadata.hashHex),
      Buffer.from(metadata.url, 'ascii')
    ])
  }
}

export function serializeGetExtendedPublicKeyParams(path: ValidBIP32Path): Buffer {
  return Buffer.concat([
    utils.path_to_buf(path),
  ])
}

export default {
  HARDENED,
  AddressTypeNibble,
  KEY_HASH_LENGTH,
  TX_HASH_LENGTH,

  serializeGetExtendedPublicKeyParams,
  serializeAddressParams,
  serializeOutputBasicParams,
  serializeOutputBasicParamsBefore_2_2,
  serializePoolInitialParams,
  serializePoolOwner,
  serializePoolRelay,
  serializePoolMetadata,
};
