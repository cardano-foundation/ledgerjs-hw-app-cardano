import type { OutputDestination, ParsedAssetGroup, ParsedOutput, ParsedToken, Uint8_t, Uint32_t } from "../../types/internal";
import { TxOutputDestinationType } from "../../types/internal";
import { unreachable } from "../../utils/assert";
import { hex_to_buf, uint8_to_buf, uint32_to_buf, uint64_to_buf } from "../../utils/serialize";
import { serializeAddressParams } from "./addressParams";

function serializeTxOutputDestination(destination: OutputDestination) {
  const typeEncoding = {
    [TxOutputDestinationType.THIRD_PARTY]: 1 as Uint8_t,
    [TxOutputDestinationType.DEVICE_OWNED]: 2 as Uint8_t,
  }

  switch (destination.type) {
    case TxOutputDestinationType.THIRD_PARTY:
      return Buffer.concat([
        uint8_to_buf(typeEncoding[destination.type]),
        uint32_to_buf(destination.addressHex.length / 2 as Uint32_t),
        hex_to_buf(destination.addressHex)
      ])
    case TxOutputDestinationType.DEVICE_OWNED:
      return Buffer.concat([
        uint8_to_buf(typeEncoding[destination.type]),
        serializeAddressParams(destination.addressParams)
      ])
    default:
      unreachable(destination)
  }
}

export function serializeTxOutputBasicParams(
  output: ParsedOutput,
): Buffer {
  return Buffer.concat([
    serializeTxOutputDestination(output.destination),
    uint64_to_buf(output.amount),
    uint32_to_buf(output.tokenBundle.length as Uint32_t),
  ]);
}

export function serializeAssetGroup(
  assetGroup: ParsedAssetGroup
) {
  return Buffer.concat([
    hex_to_buf(assetGroup.policyIdHex),
    uint32_to_buf(assetGroup.tokens.length as Uint32_t),
  ]);
}

export function serializeToken(
  token: ParsedToken
) {
  return Buffer.concat([
    uint32_to_buf(token.assetNameHex.length / 2 as Uint32_t),
    hex_to_buf(token.assetNameHex),
    uint64_to_buf(token.amount),
  ]);
}
