import {TransactionSigningMode} from '../../../src/types/public'
import {signTxAllElementsAuxiliaryData} from './signTxAllElements'
import type {SignTxTestCase} from './signTx'

const pendingResult = {} as SignTxTestCase['expectedResult']

export const testsAuxiliaryData: SignTxTestCase[] = [
  {
    testName: 'signTxAuxiliaryData_cip36_registration',
    tx: signTxAllElementsAuxiliaryData[0].tx as SignTxTestCase['tx'],
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    expectedResult: pendingResult,
  },
]
