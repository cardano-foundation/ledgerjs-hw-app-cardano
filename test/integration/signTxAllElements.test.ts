import {describeSignTxPositiveTest} from '../test_utils'
import {
  signTxAllElementsAuxiliaryData,
  signTxAllElementsCertificatesMultisig,
  signTxAllElementsCertificatesOrdinary,
  signTxAllElementsNoCertificates,
  signTxAllElementsPoolRegistration,
} from './__fixtures__/signTxAllElements'

describeSignTxPositiveTest(
  'signTxAllElementsPoolRegistration',
  signTxAllElementsPoolRegistration,
)

describeSignTxPositiveTest(
  'signTxAllElementsAuxiliaryData',
  signTxAllElementsAuxiliaryData,
)

describeSignTxPositiveTest(
  'signTxAllElementsCertificatesOrdinary',
  signTxAllElementsCertificatesOrdinary,
)

describeSignTxPositiveTest(
  'signTxAllElementsCertificatesMultisig',
  signTxAllElementsCertificatesMultisig,
)

describeSignTxPositiveTest(
  'signTxAllElementsNoCertificates',
  signTxAllElementsNoCertificates,
)
