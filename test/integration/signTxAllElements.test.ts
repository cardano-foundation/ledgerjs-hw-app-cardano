import {createRequire} from 'module'

const nodeRequire = createRequire(__filename)
const {describeSignTxPositiveTest} = nodeRequire('../test_utils')
const {
  signTxAllElementsAuxiliaryData,
  signTxAllElementsCertificatesMultisig,
  signTxAllElementsCertificatesOrdinary,
  signTxAllElementsNoCertificates,
  signTxAllElementsPoolRegistration,
} = nodeRequire('./__fixtures__/signTxAllElements')

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
