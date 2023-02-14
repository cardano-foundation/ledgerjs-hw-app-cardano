import basex from "base-x"
import bech32 from "bech32"

import { InvalidDataReason } from "../errors"
import { AddressType, HARDENED } from "../types/public"
import { assert } from "../utils/assert"
import { isBuffer, isString, parseIntFromStr, validate } from "./parse"

const BASE58_ALPHABET =
    "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
const bs58 = basex(BASE58_ALPHABET)

const TESTNET_NETWORK_ID = 0x00

function parseBIP32Index(str: string, errMsg: InvalidDataReason): number {
    let base = 0
    if (str.endsWith("'")) {
        str = str.slice(0, -1)
        base = HARDENED
    }
    const i = parseIntFromStr(str, errMsg)
    validate(i >= 0, errMsg)
    validate(i < HARDENED, errMsg)
    return base + i
}

export function str_to_path(data: string): Array<number> {
    const errMsg = InvalidDataReason.INVALID_PATH
    validate(isString(data), errMsg)
    validate(data.length > 0, errMsg)

    return data.split("/").map((x: string): number => {
        return parseBIP32Index(x, errMsg)
    })
}


export function base58_encode(data: Buffer): string {
    assert(isBuffer(data), "invalid buffer")

    return bs58.encode(data)
}

const isValidBase58 = (data: unknown): data is string =>
    isString(data) && [...data].every(c => BASE58_ALPHABET.includes(c))

export function base58_decode(data: string): Buffer {
    assert(isValidBase58(data), "invalid base58 string")

    return bs58.decode(data)
}

// based on https://github.com/cardano-foundation/CIPs/pull/6/files
function getShelleyAddressPrefix(data: Buffer): string {
    let result = ""

    // eslint-disable-next-line no-bitwise
    const addressType = (data[0] & 0b11110000) >> 4
    switch (addressType) {
    case AddressType.REWARD_KEY:
    case AddressType.REWARD_SCRIPT:
        result = "stake"
        break
    default:
        result = "addr"
    }

    // eslint-disable-next-line no-bitwise
    const networkId = data[0] & 0b00001111
    if (networkId === TESTNET_NETWORK_ID) {
        result += "_test"
    }

    return result
}

export function bech32_encodeAddress(data: Buffer): string {
    assert(isBuffer(data), "invalid buffer")

    const data5bit = bech32.toWords(data)
    const MAX_HUMAN_ADDRESS_LENGTH = 150 // see cardano.h in https://github.com/vacuumlabs/ledger-app-cardano-shelley
    return bech32.encode(
        getShelleyAddressPrefix(data),
        data5bit,
        MAX_HUMAN_ADDRESS_LENGTH
    )
}

export function bech32_decodeAddress(data: string): Buffer {
    const { words } = bech32.decode(data, 1000)
    return Buffer.from(bech32.fromWords(words))
}
