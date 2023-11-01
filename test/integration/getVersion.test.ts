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
    const isAppXS = (await ada.getVersion()).version.flags.isAppXS

    const {version, compatibility} = await ada.getVersion()

    expect(version.major).to.equal(7)
    expect(version.minor).to.equal(0)

    expect(version.flags.isDebug).to.equal(true)

    expect(compatibility).to.deep.equal({
      isCompatible: true,
      recommendedVersion: null,
      supportsByronAddressDerivation: !isAppXS,
      supportsMary: true,
      supportsCatalystRegistration: true,
      supportsCIP36: true,
      supportsZeroTtl: true,
      supportsPoolRegistrationAsOwner: !isAppXS,
      supportsPoolRegistrationAsOperator: !isAppXS,
      supportsPoolRetirement: !isAppXS,
      supportsNativeScriptHashDerivation: !isAppXS,
      supportsMultisigTransaction: true,
      supportsMint: true,
      supportsAlonzo: true,
      supportsReqSignersInOrdinaryTx: true,
      supportsBabbage: true,
      supportsCIP36Vote: true,
      supportsConway: true,
    })
  })
})
