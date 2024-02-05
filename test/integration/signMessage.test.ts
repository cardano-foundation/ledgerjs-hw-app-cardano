import chai, {expect} from 'chai'
import chaiAsPromised from 'chai-as-promised'

import type Ada from '../../src/Ada'
import {getAda} from '../test_utils'
import {tests} from './__fixtures__/signMessage'
chai.use(chaiAsPromised)

describe('signMessage', () => {
  let ada: Ada = {} as Ada

  beforeEach(async () => {
    ada = await getAda()
  })

  afterEach(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (ada as any).t.close()
  })

  for (const {testName, signMessageData, expected} of tests) {
    it(testName, async () => {
      const promise = ada.signMessage(signMessageData)

      expect(await promise).to.deep.equal(expected)
    })
  }
})
