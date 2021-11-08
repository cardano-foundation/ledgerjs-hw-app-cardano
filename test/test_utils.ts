// @ts-ignore
import TransportNodeHid from "@ledgerhq/hw-transport-node-hid"
import SpeculosTransport from "@ledgerhq/hw-transport-node-speculos"
import * as blake2 from "blake2"
import { ImportMock } from "ts-mock-imports"
import type { FixlenHexString} from "types/internal"

import Ada from "../src/Ada"
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
    (ada as any).t = transport
    return Promise.resolve(ada)
}

export function turnOffValidation() {
    const validate_mock = ImportMock.mockFunction(parseModule, 'validate')

    const fns = ['isString', 'isInteger', 'isArray', 'isBuffer', 'isHexString', 'isHexStringOfLength', 'isValidPath']
    /* @ts-ignore */
    const mocks = fns.map((fn) => ImportMock.mockFunction(parseModule, fn, true))

    return () => {
        validate_mock.restore()
        mocks.forEach((mock) => mock.restore())
    }
}

export function describeWithoutValidation(title: string, test: () => void) {
    describe(title, async () => {
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
    TESTNET: 42,
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

export function hashTxBody(txBodyHex: string): TxHash {
    let b2 = blake2.createHash("blake2b", { digestLength: 32 })
    b2.update(Buffer.from(txBodyHex, 'hex'))
    return parseModule.parseHexStringOfLength(b2.digest('hex'), 32, InvalidDataReason.INVALID_B2_HASH)
}
