import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised"

import type { Ada } from "../../src/Ada";
import { AddressType, utils } from "../../src/Ada";
import type { AddressParams } from "../../src/types/public";
import {
  getAda,
  Networks,
  str_to_path,
} from "../test_utils";
import getPathDerivationFixture from "./__fixtures__/pathDerivations";
chai.use(chaiAsPromised)

describe("deriveAddress", async () => {
  let ada: Ada = {} as any;

  beforeEach(async () => {
    ada = await getAda();
  });

  afterEach(async () => {
    await (ada as any).t.close();
  });

  it("Should succesfully derive Byron address", async () => {
    const test = async (path: string, protocolMagic: number) => {
      const derivation = getPathDerivationFixture({
        path,
        protocolMagic,
      })!;

      const { addressHex } = await ada.deriveAddress({
        addressTypeNibble: AddressType.BYRON,
        networkIdOrProtocolMagic: protocolMagic,
        spendingPath: str_to_path(derivation.path)
      });

      expect(utils.base58_encode(utils.hex_to_buf(addressHex as any))).to.equal(
        derivation.address
      );
    };

    await test("44'/1815'/1'/0/12'", Networks.Mainnet.protocolMagic);
    await test("44'/1815'/1'/0/12'", Networks.Testnet.protocolMagic);

    // rejected by the present security policy, but we might want to return it in the future
    // await test("44'/1815'/1'/0/10'/1/2/3", ProtocolMagics.MAINNET);
  });

  it("Should succesfully derive Shelley address", async () => {
    const test = async (
      addressParams: AddressParams,
      expectedResult: string
    ) => {
      const { addressHex } = await ada.deriveAddress(addressParams)

      expect(utils.bech32_encodeAddress(utils.hex_to_buf(addressHex as any))).to.equal(
        expectedResult
      );
    };

    const Pointer = (blockIndex: number, txIndex: number, certificateIndex: number) => ({ blockIndex, txIndex, certificateIndex })
    const testcases: Array<[AddressParams, string]> = [
      // base
      [
        {
          addressTypeNibble: AddressType.BASE,
          networkIdOrProtocolMagic: 0x03,
          spendingPath: str_to_path("1852'/1815'/0'/0/1"),
          stakingPath: str_to_path("1852'/1815'/0'/2/0"),
          stakingKeyHashHex: null,
          stakingBlockchainPointer: null,
        },
        "addr1qdd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcayfawlf9hwv2fzuygt2km5v92kvf8e3s3mk7ynxw77cwqdquehe",
      ],
      [
        {
          addressTypeNibble: AddressType.BASE,
          networkIdOrProtocolMagic: 0x00,
          spendingPath: str_to_path("1852'/1815'/0'/0/1"),
          stakingPath: str_to_path("1852'/1815'/0'/2/0"),
          stakingKeyHashHex: null,
          stakingBlockchainPointer: null,
        },
        "addr_test1qpd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcayfawlf9hwv2fzuygt2km5v92kvf8e3s3mk7ynxw77cwq9nnhk4",
      ],
      [
        {
          addressTypeNibble: AddressType.BASE,
          networkIdOrProtocolMagic: 0x00,
          spendingPath: str_to_path("1852'/1815'/0'/0/1"),
          stakingPath: null,
          stakingKeyHashHex:
            "1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c",
          stakingBlockchainPointer: null,
        },
        "addr_test1qpd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcayfawlf9hwv2fzuygt2km5v92kvf8e3s3mk7ynxw77cwq9nnhk4",
      ],
      [
        {
          addressTypeNibble: AddressType.BASE,
          networkIdOrProtocolMagic: 0x03,
          spendingPath: str_to_path("1852'/1815'/0'/0/1"),
          stakingPath: null,
          stakingKeyHashHex:
            "122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277",
          stakingBlockchainPointer: null,
        },
        "addr1qdd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcj922xhxkn6twlq2wn4q50q352annk3903tj00h45mgfmswz93l5",
      ],
      // enterprise
      [
        {
          addressTypeNibble: AddressType.ENTERPRISE,
          networkIdOrProtocolMagic: 0x00,
          spendingPath: str_to_path("1852'/1815'/0'/0/1"),
          stakingPath: null,
          stakingKeyHashHex: null,
          stakingBlockchainPointer: null,
        },
        "addr_test1vpd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vc7t2fks",
      ],
      [
        {
          addressTypeNibble: AddressType.ENTERPRISE,
          networkIdOrProtocolMagic: 0x03,
          spendingPath: str_to_path("1852'/1815'/0'/0/1"),
          stakingPath: null,
          stakingKeyHashHex: null,
          stakingBlockchainPointer: null,
        },
        "addr1vdd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vc9wh7em",
      ],
      // pointer
      [
        {
          addressTypeNibble: AddressType.POINTER,
          networkIdOrProtocolMagic: 0x00,
          spendingPath: str_to_path("1852'/1815'/0'/0/1"),
          stakingPath: null,
          stakingKeyHashHex: null,
          stakingBlockchainPointer: Pointer(1, 2, 3),
        },
        "addr_test1gpd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcpqgpsg6s2p6",
      ],
      [
        {
          addressTypeNibble: AddressType.POINTER,
          networkIdOrProtocolMagic: 0x03,
          spendingPath: str_to_path("1852'/1815'/0'/0/1"),
          stakingPath: null,
          stakingKeyHashHex: null,
          stakingBlockchainPointer: Pointer(24157, 177, 42),
        },
        "addr1gdd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vuph3wczvf288aeyu",
      ],
      [
        {
          addressTypeNibble: AddressType.POINTER,
          networkIdOrProtocolMagic: 0x03,
          spendingPath: str_to_path("1852'/1815'/0'/0/1"),
          stakingPath: null,
          stakingKeyHashHex: null,
          stakingBlockchainPointer: Pointer(0, 0, 0),
        },
        "addr1gdd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcqqqqqnnd32q",
      ],
      // reward
      [
        {
          addressTypeNibble: AddressType.REWARD,
          networkIdOrProtocolMagic: 0x00,
          spendingPath: str_to_path("1852'/1815'/0'/2/0"),
          stakingPath: null,
          stakingKeyHashHex: null,
          stakingBlockchainPointer: null,
        },
        "stake_test1uqwjy7h05jmhx9y3wzy94td6xz4txynuccgam0zfn800v8q8mmqwc",
      ],
      [
        {
          addressTypeNibble: AddressType.REWARD,
          networkIdOrProtocolMagic: 0x03,
          spendingPath: str_to_path("1852'/1815'/0'/2/0"),
          stakingPath: null,
          stakingKeyHashHex: null,
          stakingBlockchainPointer: null,
        },
        "stake1uvwjy7h05jmhx9y3wzy94td6xz4txynuccgam0zfn800v8qqucf2t",
      ],
    ];

    for (const [args, expected] of testcases) {
      await test(args, expected);
    }
  }).timeout(60000);

  it("Should not permit invalid path", async () => {
    const test = async (path: string) => {
      const promise = ada.deriveAddress({
        addressTypeNibble: AddressType.BYRON,
        networkIdOrProtocolMagic: 0, //TODO: BYRON_PROTOCOL_MAGIC,
        spendingPath: str_to_path(path)
      })
      await expect(promise).to.be.rejectedWith("Ledger device: Action rejected by Ledger's security policy");
    };

    await test("44'/1815'/1'");
    await test("44'/1815'/1'/5/10'/1/2/3");
  });
});
