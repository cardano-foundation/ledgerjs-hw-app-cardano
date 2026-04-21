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
    const {version, compatibility} = await ada.getVersion()
    const isV8 = version.major >= 8
    const isAppXS = version.flags.isAppXS

    expect(version.major).to.be.oneOf([7, 8])
    expect(version.minor).to.be.at.least(0)

    expect(version.flags.isDebug).to.equal(true)

    expect(compatibility).to.deep.equal({
      isCompatible: true,
      recommendedVersion: null,
      supportsByronAddressDerivation: isV8 || !isAppXS,
      supportsMary: true,
      supportsCatalystRegistration: true,
      supportsCIP36: true,
      supportsZeroTtl: true,
      supportsPoolRegistrationAsOwner: isV8 || !isAppXS,
      supportsPoolRegistrationAsOperator: isV8 || !isAppXS,
      supportsPoolRetirement: isV8 || !isAppXS,
      supportsNativeScriptHashDerivation: isV8 || !isAppXS,
      supportsMultisigTransaction: true,
      supportsMint: true,
      supportsAlonzo: true,
      supportsReqSignersInOrdinaryTx: true,
      supportsBabbage: true,
      supportsCIP36Vote: true,
      supportsConway: true,
      supportsMultipleVoters: isV8,
      supportsMultipleVotesPerVoter: isV8,
      supportsMessageSigning: true,
    })
  })
})
