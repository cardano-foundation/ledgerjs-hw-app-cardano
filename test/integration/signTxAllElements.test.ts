import {createRequire} from 'module'

const nodeRequire = createRequire(__filename)
const {describeSignTxPositiveTest} = nodeRequire('../test_utils.ts')
const {
  signTxAllElementsAuxiliaryData,
  signTxAllElementsCertificatesMultisig,
  signTxAllElementsCertificatesOrdinary,
  signTxAllElementsNoCertificates,
  signTxAllElementsPoolRegistration,
} = nodeRequire('./__fixtures__/signTxAllElements.ts')

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
