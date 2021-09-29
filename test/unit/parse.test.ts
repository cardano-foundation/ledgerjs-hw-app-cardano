import {expect} from "chai"
import { Int64BE, Uint64BE } from "int64-buffer"

import {InvalidDataReason} from "../../src/errors"
import {assert} from "../../src/utils/assert"
import {parseInt64_str, parseUint64_str} from "../../src/utils/parse"

type BasicParseTest = {
    signed: boolean,
    numberString: string,
}

const basicParseTests: BasicParseTest[] = [
    {
        signed: true,
        numberString: "-123456",
    },
    {
        signed: true,
        numberString: "9223372036854775807",
    },
    {
        signed: true,
        numberString: "0",
    },
    {
        signed: true,
        numberString: "-9223372036854775808",
    },
    {
        signed: false,
        numberString: "0",
    },
    {
        signed: false,
        numberString: "9223372036854775807",
    },
    {
        signed: false,
        numberString: "18446744073709551615",
    },
]

describe("basicParseTest", async () => {
    for (const { signed, numberString } of basicParseTests) {
        console.log(`parsing ${numberString} (${signed ? "signed" : "unsigned"})`)
        const objectRepresentation = (signed ? new Int64BE(numberString, 10) : new Uint64BE(numberString, 10))
        const bufferRep = objectRepresentation.toBuffer()

        assert(bufferRep.length === 8, "invalid binary length")

        expect(objectRepresentation.toString()).to.equal(numberString)
    }
})

describe('advancedParseTest', () => {
    it('parse int64 correctly', () => {
        let nmb = "1235543"
        let result = parseInt64_str(nmb, {}, InvalidDataReason.INPUT_INVALID_TX_HASH)
        expect(result).to.equal("1235543")
    })

    it("parse negative int64 correctly", () => {
        let nmb = "-123456"
        let result = parseInt64_str(nmb, {}, InvalidDataReason.INPUT_INVALID_TX_HASH)
        expect(result).to.equal("-123456")
    })

    it("throw error when trying to parse negative number as Uint", () => {
        let nmb = "-123456"
        //let result = parseUint64_str(nmb, {}, InvalidDataReason.INPUT_INVALID_TX_HASH)
        expect(() => parseUint64_str(nmb, {}, InvalidDataReason.INPUT_INVALID_TX_HASH)).to.throw(InvalidDataReason.INPUT_INVALID_TX_HASH)
    })
})
