import { getAda } from "../test_utils";
import { expect } from "chai";

describe("getSerial", async () => {
  let ada = {};

  beforeEach(async () => {
    ada = await getAda();
  });

  afterEach(async () => {
    await ada.t.close();
  });

  it("Should correctly get the serial number of the device", async () => {
    const response = await ada.getSerial();
    expect(response.serial.length).to.equal(14);
  });
});
