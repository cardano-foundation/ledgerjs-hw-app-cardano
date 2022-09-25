import chai, { expect } from "chai"
import chaiAsPromised from "chai-as-promised"

import type Ada from "../../src/Ada"
import { getAda } from "../test_utils"
import { tests } from "./__fixtures__/signGovernanceVote"
chai.use(chaiAsPromised)

describe("signGovernanceVote", async () => {
    let ada: Ada = {} as Ada

    beforeEach(async () => {
        ada = await getAda()
    })

    afterEach(async () => {
        await (ada as any).t.close()
    })

    for (const { testname, governanceVote, expected } of tests) {
        it(testname, async () => {
            const response = await ada.signGovernanceVote(governanceVote)

            expect(response).to.deep.equal(expected)
        })
    }
})
