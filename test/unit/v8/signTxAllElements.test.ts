import {expect} from 'chai'
import {createRequire} from 'module'
const require = createRequire(import.meta.url)

const CertificateType = {
  STAKE_REGISTRATION: 0,
  STAKE_DEREGISTRATION: 1,
  STAKE_DELEGATION: 2,
  STAKE_REGISTRATION_CONWAY: 7,
  STAKE_DEREGISTRATION_CONWAY: 8,
  VOTE_DELEGATION: 9,
  AUTHORIZE_COMMITTEE_HOT: 14,
  RESIGN_COMMITTEE_COLD: 15,
  DREP_REGISTRATION: 16,
  DREP_DEREGISTRATION: 17,
  DREP_UPDATE: 18,
} as const

const CredentialParamsType = {
  KEY_PATH: 0,
  KEY_HASH: 1,
  SCRIPT_HASH: 2,
} as const

const DRepParamsType = {
  KEY_PATH: 0,
  KEY_HASH: 1,
  SCRIPT_HASH: 2,
  ABSTAIN: 3,
  NO_CONFIDENCE: 4,
} as const

const TransactionSigningMode = {
  POOL_REGISTRATION_AS_OPERATOR: 'pool_registration_as_operator',
  MULTISIG_TRANSACTION: 'multisig_transaction',
  PLUTUS_TRANSACTION: 'plutus_transaction',
} as const

const AddressType = {
  BASE_PAYMENT_KEY_STAKE_SCRIPT: 0b0010,
  REWARD_KEY: 0b1110,
} as const

const TxOutputDestinationType = {
  THIRD_PARTY: 'third_party',
  DEVICE_OWNED: 'device_owned',
} as const

const TxAuxiliaryDataType = {
  CIP36_REGISTRATION: 'cip36_registration',
} as const

const CIP36VoteRegistrationFormat = {
  CIP_36: 'cip_36',
} as const

const CIP36VoteDelegationType = {
  PATH: 'cip36_vote_key_path',
  KEY: 'cip36_vote_key_keyHex',
} as const

const {
  signTxAllElementsAuxiliaryData,
  signTxAllElementsCertificatesMultisig,
  signTxAllElementsCertificatesOrdinary,
  signTxAllElementsPoolRegistration,
  signTxAllElementsNoCertificates,
} = require('../../integration/__fixtures__/signTxAllElements.ts')

describe('v8 signTxAllElements fixtures', () => {
  it('parses the auxiliary data fixture', () => {
    expect(signTxAllElementsAuxiliaryData).to.have.length(3)

    const voteKeyHexFixture = signTxAllElementsAuxiliaryData[0].tx.auxiliaryData
    expect(voteKeyHexFixture?.type).to.equal(TxAuxiliaryDataType.CIP36_REGISTRATION)
    expect(voteKeyHexFixture?.params.format).to.equal(
      CIP36VoteRegistrationFormat.CIP_36,
    )
    expect(voteKeyHexFixture?.params.voteKeyHex).to.be.a('string')
    expect(voteKeyHexFixture?.params.paymentDestination.type).to.equal(
      TxOutputDestinationType.DEVICE_OWNED,
    )
    expect(voteKeyHexFixture?.params.paymentDestination.params.type).to.equal(
      AddressType.REWARD_KEY,
    )

    const voteKeyPathFixture =
      signTxAllElementsAuxiliaryData[1].tx.auxiliaryData
    expect(voteKeyPathFixture?.params.voteKeyPath).to.have.length(5)
    expect(voteKeyPathFixture?.params.paymentDestination.type).to.equal(
      TxOutputDestinationType.THIRD_PARTY,
    )
    expect(voteKeyPathFixture?.params.paymentDestination.params.addressHex).to.be.a(
      'string',
    )

    const delegationsFixture =
      signTxAllElementsAuxiliaryData[2].tx.auxiliaryData
    expect(delegationsFixture?.params.delegations).to.have.length(2)
    expect(delegationsFixture?.params.delegations[0].type).to.equal(
      CIP36VoteDelegationType.KEY,
    )
    expect(delegationsFixture?.params.delegations[1].type).to.equal(
      CIP36VoteDelegationType.PATH,
    )
    expect(delegationsFixture?.params.paymentDestination.type).to.equal(
      TxOutputDestinationType.DEVICE_OWNED,
    )
    expect(delegationsFixture?.params.paymentDestination.params.type).to.equal(
      AddressType.BASE_PAYMENT_KEY_STAKE_SCRIPT,
    )
    expect(delegationsFixture?.params.votingPurpose).to.equal(2790)
  })

  it('parses the pool registration fixture', () => {
    expect(signTxAllElementsPoolRegistration).to.have.length(1)
    expect(signTxAllElementsPoolRegistration[0].signingMode).to.equal(
      TransactionSigningMode.POOL_REGISTRATION_AS_OPERATOR,
    )
  })

  it('parses the ordinary certificate fixture bucket', () => {
    expect(signTxAllElementsCertificatesOrdinary).to.have.length(1)
    const ordinaryCertificates = signTxAllElementsCertificatesOrdinary[0].tx.certificates
    expect(ordinaryCertificates).to.have.length(11)

    const certificateTypes = ordinaryCertificates.map(
      (certificate: {type: number}) => certificate.type,
    )

    expect(certificateTypes).to.include.members([
      CertificateType.STAKE_REGISTRATION,
      CertificateType.STAKE_DEREGISTRATION,
      CertificateType.STAKE_DELEGATION,
      CertificateType.STAKE_REGISTRATION_CONWAY,
      CertificateType.STAKE_DEREGISTRATION_CONWAY,
      CertificateType.VOTE_DELEGATION,
      CertificateType.AUTHORIZE_COMMITTEE_HOT,
      CertificateType.RESIGN_COMMITTEE_COLD,
      CertificateType.DREP_REGISTRATION,
      CertificateType.DREP_DEREGISTRATION,
      CertificateType.DREP_UPDATE,
    ])
  })

  it('parses the multisig certificate fixture bucket', () => {
    expect(signTxAllElementsCertificatesMultisig).to.have.length(1)
    const broadFixture = signTxAllElementsCertificatesMultisig[0]

    expect(broadFixture.signingMode).to.equal(
      TransactionSigningMode.PLUTUS_TRANSACTION,
    )

    const certificateTypes = broadFixture.tx.certificates.map(
      (certificate: {type: number}) => certificate.type,
    )

    expect(certificateTypes).to.have.length(14)
    expect(certificateTypes).to.include.members([
      CertificateType.STAKE_REGISTRATION,
      CertificateType.STAKE_DEREGISTRATION,
      CertificateType.STAKE_DELEGATION,
      CertificateType.VOTE_DELEGATION,
      CertificateType.AUTHORIZE_COMMITTEE_HOT,
      CertificateType.RESIGN_COMMITTEE_COLD,
      CertificateType.DREP_REGISTRATION,
      CertificateType.DREP_DEREGISTRATION,
      CertificateType.DREP_UPDATE,
      CertificateType.STAKE_DEREGISTRATION_CONWAY,
    ])

    expect(
      broadFixture.tx.certificates[0].params.stakeCredential.type,
    ).to.equal(CredentialParamsType.SCRIPT_HASH)
    expect(broadFixture.tx.certificates[3].params.dRep.type).to.equal(
      DRepParamsType.KEY_HASH,
    )
    expect(broadFixture.tx.certificates[4].params.dRep.type).to.equal(
      DRepParamsType.SCRIPT_HASH,
    )
    expect(broadFixture.tx.certificates[5].params.dRep.type).to.equal(
      DRepParamsType.ABSTAIN,
    )
    expect(broadFixture.tx.certificates[6].params.dRep.type).to.equal(
      DRepParamsType.NO_CONFIDENCE,
    )
    expect(
      broadFixture.tx.certificates[7].params.coldCredential.type,
    ).to.equal(CredentialParamsType.SCRIPT_HASH)
    expect(broadFixture.tx.certificates[10].params.dRepCredential.type).to.equal(
      CredentialParamsType.SCRIPT_HASH,
    )
    expect(
      broadFixture.tx.certificates[13].params.stakeCredential.type,
    ).to.equal(CredentialParamsType.SCRIPT_HASH)
  })

  it('parses the tx elements fixture bucket', () => {
    expect(signTxAllElementsNoCertificates).to.have.length(1)
    const tx = signTxAllElementsNoCertificates[0].tx

    expect(tx.validityIntervalStart).to.equal(47)
    expect(tx.requiredSigners).to.have.length(1)
    expect(tx.scriptDataHashHex).to.be.a('string')

    expect(tx.collateralInputs).to.have.length(1)
    expect(tx.collateralOutput).to.not.equal(undefined)
    expect(tx.totalCollateral).to.equal(10)
    expect(tx.referenceInputs).to.have.length(1)

    expect(tx.treasury).to.equal(27)
    expect(tx.donation).to.equal(28)

    expect(tx.votingProcedures).to.have.length(1)
    expect(tx.votingProcedures[0].votes).to.have.length(1)
  })
})
