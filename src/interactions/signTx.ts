import type {
  BIP32Path,
  Certificate,
  InputTypeUTxO,
  Network,
  SendFn,
  SignTransactionResponse,
  TxOutput,
  Withdrawal,
} from "../Ada";
import { Errors, } from "../Ada"
import cardano, { SignTxIncluded } from "../cardano";
import type { ParsedCertificate } from "../parsing";
import { CertificateType, parseAssetGroup, parseCertificates, validateTransaction } from "../parsing";
import utils, { Assert, invariant, Precondition, unreachable } from "../utils";
import { INS } from "./common/ins";
import { wrapRetryStillInCall } from "./common/retry";
import { isLedgerAppVersionAtLeast } from "./getVersion";

const PoolRegistrationCodes = {
  SIGN_TX_POOL_REGISTRATION_NO: 3,
  SIGN_TX_POOL_REGISTRATION_YES: 4,
};

const enum P1 {
  STAGE_INIT = 0x01,
  STAGE_INPUTS = 0x02,
  STAGE_OUTPUTS = 0x03,
  STAGE_FEE = 0x04,
  STAGE_TTL = 0x05,
  STAGE_CERTIFICATES = 0x06,
  STAGE_WITHDRAWALS = 0x07,
  STAGE_METADATA = 0x08,
  STAGE_VALIDITY_INTERVAL_START = 0x09,
  STAGE_CONFIRM = 0x0a,
  STAGE_WITNESSES = 0x0f,
  // legacy
  STAGE_CONFIRM_BEFORE_2_2 = 0x09,
  STAGE_WITNESSES_BEFORE_2_2 = 0x0a
}

const signTx_init = async (
  _send: SendFn,
  network: Network,
  numInputs: number,
  numOutputs: number,
  includeTtl: boolean,
  numCertificates: number,
  numWithdrawals: number,
  includeMetadata: boolean,
  includeValidityIntervalStart: boolean,
  numWitnesses: number,
  flags: {
    appHasStakePoolOwnerSupport: boolean,
    appHasMultiassetSupport: boolean,
    isSigningPoolRegistrationAsOwner: boolean,
  }
): Promise<void> => {
  const enum P2 {
    UNUSED = 0x00,
  }
  const _serializePoolRegistrationCode = (
    isSigningPoolRegistrationAsOwner: boolean
  ): Buffer => {
    // backwards compatible way of serializing the flag to signalize pool registration
    // transactions.
    // TODO To be removed/refactored once Ledger app 2.1 or later is rolled out
    if (!flags.appHasStakePoolOwnerSupport) {
      return Buffer.from([]);
    }

    return utils.uint8_to_buf(
      isSigningPoolRegistrationAsOwner
        ? PoolRegistrationCodes.SIGN_TX_POOL_REGISTRATION_YES
        : PoolRegistrationCodes.SIGN_TX_POOL_REGISTRATION_NO
    );
  };

  const _serializeIncludeInTxData = (
    hasMultiassetSupport: boolean
  ): Buffer => {
    // TODO remove after Ledger app 2.1 support is not needed anymore
    if (!hasMultiassetSupport) {
      return Buffer.concat([
        utils.uint8_to_buf(
          includeMetadata
            ? SignTxIncluded.SIGN_TX_INCLUDED_YES
            : SignTxIncluded.SIGN_TX_INCLUDED_NO
        ),
      ]);
    }

    return Buffer.concat([
      utils.uint8_to_buf(
        includeTtl
          ? SignTxIncluded.SIGN_TX_INCLUDED_YES
          : SignTxIncluded.SIGN_TX_INCLUDED_NO
      ),
      utils.uint8_to_buf(
        includeMetadata
          ? SignTxIncluded.SIGN_TX_INCLUDED_YES
          : SignTxIncluded.SIGN_TX_INCLUDED_NO
      ),
      utils.uint8_to_buf(
        includeValidityIntervalStart
          ? SignTxIncluded.SIGN_TX_INCLUDED_YES
          : SignTxIncluded.SIGN_TX_INCLUDED_NO
      ),
    ]);
  };

  const data = Buffer.concat([
    utils.uint8_to_buf(network.networkId),
    utils.uint32_to_buf(network.protocolMagic),
    _serializeIncludeInTxData(flags.appHasMultiassetSupport),
    _serializePoolRegistrationCode(flags.isSigningPoolRegistrationAsOwner),
    utils.uint32_to_buf(numInputs),
    utils.uint32_to_buf(numOutputs),
    utils.uint32_to_buf(numCertificates),
    utils.uint32_to_buf(numWithdrawals),
    utils.uint32_to_buf(numWitnesses),
  ]);
  const _response = await wrapRetryStillInCall(_send)({
    ins: INS.SIGN_TX,
    p1: P1.STAGE_INIT,
    p2: P2.UNUSED,
    data,
    expectedResponseLength: 0,
  });
};

const signTx_addInput = async (
  _send: SendFn,
  input: InputTypeUTxO
): Promise<void> => {
  const enum P2 {
    UNUSED = 0x00,
  }
  const data = Buffer.concat([
    utils.hex_to_buf(input.txHashHex),
    utils.uint32_to_buf(input.outputIndex),
  ]);
  await _send({
    ins: INS.SIGN_TX,
    p1: P1.STAGE_INPUTS,
    p2: P2.UNUSED,
    data,
    expectedResponseLength: 0,
  });
};

const signTx_addOutputBefore_2_2 = async (
  _send: SendFn,
  output: TxOutput,
  network: Network,
) => {
  const enum P2 {
    UNUSED = 0x00,
  }

  const data = cardano.serializeOutputBasicParamsBefore_2_2(
    output,
    network
  );

  await _send({
    ins: INS.SIGN_TX,
    p1: P1.STAGE_OUTPUTS,
    p2: P2.UNUSED,
    data,
    expectedResponseLength: 0,
  });

}

const signTx_addOutput = async (
  _send: SendFn,
  output: TxOutput,
  network: Network,
  flags: {
    appHasMultiassetSupport: boolean
  }
): Promise<void> => {
  if (!flags.appHasMultiassetSupport) {
    return await signTx_addOutputBefore_2_2(_send, output, network)
  }

  const enum P2 {
    BASIC_DATA = 0x30,
    ASSET_GROUP = 0x31,
    TOKEN = 0x32,
    CONFIRM = 0x33,
  }

  // Basic data
  {
    const data = cardano.serializeOutputBasicParams(
      output,
      network
    );

    await _send({
      ins: INS.SIGN_TX,
      p1: P1.STAGE_OUTPUTS,
      p2: P2.BASIC_DATA,
      data: data,
      expectedResponseLength: 0,
    });
  }

  // Assets
  for (const _assetGroup of output.tokenBundle || []) {
    const assetGroup = parseAssetGroup(_assetGroup)

    const data = Buffer.concat([
      utils.hex_to_buf(assetGroup.policyIdHex),
      utils.uint32_to_buf(assetGroup.tokens.length),
    ]);
    await _send({
      ins: INS.SIGN_TX,
      p1: P1.STAGE_OUTPUTS,
      p2: P2.ASSET_GROUP,
      data,
      expectedResponseLength: 0,
    });

    for (const token of assetGroup.tokens) {
      const data = Buffer.concat([
        utils.uint32_to_buf(token.assetNameHex.length / 2),
        utils.hex_to_buf(token.assetNameHex),
        utils.uint64_to_buf(token.amountStr),
      ]);
      await _send({
        ins: INS.SIGN_TX,
        p1: P1.STAGE_OUTPUTS,
        p2: P2.TOKEN,
        data,
        expectedResponseLength: 0,
      });
    }
  }

  await _send({
    ins: INS.SIGN_TX,
    p1: P1.STAGE_OUTPUTS,
    p2: P2.CONFIRM,
    data: Buffer.alloc(0),
    expectedResponseLength: 0,
  });
};

const signTx_addCertificate = async (
  _send: SendFn,
  certificate: ParsedCertificate,
): Promise<void> => {
  const enum P2 {
    UNUSED = 0x00
  }

  switch (certificate.type) {
    case CertificateType.STAKE_REGISTRATION:
    case CertificateType.STAKE_DEREGISTRATION: {
      const data = Buffer.concat([
        utils.uint8_to_buf(certificate.type),
        utils.path_to_buf(certificate.path)
      ])
      await _send({
        ins: INS.SIGN_TX,
        p1: P1.STAGE_CERTIFICATES,
        p2: P2.UNUSED,
        data,
        expectedResponseLength: 0,
      });
      break
    }
    case CertificateType.STAKE_DELEGATION: {
      const data = Buffer.concat([
        utils.uint8_to_buf(certificate.type),
        utils.path_to_buf(certificate.path),
        utils.hex_to_buf(certificate.poolKeyHashHex)
      ])
      await _send({
        ins: INS.SIGN_TX,
        p1: P1.STAGE_CERTIFICATES,
        p2: P2.UNUSED,
        data,
        expectedResponseLength: 0,
      });
      break;
    }
    case CertificateType.STAKE_POOL_REGISTRATION: {
      // additional data for pool certificate
      const enum P2 {
        UNUSED = 0x00,
        POOL_PARAMS = 0x30,
        OWNERS = 0x31,
        RELAYS = 0x32,
        METADATA = 0x33,
        CONFIRMATION = 0x34,
      }

      const data = Buffer.concat([
        utils.uint8_to_buf(certificate.type),
      ])
      await _send({
        ins: INS.SIGN_TX,
        p1: P1.STAGE_CERTIFICATES,
        p2: P2.UNUSED,
        data,
        expectedResponseLength: 0,
      });

      const pool = certificate.pool
      await _send({
        ins: INS.SIGN_TX,
        p1: P1.STAGE_CERTIFICATES,
        p2: P2.POOL_PARAMS,
        data: cardano.serializePoolInitialParams(pool),
        expectedResponseLength: 0,
      });

      for (const owner of pool.owners) {
        await _send({
          ins: INS.SIGN_TX,
          p1: P1.STAGE_CERTIFICATES,
          p2: P2.OWNERS,
          data: cardano.serializePoolOwner(owner),
          expectedResponseLength: 0,
        });
      }

      for (const relay of pool.relays) {
        await _send({
          ins: INS.SIGN_TX,
          p1: P1.STAGE_CERTIFICATES,
          p2: P2.RELAYS,
          data: cardano.serializePoolRelay(relay),
          expectedResponseLength: 0,
        });
      }

      await _send({
        ins: INS.SIGN_TX,
        p1: P1.STAGE_CERTIFICATES,
        p2: P2.METADATA,
        data: cardano.serializePoolMetadata(pool.metadata),
        expectedResponseLength: 0,
      });

      await _send({
        ins: INS.SIGN_TX,
        p1: P1.STAGE_CERTIFICATES,
        p2: P2.CONFIRMATION,
        data: Buffer.alloc(0),
        expectedResponseLength: 0,
      });

      break;
    }
    default:
      unreachable(certificate)
  }
};

const signTx_addWithdrawal = async (
  _send: SendFn,
  path: BIP32Path,
  amountStr: string
): Promise<void> => {
  const enum P2 {
    UNUSED = 0x00
  }
  const data = Buffer.concat([
    utils.ada_amount_to_buf(amountStr),
    utils.path_to_buf(path),
  ]);
  await _send({
    ins: INS.SIGN_TX,
    p1: P1.STAGE_WITHDRAWALS,
    p2: P2.UNUSED,
    data,
    expectedResponseLength: 0,
  });
};

const signTx_setFee = async (
  _send: SendFn,
  feeStr: string): Promise<void> => {
  const enum P2 {
    UNUSED = 0x00
  }
  const data = Buffer.concat([utils.ada_amount_to_buf(feeStr)]);
  await _send({
    ins: INS.SIGN_TX,
    p1: P1.STAGE_FEE,
    p2: P2.UNUSED,
    data,
    expectedResponseLength: 0,
  });
};

const signTx_setTtl = async (
  _send: SendFn,
  ttlStr: string
): Promise<void> => {
  const enum P2 {
    UNUSED = 0x00
  }
  const data = Buffer.concat([utils.uint64_to_buf(ttlStr)]);
  await _send({
    ins: INS.SIGN_TX,
    p1: P1.STAGE_TTL,
    p2: P2.UNUSED,
    data,
    expectedResponseLength: 0,
  });
};

const signTx_setMetadata = async (
  _send: SendFn,
  metadataHashHex: string
): Promise<void> => {
  const enum P2 {
    UNUSED = 0x00
  }
  const data = utils.hex_to_buf(metadataHashHex);

  await _send({
    ins: INS.SIGN_TX,
    p1: P1.STAGE_METADATA,
    p2: P2.UNUSED,
    data,
    expectedResponseLength: 0,
  });
};

const signTx_setValidityIntervalStart = async (
  _send: SendFn,
  validityIntervalStartStr: string
): Promise<void> => {
  const enum P2 {
    UNUSED = 0x00
  }
  const data = Buffer.concat([utils.uint64_to_buf(validityIntervalStartStr)]);
  await _send({
    ins: INS.SIGN_TX,
    p1: P1.STAGE_VALIDITY_INTERVAL_START,
    p2: P2.UNUSED,
    data,
  });
};

const signTx_awaitConfirm = async (
  _send: SendFn,
  flags: {
    appHasMultiassetSupport: boolean
  }
): Promise<{
  txHashHex: string;
}> => {
  const enum P2 {
    UNUSED = 0x00
  }

  const response = await _send({
    ins: INS.SIGN_TX,
    p1: flags.appHasMultiassetSupport ? P1.STAGE_CONFIRM : P1.STAGE_CONFIRM_BEFORE_2_2,
    p2: P2.UNUSED,
    data: Buffer.alloc(0),
    expectedResponseLength: cardano.TX_HASH_LENGTH,
  });
  return {
    txHashHex: response.toString("hex"),
  };
};

const signTx_getWitness = async (
  _send: SendFn,
  path: BIP32Path,
  flags: {
    appHasMultiassetSupport: boolean
  }
): Promise<{
  path: BIP32Path;
  witnessSignatureHex: string;
}> => {
  const enum P2 {
    UNUSED = 0x00
  }

  const data = Buffer.concat([utils.path_to_buf(path)]);
  const response = await _send({
    ins: INS.SIGN_TX,
    p1: flags.appHasMultiassetSupport ? P1.STAGE_WITNESSES : P1.STAGE_WITNESSES_BEFORE_2_2,
    p2: P2.UNUSED,
    data,
    expectedResponseLength: 64,
  });
  return {
    path: path,
    witnessSignatureHex: utils.buf_to_hex(response),
  };
};

export async function signTransaction(
  _send: SendFn,
  network: Network,
  inputs: Array<InputTypeUTxO>,
  outputs: Array<TxOutput>,
  feeStr: string,
  ttlStr: string | null,
  certificates: Array<Certificate>,
  withdrawals: Array<Withdrawal>,
  metadataHashHex?: string | null,
  validityIntervalStartStr?: string | null
): Promise<SignTransactionResponse> {
  // pool registrations are quite restricted
  // this affects witness set construction and many validations
  const isSigningPoolRegistrationAsOwner = certificates.some(
    (cert) => cert.type === CertificateType.STAKE_POOL_REGISTRATION
  );

  const appHasStakePoolOwnerSupport = await isLedgerAppVersionAtLeast(
    _send,
    2,
    1
  );
  if (isSigningPoolRegistrationAsOwner && !appHasStakePoolOwnerSupport) {
    throw Error(Errors.INCORRECT_APP_VERSION);
  }

  // TODO replace this with a better mechanism for detecting ledger app capabilities
  const appHasMultiassetSupport = await isLedgerAppVersionAtLeast(_send, 2, 2);
  if (!appHasMultiassetSupport) {
    const containsMultiassets = outputs.some(
      (output) => output.tokenBundle != null
    );

    // for older app versions:
    // multiasset outputs must not be given
    // validity interval start must not be given
    // ttl must be given
    if (
      containsMultiassets ||
      validityIntervalStartStr != null ||
      ttlStr == null
    ) {
      throw Error(Errors.INCORRECT_APP_VERSION);
    }
  }

  validateTransaction(
    network,
    inputs,
    outputs,
    feeStr,
    ttlStr,
    certificates,
    withdrawals,
    metadataHashHex,
    validityIntervalStartStr
  );


  const witnessPaths = [];
  if (isSigningPoolRegistrationAsOwner) {
    // there should be exactly one owner given by path which will be used for the witness
    Assert.assert(certificates.length == 1);
    invariant(certificates[0].poolRegistrationParams != null);

    const owners = certificates[0].poolRegistrationParams.poolOwners;
    const witnessOwner = owners.find((owner) => !!owner.stakingPath);
    invariant(witnessOwner != null);

    witnessPaths.push(witnessOwner.stakingPath);
  } else {
    // we collect required witnesses for inputs, certificates and withdrawals
    // each path is included only once
    const witnessPathsSet = new Set();
    for (const { path } of [...inputs, ...certificates, ...withdrawals]) {
      const pathKey = JSON.stringify(path);
      if (!witnessPathsSet.has(pathKey)) {
        witnessPathsSet.add(pathKey);
        witnessPaths.push(path);
      }
    }
  }

  await signTx_init(
    _send,
    network,
    inputs.length,
    outputs.length,
    ttlStr != null,
    certificates.length,
    withdrawals.length,
    metadataHashHex != null,
    validityIntervalStartStr != null,
    witnessPaths.length, { appHasStakePoolOwnerSupport, appHasMultiassetSupport, isSigningPoolRegistrationAsOwner }
  );

  // inputs
  for (const input of inputs) {
    await signTx_addInput(_send, input);
  }

  // outputs
  for (const output of outputs) {
    await signTx_addOutput(_send, output, network, { appHasMultiassetSupport });
  }

  await signTx_setFee(_send, feeStr);

  if (ttlStr != null) {
    await signTx_setTtl(_send, ttlStr);
  }

  for (const certificate of parseCertificates(certificates)) {
    await signTx_addCertificate(_send, certificate);
  }

  if (withdrawals.length > 0) {
    for (const withdrawal of withdrawals) {
      await signTx_addWithdrawal(_send, withdrawal.path, withdrawal.amountStr);
    }
  }

  if (metadataHashHex != null) {
    await signTx_setMetadata(_send, metadataHashHex);
  }

  if (validityIntervalStartStr != null) {
    await signTx_setValidityIntervalStart(_send, validityIntervalStartStr);
  }

  // confirm
  const { txHashHex } = await signTx_awaitConfirm(_send, { appHasMultiassetSupport });

  // witnesses
  const witnesses = [];
  for (const path of witnessPaths) {
    invariant(path != null);
    Precondition.checkIsValidPath(
      path,
      "Invalid path to witness has been supplied"
    );

    const witness = await signTx_getWitness(_send, path, { appHasMultiassetSupport });
    witnesses.push(witness);
  }

  return {
    txHashHex,
    witnesses,
  };
}
