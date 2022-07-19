import type {OutputDestination, ParsedOutput, Uint32_t, Uint8_t} from "../../types/internal"
import {TxOutputDestinationType} from "../../types/internal"
import type {Version} from "../../types/public"
import {DatumType, TxOutputType} from "../../types/public"
import {unreachable} from "../../utils/assert"
import {hex_to_buf, serializeOptionFlag, uint32_to_buf, uint64_to_buf, uint8_to_buf} from "../../utils/serialize"
import {getCompatibility} from "../getVersion"
import {serializeAddressParams} from "./addressParams"

function serializeTxOutputDestination(
    destination: OutputDestination,
    version: Version,) {
    const typeEncoding = {
        [TxOutputDestinationType.THIRD_PARTY]: 1 as Uint8_t,
        [TxOutputDestinationType.DEVICE_OWNED]: 2 as Uint8_t,
        [TxOutputDestinationType.THIRD_PARTY_MAP]: 3 as Uint8_t,
        [TxOutputDestinationType.DEVICE_OWNED_MAP]: 4 as Uint8_t,
    }

    switch (destination.type) {
    case TxOutputDestinationType.THIRD_PARTY:
    case TxOutputDestinationType.THIRD_PARTY_MAP:
        return Buffer.concat([
            uint8_to_buf(typeEncoding[destination.type]),
            uint32_to_buf(destination.addressHex.length / 2 as Uint32_t),
            hex_to_buf(destination.addressHex),
        ])
    case TxOutputDestinationType.DEVICE_OWNED:
    case TxOutputDestinationType.DEVICE_OWNED_MAP:
        return Buffer.concat([
            uint8_to_buf(typeEncoding[destination.type]),
            serializeAddressParams(destination.addressParams, version),
        ])
    default:
        unreachable(destination)
    }
}

export function serializeTxOutputBasicParams(
    output: ParsedOutput,
    version: Version,
): Buffer {
    const hasDatumHex = (output.type === TxOutputType.MAP_BABBAGE && output.datum?.type === DatumType.HASH) ||(output.type !== TxOutputType.MAP_BABBAGE && output.datumHashHex != null)
    const datumHashHexBuffer = getCompatibility(version).supportsAlonzo
        ? serializeOptionFlag(hasDatumHex)
        : Buffer.from([])

    return Buffer.concat([
        serializeTxOutputDestination(output.destination, version),
        uint64_to_buf(output.amount),
        uint32_to_buf(output.tokenBundle.length as Uint32_t),
        datumHashHexBuffer,
    ])
}
