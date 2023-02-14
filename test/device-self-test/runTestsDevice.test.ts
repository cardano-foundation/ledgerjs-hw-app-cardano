import type Ada from "../../src/Ada"
import { getAda } from "../test_utils"

describe("runTestsDevice", () => {
    let ada: Ada = {} as Ada

    beforeEach(async () => {
        ada = await getAda()
    })

    afterEach(async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (ada as any).t.close()
    })

    it("Should run device tests", async () => {
        await ada.runTests()
    })
})
