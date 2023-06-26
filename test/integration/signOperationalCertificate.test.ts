import chai, {expect} from 'chai'
import chaiAsPromised from 'chai-as-promised'

import type Ada from '../../src/Ada'
import {getAda} from '../test_utils'
import {tests} from './__fixtures__/signOperationalCertificate'
import {DeviceVersionUnsupported} from '../../src/Ada'
chai.use(chaiAsPromised)

describe('signOperationalCertificate', () => {
  let ada: Ada = {} as Ada

  beforeEach(async () => {
    ada = await getAda()
  })

  afterEach(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (ada as any).t.close()
  })

  for (const {testName, operationalCertificate, expected} of tests) {
    it(testName, async () => {
      const isAppXS = (await ada.getVersion()).version.flags.isAppXS
      const promise = ada.signOperationalCertificate(operationalCertificate)

      if (isAppXS) {
        await expect(promise).to.be.rejectedWith(DeviceVersionUnsupported)
      } else {
        expect(await promise).to.deep.equal(expected)
      }
    })
  }
})
