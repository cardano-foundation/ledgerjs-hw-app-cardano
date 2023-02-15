import chai, {expect} from 'chai'
import chaiAsPromised from 'chai-as-promised'
import {HexString} from '../../src/types/internal'

import type {Ada} from '../../src/Ada'
import {utils} from '../../src/Ada'
import {getAda} from '../test_utils'
import {
  byronTestcases,
  RejectTestcases,
  shelleyTestcases,
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
    } of byronTestcases) {
      it(testName, async () => {
        const {addressHex} = await ada.deriveAddress({
          network,
          address: addressParams,
        })

        expect(address_hex_to_base58(addressHex)).to.equal(expectedResult)
      })
    }
  })

  describe('Should successfully derive Shelley address', () => {
    for (const {
      testName,
      network,
      addressParams,
      result: expectedResult,
    } of shelleyTestcases) {
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
    } of RejectTestcases) {
      it(testName, async () => {
        const promise = ada.deriveAddress({
          network,
          address: addressParams,
        })
        await expect(promise).to.be.rejectedWith(errCls, errMsg)
      })
    }
  })

  describe('Should successfully show Byron address', () => {
    for (const {testName, network, addressParams} of byronTestcases) {
      it(testName, async () => {
        const result = await ada.showAddress({network, address: addressParams})
        expect(result).to.equal(undefined)
      })
    }
  })

  describe('Should successfully show Shelley address', () => {
    for (const {testName, network, addressParams} of shelleyTestcases) {
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
    } of RejectTestcases) {
      it(testName, async () => {
        const promise = ada.showAddress({
          network,
          address: addressParams,
        })
        await expect(promise).to.be.rejectedWith(errCls, errMsg)
      })
    }
  })
})
