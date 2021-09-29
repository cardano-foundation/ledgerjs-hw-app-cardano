import { DeviceVersionUnsupported } from "../errors"
import type { ParsedOperationalCertificate, Version } from "../types/internal"
import { ED25519_SIGNATURE_LENGTH } from "../types/internal"
import type { OperationalCertificateSignature } from '../types/public'
import { getVersionString } from "../utils"
import { INS } from "./common/ins"
import type { Interaction, SendParams } from "./common/types"
import { getCompatibility } from "./getVersion"
import { serializeOperationalCertificate } from "./serialization/operationalCertificate"

const send = (params: {
  p1: number,
  p2: number,
  data: Buffer,
  expectedResponseLength?: number
}): SendParams => ({ ins: INS.SIGN_OPERATIONAL_CERTIFICATE, ...params })

export function* signOperationalCertificate(
    version: Version,
    operationalCertificate: ParsedOperationalCertificate,
): Interaction<OperationalCertificateSignature> {
    if (!getCompatibility(version).supportsPoolRegistrationAsOperator) {
        throw new DeviceVersionUnsupported(`Operational certificate signing not supported by Ledger app version ${getVersionString(version)}.`)
    }

    const P1_UNUSED = 0x00
    const P2_UNUSED = 0x00

    const response = yield send({
        p1: P1_UNUSED,
        p2: P2_UNUSED,
        data: serializeOperationalCertificate(operationalCertificate),
        expectedResponseLength: ED25519_SIGNATURE_LENGTH,
    })

    return {
        signatureHex: response.toString("hex"),
    }
}
