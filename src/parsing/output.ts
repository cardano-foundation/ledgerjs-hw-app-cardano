import {InvalidData} from '../errors'
import {InvalidDataReason} from '../errors/invalidDataReason'
import type {
  ParsedAssetGroup,
  ParsedDatum,
  ParsedOutput,
  ParsedOutputDestination,
  ParsedToken,
} from '../types/internal'
import {
  ASSET_NAME_LENGTH_MAX,
  DATUM_HASH_LENGTH,
  SpendingDataSourceType,
  TOKEN_POLICY_LENGTH,
} from '../types/internal'
import type {
  AssetGroup,
  Network,
  Token,
  TxOutput,
  TxOutputDestination,
} from '../types/public'
import {
  DatumType,
  TxOutputDestinationType,
  TxOutputFormat,
} from '../types/public'
import {
  isArray,
  parseCoin,
  parseHexString,
  parseHexStringOfLength,
  parseUint64_str,
  validate,
} from '../utils/parse'
import {parseAddress} from './address'
import {ASSET_GROUPS_MAX, TOKENS_IN_GROUP_MAX} from './constants'

type ParseTokenAmountFn<T> = (
  val: unknown,
  constraints: {min?: string; max?: string},
  errMsg: InvalidDataReason,
) => T

function parseToken<T>(
  token: Token,
  parseTokenAmountFn: ParseTokenAmountFn<T>,
): ParsedToken<T> {
  const assetNameHex = parseHexString(
    token.assetNameHex,
    InvalidDataReason.MULTIASSET_INVALID_ASSET_NAME,
  )
  validate(
    token.assetNameHex.length <= ASSET_NAME_LENGTH_MAX * 2,
    InvalidDataReason.MULTIASSET_INVALID_ASSET_NAME,
  )

  const amount = parseTokenAmountFn(
    token.amount,
    {},
    InvalidDataReason.MULTIASSET_INVALID_TOKEN_AMOUNT,
  )
  return {
    assetNameHex,
    amount,
  }
}

function parseAssetGroup<T>(
  assetGroup: AssetGroup,
  parseTokenAmountFn: ParseTokenAmountFn<T>,
): ParsedAssetGroup<T> {
  validate(
    isArray(assetGroup.tokens),
    InvalidDataReason.MULTIASSET_INVALID_ASSET_GROUP_NOT_ARRAY,
  )
  validate(
    assetGroup.tokens.length <= TOKENS_IN_GROUP_MAX,
    InvalidDataReason.MULTIASSET_INVALID_ASSET_GROUP_TOO_LARGE,
  )
  validate(
    assetGroup.tokens.length > 0,
    InvalidDataReason.MULTIASSET_INVALID_ASSET_GROUP_EMPTY,
  )

  const parsedAssetGroup = {
    policyIdHex: parseHexStringOfLength(
      assetGroup.policyIdHex,
      TOKEN_POLICY_LENGTH,
      InvalidDataReason.MULTIASSET_INVALID_POLICY_NAME,
    ),
    tokens: assetGroup.tokens.map((t) => parseToken(t, parseTokenAmountFn)),
  }

  const assetNamesHex = parsedAssetGroup.tokens.map((t) => t.assetNameHex)
  validate(
    assetNamesHex.length === new Set(assetNamesHex).size,
    InvalidDataReason.MULTIASSET_INVALID_ASSET_GROUP_NOT_UNIQUE,
  )

  const sortedAssetNames = [...assetNamesHex].sort((n1, n2) => {
    if (n1.length === n2.length) return n1.localeCompare(n2)
    else return n1.length - n2.length
  })
  validate(
    JSON.stringify(assetNamesHex) === JSON.stringify(sortedAssetNames),
    InvalidDataReason.MULTIASSET_INVALID_ASSET_GROUP_ORDERING,
  )

  return parsedAssetGroup
}

export function parseTokenBundle<T>(
  tokenBundle: AssetGroup[],
  emptyTokenBundleAllowed: boolean,
  parseTokenAmountFn: ParseTokenAmountFn<T>,
): ParsedAssetGroup<T>[] {
  validate(
    isArray(tokenBundle),
    InvalidDataReason.MULTIASSET_INVALID_TOKEN_BUNDLE_NOT_ARRAY,
  )
  validate(
    tokenBundle.length <= ASSET_GROUPS_MAX,
    InvalidDataReason.MULTIASSET_INVALID_TOKEN_BUNDLE_TOO_LARGE,
  )
  validate(
    emptyTokenBundleAllowed || tokenBundle.length > 0,
    InvalidDataReason.MULTIASSET_INVALID_TOKEN_BUNDLE_EMPTY,
  )
  const parsedTokenBundle = tokenBundle.map((ag) =>
    parseAssetGroup(ag, parseTokenAmountFn),
  )

  const policyIds = parsedTokenBundle.map((ag) => ag.policyIdHex)
  validate(
    policyIds.length === new Set(policyIds).size,
    InvalidDataReason.MULTIASSET_INVALID_TOKEN_BUNDLE_NOT_UNIQUE,
  )

  const sortedPolicyIds = [...policyIds].sort()
  validate(
    JSON.stringify(policyIds) === JSON.stringify(sortedPolicyIds),
    InvalidDataReason.MULTIASSET_INVALID_TOKEN_BUNDLE_ORDERING,
  )

  return parsedTokenBundle
}

function parseDatumHash(datumHashHex: string): ParsedDatum | null {
  return {
    type: DatumType.HASH,
    datumHashHex: parseHexStringOfLength(
      datumHashHex,
      DATUM_HASH_LENGTH,
      InvalidDataReason.OUTPUT_INVALID_DATUM_HASH,
    ),
  }
}

function parseDatum(output: TxOutput): ParsedDatum | null {
  if (output.format === TxOutputFormat.MAP_BABBAGE) {
    switch (output.datum?.type) {
      case DatumType.HASH:
        return parseDatumHash(output.datum?.datumHashHex)

      case DatumType.INLINE:
        return {
          type: DatumType.INLINE,
          datumHex: parseHexString(
            output.datum.datumHex,
            InvalidDataReason.OUTPUT_INVALID_INLINE_DATUM,
          ),
        }

      default:
        return null
    }
  } else {
    // Alonzo
    return output.datumHashHex == null
      ? null
      : parseDatumHash(output.datumHashHex)
  }
}

/*
 * Typically, destination is used in output, where we forbid reward addresses.
 * In some other places, we allow them. The parameter 'validateAsTxOutput'
 * is used to control this validation.
 */
export function parseTxDestination(
  network: Network,
  destination: TxOutputDestination,
  validateAsTxOutput: boolean,
): ParsedOutputDestination {
  switch (destination.type) {
    case TxOutputDestinationType.THIRD_PARTY: {
      const params = destination.params
      const addressHex = parseHexString(
        params.addressHex,
        InvalidDataReason.OUTPUT_INVALID_ADDRESS,
      )
      validate(
        params.addressHex.length <= 128 * 2,
        InvalidDataReason.OUTPUT_INVALID_ADDRESS,
      )
      return {
        type: TxOutputDestinationType.THIRD_PARTY,
        addressHex,
      }
    }
    case TxOutputDestinationType.DEVICE_OWNED: {
      const params = destination.params
      const addressParams = parseAddress(network, params)
      if (validateAsTxOutput) {
        validate(
          // a reward address cannot be used in tx output
          addressParams.spendingDataSource.type === SpendingDataSourceType.PATH,
          InvalidDataReason.OUTPUT_INVALID_ADDRESS_PARAMS,
        )
      }
      return {
        type: TxOutputDestinationType.DEVICE_OWNED,
        addressParams,
      }
    }
    default:
      throw new InvalidData(InvalidDataReason.ADDRESS_UNKNOWN_TYPE)
  }
}

export function parseTxOutput(
  output: TxOutput,
  network: Network,
): ParsedOutput {
  const format =
    output.format === TxOutputFormat.MAP_BABBAGE
      ? TxOutputFormat.MAP_BABBAGE
      : TxOutputFormat.ARRAY_LEGACY

  const amount = parseCoin(
    output.amount,
    InvalidDataReason.OUTPUT_INVALID_AMOUNT,
  )

  const tokenBundle = parseTokenBundle(
    output.tokenBundle ?? [],
    true,
    parseUint64_str,
  )

  const destination = parseTxDestination(network, output.destination, true)

  const datum = parseDatum(output)
  if (datum?.type === DatumType.INLINE) {
    validate(
      output.format === TxOutputFormat.MAP_BABBAGE,
      InvalidDataReason.OUTPUT_INCONSISTENT_DATUM,
    )
  }

  const referenceScriptHex =
    output.format === TxOutputFormat.MAP_BABBAGE && output.referenceScriptHex
      ? parseHexString(
          output.referenceScriptHex,
          InvalidDataReason.OUTPUT_INVALID_REFERENCE_SCRIPT_HEX,
        )
      : null
  if (referenceScriptHex != null) {
    validate(
      output.format === TxOutputFormat.MAP_BABBAGE,
      InvalidDataReason.OUTPUT_INCONSISTENT_REFERENCE_SCRIPT,
    )
  }

  return {
    format,
    amount,
    tokenBundle,
    destination,
    datum,
    referenceScriptHex,
  }
}
