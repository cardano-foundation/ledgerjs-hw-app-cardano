import type { Certificate, PoolKey, PoolOwner, PoolRegistrationParams, PoolRewardAccount, Relay, Transaction, TxInput, TxOutput } from "../../../src/Ada"
import { StakeCredentialParamsType } from "../../../src/Ada"
import { PoolKeyType, PoolRewardAccountType } from "../../../src/Ada"
import { CertificateType, Networks, PoolOwnerType, RelayType, TxOutputDestinationType, utils } from "../../../src/Ada"
import { TransactionSigningMode } from '../../../src/types/public'
import { str_to_path } from "../../../src/utils/address"
import type { SignTxTestcase } from "./signTx"

export const inputs: Record<
  | 'utxoNoPath'
  | 'utxoWithPath0'
  | 'utxoWithPath1'
  , TxInput
> = {
    utxoNoPath: {
        txHashHex:
      "3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7",
        outputIndex: 0,
        path: null,
    },
    utxoWithPath0: {
        txHashHex: "3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7",
        outputIndex: 0,
        path: str_to_path("1852'/1815'/0'/0/0"),
    },
    utxoWithPath1: {
        txHashHex: "3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7",
        outputIndex: 0,
        path: str_to_path("1852'/1815'/0'/0/1"),
    },
}

export const outputs: Record<'external', TxOutput> = {
    external: {
        amount: "1",
        destination: {
            type: TxOutputDestinationType.THIRD_PARTY,
            params: {
                addressHex: utils.buf_to_hex(
                    utils.bech32_decodeAddress(
                        "addr1q97tqh7wzy8mnx0sr2a57c4ug40zzl222877jz06nt49g4zr43fuq3k0dfpqjh3uvqcsl2qzwuwsvuhclck3scgn3vys6wkj5d"
                    )
                ),
            },
        },
    },
}


const txBase: Transaction = {
    network: Networks.Mainnet,
    inputs: [inputs.utxoNoPath],
    outputs: [outputs.external],
    fee: 42,
    ttl: 10,
}

const poolKeys: Record<
  | 'poolKeyPath'
  | 'poolKeyHash'
  , PoolKey
> = {
    poolKeyPath: {
        type: PoolKeyType.DEVICE_OWNED,
        params: {
            path: str_to_path("1853'/1815'/0'/0'"),
        },
    },
    poolKeyHash: {
        type: PoolKeyType.THIRD_PARTY,
        params: {
            keyHashHex: "13381d918ec0283ceeff60f7f4fc21e1540e053ccf8a77307a7a32ad",
        },
    },
}

const stakingHashOwners: Record<
  | 'owner0'
  | 'owner1'
  , PoolOwner
> = {
    owner0: {
        type: PoolOwnerType.THIRD_PARTY,
        params: {
            stakingKeyHashHex:
        "794d9b3408c9fb67b950a48a0690f070f117e9978f7fc1d120fc58ad",
        },
    },
    owner1: {
        type: PoolOwnerType.THIRD_PARTY,
        params: {
            stakingKeyHashHex:
        "0bd5d796f5e54866a14300ec2a18d706f7461b8f0502cc2a182bc88d",
        },
    },
}

const stakingPathOwners: Record<
  | 'owner0'
  | 'owner1'
  , PoolOwner
> = {
    owner0: {
        type: PoolOwnerType.DEVICE_OWNED,
        params: {
            stakingPath: str_to_path("1852'/1815'/0'/2/0"), // hash: 1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c
        },
    },
    owner1: {
        type: PoolOwnerType.DEVICE_OWNED,
        params: {
            stakingPath: str_to_path("1852'/1815'/0'/2/1"),
        },
    },
}

// No need for explicit type
export const poolOwnerVariationSet = {
    noOwners: [] as PoolOwner[],
    singleHashOwner: [stakingHashOwners.owner0],
    singlePathOwner: [stakingPathOwners.owner0],
    twoHashOwners: [stakingHashOwners.owner0, stakingHashOwners.owner1],
    twoPathOwners: [stakingPathOwners.owner0, stakingPathOwners.owner1],
    twoCombinedOwners: [stakingPathOwners.owner0, stakingHashOwners.owner0],
}

const poolRewardAccounts: Record<
  | 'poolRewardAccountPath'
  | 'poolRewardAccountHash'
  , PoolRewardAccount
> = {
    poolRewardAccountPath: {
        type: PoolRewardAccountType.DEVICE_OWNED,
        params: {
            path: str_to_path("1852'/1815'/3'/2/0"),
        },
    },
    poolRewardAccountHash: {
        type: PoolRewardAccountType.THIRD_PARTY,
        params: {
            rewardAccountHex: "e1794d9b3408c9fb67b950a48a0690f070f117e9978f7fc1d120fc58ad",
        },
    },
}

const relays: Record<
  | 'singleHostIPV4Relay0'
  | 'singleHostIPV4Relay1'
  | 'singleHostIPV6Relay'
  | 'singleHostNameRelay'
  | 'multiHostNameRelay'
  , Relay
> = {
    singleHostIPV4Relay0: {
        type: RelayType.SINGLE_HOST_IP_ADDR,
        params: {
            portNumber: 3000,
            ipv4: "54.228.75.154", // "36e44b9a"
            ipv6: null,
        },
    },
    singleHostIPV4Relay1: {
        type: RelayType.SINGLE_HOST_IP_ADDR,
        params: {
            portNumber: 4000,
            ipv4: "54.228.75.154", // "36e44b9a"
            ipv6: null,
        },
    },
    singleHostIPV6Relay: {
        type: RelayType.SINGLE_HOST_IP_ADDR,
        params: {
            portNumber: 3000,
            ipv4: "54.228.75.155", // "36e44b9b"
            ipv6: "24ff:7801:33a2:e383:a5c4:340a:07c2:76e5",
        },
    },
    singleHostNameRelay: {
        type: RelayType.SINGLE_HOST_HOSTNAME,
        params: {
            portNumber: 3000,
            dnsName: "aaaa.bbbb.com",
        },
    },
    multiHostNameRelay: {
        type: RelayType.MULTI_HOST,
        params: {
            dnsName: "aaaa.bbbc.com",
        },
    },
}

// No need for explicit type
export const relayVariationSet = {
    noRelays: [] as Relay[],
    singleHostIPV4Relay: [relays.singleHostIPV4Relay0],
    singleHostIPV6Relay: [relays.singleHostIPV6Relay],
    singleHostNameRelay: [relays.singleHostNameRelay],
    multiHostNameRelay: [relays.multiHostNameRelay], // reportedly not implemented
    twoIPV4Relays: [relays.singleHostIPV4Relay0, relays.singleHostIPV4Relay1],
    combinedIPV4SingleHostNameRelays: [
        relays.singleHostIPV4Relay0,
        relays.singleHostNameRelay,
    ],
    combinedIPV4IPV6Relays: [
        relays.singleHostIPV4Relay1,
        relays.singleHostIPV6Relay,
    ],
    allRelays: [
        relays.singleHostIPV4Relay0,
        relays.singleHostIPV6Relay,
        relays.singleHostNameRelay,
        relays.multiHostNameRelay,
    ],
}

export const defaultPoolRegistration: PoolRegistrationParams = {
    poolKey: poolKeys.poolKeyHash,
    vrfKeyHashHex:
    "07821cd344d7fd7e3ae5f2ed863218cb979ff1d59e50c4276bdc479b0d084450",
    pledge: "50000000000",
    cost: "340000000",
    margin: {
        numerator: 3,
        denominator: 100,
    },
    rewardAccount: poolRewardAccounts.poolRewardAccountHash,
    poolOwners: poolOwnerVariationSet.singlePathOwner,
    relays: relayVariationSet.singleHostIPV4Relay,
    metadata: {
        metadataUrl: "https://www.vacuumlabs.com/sampleUrl.json",
        metadataHashHex:
      "cdb714fd722c24aeb10c93dbb0ff03bd4783441cd5ba2a8b6f373390520535bb",
    },
}

export const certificates: Record<
  | 'stakeDelegation'
  | 'stakeRegistration'
  | 'poolRegistrationDefault'
  | 'poolRegistrationMixedOwners'
  | 'poolRegistrationMixedOwnersAllRelays'
  | 'poolRegistrationMixedOwnersIpv4SingleHostRelays'
  | 'poolRegistrationMixedOwnersIpv4Ipv6Relays'
  | 'poolRegistrationNoRelays'
  | 'poolRegistrationNoMetadata'
  | 'poolRegistrationWrongMargin'
  | 'poolRegistrationOperatorNoOwnersNoRelays'
  | 'poolRegistrationOperatorMultipleOwnersAllRelays'
  | 'poolRegistrationOperatorOneOwnerOperatorNoRelays'
  , Certificate
> = {
    // for negative tests
    stakeDelegation: {
        type: CertificateType.STAKE_DELEGATION,
        params: {
            stakeCredential: {
                type: StakeCredentialParamsType.KEY_PATH,
                keyPath: str_to_path("1852'/1815'/0'/2/0"),
            },
            poolKeyHashHex: "f61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb4973",
        },
    },
    stakeRegistration: {
        type: 0,
        params: {
            stakeCredential: {
                type: StakeCredentialParamsType.KEY_PATH,
                keyPath: str_to_path("1852'/1815'/0'/2/0"),
            },
        },
    },
    poolRegistrationDefault: {
        type: CertificateType.STAKE_POOL_REGISTRATION,
        params: defaultPoolRegistration,
    },
    poolRegistrationMixedOwners: {
        type: CertificateType.STAKE_POOL_REGISTRATION,
        params: {
            ...defaultPoolRegistration,
            poolOwners: poolOwnerVariationSet.twoCombinedOwners,
        },
    },
    poolRegistrationMixedOwnersAllRelays: {
        type: CertificateType.STAKE_POOL_REGISTRATION,
        params: {
            ...defaultPoolRegistration,
            poolOwners: poolOwnerVariationSet.twoCombinedOwners,
            relays: relayVariationSet.allRelays,
        },
    },
    poolRegistrationMixedOwnersIpv4SingleHostRelays: {
        type: CertificateType.STAKE_POOL_REGISTRATION,
        params: {
            ...defaultPoolRegistration,
            poolOwners: poolOwnerVariationSet.twoCombinedOwners,
            relays: relayVariationSet.combinedIPV4SingleHostNameRelays,
        },
    },
    poolRegistrationMixedOwnersIpv4Ipv6Relays: {
        type: CertificateType.STAKE_POOL_REGISTRATION,
        params: {
            ...defaultPoolRegistration,
            poolOwners: poolOwnerVariationSet.twoCombinedOwners,
            relays: relayVariationSet.combinedIPV4IPV6Relays,
        },
    },
    poolRegistrationNoRelays: {
        type: CertificateType.STAKE_POOL_REGISTRATION,
        params: {
            ...defaultPoolRegistration,
            relays: relayVariationSet.noRelays,
        },
    },
    poolRegistrationNoMetadata: {
        type: CertificateType.STAKE_POOL_REGISTRATION,
        params: {
            ...defaultPoolRegistration,
            metadata: null,
        },
    },
    poolRegistrationWrongMargin: {
        type: CertificateType.STAKE_POOL_REGISTRATION,
        params: {
            ...defaultPoolRegistration,
            margin: {
                numerator: "3",
                denominator: "1",
            },
        },
    },
    poolRegistrationOperatorNoOwnersNoRelays: {
        type: CertificateType.STAKE_POOL_REGISTRATION,
        params: {
            ...defaultPoolRegistration,
            poolKey: poolKeys.poolKeyPath,
            poolOwners: poolOwnerVariationSet.noOwners,
            relays: relayVariationSet.noRelays,
        },
    },
    poolRegistrationOperatorOneOwnerOperatorNoRelays: {
        type: CertificateType.STAKE_POOL_REGISTRATION,
        params: {
            ...defaultPoolRegistration,
            poolKey: poolKeys.poolKeyPath,
            rewardAccount: poolRewardAccounts.poolRewardAccountPath,
            poolOwners: poolOwnerVariationSet.singleHashOwner,
            relays: relayVariationSet.noRelays,
        },
    },
    poolRegistrationOperatorMultipleOwnersAllRelays: {
        type: CertificateType.STAKE_POOL_REGISTRATION,
        params: {
            ...defaultPoolRegistration,
            poolKey: poolKeys.poolKeyPath,
            poolOwners: poolOwnerVariationSet.twoHashOwners,
            relays: relayVariationSet.allRelays,
        },
    },
}

export const poolRegistrationOwnerTestcases: SignTxTestcase[] = [
    {
        testname: "Witness valid multiple mixed owners all relays pool registration",
        tx: {
            ...txBase,
            certificates: [certificates.poolRegistrationMixedOwnersAllRelays],
        },
        signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
        additionalWitnessPaths: [],
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181825839017cb05fce110fb999f01abb4f62bc455e217d4a51fde909fa9aea545443ac53c046cf6a42095e3c60310fa802771d0672f8fe2d1861138b090102182a030a04818a03581c13381d918ec0283ceeff60f7f4fc21e1540e053ccf8a77307a7a32ad582007821cd344d7fd7e3ae5f2ed863218cb979ff1d59e50c4276bdc479b0d0844501b0000000ba43b74001a1443fd00d81e82031864581de1794d9b3408c9fb67b950a48a0690f070f117e9978f7fc1d120fc58ad82581c1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c581c794d9b3408c9fb67b950a48a0690f070f117e9978f7fc1d120fc58ad848400190bb84436e44b9af68400190bb84436e44b9b500178ff2483e3a2330a34c4a5e576c2078301190bb86d616161612e626262622e636f6d82026d616161612e626262632e636f6d82782968747470733a2f2f7777772e76616375756d6c6162732e636f6d2f73616d706c6555726c2e6a736f6e5820cdb714fd722c24aeb10c93dbb0ff03bd4783441cd5ba2a8b6f373390520535bb",
        expectedResult: {
            txHashHex: "bc678441767b195382f00f9f4c4bddc046f73e6116fa789035105ecddfdee949",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/2/0"),
                    witnessSignatureHex:
            "61fc06451462426b14fa3a31008a5f7d32b2f1793022060c02939bd0004b07f2bd737d542c2db6cef6dad912b9bdca1829a5dc2b45bab3c72afe374cef59cc04",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Witness valid single path owner ipv4 relay pool registration",
        tx: {
            ...txBase,
            certificates: [certificates.poolRegistrationDefault],
        },
        signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
        additionalWitnessPaths: [],
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181825839017cb05fce110fb999f01abb4f62bc455e217d4a51fde909fa9aea545443ac53c046cf6a42095e3c60310fa802771d0672f8fe2d1861138b090102182a030a04818a03581c13381d918ec0283ceeff60f7f4fc21e1540e053ccf8a77307a7a32ad582007821cd344d7fd7e3ae5f2ed863218cb979ff1d59e50c4276bdc479b0d0844501b0000000ba43b74001a1443fd00d81e82031864581de1794d9b3408c9fb67b950a48a0690f070f117e9978f7fc1d120fc58ad81581c1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c818400190bb84436e44b9af682782968747470733a2f2f7777772e76616375756d6c6162732e636f6d2f73616d706c6555726c2e6a736f6e5820cdb714fd722c24aeb10c93dbb0ff03bd4783441cd5ba2a8b6f373390520535bb",
        expectedResult: {
            txHashHex: "4ea6c33b8f9714996080700d0e8480b2ab1136641ea8c3b08572be189c9825ab",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/2/0"),
                    witnessSignatureHex:
            "f03947901bcfc96ac8e359825091db88900a470947c60220fcd3892683ec7fe949ef4e28a446d78a883f034cd77cbca669529a9da3f2316b762eb97033797a07",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Witness valid multiple mixed owners ipv4 relay pool registration",
        tx: {
            ...txBase,
            certificates: [certificates.poolRegistrationMixedOwners],
        },
        signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
        additionalWitnessPaths: [],
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181825839017cb05fce110fb999f01abb4f62bc455e217d4a51fde909fa9aea545443ac53c046cf6a42095e3c60310fa802771d0672f8fe2d1861138b090102182a030a04818a03581c13381d918ec0283ceeff60f7f4fc21e1540e053ccf8a77307a7a32ad582007821cd344d7fd7e3ae5f2ed863218cb979ff1d59e50c4276bdc479b0d0844501b0000000ba43b74001a1443fd00d81e82031864581de1794d9b3408c9fb67b950a48a0690f070f117e9978f7fc1d120fc58ad82581c1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c581c794d9b3408c9fb67b950a48a0690f070f117e9978f7fc1d120fc58ad818400190bb84436e44b9af682782968747470733a2f2f7777772e76616375756d6c6162732e636f6d2f73616d706c6555726c2e6a736f6e5820cdb714fd722c24aeb10c93dbb0ff03bd4783441cd5ba2a8b6f373390520535bb",
        expectedResult: {
            txHashHex: "322872680d2f13e2d50c806572b28a95e12bbea2e8e27db44e369e5d304929df",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/2/0"),
                    witnessSignatureHex:
            "c1b454f3cf868007d2850084ff404bc4b91d9b541a78af9014288504143bd6b4f12df2163b7efb1817636eb625a62967fb66281ecae4d1b461770deafb65ba0f",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Witness valid multiple mixed owners mixed ipv4, single host relays pool registration",
        tx: {
            ...txBase,
            certificates: [certificates.poolRegistrationMixedOwnersIpv4SingleHostRelays],
        },
        signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
        additionalWitnessPaths: [],
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181825839017cb05fce110fb999f01abb4f62bc455e217d4a51fde909fa9aea545443ac53c046cf6a42095e3c60310fa802771d0672f8fe2d1861138b090102182a030a04818a03581c13381d918ec0283ceeff60f7f4fc21e1540e053ccf8a77307a7a32ad582007821cd344d7fd7e3ae5f2ed863218cb979ff1d59e50c4276bdc479b0d0844501b0000000ba43b74001a1443fd00d81e82031864581de1794d9b3408c9fb67b950a48a0690f070f117e9978f7fc1d120fc58ad82581c1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c581c794d9b3408c9fb67b950a48a0690f070f117e9978f7fc1d120fc58ad828400190bb84436e44b9af68301190bb86d616161612e626262622e636f6d82782968747470733a2f2f7777772e76616375756d6c6162732e636f6d2f73616d706c6555726c2e6a736f6e5820cdb714fd722c24aeb10c93dbb0ff03bd4783441cd5ba2a8b6f373390520535bb",
        expectedResult: {
            txHashHex: "a41a6e4e00ad04824455773302f95a179c03f583f969862a479d4805b53a708f",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/2/0"),
                    witnessSignatureHex:
            "8bb8c10b390ac92f617ba6895e3b138f43dc741e3589a9548166d1eda995becf4a229e9e95f6300336f7e92345b244c5dc78cfe0cc12cac6ff6fbb5731671c0e",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Witness valid multiple mixed owners mixed ipv4 ipv6 relays pool registration",
        tx: {
            ...txBase,
            certificates: [certificates.poolRegistrationMixedOwnersIpv4Ipv6Relays],
        },
        signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
        additionalWitnessPaths: [],
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181825839017cb05fce110fb999f01abb4f62bc455e217d4a51fde909fa9aea545443ac53c046cf6a42095e3c60310fa802771d0672f8fe2d1861138b090102182a030a04818a03581c13381d918ec0283ceeff60f7f4fc21e1540e053ccf8a77307a7a32ad582007821cd344d7fd7e3ae5f2ed863218cb979ff1d59e50c4276bdc479b0d0844501b0000000ba43b74001a1443fd00d81e82031864581de1794d9b3408c9fb67b950a48a0690f070f117e9978f7fc1d120fc58ad82581c1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c581c794d9b3408c9fb67b950a48a0690f070f117e9978f7fc1d120fc58ad828400190fa04436e44b9af68400190bb84436e44b9b500178ff2483e3a2330a34c4a5e576c20782782968747470733a2f2f7777772e76616375756d6c6162732e636f6d2f73616d706c6555726c2e6a736f6e5820cdb714fd722c24aeb10c93dbb0ff03bd4783441cd5ba2a8b6f373390520535bb",
        expectedResult: {
            txHashHex: "ab64050759a4221d4a8568badf06c444b42dae05fb2d22b0dff5749a49e5d332",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/2/0"),
                    witnessSignatureHex:
            "b0e6796ca5f97a0776c798e602afd0f6541996d431a3cbec8e3fe77eb49416cd812dcf6084672e40c9ae2b8cc8a5513d1b1a6c3ad408864d4a771e315c50d808",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Witness valid single path owner no relays pool registration",
        tx: {
            ...txBase,
            certificates: [certificates.poolRegistrationNoRelays],
        },
        signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
        additionalWitnessPaths: [],
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181825839017cb05fce110fb999f01abb4f62bc455e217d4a51fde909fa9aea545443ac53c046cf6a42095e3c60310fa802771d0672f8fe2d1861138b090102182a030a04818a03581c13381d918ec0283ceeff60f7f4fc21e1540e053ccf8a77307a7a32ad582007821cd344d7fd7e3ae5f2ed863218cb979ff1d59e50c4276bdc479b0d0844501b0000000ba43b74001a1443fd00d81e82031864581de1794d9b3408c9fb67b950a48a0690f070f117e9978f7fc1d120fc58ad81581c1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c8082782968747470733a2f2f7777772e76616375756d6c6162732e636f6d2f73616d706c6555726c2e6a736f6e5820cdb714fd722c24aeb10c93dbb0ff03bd4783441cd5ba2a8b6f373390520535bb",
        expectedResult: {
            txHashHex: "fc4778c13fadb8b69249b4cd98ef45f42145e1ce081c5466170a670829dc2184",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/2/0"),
                    witnessSignatureHex:
            "adc06e34dc66f01b16496b04fc4ce5058e3be7290398cf2728f8463dda15c87866314449bdb309d0cdc22f3ca9bee310458f2769df6a1486f1b470a3227a030b",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        // works as a private pool not visible in yoroi, daedalus, etc.
        testname: "Witness pool registration with no metadata",
        tx: {
            ...txBase,
            certificates: [certificates.poolRegistrationNoMetadata],
        },
        signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
        additionalWitnessPaths: [],
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181825839017cb05fce110fb999f01abb4f62bc455e217d4a51fde909fa9aea545443ac53c046cf6a42095e3c60310fa802771d0672f8fe2d1861138b090102182a030a04818a03581c13381d918ec0283ceeff60f7f4fc21e1540e053ccf8a77307a7a32ad582007821cd344d7fd7e3ae5f2ed863218cb979ff1d59e50c4276bdc479b0d0844501b0000000ba43b74001a1443fd00d81e82031864581de1794d9b3408c9fb67b950a48a0690f070f117e9978f7fc1d120fc58ad81581c1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c818400190bb84436e44b9af6f6",
        expectedResult: {
            txHashHex: "a97b2258962537e0ad3cbcb1fbf9d454f55bc9b7feb2bea0da23f82c1e956f67",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/2/0"),
                    witnessSignatureHex:
            "06e66f6a2d510a8a5446597c59c79cbf4f9e7af9073da0651ea59bbdc2340dc933ed292aa282e6ea7068bed9f6bcb44228573e661c211e6dc61f4dd73ff41f04",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Witness pool registration without outputs",
        tx: {
            ...txBase,
            outputs: [],
            certificates: [certificates.poolRegistrationMixedOwnersAllRelays],
        },
        signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
        additionalWitnessPaths: [],
        txBody: "a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018002182a030a04818a03581c13381d918ec0283ceeff60f7f4fc21e1540e053ccf8a77307a7a32ad582007821cd344d7fd7e3ae5f2ed863218cb979ff1d59e50c4276bdc479b0d0844501b0000000ba43b74001a1443fd00d81e82031864581de1794d9b3408c9fb67b950a48a0690f070f117e9978f7fc1d120fc58ad82581c1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c581c794d9b3408c9fb67b950a48a0690f070f117e9978f7fc1d120fc58ad848400190bb84436e44b9af68400190bb84436e44b9b500178ff2483e3a2330a34c4a5e576c2078301190bb86d616161612e626262622e636f6d82026d616161612e626262632e636f6d82782968747470733a2f2f7777772e76616375756d6c6162732e636f6d2f73616d706c6555726c2e6a736f6e5820cdb714fd722c24aeb10c93dbb0ff03bd4783441cd5ba2a8b6f373390520535bb",
        expectedResult: {
            txHashHex: "600114fd1c50a7e857fdcaaea73d94f7435c9fce63cfde597f7c48b8dda3b0ba",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/2/0"),
                    witnessSignatureHex:
            "91c09ad95d5d0f87f61a62e2f5e2dda4245eb4011887a04a53bdf085282002ccc712718e855e36a30cfcf7ecd43bcdc795aa87647be9c716b65e7fcf376e0503",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
]

export const poolRegistrationOperatorTestcases: SignTxTestcase[] = [
    {
        testname: "Witness pool registration as operator with no owners and no relays",
        tx: {
            ...txBase,
            inputs: [inputs.utxoWithPath0],
            certificates: [certificates.poolRegistrationOperatorNoOwnersNoRelays],
        },
        signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OPERATOR,
        additionalWitnessPaths: [],
        expectedResult: {
            txHashHex: "75a57a27893443eb7bb6e4746b6d52ba74c401ece0d2a2570322d6b7d07c29a7",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex:
            "2bff91cbd14ae53a2d476bd27306a7117d705c4fb58248af4f9b86c770991ea9785a39924d824a75b9ee0632b52c4267e6afec41e206a03b4753c5a397275807",
                },
                {
                    path: str_to_path("1853'/1815'/0'/0'"),
                    witnessSignatureHex:
            "a92f621f48c785103b1dab862715beef0f0dc2408d0668422286a1dbc268db9a32cacd3b689a0c6af32ab2ac5057caac13910f09363e2d2db0dde4a27b2b5a09",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Witness pool registration as operator with one owner and no relays",
        tx: {
            ...txBase,
            inputs: [inputs.utxoWithPath0],
            certificates: [certificates.poolRegistrationOperatorOneOwnerOperatorNoRelays],
        },
        signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OPERATOR,
        additionalWitnessPaths: [],
        expectedResult: {
            txHashHex: "486d70234b174592fffb1e750fe9580e4d88a39cd7668514b244a885251e5344",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex:
            "12776e69a6ea50ad42cdf0e164afc5a8b4fab612868ab990ead677ba4ced3ea2ad25b27ef5b27296add22c7378689a8572eb10ce24483b2ab8140b8aa5b1f70c",
                },
                {
                    path: str_to_path("1853'/1815'/0'/0'"),
                    witnessSignatureHex:
            "d8851757cf6dc978fc4b3db42111124e83e99d58739a21ecf23c6b5de316a8fe6d03767df45e62ad7b64872a73a68427ce83f6a856ebd196897e4d96c3173d06",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
    {
        testname: "Witness pool registration as operator with multiple owners and all relays",
        tx: {
            ...txBase,
            inputs: [inputs.utxoWithPath0],
            certificates: [certificates.poolRegistrationOperatorMultipleOwnersAllRelays],
        },
        signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OPERATOR,
        additionalWitnessPaths: [],
        expectedResult: {
            txHashHex: "7ece5d431b09770f2e24c190e96c3884866ba4c9cd3292d4b42d286af5f3f872",
            witnesses: [
                {
                    path: str_to_path("1852'/1815'/0'/0/0"),
                    witnessSignatureHex:
            "9f6da51173411ba82e76695ccf7c222f1df7444b0bbc1af354800acf244a4eaf72e95853406918e3ef461569fe99b39e33164ab440510f75df06e4ff89ca9107",
                },
                {
                    path: str_to_path("1853'/1815'/0'/0'"),
                    witnessSignatureHex:
            "8957a7768bc9389cd7ab6fa3b3e2fa089785715a5298f9cb38abf99a6e0da5bef734c4862ca7948fb69575ccb9ed8ae1d92cc971742f674632f6f03e22c5b103",
                },
            ],
            auxiliaryDataSupplement: null,
        },
    },
]
