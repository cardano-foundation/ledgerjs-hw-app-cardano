// Wire-level protocol constants mirroring C enums in ledger-app-cardano.
// Keep in sync with the app source when the protocol changes.

// cardano_parsers.h: flag_included_e
export const enum Included {
  NO = 0x01,
  YES = 0x02,
}

// tx.h: aux_data_type_t
export const enum AuxDataType {
  ARBITRARY_HASH = 0,
  CVOTE_REGISTRATION = 1,
}

// cvote_types.h: cvote_registration_format_t
export const enum CIP36RegistrationFormat {
  CIP15 = 1,
  CIP36 = 2,
}

// cvote_types.h (credential field in CIP36 delegation)
export const enum CVoteCredentialType {
  KEY = 0,
  KEY_PATH = 2,
}

// tx.h: sign_tx_signingmode_t
export const enum SigningMode {
  ORDINARY_TRANSACTION = 3,
  POOL_REGISTRATION_AS_OWNER = 4,
  POOL_REGISTRATION_AS_OPERATOR = 5,
  MULTISIG_TRANSACTION = 6,
  PLUTUS_TRANSACTION = 7,
  UNRESTRICTED_TRANSACTION = 9,
  POOL_REGISTRATION_AS_PAYER = 10,
  POOL_RETIREMENT_AS_PAYER = 11,
}

// tx_output_types.h: tx_output_destination_type_t
export const enum OutputDestinationType {
  THIRD_PARTY = 1,
  DEVICE_OWNED = 2,
}

// tx_credential_types.h: ext_credential_type_t (wire encoding used for pool reward account)
export const enum PoolRewardAccountWireType {
  KEY_HASH = 0,
  KEY_PATH = 2,
}

// messageSigning.h: cip8_address_field_type_t
export const enum CIP8AddressFieldType {
  ADDRESS = 1,
  KEYHASH = 2,
}

// deriveNativeScriptHash_types.h (display format)
export const enum NativeScriptHashDisplayFormatWire {
  BECH32 = 1,
  POLICY_ID = 2,
}
