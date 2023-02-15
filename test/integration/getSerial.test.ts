import {expect} from 'chai'

import type Ada from '../../src/Ada'
import {getAda} from '../test_utils'

describe('getSerial', () => {
  let ada: Ada = {} as Ada

  beforeEach(async () => {
    ada = await getAda()
  })

  afterEach(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (ada as any).t.close()
  })

  it('Should correctly get the serial number of the device', async () => {
    const response = await ada.getSerial()
    expect(response.serialHex.length).to.equal(14)
  })
})
