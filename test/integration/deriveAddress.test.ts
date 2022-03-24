import chai, { expect } from "chai"
import chaiAsPromised from "chai-as-promised"

import type { Ada } from "../../src/Ada"
import { utils } from "../../src/Ada"
import { getAda } from "../test_utils"
import { byronTestcases, RejectTestcases, shelleyTestcases } from "./__fixtures__/deriveAddress"

chai.use(chaiAsPromised)


const address_hex_to_base58 = (addressHex: string) => utils.base58_encode(utils.hex_to_buf(addressHex as any))

describe("deriveAddress", async () => {
    let ada: Ada = {} as any

    beforeEach(async () => {
        ada = await getAda()
    })

    afterEach(async () => {
        await (ada as any).t.close()
    })

    describe("Should succesfully derive Byron address", async () => {
        for (const { testname, network, addressParams, result: expectedResult } of byronTestcases) {
            it(testname, async () => {
                const { addressHex } = await ada.deriveAddress({
                    network,
                    address: addressParams,
                })

                expect(address_hex_to_base58(addressHex)).to.equal(expectedResult)
            })
        }
    })

    describe("Should succesfully derive Shelley address", async () => {
        for (const { testname, network, addressParams, result: expectedResult } of shelleyTestcases) {
            it(testname, async () => {
                const { addressHex } = await ada.deriveAddress({ network, address: addressParams })

                expect(utils.bech32_encodeAddress(utils.hex_to_buf(addressHex as any))).to.equal(
                    expectedResult
                )
            })
        }
    }).timeout(60000)

    describe("Should reject address derive", async () => {
        for (const { testname, network, addressParams, errCls, errMsg } of RejectTestcases) {
            it(testname, async () => {
                const promise = ada.deriveAddress({
                    network,
                    address: addressParams,
                })
                await expect(promise).to.be.rejectedWith(errCls, errMsg)
            })
        }
    })

    describe("Should succesfully show Byron address", async () => {
        for (const { testname, network, addressParams } of byronTestcases) {
            it(testname, async () => {
                const result = await ada.showAddress({ network, address: addressParams })
                expect(result).to.equal(undefined)
            })
        }
    })

    describe("Should succesfully show Shelley address", async () => {
        for (const { testname, network, addressParams } of shelleyTestcases) {
            it(testname, async () => {
                const result = await ada.showAddress({ network, address: addressParams })
                expect(result).to.equal(undefined)
            })
        }
    }).timeout(60000)

    describe("Should reject address show", async () => {
        for (const { testname, network, addressParams, errCls, errMsg } of RejectTestcases) {
            it(testname, async () => {
                const promise = ada.showAddress({
                    network,
                    address: addressParams,
                })
                await expect(promise).to.be.rejectedWith(errCls, errMsg)
            })
        }
    })
})
