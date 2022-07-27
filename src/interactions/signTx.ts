import {DeviceVersionUnsupported, InvalidDataReason} from "../errors"
import type {
    Int64_str,
    ParsedAssetGroup,
    ParsedCertificate,
    ParsedInput,
    ParsedOutput,
    ParsedRequiredSigner,
    ParsedSigningRequest,
    ParsedTransaction,
    ParsedTxAuxiliaryData,
    ParsedWithdrawal,
    ScriptDataHash,
    Uint64_str,
    ValidBIP32Path,
    Version,
} from "../types/internal"
import {
    AUXILIARY_DATA_HASH_LENGTH,
    CertificateType,
    DATUM_HASH_LENGTH,
    ED25519_SIGNATURE_LENGTH,
    PoolOwnerType,
    RequiredSignerType,
    StakeCredentialType,
    TX_HASH_LENGTH,
} from "../types/internal"
import type {SignedTransactionData, TxAuxiliaryDataSupplement} from "../types/public"
import {
    AddressType,
    DatumType,
    PoolKeyType,
    TransactionSigningMode,
    TxAuxiliaryDataSupplementType,
    TxAuxiliaryDataType,
    TxOutputDestinationType,
    TxOutputType,
} from "../types/public"
import {getVersionString} from "../utils"
import {assert} from "../utils/assert"
import {parseHexStringOfLength} from "../utils/parse"
import {buf_to_hex, hex_to_buf, int64_to_buf, uint64_to_buf} from "../utils/serialize"
import {INS} from "./common/ins"
import type {Interaction, SendParams} from "./common/types"
import {ensureLedgerAppVersionCompatible, getCompatibility} from "./getVersion"
import {
    serializeCatalystRegistrationNonce,
    serializeCatalystRegistrationRewardsDestination,
    serializeCatalystRegistrationStakingPath,
    serializeCatalystRegistrationVotingKey,
} from "./serialization/catalystRegistration"
import {
    serializeFinancials,
    serializePoolInitialParams,
    serializePoolInitialParamsLegacy,
    serializePoolKey,
    serializePoolMetadata,
    serializePoolOwner,
    serializePoolRelay,
    serializePoolRewardAccount,
} from "./serialization/poolRegistrationCertificate"
import {serializeTxAuxiliaryData} from "./serialization/txAuxiliaryData"
import {serializeTxCertificate} from "./serialization/txCertificate"
import {serializeTxInit} from "./serialization/txInit"
import {
    serializeAssetGroup,
    serializeMintBasicParams,
    serializeRequiredSigner,
    serializeToken,
    serializeTotalCollateral,
    serializeTxFee,
    serializeTxInput,
    serializeTxTtl,
    serializeTxValidityStart,
    serializeTxWithdrawal,
    serializeTxWitnessRequest,
} from "./serialization/txOther"
import {serializeTxOutputBasicParams} from "./serialization/txOutput"

// the numerical values are meaningless, we try to keep them backwards-compatible
const enum P1 {
  STAGE_INIT = 0x01,
  STAGE_AUX_DATA = 0x08,
  STAGE_INPUTS = 0x02,
  STAGE_OUTPUTS = 0x03,
  STAGE_FEE = 0x04,
  STAGE_TTL = 0x05,
  STAGE_CERTIFICATES = 0x06,
  STAGE_WITHDRAWALS = 0x07,
  STAGE_VALIDITY_INTERVAL_START = 0x09,
  STAGE_MINT = 0x0b,
  STAGE_SCRIPT_DATA_HASH = 0x0c,
  STAGE_COLLATERALS = 0x0d,
  STAGE_REQUIRED_SIGNERS = 0x0e,
  STAGE_TOTAL_COLLATERAL = 0x10,
  STAGE_REFERENCE_INPUTS = 0x11,
  STAGE_CONFIRM = 0x0a,
  STAGE_WITNESSES = 0x0f,
}

const send = (params: {
  p1: number;
  p2: number;
  data: Buffer;
  expectedResponseLength?: number;
}): SendParams => ({ ins: INS.SIGN_TX, ...params })


function* signTx_init(
    tx: ParsedTransaction,
    signingMode: TransactionSigningMode,
    witnessPaths: ValidBIP32Path[],
    version: Version,
): Interaction<void> {
  const enum P2 {
    UNUSED = 0x00,
  }
  const _response = yield send({
      p1: P1.STAGE_INIT,
      p2: P2.UNUSED,
      data: serializeTxInit(tx, signingMode, witnessPaths.length, version),
      expectedResponseLength: 0,
  })
}

function* signTx_addInput(
    input: ParsedInput
): Interaction<void> {
  const enum P2 {
    UNUSED = 0x00,
  }

  yield send({
      p1: P1.STAGE_INPUTS,
      p2: P2.UNUSED,
      data: serializeTxInput(input),
      expectedResponseLength: 0,
  })
}

function* signTx_addOutput(
    output: ParsedOutput,
    version: Version,
): Interaction<void> {
  const enum P2 {
    BASIC_DATA = 0x30,
    DATUM_HASH = 0x34,
    DATUM_OPTION = 0x35,
    CONFIRM = 0x33,
  }

  // Basic data
  yield send({
      p1: P1.STAGE_OUTPUTS,
      p2: P2.BASIC_DATA,
      data: serializeTxOutputBasicParams(output, version),
      expectedResponseLength: 0,
  })

  yield* signTx_addTokenBundle(output.tokenBundle, P1.STAGE_OUTPUTS, uint64_to_buf)
  if (output.type !== TxOutputType.MAP_BABBAGE) {
      if (output.datumHashHex != null) {
          yield send({
              p1: P1.STAGE_OUTPUTS,
              p2: P2.DATUM_HASH,
              data: hex_to_buf(output.datumHashHex),
              expectedResponseLength: 0,
          })
      }
  } else {
      if (output.datum?.type === DatumType.HASH) {
          yield send({
              p1: P1.STAGE_OUTPUTS,
              p2: P2.DATUM_OPTION,
              data: hex_to_buf(parseHexStringOfLength( '00'+ output.datum.datumHashHex, DATUM_HASH_LENGTH+1, InvalidDataReason.OUTPUT_INVALID_DATUM_HASH_WITHOUT_SCRIPT_HASH)),
              expectedResponseLength: 0,
          })
      }
  }

  yield send({
      p1: P1.STAGE_OUTPUTS,
      p2: P2.CONFIRM,
      data: Buffer.alloc(0),
      expectedResponseLength: 0,
  })
}

export type SerializeTokenAmountFn<T> = (val: T) => Buffer

function* signTx_addTokenBundle<T>(tokenBundle: ParsedAssetGroup<T>[], p1: number, serializeTokenAmountFn: SerializeTokenAmountFn<T>) {
    const enum P2 {
        ASSET_GROUP = 0x31,
        TOKEN = 0x32,
    }

    // Assets
    for (const assetGroup of tokenBundle) {
        yield send({
            p1: p1,
            p2: P2.ASSET_GROUP,
            data: serializeAssetGroup(assetGroup),
            expectedResponseLength: 0,
        })

        for (const token of assetGroup.tokens) {
            yield send({
                p1: p1,
                p2: P2.TOKEN,
                data: serializeToken(token, serializeTokenAmountFn),
                expectedResponseLength: 0,
            })
        }
    }
}

function* signTx_addCertificate(
    certificate: ParsedCertificate,
    version: Version,
): Interaction<void> {
  const enum P2 {
    UNUSED = 0x00,
  }
  yield send({
      p1: P1.STAGE_CERTIFICATES,
      p2: P2.UNUSED,
      data: serializeTxCertificate(certificate, version),
      expectedResponseLength: 0,
  })

  // additional data for pool certificate
  if (certificate.type === CertificateType.STAKE_POOL_REGISTRATION) {
      if (getCompatibility(version).supportsPoolRegistrationAsOperator) {
          yield* signTx_addStakePoolRegistrationCertificate(certificate)
      } else {
          // TODO since version 4.0.0 of the Ledger app, pool registration owner witness
          // is checked against the pool owner in the certificate
          // after that version is tested and widespread, we want to drop support
          // for the previous unsafe version (since 2.4) and the unsafe legacy version (since 2.1 or so)
          // When the support for unsafe version is gone,
          // the following legacy serialization should be removed, too.
          yield* signTx_addStakePoolRegistrationCertificateLegacy(certificate)
      }
  }
}

function* signTx_addStakePoolRegistrationCertificate(
    certificate: ParsedCertificate
): Interaction<void> {
    assert(certificate.type === CertificateType.STAKE_POOL_REGISTRATION, "invalid certificate type")

  const enum P2 {
    INIT = 0x30,
    POOL_KEY = 0x31,
    VRF_KEY = 0x32,
    FINANCIALS = 0x33,
    REWARD_ACCOUNT = 0x34,
    OWNERS = 0x35,
    RELAYS = 0x36,
    METADATA = 0x37,
    CONFIRMATION = 0x38,
  }

  const pool = certificate.pool
  yield send({
      p1: P1.STAGE_CERTIFICATES,
      p2: P2.INIT,
      data: serializePoolInitialParams(pool),
      expectedResponseLength: 0,
  })

  yield send({
      p1: P1.STAGE_CERTIFICATES,
      p2: P2.POOL_KEY,
      data: serializePoolKey(pool.poolKey),
      expectedResponseLength: 0,
  })

  yield send({
      p1: P1.STAGE_CERTIFICATES,
      p2: P2.VRF_KEY,
      data: hex_to_buf(pool.vrfHashHex),
      expectedResponseLength: 0,
  })

  yield send({
      p1: P1.STAGE_CERTIFICATES,
      p2: P2.FINANCIALS,
      data: serializeFinancials(pool),
      expectedResponseLength: 0,
  })

  yield send({
      p1: P1.STAGE_CERTIFICATES,
      p2: P2.REWARD_ACCOUNT,
      data: serializePoolRewardAccount(pool.rewardAccount),
      expectedResponseLength: 0,
  })

  for (const owner of pool.owners) {
      yield send({
          p1: P1.STAGE_CERTIFICATES,
          p2: P2.OWNERS,
          data: serializePoolOwner(owner),
          expectedResponseLength: 0,
      })
  }

  for (const relay of pool.relays) {
      yield send({
          p1: P1.STAGE_CERTIFICATES,
          p2: P2.RELAYS,
          data: serializePoolRelay(relay),
          expectedResponseLength: 0,
      })
  }

  yield send({
      p1: P1.STAGE_CERTIFICATES,
      p2: P2.METADATA,
      data: serializePoolMetadata(pool.metadata),
      expectedResponseLength: 0,
  })

  yield send({
      p1: P1.STAGE_CERTIFICATES,
      p2: P2.CONFIRMATION,
      data: Buffer.alloc(0),
      expectedResponseLength: 0,
  })
}

function* signTx_addStakePoolRegistrationCertificateLegacy(
    certificate: ParsedCertificate
): Interaction<void> {
    assert(certificate.type === CertificateType.STAKE_POOL_REGISTRATION, "invalid certificate type")

  const enum P2 {
    POOL_PARAMS = 0x30,
    OWNERS = 0x31,
    RELAYS = 0x32,
    METADATA = 0x33,
    CONFIRMATION = 0x34,
  }

  const pool = certificate.pool
  yield send({
      p1: P1.STAGE_CERTIFICATES,
      p2: P2.POOL_PARAMS,
      data: serializePoolInitialParamsLegacy(pool),
      expectedResponseLength: 0,
  })

  for (const owner of pool.owners) {
      yield send({
          p1: P1.STAGE_CERTIFICATES,
          p2: P2.OWNERS,
          data: serializePoolOwner(owner),
          expectedResponseLength: 0,
      })
  }

  for (const relay of pool.relays) {
      yield send({
          p1: P1.STAGE_CERTIFICATES,
          p2: P2.RELAYS,
          data: serializePoolRelay(relay),
          expectedResponseLength: 0,
      })
  }

  yield send({
      p1: P1.STAGE_CERTIFICATES,
      p2: P2.METADATA,
      data: serializePoolMetadata(pool.metadata),
      expectedResponseLength: 0,
  })

  yield send({
      p1: P1.STAGE_CERTIFICATES,
      p2: P2.CONFIRMATION,
      data: Buffer.alloc(0),
      expectedResponseLength: 0,
  })
}

function* signTx_addWithdrawal(
    withdrawal: ParsedWithdrawal,
    version: Version,
): Interaction<void> {
  const enum P2 {
    UNUSED = 0x00,
  }
  yield send({
      p1: P1.STAGE_WITHDRAWALS,
      p2: P2.UNUSED,
      data: serializeTxWithdrawal(withdrawal, version),
      expectedResponseLength: 0,
  })
}

function* signTx_setFee(
    fee: Uint64_str
): Interaction<void> {
  const enum P2 {
    UNUSED = 0x00,
  }
  yield send({
      p1: P1.STAGE_FEE,
      p2: P2.UNUSED,
      data: serializeTxFee(fee),
      expectedResponseLength: 0,
  })
}

function* signTx_setTtl(
    ttl: Uint64_str
): Interaction<void> {
  const enum P2 {
    UNUSED = 0x00,
  }
  yield send({
      p1: P1.STAGE_TTL,
      p2: P2.UNUSED,
      data: serializeTxTtl(ttl),
      expectedResponseLength: 0,
  })
}

function* signTx_setAuxiliaryData(
    auxiliaryData: ParsedTxAuxiliaryData,
    version: Version,
): Interaction<TxAuxiliaryDataSupplement | null> {
  const enum P2 {
    UNUSED = 0x00,
  }

  const supportedAuxiliaryDataTypes = [
      TxAuxiliaryDataType.ARBITRARY_HASH,
      TxAuxiliaryDataType.CATALYST_REGISTRATION,
  ]

  assert(supportedAuxiliaryDataTypes.includes(auxiliaryData.type), 'Auxiliary data type not implemented')

  yield send({
      p1: P1.STAGE_AUX_DATA,
      p2: P2.UNUSED,
      data: serializeTxAuxiliaryData(auxiliaryData),
      expectedResponseLength: 0,
  })

  if (auxiliaryData.type === TxAuxiliaryDataType.CATALYST_REGISTRATION) {
      const params = auxiliaryData.params

    const enum P2 {
      VOTING_KEY = 0x30,
      STAKING_KEY = 0x31,
      VOTING_REWARDS_ADDRESS = 0x32,
      NONCE = 0x33,
      CONFIRM = 0x34,
    }

    yield send({
        p1: P1.STAGE_AUX_DATA,
        p2: P2.VOTING_KEY,
        data: serializeCatalystRegistrationVotingKey(params.votingPublicKey),
        expectedResponseLength: 0,
    })

    yield send({
        p1: P1.STAGE_AUX_DATA,
        p2: P2.STAKING_KEY,
        data: serializeCatalystRegistrationStakingPath(params.stakingPath),
        expectedResponseLength: 0,
    })

    yield send({
        p1: P1.STAGE_AUX_DATA,
        p2: P2.VOTING_REWARDS_ADDRESS,
        data: serializeCatalystRegistrationRewardsDestination(params.rewardsDestination, version),
        expectedResponseLength: 0,
    })

    yield send({
        p1: P1.STAGE_AUX_DATA,
        p2: P2.NONCE,
        data: serializeCatalystRegistrationNonce(params.nonce),
        expectedResponseLength: 0,
    })

    const ED25519_SIGNATURE_LENGTH = 64

    const response = yield send({
        p1: P1.STAGE_AUX_DATA,
        p2: P2.CONFIRM,
        data: Buffer.alloc(0),
        expectedResponseLength: AUXILIARY_DATA_HASH_LENGTH + ED25519_SIGNATURE_LENGTH,
    })

    const auxDataHash = response.slice(0, AUXILIARY_DATA_HASH_LENGTH)
    const catalystSignature = response.slice(AUXILIARY_DATA_HASH_LENGTH, AUXILIARY_DATA_HASH_LENGTH + ED25519_SIGNATURE_LENGTH)

    return {
        type: TxAuxiliaryDataSupplementType.CATALYST_REGISTRATION,
        auxiliaryDataHashHex: auxDataHash.toString('hex'),
        catalystRegistrationSignatureHex: catalystSignature.toString('hex'),
    }
  }

  return null
}

function* signTx_setAuxiliaryData_before_v2_3(
    auxiliaryData: ParsedTxAuxiliaryData
): Interaction<null> {
  const enum P2 {
    UNUSED = 0x00,
  }

  assert(auxiliaryData.type === TxAuxiliaryDataType.ARBITRARY_HASH, 'Auxiliary data type not implemented')

  yield send({
      p1: P1.STAGE_AUX_DATA,
      p2: P2.UNUSED,
      data: hex_to_buf(auxiliaryData.hashHex),
      expectedResponseLength: 0,
  })

  return null
}

function* signTx_setValidityIntervalStart(
    validityIntervalStartStr: Uint64_str
): Interaction<void> {
  const enum P2 {
    UNUSED = 0x00,
  }
  yield send({
      p1: P1.STAGE_VALIDITY_INTERVAL_START,
      p2: P2.UNUSED,
      data: serializeTxValidityStart(validityIntervalStartStr),
  })
}

function* signTx_setMint(
    mint: Array<ParsedAssetGroup<Int64_str>>
): Interaction<void> {
    const enum P2 {
        BASIC_DATA = 0x30,
        CONFIRM = 0x33,
    }

    // Basic data
    yield send({
        p1: P1.STAGE_MINT,
        p2: P2.BASIC_DATA,
        data: serializeMintBasicParams(mint),
        expectedResponseLength: 0,
    })

    yield* signTx_addTokenBundle(mint, P1.STAGE_MINT, int64_to_buf)

    yield send({
        p1: P1.STAGE_MINT,
        p2: P2.CONFIRM,
        data: Buffer.alloc(0),
        expectedResponseLength: 0,
    })
}

function* signTx_setScriptDataHash(
    scriptDataHash: ScriptDataHash
): Interaction<void> {
  const enum P2 {
    UNUSED = 0x00,
  }
  yield send({
      p1: P1.STAGE_SCRIPT_DATA_HASH,
      p2: P2.UNUSED,
      data: hex_to_buf(scriptDataHash),
  })
}

function* signTx_addCollateral(
    input: ParsedInput
): Interaction<void> {
  const enum P2 {
    UNUSED = 0x00,
  }

  yield send({
      p1: P1.STAGE_COLLATERALS,
      p2: P2.UNUSED,
      data: serializeTxInput(input),
      expectedResponseLength: 0,
  })
}

function* signTx_addRequiredSigner(
    requiredSigner: ParsedRequiredSigner
): Interaction<void> {
  const enum P2 {
    UNUSED = 0x00,
  }

  yield send({
      p1: P1.STAGE_REQUIRED_SIGNERS,
      p2: P2.UNUSED,
      data: serializeRequiredSigner(requiredSigner),
      expectedResponseLength: 0,
  })
}

function* signTx_addTotalCollateral(
    totalCollateral: Uint64_str
): Interaction<void> {
    const enum P2 {
        UNUSED = 0x00,
    }
    yield send({
        p1: P1.STAGE_TOTAL_COLLATERAL,
        p2: P2.UNUSED,
        data: serializeTotalCollateral(totalCollateral),
        expectedResponseLength: 0,
    })
}

function* signTx_addReferenceInput(
    referenceInput: ParsedInput
): Interaction<void> {
    const enum P2 {
        UNUSED = 0x00,
    }
    yield send({
        p1: P1.STAGE_REFERENCE_INPUTS,
        p2: P2.UNUSED,
        data: serializeTxInput(referenceInput),
        expectedResponseLength: 0,
    })
}

function* signTx_awaitConfirm(
): Interaction<{ txHashHex: string }> {
  const enum P2 {
    UNUSED = 0x00,
  }

  const response = yield send({
      p1: P1.STAGE_CONFIRM,
      p2: P2.UNUSED,
      data: Buffer.alloc(0),
      expectedResponseLength: TX_HASH_LENGTH,
  })
  return {
      txHashHex: response.toString("hex"),
  }
}

function* signTx_getWitness(
    path: ValidBIP32Path,
): Interaction<{
  path: ValidBIP32Path;
  witnessSignatureHex: string;
}> {
  const enum P2 {
    UNUSED = 0x00,
  }

  const response = yield send({
      p1: P1.STAGE_WITNESSES,
      p2: P2.UNUSED,
      data: serializeTxWitnessRequest(path),
      expectedResponseLength: ED25519_SIGNATURE_LENGTH,
  })
  return {
      path: path,
      witnessSignatureHex: buf_to_hex(response),
  }
}

// general name, because it should work with any type if generalized
function uniquify(witnessPaths: ValidBIP32Path[]): ValidBIP32Path[] {
    const uniquifier: Record<string, ValidBIP32Path> = {}
    witnessPaths.forEach(p => uniquifier[JSON.stringify(p)] = p)
    return Object.values(uniquifier)
}

function gatherWitnessPaths(request: ParsedSigningRequest): ValidBIP32Path[] {
    const { tx, signingMode, additionalWitnessPaths } = request
    const witnessPaths: ValidBIP32Path[] = []

    if (signingMode != TransactionSigningMode.MULTISIG_TRANSACTION) {
        // for multisig, all the witness paths should be given in additionalWitnessPaths
        // because there might be several (or none) for each of the tx body elements

        // input witnesses
        for (const input of tx.inputs) {
            if (input.path != null) {
                witnessPaths.push(input.path)
            }
        }

        // certificate witnesses
        for (const cert of tx.certificates) {
            switch (cert.type) {

            case CertificateType.STAKE_DELEGATION:
            case CertificateType.STAKE_DEREGISTRATION:
                if (cert.stakeCredential.type === StakeCredentialType.KEY_PATH) {
                    witnessPaths.push(cert.stakeCredential.path)
                }
                break

            case CertificateType.STAKE_POOL_REGISTRATION:
                cert.pool.owners.forEach((owner) => {
                    if (owner.type === PoolOwnerType.DEVICE_OWNED) {
                        witnessPaths.push(owner.path)
                    }
                })

                if (cert.pool.poolKey.type === PoolKeyType.DEVICE_OWNED) {
                    witnessPaths.push(cert.pool.poolKey.path)
                }
                break

            case CertificateType.STAKE_POOL_RETIREMENT:
                witnessPaths.push(cert.path)
                break

            default:
                // no witness path in other certificate types
                break
            }
        }

        // withdrawal witnesses
        for (const withdrawal of tx.withdrawals) {
            if (withdrawal.stakeCredential.type === StakeCredentialType.KEY_PATH) {
                witnessPaths.push(withdrawal.stakeCredential.path)
            }
        }

        // required signers witnesses
        for (const signer of tx.requiredSigners) {
            switch (signer.type) {

            case RequiredSignerType.PATH:
                witnessPaths.push(signer.path)
                break

            default:
                break
            }
        }

        // collateral inputs witnesses
        for (const collateral of tx.collaterals) {
            if (collateral.path != null) {
                witnessPaths.push(collateral.path)
            }
        }
    }

    // Note: if anything from tx body is added here, it should be covered by tests too

    additionalWitnessPaths.forEach((path) => witnessPaths.push(path))

    // we do not ask for the same witness more than once
    return uniquify(witnessPaths)
}

function hasStakeCredentialInCertificates(tx: ParsedTransaction, stakeCredentialType: StakeCredentialType) {
    return tx.certificates.some(c =>
        (c.type === CertificateType.STAKE_DELEGATION ||
        c.type === CertificateType.STAKE_DEREGISTRATION ||
        c.type === CertificateType.STAKE_REGISTRATION) &&
        c.stakeCredential.type === stakeCredentialType
    )
}

function hasStakeCredentialInWithdrawals(tx: ParsedTransaction, stakeCredentialType: StakeCredentialType) {
    return tx.withdrawals.some(w =>
        w.stakeCredential.type === stakeCredentialType
    )
}

function hasScriptHashInAddressParams(tx: ParsedTransaction) {
    const scriptAddressTypes = [
        AddressType.BASE_PAYMENT_KEY_STAKE_SCRIPT,
        AddressType.BASE_PAYMENT_SCRIPT_STAKE_KEY,
        AddressType.BASE_PAYMENT_SCRIPT_STAKE_SCRIPT,
        AddressType.ENTERPRISE_SCRIPT,
        AddressType.POINTER_SCRIPT,
        AddressType.REWARD_SCRIPT,
    ]
    return tx.outputs.some(o =>
        o.destination.type === TxOutputDestinationType.DEVICE_OWNED &&
        scriptAddressTypes.includes(o.destination.addressParams.type)
    )
}

function ensureRequestSupportedByAppVersion(version: Version, request: ParsedSigningRequest): void {
    // signing modes

    if (request.signingMode === TransactionSigningMode.POOL_REGISTRATION_AS_OPERATOR && !getCompatibility(version).supportsPoolRegistrationAsOperator) {
        throw new DeviceVersionUnsupported(`Pool registration as operator not supported by Ledger app version ${getVersionString(version)}.`)
    }

    if (request.signingMode === TransactionSigningMode.MULTISIG_TRANSACTION && !getCompatibility(version).supportsMultisigTransaction) {
        throw new DeviceVersionUnsupported(`Multisig transactions not supported by Ledger app version ${getVersionString(version)}.`)
    }

    if (request.signingMode === TransactionSigningMode.PLUTUS_TRANSACTION && !getCompatibility(version).supportsAlonzo) {
        throw new DeviceVersionUnsupported(`Plutus transactions not supported by Ledger app version ${getVersionString(version)}.`)
    }

    // transaction elements

    if (hasScriptHashInAddressParams(request.tx) && !getCompatibility(version).supportsMultisigTransaction) {
        throw new DeviceVersionUnsupported(`Script hash in address parameters in output not supported by Ledger app version ${getVersionString(version)}.`)
    }

    const hasDatumHashInOutputs = request.tx.outputs.some(o => o.type !==TxOutputType.MAP_BABBAGE && o.datumHashHex != null)
    if (hasDatumHashInOutputs && !getCompatibility(version).supportsAlonzo) {
        throw new DeviceVersionUnsupported(`Datum hash in output not supported by Ledger app version ${getVersionString(version)}.`)
    }

    if (request.tx?.ttl === "0" && !getCompatibility(version).supportsZeroTtl) {
        throw new DeviceVersionUnsupported(`Zero TTL not supported by Ledger app version ${getVersionString(version)}.`)
    }

    if (
        hasStakeCredentialInWithdrawals(request.tx, StakeCredentialType.SCRIPT_HASH) &&
        !getCompatibility(version).supportsMultisigTransaction
    ) {
        throw new DeviceVersionUnsupported(`Script hash in withdrawal not supported by Ledger app version ${getVersionString(version)}.`)
    }
    if (
        hasStakeCredentialInWithdrawals(request.tx, StakeCredentialType.KEY_HASH) &&
        !getCompatibility(version).supportsAlonzo
    ) {
        throw new DeviceVersionUnsupported(`Key hash in withdrawal not supported by Ledger app version ${getVersionString(version)}.`)
    }

    const hasPoolRetirement = request.tx.certificates.some(c => c.type === CertificateType.STAKE_POOL_RETIREMENT)
    if (hasPoolRetirement && !getCompatibility(version).supportsPoolRetirement) {
        throw new DeviceVersionUnsupported(`Pool retirement certificate not supported by Ledger app version ${getVersionString(version)}.`)
    }
    if (
        hasStakeCredentialInCertificates(request.tx, StakeCredentialType.SCRIPT_HASH) &&
        !getCompatibility(version).supportsMultisigTransaction
    ) {
        throw new DeviceVersionUnsupported(`Script hash in certificate stake credential not supported by Ledger app version ${getVersionString(version)}.`)
    }
    if (
        hasStakeCredentialInCertificates(request.tx, StakeCredentialType.KEY_HASH) &&
        !getCompatibility(version).supportsAlonzo
    ) {
        throw new DeviceVersionUnsupported(`Key hash in certificate stake credential not supported by Ledger app version ${getVersionString(version)}.`)
    }

    if (request.tx?.mint && !getCompatibility(version).supportsMint) {
        throw new DeviceVersionUnsupported(`Mint not supported by Ledger app version ${getVersionString(version)}.`)
    }

    if (request.tx.validityIntervalStart && !getCompatibility(version).supportsMary) {
        throw new DeviceVersionUnsupported(`Validity interval start not supported by Ledger app version ${getVersionString(version)}.`)
    }

    if (request.tx.scriptDataHashHex && !getCompatibility(version).supportsAlonzo) {
        throw new DeviceVersionUnsupported(`Script data hash not supported by Ledger app version ${getVersionString(version)}.`)
    }

    if (request.tx.collaterals.length != 0 && !getCompatibility(version).supportsAlonzo) {
        throw new DeviceVersionUnsupported(`Collaterals not supported by Ledger app version ${getVersionString(version)}.`)
    }

    if (request.tx.requiredSigners.length != 0) {
        if (!getCompatibility(version).supportsAlonzo) {
            throw new DeviceVersionUnsupported(`Required signers not supported by Ledger app version ${getVersionString(version)}.`)
        }
        if (!getCompatibility(version).supportsReqSignersInOrdinaryTx) {
            switch (request.signingMode) {
            case TransactionSigningMode.ORDINARY_TRANSACTION:
                throw new DeviceVersionUnsupported(`Required signers in ordinary transaction not supported by Ledger app version ${getVersionString(version)}.`)
            case TransactionSigningMode.MULTISIG_TRANSACTION:
                throw new DeviceVersionUnsupported(`Required signers in multisig transaction not supported by Ledger app version ${getVersionString(version)}.`)
            default:
                break
            }
        }
    }

    if (request.tx.includeNetworkId && !getCompatibility(version).supportsAlonzo) {
        throw new DeviceVersionUnsupported(`Network id in tx body not supported by Ledger app version ${getVersionString(version)}.`)
    }

    // catalyst voting registration is a specific type of auxiliary data that requires a HW wallet signature
    const auxiliaryData = request.tx?.auxiliaryData
    const hasCatalystRegistration = auxiliaryData?.type === TxAuxiliaryDataType.CATALYST_REGISTRATION

    if (hasCatalystRegistration && !getCompatibility(version).supportsCatalystRegistration) {
        throw new DeviceVersionUnsupported(`Catalyst registration not supported by Ledger app version ${getVersionString(version)}.`)
    }
}

export function* signTransaction(version: Version, request: ParsedSigningRequest): Interaction<SignedTransactionData> {
    ensureLedgerAppVersionCompatible(version)
    ensureRequestSupportedByAppVersion(version, request)

    const isCatalystRegistrationSupported = getCompatibility(version).supportsCatalystRegistration

    const { tx, signingMode } = request
    const witnessPaths = gatherWitnessPaths(request)

    // init
    yield* signTx_init(
        tx, signingMode, witnessPaths, version
    )

    // auxiliary data
    let auxiliaryDataSupplement = null
    if (isCatalystRegistrationSupported && tx.auxiliaryData != null) {
        auxiliaryDataSupplement = yield* signTx_setAuxiliaryData(tx.auxiliaryData, version)
    }

    // inputs
    for (const input of tx.inputs) {
        yield* signTx_addInput(input)
    }

    // outputs
    for (const output of tx.outputs) {
        yield* signTx_addOutput(output, version)
    }

    // fee
    yield* signTx_setFee(tx.fee)

    // ttl
    if (tx.ttl != null) {
        yield* signTx_setTtl(tx.ttl)
    }

    // certificates
    for (const certificate of tx.certificates) {
        yield* signTx_addCertificate(certificate, version)
    }

    // withdrawals
    for (const withdrawal of tx.withdrawals) {
        yield* signTx_addWithdrawal(withdrawal, version)
    }

    // auxiliary data before Ledger app version 2.3.x
    if (!isCatalystRegistrationSupported && tx.auxiliaryData != null) {
        auxiliaryDataSupplement = yield* signTx_setAuxiliaryData_before_v2_3(tx.auxiliaryData)
    }

    // validity start
    if (tx.validityIntervalStart != null) {
        yield* signTx_setValidityIntervalStart(tx.validityIntervalStart)
    }

    // mint
    if (tx.mint != null) {
        yield* signTx_setMint(tx.mint)
    }

    // script data hash
    if (tx.scriptDataHashHex != null) {
        yield* signTx_setScriptDataHash(tx.scriptDataHashHex)
    }

    // collateral inputs
    for (const input of tx.collaterals) {
        yield* signTx_addCollateral(input)
    }

    // required signers
    for (const input of tx.requiredSigners) {
        yield* signTx_addRequiredSigner(input)
    }

    // total collateral
    if (tx.totalCollateral != null) {
        yield* signTx_addTotalCollateral(tx.totalCollateral)
    }

    // reference input
    if (tx.referenceInputs != null) {
        for (const referenceInput of tx.referenceInputs) {
            yield* signTx_addReferenceInput(referenceInput)
        }
    }

    // confirm
    const { txHashHex } = yield* signTx_awaitConfirm()

    // witnesses
    const witnesses = []
    for (const path of witnessPaths) {
        const witness = yield* signTx_getWitness(path)
        witnesses.push(witness)
    }

    return {
        txHashHex,
        witnesses,
        auxiliaryDataSupplement,
    }
}
