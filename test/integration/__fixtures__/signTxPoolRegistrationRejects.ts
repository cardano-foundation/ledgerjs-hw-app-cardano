import type { MultiHostRelayParams, PoolMetadataParams, SingleHostHostnameRelayParams, Transaction } from "../../../src/Ada"
import { CertificateType, DeviceStatusCodes, DeviceStatusError, DeviceStatusMessages, InvalidDataReason, Networks, RelayType } from "../../../src/Ada"
import { PoolKeyType, PoolOwnerType,TransactionSigningMode } from '../../../src/types/public'
import { str_to_path } from "../../../src/utils/address"
import { DontRunOnLedger } from '../../test_utils'
import { certificates, defaultPoolRegistration, inputs, outputs, poolOwnerVariationSet, relayVariationSet } from './signTxPoolRegistration'
import type { TestcaseRejectShelley } from "./signTxRejects"

const txBase: Transaction = {
    network: Networks.Mainnet,
    inputs: [inputs.utxoNoPath],
    outputs: [outputs.external],
    fee: 42,
    ttl: 10,
}

export const poolRegistrationOwnerRejectTestcases: TestcaseRejectShelley[] = [
    {
        testname: "Different index",
        tx: {
            ...txBase,
            certificates: [certificates.poolRegistrationMixedOwnersAllRelays],
        },
        signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
        additionalWitnessPaths: [str_to_path("1852'/1815'/0'/2/0"), str_to_path("1852'/1815'/0'/2/1")],
        errCls: DeviceStatusError,
        errMsg: DeviceStatusMessages[DeviceStatusCodes.ERR_REJECTED_BY_POLICY],
        rejectReason: InvalidDataReason.LEDGER_POLICY,
    },
    {
        testname: "Different prefix",
        tx: {
            ...txBase,
            certificates: [certificates.poolRegistrationMixedOwnersAllRelays],
        },
        signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
        additionalWitnessPaths: [str_to_path("1852'/1815'/0'/2/0"), str_to_path("1854'/1815'/0'/2/0")],
        errCls: DeviceStatusError,
        errMsg: DeviceStatusMessages[DeviceStatusCodes.ERR_REJECTED_BY_POLICY],
        rejectReason: InvalidDataReason.LEDGER_POLICY,
    },
    {
        testname: "No path given",
        tx: {
            ...txBase,
            certificates: [
                {
                    type: CertificateType.STAKE_POOL_REGISTRATION,
                    params: {
                        ...defaultPoolRegistration,
                        poolOwners: poolOwnerVariationSet.singleHashOwner,
                        relays: relayVariationSet.allRelays,
                    },
                },
            ],
        },
        signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
        additionalWitnessPaths: [str_to_path("1852'/1815'/0'/2/0"), str_to_path("1854'/1815'/0'/2/0")],
        errCls: DeviceStatusError,
        errMsg: DeviceStatusMessages[DeviceStatusCodes.ERR_REJECTED_BY_POLICY],
        rejectReason: InvalidDataReason.SIGN_MODE_POOL_OWNER__SINGLE_DEVICE_OWNER_REQUIRED,
    },
    {
        testname: "Invalid numerator-denominator relationship",
        tx: {
            ...txBase,
            certificates: [certificates.poolRegistrationWrongMargin],
        },
        signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
        additionalWitnessPaths: [str_to_path("1852'/1815'/0'/2/0"), str_to_path("1854'/1815'/0'/2/0")],
        errCls: DeviceStatusError,
        errMsg: DontRunOnLedger,    // it would be finnicky bypassing this check in the js code
        rejectReason: InvalidDataReason.POOL_REGISTRATION_INVALID_MARGIN,
    },
]

export const invalidCertificates: TestcaseRejectShelley[] = [
    {
        testname: "pool registration with multiple path owners",
        tx: {
            ...txBase,
            certificates: [
                {
                    type: CertificateType.STAKE_POOL_REGISTRATION,
                    params: {
                        ...defaultPoolRegistration,
                        poolOwners: poolOwnerVariationSet.twoPathOwners,
                    },
                },
            ],
        },
        signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
        additionalWitnessPaths: [],
        errCls: DeviceStatusError,
        errMsg: DeviceStatusMessages[DeviceStatusCodes.ERR_INVALID_DATA],
        rejectReason: InvalidDataReason.SIGN_MODE_POOL_OWNER__SINGLE_DEVICE_OWNER_REQUIRED,
    },
    {
        testname: "pool registration with no owners",
        tx: {
            ...txBase,
            certificates: [
                {
                    type: CertificateType.STAKE_POOL_REGISTRATION,
                    params: {
                        ...defaultPoolRegistration,
                        poolOwners: poolOwnerVariationSet.noOwners,
                    },
                },
            ],
        },
        signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
        additionalWitnessPaths: [],
        errCls: DeviceStatusError,
        errMsg: DeviceStatusMessages[DeviceStatusCodes.ERR_REJECTED_BY_POLICY],
        rejectReason: InvalidDataReason.SIGN_MODE_POOL_OWNER__SINGLE_DEVICE_OWNER_REQUIRED,
    },
]

export const invalidPoolMetadataTestcases: TestcaseRejectShelley[] = [
    // Invalid url
    {
        testname: "pool metadata url too long",
        tx: {
            ...txBase,
            certificates: [
                {
                    type: CertificateType.STAKE_POOL_REGISTRATION,
                    params: {
                        ...defaultPoolRegistration,
                        metadata: {
                            metadataUrl: "https://www.vacuumlabs.com/aaaaaaaaaaaaaaaaaaaaaaaasampleUrl.json",
                            metadataHashHex: "cdb714fd722c24aeb10c93dbb0ff03bd4783441cd5ba2a8b6f373390520535bb",
                        },
                    },
                },
            ],
        },
        signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
        errCls: DeviceStatusError,
        errMsg: DontRunOnLedger,
        rejectReason: InvalidDataReason.POOL_REGISTRATION_METADATA_INVALID_URL,
    },
    {
        testname: "pool metadata invalid url",
        tx: {
            ...txBase,
            certificates: [
                {
                    type: CertificateType.STAKE_POOL_REGISTRATION,
                    params: {
                        ...defaultPoolRegistration,
                        metadata: {
                            metadataUrl: "\n",
                            metadataHashHex: "6bf124f217d0e5a0a8adb1dbd8540e1334280d49ab861127868339f43b3948",
                        },
                    },
                },
            ],
        },
        signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
        errCls: DeviceStatusError,
        errMsg: DontRunOnLedger,
        rejectReason: InvalidDataReason.POOL_REGISTRATION_METADATA_INVALID_URL,
    },
    {
        testname: "pool metadata missing url",
        tx: {
            ...txBase,
            certificates: [
                {
                    type: CertificateType.STAKE_POOL_REGISTRATION,
                    params: {
                        ...defaultPoolRegistration,
                        metadata: {
                            metadataHashHex: "cdb714fd722c24aeb10c93dbb0ff03bd4783441cd5ba2a8b6f373390520535bb",
                        } as PoolMetadataParams,
                    },
                },
            ],
        },
        signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
        errCls: DeviceStatusError,
        errMsg: DontRunOnLedger,
        rejectReason: InvalidDataReason.POOL_REGISTRATION_METADATA_INVALID_URL,
    },
    // Invalid hash
    {
        testname: "pool metadata invalid hash length",
        tx: {
            ...txBase,
            certificates: [
                {
                    type: CertificateType.STAKE_POOL_REGISTRATION,
                    params: {
                        ...defaultPoolRegistration,
                        metadata: {
                            metadataUrl: "https://www.vacuumlabs.com/sampleUrl.json",
                            metadataHashHex: "6bf124f217d0e5a0a8adb1dbd8540e1334280d49ab861127868339f43b3948",
                        },
                    },
                },
            ],
        },
        signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
        errCls: DeviceStatusError,
        errMsg: DontRunOnLedger,
        rejectReason: InvalidDataReason.POOL_REGISTRATION_METADATA_INVALID_HASH,
    },
    {
        testname: "pool metadata missing hash",
        tx: {
            ...txBase,
            certificates: [
                {
                    type: CertificateType.STAKE_POOL_REGISTRATION,
                    params: {
                        ...defaultPoolRegistration,
                        metadata: {
                            metadataUrl: "https://www.vacuumlabs.com/sampleUrl.json",
                        } as PoolMetadataParams,
                    },
                },
            ],
        },
        signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
        errCls: DeviceStatusError,
        errMsg: DontRunOnLedger,
        rejectReason: InvalidDataReason.POOL_REGISTRATION_METADATA_INVALID_HASH,
    },
]

export const invalidRelayTestcases: TestcaseRejectShelley[] = [
    {
        testname: "SingleHostHostname missing dns",
        tx: {
            ...txBase,
            certificates: [
                {
                    type: CertificateType.STAKE_POOL_REGISTRATION,
                    params: {
                        ...defaultPoolRegistration,
                        relays: [
                            {
                                type: RelayType.SINGLE_HOST_HOSTNAME,
                                params: {
                                    portNumber: 3000,
                                    dnsName: null,
                                } as any as SingleHostHostnameRelayParams,
                            },
                        ],
                    },
                },
            ],
        },
        signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
        errCls: DeviceStatusError,
        errMsg: DontRunOnLedger,
        rejectReason: InvalidDataReason.RELAY_INVALID_DNS,
    },
    {
        testname: "MultiHost missing dns",
        tx: {
            ...txBase,
            certificates: [
                {
                    type: CertificateType.STAKE_POOL_REGISTRATION,
                    params: {
                        ...defaultPoolRegistration,
                        relays: [
                            {
                                type: RelayType.MULTI_HOST,
                                params: {
                                    dnsName: null,
                                } as any as MultiHostRelayParams,
                            },
                        ],
                    },
                },
            ],
        },
        signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
        errCls: DeviceStatusError,
        errMsg: DontRunOnLedger,
        rejectReason: InvalidDataReason.RELAY_INVALID_DNS,
    },
]

export const stakePoolRegistrationPoolIdRejectTestcases: TestcaseRejectShelley[] = [
    {
        testname: "Path sent in for Pool Registration Owner Tx",
        tx: {
            ...txBase,
            inputs: [inputs.utxoNoPath],
            certificates: [
                {
                    type: CertificateType.STAKE_POOL_REGISTRATION,
                    params: {
                        ...defaultPoolRegistration,
                        poolKey: {
                            type: PoolKeyType.DEVICE_OWNED,
                            params: {
                                path: str_to_path("1852'/1815'/0'/0/0"),
                            },
                        },
                    },
                },
            ],
        },
        signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
        errCls: DeviceStatusError,
        errMsg: DeviceStatusMessages[DeviceStatusCodes.ERR_REJECTED_BY_POLICY],
        rejectReason: InvalidDataReason.SIGN_MODE_POOL_OWNER__THIRD_PARTY_POOL_KEY_REQUIRED,
    },
    {
        testname: "Hash sent in for Pool Registration Operator Tx",
        tx: {
            ...txBase,
            certificates: [
                {
                    type: CertificateType.STAKE_POOL_REGISTRATION,
                    params: {
                        ...defaultPoolRegistration,
                        poolKey: {
                            type: PoolKeyType.THIRD_PARTY,
                            params: {
                                keyHashHex: "01234567890123456789012345678901234567890123456789012345",
                            },
                        },
                    },
                },
            ],
        },
        signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OPERATOR,
        errCls: DeviceStatusError,
        errMsg: DeviceStatusMessages[DeviceStatusCodes.ERR_REJECTED_BY_POLICY],
        rejectReason: InvalidDataReason.SIGN_MODE_POOL_OPERATOR__DEVICE_OWNED_POOL_KEY_REQUIRED,
    },
]

export const stakePoolRegistrationOwnerRejectTestcases: TestcaseRejectShelley[] = [
    {
        testname: "Non-staking path for Pool Registration Owner Tx",
        tx: {
            ...txBase,
            inputs: [inputs.utxoNoPath],
            certificates: [
                {
                    type: CertificateType.STAKE_POOL_REGISTRATION,
                    params: {
                        ...defaultPoolRegistration,
                        poolOwners: [
                            {
                                type: PoolOwnerType.DEVICE_OWNED,
                                params: {
                                    stakingPath: str_to_path("1852'/1815'/0'/0/0"),
                                },
                            },
                        ],
                    },
                },
            ],
        },
        signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
        errCls: DeviceStatusError,
        errMsg: DeviceStatusMessages[DeviceStatusCodes.ERR_REJECTED_BY_POLICY],
        rejectReason: InvalidDataReason.LEDGER_POLICY,
    },
]

