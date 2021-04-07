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
  OUTPUT_INVALID_TOKEN_BUNDLE = "invalid multiasset token bundle in an output",
  OUTPUT_INVALID_TOKEN_BUNDLE_TOO_LARGE = "multiasset token bundle too large",
  OUTPUT_INVALID_TOKEN_POLICY = "invalid multiasset token policy",
  OUTPUT_INVALID_ASSET_NAME =
  "invalid asset name in the token bundle in an output",
  OUTPUT_INVALID_ASSET_GROUP_TOKENS_NOT_ARRAY = "assetGroup tokens not an array",
  OUTPUT_INVALID_ASSET_GROUP_TOKENS_TOO_LARGE = "assetGroup tokens too large",


  OUTPUT_INVALID_ADDRESS = "invalid address in an output",

  ADDRESS_UNKNOWN_TYPE = "unknown address type",
  ADDRESS_INVALID_SPENDING_PATH = "invalid address spending path",
  ADDRESS_INVALID_BLOCKCHAIN_POINTER = "invalid address blockchain pointer",
  ADDRESS_INVALID_STAKING_KEY_PATH = "invalid address staking key path",
  ADDRESS_INVALID_STAKING_KEY_HASH = "invalid address staking key hash",
  ADDRESS_INVALID_STAKING_INFO = "Invalid staking info in an output",

  FEE_INVALID = "invalid fee",

  TTL_INVALID = "invalid ttl",

  CERTIFICATES_NOT_ARRAY = "certificates not an array",

  CERTIFICATE_MISSING_PATH = "path is required for one of the certificates",
  CERTIFICATE_MISSING_POOL_KEY_HASH = "pool key hash missing in a certificate",
  CERTIFICATE_SUPERFLUOUS_POOL_KEY_HASH =
  "superfluous pool key hash in a certificate",
  CERTIFICATE_INVALID_TYPE = "invalid certificate type",

  POOL_REGISTRATION_INVALID_POOL_KEY_HASH =
  "invalid pool key hash in a pool registration certificate",
  POOL_REGISTRATION_INVALID_VRF_KEY_HASH =
  "invalid vrf key hash in a pool registration certificate",
  POOL_REGISTRATION_INVALID_PLEDGE =
  "invalid pledge in a pool registration certificate",
  POOL_REGISTRATION_INVALID_COST =
  "invalid cost in a pool registration certificate",
  POOL_REGISTRATION_INVALID_MARGIN =
  "invalid margin in a pool registration certificate",
  POOL_MARGIN_INVALID_MARGIN_DENOMINATOR =
  "pool margin denominator must be a value between 1 and 10^15",
  POOL_REGISTRATION_INVALID_REWARD_ACCOUNT =
  "invalid reward account in a pool registration certificate",
  POOL_REGISTRATION_OWNERS_TOO_MANY =
  "too many owners in a pool registration certificate",

  POOL_OWNER_INVALID_TYPE =
  "invalid owner type",
  POOL_OWNER_INVALID_PATH =
  "invalid owner path in a pool registration certificate",
  POOL_OWNER_INVALID_KEY_HASH =
  "invalid owner key hash in a pool registration certificate",
  POOL_REGISTRATION_RELAYS_TOO_MANY =
  "too many pool relays in a pool registration certificate",

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

  AUXILIARY_DATA_UNKNOWN_TYPE = "unknown auxiliary data type",
  AUXILIARY_DATA_INVALID_HASH = "invalid auxiliary data hash",

  METADATA_UNKNOWN_TYPE = "unknown metadata type",

  CATALYST_REGISTRATION_INVALID_VOTING_KEY = "invalid Catalyst registration voting key",
  CATALYST_REGISTRATION_INVALID_STAKING_KEY_PATH = "invalid Catalyst registration staking key path",
  CATALYST_REGISTRATION_INVALID_REWARDS_DESTINATION_BYRON = "Catalyst registration rewards destination cannot be a Byron-era address",
  CATALYST_REGISTRATION_INVALID_NONCE = "invalid Catalyst registration nonce",

  VALIDITY_INTERVAL_START_INVALID = "invalid validity interval start",

  SIGN_MODE_ORDINARY__POOL_REGISTRATION_NOT_ALLOWED =
  "pool registration is not allowed in TransactionSigningMode.ORDINARY_TRANSACTION",

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
}
