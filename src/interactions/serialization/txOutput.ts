import type { OutputDestination, ParsedAssetGroup, ParsedOutput, ParsedToken, Uint8_t, Uint32_t } from "../../types/internal";
import { TxOutputType } from "../../types/internal";
import { unreachable } from "../../utils/assert";
import { hex_to_buf, uint8_to_buf, uint32_to_buf, uint64_to_buf } from "../../utils/serialize";
import { serializeAddressParams } from "./addressParams";


export const SignTxIncluded = Object.freeze({
  SIGN_TX_INCLUDED_NO: 1,
  SIGN_TX_INCLUDED_YES: 2,
});

function serializeTxOutputDestination(destination: OutputDestination) {
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
