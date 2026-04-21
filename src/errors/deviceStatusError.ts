import {ErrorBase} from './errorBase'

const StatusWordV7 = {
  // Stale-call recovery, used by both v7 (ERR_STILL_IN_CALL) and v8
  // (SWO_STILL_IN_CALL_RESET_DONE). Same value, same contract: device has reset
  // to idle and the host may retry the first APDU of a multi-APDU exchange once.
  // Consumed by wrapRetryStillInCall() in Ada.ts.
  ERR_STILL_IN_CALL: 0x6e04 as const, // internal
  ERR_INVALID_DATA: 0x6e07 as const,
  ERR_INVALID_BIP_PATH: 0x6e08 as const,
  ERR_REJECTED_BY_USER: 0x6e09 as const,
  // v7 status words intentionally continue at 0x6e10; the device app uses
  // decimal-like numbering here (see app-cardano/common.h).
  ERR_REJECTED_BY_POLICY: 0x6e10 as const,
  ERR_DEVICE_LOCKED: 0x6e11 as const,
  ERR_UNSUPPORTED_ADDRESS_TYPE: 0x6e12 as const,

  // Not thrown by ledger-app-cardano itself but other apps
  ERR_CLA_NOT_SUPPORTED: 0x6e00 as const,
}

const StatusWordV8 = {
  // Stale-call recovery used by ledger-app-cardano v8. Same value and retry
  // contract as v7 ERR_STILL_IN_CALL.
  SWO_STILL_IN_CALL_RESET_DONE: 0x6e04 as const,

  SWO_SECURITY_CONDITION_NOT_SATISFIED: 0x6982 as const,

  // TX structure
  SWO_INVALID_TX_LENGTH: 0x6b00 as const,
  SWO_TX_PARSING_FAIL: 0x6b01 as const,
  SWO_WRONG_TX_INIT_APDU_DATA: 0x6b02 as const,
  SWO_INVALID_TX_SIGNING_MODE: 0x6b3c as const,
  SWO_AMBIGUOUS_TX_SIGNING_MODE: 0x6b3d as const,

  // BIP44 / address derivation
  SWO_BIP44_PATH_PARSING_FAIL: 0x6b05 as const,
  SWO_DERIVE_ADDRESS_PARSING_FAIL_ADDRESS_PARAMS: 0x6b06 as const,

  // Operational certificate
  SWO_OPCERT_PARSING_FAIL_KES_KEY: 0x6b10 as const,
  SWO_OPCERT_PARSING_FAIL_KES_PERIOD: 0x6b11 as const,
  SWO_OPCERT_PARSING_FAIL_ISSUE_COUNTER: 0x6b12 as const,
  SWO_OPCERT_PARSING_FAIL_POOL_KEY_PATH: 0x6b13 as const,
  SWO_INVALID_OPCERT_LENGTH: 0x6b14 as const,

  // Transaction body fields (CBOR key = low byte - 0x20)
  SWO_TX_PARSING_FAIL_INPUTS: 0x6b20 as const, // key 0
  SWO_TX_PARSING_FAIL_OUTPUTS: 0x6b21 as const, // key 1
  SWO_TX_PARSING_FAIL_FEE: 0x6b22 as const, // key 2
  SWO_TX_PARSING_FAIL_TTL: 0x6b23 as const, // key 3
  SWO_TX_PARSING_FAIL_CERTIFICATES: 0x6b24 as const, // key 4
  SWO_TX_PARSING_FAIL_WITHDRAWALS: 0x6b25 as const, // key 5
  SWO_TX_PARSING_FAIL_VALIDITY_INTERVAL_START: 0x6b28 as const, // key 8
  SWO_TX_PARSING_FAIL_MINT: 0x6b29 as const, // key 9
  SWO_TX_PARSING_FAIL_SCRIPT_DATA_HASH: 0x6b2b as const, // key 11
  SWO_TX_PARSING_FAIL_COLLATERAL_INPUTS: 0x6b2d as const, // key 13
  SWO_TX_PARSING_FAIL_REQUIRED_SIGNERS: 0x6b2e as const, // key 14
  SWO_TX_PARSING_FAIL_COLLATERAL_OUTPUT: 0x6b30 as const, // key 16
  SWO_TX_PARSING_FAIL_TOTAL_COLLATERAL: 0x6b31 as const, // key 17
  SWO_TX_PARSING_FAIL_REFERENCE_INPUTS: 0x6b32 as const, // key 18
  SWO_TX_PARSING_FAIL_VOTING_PROCEDURES: 0x6b33 as const, // key 19
  SWO_TX_PARSING_FAIL_TREASURY: 0x6b35 as const, // key 21
  SWO_TX_PARSING_FAIL_DONATION: 0x6b36 as const, // key 22

  // Network/protocol validation
  SWO_INVALID_NETWORK_ID: 0x6b37 as const,
  SWO_INVALID_PROTOCOL_MAGIC: 0x6b38 as const,

  // TX structure (continued)
  SWO_TX_PARSING_FAIL_INCLUSION_FLAG: 0x6b39 as const,
  SWO_TX_PARSING_FAIL_BUFFER_NOT_FULLY_CONSUMED: 0x6b3a as const,
  SWO_TX_PARSING_FAIL_CANONICAL_ORDER: 0x6b3b as const,

  // Native script parsing
  SWO_NATIVE_SCRIPT_PARSING_FAIL_PUBKEY_CREDENTIAL: 0x6b41 as const,
  SWO_NATIVE_SCRIPT_PARSING_FAIL_SCRIPT_TYPE: 0x6b42 as const,
  SWO_NATIVE_SCRIPT_PARSING_FAIL_NESTING: 0x6b43 as const,
  SWO_NATIVE_SCRIPT_PARSING_FAIL_TIMELOCK: 0x6b44 as const,
  SWO_NATIVE_SCRIPT_PARSING_FAIL_DEPTH_UNSUPPORTED: 0x6b45 as const,
  SWO_NATIVE_SCRIPT_PARSING_FAIL_SCRIPT_COUNT: 0x6b46 as const,
  SWO_NATIVE_SCRIPT_PARSING_FAIL_DISPLAY_FORMAT: 0x6b47 as const,

  // CVote aux data / vote cast parsing
  SWO_CVOTE_AUX_DATA_PARSING_FAIL: 0x6b50 as const,
  SWO_CVOTE_PARSING_FAIL_VOTE_PLAN_ID: 0x6b51 as const,
  SWO_CVOTE_PARSING_FAIL_PROPOSAL_INDEX: 0x6b52 as const,
  SWO_CVOTE_PARSING_FAIL_PAYLOAD_TYPE_TAG: 0x6b53 as const,
  SWO_CVOTE_PARSING_FAIL_REMAINING_VOTECAST_BYTES: 0x6b54 as const,

  // Message signing (CIP-8)
  SWO_SIGN_MSG_PARSING_FAIL_MSG_LENGTH: 0x6b60 as const,
  SWO_SIGN_MSG_PARSING_FAIL_SIGNING_PATH: 0x6b61 as const,
  SWO_SIGN_MSG_PARSING_FAIL_HASH_PAYLOAD: 0x6b62 as const,
  SWO_SIGN_MSG_PARSING_FAIL_IS_ASCII: 0x6b63 as const,
  SWO_SIGN_MSG_PARSING_FAIL_ADDRESS_FIELD_TYPE: 0x6b64 as const,
  SWO_SIGN_MSG_PARSING_FAIL_ADDRESS_PARAMS: 0x6b65 as const,
  SWO_SIGN_MSG_PARSING_FAIL_CHUNK_SIZE: 0x6b66 as const,
  SWO_SIGN_MSG_PARSING_FAIL_CHUNK_DATA: 0x6b67 as const,
  SWO_SIGN_MSG_INVALID_CHUNK_SIZE: 0x6b68 as const,
  SWO_SIGN_MSG_INVALID_ASCII: 0x6b69 as const,
  SWO_SIGN_MSG_INVALID_ADDRESS_FIELD_TYPE: 0x6b6a as const,
  SWO_SIGN_MSG_CONFIRM_MUST_BE_EMPTY: 0x6b6b as const,

  // Swap validation
  SWO_SWAP_CHECKING_FAIL: 0x6001 as const,
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
    'Security condition not satisfied.',

  // TX structure
  [StatusWordV8.SWO_INVALID_TX_LENGTH]:
    'Transaction parsing failed: invalid length.',
  [StatusWordV8.SWO_TX_PARSING_FAIL]: 'Transaction parsing failed.',
  [StatusWordV8.SWO_WRONG_TX_INIT_APDU_DATA]:
    'Transaction parsing failed: malformed init APDU.',
  [StatusWordV8.SWO_INVALID_TX_SIGNING_MODE]:
    'Transaction parsing failed: unknown signing mode.',
  [StatusWordV8.SWO_AMBIGUOUS_TX_SIGNING_MODE]:
    'Transaction parsing failed: signing mode is ambiguous.',

  // BIP44 / address derivation
  [StatusWordV8.SWO_BIP44_PATH_PARSING_FAIL]: 'BIP44 path parsing failed.',
  [StatusWordV8.SWO_DERIVE_ADDRESS_PARSING_FAIL_ADDRESS_PARAMS]:
    'Address derivation failed: invalid address parameters.',

  // Operational certificate
  [StatusWordV8.SWO_OPCERT_PARSING_FAIL_KES_KEY]:
    'Operational certificate parsing failed: invalid KES key.',
  [StatusWordV8.SWO_OPCERT_PARSING_FAIL_KES_PERIOD]:
    'Operational certificate parsing failed: invalid KES period.',
  [StatusWordV8.SWO_OPCERT_PARSING_FAIL_ISSUE_COUNTER]:
    'Operational certificate parsing failed: invalid issue counter.',
  [StatusWordV8.SWO_OPCERT_PARSING_FAIL_POOL_KEY_PATH]:
    'Operational certificate parsing failed: invalid pool key path.',
  [StatusWordV8.SWO_INVALID_OPCERT_LENGTH]:
    'Operational certificate parsing failed: invalid length.',

  // Transaction body fields
  [StatusWordV8.SWO_TX_PARSING_FAIL_INPUTS]:
    'Transaction parsing failed: invalid inputs.',
  [StatusWordV8.SWO_TX_PARSING_FAIL_OUTPUTS]:
    'Transaction parsing failed: invalid outputs.',
  [StatusWordV8.SWO_TX_PARSING_FAIL_FEE]:
    'Transaction parsing failed: invalid fee.',
  [StatusWordV8.SWO_TX_PARSING_FAIL_TTL]:
    'Transaction parsing failed: invalid TTL.',
  [StatusWordV8.SWO_TX_PARSING_FAIL_CERTIFICATES]:
    'Transaction parsing failed: invalid certificates.',
  [StatusWordV8.SWO_TX_PARSING_FAIL_WITHDRAWALS]:
    'Transaction parsing failed: invalid withdrawals.',
  [StatusWordV8.SWO_TX_PARSING_FAIL_VALIDITY_INTERVAL_START]:
    'Transaction parsing failed: invalid validity interval start.',
  [StatusWordV8.SWO_TX_PARSING_FAIL_MINT]:
    'Transaction parsing failed: invalid mint field.',
  [StatusWordV8.SWO_TX_PARSING_FAIL_SCRIPT_DATA_HASH]:
    'Transaction parsing failed: invalid script data hash.',
  [StatusWordV8.SWO_TX_PARSING_FAIL_COLLATERAL_INPUTS]:
    'Transaction parsing failed: invalid collateral inputs.',
  [StatusWordV8.SWO_TX_PARSING_FAIL_REQUIRED_SIGNERS]:
    'Transaction parsing failed: invalid required signers.',
  [StatusWordV8.SWO_TX_PARSING_FAIL_COLLATERAL_OUTPUT]:
    'Transaction parsing failed: invalid collateral output.',
  [StatusWordV8.SWO_TX_PARSING_FAIL_TOTAL_COLLATERAL]:
    'Transaction parsing failed: invalid total collateral.',
  [StatusWordV8.SWO_TX_PARSING_FAIL_REFERENCE_INPUTS]:
    'Transaction parsing failed: invalid reference inputs.',
  [StatusWordV8.SWO_TX_PARSING_FAIL_VOTING_PROCEDURES]:
    'Transaction parsing failed: invalid voting procedures.',
  [StatusWordV8.SWO_TX_PARSING_FAIL_TREASURY]:
    'Transaction parsing failed: invalid treasury.',
  [StatusWordV8.SWO_TX_PARSING_FAIL_DONATION]:
    'Transaction parsing failed: invalid donation.',

  // Network/protocol validation
  [StatusWordV8.SWO_INVALID_NETWORK_ID]: 'Invalid network id.',
  [StatusWordV8.SWO_INVALID_PROTOCOL_MAGIC]: 'Invalid protocol magic.',

  // TX structure (continued)
  [StatusWordV8.SWO_TX_PARSING_FAIL_INCLUSION_FLAG]:
    'Transaction parsing failed: invalid optional field flag.',
  [StatusWordV8.SWO_TX_PARSING_FAIL_BUFFER_NOT_FULLY_CONSUMED]:
    'Transaction parsing failed: unexpected extra data.',
  [StatusWordV8.SWO_TX_PARSING_FAIL_CANONICAL_ORDER]:
    'Transaction parsing failed: invalid CBOR canonical ordering.',

  // Native script parsing
  [StatusWordV8.SWO_NATIVE_SCRIPT_PARSING_FAIL_PUBKEY_CREDENTIAL]:
    'Native script parsing failed: invalid pubkey credential.',
  [StatusWordV8.SWO_NATIVE_SCRIPT_PARSING_FAIL_SCRIPT_TYPE]:
    'Native script parsing failed: invalid script type.',
  [StatusWordV8.SWO_NATIVE_SCRIPT_PARSING_FAIL_NESTING]:
    'Native script parsing failed: invalid nesting depth.',
  [StatusWordV8.SWO_NATIVE_SCRIPT_PARSING_FAIL_TIMELOCK]:
    'Native script parsing failed: invalid time lock.',
  [StatusWordV8.SWO_NATIVE_SCRIPT_PARSING_FAIL_DEPTH_UNSUPPORTED]:
    'Native script parsing failed: nesting depth exceeds supported limit.',
  [StatusWordV8.SWO_NATIVE_SCRIPT_PARSING_FAIL_SCRIPT_COUNT]:
    'Native script parsing failed: invalid script count.',
  [StatusWordV8.SWO_NATIVE_SCRIPT_PARSING_FAIL_DISPLAY_FORMAT]:
    'Native script parsing failed: invalid display format.',

  // CVote aux data / vote cast parsing
  [StatusWordV8.SWO_CVOTE_AUX_DATA_PARSING_FAIL]:
    'CVote auxiliary data parsing failed.',
  [StatusWordV8.SWO_CVOTE_PARSING_FAIL_VOTE_PLAN_ID]:
    'CVote parsing failed: invalid vote plan id.',
  [StatusWordV8.SWO_CVOTE_PARSING_FAIL_PROPOSAL_INDEX]:
    'CVote parsing failed: invalid proposal index.',
  [StatusWordV8.SWO_CVOTE_PARSING_FAIL_PAYLOAD_TYPE_TAG]:
    'CVote parsing failed: invalid payload type tag.',
  [StatusWordV8.SWO_CVOTE_PARSING_FAIL_REMAINING_VOTECAST_BYTES]:
    'CVote parsing failed: could not read remaining vote cast bytes.',

  // Message signing (CIP-8)
  [StatusWordV8.SWO_SIGN_MSG_PARSING_FAIL_MSG_LENGTH]:
    'Message signing failed: invalid message length.',
  [StatusWordV8.SWO_SIGN_MSG_PARSING_FAIL_SIGNING_PATH]:
    'Message signing failed: invalid signing path.',
  [StatusWordV8.SWO_SIGN_MSG_PARSING_FAIL_HASH_PAYLOAD]:
    'Message signing failed: invalid hash payload flag.',
  [StatusWordV8.SWO_SIGN_MSG_PARSING_FAIL_IS_ASCII]:
    'Message signing failed: invalid isAscii flag.',
  [StatusWordV8.SWO_SIGN_MSG_PARSING_FAIL_ADDRESS_FIELD_TYPE]:
    'Message signing failed: invalid address field type.',
  [StatusWordV8.SWO_SIGN_MSG_PARSING_FAIL_ADDRESS_PARAMS]:
    'Message signing failed: invalid address parameters.',
  [StatusWordV8.SWO_SIGN_MSG_PARSING_FAIL_CHUNK_SIZE]:
    'Message signing failed: invalid chunk size.',
  [StatusWordV8.SWO_SIGN_MSG_PARSING_FAIL_CHUNK_DATA]:
    'Message signing failed: invalid chunk data.',
  [StatusWordV8.SWO_SIGN_MSG_INVALID_CHUNK_SIZE]:
    'Message signing failed: chunk size validation failed.',
  [StatusWordV8.SWO_SIGN_MSG_INVALID_ASCII]:
    'Message signing failed: message contains non-ASCII characters.',
  [StatusWordV8.SWO_SIGN_MSG_INVALID_ADDRESS_FIELD_TYPE]:
    'Message signing failed: invalid address field type value.',
  [StatusWordV8.SWO_SIGN_MSG_CONFIRM_MUST_BE_EMPTY]:
    'Message signing failed: confirm APDU must be empty.',

  // Swap validation
  [StatusWordV8.SWO_SWAP_CHECKING_FAIL]: 'Swap parameter validation failed.',
}

// Kept for backwards compatibility
export const DeviceStatusMessages: Record<number, string> = {
  ...StatusWordMsgV7,
  ...StatusWordMsgV8,
}

export {StatusWordV7, StatusWordV8, StatusWordMsgV7, StatusWordMsgV8}

const GH_DEVICE_ERRORS_LINK =
  'https://github.com/LedgerHQ/app-cardano-new/blob/master/src/cardano_swo.h'

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
