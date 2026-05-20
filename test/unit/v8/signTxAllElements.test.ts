import {expect} from 'chai'
import {
  signTxAllElementsAuxiliaryData,
  signTxAllElementsCombinedCertificates,
  signTxAllElementsCertificatesMultisig,
  signTxAllElementsCertificatesOrdinary,
  signTxAllElementsPoolRegistration,
  signTxAllElementsNoCertificates,
} from '../../integration/__fixtures__/signTxAllElements'
import {serializeTransactionRaw} from '../../../src/interactions/v8/serialization/tx'
import {parseSignTransactionRequest} from '../../../src/parsing/transaction'
import {
  AddressType,
  CertificateType,
  CIP36VoteDelegationType,
  CIP36VoteRegistrationFormat,
  CredentialParamsType,
  DRepParamsType,
  TransactionSigningMode,
  TxAuxiliaryDataType,
  TxOutputDestinationType,
} from '../../../src/types/public'

describe('v8 signTxAllElements fixtures', () => {
  const combinedCertificatesRawTxHex =
    '3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700000000003b01002b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c256100000000002dd2e80001010000000000000000002a000000000000000a0002058000073c800007178000000000000002000000000102058000073c800007178000000000000002000000000702058000073c8000071780000000000000020000000000000000000000110802058000073c8000071780000000000000020000000000000000000000110202058000073c80000717800000000000000200000000f61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb49730402048000073d800007178000000080000001000000000000002a0902058000073c8000071780000000000000020000000064058000073c800007178000000000000003000000000e02058000073c8000071780000000000000040000000002058000073c800007178000000000000005000000000f02058000073c8000071780000000000000040000000002002768747470733a2f2f7777772e76616375756d6c6162732e636f6d2f73616d706c65416e63686f721afd028b504c3668102b129b37a86c09a2872f76741dc7a68e2149c8deadbeef1002058000073c80000717800000000000000300000000000000000000001302002768747470733a2f2f7777772e76616375756d6c6162732e636f6d2f73616d706c65416e63686f721afd028b504c3668102b129b37a86c09a2872f76741dc7a68e2149c8deadbeef1102058000073c8000071780000000000000030000000000000000000000131202058000073c8000071780000000000000030000000002002768747470733a2f2f7777772e76616375756d6c6162732e636f6d2f73616d706c65416e63686f721afd028b504c3668102b129b37a86c09a2872f76741dc7a68e2149c8deadbeef0a02058000073c80000717800000000000000200000000f61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb497364058000073c800007178000000000000003000000000b02058000073c80000717800000000000000200000000f61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb497300000000000f42400c02058000073c8000071780000000000000020000000064058000073c8000071780000000000000030000000000000000000f42400d02058000073c80000717800000000000000200000000f61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb497364058000073c8000071780000000000000030000000000000000000f4240'

  it('parses the auxiliary data fixture', () => {
    expect(signTxAllElementsAuxiliaryData).to.have.length(3)

    const voteKeyHexAuxData = signTxAllElementsAuxiliaryData[0].tx.auxiliaryData
    expect(voteKeyHexAuxData?.type).to.equal(
      TxAuxiliaryDataType.CIP36_REGISTRATION,
    )
    if (voteKeyHexAuxData?.type !== TxAuxiliaryDataType.CIP36_REGISTRATION)
      throw new Error()
    const voteKeyHexParams = voteKeyHexAuxData.params
    expect(voteKeyHexParams.format).to.equal(CIP36VoteRegistrationFormat.CIP_36)
    expect(voteKeyHexParams.voteKeyHex).to.be.a('string')
    expect(voteKeyHexParams.paymentDestination.type).to.equal(
      TxOutputDestinationType.DEVICE_OWNED,
    )
    if (
      voteKeyHexParams.paymentDestination.type !==
      TxOutputDestinationType.DEVICE_OWNED
    )
      throw new Error()
    expect(voteKeyHexParams.paymentDestination.params.type).to.equal(
      AddressType.REWARD_KEY,
    )

    const voteKeyPathAuxData =
      signTxAllElementsAuxiliaryData[1].tx.auxiliaryData
    if (voteKeyPathAuxData?.type !== TxAuxiliaryDataType.CIP36_REGISTRATION)
      throw new Error()
    const voteKeyPathParams = voteKeyPathAuxData.params
    expect(voteKeyPathParams.voteKeyPath).to.have.length(5)
    expect(voteKeyPathParams.paymentDestination.type).to.equal(
      TxOutputDestinationType.THIRD_PARTY,
    )
    if (
      voteKeyPathParams.paymentDestination.type !==
      TxOutputDestinationType.THIRD_PARTY
    )
      throw new Error()
    expect(voteKeyPathParams.paymentDestination.params.addressHex).to.be.a(
      'string',
    )

    const delegationsAuxData =
      signTxAllElementsAuxiliaryData[2].tx.auxiliaryData
    if (delegationsAuxData?.type !== TxAuxiliaryDataType.CIP36_REGISTRATION)
      throw new Error()
    const delegationsParams = delegationsAuxData.params
    expect(delegationsParams.delegations).to.have.length(2)
    expect(delegationsParams.delegations![0].type).to.equal(
      CIP36VoteDelegationType.KEY,
    )
    expect(delegationsParams.delegations![1].type).to.equal(
      CIP36VoteDelegationType.PATH,
    )
    expect(delegationsParams.paymentDestination.type).to.equal(
      TxOutputDestinationType.DEVICE_OWNED,
    )
    if (
      delegationsParams.paymentDestination.type !==
      TxOutputDestinationType.DEVICE_OWNED
    )
      throw new Error()
    expect(delegationsParams.paymentDestination.params.type).to.equal(
      AddressType.BASE_PAYMENT_KEY_STAKE_SCRIPT,
    )
    expect(delegationsParams.votingPurpose).to.equal(2790)
  })

  it('parses the pool registration fixture', () => {
    expect(signTxAllElementsPoolRegistration).to.have.length(1)
    expect(signTxAllElementsPoolRegistration[0].signingMode).to.equal(
      TransactionSigningMode.POOL_REGISTRATION_AS_OPERATOR,
    )
  })

  it('parses the ordinary certificate fixture bucket', () => {
    expect(signTxAllElementsCertificatesOrdinary).to.have.length(1)
    const ordinaryCertificates =
      signTxAllElementsCertificatesOrdinary[0].tx.certificates
    expect(ordinaryCertificates).to.have.length(11)

    const certificateTypes = ordinaryCertificates!.map((cert) => cert.type)

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

  it('parses and serializes the combined certificate fixture bucket', () => {
    expect(signTxAllElementsCombinedCertificates).to.have.length(1)
    const fixture = signTxAllElementsCombinedCertificates[0]
    const certificates = fixture.tx.certificates
    expect(certificates).to.have.length(16)

    const certificateTypes = certificates!.map((cert) => cert.type)
    expect(certificateTypes).to.include.members([
      CertificateType.STAKE_POOL_AND_DREP_DELEGATION,
      CertificateType.ACCOUNT_REGISTRATION_DELEGATION_TO_STAKE_POOL,
      CertificateType.ACCOUNT_REGISTRATION_DELEGATION_TO_DREP,
      CertificateType.ACCOUNT_REGISTRATION_DELEGATION_TO_STAKE_POOL_AND_DREP,
    ])

    const parsed = parseSignTransactionRequest({
      tx: fixture.tx,
      signingMode: fixture.signingMode,
      additionalWitnessPaths: fixture.additionalWitnessPaths,
    })
    expect(serializeTransactionRaw(parsed.tx).toString('hex')).to.equal(
      combinedCertificatesRawTxHex,
    )
  })

  it('parses the multisig certificate fixture bucket', () => {
    expect(signTxAllElementsCertificatesMultisig).to.have.length(1)
    const broadFixture = signTxAllElementsCertificatesMultisig[0]

    expect(broadFixture.signingMode).to.equal(
      TransactionSigningMode.PLUTUS_TRANSACTION,
    )

    const certs = broadFixture.tx.certificates!
    const certificateTypes = certs.map((cert) => cert.type)

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

    const cert0 = certs[0]
    expect(cert0.type).to.equal(CertificateType.STAKE_REGISTRATION)
    if (cert0.type !== CertificateType.STAKE_REGISTRATION) throw new Error()
    expect(cert0.params.stakeCredential.type).to.equal(
      CredentialParamsType.SCRIPT_HASH,
    )

    const cert3 = certs[3]
    expect(cert3.type).to.equal(CertificateType.VOTE_DELEGATION)
    if (cert3.type !== CertificateType.VOTE_DELEGATION) throw new Error()
    expect(cert3.params.dRep.type).to.equal(DRepParamsType.KEY_HASH)

    const cert4 = certs[4]
    expect(cert4.type).to.equal(CertificateType.VOTE_DELEGATION)
    if (cert4.type !== CertificateType.VOTE_DELEGATION) throw new Error()
    expect(cert4.params.dRep.type).to.equal(DRepParamsType.SCRIPT_HASH)

    const cert5 = certs[5]
    expect(cert5.type).to.equal(CertificateType.VOTE_DELEGATION)
    if (cert5.type !== CertificateType.VOTE_DELEGATION) throw new Error()
    expect(cert5.params.dRep.type).to.equal(DRepParamsType.ABSTAIN)

    const cert6 = certs[6]
    expect(cert6.type).to.equal(CertificateType.VOTE_DELEGATION)
    if (cert6.type !== CertificateType.VOTE_DELEGATION) throw new Error()
    expect(cert6.params.dRep.type).to.equal(DRepParamsType.NO_CONFIDENCE)

    const cert9 = certs[9]
    expect(cert9.type).to.equal(CertificateType.RESIGN_COMMITTEE_COLD)
    if (cert9.type !== CertificateType.RESIGN_COMMITTEE_COLD) throw new Error()
    expect(cert9.params.coldCredential.type).to.equal(
      CredentialParamsType.SCRIPT_HASH,
    )

    const cert10 = certs[10]
    expect(cert10.type).to.equal(CertificateType.DREP_REGISTRATION)
    if (cert10.type !== CertificateType.DREP_REGISTRATION) throw new Error()
    expect(cert10.params.dRepCredential.type).to.equal(
      CredentialParamsType.SCRIPT_HASH,
    )

    const cert13 = certs[13]
    expect(cert13.type).to.equal(CertificateType.STAKE_DEREGISTRATION_CONWAY)
    if (cert13.type !== CertificateType.STAKE_DEREGISTRATION_CONWAY)
      throw new Error()
    expect(cert13.params.stakeCredential.type).to.equal(
      CredentialParamsType.SCRIPT_HASH,
    )
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
    expect(tx.votingProcedures![0].votes).to.have.length(1)
  })
})
