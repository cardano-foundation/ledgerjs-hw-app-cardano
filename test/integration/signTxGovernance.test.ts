import { describeSignTxPositiveTest,describeSignTxRejects  } from "../test_utils"
import { testsCatalystRegistration, testsGovernanceVotingRegistrationCIP36, testsGovernanceVotingRegistrationRejects } from "./__fixtures__/signTxGovernance"

describeSignTxPositiveTest("signTxCatalyst", testsCatalystRegistration)
describeSignTxPositiveTest("signTxGovernanceVotingRegistrationCIP36", testsGovernanceVotingRegistrationCIP36)

describeSignTxRejects("testsGovernanceVotingRegistrationRejects", testsGovernanceVotingRegistrationRejects)
