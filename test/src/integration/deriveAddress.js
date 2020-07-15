import { expect } from "chai";
import pathDerivations from "./__fixtures__/pathDerivations";

import { getAda, str_to_path, hex_to_buf } from "../test_utils";
import { AddressTypeNibbles } from "../../../lib/Ada";

const BYRON_PROTOCOL_MAGIC = 764824073;

describe("deriveAddress", async () => {
  let ada = {};

  beforeEach(async () => {
    ada = await getAda();
  });

  afterEach(async () => {
    await ada.t.close();
  });

  it("Should succesfully derive Byron address", async () => {
    const test = async path => {
      const derivation = pathDerivations[path];

      const result = await ada.deriveAddress(0b1000, BYRON_PROTOCOL_MAGIC, str_to_path(derivation.path));

      expect(result.humanAddress).to.equal(derivation.address);
    };

   await test("44'/1815'/1'/0/12'");
   await test("44'/1815'/1'/0/10'/1/2/3");
  });

  it("Should succesfully derive Shelley address", async () => {
    const test = async (
      addressTypeNibble,
      networkIdOrProtocolMagic,
      spendingPathStr,
      stakingPathStr,
      stakingKeyHashHex,
      stakingBlockchainPointer,
      expectedResult
    ) => {
      const spendingPath: BIP32Path = str_to_path(spendingPathStr);
      const stakingPath: ?BIP32Path = (stakingPathStr !== null) ? str_to_path(stakingPathStr) : null;

      const result = await ada.deriveAddress(
        addressTypeNibble,
        networkIdOrProtocolMagic,
        spendingPath,
        stakingPath,
        stakingKeyHashHex,
        stakingBlockchainPointer
        ? {
          blockIndex: stakingBlockchainPointer[0],
          txIndex: stakingBlockchainPointer[1],
          certificateIndex: stakingBlockchainPointer[2]
        }
        : null
      );

      expect(result.humanAddress).to.equal(expectedResult);
    };

    // base
    await test(AddressTypeNibbles.BYRON, 0x03, "1852'/1815'/0'/0/1", "1852'/1815'/0'/2/0", null, null,
        "addr1qdd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcayfawlf9hwv2fzuygt2km5v92kvf8e3s3mk7ynxw77cwqdquehe");
    await test(AddressTypeNibbles.BYRON, 0x00, "1852'/1815'/0'/0/1", "1852'/1815'/0'/2/0", null, null,
        "addr1qpd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcayfawlf9hwv2fzuygt2km5v92kvf8e3s3mk7ynxw77cwqhn8sgh");
    await test(AddressTypeNibbles.BYRON, 0x00, "1852'/1815'/0'/0/1", null, "1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c", null,
        "addr1qpd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcayfawlf9hwv2fzuygt2km5v92kvf8e3s3mk7ynxw77cwqhn8sgh");
    await test(AddressTypeNibbles.BYRON, 0x03, "1852'/1815'/0'/0/1", null, "122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277", null,
        "addr1qdd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcj922xhxkn6twlq2wn4q50q352annk3903tj00h45mgfmswz93l5");

    // enterprise
    await test(AddressTypeNibbles.ENTERPRISE, 0x00, "1852'/1815'/0'/0/1", null, null, null,
        "addr1vpd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vc93wyej");
    await test(AddressTypeNibbles.ENTERPRISE, 0x03, "1852'/1815'/0'/0/1", null, null, null,
        "addr1vdd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vc9wh7em");

    // pointer
    await test(AddressTypeNibbles.POINTER, 0x00, "1852'/1815'/0'/0/1", null, null, [1, 2, 3],
        "addr1gpd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcpqgpsh506pr");
    await test(AddressTypeNibbles.POINTER, 0x03, "1852'/1815'/0'/0/1", null, null, [24157, 177, 42],
        "addr1gdd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vuph3wczvf288aeyu");
    await test(AddressTypeNibbles.POINTER, 0x03, "1852'/1815'/0'/0/1", null, null, [0, 0, 0],
        "addr1gdd9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcqqqqqnnd32q");

        // TODO add more, reward addresses at least
  }).timeout(60000);

  it("Should not permit invalid path", async () => {
    const test = async path => {
      const SHOULD_HAVE_THROWN = "should have thrown earlier";
      try {
        await ada.deriveAddress(AddressTypeNibbles.BYRON, BYRON_PROTOCOL_MAGIC, str_to_path(path));

        throw new Error(SHOULD_HAVE_THROWN);
      } catch (error) {
        expect(error.message).not.to.have.string(SHOULD_HAVE_THROWN);
      }
    };

    await test("44'/1815'/1'");
    await test("44'/1815'/1'/5/10'/1/2/3");
  });
});
