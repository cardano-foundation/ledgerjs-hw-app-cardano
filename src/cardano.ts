import type { Network, TxOutput } from "./Ada";
import { TxOutputType } from "./Ada";
import type { ParsedAddressParams, ParsedPoolMetadata, ParsedPoolOwner, ParsedPoolParams, ParsedPoolRelay, StakingChoice, ValidBIP32Path } from "./parsing";
import { parseAddressParams } from "./parsing";
import { StakingChoiceType } from "./parsing";
import { KEY_HASH_LENGTH, TX_HASH_LENGTH } from "./parsing";
import { AddressTypeNibble, PoolOwnerType, RelayType } from "./parsing";
import { TxErrors } from "./txErrors";
import utils, { Precondition, unreachable } from "./utils";

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

export function serializeOutputBasicParams(
  output: TxOutput,
  network: Network,
): Buffer {
  Precondition.checkIsValidAdaAmount(output.amountStr);
  let outputType;
  let addressBuf;

  if ("addressHex" in output && output.addressHex) {
    outputType = TxOutputType.SIGN_TX_OUTPUT_TYPE_ADDRESS_BYTES;

    Precondition.checkIsHexString(
      output.addressHex,
      TxErrors.OUTPUT_INVALID_ADDRESS
    );
    Precondition.check(
      output.addressHex.length <= 128 * 2,
      TxErrors.OUTPUT_INVALID_ADDRESS
    );
    addressBuf = Buffer.concat([
      utils.uint32_to_buf(output.addressHex.length / 2),
      utils.hex_to_buf(output.addressHex),
    ]);
  } else if ("spendingPath" in output && output.spendingPath) {
    outputType = TxOutputType.SIGN_TX_OUTPUT_TYPE_ADDRESS_PARAMS;

    const parsed = parseAddressParams({
      addressTypeNibble: output.addressTypeNibble,
      networkIdOrProtocolMagic: output.addressTypeNibble === AddressTypeNibble.BYRON
        ? network.protocolMagic
        : network.networkId,
      spendingPath: output.spendingPath,
      stakingPath: output.stakingPath,
      stakingKeyHashHex: output.stakingKeyHashHex,
      stakingBlockchainPointer: output.stakingBlockchainPointer
    });
    addressBuf = serializeAddressParams(parsed)

  } else {
    throw new Error(TxErrors.OUTPUT_UNKNOWN_TYPE);
  }

  const numassetGroups = output.tokenBundle ? output.tokenBundle.length : 0;

  return Buffer.concat([
    utils.uint8_to_buf(outputType),
    addressBuf,
    utils.ada_amount_to_buf(output.amountStr),
    utils.uint32_to_buf(numassetGroups),
  ]);
}

// TODO remove after ledger app 2.2 is widespread
export function serializeOutputBasicParamsBefore_2_2(
  output: TxOutput,
  network: Network
): Buffer {
  Precondition.checkIsValidAdaAmount(output.amountStr);

  if ("addressHex" in output && output.addressHex) {
    Precondition.checkIsHexString(
      output.addressHex,
      TxErrors.OUTPUT_INVALID_ADDRESS
    );
    Precondition.check(
      output.addressHex.length <= 128 * 2,
      TxErrors.OUTPUT_INVALID_ADDRESS
    );

    return Buffer.concat([
      utils.ada_amount_to_buf(output.amountStr),
      utils.uint8_to_buf(TxOutputType.SIGN_TX_OUTPUT_TYPE_ADDRESS_BYTES),
      utils.hex_to_buf(output.addressHex),
    ]);
  } else if ('spendingPath' in output && output.spendingPath) {
    const parsed = parseAddressParams({
      addressTypeNibble: output.addressTypeNibble,
      networkIdOrProtocolMagic: output.addressTypeNibble === AddressTypeNibble.BYRON
        ? network.protocolMagic
        : network.networkId,
      spendingPath: output.spendingPath,
      stakingPath: output.stakingPath,
      stakingKeyHashHex: output.stakingKeyHashHex,
      stakingBlockchainPointer: output.stakingBlockchainPointer
    })

    return Buffer.concat([
      utils.ada_amount_to_buf(output.amountStr),
      utils.uint8_to_buf(TxOutputType.SIGN_TX_OUTPUT_TYPE_ADDRESS_PARAMS),
      serializeAddressParams(parsed),
    ]);
  } else {
    throw new Error(TxErrors.OUTPUT_UNKNOWN_TYPE);
  }
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
