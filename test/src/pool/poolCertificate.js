import { expect } from "chai";
import { getAda, str_to_path, NetworkIds, ProtocolMagics} from "../test_utils";
import { AddressTypeNibbles, utils } from "../../../lib/Ada";
import { PoolParams } from "../../../lib/Ada"

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
    stakingKeyHashHex: "fc38b160e62718716922612711c277ae8b363977dcfb020c4189fba7"
  },
  owner1: {
    stakingKeyHashHex: "0bd5d796f5e54866a14300ec2a18d706f7461b8f0502cc2a182bc88d"
  }
}

const stakingPathOwners = {
  owner0: {
    stakingPath: str_to_path("1852'/1815'/0'/2/0")
  },
  owner1: {
    stakingPath: str_to_path("1852'/1815'/0'/2/1")
  }
}

const poolOwnerVariations = {
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
      ipv4Hex: "36e44b9a",
      ipv6Hex: "24ff780133a2e383a5c4340a07c276e5"
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
      dnsName: "aaaa.bbbb.com"
    }
  },
  multiHostNameRelayMissingDns: {
    type: 2,
    params: {
      dnsName: null
    }
  }
}

const relayVariations = {
  noRelays: [],
  singleHostIPV4Relay: [relays.singleHostIPV4Relay0],
  singleHostIPV6Relay: [relays.singleHostIPV6Relay],
  singleHostNameRelay: [relays.singleHostNameRelay],
  multiHostNameRelay: [relays.multiHostNameRelay], // reportedly not implemented
  twoIPV4Relays: [relays.singleHostIPV4Relay0, relays.singleHostIPV4Relay1],
  combinedIPV4SingleHostNameRelays: [relays.singleHostIPV4Relay0, relays.singleHostNameRelay],
  combinedIPV4IPV6Relays: [relays.singleHostIPV4Relay1, relays.singleHostIPV6Relay]
}

const defaultPoolRegistration: PoolParams = {
  type: 3,
  path: str_to_path("1852'/1815'/0'/2/0"),
  poolRegistrationParams: {
    poolKeyHashHex: "7d7ef6b9789d2e56f40d64fd68a0978263b78819c85d806517ba8531",
    vrfKeyHashHex: "d318306e883533656c137a4b97101c011add371c6cb3f26de7c0084ebd2d08ac",
    pledgeStr: "50000000000",
    costStr: "340000000",
    margin: {
      numerator: 3,
      denominaror: 100,
    },
    rewardAccountKeyHash: "e0fc38b160e62718716922612711c277ae8b363977dcfb020c4189fba7",
    poolOwners: poolOwnerVariations.singlePathOwner,
    relays: relayVariations.singleHostIPV4Relay,
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
      poolOwners: poolOwnerVariations.twoCombinedOwners
    }
  },
  poolRegistration2PathOwners: {
    ...defaultPoolRegistration,
    poolRegistrationParams: {
      ...defaultPoolRegistration.poolRegistrationParams,
      poolOwners: poolOwnerVariations.twoPathOwners
    }
  },
  poolRegistration2HashOwners: {
    ...defaultPoolRegistration,
    poolRegistrationParams: {
      ...defaultPoolRegistration.poolRegistrationParams,
      poolOwners: poolOwnerVariations.twoHashOwners
    }
  },
  poolRegistrationNoOwners: { 
    ...defaultPoolRegistration,
    poolRegistrationParams: {
      ...defaultPoolRegistration.poolRegistrationParams,
      poolOwners: poolOwnerVariations.noOwners
    }
  },
  poolRegistrationMixedOwnersIpv4SingleHostRelays: {
    ...defaultPoolRegistration,
    poolRegistrationParams: {
      ...defaultPoolRegistration.poolRegistrationParams,
      poolOwners: poolOwnerVariations.twoCombinedOwners,
      relays: relayVariations.combinedIPV4SingleHostNameRelays
    }
  },
  poolRegistrationMixedOwnersIpv4Ipv6Relays: {
    ...defaultPoolRegistration,
    poolRegistrationParams: {
      ...defaultPoolRegistration.poolRegistrationParams,
      poolOwners: poolOwnerVariations.twoCombinedOwners,
      relays: relayVariations.combinedIPV4IPV6Relays
    }
  },
  poolRegistrationNoRelays: {
    ...defaultPoolRegistration,
    poolRegistrationParams: {
      ...defaultPoolRegistration.poolRegistrationParams,
      relays: relayVariations.noRelays
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
        numerator: 3,
        denominaror: 1,
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
    // TODO
  });

  it("Should correctly witness valid multiple mixed owners ipv4 relay pool registration", async () => {
    const cert = certificates.poolRegistrationMixedOwners
    // TODO
  });

  it("Should correctly witness valid multiple mixed owners mixed ipv4, single host relays pool registration", async () => {
    const cert = certificates.poolRegistrationMixedOwnersIpv4SingleHostRelays  
    // TODO
  });

  it("Should correctly witness valid multiple mixed owners mixed ipv4 ipv6 relays pool registration", async () => {
    const cert = certificates.poolRegistrationMixedOwnersIpv4Ipv6Relays
    // TODO
  });

  it("Should correctly witness valid single path owner no relays pool registration ", async () => {
    // Pool won't be listed in the topology, it will need to connect manually to known nodes
    const cert = certificates.poolRegistrationNoRelays
    // TODO
  });

    it("Should reject pool registration with multiple path owners", async () => {
    const cert = certificates.poolRegistration2PathOwners
    // TODO
  });

  it("Should reject pool registration with only hash owners", async () => {
    const cert = certificates.poolRegistration2HashOwners
    // TODO
  });

  it("Should correctly witness default registration with no metadata", async () => {
    // works as a private pool not visible in yoroi, daedalus, etc.
    const cert = certificates.poolRegistrationNoMetadata
    // TODO
  });

  it("Should reject pool registration with no owners", async () => {
    const cert = certificates.poolRegistrationNoOwners
    // TODO
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
      // test and reject
    }
    //reject all
  });

  it("Should reject pool registration with invalid relays", async () => {
    const invalidRelayVariations = [
      relays.singleHostIPV4RelayMissingPort,
      relays.singleHostIPV4RelayMissingIpv4,
      relays.singleHostNameRelayMissingPort,
      relays.singleHostNameRelayMissingDns,
      relays.multiHostNameRelayMissingDns
    ]

    for (const relayVariant of invalidRelayVariations) {
      const cert = { 
        ...certificates.poolRegistrationDefault,
        poolRegistrationParams: {
          ...certificates.poolRegistrationDefault.poolRegistrationParams,
          relays: [relayVariant],
        }
      }
      // test and reject
    }
    //reject all
  });

  it("Should reject pool registration with numerator bigger than denominator", async () => {
    const cert = certificates.poolRegistrationWrongMargin
    // TODO
  });

  it("Should reject pool registration along with other certificates", async () => {
    const certs = [
      certificates.poolRegistrationDefault,
      certificates.stakeDelegation,
    ]
    // TODO
  });

  it("Should reject pool registration along with a withdrawal", async () => {
    const cert = certificates.poolRegistrationDefault
    const withdrawal = [withdrawals.withdrawal0]
    // TODO
  });
});
