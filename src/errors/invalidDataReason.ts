/**
 * Reason for throwing [[InvalidData]] error.
 * @category Errors
 */
export enum InvalidDataReason {

  GET_EXT_PUB_KEY_PATHS_NOT_ARRAY = "ext pub key paths not an array",
  INVALID_PATH = "invalid path",

  ADDRESS_INVALID_TYPE = "invalid address type nibble",

  NETWORK_INVALID_PROTOCOL_MAGIC = "invalid protocol magic",
  NETWORK_INVALID_NETWORK_ID = "invalid network id",

  INPUTS_NOT_ARRAY = "inputs not an array",
  INPUT_WITH_PATH_WHEN_SIGNING_AS_POOL_OWNER =
  "inputs should not contain the witness path if signing stake pool certificate as an owner",

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
  OUTPUT_WITH_PATH =
  "outputs given by path are not allowed for stake pool registration transactions",

  ADDRESS_UNKNOWN_TYPE = "unknown output type",
  ADDRESS_INVALID_SPENDING_PATH = "invalid spending path in an output",
  ADDRESS_INVALID_BLOCKCHAIN_POINTER = "invalid blockchain pointer in an output",
  ADDRESS_INVALID_STAKING_KEY_PATH = "invalid staking key path in an output",
  ADDRESS_INVALID_STAKING_KEY_HASH = "invalid staking key hash in an output",
  ADDRESS_INVALID_STAKING_INFO = "Invalid staking info in an output",

  FEE_INVALID = "invalid fee",

  TTL_INVALID = "invalid ttl",

  CERTIFICATES_NOT_ARRAY = "certificates not an array",
  CERTIFICATES_COMBINATION_FORBIDDEN =
  "pool registration must not be combined with other certificates",
  CERTIFICATE_MISSING_PATH = "path is required for one of the certificates",
  CERTIFICATE_SUPERFLUOUS_PATH = "superfluous path in a certificate",
  CERTIFICATE_MISSING_POOL_KEY_HASH = "pool key hash missing in a certificate",
  CERTIFICATE_SUPERFLUOUS_POOL_KEY_HASH =
  "superfluous pool key hash in a certificate",
  CERTIFICATE_INVALID_POOL_KEY_HASH = "invalid pool key hash in a certificate",
  CERTIFICATE_INVALID = "invalid certificate",

  CERTIFICATE_POOL_MISSING_POOL_PARAMS =
  "missing stake pool params in a pool registration certificate",

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
  POOL_REGISTRATION_OWNERS_NOT_ARRAY =
  "owners not an array in a pool registration certificate",
  POOL_REGISTRATION_OWNERS_TOO_MANY =
  "too many owners in a pool registration certificate",
  POOL_REGISTRATION_OWNERS_SINGLE_PATH =
  "there should be exactly one owner given by path in a pool registration certificate",
  POOL_OWNER_INCOMPLETE =
  "incomplete owner params in a pool registration certificate",
  POOL_OWNER_INVALID_PATH =
  "invalid owner path in a pool registration certificate",
  POOL_OWNER_INVALID_KEY_HASH =
  "invalid owner key hash in a pool registration certificate",
  POOL_REGISTRATION_RELAYS_NOT_ARRAY =
  "relays not an array in a pool registration certificate",
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
  WITHDRAWALS_FORBIDDEN =
  "no withdrawals allowed for transactions registering stake pools",

  WITHDRAWAL_INVALID_AMOUNT = "invalid withdrawal amount",
  WITHDRAWAL_INVALID_PATH = "invalid withdrawal path",

  METADATA_INVALID = "invalid metadata",

  VALIDITY_INTERVAL_START_INVALID = "invalid validity interval start",
}
