import chai, { expect } from "chai"
import chaiAsPromised from "chai-as-promised"

import type { Ada } from "../../src/Ada"
import { DeviceStatusError, InvalidData, NativeScriptHashDisplayFormat } from "../../src/Ada"
import { describeWithoutValidation, getAda } from "../test_utils"
import { InvalidOnLedgerScriptTestcases, InvalidScriptTestcases, ValidNativeScriptTestcases } from "./__fixtures__/deriveNativeScriptHash"

chai.use(chaiAsPromised)

describe("deriveNativeScriptHash", async () => {
    let ada: Ada = {} as any

    beforeEach(async () => {
        ada = await getAda()
    })

    afterEach(async () => {
        await (ada as any).t.close()
    })

    describe("Valid native scripts", async () => {
        for (const { testname, script, displayFormat, hashHex: expectedHash } of ValidNativeScriptTestcases) {
            it(testname, async () => {
                const { scriptHashHex } = await ada.deriveNativeScriptHash({
                    script,
                    displayFormat,
                })

                expect(scriptHashHex).to.equal(expectedHash)
            })
        }
    })

    describeWithoutValidation("Ledger should not permit invalid scripts", async () => {
        for (const { testname, script } of InvalidOnLedgerScriptTestcases) {
            it(testname, async () => {
                const promise = ada.deriveNativeScriptHash({
                    script,
                    displayFormat: NativeScriptHashDisplayFormat.BECH32,
                })
                await expect(promise).to.be.rejectedWith(DeviceStatusError)
            })
        }
    })

    describe("Ledgerjs should not permit invalid scripts", async () => {
        for (const { testname, script, invalidDataReason: expectedInvalidDataReason } of InvalidScriptTestcases) {
            it(testname, async () => {
                const promise = ada.deriveNativeScriptHash({
                    script,
                    displayFormat: NativeScriptHashDisplayFormat.BECH32,
                })
                await expect(promise).to.be.rejectedWith(InvalidData, expectedInvalidDataReason)
            })
        }
    })
})
