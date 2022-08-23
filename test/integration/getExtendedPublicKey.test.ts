import chai, { expect } from "chai"
import chaiAsPromised from 'chai-as-promised'

import type Ada from "../../src/Ada"
import { DeviceStatusError } from "../../src/Ada"
import { str_to_path } from "../../src/utils/address"
import { getAda } from "../test_utils"
import type { TestCase} from "./__fixtures__/getExtendedPublicKey"
import { testsGovernanceVotingKeys } from "./__fixtures__/getExtendedPublicKey"
import { testsByron, testsColdKeys, testsShelleyUnusual, testsShelleyUsual } from "./__fixtures__/getExtendedPublicKey"
chai.use(chaiAsPromised)

describe("getExtendedPublicKey", async () => {
    let ada: Ada = {} as Ada

    beforeEach(async () => {
        ada = await getAda()
    })

    afterEach(async () => {
        await (ada as any).t.close()
    })

    describe("Should successfully get a single extended public key", async () => {
        const test = async (tests: TestCase[]) => {
            for (const { path, expected } of tests) {
                const response = await ada.getExtendedPublicKey(
                    { path: str_to_path(path) }
                )

                expect(response.publicKeyHex).to.equal(expected.publicKey)
                expect(response.chainCodeHex).to.equal(expected.chainCode)
            }
        }

        it('get a single extended public key --- byron', async () => {
            await test(testsByron)
        })
        it('get a single extended public key --- shelley usual', async () => {
            await test(testsShelleyUsual)
        })
        it('get a single extended public key --- shelley unusual', async () => {
            await test(testsShelleyUnusual)
        })
        it('get a single extended public key --- cold keys', async () => {
            await test(testsColdKeys)
        })
        it('get a single extended public key --- governance voting keys', async () => {
            await test(testsGovernanceVotingKeys)
        })
    })

    describe("Should successfully get several extended public keys", async () => {
        const test = async (tests: TestCase[]) => {
            const results = await ada.getExtendedPublicKeys(
                { paths: tests.map(({ path }) => str_to_path(path)) }
            )

            expect(results.length).to.equal(tests.length)
            for (let i = 0; i < tests.length; i++) {
                expect(results[i].publicKeyHex).to.equal(tests[i].expected.publicKey)
                expect(results[i].chainCodeHex).to.equal(tests[i].expected.chainCode)
            }
        }

        it('starting with a usual one', async () => {
            await test([...testsByron, ...testsShelleyUsual, ...testsColdKeys, ...testsGovernanceVotingKeys])
        })

        it('starting with an unusual one', async () => {
            await test([...testsShelleyUnusual, ...testsByron, ...testsColdKeys, ...testsShelleyUsual])
        })
    })

    describe("Should reject invalid paths", () => {
        it('path shorter than 3 indexes', async () => {
            const promise = ada.getExtendedPublicKey({ path: str_to_path("44'/1815'") })
            await expect(promise).to.be.rejectedWith(DeviceStatusError, "Action rejected by Ledger's security policy")
        })

        it('path not matching cold key structure', async () => {
            const promise = ada.getExtendedPublicKey({ path: str_to_path("1853'/1900'/0'/0/0") })
            await expect(promise).to.be.rejectedWith(DeviceStatusError, "Action rejected by Ledger's security policy")
        })

        // governance voting
        it('invalid governance voting key path 1', async () => {
            const promise = ada.getExtendedPublicKey({ path: str_to_path("1694'/1815'/0'/1/0") })
            await expect(promise).to.be.rejectedWith(DeviceStatusError, "Action rejected by Ledger's security policy")
        })
        it('invalid governance voting key path 2', async () => {
            const promise = ada.getExtendedPublicKey({ path: str_to_path("1694'/1815'/17") })
            await expect(promise).to.be.rejectedWith(DeviceStatusError, "Action rejected by Ledger's security policy")
        })
        it('invalid governance voting key path 3', async () => {
            const promise = ada.getExtendedPublicKey({ path: str_to_path("1694'/1815'/0'/1") })
            await expect(promise).to.be.rejectedWith(DeviceStatusError, "Action rejected by Ledger's security policy")
        })
    })
})
