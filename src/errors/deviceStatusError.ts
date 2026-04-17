import {ErrorBase} from './errorBase'

const StatusWordV7 = {
  ERR_STILL_IN_CALL: 0x6e04 as const, // internal
  ERR_INVALID_DATA: 0x6e07 as const,
  ERR_INVALID_BIP_PATH: 0x6e08 as const,
  ERR_REJECTED_BY_USER: 0x6e09 as const,
  ERR_REJECTED_BY_POLICY: 0x6e10 as const,
  ERR_DEVICE_LOCKED: 0x6e11 as const,
  ERR_UNSUPPORTED_ADDRESS_TYPE: 0x6e12 as const,

  // Not thrown by ledger-app-cardano itself but other apps
  ERR_CLA_NOT_SUPPORTED: 0x6e00 as const,
}

const StatusWordV8 = {
  SWO_SECURITY_CONDITION_NOT_SATISFIED: 0x6982 as const,
  SWO_TX_PARSING_FAIL_CANONICAL_ORDER: 0x6b3b as const,
  SWO_TX_PARSING_FAIL_MINT: 0x6b29 as const,
  SWO_TX_PARSING_FAIL_WITHDRAWALS: 0x6b25 as const,
  SWO_INVALID_PROTOCOL_MAGIC: 0x6b38 as const,
  SWO_INVALID_NETWORK_ID: 0x6b37 as const,
}

const StatusWordMsgV7: Record<number, string> = {
  [StatusWordV7.ERR_INVALID_DATA]: 'Invalid data supplied to Ledger',
  [StatusWordV7.ERR_INVALID_BIP_PATH]:
    'Invalid derivation path supplied to Ledger',
  [StatusWordV7.ERR_REJECTED_BY_USER]: 'Action rejected by user',
  [StatusWordV7.ERR_REJECTED_BY_POLICY]:
    "Action rejected by Ledger's security policy",
  [StatusWordV7.ERR_DEVICE_LOCKED]: 'Device is locked',
  [StatusWordV7.ERR_CLA_NOT_SUPPORTED]: 'Wrong Ledger app',
  [StatusWordV7.ERR_UNSUPPORTED_ADDRESS_TYPE]: 'Unsupported address type',
}

const StatusWordMsgV8: Record<number, string> = {
  [StatusWordV8.SWO_SECURITY_CONDITION_NOT_SATISFIED]:
    'Security condition not satisfied. Please consult Ledger documentation.',
  [StatusWordV8.SWO_TX_PARSING_FAIL_CANONICAL_ORDER]:
    'Transaction parsing failed due to invalid canonical ordering.',
  [StatusWordV8.SWO_TX_PARSING_FAIL_MINT]:
    'Transaction parsing failed due to invalid mint field.',
  [StatusWordV8.SWO_TX_PARSING_FAIL_WITHDRAWALS]:
    'Transaction parsing failed due to invalid withdrawals field.',
  [StatusWordV8.SWO_INVALID_PROTOCOL_MAGIC]: 'Invalid protocol magic.',
  [StatusWordV8.SWO_INVALID_NETWORK_ID]: 'Invalid network id.',
}

// Kept for backwards compatibility
export const DeviceStatusMessages: Record<number, string> = {
  ...StatusWordMsgV7,
  ...StatusWordMsgV8,
}

export {StatusWordV7, StatusWordV8, StatusWordMsgV7, StatusWordMsgV8}

const GH_DEVICE_ERRORS_LINK =
  'https://github.com/cardano-foundation/ledger-app-cardano/blob/master/src/errors.h'

const getDeviceErrorDescription = (statusCode: number) => {
  const statusCodeHex = `0x${statusCode.toString(16)}`
  const defaultMsg = `General error ${statusCodeHex}. Please consult ${GH_DEVICE_ERRORS_LINK}`

  return DeviceStatusMessages[statusCode] ?? defaultMsg
}

/**
 * Error wrapping APDU device error codes with human-readable message.
 * Use [[code]] for accessing underlying status code.
 * @category Errors
 */
export class DeviceStatusError extends ErrorBase {
  public code: number

  public constructor(code: number) {
    super(getDeviceErrorDescription(code))
    this.code = code
  }
}
