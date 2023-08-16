export type TestCase = {
  path: string
  expected: {publicKey: string; chainCode: string; _privateKey?: string}
}

export const testsByron: TestCase[] = [
  // Byron
  {
    path: "44'/1815'/1'",
    expected: {
      publicKey:
        'eb6e933ce45516ac7b0e023de700efae5e212ccc6bf0fcb33ba9243b9d832827',
      chainCode:
        '0b161cb11babe1f56c3f9f1cbbb7b6d2d13eeb3efa67205198a69b8d81885354',
      _privateKey:
        '5878bdf06af259f1419324680c4d4ce05b4343895b697144d874749925e69d41648e7e50061809207f81dac36b73cd8fab2325d49d26bc65ebbb696ea59c45b8',
    },
  },
  {
    path: "44'/1815'/1'/0/55'",
    expected: {
      publicKey:
        '83220849a3ada3e95495e22b24aee95c3120d4c8a9faafed312914769e65b70d',
      chainCode:
        '69d1b1d5a95ba88b2851d6e1da2d2113f4eca6949f31ababf007deffaba6ae26',
      _privateKey:
        'b0af23faa61a4bddea371d1a406001bfe8cc7de606d6fc3f817003372fe69d412350b482eae6356f47dfe3cec7b114653a96c7fb94ee20f70499ee0c9f4c212c',
    },
  },
  {
    path: "44'/1815'/1'/0/12'",
    expected: {
      publicKey:
        '40711c6ebf9c0a4c73987687a09255d9cfa8591c9915162ba11054ec4ee77e09',
      chainCode:
        'b4fbd48d01d09c7cbcaed7a48ffac9d53ddf5564ad468bfef18fe7d9bc535a16',
      _privateKey:
        'd8081fe3f24b16a052db09badeb8bab0a40f94f0f41b2978f460efb02ae69d41c5ef9fb6fedd0a94f7d82afee6496aa965c70c1143425a356fc0bc296e17fdd8',
    },
  },
]

export const testsShelleyUsual: TestCase[] = [
  // Shelley
  {
    path: "1852'/1815'/4'",
    expected: {
      publicKey:
        '4e4353d7cc6f49e8e7a281e08a7672d000d4abfdf07be299cbff95d6a05df224',
      chainCode:
        'cbc28c222a6c15c0cfe98434f97b3aef860b5ce6902e177820adbd70ed7dc2ec',
    },
  },
  {
    path: "1852'/1815'/0'/0/1",
    expected: {
      publicKey:
        'b3d5f4158f0c391ee2a28a2e285f218f3e895ff6ff59cb9369c64b03b5bab5eb',
      chainCode:
        '27e1d1f3a3d0fafc0884e02a2d972e7e5b1be8a385ecc1bc75a977b4073dbd08',
    },
  },
  {
    path: "1852'/1815'/0'/2/0",
    expected: {
      publicKey:
        '66610efd336e1137c525937b76511fbcf2a0e6bcf0d340a67bcb39bc870d85e8',
      chainCode:
        'e977e956d29810dbfbda9c8ea667585982454e401c68578623d4b86bc7eb7b58',
    },
  },
  {
    path: "1852'/1815'/0'/2/1001",
    expected: {
      publicKey:
        'dbc5fbbe47eabc036c6834ea62c011b15272ec85a17facd3670cd9304486ffe8',
      chainCode:
        'fb037474fc75e64745f7fd9f44b4bcbc58d81cae2209f2f5c1f77501e9bb43df',
    },
  },
]

export const testsShelleyUnusual: TestCase[] = [
  {
    path: "1852'/1815'/101'",
    expected: {
      publicKey:
        '674af1cfe5919576714bb31f065ac93788a6a2fb5168362c0aa9509ac513bbbc',
      chainCode:
        '5d403248edff92b87433ae97942326cd1656a57301a03988fb36b9ae728d4d2c',
    },
  },
  {
    path: "1852'/1815'/100'/0/1000001'",
    expected: {
      publicKey:
        'd06a7a9d87e95f475811e31b03564d272f1c2614e8b2cf0f37d6e973fd2aba9c',
      chainCode:
        '8aca949d791e4a4f26e05e55d39d17f565884b56882283cf7d97e338fa7ab9ee',
    },
  },
  {
    path: "1852'/1815'/0'/2/1000001",
    expected: {
      publicKey:
        '1763dfbba10629d5e9ed8f8714889f82f0bdb4b62af22b19b607713919f93e4d',
      chainCode:
        'b46ecc1459e0ad4ae7fa1b9a7440584b6177472db300304a3191a91b7fb0e1e8',
    },
  },
]

export const testsColdKeys: TestCase[] = [
  {
    path: "1853'/1815'/0'/0'",
    expected: {
      publicKey:
        '3d7e84dca8b4bc322401a2cc814af7c84d2992a22f99554fe340d7df7910768d',
      chainCode:
        '1e2a47754207da3069f90241fbf3b8742c367e9028e5f3f85ae3660330b4f5b7',
    },
  },
]

export const testsCVoteKeys: TestCase[] = [
  {
    path: "1694'/1815'/0'/0/1",
    expected: {
      publicKey:
        'aac861247bd24cae705bca1d1c9763f19c19188fb0faf257c50ed69b8157bced',
      chainCode:
        'f23595dd3207b7dde477347fa25d3fd6291c3363df43b54a9cf523d2c7683c10',
    },
  },
  {
    path: "1694'/1815'/100'",
    expected: {
      publicKey:
        'ff451db773898b80488d892b248acdc634f6ec79d923f12aae9feb2563513b63',
      chainCode:
        '47478097ef56dcef686f8dcbd7d0c1d073740cde65a48e5615799096f67a144f',
    },
  },
  {
    path: "1694'/1815'/101'",
    expected: {
      publicKey:
        'c7adc69b6dd29c48d29edb089c1aecbe218fdb9cfa59c325afcd2c5fa3844be1',
      chainCode:
        'ffa9953f6c77fccc15c000db494177d84e218f2740ddd44cfcbea0455cc6a6be',
    },
  },
]
