import { str_to_path } from "../../../src/utils/address"
import type { OperationalCertificate, OperationalCertificateSignature } from "../../../src/Ada"

export type TestCase = {
  testName: string;
  operationalCertificate: OperationalCertificate;
  expected: OperationalCertificateSignature;
}

export const tests: TestCase[] = [
    {
        testName: "Should correctly sign a basic operational certificate",
        operationalCertificate: {
            kesPublicKeyHex: "3d24bc547388cf2403fd978fc3d3a93d1f39acf68a9c00e40512084dc05f2822",
            kesPeriod: "47",
            issueCounter: "42",
            coldKeyPath: str_to_path("1853'/1815'/0'/0'"),
        },
        expected: {
            signatureHex: "ce8d7cab55217ed17f1cceb8cb487dcbe6172fdb5794cc26f78c2f1d2495598e72beb6209f113562f9488ef6e81e3e8f758ea072c3cf9c17095868f2e9213f0a",
        },
    },
]
