import { expect } from "chai";

import type Ada from "../../src/Ada";
import { getAda } from "../test_utils";

describe("getVersion", async () => {
  let ada: Ada = {} as Ada;

  beforeEach(async () => {
    ada = await getAda();
  });

  afterEach(async () => {
    await (ada as any).t.close();
  });

  it("Should correctly get the semantic version of device", async () => {
    const { version, compatibility } = await ada.getVersion();

    expect(version.major).to.equal(2);
    expect(version.minor).to.equal(2);
    expect(compatibility).to.deep.equal({
      isCompatible: true,
      recommendedVersion: null,
      supportsMary: true,
    })
  });
});
