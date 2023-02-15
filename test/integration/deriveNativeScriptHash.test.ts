import chai, {expect} from 'chai'
import chaiAsPromised from 'chai-as-promised'

import type {Ada} from '../../src/Ada'
import {
  DeviceStatusError,
  InvalidData,
  NativeScriptHashDisplayFormat,
} from '../../src/Ada'
import {describeWithoutValidation, getAda} from '../test_utils'
import {
  InvalidOnLedgerScriptTestcases,
  InvalidScriptTestcases,
  ValidNativeScriptTestcases,
} from './__fixtures__/deriveNativeScriptHash'

chai.use(chaiAsPromised)

describe('deriveNativeScriptHash', () => {
  let ada: Ada = {} as Ada

  beforeEach(async () => {
    ada = await getAda()
  })

  afterEach(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (ada as any).t.close()
  })

  describe('Valid native scripts', () => {
    for (const {
      testName,
      script,
      displayFormat,
      hashHex: expectedHash,
    } of ValidNativeScriptTestcases) {
      it(testName, async () => {
        const {scriptHashHex} = await ada.deriveNativeScriptHash({
          script,
          displayFormat,
        })

        expect(scriptHashHex).to.equal(expectedHash)
      })
    }
  })

  describeWithoutValidation('Ledger should not permit invalid scripts', () => {
    for (const {testName, script} of InvalidOnLedgerScriptTestcases) {
      it(testName, async () => {
        const promise = ada.deriveNativeScriptHash({
          script,
          displayFormat: NativeScriptHashDisplayFormat.BECH32,
        })
        await expect(promise).to.be.rejectedWith(DeviceStatusError)
      })
    }
  })

  describe('Ledgerjs should not permit invalid scripts', () => {
    for (const {
      testName,
      script,
      invalidDataReason: expectedInvalidDataReason,
    } of InvalidScriptTestcases) {
      it(testName, async () => {
        const promise = ada.deriveNativeScriptHash({
          script,
          displayFormat: NativeScriptHashDisplayFormat.BECH32,
        })
        await expect(promise).to.be.rejectedWith(
          InvalidData,
          expectedInvalidDataReason,
        )
      })
    }
  })
})
