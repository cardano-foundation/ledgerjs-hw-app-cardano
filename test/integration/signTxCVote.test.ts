import {describeSignTxPositiveTest, describeSignTxRejects} from '../test_utils'
import {
  testsCatalystRegistration,
  testsCVoteRegistrationCIP36,
  testsCVoteRegistrationRejects,
} from './__fixtures__/signTxCVote'

describeSignTxPositiveTest('signTxCatalyst', testsCatalystRegistration)
describeSignTxPositiveTest(
  'signTxCVoteRegistrationCIP36',
  testsCVoteRegistrationCIP36,
)

describeSignTxRejects(
  'testsCVoteRegistrationRejects',
  testsCVoteRegistrationRejects,
)
