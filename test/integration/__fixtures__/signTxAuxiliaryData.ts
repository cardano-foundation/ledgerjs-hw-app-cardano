import {
  TransactionSigningMode,
  TxAuxiliaryDataSupplementType,
} from '../../../src/types/public'
import {signTxAllElementsAuxiliaryData} from './signTxAllElements'
import type {SignTxTestCase} from './signTx'

export const testsAuxiliaryData: SignTxTestCase[] = [
  {
    testName: 'signTxAuxiliaryData_cip36_registration',
    tx: signTxAllElementsAuxiliaryData[0].tx as SignTxTestCase['tx'],
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    txBody: signTxAllElementsAuxiliaryData[0].txBody,
    expectedResult: {
      txHashHex:
        '3ab4380755f30a7ded07dcdcc8a0487df1a4762e7a69d383cd4e75ba25378730',
      witnesses: [
        {
          path: [2147485500, 2147485463, 2147483648, 0, 0],
          witnessSignatureHex:
            'f9a4614237159258f3555a2fb8691bc66a55d973a0bbf874b87af381698da4f651d49c3602d81a8c4f2248781c2cebf007457f6c8ba2c0961a3edea745bbf707',
        },
      ],
      auxiliaryDataSupplement: {
        type: TxAuxiliaryDataSupplementType.CIP36_REGISTRATION,
        auxiliaryDataHashHex:
          '1999b3bb9102b585c42616e40cf1290518d788f967ab4b3329dcb712ac933da0',
        cip36VoteRegistrationSignatureHex:
          'd07070f841e17f50139bfd6cadeaa89ce87474200db051f48d585cba52360f52444db9b4529e1721348763374f35fa8a054d5a3931fb3524484aa910cf465505',
      },
    },
  },
]
