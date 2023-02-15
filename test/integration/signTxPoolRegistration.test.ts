import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

import {describeSignTxPositiveTest, describeSignTxRejects} from '../test_utils'
import {
  poolRegistrationOperatorTestCases,
  poolRegistrationOwnerTestCases,
} from './__fixtures__/signTxPoolRegistration'
import {
  invalidCertificates,
  invalidPoolMetadataTestCases,
  invalidRelayTestCases,
  outputRejectTestCases,
  poolRegistrationOwnerRejectTestCases,
  stakePoolRegistrationOwnerRejectTestCases,
  stakePoolRegistrationPoolIdRejectTestCases,
} from './__fixtures__/signTxPoolRegistrationRejects'
chai.use(chaiAsPromised)

describeSignTxPositiveTest(
  'signTxPoolRegistrationOK_Owner',
  poolRegistrationOwnerTestCases,
)
describeSignTxPositiveTest(
  'signTxPoolRegistrationOK_Operator',
  poolRegistrationOperatorTestCases,
)

describeSignTxRejects(
  'signTxPoolRegistrationRejects_Owner_General',
  poolRegistrationOwnerRejectTestCases,
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
  invalidPoolMetadataTestCases,
)
describeSignTxRejects(
  'signTxPoolRegistrationRejects_Owner_Relay',
  invalidRelayTestCases,
)
describeSignTxRejects(
  'signTxPoolRegistrationRejects_PoolId',
  stakePoolRegistrationPoolIdRejectTestCases,
)
describeSignTxRejects(
  'signTxPoolRegistrationRejects_Owner_Security',
  stakePoolRegistrationOwnerRejectTestCases,
)
