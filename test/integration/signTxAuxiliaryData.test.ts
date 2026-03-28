import {createRequire} from 'module'

const nodeRequire = createRequire(__filename)
const {describeSignTxPositiveTest} = nodeRequire('../test_utils.ts')
const {testsAuxiliaryData} = nodeRequire(
  './__fixtures__/signTxAuxiliaryData.ts',
)

describeSignTxPositiveTest('signTxAuxiliaryData', testsAuxiliaryData)
