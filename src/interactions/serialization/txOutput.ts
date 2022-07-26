import {InvalidDataReason} from "../../errors"
import {MAX_DATUM_CHUNK_SIZE} from "../../parsing/constants"
import type {HexString,OutputDestination, ParsedOutput, Uint8_t, Uint32_t} from "../../types/internal"
import {DATUM_HASH_LENGTH, TxOutputDestinationType} from "../../types/internal"
import type {Version} from "../../types/public"
import {DatumType, TxOutputType} from "../../types/public"
import {unreachable} from "../../utils/assert"
import {parseHexStringOfLength, parseUint8_t} from "../../utils/parse"
import {
    hex_to_buf,
    serializeOptionFlag,
    uint8_to_buf,
    uint32_to_buf,
    uint64_to_buf} from "../../utils/serialize"
import {getCompatibility} from "../getVersion"
import {serializeAddressParams} from "./addressParams"

function serializeTxOutputDestination(
    destination: OutputDestination,
    version: Version,) {
    const typeEncoding = {
        [TxOutputDestinationType.THIRD_PARTY]: 1 as Uint8_t,
        [TxOutputDestinationType.DEVICE_OWNED]: 2 as Uint8_t,
    }

    switch (destination.type) {
    case TxOutputDestinationType.THIRD_PARTY:
        return Buffer.concat([
            uint8_to_buf(typeEncoding[destination.type]),
            uint32_to_buf(destination.addressHex.length / 2 as Uint32_t),
            hex_to_buf(destination.addressHex),
        ])
    case TxOutputDestinationType.DEVICE_OWNED:
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
    const hasDatumOption = output.type === TxOutputType.MAP_BABBAGE
        ? output.datum != null
        : output.datumHashHex != null

    const datumOptionBuffer = getCompatibility(version).supportsAlonzo
        ? serializeOptionFlag(hasDatumOption)
        : Buffer.from([])

    const serializationFormat = parseUint8_t(output.type === undefined
        ? TxOutputType.ARRAY_LEGACY
        : output.type, InvalidDataReason.OUTPUT_INVALID_FORMAT)
    //TODO: maybe null for unsupported version?

    return Buffer.concat([
        uint8_to_buf(serializationFormat),
        serializeTxOutputDestination(output.destination, version),
        uint64_to_buf(output.amount),
        uint32_to_buf(output.tokenBundle.length as Uint32_t),
        datumOptionBuffer,
    ])
}

export function serializeTxOutputDatum(
    output: ParsedOutput,
    version: Version,
): Buffer {

    if (output.type === TxOutputType.MAP_BABBAGE) {

        switch (output.datum?.type) {
        case DatumType.HASH: {
            const datumHashHex = parseHexStringOfLength(output.datum.datumHashHex, DATUM_HASH_LENGTH, InvalidDataReason.OUTPUT_INVALID_DATUM_HASH)
            return Buffer.concat([
                uint8_to_buf(DatumType.HASH as Uint8_t),
                hex_to_buf(datumHashHex),
            ])
        }

        case DatumType.INLINE: {
            const totalDatumSize = output.datum.datumHex.length / 2
            let datumHex

            if (totalDatumSize > MAX_DATUM_CHUNK_SIZE ) {
                // datumHex = parseHexStringOfLength(output.datum.datumHex.substr(0, MAX_DATUM_CHUNK_SIZE * 2), MAX_DATUM_CHUNK_SIZE, InvalidDataReason.OUTPUT_INVALID_INLINE_DATUM)
                datumHex = output.datum.datumHex.substr(0, MAX_DATUM_CHUNK_SIZE * 2) as HexString
            } else {
                // datumHex = parseHexStringOfLength(output.datum.datumHex, output.datum.datumHex.length / 2, InvalidDataReason.OUTPUT_INVALID_INLINE_DATUM)
                datumHex = output.datum.datumHex as HexString
            }
            const chunkSize = datumHex.length / 2

            return Buffer.concat([
                uint8_to_buf(DatumType.INLINE as Uint8_t),
                uint32_to_buf(totalDatumSize as Uint32_t),
                uint32_to_buf(chunkSize as Uint32_t), //First chunk
                hex_to_buf(datumHex),
            ])
        }

        default:
            return Buffer.concat([])
        }

    } else {    //  Alonzo Format
        const datumHashHex = parseHexStringOfLength(output.datumHashHex, DATUM_HASH_LENGTH, InvalidDataReason.OUTPUT_INVALID_DATUM_HASH)
        return Buffer.concat([
            uint8_to_buf(DatumType.HASH as Uint8_t),
            hex_to_buf(datumHashHex),
        ])
    }
}

