import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

import {describeSignTxPositiveTest, describeSignTxRejects} from '../test_utils'
import {
  poolRegistrationOperatorTestcases,
  poolRegistrationOwnerTestcases,
} from './__fixtures__/signTxPoolRegistration'
import {
  invalidCertificates,
  invalidPoolMetadataTestcases,
  invalidRelayTestcases,
  outputRejectTestCases,
  poolRegistrationOwnerRejectTestcases,
  stakePoolRegistrationOwnerRejectTestcases,
  stakePoolRegistrationPoolIdRejectTestcases,
} from './__fixtures__/signTxPoolRegistrationRejects'
chai.use(chaiAsPromised)

describeSignTxPositiveTest(
  'signTxPoolRegistrationOK_Owner',
  poolRegistrationOwnerTestcases,
)
describeSignTxPositiveTest(
  'signTxPoolRegistrationOK_Operator',
  poolRegistrationOperatorTestcases,
)

describeSignTxRejects(
  'signTxPoolRegistrationRejects_Owner_General',
  poolRegistrationOwnerRejectTestcases,
)
describeSignTxRejects(
  'signTxPoolRegistrationRejects_Outputs',
  outputRejectTestCases,
)
describeSignTxRejects(
  'signTxPoolRegistrationRejects_Owner_Certificates',
  invalidCertificates,
)
describeSignTxRejects(
  'signTxPoolRegistrationRejects_Owner_Metadata',
  invalidPoolMetadataTestcases,
)
describeSignTxRejects(
  'signTxPoolRegistrationRejects_Owner_Relay',
  invalidRelayTestcases,
)
describeSignTxRejects(
  'signTxPoolRegistrationRejects_PoolId',
  stakePoolRegistrationPoolIdRejectTestcases,
)
describeSignTxRejects(
  'signTxPoolRegistrationRejects_Owner_Security',
  stakePoolRegistrationOwnerRejectTestcases,
)
