// @ts-ignore
import TransportNodeHid from "@ledgerhq/hw-transport-node-hid"
import { ImportMock } from "ts-mock-imports"

import Ada from "../src/Ada"
import * as parseModule from "../src/utils/parse"

export async function getTransport() {
    return await TransportNodeHid.create(1000)
}

export async function getAda() {
    const transport = await TransportNodeHid.create(1000)

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
