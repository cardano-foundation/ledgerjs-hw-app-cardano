import {expect} from 'chai'

import type Ada from '../../src/Ada'
import {getAda} from '../test_utils'

describe('getVersion', () => {
  let ada: Ada = {} as Ada

  beforeEach(async () => {
    ada = await getAda()
  })

  afterEach(async () => {
    await ada.transport.close()
  })

  it('Should correctly get the semantic version of device', async () => {
    const isAppXS = (await ada.getVersion()).version.flags.isAppXS

    const {version, compatibility} = await ada.getVersion()

    expect(version.major).to.be.oneOf([7, 8])
    expect(version.minor).to.be.at.least(0)

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
      supportsMessageSigning: true,
    })
  })
})
