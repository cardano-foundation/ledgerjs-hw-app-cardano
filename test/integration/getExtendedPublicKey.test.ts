import chai, {expect} from 'chai'
import chaiAsPromised from 'chai-as-promised'

import type Ada from '../../src/Ada'
import {DeviceStatusError} from '../../src/Ada'
import {
  StatusWordV7,
  StatusWordV8,
  StatusWordMsgV7,
  StatusWordMsgV8,
} from '../../src/errors/deviceStatusError'
import {str_to_path} from '../../src/utils/address'
import {getAda} from '../test_utils'
import type {TestCase} from './__fixtures__/getExtendedPublicKey'
import {
  testsCVoteKeysUnusual,
  testsByronPath,
  testsColdCase,
  testsShelleyUnusualPaths,
  testsShelleyUsualPaths,
} from './__fixtures__/getExtendedPublicKey'
chai.use(chaiAsPromised)

describe('getExtendedPublicKey', () => {
  let ada: Ada = {} as Ada

  beforeEach(async () => {
    ada = await getAda()
  })

  afterEach(async () => {
    await ada.transport.close()
  })

  describe('Should successfully get a single extended public key', () => {
    const test = async ({path, expected}: TestCase) => {
      const response = await ada.getExtendedPublicKey({
        path: str_to_path(path),
      })

      expect(response.publicKeyHex).to.equal(expected.publicKey)
      expect(response.chainCodeHex).to.equal(expected.chainCode)
    }

    for (const testCase of [
      ...testsByronPath,
      ...testsShelleyUsualPaths,
      ...testsShelleyUnusualPaths,
      ...testsColdCase,
      ...testsCVoteKeysUnusual,
    ]) {
      it(testCase.name, async () => {
        await test(testCase)
      })
    }
  })

  describe('Should successfully get several extended public keys', () => {
    const test = async (tests: TestCase[]) => {
      const results = await ada.getExtendedPublicKeys({
        paths: tests.map(({path}) => str_to_path(path)),
      })

      expect(results.length).to.equal(tests.length)
      for (let i = 0; i < tests.length; i++) {
        expect(results[i].publicKeyHex).to.equal(tests[i].expected.publicKey)
        expect(results[i].chainCodeHex).to.equal(tests[i].expected.chainCode)
      }
    }

    it('starting with a usual one', async () => {
      await test([
        ...testsByronPath,
        ...testsShelleyUsualPaths,
        ...testsColdCase,
        ...testsCVoteKeysUnusual,
      ])
    })

    it('starting with an unusual one', async () => {
      await test([
        ...testsShelleyUnusualPaths,
        ...testsByronPath,
        ...testsColdCase,
        ...testsShelleyUsualPaths,
      ])
    })
  })

  describe('Should reject invalid paths', () => {
    let rejectErrMsg: string

    beforeEach(async () => {
      const {version} = await ada.getVersion()
      rejectErrMsg =
        version.major <= 7
          ? StatusWordMsgV7[StatusWordV7.ERR_REJECTED_BY_POLICY]
          : StatusWordMsgV8[StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED]
    })

    it('path shorter than 3 indexes', async () => {
      const promise = ada.getExtendedPublicKey({path: str_to_path("44'/1815'")})
      await expect(promise).to.be.rejectedWith(DeviceStatusError, rejectErrMsg)
    })

    it('path not matching cold key structure', async () => {
      const promise = ada.getExtendedPublicKey({
        path: str_to_path("1853'/1900'/0'/0/0"),
      })
      await expect(promise).to.be.rejectedWith(DeviceStatusError, rejectErrMsg)
    })

    // CIP36 voting
    it('invalid vote key path 1', async () => {
      const promise = ada.getExtendedPublicKey({
        path: str_to_path("1694'/1815'/0'/1/0"),
      })
      await expect(promise).to.be.rejectedWith(DeviceStatusError, rejectErrMsg)
    })
    it('invalid vote key path 2', async () => {
      const promise = ada.getExtendedPublicKey({
        path: str_to_path("1694'/1815'/17"),
      })
      await expect(promise).to.be.rejectedWith(DeviceStatusError, rejectErrMsg)
    })
    it('invalid vote key path 3', async () => {
      const promise = ada.getExtendedPublicKey({
        path: str_to_path("1694'/1815'/0'/1"),
      })
      await expect(promise).to.be.rejectedWith(DeviceStatusError, rejectErrMsg)
    })
  })
})
