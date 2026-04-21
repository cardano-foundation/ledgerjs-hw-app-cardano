import * as blake2 from 'blake2'
import {expect} from 'chai'
import {ImportMock} from 'ts-mock-imports'
import type {FixLenHexString} from 'types/internal'

import {Ada, utils} from '../src/Ada'
import {DeviceVersionUnsupported, InvalidDataReason} from '../src/errors/index'
import type {SendParams} from '../src/interactions/common/types'
import * as parseModule from '../src/utils/parse'
import type {
  BIP32Path,
  SignedTransactionData,
  Transaction,
  TransactionOptions,
  TransactionSigningMode,
} from '../src/types/public'

export function yieldValue(
  step: IteratorResult<SendParams, unknown>,
): SendParams {
  if (step.done) throw new Error('expected generator yield, got return')
  return step.value
}

export function shouldUseSpeculos(): boolean {
  return process.env.LEDGER_TRANSPORT === 'speculos'
}

export async function getTransport() {
  const speculosApduPort = Number(process.env.SPECULOS_APDU_PORT || 9999)

  if (shouldUseSpeculos()) {
    const {default: SpeculosTransport} =
      await import('@ledgerhq/hw-transport-node-speculos')
    return SpeculosTransport.open({apduPort: speculosApduPort})
  }

  const {default: TransportNodeHid} =
    await import('@ledgerhq/hw-transport-node-hid')
  return TransportNodeHid.create(1000)
}

export async function getAda() {
  const transport = await getTransport()

  return new Ada(transport)
}

export function turnOffValidation() {
  const validate_mock = ImportMock.mockFunction(parseModule, 'validate')
  const fns = [
    'isString',
    'isInteger',
    'isArray',
    'isBuffer',
    'isHexString',
    'isHexStringOfLength',
    'isValidPath',
  ] as const
  // These tests intentionally send malformed data to the device and assert
  // on-device rejection. Mocking only `validate()` is not enough because many
  // parse helpers also gate malformed inputs through predicate helpers before
  // the interaction reaches Ledger at all.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore dynamic helper names are intentional here
  const mocks = fns.map((fn) => ImportMock.mockFunction(parseModule, fn, true))

  return () => {
    validate_mock.restore()
    mocks.forEach((mock) => mock.restore())
  }
}

export function describeWithoutValidation(title: string, test: () => void) {
  describe(title, () => {
    let restoreValidation: () => void

    before(() => {
      restoreValidation = turnOffValidation()
    })

    after(() => {
      restoreValidation()
    })

    test()
  })
}

const ProtocolMagics = {
  MAINNET: 764824073,
  TESTNET: 42, // used in our integration tests
  TESTNET_LEGACY: 1097911063,
  TESTNET_PREPROD: 1,
  TESTNET_PREVIEW: 2,
}

const NetworkIds = {
  TESTNET: 0x00,
  MAINNET: 0x01,
}

export const Networks = {
  Mainnet: {
    networkId: NetworkIds.MAINNET,
    protocolMagic: ProtocolMagics.MAINNET,
  },
  Testnet: {
    networkId: NetworkIds.TESTNET,
    protocolMagic: ProtocolMagics.TESTNET,
  },
  Fake: {
    networkId: 0x03,
    protocolMagic: 47,
  },
}

export type AppVersionOverride = {
  unsupportedInAppXS?: boolean // defaults to false
  supportedSinceV8?: boolean // defaults to false
}

type TxHash = FixLenHexString<32>

function hashTxBody(txBodyHex: string): TxHash {
  const hash = blake2.createHash('blake2b', {digestLength: 32})
  hash.update(Buffer.from(txBodyHex, 'hex'))
  return hash.digest('hex') as TxHash
}

export function bech32_to_hex(str: string): string {
  return utils.buf_to_hex(utils.bech32_decodeAddress(str))
}

export const DoNotRunOnLedger = 'DO NOT RUN ON LEDGER'

export type RejectError = {
  errCls: new (...args: any[]) => Error
  errMsg: string
}

type SignTxRejectCase = {
  testName: string
  tx: Transaction
  signingMode: TransactionSigningMode
  additionalWitnessPaths?: BIP32Path[]
  rejectReason: InvalidDataReason
  errCls?: new (...args: any[]) => Error
  errMsg?: string | RegExp
  err?: {v7: RejectError; v8: RejectError}
  appVersion?: AppVersionOverride
}

type SignTxPositiveCase = {
  testName: string
  tx: Transaction
  signingMode: TransactionSigningMode
  additionalWitnessPaths?: BIP32Path[]
  options?: TransactionOptions
  txBody?: string
  expectedResult: SignedTransactionData
  appVersion?: AppVersionOverride
}

function assertSignTxRejectCase(
  testCase: Partial<SignTxRejectCase>,
): asserts testCase is SignTxRejectCase {
  expect(testCase.testName, 'missing testName').to.be.a('string')
  expect(testCase.tx, 'missing tx').to.not.equal(undefined)
  expect(testCase.signingMode, 'missing signingMode').to.be.a('string')
  expect(testCase.rejectReason, 'missing rejectReason').to.be.a('string')
}

function assertSignTxPositiveCase(
  testCase: Partial<SignTxPositiveCase>,
): asserts testCase is SignTxPositiveCase {
  expect(testCase.testName, 'missing testName').to.be.a('string')
  expect(testCase.tx, 'missing tx').to.not.equal(undefined)
  expect(testCase.signingMode, 'missing signingMode').to.be.a('string')
  expect(testCase.expectedResult, 'missing expectedResult').to.not.equal(
    undefined,
  )
}

export function describeSignTxRejects(
  name: string,
  testList: SignTxRejectCase[],
) {
  describe(`${name}_JS`, () => {
    let ada: Ada = {} as Ada

    beforeEach(async () => {
      ada = await getAda()
    })

    afterEach(async () => {
      await ada.transport.close()
    })

    for (const testCase of testList) {
      assertSignTxRejectCase(testCase)
      const {testName, tx, additionalWitnessPaths, signingMode, rejectReason} =
        testCase
      if (
        rejectReason === InvalidDataReason.LEDGER_POLICY ||
        rejectReason === InvalidDataReason.INVALID_DATA_SUPPLIED_TO_LEDGER
      ) {
        continue
      }
      it(`${testName} [${signingMode}]`, async () => {
        const response = ada.signTransaction({
          tx,
          signingMode,
          additionalWitnessPaths: additionalWitnessPaths || [],
        })

        await expect(response).to.be.rejectedWith(rejectReason)
      })
    }
  })

  describeWithoutValidation(`${name}_Ledger`, () => {
    let ada: Ada = {} as Ada

    beforeEach(async () => {
      ada = await getAda()
    })

    afterEach(async () => {
      await ada.transport.close()
    })

    for (const testCase of testList) {
      assertSignTxRejectCase(testCase)
      const {
        testName,
        tx,
        additionalWitnessPaths,
        signingMode,
        errCls,
        errMsg,
        err,
        appVersion,
      } = testCase
      it(`${testName} [${signingMode}]`, async () => {
        const {version} = await ada.getVersion()
        const isAppXS = version.flags.isAppXS
        let resolvedErrCls = errCls
        let resolvedErrMsg = errMsg
        if (err != null) {
          const resolvedErr = version.major <= 7 ? err.v7 : err.v8
          resolvedErrCls = resolvedErr.errCls
          resolvedErrMsg = resolvedErr.errMsg
        }
        if (resolvedErrMsg === DoNotRunOnLedger) {
          return
        }
        const response = ada.signTransaction({
          tx,
          signingMode,
          additionalWitnessPaths: additionalWitnessPaths || [],
        })

        // Certain tests contain test data that cannot be properly serialized,
        // as manifested by `TypeError`s.
        // We do not expect DeviceVersionUnsupported in that case for XS app.
        const hasTypeError = resolvedErrCls === TypeError
        const correctlyDetectsUnsupportedInAppXS =
          isAppXS && (appVersion?.unsupportedInAppXS ?? false) && !hasTypeError

        if (correctlyDetectsUnsupportedInAppXS) {
          await expect(response).to.be.rejectedWith(DeviceVersionUnsupported)
        } else {
          expect(resolvedErrCls, 'missing errCls').to.not.equal(undefined)
          const expectedErrCls = resolvedErrCls as new (...args: any[]) => Error
          await expect(response).to.be.rejectedWith(
            expectedErrCls,
            resolvedErrMsg,
          )
        }
      })
    }
  })
}

export function describeSignTxPositiveTest(
  name: string,
  tests: SignTxPositiveCase[],
) {
  describe(name, () => {
    let ada: Ada = {} as Ada

    beforeEach(async () => {
      ada = await getAda()
    })

    afterEach(async () => {
      await ada.transport.close()
    })

    for (const testCase of tests) {
      assertSignTxPositiveCase(testCase)
      const {
        testName,
        tx,
        signingMode,
        additionalWitnessPaths,
        options,
        txBody,
        expectedResult,
        appVersion,
      } = testCase
      it(`${testName} [${signingMode}]`, async () => {
        if (!txBody) {
          expect.fail(`No tx body given for fixture: ${testName}`)
        } else if (hashTxBody(txBody) !== expectedResult.txHashHex) {
          expect.fail(`Tx body hash mismatch for fixture: ${testName}`)
        }
        const isAppXS = (await ada.getVersion()).version.flags.isAppXS
        const response = ada.signTransaction({
          tx,
          signingMode,
          additionalWitnessPaths,
          options,
        })

        if (isAppXS && (appVersion?.unsupportedInAppXS ?? false)) {
          await expect(response).to.be.rejectedWith(DeviceVersionUnsupported)
        } else {
          expect(await response).to.deep.equal(expectedResult)
        }
      })
    }
  })
}
