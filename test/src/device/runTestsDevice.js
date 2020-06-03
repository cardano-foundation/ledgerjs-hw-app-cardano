import { getAda } from "../utils";

describe("runTestsDevice", async () => {
  let ada = {};

  beforeEach(async () => {
    ada = await getAda();
  });

  afterEach(async () => {
    await ada.t.close();
  });

  it("Should run device tests", async () => {
    await ada.runTests();
  });
});
