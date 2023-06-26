import chai, {expect} from 'chai'
import chaiAsPromised from 'chai-as-promised'
import {HexString} from '../../src/types/internal'

import type {Ada} from '../../src/Ada'
import {DeviceVersionUnsupported, utils} from '../../src/Ada'
import {getAda} from '../test_utils'
import {
  byronTestCases,
  rejectTestCases,
  shelleyTestCases,
} from './__fixtures__/deriveAddress'

chai.use(chaiAsPromised)

const address_hex_to_base58 = (addressHex: string) =>
  utils.base58_encode(utils.hex_to_buf(addressHex as HexString))

describe('deriveAddress', () => {
  let ada: Ada = {} as Ada

  beforeEach(async () => {
    ada = await getAda()
  })

  afterEach(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (ada as any).t.close()
  })

  describe('Should successfully derive Byron address', () => {
    for (const {
      testName,
      network,
      addressParams,
      result: expectedResult,
    } of byronTestCases) {
      it(testName, async () => {
        const isAppXS = (await ada.getVersion()).version.flags.isAppXS
        const promise = ada.deriveAddress({
          network,
          address: addressParams,
        })

        if (isAppXS) {
          await expect(promise).to.be.rejectedWith(DeviceVersionUnsupported)
        } else {
          expect(address_hex_to_base58((await promise).addressHex)).to.equal(
            expectedResult,
          )
        }
      })
    }
  })

  describe('Should successfully derive Shelley address', () => {
    for (const {
      testName,
      network,
      addressParams,
      result: expectedResult,
    } of shelleyTestCases) {
      it(testName, async () => {
        const {addressHex} = await ada.deriveAddress({
          network,
          address: addressParams,
        })

        expect(
          utils.bech32_encodeAddress(utils.hex_to_buf(addressHex as HexString)),
        ).to.equal(expectedResult)
      })
    }
  }).timeout(60000)

  describe('Should reject address derive', () => {
    for (const {
      testName,
      network,
      addressParams,
      errCls,
      errMsg,
      unsupportedInAppXS,
    } of rejectTestCases) {
      it(testName, async () => {
        const isAppXS = (await ada.getVersion()).version.flags.isAppXS

        const promise = ada.deriveAddress({
          network,
          address: addressParams,
        })

        if (isAppXS && unsupportedInAppXS) {
          await expect(promise).to.be.rejectedWith(DeviceVersionUnsupported)
        } else {
          await expect(promise).to.be.rejectedWith(errCls, errMsg)
        }
      })
    }
  })

  describe('Should successfully show Byron address', () => {
    for (const {testName, network, addressParams} of byronTestCases) {
      it(testName, async () => {
        const isAppXS = (await ada.getVersion()).version.flags.isAppXS
        const promise = ada.showAddress({
          network,
          address: addressParams,
        })

        if (isAppXS) {
          await expect(promise).to.be.rejectedWith(DeviceVersionUnsupported)
        } else {
          expect(await promise).to.equal(undefined)
        }
      })
    }
  })

  describe('Should successfully show Shelley address', () => {
    for (const {testName, network, addressParams} of shelleyTestCases) {
      it(testName, async () => {
        const result = await ada.showAddress({network, address: addressParams})
        expect(result).to.equal(undefined)
      })
    }
  }).timeout(60000)

  describe('Should reject address show', () => {
    for (const {
      testName,
      network,
      addressParams,
      errCls,
      errMsg,
      unsupportedInAppXS,
    } of rejectTestCases) {
      it(testName, async () => {
        const isAppXS = (await ada.getVersion()).version.flags.isAppXS
        const promise = ada.showAddress({
          network,
          address: addressParams,
        })

        if (isAppXS && unsupportedInAppXS) {
          await expect(promise).to.be.rejectedWith(DeviceVersionUnsupported)
        } else {
          await expect(promise).to.be.rejectedWith(errCls, errMsg)
        }
      })
    }
  })
})
