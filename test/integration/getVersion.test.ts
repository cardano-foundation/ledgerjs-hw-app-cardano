import {expect} from 'chai'

import type Ada from '../../src/Ada'
import {getAda} from '../test_utils'

describe('getVersion', () => {
  let ada: Ada = {} as Ada

  beforeEach(async () => {
    ada = await getAda()
  })

  afterEach(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (ada as any).t.close()
  })

  it('Should correctly get the semantic version of device', async () => {
    const {version, compatibility} = await ada.getVersion()

    expect(version.major).to.equal(6)
    expect(version.minor).to.equal(0)
    expect(compatibility).to.deep.equal({
      isCompatible: true,
      recommendedVersion: null,
      supportsMary: true,
      supportsMint: true,
      supportsMultisigTransaction: true,
      supportsCatalystRegistration: true,
      supportsCIP36: true,
      supportsZeroTtl: true,
      supportsPoolRegistrationAsOperator: true,
      supportsPoolRetirement: true,
      supportsNativeScriptHashDerivation: true,
      supportsAlonzo: true,
      supportsReqSignersInOrdinaryTx: true,
      supportsBabbage: true,
      supportsCIP36Vote: true,
    })
  })
})
