import { expect } from "chai"

import type Ada from "../../src/Ada"
import { describeWithoutValidation, getAda, hashTxBody } from "../test_utils"
import {
    testsAllegra,
    testsByron,
    testsCatalystRegistration,
    testsInvalidTokenBundleOrdering,
    testsMary,
    testsShelleyNoCertificates,
    testsShelleyRejects,
    testsShelleyWithCertificates,
} from "./__fixtures__/signTx"

function describePositiveTest(name: string, tests: any[]) {
    describe(name, async () => {
        let ada: Ada = {} as Ada

        beforeEach(async () => {
            ada = await getAda()
        })
    
        afterEach(async () => {
            await (ada as any).t.close()
        })
    
        for (const { testname, tx, signingMode, additionalWitnessPaths, txBody, result: expected } of tests) {
            const additionalWitnessPathsIfPresent = additionalWitnessPaths || []
            it(testname, async () => {
                if (!txBody) {
                    console.log("No tx body given!")
                } else if (hashTxBody(txBody) !== expected.txHashHex) {
                    console.log("Tx body hash mismatch")
                    console.log(hashTxBody(txBody))
                }
                const response = await ada.signTransaction({
                    tx,
                    signingMode,
                    additionalWitnessPaths: additionalWitnessPathsIfPresent,
                })
                expect(response).to.deep.equal(expected)
            })
        }
    })
}

describePositiveTest("signTxOrdinaryByron", testsByron)
describePositiveTest("signTxOrdinaryShelleyNoCertificates", testsShelleyNoCertificates)
describePositiveTest("signTxOrdinaryShelleyWithCertificates", testsShelleyWithCertificates)
describePositiveTest("signTxOrdinaryAllegra", testsAllegra)
describePositiveTest("signTxOrdinaryMary", testsMary)
describePositiveTest("signTxOrdinaryMaryCatalyst", testsCatalystRegistration)

// Shelley transaction format, but includes legacy Byron addresses in outputs
describe("signTxShelleyRejectsJS", async () => {
    let ada: Ada = {} as Ada

    beforeEach(async () => {
        ada = await getAda()
    })

    afterEach(async () => {
        await (ada as any).t.close()
    })

    for (const {testname, tx, signingMode, rejectReason } of testsShelleyRejects) {
        it(testname, async() => {
            const response = ada.signTransaction({
                tx,
                signingMode,
                additionalWitnessPaths: [],
            })
            await expect(response).to.be.rejectedWith(rejectReason)
        })
    }
})

describeWithoutValidation("signTxShelleyRejectsLedger", async () => {
    let ada: Ada = {} as Ada

    beforeEach(async () => {
        ada = await getAda()
    })

    afterEach(async () => {
        await (ada as any).t.close()
    })

    for (const {testname, tx, signingMode, errCls, errMsg } of testsShelleyRejects) {
        it(testname, async() => {
            const response = ada.signTransaction({
                tx,
                signingMode,
                additionalWitnessPaths: [],
            })
            await expect(response).to.be.rejectedWith(errCls, errMsg)
        })
    }
})


describe("signTxOrdinaryMary", async () => {
    let ada: Ada = {} as Ada

    beforeEach(async () => {
        ada = await getAda()
    })

    afterEach(async () => {
        await (ada as any).t.close()
    })

    for (const {testname, tx, signingMode, rejectReason } of testsInvalidTokenBundleOrdering) {
        it(testname, async() => {
            const response = ada.signTransaction({
                tx,
                signingMode,
                additionalWitnessPaths: [],
            })
            await expect(response).to.be.rejectedWith(rejectReason)
        })
    }
})

describeWithoutValidation("signTxOrdinaryMaryRejects", async () => {
    let ada: Ada = {} as Ada

    beforeEach(async () => {
        ada = await getAda()
    })

    afterEach(async () => {
        await (ada as any).t.close()
    })

    for (const {testname, tx, signingMode, errCls, errMsg } of testsInvalidTokenBundleOrdering) {
        it(testname, async() => {
            const response = ada.signTransaction({
                tx,
                signingMode,
                additionalWitnessPaths: [],
            })
            await expect(response).to.be.rejectedWith(errCls, errMsg)
        })
    }
})
