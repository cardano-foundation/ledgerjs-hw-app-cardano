import {DeviceVersionUnsupported} from '../errors'
import type {ParsedOperationalCertificate, Version} from '../types/internal'
import type {OperationalCertificateSignature} from '../types/public'
import {getVersionString} from '../utils'
import type {Interaction} from './common/types'
import {getCompatibility, isV8App} from './getVersion'
import {signOperationalCertificateV7} from './v7/signOperationalCertificate'
import {signOperationalCertificate as signOperationalCertificateV8} from './v8/signOperationalCertificate'

export function* signOperationalCertificate(
  version: Version,
  operationalCertificate: ParsedOperationalCertificate,
): Interaction<OperationalCertificateSignature> {
  if (
    !isV8App(version) &&
    !getCompatibility(version).supportsPoolRegistrationAsOperator
  ) {
    throw new DeviceVersionUnsupported(
      `Operational certificate signing not supported by Ledger app version ${getVersionString(
        version,
      )}.`,
    )
  }

  if (isV8App(version)) {
    return yield* signOperationalCertificateV8(version, operationalCertificate)
  }

  return yield* signOperationalCertificateV7(version, operationalCertificate)
}
