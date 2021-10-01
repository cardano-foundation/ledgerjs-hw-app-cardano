import chai from "chai"
import chaiAsPromised from "chai-as-promised"

import { describePositiveTest,describeRejects } from "../test_utils"
import {
    poolRegistrationOperatorTestcases,
    poolRegistrationOwnerTestcases,
} from "./__fixtures__/signTxPoolRegistration"
import {
    invalidCertificates,
    invalidPoolMetadataTestcases,
    invalidRelayTestcases,
    poolRegistrationOwnerRejectTestcases,
    stakePoolRegistrationOwnerRejectTestcases,
    stakePoolRegistrationPoolIdRejectTestcases,
} from "./__fixtures__/signTxPoolRegistrationRejects"
chai.use(chaiAsPromised)

describePositiveTest("signTxPoolRegistrationOK_Owner", poolRegistrationOwnerTestcases)
describePositiveTest("signTxPoolRegistrationOK_Operator", poolRegistrationOperatorTestcases)

describeRejects("signTxPoolRegistrationRejects_Owner_General", poolRegistrationOwnerRejectTestcases)
describeRejects("signTxPoolRegistrationRejects_Owner_Certificates", invalidCertificates)
describeRejects("signTxPoolRegistrationRejects_Owner_Metadata", invalidPoolMetadataTestcases)
describeRejects("signTxPoolRegistrationRejects_Owner_Relay", invalidRelayTestcases)
describeRejects("signTxPoolRegistrationRejects_Owner_PoolId", stakePoolRegistrationPoolIdRejectTestcases)
describeRejects("signTxPoolRegistrationRejects_Owner_Security", stakePoolRegistrationOwnerRejectTestcases)
