import basex from "base-x";
import bech32 from "bech32";

import { AddressType } from "./Ada";
import cardano from "./cardano";
import { isArray, isBuffer, isInteger, isString, parseIntFromStr, validate } from "./parseUtils";
import { buf_to_hex, hex_to_buf, path_to_buf, uint32_to_buf } from './serializeUtils'

const BASE58_ALPHABET =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const bs58 = basex(BASE58_ALPHABET);

const TESTNET_NETWORK_ID = 0x00;

export function assert(cond: boolean, errMsg: string): asserts cond {
  if (!cond) throw new Error('Assertion failed' + errMsg ? ': ' + errMsg : '')
}

export function unreachable(_val: never): never {
  assert(false, 'Unreachable code hit')
}

// A function usable to enforce invariants in the code that are
// recognized by Flow, relies on https://github.com/facebook/flow/issues/2617
export function invariant(cond: boolean, errMsg: string = "Invariant failed"): asserts cond {
  if (!cond) throw new Error(errMsg);
}

function parseBIP32Index(str: string, errMsg: string): number {
  let base = 0;
  if (str.endsWith("'")) {
    str = str.slice(0, -1);
    base = cardano.HARDENED;
  }
  const i = parseIntFromStr(str, errMsg);
  validate(i >= 0, errMsg);
  validate(i < cardano.HARDENED, errMsg);
  return base + i;
}

export function str_to_path(data: string): Array<number> {
  const errMsg = "invalid bip32 path string ";
  validate(isString(data), errMsg);
  validate(data.length > 0, errMsg);

  return data.split("/").map(function (x: string): number {
    return parseBIP32Index(x, errMsg + data + " because of " + x);
  });
}

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
  const retcode = response.slice(L, L + 2);

  if (retcode.toString("hex") != "9000")
    throw new Error(`Invalid retcode ${retcode.toString("hex")}`);
  return response.slice(0, L);
}


export function base58_encode(data: Buffer): string {
  assert(isBuffer(data), "invalid buffer");

  return bs58.encode(data);
}

const isValidBase58 = (data: unknown): data is string =>
  isString(data) && [...data].every(c => BASE58_ALPHABET.includes(c))

export function base58_decode(data: string): Buffer {
  assert(isValidBase58(data), "invalid base58 string");

  return bs58.decode(data);
}

export function bech32_encodeAddress(data: Buffer): string {
  assert(isBuffer(data), "invalid buffer");

  const data5bit = bech32.toWords(data);
  const MAX_HUMAN_ADDRESS_LENGTH = 150; // see cardano.h in https://github.com/vacuumlabs/ledger-app-cardano-shelley
  return bech32.encode(
    getShelleyAddressPrefix(data),
    data5bit,
    MAX_HUMAN_ADDRESS_LENGTH
  );
}

// based on https://github.com/cardano-foundation/CIPs/pull/6/files
function getShelleyAddressPrefix(data: Buffer): string {
  let result = "";

  const addressType = (data[0] & 0b11110000) >> 4;
  switch (addressType) {
    case AddressType.REWARD:
      result = "stake";
      break;
    default:
      result = "addr";
  }

  const networkId = data[0] & 0b00001111;
  if (networkId === TESTNET_NETWORK_ID) {
    result += "_test";
  }

  return result;
}

export function bech32_decodeAddress(data: string): Buffer {
  const { words } = bech32.decode(data, 1000);
  return Buffer.from(bech32.fromWords(words));
}

export default {
  // reexporting for tests
  // FIXME: following is workaround for cyclic import runtime resolve issues
  hex_to_buf: (data: any) => hex_to_buf(data),
  buf_to_hex: (data: any) => buf_to_hex(data),
  path_to_buf: (data: any) => path_to_buf(data),
  uint32_to_buf: (data: any) => uint32_to_buf(data),

  assert,

  str_to_path,

  base58_encode,
  base58_decode,

  bech32_encodeAddress,
  bech32_decodeAddress,

  chunkBy,
  stripRetcodeFromResponse,
};
