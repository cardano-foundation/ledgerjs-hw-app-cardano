import type {ParsedOperationalCertificate} from '../../../../src/types/internal'

export const parsedOperationalCertificateFixture = {
  kesPublicKeyHex:
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  kesPeriod: '3',
  issueCounter: '7',
  coldKeyPath: [2147485500, 2147485463, 2147483648, 0, 0],
} as ParsedOperationalCertificate

export const expectedSignOperationalCertificateApduHex =
  'd722000045' +
  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' +
  '0000000000000003' +
  '0000000000000007' +
  '058000073c80000717800000000000000000000000'
