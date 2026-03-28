import type {
  ParsedAddressParams,
  ParsedComplexNativeScript,
  ParsedCVote,
  ParsedSigningRequest,
  ParsedMessageData,
  ParsedNativeScript,
  ParsedOperationalCertificate,
  ValidBIP32Path,
} from '../../types/internal'
import type {Interaction} from '../common/types'
import {
  buildDeriveAddress,
  buildDeriveNativeScriptHashAddSimple,
  buildDeriveNativeScriptHashFinish,
  buildDeriveNativeScriptHashInit,
  buildDeriveNativeScriptHashStartComplex,
  buildGetExtendedPublicKey,
  buildSignTxAuxiliaryDataDelegation,
  buildSignTxAuxiliaryDataInit,
  buildSignTxChunks,
  buildSignTxInit,
  buildSignTxWitness,
  buildSignCVoteChunks,
  buildSignCVoteConfirm,
  buildSignCVoteInit,
  buildSignMessageChunks,
  buildSignMessageConfirm,
  buildSignMessageInit,
  buildSignOperationalCertificate,
  V8AddressP1,
} from './commandBuilder'
import type {NativeScriptHashDisplayFormat} from '../../types/public'
import {NativeScriptType, TxAuxiliaryDataType} from '../../types/public'

export function* sendSignOperationalCertificate(
  operationalCertificate: ParsedOperationalCertificate,
): Interaction<Buffer> {
  return yield buildSignOperationalCertificate(operationalCertificate)
}

export function* sendDeriveAddress(
  addressParams: ParsedAddressParams,
): Interaction<Buffer> {
  return yield buildDeriveAddress(V8AddressP1.RETURN, addressParams)
}

export function* sendShowAddress(
  addressParams: ParsedAddressParams,
): Interaction<void> {
  yield buildDeriveAddress(V8AddressP1.DISPLAY, addressParams, 0)
}

export function* sendGetExtendedPublicKey(
  path: ValidBIP32Path,
): Interaction<Buffer> {
  return yield buildGetExtendedPublicKey(path)
}

export function* sendSignCVote(cVote: ParsedCVote): Interaction<Buffer> {
  yield buildSignCVoteInit(cVote)

  for (const chunk of buildSignCVoteChunks(cVote)) {
    yield chunk
  }

  return yield buildSignCVoteConfirm(cVote)
}

export function* sendSignMessage(
  msgData: ParsedMessageData,
): Interaction<Buffer> {
  yield buildSignMessageInit(msgData)

  for (const chunk of buildSignMessageChunks(msgData)) {
    yield chunk
  }

  return yield buildSignMessageConfirm()
}

function isComplexScript(
  script: ParsedNativeScript,
): script is ParsedComplexNativeScript {
  switch (script.type) {
    case NativeScriptType.ALL:
    case NativeScriptType.ANY:
    case NativeScriptType.N_OF_K:
      return true
    default:
      return false
  }
}

function* sendDeriveNativeScriptHashAddScript(
  script: ParsedNativeScript,
): Interaction<void> {
  if (isComplexScript(script)) {
    yield buildDeriveNativeScriptHashStartComplex(script)
    for (const subscript of script.params.scripts) {
      yield* sendDeriveNativeScriptHashAddScript(subscript)
    }
    return
  }

  yield buildDeriveNativeScriptHashAddSimple(script)
}

export function* sendDeriveNativeScriptHash(
  script: ParsedNativeScript,
  displayFormat: NativeScriptHashDisplayFormat,
): Interaction<Buffer> {
  yield buildDeriveNativeScriptHashInit()
  yield* sendDeriveNativeScriptHashAddScript(script)
  return yield buildDeriveNativeScriptHashFinish(displayFormat)
}

export function* sendSignTx(
  request: ParsedSigningRequest,
  witnessPaths: ValidBIP32Path[],
): Interaction<{
  auxiliaryDataResponse: Buffer | null
  txHashResponse: Buffer
  witnessResponses: Buffer[]
}> {
  yield buildSignTxInit(request, witnessPaths)

  let auxiliaryDataResponse: Buffer | null = null
  if (
    request.tx.auxiliaryData?.type === TxAuxiliaryDataType.CIP36_REGISTRATION
  ) {
    auxiliaryDataResponse = yield buildSignTxAuxiliaryDataInit(
      request.tx.auxiliaryData.params,
    )
    const delegations = request.tx.auxiliaryData.params.delegations ?? []
    for (let i = 0; i < delegations.length; i++) {
      const isLast = i === delegations.length - 1
      const res = yield buildSignTxAuxiliaryDataDelegation(
        delegations[i],
        isLast,
      )
      if (isLast) {
        auxiliaryDataResponse = res
      }
    }
  }

  let txHashResponse = Buffer.alloc(0)
  for (const chunk of buildSignTxChunks(request.tx)) {
    txHashResponse = Buffer.from((yield chunk) as Uint8Array)
  }

  const witnessResponses: Buffer[] = []
  for (const path of witnessPaths) {
    witnessResponses.push(yield buildSignTxWitness(path))
  }

  return {
    auxiliaryDataResponse,
    txHashResponse,
    witnessResponses,
  }
}
