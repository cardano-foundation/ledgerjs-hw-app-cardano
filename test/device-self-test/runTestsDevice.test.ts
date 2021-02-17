import type Ada from "../../src/Ada";
import { getAda } from "../test_utils";

describe("runTestsDevice", async () => {
  let ada: Ada = {} as Ada;

  beforeEach(async () => {
    ada = await getAda();
  });

  afterEach(async () => {
    await (ada as any).t.close();
  });

  it("Should run device tests", async () => {
    await ada.runTests();
  });
});
