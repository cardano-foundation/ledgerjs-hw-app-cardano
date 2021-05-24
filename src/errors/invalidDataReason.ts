/**
 * Reason for throwing [[InvalidData]] error.
 * @category Errors
 */
export enum InvalidDataReason {

  GET_EXT_PUB_KEY_PATHS_NOT_ARRAY = "ext pub key paths not an array",
  INVALID_PATH = "invalid path",

  NETWORK_INVALID_PROTOCOL_MAGIC = "invalid protocol magic",
  NETWORK_INVALID_NETWORK_ID = "invalid network id",

  INPUTS_NOT_ARRAY = "inputs not an array",
  INPUT_INVALID_TX_HASH = "invalid tx hash in an input",
  INPUT_INVALID_PATH = "invalid input path",
  INPUT_INVALID_UTXO_INDEX = "invalid input utxo index",

  OUTPUTS_NOT_ARRAY = "outputs not an array",
  OUTPUT_INVALID_AMOUNT = "invalid amount in an output",
  OUTPUT_INVALID_ADDRESS = "invalid address in an output",

  MULTIASSET_INVALID_POLICY_NAME = "invalid policy id in a multiasset token bundle",
  MULTIASSET_INVALID_TOKEN_BUNDLE_NOT_ARRAY = "invalid multiasset token bundle - asset groups not an array",
  MULTIASSET_INVALID_TOKEN_BUNDLE_TOO_LARGE = "invalid multiasset token bundle - too many asset groups",
  MULTIASSET_INVALID_TOKEN_BUNDLE_ORDERING = "invalid multiasset token bundle - incorrect ordering of asset groups",
  MULTIASSET_INVALID_TOKEN_BUNDLE_NOT_UNIQUE = "invalid multiasset token bundle - policyIds not unique",
  MULTIASSET_INVALID_TOKEN_BUNDLE_EMPTY = "invalid multiasset token bundle - token bundle is not allowed to be empty",
  MULTIASSET_INVALID_TOKEN_AMOUNT = "invalid token amount in an asset group in a multiasset token bundle",
  MULTIASSET_INVALID_ASSET_NAME = "invalid asset name in an asset group in a multiasset token bundle",
  MULTIASSET_INVALID_ASSET_GROUP_NOT_ARRAY = "invalid asset group in multiasset token bundle - tokens not an array",
  MULTIASSET_INVALID_ASSET_GROUP_TOO_LARGE = "invalid asset group in multiasset token bundle - too many tokens",
  MULTIASSET_INVALID_ASSET_GROUP_EMPTY = "invalid asset group in multiasset token bundle - zero tokens",
  MULTIASSET_INVALID_ASSET_GROUP_ORDERING = "invalid asset group in multiasset token bundle - incorrect ordering of tokens",
  MULTIASSET_INVALID_ASSET_GROUP_NOT_UNIQUE = "invalid asset group in multiasset token bundle - token names not unique",

  ADDRESS_UNKNOWN_TYPE = "unknown address type",
  ADDRESS_INVALID_SPENDING_INFO = "invalid address spending information",
  ADDRESS_INVALID_SPENDING_KEY_PATH = "invalid address spending key path",
  ADDRESS_INVALID_SPENDING_SCRIPT_HASH = "invalid address spending script hash",
  ADDRESS_INVALID_BLOCKCHAIN_POINTER = "invalid address blockchain pointer",
  ADDRESS_INVALID_STAKING_KEY_PATH = "invalid address staking key path",
  ADDRESS_INVALID_STAKING_KEY_HASH = "invalid address staking key hash",
  ADDRESS_INVALID_STAKING_SCRIPT_HASH = "invalid address staking script hash",
  ADDRESS_INVALID_STAKING_INFO = "Invalid staking info in an output",
  ADDRESS_INVALID_REWARD_ADDRESS = "invalid reward address for this version of ledger",

  FEE_INVALID = "invalid fee",

  TTL_INVALID = "invalid ttl",

  CERTIFICATES_NOT_ARRAY = "certificates not an array",

  CERTIFICATE_INVALID_PATH = "one of the certificates contains an invalid path",
  CERTIFICATE_INVALID_SCRIPT_HASH = "one of the certificates contains an invalid script hash",
  CERTIFICATE_INVALID_STAKE_CREDENTIAL = "one of the certificates contains both a path and a scripthash or neither",
  CERTIFICATE_INVALID_POOL_KEY_HASH = "one of the certificates contains an invalid pool key hash",
  CERTIFICATE_SUPERFLUOUS_POOL_KEY_HASH =
  "superfluous pool key hash in a certificate",
  CERTIFICATE_INVALID_TYPE = "invalid certificate type",

  POOL_REGISTRATION_INVALID_VRF_KEY_HASH =
  "invalid vrf key hash in a pool registration certificate",
  POOL_REGISTRATION_INVALID_PLEDGE =
  "invalid pledge in a pool registration certificate",
  POOL_REGISTRATION_INVALID_COST =
  "invalid cost in a pool registration certificate",
  POOL_REGISTRATION_INVALID_MARGIN =
  "invalid margin in a pool registration certificate",
  POOL_REGISTRATION_INVALID_MARGIN_DENOMINATOR =
  "pool margin denominator must be a value between 1 and 10^15",
  POOL_REGISTRATION_OWNERS_TOO_MANY =
  "too many owners in a pool registration certificate",

  POOL_KEY_INVALID_TYPE =
  "invalid pool key type",
  POOL_KEY_INVALID_PATH =
  "invalid pool key path in a pool registration certificate",
  POOL_KEY_INVALID_KEY_HASH =
  "invalid pool key hash in a pool registration certificate",

  POOL_OWNER_INVALID_TYPE =
  "invalid owner type",
  POOL_OWNER_INVALID_PATH =
  "invalid owner path in a pool registration certificate",
  POOL_OWNER_INVALID_KEY_HASH =
  "invalid owner key hash in a pool registration certificate",
  POOL_REGISTRATION_RELAYS_TOO_MANY =
  "too many pool relays in a pool registration certificate",

  POOL_REWARD_ACCOUNT_INVALID_TYPE =
  "invalid pool reward account type",
  POOL_REWARD_ACCOUNT_INVALID_PATH =
  "invalid pool reward account key path in a pool registration certificate",
  POOL_REWARD_ACCOUNT_INVALID_HEX =
  "invalid pool reward account hex in a pool registration certificate",

  POOL_RETIREMENT_INVALID_RETIREMENT_EPOCH =
  "invalid pool retirement epoch",

  RELAY_INVALID_TYPE =
  "invalid type of a relay in a pool registration certificate",
  RELAY_INVALID_PORT =
  "invalid port in a relay in a pool registration certificate",
  RELAY_INVALID_IPV4 =
  "invalid ipv4 in a relay in a pool registration certificate",
  RELAY_INVALID_IPV6 =
  "invalid ipv6 in a relay in a pool registration certificate",
  RELAY_INVALID_DNS =
  "invalid dns record in a relay in a pool registration certificate",

  POOL_REGISTRATION_METADATA_INVALID_URL =
  "invalid metadata in a pool registration certificate= invalid url",
  POOL_REGISTRATION_METADATA_INVALID_HASH =
  "invalid metadata in a pool registration certificate= invalid hash",

  WITHDRAWALS_NOT_ARRAY = "withdrawals not an array",

  WITHDRAWAL_INVALID_AMOUNT = "invalid withdrawal amount",
  WITHDRAWAL_INVALID_PATH = "invalid withdrawal path",
  WITHDRAWAL_INVALID_STAKE_CREDENTIAL = "withdrawal stake credential contains both a path and a scripthash or neither",

  AUXILIARY_DATA_UNKNOWN_TYPE = "unknown auxiliary data type",
  AUXILIARY_DATA_INVALID_HASH = "invalid auxiliary data hash",

  METADATA_UNKNOWN_TYPE = "unknown metadata type",

  CATALYST_REGISTRATION_INVALID_VOTING_KEY = "invalid Catalyst registration voting key",
  CATALYST_REGISTRATION_INVALID_STAKING_KEY_PATH = "invalid Catalyst registration staking key path",
  CATALYST_REGISTRATION_INVALID_REWARDS_DESTINATION_BYRON = "Catalyst registration rewards destination cannot be a Byron-era address",
  CATALYST_REGISTRATION_INVALID_NONCE = "invalid Catalyst registration nonce",

  VALIDITY_INTERVAL_START_INVALID = "invalid validity interval start",

  SIGN_MODE_UNKNOWN = "unknown signing mode",

  SIGN_MODE_ORDINARY__POOL_REGISTRATION_NOT_ALLOWED =
  "pool registration is not allowed in TransactionSigningMode.ORDINARY_TRANSACTION",
  SIGN_MODE_ORDINARY__CERTIFICATE_STAKE_CREDENTIAL_ONLY_AS_PATH =
  "certificate stake credential must be given as a path in TransactionSigningMode.ORDINARY_TRANSACTION",
  SIGN_MODE_ORDINARY__WITHDRAWAL_ONLY_AS_PATH =
  "withdrawal must be given as a path in TransactionSigningMode.ORDINARY_TRANSACTION",

  SIGN_MODE_SCRIPT__POOL_REGISTRATION_NOT_ALLOWED =
  "pool registration is not allowed in TransactionSigningMode.SCRIPT_TRANSACTION",
  SIGN_MODE_SCRIPT__POOL_RETIREMENT_NOT_ALLOWED =
  "pool retirement is not allowed in TransactionSigningMode.SCRIPT_TRANSACTION",
  SIGN_MODE_SCRIPT__DEVICE_OWNED_ADDRESS_NOT_ALLOWED =
  "outputs given by path are not allowed in TransactionSigningMode.SCRIPT_TRANSACTION",
  SIGN_MODE_SCRIPT__CERTIFICATE_STAKE_CREDENTIAL_ONLY_AS_SCRIPT =
  "certificate stake credential must be given as a script hash in TransactionSigningMode.SCRIPT_TRANSACTION",
  SIGN_MODE_SCRIPT__WITHDRAWAL_ONLY_AS_SCRIPT =
  "withdrawal must be given as a script hash in TransactionSigningMode.SCRIPT_TRANSACTION",

  SIGN_MODE_POOL_OWNER__DEVICE_OWNED_ADDRESS_NOT_ALLOWED =
  "outputs given by path are not allowed in TransactionSigningMode.POOL_REGISTRATION_AS_OWNER",
  SIGN_MODE_POOL_OWNER__INPUT_WITH_PATH_NOT_ALLOWED =
  "inputs with path are not allowed in TransactionSigningMode.POOL_REGISTRATION_AS_OWNER",
  SIGN_MODE_POOL_OWNER__SINGLE_POOL_REG_CERTIFICATE_REQUIRED =
  "single pool registration certificate is expected in TransactionSigningMode.POOL_REGISTRATION_AS_OWNER",
  SIGN_MODE_POOL_OWNER__SINGLE_DEVICE_OWNER_REQUIRED =
  "single device-owned pool owner is expected in TransactionSigningMode.POOL_REGISTRATION_AS_OWNER",
  SIGN_MODE_POOL_OWNER__WITHDRAWALS_NOT_ALLOWED =
  "no withdrawals allowed in TransactionSigningMode.POOL_REGISTRATION_AS_OWNER",

  SIGN_MODE_POOL_OPERATOR__SINGLE_POOL_REG_CERTIFICATE_REQUIRED =
  "single pool registration certificate is expected in TransactionSigningMode.POOL_REGISTRATION_AS_OPERATOR",
  SIGN_MODE_POOL_OPERATOR__DEVICE_OWNED_POOL_KEY_REQUIRED =
  "device owned pool key is required in TransactionSigningMode.POOL_REGISTRATION_AS_OPERATOR",
  SIGN_MODE_POOL_OPERATOR__DEVICE_OWNED_POOL_OWNER_NOT_ALLOWED =
  "no device-owned pool owner is expected in TransactionSigningMode.POOL_REGISTRATION_AS_OPERATOR",
  SIGN_MODE_POOL_OPERATOR__WITHDRAWALS_NOT_ALLOWED =
  "no withdrawals allowed in TransactionSigningMode.POOL_REGISTRATION_AS_OPERATOR",

  OPERATIONAL_CERTIFICATE_INVALID_KES_KEY =
  "invalid operational certificate kes key",
  OPERATIONAL_CERTIFICATE_INVALID_KES_PERIOD =
  "invalid operational certificate kes period",
  OPERATIONAL_CERTIFICATE_INVALID_ISSUE_COUNTER =
  "invalid operational certificate issue counter",
  OPERATIONAL_CERTIFICATE_INVALID_COLD_KEY_PATH =
  "invalid operational certificate cold key path",

  DERIVE_NATIVE_SCRIPT_HASH_INVALID_DATA = "invalid native script input",
  DERIVE_NATIVE_SCRIPT_HASH_INVALID_KEY_PATH = "invalid key path param",
  DERIVE_NATIVE_SCRIPT_HASH_INVALID_KEY_HASH = "invalid key hash param",
  DERIVE_NATIVE_SCRIPT_HASH_SCRIPTS_NOT_AN_ARRAY = "invalid scripts - scripts is not an array",
  DERIVE_NATIVE_SCRIPT_HASH_INVALID_REQUIRED_COUNT = "invalid required count",
  DERIVE_NATIVE_SCRIPT_HASH_INVALID_TOKEN_LOCKING_SLOT = "invalid token locking slot",
  DERIVE_NATIVE_SCRIPT_HASH_REQUIRED_COUNT_HIGHER_THAN_NUMBER_OF_SCRIPTS =
  "invalid required count - higher than number of total scripts",
  DERIVE_NATIVE_SCRIPT_HASH_UNKNOWN_TYPE = "unknown script type",
  DERIVE_NATIVE_SCRIPT_HASH_INVALID_DISPLAY_FORMAT = "invalid native script hash display format",
}
