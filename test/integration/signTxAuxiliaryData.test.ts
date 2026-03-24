import {createRequire} from 'module'

const require = createRequire(import.meta.url)
const {describeSignTxPositiveTest} = require('../test_utils.ts')
const {testsAuxiliaryData} = require('./__fixtures__/signTxAuxiliaryData.ts')

describeSignTxPositiveTest('signTxAuxiliaryData', testsAuxiliaryData)
