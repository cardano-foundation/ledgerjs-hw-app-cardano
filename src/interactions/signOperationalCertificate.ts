import type {ParsedOperationalCertificate, Version} from '../types/internal'
import type {OperationalCertificateSignature} from '../types/public'
import {ensureOperationalCertificateSigningSupported} from '../validation/requestCompatibility'
import type {Interaction} from './common/types'
import {isV8App} from './getVersion'
import {signOperationalCertificateV7} from './v7/signOperationalCertificate'
import {signOperationalCertificate as signOperationalCertificateV8} from './v8/signOperationalCertificate'

export function* signOperationalCertificate(
  version: Version,
  operationalCertificate: ParsedOperationalCertificate,
): Interaction<OperationalCertificateSignature> {
  ensureOperationalCertificateSigningSupported(version, operationalCertificate)

  if (isV8App(version)) {
    return yield* signOperationalCertificateV8(version, operationalCertificate)
  }

  return yield* signOperationalCertificateV7(version, operationalCertificate)
}
