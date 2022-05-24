import { describePositiveTest,describeRejects  } from "../test_utils"
import {
    testsAllegra,
    testsAlonzoTrezorComparison,
    testsByron,
    testsCatalystRegistration,
    testsMary,
    testsMultisig,
    testsShelleyNoCertificates,
    testsShelleyWithCertificates,
} from "./__fixtures__/signTx"
import { testsAlonzo } from "./__fixtures__/signTxPlutus"
import {
    addressBytesRejectTestcases,
    addressParamsRejectTestcases,
    certificateRejectTestcases,
    certificateStakePoolRetirementRejectTestcases,
    certificateStakingRejectTestcases,
    singleAccountRejectTestcases,
    testsInvalidTokenBundleOrdering,
    transactionInitRejectTestcases,
    withdrawalRejectTestcases,
    witnessRejectTestcases,
} from "./__fixtures__/signTxRejects"

describePositiveTest("signTxByron", testsByron)
describePositiveTest("signTxShelleyNoCertificates", testsShelleyNoCertificates)
describePositiveTest("signTxShelleyWithCertificates", testsShelleyWithCertificates)
describePositiveTest("signTxMultisig", testsMultisig)
describePositiveTest("signTxAllegra", testsAllegra)
describePositiveTest("signTxMary", testsMary)
describePositiveTest("signTxCatalyst", testsCatalystRegistration)
describePositiveTest("signTxAlonzo", testsAlonzo)
describePositiveTest("signTxTrezorComparison", testsAlonzoTrezorComparison)

describeRejects("signTxInitPolicyRejects", transactionInitRejectTestcases)
describeRejects("signTxAddressBytesPolicyRejects", addressBytesRejectTestcases)
describeRejects("signTxAddressParamsPolicyRejects", addressParamsRejectTestcases)
describeRejects("signTxCertificatePolicyRejects", certificateRejectTestcases)
describeRejects("signTxCertificateStakingPolicyRejects", certificateStakingRejectTestcases)
describeRejects("signTxCertificateStakePoolRetirementPolicyRejects", certificateStakePoolRetirementRejectTestcases)
describeRejects("signTxWithdrawalRejects", withdrawalRejectTestcases)
describeRejects("signTxWitnessRejects", witnessRejectTestcases)
describeRejects("signTxInvalidMultiassetRejects", testsInvalidTokenBundleOrdering)
describeRejects("signTxSingleAccountRejects", singleAccountRejectTestcases)
