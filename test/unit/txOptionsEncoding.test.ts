import {expect} from 'chai'

import {buildSignTxInit} from '../../src/interactions/v8/commandBuilder'
import {serializeTxInit} from '../../src/interactions/v7/serialization/txInit'
import {parseSignTransactionRequest} from '../../src/parsing/transaction'
import {parseUint64_str} from '../../src/utils/parse'
import {uint64_to_buf} from '../../src/utils/serialize'
import {InvalidDataReason} from '../../src/errors/index'
import {testsShelleyNoCertificates} from '../integration/__fixtures__/signTx'
import {
  TransactionSigningMode,
  TxOutputDestinationType,
  type TxOutputAlonzo,
} from '../../src/types/public'

const v6Version = {
  major: 6,
  minor: 0,
  patch: 0,
  flags: {isDebug: false, isAppXS: false},
}

const v7ConwayVersion = {
  major: 7,
  minor: 0,
  patch: 0,
  flags: {isDebug: false, isAppXS: false},
}

const baseTx = {
  network: {protocolMagic: 42, networkId: 0},
  inputs: [
    {
      txHashHex:
        '3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7',
      outputIndex: 0,
      path: null,
    },
  ],
  outputs: [
    {
      destination: {
        type: TxOutputDestinationType.THIRD_PARTY,
        params: {
          addressHex:
            '82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c2561',
        },
      },
      amount: 1_500_000,
    } as TxOutputAlonzo,
  ],
  fee: 42,
  ttl: 10,
}

describe('tx options encoding', () => {
  const requestWithoutTag = parseSignTransactionRequest({
    tx: testsShelleyNoCertificates[0].tx,
    signingMode: testsShelleyNoCertificates[0].signingMode,
    additionalWitnessPaths:
      testsShelleyNoCertificates[0].additionalWitnessPaths,
    options: testsShelleyNoCertificates[0].options,
  })

  const requestWithTag = parseSignTransactionRequest({
    tx: testsShelleyNoCertificates[1].tx,
    signingMode: testsShelleyNoCertificates[1].signingMode,
    additionalWitnessPaths:
      testsShelleyNoCertificates[1].additionalWitnessPaths,
    options: testsShelleyNoCertificates[1].options,
  })

  it('omits the options field for pre-Conway v7 app compatibility', () => {
    const initData = serializeTxInit(
      requestWithTag.tx,
      requestWithTag.signingMode,
      1,
      requestWithTag.options,
      v6Version,
    )

    expect(initData[0]).to.equal(requestWithTag.tx.network.networkId)
  })

  it('encodes legacy TX_INIT options as u64(0) and u64(1)', () => {
    const withoutTag = serializeTxInit(
      requestWithoutTag.tx,
      requestWithoutTag.signingMode,
      1,
      requestWithoutTag.options,
      v7ConwayVersion,
    )
    const withTag = serializeTxInit(
      requestWithTag.tx,
      requestWithTag.signingMode,
      1,
      requestWithTag.options,
      v7ConwayVersion,
    )

    expect(withoutTag.slice(0, 8).toString('hex')).to.equal('0000000000000000')
    expect(withTag.slice(0, 8).toString('hex')).to.equal('0000000000000001')
  })

  it('encodes v8 TX_INIT options as u64(0) and u64(1)', () => {
    const withoutTag = buildSignTxInit(requestWithoutTag, []).data
    const withTag = buildSignTxInit(requestWithTag, []).data

    expect(withoutTag.slice(0, 8).toString('hex')).to.equal('0000000000000000')
    expect(withTag.slice(0, 8).toString('hex')).to.equal('0000000000000001')
  })

  it('serializes unrestricted signing mode as 0x09 in v8 init data', () => {
    const parsed = parseSignTransactionRequest({
      tx: baseTx,
      signingMode: TransactionSigningMode.UNRESTRICTED_TRANSACTION,
    })
    const init = buildSignTxInit(parsed, []).data
    // signing mode byte is at offset 13: 8 bytes options + 1 network id + 4 protocol magic
    expect(init[13]).to.equal(0x09)
  })

  it('serializes the highest uint64 bit in big-endian order', () => {
    expect(
      uint64_to_buf(
        parseUint64_str(
          '9223372036854775808',
          {max: '18446744073709551615'},
          InvalidDataReason.FEE_INVALID,
        ),
      ).toString('hex'),
    ).to.equal('8000000000000000')
  })
})
