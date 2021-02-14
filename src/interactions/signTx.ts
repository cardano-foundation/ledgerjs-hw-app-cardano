import type {
  BIP32Path,
  Certificate,
  InputTypeUTxO,
  Network,
  PoolParams,
  SendFn,
  SignTransactionResponse,
  TxOutput,
  Withdrawal,
} from "../Ada";
import {
  CertificateType,
  Errors,
} from "../Ada"
import cardano, { SignTxIncluded } from "../cardano";
import utils, { Assert, invariant, Precondition } from "../utils";
import { INS } from "./common/ins";
import { wrapRetryStillInCall } from "./common/retry";
import { isLedgerAppVersionAtLeast } from "./getVersion";

const PoolRegistrationCodes = {
  SIGN_TX_POOL_REGISTRATION_NO: 3,
  SIGN_TX_POOL_REGISTRATION_YES: 4,
};


const P1_STAGE_INIT = 0x01;
const P1_STAGE_INPUTS = 0x02;
const P1_STAGE_OUTPUTS = 0x03;
const P1_STAGE_FEE = 0x04;
const P1_STAGE_TTL = 0x05;
const P1_STAGE_CERTIFICATES = 0x06;
const P1_STAGE_WITHDRAWALS = 0x07;
const P1_STAGE_METADATA = 0x08;
const P1_STAGE_VALIDITY_INTERVAL_START = 0x09;
const P1_STAGE_CONFIRM = 0x0a;
const P1_STAGE_WITNESSES = 0x0f;
const P2_UNUSED = 0x00;


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
    p1: P1_STAGE_INIT,
    p2: P2_UNUSED,
    data,
    expectedResponseLength: 0,
  });
};

const signTx_addInput = async (
  _send: SendFn,
  input: InputTypeUTxO
): Promise<void> => {
  const data = Buffer.concat([
    utils.hex_to_buf(input.txHashHex),
    utils.uint32_to_buf(input.outputIndex),
  ]);
  await _send({
    ins: INS.SIGN_TX,
    p1: P1_STAGE_INPUTS,
    p2: P2_UNUSED,
    data,
    expectedResponseLength: 0,
  });
};

const signTx_addOutput = async (
  _send: SendFn,
  output: TxOutput,
  network: Network,
  flags: {
    appHasMultiassetSupport: boolean
  }
): Promise<void> => {
  const P2_BASIC_DATA = 0x30;
  const P2_ASSET_GROUP = 0x31;
  const P2_TOKEN = 0x32;
  const P2_CONFIRM = 0x33;

  // TODO remove the Before_2_2 version after ledger app 2.2 is rolled out
  let outputData;
  let outputP2;
  if (flags.appHasMultiassetSupport) {
    outputData = cardano.serializeOutputBasicParams(
      output,
      network
    );
    outputP2 = P2_BASIC_DATA;
  } else {
    outputData = cardano.serializeOutputBasicParamsBefore_2_2(
      output,
      network
    );
    outputP2 = P2_UNUSED;
  }

  await _send({
    ins: INS.SIGN_TX,
    p1: P1_STAGE_OUTPUTS,
    p2: outputP2,
    data: outputData,
    expectedResponseLength: 0,
  });

  if (output.tokenBundle != null) {
    for (const assetGroup of output.tokenBundle) {
      const data = Buffer.concat([
        utils.hex_to_buf(assetGroup.policyIdHex),
        utils.uint32_to_buf(assetGroup.tokens.length),
      ]);
      await _send({
        ins: INS.SIGN_TX,
        p1: P1_STAGE_OUTPUTS,
        p2: P2_ASSET_GROUP,
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
          p1: P1_STAGE_OUTPUTS,
          p2: P2_TOKEN,
          data,
          expectedResponseLength: 0,
        });
      }
    }
  }

  // TODO remove the if condition after ledger app 2.2 is rolled out
  if (flags.appHasMultiassetSupport) {
    await _send({
      ins: INS.SIGN_TX,
      p1: P1_STAGE_OUTPUTS,
      p2: P2_CONFIRM,
      data: Buffer.alloc(0),
      expectedResponseLength: 0,
    });
  }
};

const signTx_addCertificate = async (
  _send: SendFn,
  certificate: Certificate,
  isSigningPoolRegistrationAsOwner: boolean
): Promise<void> => {
  const dataFields = [utils.uint8_to_buf(certificate.type)];

  switch (certificate.type) {
    case CertificateType.STAKE_REGISTRATION:
    case CertificateType.STAKE_DEREGISTRATION:
    case CertificateType.STAKE_DELEGATION: {
      if (certificate.path != null) dataFields.push(utils.path_to_buf(certificate.path));
      break;
    }
    case CertificateType.STAKE_POOL_REGISTRATION: {
      Assert.assert(
        isSigningPoolRegistrationAsOwner,
        "tx certificates validation messed up"
      );
      // OK, data are serialized and sent later in additional APDUs
      break;
    }
    default:
      // validation should catch invalid certificate type
      Assert.assert(false, "invalid certificate type");
  }

  if (certificate.poolKeyHashHex != null) {
    dataFields.push(utils.hex_to_buf(certificate.poolKeyHashHex));
  }

  const data = Buffer.concat(dataFields);
  await _send({
    ins: INS.SIGN_TX,
    p1: P1_STAGE_CERTIFICATES,
    p2: P2_UNUSED,
    data,
    expectedResponseLength: 0,
  });

  // we are done for every certificate except pool registration

  if (certificate.type === CertificateType.STAKE_POOL_REGISTRATION) {
    invariant(certificate.poolRegistrationParams != null);

    // additional data for pool certificate
    const APDU_INSTRUCTIONS = {
      POOL_PARAMS: 0x30,
      OWNERS: 0x31,
      RELAYS: 0x32,
      METADATA: 0x33,
      CONFIRMATION: 0x34,
    };

    await _send({
      ins: INS.SIGN_TX,
      p1: P1_STAGE_CERTIFICATES,
      p2: APDU_INSTRUCTIONS.POOL_PARAMS,
      data: cardano.serializePoolInitialParams(certificate.poolRegistrationParams),
      expectedResponseLength: 0,
    });

    for (const owner of certificate.poolRegistrationParams.poolOwners) {
      await _send({
        ins: INS.SIGN_TX,
        p1: P1_STAGE_CERTIFICATES,
        p2: APDU_INSTRUCTIONS.OWNERS,
        data: cardano.serializePoolOwnerParams(owner),
        expectedResponseLength: 0,
      });
    }
    for (const relay of certificate.poolRegistrationParams.relays) {
      await _send({
        ins: INS.SIGN_TX,
        p1: P1_STAGE_CERTIFICATES,
        p2: APDU_INSTRUCTIONS.RELAYS,
        data: cardano.serializePoolRelayParams(relay),
        expectedResponseLength: 0,
      });
    }

    await _send({
      ins: INS.SIGN_TX,
      p1: P1_STAGE_CERTIFICATES,
      p2: APDU_INSTRUCTIONS.METADATA,
      data: cardano.serializePoolMetadataParams(certificate.poolRegistrationParams.metadata),
      expectedResponseLength: 0,
    });

    await _send({
      ins: INS.SIGN_TX,
      p1: P1_STAGE_CERTIFICATES,
      p2: APDU_INSTRUCTIONS.CONFIRMATION,
      data: Buffer.alloc(0),
      expectedResponseLength: 0,
    });
  }
};

const signTx_addWithdrawal = async (
  _send: SendFn,
  path: BIP32Path,
  amountStr: string
): Promise<void> => {
  const data = Buffer.concat([
    utils.ada_amount_to_buf(amountStr),
    utils.path_to_buf(path),
  ]);
  await _send({
    ins: INS.SIGN_TX,
    p1: P1_STAGE_WITHDRAWALS,
    p2: P2_UNUSED,
    data,
    expectedResponseLength: 0,
  });
};

const signTx_setFee = async (
  _send: SendFn,
  feeStr: string): Promise<void> => {
  const data = Buffer.concat([utils.ada_amount_to_buf(feeStr)]);
  await _send({
    ins: INS.SIGN_TX,
    p1: P1_STAGE_FEE,
    p2: P2_UNUSED,
    data,
    expectedResponseLength: 0,
  });
};

const signTx_setTtl = async (
  _send: SendFn,
  ttlStr: string
): Promise<void> => {
  const data = Buffer.concat([utils.uint64_to_buf(ttlStr)]);
  await _send({
    ins: INS.SIGN_TX,
    p1: P1_STAGE_TTL,
    p2: P2_UNUSED,
    data,
    expectedResponseLength: 0,
  });
};

const signTx_setMetadata = async (
  _send: SendFn,
  metadataHashHex: string): Promise<void> => {
  const data = utils.hex_to_buf(metadataHashHex);

  await _send({
    ins: INS.SIGN_TX,
    p1: P1_STAGE_METADATA,
    p2: P2_UNUSED,
    data,
    expectedResponseLength: 0,
  });
};

const signTx_setValidityIntervalStart = async (
  _send: SendFn,
  validityIntervalStartStr: string
): Promise<void> => {
  const data = Buffer.concat([utils.uint64_to_buf(validityIntervalStartStr)]);
  await _send({
    ins: INS.SIGN_TX,
    p1: P1_STAGE_VALIDITY_INTERVAL_START,
    p2: P2_UNUSED,
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
  // TODO remove after ledger app 2.2 is rolled out
  let confirmP1;
  if (flags.appHasMultiassetSupport) {
    confirmP1 = P1_STAGE_CONFIRM;
  } else {
    confirmP1 = 0x09; // needed for backward compatibility
  }

  const response = await _send({
    ins: INS.SIGN_TX,
    p1: confirmP1,
    p2: P2_UNUSED,
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
  // TODO remove after ledger app 2.2 is rolled out
  let witnessP1;
  if (flags.appHasMultiassetSupport) {
    witnessP1 = P1_STAGE_WITNESSES;
  } else {
    witnessP1 = 0x0a; // needed for backward compatibility
  }

  const data = Buffer.concat([utils.path_to_buf(path)]);
  const response = await _send({
    ins: INS.SIGN_TX,
    p1: witnessP1,
    p2: P2_UNUSED,
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
  ttlStr: string | undefined,
  certificates: Array<Certificate>,
  withdrawals: Array<Withdrawal>,
  metadataHashHex?: string,
  validityIntervalStartStr?: string
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

  cardano.validateTransaction(
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

  if (certificates.length > 0) {
    for (const certificate of certificates) {
      await signTx_addCertificate(
        _send,
        certificate, isSigningPoolRegistrationAsOwner
      );
    }
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