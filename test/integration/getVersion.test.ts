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
    const response = await ada.getVersion();

    expect(response.major).to.equal(2);
    expect(response.minor).to.equal(2);
  });
});
