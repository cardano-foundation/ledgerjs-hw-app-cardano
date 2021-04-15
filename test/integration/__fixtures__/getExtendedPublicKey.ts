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

export const testsShelley: TestCase[] = [
  // Shelley
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
    },
  },
];

export const testsShelleyUnusual: TestCase[] = [
  {
    path: "1852'/1815'/150'/0/10'",
    expected: {
      publicKey:
        "cfd898d89110dae7c762e77cf8f58b02ab0ac6cd142781c7bb6bbf62df0c53ac",
      chainCode:
        "964fd2c6038d5e5b1aef40b25ad673e8169b7a55ba29845c17e3c4df7af72cee",
    },
  },
]

export const testsColdKeys: TestCase[] = [
  {
    path: "1853'/1815'/0'/0'",
    expected: {
      publicKey:
        "3d7e84dca8b4bc322401a2cc814af7c84d2992a22f99554fe340d7df7910768d",
      chainCode:
        "1e2a47754207da3069f90241fbf3b8742c367e9028e5f3f85ae3660330b4f5b7",
    },
  },
]
