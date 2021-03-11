import type { Certificate, MultiHostNameRelayParams, PoolMetadataParams, PoolOwnerParams, PoolRegistrationParams, Relay, SingleHostNameRelayParams, TxInput, TxOutput, Withdrawal } from "../../../src/Ada";
import { CertificateType, InvalidDataReason, RelayType, TxOutputDestinationType, utils } from "../../../src/Ada";
import { str_to_path } from "../../../src/utils/address";

export const inputs: Record<string, TxInput> = {
  utxo: {
    txHashHex:
      "3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7",
    outputIndex: 0,
    path: null,
  },
};

export const outputs: Record<string, TxOutput> = {
  external: {
    amount: "1",
    destination: {
      type: TxOutputDestinationType.ThirdParty,
      params: {
        addressHex: utils.buf_to_hex(
          utils.bech32_decodeAddress(
            "addr1q97tqh7wzy8mnx0sr2a57c4ug40zzl222877jz06nt49g4zr43fuq3k0dfpqjh3uvqcsl2qzwuwsvuhclck3scgn3vys6wkj5d"
          )
        ),
      }
    }
  },
};

export const sampleFeeStr = "42";
export const sampleTtlStr = "10";

const poolMetadataVariations: Record<string, PoolMetadataParams> = {
  poolMetadataDefault: {
    metadataUrl: "https://www.vacuumlabs.com/sampleUrl.json",
    metadataHashHex:
      "cdb714fd722c24aeb10c93dbb0ff03bd4783441cd5ba2a8b6f373390520535bb",
  },
};

export const invalidPoolMetadataTestcases: Array<{ testName: string, metadata: PoolMetadataParams, rejectReason: string }> = [
  // Invalid url
  {
    testName: "pool metadata url too long",
    metadata: {
      metadataUrl:
        "https://www.vacuumlabs.com/aaaaaaaaaaaaaaaaaaaaaaaasampleUrl.json",
      metadataHashHex:
        "cdb714fd722c24aeb10c93dbb0ff03bd4783441cd5ba2a8b6f373390520535bb",
    },
    rejectReason: InvalidDataReason.POOL_REGISTRATION_METADATA_INVALID_URL
  },
  {
    testName: "pool metadata invalid url",
    metadata: {
      metadataUrl: "\n",
      metadataHashHex:
        "6bf124f217d0e5a0a8adb1dbd8540e1334280d49ab861127868339f43b3948",
    },
    rejectReason: InvalidDataReason.POOL_REGISTRATION_METADATA_INVALID_URL
  },
  {
    testName: "pool metadata missing url",
    metadata: {
      metadataHashHex:
        "cdb714fd722c24aeb10c93dbb0ff03bd4783441cd5ba2a8b6f373390520535bb",
    } as PoolMetadataParams,
    rejectReason: InvalidDataReason.POOL_REGISTRATION_METADATA_INVALID_URL
  },
  // Invalid hash
  {
    testName: "pool metadata invalid hash length",
    metadata: {
      metadataUrl: "https://www.vacuumlabs.com/sampleUrl.json",
      metadataHashHex:
        "6bf124f217d0e5a0a8adb1dbd8540e1334280d49ab861127868339f43b3948",
    },
    rejectReason: InvalidDataReason.POOL_REGISTRATION_METADATA_INVALID_HASH
  },
  {
    testName: "pool metadata missing hash",
    metadata: {
      metadataUrl: "https://www.vacuumlabs.com/sampleUrl.json",
    } as PoolMetadataParams,
    rejectReason: InvalidDataReason.POOL_REGISTRATION_METADATA_INVALID_HASH
  }
]

const stakingHashOwners: Record<string, PoolOwnerParams> = {
  owner0: {
    stakingKeyHashHex:
      "794d9b3408c9fb67b950a48a0690f070f117e9978f7fc1d120fc58ad",
  },
  owner1: {
    stakingKeyHashHex:
      "0bd5d796f5e54866a14300ec2a18d706f7461b8f0502cc2a182bc88d",
  },
};

const stakingPathOwners: Record<string, PoolOwnerParams> = {
  owner0: {
    stakingPath: str_to_path("1852'/1815'/0'/2/0"), // hash: 1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c
  },
  owner1: {
    stakingPath: str_to_path("1852'/1815'/0'/2/1"),
  },
};

const poolOwnerVariationSet: Record<string, PoolOwnerParams[]> = {
  noOwners: [],
  singleHashOwner: [stakingHashOwners.owner0],
  singlePathOwner: [stakingPathOwners.owner0],
  twoHashOwners: [stakingHashOwners.owner0, stakingHashOwners.owner1],
  twoPathOwners: [stakingPathOwners.owner0, stakingPathOwners.owner1],
  twoCombinedOwners: [stakingPathOwners.owner0, stakingHashOwners.owner0],
};

const relays: Record<string, Relay> = {
  singleHostIPV4Relay0: {
    type: RelayType.SingleHostAddr,
    params: {
      portNumber: 3000,
      ipv4: "54.228.75.154", // "36e44b9a"
      ipv6: null,
    },
  },
  singleHostIPV4Relay1: {
    type: RelayType.SingleHostAddr,
    params: {
      portNumber: 4000,
      ipv4: "54.228.75.154", // "36e44b9a"
      ipv6: null,
    },
  },
  singleHostIPV4RelayMissingPort: {
    type: RelayType.SingleHostAddr,
    params: {
      portNumber: null,
      ipv4: "54.228.75.154", // "36e44b9a"
      ipv6: null,
    },
  },
  singleHostIPV4RelayMissingIpv4: {
    type: RelayType.SingleHostAddr,
    params: {
      portNumber: 3000,
      ipv4: null,
      ipv6: null,
    },
  },
  singleHostIPV6Relay: {
    type: RelayType.SingleHostAddr,
    params: {
      portNumber: 3000,
      ipv4: "54.228.75.155", // "36e44b9b"
      ipv6: "24ff:7801:33a2:e383:a5c4:340a:07c2:76e5",
    },
  },
  singleHostNameRelay: {
    type: RelayType.SingleHostName,
    params: {
      portNumber: 3000,
      dnsName: "aaaa.bbbb.com",
    },
  },
  singleHostNameRelayMissingPort: {
    type: RelayType.SingleHostName,
    params: {
      portNumber: null,
      dnsName: "aaaa.bbbb.com",
    },
  },
  singleHostNameRelayMissingDns: {
    type: RelayType.SingleHostName,
    params: {
      portNumber: 3000,
      dnsName: null,
    } as any as SingleHostNameRelayParams,
  },
  multiHostNameRelay: {
    type: RelayType.MultiHostName,
    params: {
      dnsName: "aaaa.bbbc.com",
    },
  },
  multiHostNameRelayMissingDns: {
    type: RelayType.MultiHostName,
    params: {
      dnsName: null,
    } as any as MultiHostNameRelayParams,
  },
};

const relayVariationSet: Record<string, Relay[]> = {
  noRelays: [],
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
};

const defaultPoolRegistration: PoolRegistrationParams = {
  poolKeyHashHex: "13381d918ec0283ceeff60f7f4fc21e1540e053ccf8a77307a7a32ad",
  vrfKeyHashHex:
    "07821cd344d7fd7e3ae5f2ed863218cb979ff1d59e50c4276bdc479b0d084450",
  pledge: "50000000000",
  cost: "340000000",
  margin: {
    numerator: "3",
    denominator: "100",
  },
  rewardAccountHex:
    "e1794d9b3408c9fb67b950a48a0690f070f117e9978f7fc1d120fc58ad",
  poolOwners: poolOwnerVariationSet.singlePathOwner,
  relays: relayVariationSet.singleHostIPV4Relay,
  metadata: poolMetadataVariations.poolMetadataDefault,
};

export const certificates: Record<string, Certificate> = {
  stakeRegistration: {
    type: CertificateType.STAKE_REGISTRATION,
    params: {
      path: str_to_path("1852'/1815'/0'/2/0"),
    }
  },
  stakeDeregistration: {
    type: CertificateType.STAKE_DEREGISTRATION,
    params: {
      path: str_to_path("1852'/1815'/0'/2/0"),
    }
  },
  stakeDelegation: {
    type: CertificateType.STAKE_DELEGATION,
    params: {
      path: str_to_path("1852'/1815'/0'/2/0"),
      poolKeyHashHex: "f61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb4973",
    }
  },
  poolRegistrationDefault: {
    type: CertificateType.STAKE_POOL_REGISTRATION,
    params: defaultPoolRegistration
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
      metadata: poolMetadataVariations.poolMetadataNone,
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
};

export const invalidCertificates: Array<{ testName: string, poolRegistrationCertificate: Certificate, expectedReject: string }> = [
  {
    testName: "pool registration with multiple path owners",
    poolRegistrationCertificate: {
      type: CertificateType.STAKE_POOL_REGISTRATION,
      params: {
        ...defaultPoolRegistration,
        poolOwners: poolOwnerVariationSet.twoPathOwners,
      },
    },
    expectedReject: InvalidDataReason.POOL_REGISTRATION_OWNERS_SINGLE_PATH
  },
  {
    testName: "pool registration with only hash owners",
    poolRegistrationCertificate: {
      type: CertificateType.STAKE_POOL_REGISTRATION,
      params: {
        ...defaultPoolRegistration,
        poolOwners: poolOwnerVariationSet.twoHashOwners,
      },
    },
    expectedReject: InvalidDataReason.POOL_REGISTRATION_OWNERS_SINGLE_PATH
  },
  {
    testName: "pool registration with no owners",
    poolRegistrationCertificate: {
      type: CertificateType.STAKE_POOL_REGISTRATION,
      params: {
        ...defaultPoolRegistration,
        poolOwners: poolOwnerVariationSet.noOwners,
      },
    },
    expectedReject: InvalidDataReason.POOL_REGISTRATION_OWNERS_SINGLE_PATH
  }
]

export const withdrawals: Record<string, Withdrawal> = {
  withdrawal0: {
    path: str_to_path("1852'/1815'/0'/2/0"),
    amount: "111",
  },
};

export const results = {
  allRelaysHashAndPathOwners: {
    // computed by cardano-cli
    /*
     * txBody: a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181825839017cb05fce110fb999f01abb4f62bc455e217d4a51fde909fa9aea545443ac53c046cf6a42095e3c60310fa802771d0672f8fe2d1861138b090102182a030a04818a03581c13381d918ec0283ceeff60f7f4fc21e1540e053ccf8a77307a7a32ad582007821cd344d7fd7e3ae5f2ed863218cb979ff1d59e50c4276bdc479b0d0844501b0000000ba43b74001a1443fd00d81e82031864581de1794d9b3408c9fb67b950a48a0690f070f117e9978f7fc1d120fc58ad82581c1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c581c794d9b3408c9fb67b950a48a0690f070f117e9978f7fc1d120fc58ad848400190bb84436e44b9af68400190bb84436e44b9b500178ff2483e3a2330a34c4a5e576c2078301190bb86d616161612e626262622e636f6d82026d616161612e626262632e636f6d82782968747470733a2f2f7777772e76616375756d6c6162732e636f6d2f73616d706c6555726c2e6a736f6e5820cdb714fd722c24aeb10c93dbb0ff03bd4783441cd5ba2a8b6f373390520535bb
     */
    txHashHex:
      "bc678441767b195382f00f9f4c4bddc046f73e6116fa789035105ecddfdee949",
    witnesses: [
      {
        path: str_to_path("1852'/1815'/0'/2/0"),
        witnessSignatureHex:
          "61fc06451462426b14fa3a31008a5f7d32b2f1793022060c02939bd0004b07f2bd737d542c2db6cef6dad912b9bdca1829a5dc2b45bab3c72afe374cef59cc04",
      },
    ],
  },
  poolRegistrationDefault: {
    // WARNING: only as computed by ledger, not verified with cardano-cli
    txHashHex:
      "4ea6c33b8f9714996080700d0e8480b2ab1136641ea8c3b08572be189c9825ab",
    witnesses: [
      {
        path: str_to_path("1852'/1815'/0'/2/0"),
        witnessSignatureHex:
          "f03947901bcfc96ac8e359825091db88900a470947c60220fcd3892683ec7fe949ef4e28a446d78a883f034cd77cbca669529a9da3f2316b762eb97033797a07",
      },
    ],
  },
  poolRegistrationMixedOwners: {
    // WARNING: only as computed by ledger, not verified with cardano-cli
    txHashHex:
      "322872680d2f13e2d50c806572b28a95e12bbea2e8e27db44e369e5d304929df",
    witnesses: [
      {
        path: str_to_path("1852'/1815'/0'/2/0"),
        witnessSignatureHex:
          "c1b454f3cf868007d2850084ff404bc4b91d9b541a78af9014288504143bd6b4f12df2163b7efb1817636eb625a62967fb66281ecae4d1b461770deafb65ba0f",
      },
    ],
  },
  poolRegistrationMixedOwnersIpv4SingleHostRelays: {
    // WARNING: only as computed by ledger, not verified with cardano-cli
    txHashHex:
      "a41a6e4e00ad04824455773302f95a179c03f583f969862a479d4805b53a708f",
    witnesses: [
      {
        path: str_to_path("1852'/1815'/0'/2/0"),
        witnessSignatureHex:
          "8bb8c10b390ac92f617ba6895e3b138f43dc741e3589a9548166d1eda995becf4a229e9e95f6300336f7e92345b244c5dc78cfe0cc12cac6ff6fbb5731671c0e",
      },
    ],
  },
  poolRegistrationMixedOwnersIpv4Ipv6Relays: {
    // WARNING: only as computed by ledger, not verified with cardano-cli
    txHashHex:
      "ab64050759a4221d4a8568badf06c444b42dae05fb2d22b0dff5749a49e5d332",
    witnesses: [
      {
        path: str_to_path("1852'/1815'/0'/2/0"),
        witnessSignatureHex:
          "b0e6796ca5f97a0776c798e602afd0f6541996d431a3cbec8e3fe77eb49416cd812dcf6084672e40c9ae2b8cc8a5513d1b1a6c3ad408864d4a771e315c50d808",
      },
    ],
  },
  noRelaysSinglePathOwner: {
    // WARNING: only as computed by ledger, not verified with cardano-cli
    txHashHex:
      "fc4778c13fadb8b69249b4cd98ef45f42145e1ce081c5466170a670829dc2184",
    witnesses: [
      {
        path: str_to_path("1852'/1815'/0'/2/0"),
        witnessSignatureHex:
          "adc06e34dc66f01b16496b04fc4ce5058e3be7290398cf2728f8463dda15c87866314449bdb309d0cdc22f3ca9bee310458f2769df6a1486f1b470a3227a030b",
      },
    ],
  },
  noMetadata: {
    // WARNING: only as computed by ledger, not verified with cardano-cli
    txHashHex:
      "a97b2258962537e0ad3cbcb1fbf9d454f55bc9b7feb2bea0da23f82c1e956f67",
    witnesses: [
      {
        path: str_to_path("1852'/1815'/0'/2/0"),
        witnessSignatureHex:
          "06e66f6a2d510a8a5446597c59c79cbf4f9e7af9073da0651ea59bbdc2340dc933ed292aa282e6ea7068bed9f6bcb44228573e661c211e6dc61f4dd73ff41f04",
      },
    ],
  },
  noOutputs: {
    // WARNING: only as computed by ledger, not verified with cardano-cli
    txHashHex:
      "600114fd1c50a7e857fdcaaea73d94f7435c9fce63cfde597f7c48b8dda3b0ba",
    witnesses: [
      {
        path: str_to_path("1852'/1815'/0'/2/0"),
        witnessSignatureHex:
          "91c09ad95d5d0f87f61a62e2f5e2dda4245eb4011887a04a53bdf085282002ccc712718e855e36a30cfcf7ecd43bcdc795aa87647be9c716b65e7fcf376e0503",
      },
    ],
  },
};
