export enum TxErrors {
  OUTPUT_INVALID_ADDRESS_TYPE_NIBBLE = "invalid address type nibble",
  INVALID_PROTOCOL_MAGIC = "invalid protocol magic",
  INVALID_NETWORK_ID = "invalid network id",

  INPUTS_NOT_ARRAY = "inputs not an array",
  INPUT_WITH_PATH =
  "stake pool registration= inputs should not contain the witness path",
  INPUT_INVALID_TX_HASH = "invalid tx hash in an input",

  OUTPUTS_NOT_ARRAY = "outputs not an array",
  OUTPUT_INVALID_AMOUNT = "invalid amount in an output",
  OUTPUT_INVALID_TOKEN_BUNDLE = "invalid multiasset token bundle in an output",
  OUTPUT_INVALID_TOKEN_POLICY = "invalid multiasset token policy",
  OUTPUT_INVALID_ASSET_NAME =
  "invalid asset name in the token bundle in an output",
  OUTPUT_INVALID_ADDRESS = "invalid address in an output",
  OUTPUT_WITH_PATH =
  "outputs given by path are not allowed for stake pool registration transactions",
  OUTPUT_UNKNOWN_TYPE = "unknown output type",
  OUTPUT_INVALID_SPENDING_PATH = "invalid spending path in an output",
  OUTPUT_INVALID_BLOCKCHAIN_POINTER = "invalid blockchain pointer in an output",
  OUTPUT_INVALID_STAKING_KEY_PATH = "invalid staking key path in an output",
  OUTPUT_INVALID_STAKING_KEY_HASH = "invalid staking key hash in an output",
  OUTPUT_INVALID_STAKING_INFO = "Invalid staking info in an output",

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
  CERTIFICATE_POOL_INVALID_POOL_KEY_HASH =
  "invalid pool key hash in a pool registration certificate",
  CERTIFICATE_POOL_INVALID_VRF_KEY_HASH =
  "invalid vrf key hash in a pool registration certificate",
  CERTIFICATE_POOL_INVALID_PLEDGE =
  "invalid pledge in a pool registration certificate",
  CERTIFICATE_POOL_INVALID_COST =
  "invalid cost in a pool registration certificate",
  CERTIFICATE_POOL_INVALID_MARGIN =
  "invalid margin in a pool registration certificate",
  CERTIFICATE_POOL_INVALID_MARGIN_DENOMINATOR =
  "pool margin denominator must be a value between 1 and 10^15",
  CERTIFICATE_POOL_INVALID_REWARD_ACCOUNT =
  "invalid reward account in a pool registration certificate",
  CERTIFICATE_POOL_OWNERS_NOT_ARRAY =
  "owners not an array in a pool registration certificate",
  CERTIFICATE_POOL_OWNERS_TOO_MANY =
  "too many owners in a pool registration certificate",
  CERTIFICATE_POOL_OWNERS_SINGLE_PATH =
  "there should be exactly one owner given by path in a pool registration certificate",
  CERTIFICATE_POOL_OWNER_INCOMPLETE =
  "incomplete owner params in a pool registration certificate",
  CERTIFICATE_POOL_OWNER_INVALID_PATH =
  "invalid owner path in a pool registration certificate",
  CERTIFICATE_POOL_OWNER_INVALID_KEY_HASH =
  "invalid owner key hash in a pool registration certificate",
  CERTIFICATE_POOL_RELAYS_NOT_ARRAY =
  "relays not an array in a pool registration certificate",
  CERTIFICATE_POOL_RELAYS_TOO_MANY =
  "too many pool relays in a pool registration certificate",
  CERTIFICATE_POOL_RELAY_INVALID_TYPE =
  "invalid type of a relay in a pool registration certificate",
  CERTIFICATE_POOL_RELAY_INVALID_PORT =
  "invalid port in a relay in a pool registration certificate",
  CERTIFICATE_POOL_RELAY_INVALID_IPV4 =
  "invalid ipv4 in a relay in a pool registration certificate",
  CERTIFICATE_POOL_RELAY_INVALID_IPV6 =
  "invalid ipv6 in a relay in a pool registration certificate",
  CERTIFICATE_POOL_RELAY_INVALID_DNS =
  "invalid dns record in a relay in a pool registration certificate",
  CERTIFICATE_POOL_METADATA_INVALID_URL =
  "invalid metadata in a pool registration certificate= invalid url",
  CERTIFICATE_POOL_METADATA_INVALID_HASH =
  "invalid metadata in a pool registration certificate= invalid hash",

  WITHDRAWALS_NOT_ARRAY = "withdrawals not an array",
  WITHDRAWALS_FORBIDDEN =
  "no withdrawals allowed for transactions registering stake pools",

  METADATA_INVALID = "invalid metadata",

  VALIDITY_INTERVAL_START_INVALID = "invalid validity interval start",
}
