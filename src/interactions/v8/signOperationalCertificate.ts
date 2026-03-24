import type {ParsedOperationalCertificate, Version} from '../../types/internal'
import type {OperationalCertificateSignature} from '../../types/public'
import type {Interaction} from '../common/types'
import {sendSignOperationalCertificate} from './commandSender'

export function* signOperationalCertificate(
  _version: Version,
  operationalCertificate: ParsedOperationalCertificate,
): Interaction<OperationalCertificateSignature> {
  const response = yield* sendSignOperationalCertificate(operationalCertificate)

  return {
    signatureHex: response.toString('hex'),
  }
}
