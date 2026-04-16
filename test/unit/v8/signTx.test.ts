import {expect} from 'chai'
import {createRequire} from 'module'

const nodeRequire = createRequire(__filename)
const {serializeTransactionRaw} = nodeRequire(
  '../../../src/interactions/v8/serialization/tx',
)
const {sendSignTx} = nodeRequire('../../../src/interactions/v8/commandSender')
const {signTransaction} = nodeRequire('../../../src/interactions/v8/signTx')
const {
  alonzoExpectedChunkApdusHex,
  alonzoExpectedInitApduHex,
  alonzoExpectedWitnessApdusHex,
  alonzoExpectedWitnessPaths,
  alonzoTrezorRawTxHex,
  babbageOrdinaryExpectedChunkApdusHex,
  babbageOrdinaryExpectedInitApduHex,
  babbageOrdinaryExpectedWitnessApdusHex,
  babbageOrdinaryExpectedWitnessPaths,
  babbageOrdinaryRawTxHex,
  babbagePlutusExpectedChunkApdusHex,
  babbagePlutusExpectedInitApduHex,
  babbagePlutusExpectedWitnessApdusHex,
  babbagePlutusExpectedWitnessPaths,
  babbagePlutusRawTxHex,
  cip36DelegationsAuxDataResponseHex,
  cip36DelegationsExpectedAuxDelegationApdusHex,
  cip36DelegationsExpectedAuxInitApduHex,
  cip36DelegationsExpectedChunkApdusHex,
  cip36DelegationsExpectedInitApduHex,
  cip36DelegationsExpectedWitnessApdusHex,
  cip36DelegationsExpectedWitnessPaths,
  cip36DelegationsRawTxHex,
  cip36VoteKeyHexAuxDataResponseHex,
  cip36VoteKeyHexExpectedAuxInitApduHex,
  cip36VoteKeyHexExpectedChunkApdusHex,
  cip36VoteKeyHexExpectedInitApduHex,
  cip36VoteKeyHexExpectedWitnessApdusHex,
  cip36VoteKeyHexExpectedWitnessPaths,
  cip36VoteKeyHexRawTxHex,
  parsedAlonzoTrezorSignTxRequest,
  parsedBabbageOrdinarySignTxRequest,
  parsedBabbagePlutusSignTxRequest,
  parsedCIP36DelegationsSignTxRequest,
  parsedCIP36VoteKeyHexSignTxRequest,
  serializeBuiltAuxDelegationApdusHex,
  serializeBuiltAuxInitApduHex,
  serializeBuiltChunkApdusHex,
  serializeBuiltInitApduHex,
  serializeBuiltWitnessApdusHex,
} = nodeRequire('../__fixtures__/v8/signTx')

function exhaustSender(
  request: typeof parsedAlonzoTrezorSignTxRequest,
  witnessPaths: typeof alonzoExpectedWitnessPaths,
  responses: Buffer[],
) {
  const interaction = sendSignTx(request, witnessPaths)
  const yieldedHex: string[] = []

  let step = interaction.next()
  for (let i = 0; !step.done; i++) {
    yieldedHex.push(
      step.value
        ? nodeRequire('../../../src/interactions/v8/common/apdu')
            .serializeApdu(step.value)
            .toString('hex')
        : '',
    )
    step = interaction.next(responses[i] ?? Buffer.alloc(0))
  }

  return {yieldedHex, result: step.value}
}

function exhaustSignTransaction(
  request: typeof parsedCIP36VoteKeyHexSignTxRequest,
  responses: Buffer[],
) {
  const interaction = signTransaction(
    {major: 8, minor: 0, patch: 0, flags: {isDebug: false, isAppXS: false}},
    request,
  )

  let step = interaction.next()
  for (let i = 0; !step.done; i++) {
    step = interaction.next(responses[i] ?? Buffer.alloc(0))
  }

  return step.value
}

describe('v8 signTx', () => {
  it('serializes the Alonzo trezor-parity raw tx like the Python fixture', () => {
    expect(
      serializeTransactionRaw(parsedAlonzoTrezorSignTxRequest.tx).toString(
        'hex',
      ),
    ).to.equal(alonzoTrezorRawTxHex)
  })

  it('serializes the Babbage plutus raw tx like the Python fixture', () => {
    expect(
      serializeTransactionRaw(parsedBabbagePlutusSignTxRequest.tx).toString(
        'hex',
      ),
    ).to.equal(babbagePlutusRawTxHex)
  })

  it('serializes the Babbage ordinary raw tx like the Python fixture', () => {
    expect(
      serializeTransactionRaw(parsedBabbageOrdinarySignTxRequest.tx).toString(
        'hex',
      ),
    ).to.equal(babbageOrdinaryRawTxHex)
  })

  it('serializes the CIP36 vote-key-hex raw tx like the Python fixture', () => {
    expect(
      serializeTransactionRaw(parsedCIP36VoteKeyHexSignTxRequest.tx).toString(
        'hex',
      ),
    ).to.equal(cip36VoteKeyHexRawTxHex)
  })

  it('serializes the CIP36 delegations raw tx like the Python fixture', () => {
    expect(
      serializeTransactionRaw(parsedCIP36DelegationsSignTxRequest.tx).toString(
        'hex',
      ),
    ).to.equal(cip36DelegationsRawTxHex)
  })

  it('builds the Alonzo trezor-parity APDUs like the Python fixture', () => {
    expect(
      serializeBuiltInitApduHex(
        parsedAlonzoTrezorSignTxRequest,
        alonzoExpectedWitnessPaths,
      ),
    ).to.equal(alonzoExpectedInitApduHex)
    expect(
      serializeBuiltChunkApdusHex(parsedAlonzoTrezorSignTxRequest),
    ).to.deep.equal(alonzoExpectedChunkApdusHex)
    expect(
      serializeBuiltWitnessApdusHex(alonzoExpectedWitnessPaths),
    ).to.deep.equal(alonzoExpectedWitnessApdusHex)
  })

  it('builds the Babbage plutus APDUs like the Python fixture', () => {
    expect(
      serializeBuiltInitApduHex(
        parsedBabbagePlutusSignTxRequest,
        babbagePlutusExpectedWitnessPaths,
      ),
    ).to.equal(babbagePlutusExpectedInitApduHex)
    expect(
      serializeBuiltChunkApdusHex(parsedBabbagePlutusSignTxRequest),
    ).to.deep.equal(babbagePlutusExpectedChunkApdusHex)
    expect(
      serializeBuiltWitnessApdusHex(babbagePlutusExpectedWitnessPaths),
    ).to.deep.equal(babbagePlutusExpectedWitnessApdusHex)
  })

  it('builds the Babbage ordinary APDUs like the Python fixture', () => {
    expect(
      serializeBuiltInitApduHex(
        parsedBabbageOrdinarySignTxRequest,
        babbageOrdinaryExpectedWitnessPaths,
      ),
    ).to.equal(babbageOrdinaryExpectedInitApduHex)
    expect(
      serializeBuiltChunkApdusHex(parsedBabbageOrdinarySignTxRequest),
    ).to.deep.equal(babbageOrdinaryExpectedChunkApdusHex)
    expect(
      serializeBuiltWitnessApdusHex(babbageOrdinaryExpectedWitnessPaths),
    ).to.deep.equal(babbageOrdinaryExpectedWitnessApdusHex)
  })

  it('builds the CIP36 vote-key-hex APDUs like the Python fixture', () => {
    expect(
      serializeBuiltInitApduHex(
        parsedCIP36VoteKeyHexSignTxRequest,
        cip36VoteKeyHexExpectedWitnessPaths,
      ),
    ).to.equal(cip36VoteKeyHexExpectedInitApduHex)
    expect(
      serializeBuiltAuxInitApduHex(parsedCIP36VoteKeyHexSignTxRequest),
    ).to.equal(cip36VoteKeyHexExpectedAuxInitApduHex)
    expect(
      serializeBuiltChunkApdusHex(parsedCIP36VoteKeyHexSignTxRequest),
    ).to.deep.equal(cip36VoteKeyHexExpectedChunkApdusHex)
    expect(
      serializeBuiltWitnessApdusHex(cip36VoteKeyHexExpectedWitnessPaths),
    ).to.deep.equal(cip36VoteKeyHexExpectedWitnessApdusHex)
  })

  it('builds the CIP36 delegation APDUs like the Python fixture', () => {
    expect(
      serializeBuiltInitApduHex(
        parsedCIP36DelegationsSignTxRequest,
        cip36DelegationsExpectedWitnessPaths,
      ),
    ).to.equal(cip36DelegationsExpectedInitApduHex)
    expect(
      serializeBuiltAuxInitApduHex(parsedCIP36DelegationsSignTxRequest),
    ).to.equal(cip36DelegationsExpectedAuxInitApduHex)
    expect(
      serializeBuiltAuxDelegationApdusHex(parsedCIP36DelegationsSignTxRequest),
    ).to.deep.equal(cip36DelegationsExpectedAuxDelegationApdusHex)
    expect(
      serializeBuiltChunkApdusHex(parsedCIP36DelegationsSignTxRequest),
    ).to.deep.equal(cip36DelegationsExpectedChunkApdusHex)
    expect(
      serializeBuiltWitnessApdusHex(cip36DelegationsExpectedWitnessPaths),
    ).to.deep.equal(cip36DelegationsExpectedWitnessApdusHex)
  })

  it('yields the Alonzo trezor-parity sender sequence', () => {
    const expected = [
      alonzoExpectedInitApduHex,
      ...alonzoExpectedChunkApdusHex,
      ...alonzoExpectedWitnessApdusHex,
    ]
    const responses = [
      ...expected.slice(0, -3).map(() => Buffer.alloc(0)),
      Buffer.alloc(32, 0xaa),
      Buffer.alloc(64, 0xbb),
      Buffer.alloc(64, 0xbb),
    ]
    const {yieldedHex, result} = exhaustSender(
      parsedAlonzoTrezorSignTxRequest,
      alonzoExpectedWitnessPaths,
      responses,
    )

    expect(yieldedHex).to.deep.equal(expected)
    expect(result.txHashResponse.equals(Buffer.alloc(32, 0xaa))).to.equal(true)
    expect(result.witnessResponses).to.have.length(2)
  })

  it('yields the CIP36 vote-key-hex sender sequence and captures aux data response', () => {
    const expected = [
      cip36VoteKeyHexExpectedInitApduHex,
      cip36VoteKeyHexExpectedAuxInitApduHex,
      ...cip36VoteKeyHexExpectedChunkApdusHex,
      ...cip36VoteKeyHexExpectedWitnessApdusHex,
    ]
    const responses = [
      Buffer.alloc(0),
      Buffer.from(cip36VoteKeyHexAuxDataResponseHex, 'hex'),
      Buffer.alloc(32, 0xaa),
      Buffer.alloc(64, 0xbb),
    ]
    const {yieldedHex, result} = exhaustSender(
      parsedCIP36VoteKeyHexSignTxRequest,
      cip36VoteKeyHexExpectedWitnessPaths,
      responses,
    )

    expect(yieldedHex).to.deep.equal(expected)
    expect(result.auxiliaryDataResponse?.toString('hex')).to.equal(
      cip36VoteKeyHexAuxDataResponseHex,
    )
  })

  it('yields the CIP36 delegations sender sequence and captures final delegation response', () => {
    const expected = [
      cip36DelegationsExpectedInitApduHex,
      cip36DelegationsExpectedAuxInitApduHex,
      ...cip36DelegationsExpectedAuxDelegationApdusHex,
      ...cip36DelegationsExpectedChunkApdusHex,
      ...cip36DelegationsExpectedWitnessApdusHex,
    ]
    const responses = [
      Buffer.alloc(0),
      Buffer.alloc(0),
      Buffer.alloc(0),
      Buffer.from(cip36DelegationsAuxDataResponseHex, 'hex'),
      Buffer.alloc(32, 0xaa),
      Buffer.alloc(64, 0xbb),
    ]
    const {yieldedHex, result} = exhaustSender(
      parsedCIP36DelegationsSignTxRequest,
      cip36DelegationsExpectedWitnessPaths,
      responses,
    )

    expect(yieldedHex).to.deep.equal(expected)
    expect(result.auxiliaryDataResponse?.toString('hex')).to.equal(
      cip36DelegationsAuxDataResponseHex,
    )
  })

  it('returns the CIP36 auxiliaryDataSupplement in the v8 signTransaction result', () => {
    const result = exhaustSignTransaction(parsedCIP36DelegationsSignTxRequest, [
      Buffer.alloc(0),
      Buffer.alloc(0),
      Buffer.alloc(0),
      Buffer.from(cip36DelegationsAuxDataResponseHex, 'hex'),
      Buffer.alloc(32, 0xaa),
      Buffer.alloc(64, 0xbb),
    ])

    expect(result.auxiliaryDataSupplement).to.deep.equal(
      nodeRequire('../../../test/integration/__fixtures__/signTxCVote')
        .testsCVoteRegistrationCIP36[5].expectedResult.auxiliaryDataSupplement,
    )
  })

  it('rejects witness-count mismatches with a clear assertion', () => {
    expect(() =>
      exhaustSignTransaction(parsedCIP36DelegationsSignTxRequest, [
        Buffer.alloc(0),
        Buffer.alloc(0),
        Buffer.alloc(0),
        Buffer.from(cip36DelegationsAuxDataResponseHex, 'hex'),
      ]),
    ).to.throw('invalid v8 witness response count')
  })
})
