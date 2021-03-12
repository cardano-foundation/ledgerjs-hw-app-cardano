import { assert } from "./assert";
import { isArray, isBuffer, isInteger } from "./parse";
import { buf_to_uint16 } from "./serialize";

const sum = (arr: Array<number>) => arr.reduce((x, y) => x + y, 0);

export function chunkBy(data: Buffer, chunkLengths: Array<number>) {
    assert(isBuffer(data), "invalid buffer");
    assert(isArray(chunkLengths), "invalid chunks");
    for (const len of chunkLengths) {
        assert(isInteger(len), "bad chunk length");
        assert(len > 0, "bad chunk length");
    }
    assert(data.length <= sum(chunkLengths), "data too short");

    let offset = 0;
    const result = [];

    const restLength = data.length - sum(chunkLengths);

    for (let c of [...chunkLengths, restLength]) {
        result.push(data.slice(offset, offset + c));

        offset += c;
    }

    return result;
}

export function stripRetcodeFromResponse(response: Buffer): Buffer {
    assert(isBuffer(response), "invalid buffer");
    assert(response.length >= 2, "response too short");

    const L = response.length - 2;
    const retcode = buf_to_uint16(response.slice(L, L + 2));
    assert(retcode === 0x9000, `Invalid retcode ${retcode}`)
    return response.slice(0, L);
}