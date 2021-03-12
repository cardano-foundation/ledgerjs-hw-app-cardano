import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised"

import type { Ada } from "../../src/Ada";
import { AddressType, DeviceStatusError, utils } from "../../src/Ada";
import { str_to_path } from "../../src/utils/address";
import { getAda, Networks, } from "../test_utils";
import { byronTestcases, shelleyTestcases } from "./__fixtures__/deriveAddress";

chai.use(chaiAsPromised)


const address_hex_to_base58 = (addressHex: string) => utils.base58_encode(utils.hex_to_buf(addressHex as any))

describe("deriveAddress", async () => {
  let ada: Ada = {} as any;

  beforeEach(async () => {
    ada = await getAda();
  });

  afterEach(async () => {
    await (ada as any).t.close();
  });

  describe("Should succesfully derive Byron address", async () => {
    for (const { network, path, address: expected } of byronTestcases) {
      it(path, async () => {
        const { addressHex } = await ada.deriveAddress({
          network,
          address: {
            type: AddressType.BYRON,
            params: {
              spendingPath: str_to_path(path)
            }
          }
        });

        expect(address_hex_to_base58(addressHex)).to.equal(expected);
      })
    }
  });

  describe("Should succesfully derive Shelley address", async () => {
    for (const [testname, testcases] of Object.entries(shelleyTestcases)) {
      it(testname, async () => {
        for (const [network, addressParams, expectedResult] of testcases) {
          const { addressHex } = await ada.deriveAddress({ network, address: addressParams })

          expect(utils.bech32_encodeAddress(utils.hex_to_buf(addressHex as any))).to.equal(
            expectedResult
          );
        }
      })
    }
  }).timeout(60000);

  describe("Should not permit invalid path", async () => {
    const invalidPaths = ["44'/1815'/1'", "44'/1815'/1'/5/10'/1/2/3"]
    for (const path of invalidPaths) {
      it(path, async () => {
        const promise = ada.deriveAddress({
          network: Networks.Fake,
          address: {
            type: AddressType.BYRON,
            params: {
              spendingPath: str_to_path(path)
            }
          }
        })
        await expect(promise).to.be.rejectedWith(DeviceStatusError, "Action rejected by Ledger's security policy");
      })
    }
  });
});
