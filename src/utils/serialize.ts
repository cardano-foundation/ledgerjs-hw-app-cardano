
import basex from "base-x";

import type { FixlenHexString, HexString, Uint8_t, Uint16_t, Uint32_t, Uint64_str } from "../types/internal";
import { assert } from './assert'
import { isHexString, isUint8, isUint16, isUint32, isUint64str, isValidPath } from "./parse";

// We use bs10 as an easy way to parse/encode amount strings
const bs10 = basex("0123456789");

export function uint8_to_buf(value: Uint8_t): Buffer {
    assert(isUint8(value), 'invalid uint8')
    const data = Buffer.alloc(1);
    data.writeUInt8(value, 0);
    return data;
}

export function uint16_to_buf(value: Uint16_t | Uint8_t): Buffer {
    assert(isUint16(value), 'invalid uint16')

    const data = Buffer.alloc(2);
    data.writeUInt16BE(value, 0);
    return data;
}

export function buf_to_uint16(data: Buffer): Uint16_t {
    assert(data.length === 2, "invalid uint16 buffer");

    return data.readUIntBE(0, 2) as Uint16_t;
}

export function uint32_to_buf(value: Uint32_t | Uint16_t | Uint8_t): Buffer {
    assert(isUint32(value), 'invalid uint32')

    const data = Buffer.alloc(4);
    data.writeUInt32BE(value, 0);
    return data;
}

export function buf_to_uint32(data: Buffer): Uint32_t {
    assert(data.length === 4, "invalid uint32 buffer");

    return data.readUIntBE(0, 4) as Uint32_t;
}

export function uint64_to_buf(value: Uint64_str): Buffer {
    assert(isUint64str(value), 'invalid uint64_str')

    const data = bs10.decode(value);
    assert(data.length <= 8, "excessive data");

    const padding = Buffer.alloc(8 - data.length);
    return Buffer.concat([padding, data]);
}

export function hex_to_buf(data: HexString | FixlenHexString<any>): Buffer {
    assert(isHexString(data), "invalid hex string");
    return Buffer.from(data, "hex");
}

export function buf_to_hex(data: Buffer): string {
    return data.toString("hex");
}

// no buf_to_uint8

export function path_to_buf(path: Array<number>): Buffer {
    assert(isValidPath(path), "invalid bip32 path");

    const data = Buffer.alloc(1 + 4 * path.length);
    data.writeUInt8(path.length, 0);

    for (let i = 0; i < path.length; i++) {
        data.writeUInt32BE(path[i], 1 + i * 4);
    }
    return data;
}
