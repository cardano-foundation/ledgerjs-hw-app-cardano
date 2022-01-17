import type { NativeScript} from "../../../src/Ada"
import { InvalidDataReason, NativeScriptHashDisplayFormat, NativeScriptType } from "../../../src/Ada"
import { str_to_path } from "../../../src/utils/address"

type ValidNativeScriptTestcase = {
    testname: string;
    script: NativeScript;
    displayFormat: NativeScriptHashDisplayFormat;
    hash: string;
}

export const ValidNativeScriptTestcases: ValidNativeScriptTestcase[] = [
    {
        testname: "PUBKEY - device owned",
        script: {
            type: NativeScriptType.PUBKEY_DEVICE_OWNED,
            params: {
                path: str_to_path("1852'/1815'/0'/0/0"),
            },
        },
        displayFormat: NativeScriptHashDisplayFormat.BECH32,
        hash: "5102a193b3d5f0c256fcc425836ffb15e7d96d3389f5e57dc6bea726",
    },
    {
        testname: "PUBKEY - third party",
        script: {
            type: NativeScriptType.PUBKEY_THIRD_PARTY,
            params: {
                keyHashHex: "3a55d9f68255dfbefa1efd711f82d005fae1be2e145d616c90cf0fa9",
            },
        },
        displayFormat: NativeScriptHashDisplayFormat.BECH32,
        hash: "855228f5ecececf9c85618007cc3c2e5bdf5e6d41ef8d6fa793fe0eb",
    },
    {
        testname: "PUBKEY - third party (script hash displayed as policy id)",
        script: {
            type: NativeScriptType.PUBKEY_THIRD_PARTY,
            params: {
                keyHashHex: "3a55d9f68255dfbefa1efd711f82d005fae1be2e145d616c90cf0fa9",
            },
        },
        displayFormat: NativeScriptHashDisplayFormat.POLICY_ID,
        hash: "855228f5ecececf9c85618007cc3c2e5bdf5e6d41ef8d6fa793fe0eb",
    },
    {
        testname: "ALL script",
        script: {
            type: NativeScriptType.ALL,
            params: {
                scripts: [
                    {
                        type: NativeScriptType.PUBKEY_THIRD_PARTY,
                        params: {
                            keyHashHex:  "c4b9265645fde9536c0795adbcc5291767a0c61fd62448341d7e0386",
                        },
                    },
                    {
                        type: NativeScriptType.PUBKEY_THIRD_PARTY,
                        params: {
                            keyHashHex:  "0241f2d196f52a92fbd2183d03b370c30b6960cfdeae364ffabac889",
                        },
                    },
                ],
            },
        },
        displayFormat: NativeScriptHashDisplayFormat.BECH32,
        hash: "af5c2ce476a6ede1c879f7b1909d6a0b96cb2081391712d4a355cef6",
    },
    {
        testname: "ALL script (no subscripts)",
        script: {
            type: NativeScriptType.ALL,
            params: {
                scripts: [],
            },
        },
        displayFormat: NativeScriptHashDisplayFormat.BECH32,
        hash: "d441227553a0f1a965fee7d60a0f724b368dd1bddbc208730fccebcf",
    },
    {
        testname: "ANY script",
        script: {
            type: NativeScriptType.ANY,
            params: {
                scripts: [
                    {
                        type: NativeScriptType.PUBKEY_THIRD_PARTY,
                        params: {
                            keyHashHex:  "c4b9265645fde9536c0795adbcc5291767a0c61fd62448341d7e0386",
                        },
                    },
                    {
                        type: NativeScriptType.PUBKEY_THIRD_PARTY,
                        params: {
                            keyHashHex:  "0241f2d196f52a92fbd2183d03b370c30b6960cfdeae364ffabac889",
                        },
                    },
                ],
            },
        },
        displayFormat: NativeScriptHashDisplayFormat.BECH32,
        hash: "d6428ec36719146b7b5fb3a2d5322ce702d32762b8c7eeeb797a20db",
    },
    {
        testname: "ANY script (no subscripts)",
        script: {
            type: NativeScriptType.ANY,
            params: {
                scripts: [],
            },
        },
        displayFormat: NativeScriptHashDisplayFormat.BECH32,
        hash: "52dc3d43b6d2465e96109ce75ab61abe5e9c1d8a3c9ce6ff8a3af528",
    },
    {
        testname: "N_OF_K script",
        script: {
            type: NativeScriptType.N_OF_K,
            params: {
                requiredCount: 2,
                scripts: [
                    {
                        type: NativeScriptType.PUBKEY_THIRD_PARTY,
                        params: {
                            keyHashHex:  "c4b9265645fde9536c0795adbcc5291767a0c61fd62448341d7e0386",
                        },
                    },
                    {
                        type: NativeScriptType.PUBKEY_THIRD_PARTY,
                        params: {
                            keyHashHex:  "0241f2d196f52a92fbd2183d03b370c30b6960cfdeae364ffabac889",
                        },
                    },
                ],
            },
        },
        displayFormat: NativeScriptHashDisplayFormat.BECH32,
        hash: "78963f8baf8e6c99ed03e59763b24cf560bf12934ec3793eba83377b",
    },
    {
        testname: "N_OF_K script (no subscripts)",
        script: {
            type: NativeScriptType.N_OF_K,
            params: {
                requiredCount: 0,
                scripts: [],
            },
        },
        displayFormat: NativeScriptHashDisplayFormat.BECH32,
        hash: "3530cc9ae7f2895111a99b7a02184dd7c0cea7424f1632d73951b1d7",
    },
    {
        testname: "INVALID_BEFORE script",
        script: {
            type: NativeScriptType.INVALID_BEFORE,
            params: {
                slot: 42,
            },
        },
        displayFormat: NativeScriptHashDisplayFormat.BECH32,
        hash: "2a25e608a683057e32ea38b50ce8875d5b34496b393da8d25d314c4e",
    },
    {
        testname: "INVALID_BEFORE script (slot is a big number)",
        script: {
            type: NativeScriptType.INVALID_BEFORE,
            params: {
                slot: "18446744073709551615",
            },
        },
        displayFormat: NativeScriptHashDisplayFormat.BECH32,
        hash: "d2469adac494849dd27d1b344b74cc6cd5bf31fbd01c879eae84c04b",
    },
    {
        testname: "INVALID_HEREAFTER script",
        script: {
            type: NativeScriptType.INVALID_HEREAFTER,
            params: {
                slot: 42,
            },
        },
        displayFormat: NativeScriptHashDisplayFormat.BECH32,
        hash: "1620dc65993296335183f23ff2f7747268168fabbeecbf24c8a20194",
    },
    {
        testname: "INVALID_HEREAFTER script (slot is a big number)",
        script: {
            type: NativeScriptType.INVALID_HEREAFTER,
            params: {
                slot: "18446744073709551615",
            },
        },
        displayFormat: NativeScriptHashDisplayFormat.BECH32,
        hash: "da60fa40290f93b889a88750eb141fd2275e67a1255efb9bac251005",
    },
    {
        testname: "Nested native scripts",
        script: {
            type: NativeScriptType.ALL,
            params: {
                scripts: [
                    {
                        type: NativeScriptType.PUBKEY_THIRD_PARTY,
                        params: {
                            keyHashHex:  "c4b9265645fde9536c0795adbcc5291767a0c61fd62448341d7e0386",
                        },
                    },
                    {
                        type: NativeScriptType.ANY,
                        params: {
                            scripts: [
                                {
                                    type: NativeScriptType.PUBKEY_THIRD_PARTY,
                                    params: {
                                        keyHashHex:  "c4b9265645fde9536c0795adbcc5291767a0c61fd62448341d7e0386",
                                    },
                                },
                                {
                                    type: NativeScriptType.PUBKEY_THIRD_PARTY,
                                    params: {
                                        keyHashHex:  "0241f2d196f52a92fbd2183d03b370c30b6960cfdeae364ffabac889",
                                    },
                                },
                            ],
                        },
                    },
                    {
                        type: NativeScriptType.N_OF_K,
                        params: {
                            requiredCount: 2,
                            scripts: [
                                {
                                    type: NativeScriptType.PUBKEY_THIRD_PARTY,
                                    params: {
                                        keyHashHex:  "c4b9265645fde9536c0795adbcc5291767a0c61fd62448341d7e0386",
                                    },
                                },
                                {
                                    type: NativeScriptType.PUBKEY_THIRD_PARTY,
                                    params: {
                                        keyHashHex:  "0241f2d196f52a92fbd2183d03b370c30b6960cfdeae364ffabac889",
                                    },
                                },
                                {
                                    type: NativeScriptType.PUBKEY_THIRD_PARTY,
                                    params: {
                                        keyHashHex:  "cecb1d427c4ae436d28cc0f8ae9bb37501a5b77bcc64cd1693e9ae20",
                                    },
                                },
                            ],
                        },
                    },
                    {
                        type: NativeScriptType.INVALID_BEFORE,
                        params: {
                            slot: 100,
                        },
                    },
                    {
                        type: NativeScriptType.INVALID_HEREAFTER,
                        params: {
                            slot: 200,
                        },
                    },
                ],
            },
        },
        displayFormat: NativeScriptHashDisplayFormat.BECH32,
        hash: "0d63e8d2c5a00cbcffbdf9112487c443466e1ea7d8c834df5ac5c425",
    },
    {
        testname: "Nested native scripts #2",
        script: {
            type: NativeScriptType.ALL,
            params: {
                scripts: [
                    {
                        type: NativeScriptType.ANY,
                        params: {
                            scripts: [
                                {
                                    type: NativeScriptType.PUBKEY_THIRD_PARTY,
                                    params: {
                                        keyHashHex:  "c4b9265645fde9536c0795adbcc5291767a0c61fd62448341d7e0386",
                                    },
                                },
                                {
                                    type: NativeScriptType.PUBKEY_THIRD_PARTY,
                                    params: {
                                        keyHashHex:  "0241f2d196f52a92fbd2183d03b370c30b6960cfdeae364ffabac889",
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
        displayFormat: NativeScriptHashDisplayFormat.BECH32,
        hash: "903e52ef2421abb11562329130330763583bb87cd98006b70ecb1b1c",
    },
    {
        testname: "Nested native scripts #3",
        script: {
            type: NativeScriptType.N_OF_K,
            params: {
                requiredCount: 0,
                scripts: [{
                    type: NativeScriptType.ALL,
                    params: {
                        scripts: [{
                            type: NativeScriptType.ANY,
                            params: {
                                scripts: [{
                                    type: NativeScriptType.N_OF_K,
                                    params: {
                                        requiredCount: 0,
                                        scripts: [],
                                    },
                                }],
                            },
                        }],
                    },
                }],
            },
        },
        displayFormat: NativeScriptHashDisplayFormat.BECH32,
        hash: "ed1dd7ef95caf389669c62618eb7f7aa7eadd08feb76618db2ae0cfc",
    },
]

type InvalidOnLedgerScriptTestcase = {
    testname: string;
    script: NativeScript;
}

export const InvalidOnLedgerScriptTestcases: InvalidOnLedgerScriptTestcase[] = [
    {
        testname: "PUBKEY - invalid key path",
        script: {
            type: NativeScriptType.PUBKEY_DEVICE_OWNED,
            params: {
                path: [0, 0, 0, 0, 0, 0],
            },
        },
    },
    {
        testname: "PUBKEY - invalid key hash (too short)",
        script: {
            type: NativeScriptType.PUBKEY_THIRD_PARTY,
            params: {
                keyHashHex: '3a55d9f68255dfbefa1efd711f82d005fae1be2e145d616c90cf0fa',
            },
        },
    },
    {
        testname: "PUBKEY - invalid key hash (not hex)",
        script: {
            type: NativeScriptType.PUBKEY_THIRD_PARTY,
            params: {
                keyHashHex: '3g55d9f68255dfbefa1efd711f82d005fae1be2e145d616c90cf0fa9',
            },
        },
    },
    {
        testname: "N_OF_K - invalid required count (higher than number of scripts)",
        script: {
            type: NativeScriptType.N_OF_K,
            params: {
                requiredCount: 1,
                scripts: [],
            },
        },
    },
]

type InvalidScriptTestcase = {
    testname: string;
    script: NativeScript;
    invalidDataReason: InvalidDataReason;
}

export const InvalidScriptTestcases: InvalidScriptTestcase[] = [
    {
        testname: "PUBKEY - invalid key path",
        script: {
            type: NativeScriptType.PUBKEY_DEVICE_OWNED,
            params: {
                path: [0, 0, 0, 0, 0, 0],
            },
        },
        invalidDataReason: InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_INVALID_KEY_PATH,
    },
    {
        testname: "PUBKEY - invalid key hash (too short)",
        script: {
            type: NativeScriptType.PUBKEY_THIRD_PARTY,
            params: {
                keyHashHex: '3a55d9f68255dfbefa1efd711f82d005fae1be2e145d616c90cf0fa',
            },
        },
        invalidDataReason: InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_INVALID_KEY_HASH,
    },
    {
        testname: "PUBKEY - invalid key hash (not hex)",
        script: {
            type: NativeScriptType.PUBKEY_THIRD_PARTY,
            params: {
                keyHashHex: '3g55d9f68255dfbefa1efd711f82d005fae1be2e145d616c90cf0fa9',
            },
        },
        invalidDataReason: InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_INVALID_KEY_HASH,
    },
    {
        testname: "N_OF_K - invalid required count (negative number)",
        script: {
            type: NativeScriptType.N_OF_K,
            params: {
                requiredCount: -1,
                scripts: [
                    {
                        type: NativeScriptType.PUBKEY_THIRD_PARTY,
                        params: {
                            keyHashHex: '3a55d9f68255dfbefa1efd711f82d005fae1be2e145d616c90cf0fa9',
                        },
                    },
                ],
            },
        },
        invalidDataReason: InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_INVALID_REQUIRED_COUNT,
    },
    {
        testname: "N_OF_K - invalid required count (higher than number of scripts)",
        script: {
            type: NativeScriptType.N_OF_K,
            params: {
                requiredCount: 1,
                scripts: [],
            },
        },
        invalidDataReason: InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_REQUIRED_COUNT_HIGHER_THAN_NUMBER_OF_SCRIPTS,
    },
    {
        testname: "INVALID_BEFORE - invalid invalidBefore (negative number) as a subscript",
        script: {
            type: NativeScriptType.ANY,
            params: {
                scripts: [
                    {
                        type: NativeScriptType.PUBKEY_THIRD_PARTY,
                        params: {
                            keyHashHex: '3a55d9f68255dfbefa1efd711f82d005fae1be2e145d616c90cf0fa9',
                        },
                    },
                    {
                        type: NativeScriptType.INVALID_BEFORE,
                        params: {
                            slot: -1,
                        },
                    },
                ],
            },
        },
        invalidDataReason: InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_INVALID_TOKEN_LOCKING_SLOT,
    },
    {
        testname: "INVALID_HEREAFTER - invalid invalidHereafter (negative number)",
        script: {
            type: NativeScriptType.INVALID_HEREAFTER,
            params: {
                slot: -1,
            },
        },
        invalidDataReason: InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_INVALID_TOKEN_LOCKING_SLOT,
    },
]
