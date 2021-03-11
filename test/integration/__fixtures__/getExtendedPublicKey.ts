export type TestCase = {
  path: string,
  expected: { publicKey: string, chainCode: string, _privateKey?: string }
}

export const testsByron: TestCase[] = [
  // Byron
  {
    path: "44'/1815'/1'",
    expected: {
      publicKey:
        "eb6e933ce45516ac7b0e023de700efae5e212ccc6bf0fcb33ba9243b9d832827",
      chainCode:
        "0b161cb11babe1f56c3f9f1cbbb7b6d2d13eeb3efa67205198a69b8d81885354",
      _privateKey:
        "5878bdf06af259f1419324680c4d4ce05b4343895b697144d874749925e69d41648e7e50061809207f81dac36b73cd8fab2325d49d26bc65ebbb696ea59c45b8",
    },
  },
  {
    path: "44'/1815'/1'/0/55'",
    expected: {
      publicKey:
        "83220849a3ada3e95495e22b24aee95c3120d4c8a9faafed312914769e65b70d",
      chainCode:
        "69d1b1d5a95ba88b2851d6e1da2d2113f4eca6949f31ababf007deffaba6ae26",
      _privateKey:
        "b0af23faa61a4bddea371d1a406001bfe8cc7de606d6fc3f817003372fe69d412350b482eae6356f47dfe3cec7b114653a96c7fb94ee20f70499ee0c9f4c212c",
    },
  },
  {
    path: "44'/1815'/1'/0/12'",
    expected: {
      publicKey:
        "40711c6ebf9c0a4c73987687a09255d9cfa8591c9915162ba11054ec4ee77e09",
      chainCode:
        "b4fbd48d01d09c7cbcaed7a48ffac9d53ddf5564ad468bfef18fe7d9bc535a16",
      _privateKey:
        "d8081fe3f24b16a052db09badeb8bab0a40f94f0f41b2978f460efb02ae69d41c5ef9fb6fedd0a94f7d82afee6496aa965c70c1143425a356fc0bc296e17fdd8",
    },
  },
]

export const testsByronUnusual: TestCase[] = [
  {
    path: "44'/1815'/1'/0/10'/1/2/3",
    expected: {
      publicKey:
        "8e54bc03fd01db1c2fa21e87780eb810838d2df024d33f1ea5e8507e7d4cf010",
      chainCode:
        "872301244debde31fe4d95df10cec5bda73e241683c5b958b53d19cf5a4c1286",
      _privateKey:
        "80e897e1a3903a34f28769c606f09ba97dabece097026fac26b975aa33e69d4128e357f2334d6f19f680469a7fa0cea0dfc1f5681ebdb6dcf125833814150b89",
    },
  },
  {
    path: "44'/1815'/1'/0/10'/1/2'/3",
    expected: {
      publicKey:
        "be50763c781f6685a30872ff5471be5447793894b24d5ed6d95a62a17c5e0be1",
      chainCode:
        "edbc393fd9ad97665ab1e29f1523c2843e24639ec8a76778385a077e5153ecd0",
      _privateKey:
        "1843fa0d93d219fe32f828dcb0b099371efd76ad61835b882520b0b430e69d419478ef007b937df52bafdd6f00e3750649edf47ee9323d81cf128c1c2faa84d2",
    },
  },
]

export const testsShelley: TestCase[] = [
  // Shelley
  // TODO supply missing values for deadbeefs?
  {
    path: "1852'/1815'/0'/0/1",
    expected: {
      publicKey:
        "b3d5f4158f0c391ee2a28a2e285f218f3e895ff6ff59cb9369c64b03b5bab5eb",
      chainCode:
        "27e1d1f3a3d0fafc0884e02a2d972e7e5b1be8a385ecc1bc75a977b4073dbd08",
    },
  },
  {
    path: "1852'/1815'/0'/2/0",
    expected: {
      publicKey:
        "66610efd336e1137c525937b76511fbcf2a0e6bcf0d340a67bcb39bc870d85e8",
      chainCode:
        "e977e956d29810dbfbda9c8ea667585982454e401c68578623d4b86bc7eb7b58",
    }
  },
];
