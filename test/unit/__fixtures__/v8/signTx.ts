import {parseSignTransactionRequest} from '../../../../src/parsing/transaction'
import {TxAuxiliaryDataType} from '../../../../src/types/public'
import {
  buildSignTxAuxiliaryDataDelegation,
  buildSignTxAuxiliaryDataInit,
  buildSignTxChunks,
  buildSignTxInit,
  buildSignTxWitness,
} from '../../../../src/interactions/v8/commandBuilder'
import {serializeApdu} from '../../../../src/interactions/v8/common/apdu'
import {
  testsAlonzoTrezorComparison,
  testsBabbageTrezorComparison,
} from '../../../integration/__fixtures__/signTx'
import {testsCVoteRegistrationCIP36} from '../../../integration/__fixtures__/signTxCVote'

const INS_SIGN_TX = 0x21
const P1_TX_SIGN_WITNESS = 0x0f
const P1_TX_INIT = 0x10
const P1_TX_CHUNK = 0x11
const P1_TX_CONFIRM = 0x12
const P1_TX_AUX_DATA = 0x13
const P2_UNUSED = 0x00
const P2_AUX_DATA_INIT = 0x36
const P2_AUX_DATA_DELEGATION = 0x37
const MAX_SIGN_TX_CHUNK_SIZE = 250

function u8Hex(value: number): string {
  return value.toString(16).padStart(2, '0')
}

function u16Hex(value: number): string {
  return value.toString(16).padStart(4, '0')
}

function u32Hex(value: number): string {
  return value.toString(16).padStart(8, '0')
}

function u64Hex(value: bigint): string {
  return value.toString(16).padStart(16, '0')
}

function buildApduHex(ins: number, p1: number, p2: number, payloadHex: string) {
  return `${u8Hex(0xd7)}${u8Hex(ins)}${u8Hex(p1)}${u8Hex(p2)}${u8Hex(
    payloadHex.length / 2,
  )}${payloadHex}`
}

function signingModeHex(signingMode: string): string {
  const mapping: Record<string, number> = {
    ordinary_transaction: 3,
    pool_registration_as_owner: 4,
    pool_registration_as_operator: 5,
    multisig_transaction: 6,
    plutus_transaction: 7,
  }
  return u8Hex(mapping[signingMode])
}

function buildInitApduHex(params: {
  networkId: number
  protocolMagic: number
  signingMode: string
  numInputs: number
  numOutputs: number
  includeTtl: boolean
  numCertificates: number
  numWithdrawals: number
  includeAuxDataHash: boolean
  auxDataType: number | null
  auxDataHashHex: string
  includeValidityIntervalStart: boolean
  numMintAssetGroups: number
  includeScriptDataHash: boolean
  numCollateralInputs: number
  numRequiredSigners: number
  includeNetworkId: boolean
  includeCollateralOutput: boolean
  includeTotalCollateral: boolean
  numReferenceInputs: number
  numVoters: number
  includeTreasury: boolean
  includeDonation: boolean
  numWitnesses: number
  rawTxHex: string
}) {
  const payloadHex = [
    u64Hex(BigInt(0)),
    u8Hex(params.networkId),
    u32Hex(params.protocolMagic),
    signingModeHex(params.signingMode),
    u16Hex(params.numInputs),
    u16Hex(params.numOutputs),
    u8Hex(params.includeTtl ? 2 : 1),
    u16Hex(params.numCertificates),
    u16Hex(params.numWithdrawals),
    u8Hex(params.includeAuxDataHash ? 2 : 1),
    params.includeAuxDataHash ? u8Hex(params.auxDataType ?? 0) : '',
    params.includeAuxDataHash && params.auxDataHashHex.length > 0
      ? params.auxDataHashHex
      : '',
    u8Hex(params.includeValidityIntervalStart ? 2 : 1),
    u16Hex(params.numMintAssetGroups),
    u8Hex(params.includeScriptDataHash ? 2 : 1),
    u16Hex(params.numCollateralInputs),
    u16Hex(params.numRequiredSigners),
    u8Hex(params.includeNetworkId ? 2 : 1),
    u8Hex(params.includeCollateralOutput ? 2 : 1),
    u8Hex(params.includeTotalCollateral ? 2 : 1),
    u16Hex(params.numReferenceInputs),
    u16Hex(params.numVoters),
    u8Hex(params.includeTreasury ? 2 : 1),
    u8Hex(params.includeDonation ? 2 : 1),
    u16Hex(params.numWitnesses),
    u16Hex(params.rawTxHex.length / 2),
  ].join('')

  return buildApduHex(INS_SIGN_TX, P1_TX_INIT, P2_UNUSED, payloadHex)
}

function buildChunkApdusHex(rawTxHex: string): string[] {
  const result: string[] = []
  for (
    let offset = 0;
    offset < rawTxHex.length;
    offset += MAX_SIGN_TX_CHUNK_SIZE * 2
  ) {
    const chunkHex = rawTxHex.slice(offset, offset + MAX_SIGN_TX_CHUNK_SIZE * 2)
    const p1 =
      offset + MAX_SIGN_TX_CHUNK_SIZE * 2 < rawTxHex.length
        ? P1_TX_CHUNK
        : P1_TX_CONFIRM
    result.push(buildApduHex(INS_SIGN_TX, p1, P2_UNUSED, chunkHex))
  }
  return result
}

function buildWitnessApduHex(payloadHex: string): string {
  return buildApduHex(INS_SIGN_TX, P1_TX_SIGN_WITNESS, P2_UNUSED, payloadHex)
}

function parseFixtureRequest(
  testCase: (typeof testsAlonzoTrezorComparison)[number],
) {
  return parseSignTransactionRequest({
    tx: testCase.tx,
    signingMode: testCase.signingMode,
    additionalWitnessPaths: testCase.additionalWitnessPaths,
  })
}

function expectHexString(value: string | undefined): string {
  if (value == null) {
    throw new Error('expected hex string fixture value')
  }
  return value
}

export const parsedAlonzoTrezorSignTxRequest = parseFixtureRequest(
  testsAlonzoTrezorComparison[0],
)

export const parsedBabbagePlutusSignTxRequest = parseFixtureRequest(
  testsBabbageTrezorComparison[0],
)

export const parsedBabbageOrdinarySignTxRequest = parseFixtureRequest(
  testsBabbageTrezorComparison[1],
)

export const parsedCIP36VoteKeyHexSignTxRequest = parseFixtureRequest(
  testsCVoteRegistrationCIP36[0],
)

export const parsedCIP36DelegationsSignTxRequest = parseFixtureRequest(
  testsCVoteRegistrationCIP36[5],
)

export const alonzoTrezorRawTxHex =
  '3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700000000007801003901eb0baa5e570cffbe2934db29df0b6a3d7c0430ee65d4c3a7ab2fefb91bc428e4720702ebd5dab4fb175324c192dc9bb76cc5da956e3c8dff00000000001e848000010100010d63e8d2c5a00cbcffbdf9112487c443466e1ea7d8c834df5ac5c42500010874657374436f696e0000000000783862004e01001d71477e52b3116b62fe8cd34a312615f5fcd678c94e1d6cdb86c1a3964c00000000000000010002010000003b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000000000000002a000000000000000a000129fb5fd4aa8cadd6705acc8263cee0fc62edca5ac38db593fec2f9fd010129fb5fd4aa8cadd6705acc8263cee0fc62edca5ac38db593fec2f9fd020129fb5fd4aa8cadd6705acc8263cee0fc62edca5ac38db593fec2f9fdf61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb497300000000000003e80129fb5fd4aa8cadd6705acc8263cee0fc62edca5ac38db593fec2f9fd000000000000002f0d63e8d2c5a00cbcffbdf9112487c443466e1ea7d8c834df5ac5c42500020874657374436f696e00000000007838620875657374436f696effffffffff87c79e3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7'
export const babbagePlutusRawTxHex =
  '3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000000000078010039017cb05fce110fb999f01abb4f62bc455e217d4a51fde909fa9aea545443ac53c046cf6a42095e3c60310fa802771d0672f8fe2d1861138b0900000000001e848000010100010d63e8d2c5a00cbcffbdf9112487c443466e1ea7d8c834df5ac5c42500010874657374436f696e0000000000783862004e01001d71477e52b3116b62fe8cd34a312615f5fcd678c94e1d6cdb86c1a3964c00000000000000010002010000003b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000000000000002a000000000000000a000000000000002f3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b73b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000000000049010039017cb05fce110fb999f01abb4f62bc455e217d4a51fde909fa9aea545443ac53c046cf6a42095e3c60310fa802771d0672f8fe2d1861138b0900000000000000010001010000000000000000000a3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700000000'
export const babbageOrdinaryRawTxHex =
  '3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700000000008101001d71477e52b3116b62fe8cd34a312615f5fcd678c94e1d6cdb86c1a3964c000000000000000101020200000100165579657420616e6f746865722063686f636f6c61746500390080f9e2c88e6c817008f3a812ed889b4a4da8e0bd103f86e7335422aa122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277000000000000002a000000000000000a000000000000002f'
export const cip36VoteKeyHexRawTxHex =
  '3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700000000003b020001058000073c8000071780000000000000000000000022058000073c8000071780000000000000020000000000000000006ca7930001010000000000000000002a000000000000000a'
export const cip36DelegationsRawTxHex =
  '3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700000000003b020001058000073c8000071780000000000000000000000022058000073c8000071780000000000000020000000000000000006ca7930001010000000000000000002a000000000000000a0000000000000007'
export const cip36VoteKeyHexAuxDataResponseHex = `${expectHexString(
  testsCVoteRegistrationCIP36[0].expectedResult.auxiliaryDataSupplement
    ?.auxiliaryDataHashHex,
)}${expectHexString(
  testsCVoteRegistrationCIP36[0].expectedResult.auxiliaryDataSupplement
    ?.cip36VoteRegistrationSignatureHex,
)}`
export const cip36DelegationsAuxDataResponseHex = `${expectHexString(
  testsCVoteRegistrationCIP36[5].expectedResult.auxiliaryDataSupplement
    ?.auxiliaryDataHashHex,
)}${expectHexString(
  testsCVoteRegistrationCIP36[5].expectedResult.auxiliaryDataSupplement
    ?.cip36VoteRegistrationSignatureHex,
)}`
export const cip36VoteKeyHexExpectedAuxInitApduHex = buildApduHex(
  INS_SIGN_TX,
  P1_TX_AUX_DATA,
  P2_AUX_DATA_INIT,
  '02000002058000073c80000717800000000000000200000000020e0122058000073c8000071780000000000000020000000000000000001631700000000000000000004b19e27ffc006ace16592311c4d2f0cafc255eaa47a6178ff540c0a46d07027c',
)
export const cip36DelegationsExpectedAuxInitApduHex = buildApduHex(
  INS_SIGN_TX,
  P1_TX_AUX_DATA,
  P2_AUX_DATA_INIT,
  '02000202058000073c80000717800000000000000200000000020001058000073c8000071780000000000000000000000022058000073c8000071780000000000000020000000000000000001631700000000000000ae6',
)
export const cip36DelegationsExpectedAuxDelegationApdusHex = [
  buildApduHex(
    INS_SIGN_TX,
    P1_TX_AUX_DATA,
    P2_AUX_DATA_DELEGATION,
    '004b19e27ffc006ace16592311c4d2f0cafc255eaa47a6178ff540c0a46d07027c00000009',
  ),
  buildApduHex(
    INS_SIGN_TX,
    P1_TX_AUX_DATA,
    P2_AUX_DATA_DELEGATION,
    '02058000069e8000071780000000000000000000000100000000',
  ),
]

export const alonzoExpectedInitApduHex = buildInitApduHex({
  networkId: 1,
  protocolMagic: 764824073,
  signingMode: parsedAlonzoTrezorSignTxRequest.signingMode as unknown as string,
  numInputs: 1,
  numOutputs: 2,
  includeTtl: true,
  numCertificates: 3,
  numWithdrawals: 1,
  includeAuxDataHash: true,
  auxDataType: 0,
  auxDataHashHex:
    '58ec01578fcdfdc376f09631a7b2adc608eaf57e3720484c7ff37c13cff90fdf',
  includeValidityIntervalStart: true,
  numMintAssetGroups: 1,
  includeScriptDataHash: true,
  numCollateralInputs: 0,
  numRequiredSigners: 0,
  includeNetworkId: true,
  includeCollateralOutput: false,
  includeTotalCollateral: false,
  numReferenceInputs: 0,
  numVoters: 0,
  includeTreasury: false,
  includeDonation: false,
  numWitnesses: 2,
  rawTxHex: alonzoTrezorRawTxHex,
})

export const babbagePlutusExpectedInitApduHex = buildInitApduHex({
  networkId: 1,
  protocolMagic: 764824073,
  signingMode:
    parsedBabbagePlutusSignTxRequest.signingMode as unknown as string,
  numInputs: 1,
  numOutputs: 2,
  includeTtl: true,
  numCertificates: 0,
  numWithdrawals: 0,
  includeAuxDataHash: false,
  auxDataType: null,
  auxDataHashHex: '',
  includeValidityIntervalStart: true,
  numMintAssetGroups: 0,
  includeScriptDataHash: true,
  numCollateralInputs: 1,
  numRequiredSigners: 0,
  includeNetworkId: true,
  includeCollateralOutput: true,
  includeTotalCollateral: true,
  numReferenceInputs: 1,
  numVoters: 0,
  includeTreasury: false,
  includeDonation: false,
  numWitnesses: 1,
  rawTxHex: babbagePlutusRawTxHex,
})

export const babbageOrdinaryExpectedInitApduHex = buildInitApduHex({
  networkId: 1,
  protocolMagic: 764824073,
  signingMode:
    parsedBabbageOrdinarySignTxRequest.signingMode as unknown as string,
  numInputs: 1,
  numOutputs: 1,
  includeTtl: true,
  numCertificates: 0,
  numWithdrawals: 0,
  includeAuxDataHash: false,
  auxDataType: null,
  auxDataHashHex: '',
  includeValidityIntervalStart: true,
  numMintAssetGroups: 0,
  includeScriptDataHash: false,
  numCollateralInputs: 0,
  numRequiredSigners: 0,
  includeNetworkId: true,
  includeCollateralOutput: false,
  includeTotalCollateral: false,
  numReferenceInputs: 0,
  numVoters: 0,
  includeTreasury: false,
  includeDonation: false,
  numWitnesses: 1,
  rawTxHex: babbageOrdinaryRawTxHex,
})

export const cip36VoteKeyHexExpectedInitApduHex = buildInitApduHex({
  networkId: 1,
  protocolMagic: 764824073,
  signingMode:
    parsedCIP36VoteKeyHexSignTxRequest.signingMode as unknown as string,
  numInputs: 1,
  numOutputs: 1,
  includeTtl: true,
  numCertificates: 0,
  numWithdrawals: 0,
  includeAuxDataHash: true,
  auxDataType: 1,
  auxDataHashHex: '',
  includeValidityIntervalStart: false,
  numMintAssetGroups: 0,
  includeScriptDataHash: false,
  numCollateralInputs: 0,
  numRequiredSigners: 0,
  includeNetworkId: false,
  includeCollateralOutput: false,
  includeTotalCollateral: false,
  numReferenceInputs: 0,
  numVoters: 0,
  includeTreasury: false,
  includeDonation: false,
  numWitnesses: 1,
  rawTxHex: cip36VoteKeyHexRawTxHex,
})

export const cip36DelegationsExpectedInitApduHex = buildInitApduHex({
  networkId: 1,
  protocolMagic: 764824073,
  signingMode:
    parsedCIP36DelegationsSignTxRequest.signingMode as unknown as string,
  numInputs: 1,
  numOutputs: 1,
  includeTtl: true,
  numCertificates: 0,
  numWithdrawals: 0,
  includeAuxDataHash: true,
  auxDataType: 1,
  auxDataHashHex: '',
  includeValidityIntervalStart: true,
  numMintAssetGroups: 0,
  includeScriptDataHash: false,
  numCollateralInputs: 0,
  numRequiredSigners: 0,
  includeNetworkId: false,
  includeCollateralOutput: false,
  includeTotalCollateral: false,
  numReferenceInputs: 0,
  numVoters: 0,
  includeTreasury: false,
  includeDonation: false,
  numWitnesses: 1,
  rawTxHex: cip36DelegationsRawTxHex,
})

export const alonzoExpectedChunkApdusHex =
  buildChunkApdusHex(alonzoTrezorRawTxHex)
export const babbagePlutusExpectedChunkApdusHex = buildChunkApdusHex(
  babbagePlutusRawTxHex,
)
export const babbageOrdinaryExpectedChunkApdusHex = buildChunkApdusHex(
  babbageOrdinaryRawTxHex,
)
export const cip36VoteKeyHexExpectedChunkApdusHex = buildChunkApdusHex(
  cip36VoteKeyHexRawTxHex,
)
export const cip36DelegationsExpectedChunkApdusHex = buildChunkApdusHex(
  cip36DelegationsRawTxHex,
)

export const alonzoExpectedWitnessApdusHex = [
  buildWitnessApduHex('058000073e80000717800000000000000000000000'),
  buildWitnessApduHex('058000073e80000717800000000000000200000000'),
]

export const babbagePlutusExpectedWitnessApdusHex = [
  buildWitnessApduHex('058000073c80000717800000000000000000000000'),
]

export const babbageOrdinaryExpectedWitnessApdusHex = [
  buildWitnessApduHex('058000073c80000717800000000000000000000000'),
]
export const cip36VoteKeyHexExpectedWitnessApdusHex = [
  buildWitnessApduHex('058000073c80000717800000000000000000000000'),
]
export const cip36DelegationsExpectedWitnessApdusHex = [
  buildWitnessApduHex('058000073c80000717800000000000000000000000'),
]

export const alonzoExpectedWitnessPaths =
  parsedAlonzoTrezorSignTxRequest.additionalWitnessPaths

export const babbagePlutusExpectedWitnessPaths = [
  parsedBabbagePlutusSignTxRequest.tx.inputs[0].path!,
]

export const babbageOrdinaryExpectedWitnessPaths = [
  parsedBabbageOrdinarySignTxRequest.tx.inputs[0].path!,
]
export const cip36VoteKeyHexExpectedWitnessPaths = [
  parsedCIP36VoteKeyHexSignTxRequest.tx.inputs[0].path!,
]
export const cip36DelegationsExpectedWitnessPaths = [
  parsedCIP36DelegationsSignTxRequest.tx.inputs[0].path!,
]

export function serializeBuiltInitApduHex(
  request: typeof parsedAlonzoTrezorSignTxRequest,
  witnessPaths: typeof alonzoExpectedWitnessPaths,
) {
  return serializeApdu(buildSignTxInit(request, witnessPaths)).toString('hex')
}

export function serializeBuiltChunkApdusHex(
  request: typeof parsedAlonzoTrezorSignTxRequest,
) {
  return buildSignTxChunks(request.tx).map(
    (apdu: {ins: number; p1: number; p2: number; data: Buffer}) =>
      serializeApdu(apdu).toString('hex'),
  )
}

export function serializeBuiltAuxInitApduHex(
  request:
    | typeof parsedCIP36VoteKeyHexSignTxRequest
    | typeof parsedCIP36DelegationsSignTxRequest,
) {
  if (
    request.tx.auxiliaryData?.type !== TxAuxiliaryDataType.CIP36_REGISTRATION
  ) {
    throw new Error('expected CIP36 auxiliary data')
  }

  return serializeApdu(
    buildSignTxAuxiliaryDataInit(request.tx.auxiliaryData.params),
  ).toString('hex')
}

export function serializeBuiltAuxDelegationApdusHex(
  request: typeof parsedCIP36DelegationsSignTxRequest,
) {
  if (
    request.tx.auxiliaryData?.type !== TxAuxiliaryDataType.CIP36_REGISTRATION
  ) {
    throw new Error('expected CIP36 auxiliary data')
  }

  return (request.tx.auxiliaryData.params.delegations ?? []).map(
    (delegation, index, delegations) =>
      serializeApdu(
        buildSignTxAuxiliaryDataDelegation(
          delegation,
          index === delegations.length - 1,
        ),
      ).toString('hex'),
  )
}

export function serializeBuiltWitnessApdusHex(
  witnessPaths: typeof alonzoExpectedWitnessPaths,
) {
  return witnessPaths.map((path: number[]) =>
    serializeApdu(buildSignTxWitness(path as never)).toString('hex'),
  )
}
