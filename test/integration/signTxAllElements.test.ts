import {createRequire} from 'module'

const require = createRequire(import.meta.url)
const {describeSignTxPositiveTest} = require('../test_utils.ts')
const {
  signTxAllElementsAuxiliaryData,
  signTxAllElementsCertificatesMultisig,
  signTxAllElementsCertificatesOrdinary,
  signTxAllElementsNoCertificates,
  signTxAllElementsPoolRegistration,
} = require('./__fixtures__/signTxAllElements.ts')

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
