import TransportNodeHid from "@ledgerhq/hw-transport-node-hid"
import SpeculosTransport from "@ledgerhq/hw-transport-node-speculos"
import * as blake2 from "blake2"
import { expect } from "chai"
import { ImportMock } from "ts-mock-imports"
import type { FixlenHexString} from "types/internal"

import { Ada, utils } from "../src/Ada"
import { InvalidDataReason } from "../src/errors/index"
import * as parseModule from "../src/utils/parse"

export function shouldUseSpeculos(): boolean {
    return process.env.LEDGER_TRANSPORT === 'speculos'
}

export function getTransport() {
    return shouldUseSpeculos()
        ? SpeculosTransport.open({apduPort: 9999})
        : TransportNodeHid.create(1000)
}

export async function getAda() {
    const transport = await getTransport()

    const ada = new Ada(transport);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ada as any).t = transport
    return Promise.resolve(ada)
}

export function turnOffValidation() {
    const validate_mock = ImportMock.mockFunction(parseModule, 'validate')

    const fns = ['isString', 'isInteger', 'isArray', 'isBuffer', 'isHexString', 'isHexStringOfLength', 'isValidPath']
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    /* @ts-ignore */
    const mocks = fns.map((fn) => ImportMock.mockFunction(parseModule, fn, true))

    return () => {
        validate_mock.restore()
        mocks.forEach((mock) => mock.restore())
    }
}

export function describeWithoutValidation(title: string, test: () => void) {
    describe(title, () => {
        let restoreValidation: () => void

        before(() => {
            restoreValidation = turnOffValidation()
        })

        after(() => {
            restoreValidation()
        })

        test()
    })
}

const ProtocolMagics = {
    MAINNET: 764824073,
    TESTNET: 42, // used in our integration tests
    TESTNET_LEGACY: 1097911063,
    TESTNET_PREPROD: 1,
    TESTNET_PREVIEW: 2,
}

const NetworkIds = {
    TESTNET: 0x00,
    MAINNET: 0x01,
}

export const Networks = {
    Mainnet: {
        networkId: NetworkIds.MAINNET,
        protocolMagic: ProtocolMagics.MAINNET,
    },
    Testnet: {
        networkId: NetworkIds.TESTNET,
        protocolMagic: ProtocolMagics.TESTNET,
    },
    Fake: {
        networkId: 0x03,
        protocolMagic: 47,
    },
}

type TxHash = FixlenHexString<32>

function hashTxBody(txBodyHex: string): TxHash {
    const b2 = blake2.createHash("blake2b", { digestLength: 32 })
    b2.update(Buffer.from(txBodyHex, 'hex'))
    return parseModule.parseHexStringOfLength(b2.digest('hex'), 32, InvalidDataReason.INVALID_B2_HASH)
}

export function bech32_to_hex(str: string): string {
    return utils.buf_to_hex(utils.bech32_decodeAddress(str))
}

export const DontRunOnLedger = "DO NOT RUN ON LEDGER"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function describeSignTxRejects(name: string, testList: any[]) {
    describe(`${name  }_JS`, () => {
        let ada: Ada = {} as Ada

        beforeEach(async () => {
            ada = await getAda()
        })

        afterEach(async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (ada as any).t.close()
        })

        for (const { testName, tx, additionalWitnessPaths, signingMode, rejectReason } of testList) {
            it(`${testName} [${signingMode}]`, async() => {
                if (rejectReason === InvalidDataReason.LEDGER_POLICY) {
                    return
                }
                const response = ada.signTransaction({
                    tx,
                    signingMode,
                    additionalWitnessPaths: additionalWitnessPaths || [] ,
                })
                await expect(response).to.be.rejectedWith(rejectReason)
            })
        }
    })

    describeWithoutValidation(`${name  }_Ledger`, () => {
        let ada: Ada = {} as Ada

        beforeEach(async () => {
            ada = await getAda()
        })

        afterEach(async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (ada as any).t.close()
        })

        for (const { testName, tx, additionalWitnessPaths, signingMode, errCls, errMsg } of testList) {
            it(`${testName} [${signingMode}]`, async() => {
                if (errMsg === DontRunOnLedger) {
                    return
                }
                const response = ada.signTransaction({
                    tx,
                    signingMode,
                    additionalWitnessPaths: additionalWitnessPaths || [],
                })
                await expect(response).to.be.rejectedWith(errCls, errMsg)
            })
        }
    })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function describeSignTxPositiveTest(name: string, tests: any[]) {
    describe(name, () => {
        let ada: Ada = {} as Ada

        beforeEach(async () => {
            ada = await getAda()
        })

        afterEach(async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (ada as any).t.close()
        })

        for (const { testName, tx, signingMode, additionalWitnessPaths, txBody, expectedResult } of tests) {
            it(`${testName} [${signingMode}]`, async () => {
                if (!txBody) {
                    // eslint-disable-next-line no-console
                    console.log(`WARNING --- No tx body given: ${  testName}`)
                } else if (hashTxBody(txBody) !== expectedResult.txHashHex) {
                    // eslint-disable-next-line no-console
                    console.log(`WARNING --- Tx body hash mismatch: ${  testName}`)
                }
                const response = await ada.signTransaction({
                    tx,
                    signingMode,
                    additionalWitnessPaths,
                })
                expect(response).to.deep.equal(expectedResult)
            })
        }
    })
}

