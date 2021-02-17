import { expect } from "chai";

import type Ada from "../../src/Ada";
import { AddressTypeNibble, utils } from "../../src/Ada";
import {
  getAda,
  ProtocolMagics,
  str_to_path,
} from "../test_utils";
import getPathDerivationFixture from "./__fixtures__/pathDerivations";

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

      const { addressHex } = await ada.deriveAddress(
        0b1000,
        protocolMagic,
        str_to_path(derivation.path)
      );

      expect(utils.base58_encode(utils.hex_to_buf(addressHex))).to.equal(
        derivation.address
      );
    };

    await test("44'/1815'/1'/0/12'", ProtocolMagics.MAINNET);
    await test("44'/1815'/1'/0/12'", ProtocolMagics.TESTNET);

    // rejected by the present security policy, but we might want to return it in the future
    // await test("44'/1815'/1'/0/10'/1/2/3", ProtocolMagics.MAINNET);
  });

  it("Should succesfully derive Shelley address", async () => {
    const test = async (
      {
        addressTypeNibble,
        networkIdOrProtocolMagic,
        spendingPathStr,
        stakingPathStr,
        stakingKeyHashHex,
        stakingBlockchainPointer,
      }: any,
      expectedResult: string
    ) => {
      const spendingPath = str_to_path(spendingPathStr);
      const stakingPath =
        stakingPathStr !== null ? str_to_path(stakingPathStr) : null;

      const { addressHex } = await ada.deriveAddress(
        addressTypeNibble,
        networkIdOrProtocolMagic,
        spendingPath,
        stakingPath,
        stakingKeyHashHex,
        stakingBlockchainPointer
          ? {
            blockIndex: stakingBlockchainPointer[0],
            txIndex: stakingBlockchainPointer[1],
            certificateIndex: stakingBlockchainPointer[2],
          }
          : null
      );

      expect(utils.bech32_encodeAddress(utils.hex_to_buf(addressHex))).to.equal(
        expectedResult
      );
    };

    const testcases = [
      // base
      [
        {
          addressTypeNibble: AddressTypeNibble.BASE,
          networkIdOrProtocolMagic: 0x03,
          spendingPathStr: "1852'/1815'/0'/0/1",
          stakingPathStr: "1852'/1815'/0'/2/0",
          stakingKeyHashHex: null,
          stakingBlockchainPointer: null,
        },
        "addr1qdd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcayfawlf9hwv2fzuygt2km5v92kvf8e3s3mk7ynxw77cwqdquehe",
      ],
      [
        {
          addressTypeNibble: AddressTypeNibble.BASE,
          networkIdOrProtocolMagic: 0x00,
          spendingPathStr: "1852'/1815'/0'/0/1",
          stakingPathStr: "1852'/1815'/0'/2/0",
          stakingKeyHashHex: null,
          stakingBlockchainPointer: null,
        },
        "addr_test1qpd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcayfawlf9hwv2fzuygt2km5v92kvf8e3s3mk7ynxw77cwq9nnhk4",
      ],
      [
        {
          addressTypeNibble: AddressTypeNibble.BASE,
          networkIdOrProtocolMagic: 0x00,
          spendingPathStr: "1852'/1815'/0'/0/1",
          stakingPathStr: null,
          stakingKeyHashHex:
            "1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c",
          stakingBlockchainPointer: null,
        },
        "addr_test1qpd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcayfawlf9hwv2fzuygt2km5v92kvf8e3s3mk7ynxw77cwq9nnhk4",
      ],
      [
        {
          addressTypeNibble: AddressTypeNibble.BASE,
          networkIdOrProtocolMagic: 0x03,
          spendingPathStr: "1852'/1815'/0'/0/1",
          stakingPathStr: null,
          stakingKeyHashHex:
            "122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277",
          stakingBlockchainPointer: null,
        },
        "addr1qdd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcj922xhxkn6twlq2wn4q50q352annk3903tj00h45mgfmswz93l5",
      ],
      // enterprise
      [
        {
          addressTypeNibble: AddressTypeNibble.ENTERPRISE,
          networkIdOrProtocolMagic: 0x00,
          spendingPathStr: "1852'/1815'/0'/0/1",
          stakingPathStr: null,
          stakingKeyHashHex: null,
          stakingBlockchainPointer: null,
        },
        "addr_test1vpd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vc7t2fks",
      ],
      [
        {
          addressTypeNibble: AddressTypeNibble.ENTERPRISE,
          networkIdOrProtocolMagic: 0x03,
          spendingPathStr: "1852'/1815'/0'/0/1",
          stakingPathStr: null,
          stakingKeyHashHex: null,
          stakingBlockchainPointer: null,
        },
        "addr1vdd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vc9wh7em",
      ],
      // pointer
      [
        {
          addressTypeNibble: AddressTypeNibble.POINTER,
          networkIdOrProtocolMagic: 0x00,
          spendingPathStr: "1852'/1815'/0'/0/1",
          stakingPathStr: null,
          stakingKeyHashHex: null,
          stakingBlockchainPointer: [1, 2, 3],
        },
        "addr_test1gpd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcpqgpsg6s2p6",
      ],
      [
        {
          addressTypeNibble: AddressTypeNibble.POINTER,
          networkIdOrProtocolMagic: 0x03,
          spendingPathStr: "1852'/1815'/0'/0/1",
          stakingPathStr: null,
          stakingKeyHashHex: null,
          stakingBlockchainPointer: [24157, 177, 42],
        },
        "addr1gdd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vuph3wczvf288aeyu",
      ],
      [
        {
          addressTypeNibble: AddressTypeNibble.POINTER,
          networkIdOrProtocolMagic: 0x03,
          spendingPathStr: "1852'/1815'/0'/0/1",
          stakingPathStr: null,
          stakingKeyHashHex: null,
          stakingBlockchainPointer: [0, 0, 0],
        },
        "addr1gdd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcqqqqqnnd32q",
      ],
      // reward
      [
        {
          addressTypeNibble: AddressTypeNibble.REWARD,
          networkIdOrProtocolMagic: 0x00,
          spendingPathStr: "1852'/1815'/0'/2/0",
          stakingPathStr: null,
          stakingKeyHashHex: null,
          stakingBlockchainPointer: null,
        },
        "stake_test1uqwjy7h05jmhx9y3wzy94td6xz4txynuccgam0zfn800v8q8mmqwc",
      ],
      [
        {
          addressTypeNibble: AddressTypeNibble.REWARD,
          networkIdOrProtocolMagic: 0x03,
          spendingPathStr: "1852'/1815'/0'/2/0",
          stakingPathStr: null,
          stakingKeyHashHex: null,
          stakingBlockchainPointer: null,
        },
        "stake1uvwjy7h05jmhx9y3wzy94td6xz4txynuccgam0zfn800v8qqucf2t",
      ],
    ] as const;

    for (const [args, expected] of testcases) {
      await test(args, expected);
    }
  }).timeout(60000);

  it("Should not permit invalid path", async () => {
    const test = async (path: string) => {
      const SHOULD_HAVE_THROWN = "should have thrown earlier";
      try {
        await ada.deriveAddress(
          AddressTypeNibble.BYRON,
          0, //TODO: BYRON_PROTOCOL_MAGIC,
          str_to_path(path)
        );

        throw new Error(SHOULD_HAVE_THROWN);
      } catch (error) {
        expect(error.message).not.to.have.string(SHOULD_HAVE_THROWN);
      }
    };

    await test("44'/1815'/1'");
    await test("44'/1815'/1'/5/10'/1/2/3");
  });
});
