import {createRequire} from 'module'

const nodeRequire = createRequire(__filename)
const {describeSignTxPositiveTest} = nodeRequire('../test_utils')
const {testsAuxiliaryData} = nodeRequire('./__fixtures__/signTxAuxiliaryData')

describeSignTxPositiveTest('signTxAuxiliaryData', testsAuxiliaryData)
