import { expect } from "chai";
import { getAda, str_to_path, NetworkIds, ProtocolMagics} from "../test_utils";
import { AddressTypeNibbles, utils } from "../../../lib/Ada";

const inputs = {
  utxo: {
    txHashHex: "3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7",
    outputIndex: 0
  }
};

const outputs = {
  external: {
    amountStr: "1",
    addressHex: utils.buf_to_hex(utils.bech32_decodeAddress(
      "addr1q97tqh7wzy8mnx0sr2a57c4ug40zzl222877jz06nt49g4zr43fuq3k0dfpqjh3uvqcsl2qzwuwsvuhclck3scgn3vya5cw5yhe5vyg5x20akz"
    ))
  }
}

const sampleFeeStr = "42";
const sampleTtlStr = "10";

const poolMetadataVariations = {
  poolMetadataDefault: {
    metadataUrl: "https://www.vacuumlabs.com/sampleUrl.json",
    metadataHashHex: "cdb714fd722c24aeb10c93dbb0ff03bd4783441cd5ba2a8b6f373390520535bb"
  },
  poolMetadataUrlTooLong: {
    metadataUrl: "https://www.vacuumlabs.com/aaaaaaaaaaaaaaaaaaaaaaaasampleUrl.json",
    metadataHashHex: "cdb714fd722c24aeb10c93dbb0ff03bd4783441cd5ba2a8b6f373390520535bb"
  },
  poolMetadataInvalidHexLength: {
    metadataUrl: "https://www.vacuumlabs.com/sampleUrl.json",
    metadataHashHex: "6bf124f217d0e5a0a8adb1dbd8540e1334280d49ab861127868339f43b3948"
  },
  poolMetadataInvalidUrl: {
    metadataUrl: "$.v#5fb2@euf)#i^9a|$;i8$l7v<aj)2<;bdmn9",
    metadataHashHex: "6bf124f217d0e5a0a8adb1dbd8540e1334280d49ab861127868339f43b3948"
  },
  poolMetadataMissingHash: {
    metadataUrl: "https://www.vacuumlabs.com/sampleUrl.json"
  },
  poolMetadataMissingUrl: {
    metadataHashHex: "cdb714fd722c24aeb10c93dbb0ff03bd4783441cd5ba2a8b6f373390520535bb"
  },
  poolMetadataNone: {}
}

const stakingHashOwners = {
  owner0: {
    stakingKeyHashHex: "794d9b3408c9fb67b950a48a0690f070f117e9978f7fc1d120fc58ad"
  },
  owner1: {
    stakingKeyHashHex: "0bd5d796f5e54866a14300ec2a18d706f7461b8f0502cc2a182bc88d"
  }
}

const stakingPathOwners = {
  owner0: {
    stakingPath: str_to_path("1852'/1815'/0'/2/0") // hash: 1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c
  },
  owner1: {
    stakingPath: str_to_path("1852'/1815'/0'/2/1")
  }
}

const poolOwnerVariationSet = {
  noOwners: [],
  singleHashOwner: [stakingHashOwners.owner0],
  singlePathOwner: [stakingPathOwners.owner0],
  twoHashOwners: [
    stakingHashOwners.owner0,
    stakingHashOwners.owner1
  ],
  twoPathOwners: [
    stakingPathOwners.owner0,
    stakingPathOwners.owner1
  ],
  twoCombinedOwners: [
    stakingHashOwners.owner0,
    stakingPathOwners.owner0
  ]
}

const relays = {
  singleHostIPV4Relay0: {
    type: 0,
    params: {
      portNumber: 3000,
      ipv4Hex: "36e44b9a",
      ipv6Hex: null
    }
  },
  singleHostIPV4Relay1: {
    type: 0,
    params: {
      portNumber: 4000,
      ipv4Hex: "36e44b9a",
      ipv6Hex: null
    }
  },
  singleHostIPV4RelayMissingPort: {
    type: 0,
    params: {
      portNumber: null,
      ipv4Hex: "36e44b9a",
      ipv6Hex: null
    }
  },
  singleHostIPV4RelayMissingIpv4: {
    type: 0,
    params: {
      portNumber: 3000,
      ipv4Hex: null,
      ipv6Hex: null
    }
  },
  singleHostIPV6Relay: {
    type: 0,
    params: {
      portNumber: 3000,
      ipv4Hex: "36e44b9b",
      ipv6Hex: "0178ff2483e3a2330a34c4a5e576c207"
    }
  },
  singleHostNameRelay: {
    type: 1,
    params: {
      portNumber: 3000,
      dnsName: "aaaa.bbbb.com"
    }
  },
  singleHostNameRelayMissingPort: {
    type: 1,
    params: {
      portNumber: null,
      dnsName: "aaaa.bbbb.com"
    }
  },
  singleHostNameRelayMissingDns: {
    type: 1,
    params: {
      portNumber: 3000,
      dnsName: null
    }
  },
  multiHostNameRelay: {
    type: 2,
    params: {
      dnsName: "aaaa.bbbc.com"
    }
  },
  multiHostNameRelayMissingDns: {
    type: 2,
    params: {
      dnsName: null
    }
  }
}

const relayVariationSet = {
  noRelays: [],
  singleHostIPV4Relay: [relays.singleHostIPV4Relay0],
  singleHostIPV6Relay: [relays.singleHostIPV6Relay],
  singleHostNameRelay: [relays.singleHostNameRelay],
  multiHostNameRelay: [relays.multiHostNameRelay], // reportedly not implemented
  twoIPV4Relays: [relays.singleHostIPV4Relay0, relays.singleHostIPV4Relay1],
  combinedIPV4SingleHostNameRelays: [relays.singleHostIPV4Relay0, relays.singleHostNameRelay],
  combinedIPV4IPV6Relays: [relays.singleHostIPV4Relay1, relays.singleHostIPV6Relay],
  allRelays: [
    relays.singleHostIPV4Relay0,
    relays.singleHostIPV6Relay,
    relays.singleHostNameRelay,
    relays.multiHostNameRelay
  ]
}

const defaultPoolRegistration = {
  type: 3,
  poolRegistrationParams: {
    poolKeyHashHex: "13381d918ec0283ceeff60f7f4fc21e1540e053ccf8a77307a7a32ad",
    vrfKeyHashHex: "07821cd344d7fd7e3ae5f2ed863218cb979ff1d59e50c4276bdc479b0d084450",
    pledgeStr: "50000000000",
    costStr: "340000000",
    margin: {
      numeratorStr: "3",
      denominatorStr: "100",
    },
    rewardAccountKeyHash: "e1794d9b3408c9fb67b950a48a0690f070f117e9978f7fc1d120fc58ad",
    poolOwners: poolOwnerVariationSet.singlePathOwner,
    relays: relayVariationSet.singleHostIPV4Relay,
    metadata: poolMetadataVariations.poolMetadataDefault
  }
}

const certificates = {
  stakeRegistration: {
    type: 0,
    path: str_to_path("1852'/1815'/0'/2/0")
  },
  stakeDeregistration: {
    type: 1,
    path: str_to_path("1852'/1815'/0'/2/0")
  },
  stakeDelegation: {
    type: 2,
    path: str_to_path("1852'/1815'/0'/2/0"),
    poolKeyHashHex: "f61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb4973"
  },
  poolRegistrationDefault: {
    ...defaultPoolRegistration
  },
  poolRegistrationMixedOwners: {
    ...defaultPoolRegistration,
    poolRegistrationParams: {
      ...defaultPoolRegistration.poolRegistrationParams,
      poolOwners: poolOwnerVariationSet.twoCombinedOwners
    }
  },
  poolRegistrationMixedOwnersAllRelays: {
    ...defaultPoolRegistration,
    poolRegistrationParams: {
      ...defaultPoolRegistration.poolRegistrationParams,
      poolOwners: poolOwnerVariationSet.twoCombinedOwners,
      relays: relayVariationSet.allRelays
    }
  },
  poolRegistration2PathOwners: {
    ...defaultPoolRegistration,
    poolRegistrationParams: {
      ...defaultPoolRegistration.poolRegistrationParams,
      poolOwners: poolOwnerVariationSet.twoPathOwners
    }
  },
  poolRegistration2HashOwners: {
    ...defaultPoolRegistration,
    poolRegistrationParams: {
      ...defaultPoolRegistration.poolRegistrationParams,
      poolOwners: poolOwnerVariationSet.twoHashOwners
    }
  },
  poolRegistrationNoOwners: {
    ...defaultPoolRegistration,
    poolRegistrationParams: {
      ...defaultPoolRegistration.poolRegistrationParams,
      poolOwners: poolOwnerVariationSet.noOwners
    }
  },
  poolRegistrationMixedOwnersIpv4SingleHostRelays: {
    ...defaultPoolRegistration,
    poolRegistrationParams: {
      ...defaultPoolRegistration.poolRegistrationParams,
      poolOwners: poolOwnerVariationSet.twoCombinedOwners,
      relays: relayVariationSet.combinedIPV4SingleHostNameRelays
    }
  },
  poolRegistrationMixedOwnersIpv4Ipv6Relays: {
    ...defaultPoolRegistration,
    poolRegistrationParams: {
      ...defaultPoolRegistration.poolRegistrationParams,
      poolOwners: poolOwnerVariationSet.twoCombinedOwners,
      relays: relayVariationSet.combinedIPV4IPV6Relays
    }
  },
  poolRegistrationNoRelays: {
    ...defaultPoolRegistration,
    poolRegistrationParams: {
      ...defaultPoolRegistration.poolRegistrationParams,
      relays: relayVariationSet.noRelays
    }
  },
  poolRegistrationNoMetadata: {
    ...defaultPoolRegistration,
    poolRegistrationParams: {
      ...defaultPoolRegistration.poolRegistrationParams,
      metadata: poolMetadataVariations.poolMetadataNone
    }
  },
  poolRegistrationWrongMargin: {
    ...defaultPoolRegistration,
    poolRegistrationParams: {
      ...defaultPoolRegistration.poolRegistrationParams,
      margin: {
        numeratorStr: "3",
        denominatorStr: "1",
      }
    }
  },
}

const withdrawals = {
  withdrawal0: {
    path: str_to_path("1852'/1815'/0'/2/0"),
    amountStr: "111"
  }
}

const results = {
  allRelaysHashAndPathOwners: {
    /*
    * txBody: a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7000181825839017cb05fce110fb999f01abb4f62bc455e217d4a51fde909fa9aea545443ac53c046cf6a42095e3c60310fa802771d0672f8fe2d1861138b090102182a030a04818a03581c13381d918ec0283ceeff60f7f4fc21e1540e053ccf8a77307a7a32ad582007821cd344d7fd7e3ae5f2ed863218cb979ff1d59e50c4276bdc479b0d0844501b0000000ba43b74001a1443fd00d81e82031864581de1794d9b3408c9fb67b950a48a0690f070f117e9978f7fc1d120fc58ad82581c1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c581c794d9b3408c9fb67b950a48a0690f070f117e9978f7fc1d120fc58ad848400190bb84436e44b9af68400190bb84436e44b9b500178ff2483e3a2330a34c4a5e576c2078301190bb86d616161612e626262622e636f6d82026d616161612e626262632e636f6d82782968747470733a2f2f7777772e76616375756d6c6162732e636f6d2f73616d706c6555726c2e6a736f6e5820cdb714fd722c24aeb10c93dbb0ff03bd4783441cd5ba2a8b6f373390520535bb
    */
    txHashHex: "bc678441767b195382f00f9f4c4bddc046f73e6116fa789035105ecddfdee949",
    witnesses: [
      {
        // TODO: Get from ledger
      }
    ]
  }
}

describe("witnessCertificate", async () => {
  let ada = {};

  beforeEach(async () => {
    ada = await getAda();
  });

  afterEach(async () => {
    await ada.t.close();
  });

  it("Should correctly witness valid single path owner ipv4 relay pool registration", async () => {
    const cert = certificates.poolRegistrationDefault
    const response = await ada.signTransaction(
      NetworkIds.MAINNET,
      ProtocolMagics.MAINNET,
      [inputs.utxo],
      [
        outputs.external,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [cert],
      [],
      null
    );
    // expect(response).to.deep.equal();
  });

  it("Should correctly witness valid multiple mixed owners ipv4 relay pool registration", async () => {
    const cert = certificates.poolRegistrationMixedOwners
    const response = await ada.signTransaction(
      NetworkIds.MAINNET,
      ProtocolMagics.MAINNET,
      [inputs.utxo],
      [
        outputs.external,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [cert],
      [],
      null
    );
    // expect(response).to.deep.equal();
  });

  it("Should correctly witness valid multiple mixed owners mixed ipv4, single host relays pool registration", async () => {
    const cert = certificates.poolRegistrationMixedOwnersIpv4SingleHostRelays;
    const response = await ada.signTransaction(
      NetworkIds.MAINNET,
      ProtocolMagics.MAINNET,
      [inputs.utxo],
      [
        outputs.external,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [cert],
      [],
      null
    );
    // expect(response).to.deep.equal();
  });

  it("Should correctly witness valid multiple mixed owners mixed ipv4 ipv6 relays pool registration", async () => {
    const cert = certificates.poolRegistrationMixedOwnersIpv4Ipv6Relays
    const response = await ada.signTransaction(
      NetworkIds.MAINNET,
      ProtocolMagics.MAINNET,
      [inputs.utxo],
      [
        outputs.external,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [cert],
      [],
      null
    );
    // expect(response).to.deep.equal();
  });
*/

  it("Should correctly witness valid multiple mixed owners all relays pool registration", async () => {
    /*
    * txBody: a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7
    * 000181825839017cb05fce110fb999f01abb4f62bc455e217d4a51fde909fa9aea545443ac53c046cf6a4209
    * 5e3c60310fa802771d0672f8fe2d1861138b090102182a030a04818a03581c13381d918ec0283ceeff60f7f4
    * fc21e1540e053ccf8a77307a7a32ad582007821cd344d7fd7e3ae5f2ed863218cb979ff1d59e50c4276bdc47
    * 9b0d0844501b0000000ba43b74001a1443fd00d81e82031864581de1794d9b3408c9fb67b950a48a0690f070
    * f117e9978f7fc1d120fc58ad82581c1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c58
    * 1c794d9b3408c9fb67b950a48a0690f070f117e9978f7fc1d120fc58ad848400190bb84436e44b9af6840019
    * 0bb84436e44b9b500178ff2483e3a2330a34c4a5e576c2078301190bb86d616161612e626262622e636f6d82
    * 026d616161612e626262632e636f6d82782968747470733a2f2f7777772e76616375756d6c6162732e636f6d
    * 2f73616d706c6555726c2e6a736f6e5820cdb714fd722c24aeb10c93dbb0ff03bd4783441cd5ba2a8b6f3733
    * 90520535bb
    */
    const cert = certificates.poolRegistrationMixedOwnersAllRelays
    const response = await ada.signTransaction(
      NetworkIds.MAINNET,
      ProtocolMagics.MAINNET,
      [inputs.utxo],
      [
        outputs.external,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [cert],
      [],
      null
    );
    expect(response).to.deep.equal(results.allRelaysHashAndPathOwners);
  });

  it("Should correctly witness valid single path owner no relays pool registration ", async () => {
    // Pool won't be listed in the topology, it will need to connect manually to known nodes
    const cert = certificates.poolRegistrationNoRelays
    const response = await ada.signTransaction(
      NetworkIds.MAINNET,
      ProtocolMagics.MAINNET,
      [inputs.utxo],
      [
        outputs.external,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [cert],
      [],
      null
    );
    // expect(response).to.deep.equal();
  });

    it("Should reject pool registration with multiple path owners", async () => {
    const cert = certificates.poolRegistration2PathOwners
    const response = await ada.signTransaction(
      NetworkIds.MAINNET,
      ProtocolMagics.MAINNET,
      [inputs.utxo],
      [
        outputs.external,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [cert],
      [],
      null
    );
    // expect(response).to.deep.equal();
  });

  it("Should reject pool registration with only hash owners", async () => {
    const cert = certificates.poolRegistration2HashOwners
    const response = await ada.signTransaction(
      NetworkIds.MAINNET,
      ProtocolMagics.MAINNET,
      [inputs.utxo],
      [
        outputs.external,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [cert],
      [],
      null
    );
    // expect(response).to.deep.equal();
  });

  it("Should correctly witness default registration with no metadata", async () => {
    // works as a private pool not visible in yoroi, daedalus, etc.
    const cert = certificates.poolRegistrationNoMetadata
    const response = await ada.signTransaction(
      NetworkIds.MAINNET,
      ProtocolMagics.MAINNET,
      [inputs.utxo],
      [
        outputs.external,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [cert],
      [],
      null
    );
    // expect(response).to.deep.equal();
  });

  it("Should reject pool registration with no owners", async () => {
    const cert = certificates.poolRegistrationNoOwners
    const response = await ada.signTransaction(
      NetworkIds.MAINNET,
      ProtocolMagics.MAINNET,
      [inputs.utxo],
      [
        outputs.external,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [cert],
      [],
      null
    );
    // expect(response).to.deep.equal();
  });

  it("Should reject pool registration with invalid metadata params", async () => {
    const invalidMetadataVariations = [
      poolMetadataVariations.poolMetadataUrlTooLong,
      poolMetadataVariations.poolMetadataInvalidHexLength,
      poolMetadataVariations.poolMetadataInvalidUrl,
      poolMetadataVariations.poolMetadataMissingHash,
      poolMetadataVariations.poolMetadataMissingUrl
    ]

    for (const metadataVariant of invalidMetadataVariations) {
      const cert = {
        ...certificates.poolRegistrationDefault,
        poolRegistrationParams: {
          ...certificates.poolRegistrationDefault.poolRegistrationParams,
          metadata: metadataVariant
        }
      }

      const response = await ada.signTransaction(
        NetworkIds.MAINNET,
        ProtocolMagics.MAINNET,
        [inputs.utxo],
        [
          outputs.external,
        ],
        sampleFeeStr,
        sampleTtlStr,
        [cert],
        [],
        null
      );
      // expect(response).to.deep.equal();
    }
  });

  it("Should reject pool registration with invalid relays", async () => {
    const invalidrelayVariationSet = [
      relays.singleHostIPV4RelayMissingPort,
      relays.singleHostIPV4RelayMissingIpv4,
      relays.singleHostNameRelayMissingPort,
      relays.singleHostNameRelayMissingDns,
      relays.multiHostNameRelayMissingDns
    ]

    for (const relayVariant of invalidrelayVariationSet) {
      const cert = {
        ...certificates.poolRegistrationDefault,
        poolRegistrationParams: {
          ...certificates.poolRegistrationDefault.poolRegistrationParams,
          relays: [relayVariant],
        }
      }
      const response = await ada.signTransaction(
        NetworkIds.MAINNET,
        ProtocolMagics.MAINNET,
        [inputs.utxo],
        [
          outputs.external,
        ],
        sampleFeeStr,
        sampleTtlStr,
        [cert],
        [],
        null
      );
      // expect(response).to.deep.equal();
    }
  });

  it("Should reject pool registration with numerator bigger than denominator", async () => {
    const cert = certificates.poolRegistrationWrongMargin
    const response = await ada.signTransaction(
      NetworkIds.MAINNET,
      ProtocolMagics.MAINNET,
      [inputs.utxo],
      [
        outputs.external,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [cert],
      [],
      null
    );
    // expect(response).to.deep.equal();
  });

  it("Should reject pool registration along with other certificates", async () => {
    const certs = [
      certificates.poolRegistrationDefault,
      certificates.stakeDelegation,
    ]
    const response = await ada.signTransaction(
      NetworkIds.MAINNET,
      ProtocolMagics.MAINNET,
      [inputs.utxo],
      [
        outputs.external,
      ],
      sampleFeeStr,
      sampleTtlStr,
      certs,
      [],
      null
    );
    // expect(response).to.deep.equal();
  });

  it("Should reject pool registration along with a withdrawal", async () => {
    const cert = certificates.poolRegistrationDefault
    const withdrawal = withdrawals.withdrawal0
    const response = await ada.signTransaction(
      NetworkIds.MAINNET,
      ProtocolMagics.MAINNET,
      [inputs.utxo],
      [
        outputs.external,
      ],
      sampleFeeStr,
      sampleTtlStr,
      [cert],
      [withdrawal],
      null
    );
    // expect(response).to.deep.equal();
  });
});
