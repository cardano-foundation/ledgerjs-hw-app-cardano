import type { SendFn, } from "../Ada";
import { Errors, } from "../Ada"
import cardano, { SignTxIncluded } from "../cardano";
import { buf_to_hex, hex_to_buf, path_to_buf, uint8_to_buf, uint32_to_buf, uint64_to_buf } from "../serializeUtils";
import type { HexString, ParsedCertificate, ParsedInput, ParsedOutput, ParsedTransaction, ParsedWithdrawal, Uint8_t, Uint32_t, Uint64_str, ValidBIP32Path, Version } from "../types/internal";
import { CertificateType, PoolOwnerType } from "../types/internal";
import type { SignTransactionResponse, } from '../types/public'
import utils, { assert, unreachable } from "../utils";
import { INS } from "./common/ins";
import { wrapRetryStillInCall } from "./common/retry";
import { isLedgerAppVersionAtLeast } from "./getVersion";

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
  tx: ParsedTransaction,
  wittnessPaths: ValidBIP32Path[],
  flags: {
    appHasStakePoolOwnerSupport: boolean,
    appHasMultiassetSupport: boolean,
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
    const PoolRegistrationCodes = {
      SIGN_TX_POOL_REGISTRATION_NO: 3,
      SIGN_TX_POOL_REGISTRATION_YES: 4,
    };

    return uint8_to_buf(
      (isSigningPoolRegistrationAsOwner
        ? PoolRegistrationCodes.SIGN_TX_POOL_REGISTRATION_YES
        : PoolRegistrationCodes.SIGN_TX_POOL_REGISTRATION_NO) as Uint8_t
    );
  };

  const _serializeIncludeInTxData = (
    hasMultiassetSupport: boolean
  ): Buffer => {
    // TODO remove after Ledger app 2.1 support is not needed anymore
    if (!hasMultiassetSupport) {
      return Buffer.concat([
        uint8_to_buf(
          (tx.metadataHashHex != null
            ? SignTxIncluded.SIGN_TX_INCLUDED_YES
            : SignTxIncluded.SIGN_TX_INCLUDED_NO) as Uint8_t
        ),
      ]);
    } else {
      return Buffer.concat([
        uint8_to_buf(
          (tx.ttlStr != null
            ? SignTxIncluded.SIGN_TX_INCLUDED_YES
            : SignTxIncluded.SIGN_TX_INCLUDED_NO) as Uint8_t
        ),
        uint8_to_buf(
          (tx.metadataHashHex != null
            ? SignTxIncluded.SIGN_TX_INCLUDED_YES
            : SignTxIncluded.SIGN_TX_INCLUDED_NO) as Uint8_t
        ),
        uint8_to_buf(
          (tx.validityIntervalStartStr != null
            ? SignTxIncluded.SIGN_TX_INCLUDED_YES
            : SignTxIncluded.SIGN_TX_INCLUDED_NO) as Uint8_t
        ),
      ]);
    }
  };

  const data = Buffer.concat([
    uint8_to_buf(tx.network.networkId),
    uint32_to_buf(tx.network.protocolMagic),
    _serializeIncludeInTxData(flags.appHasMultiassetSupport),
    _serializePoolRegistrationCode(tx.isSigningPoolRegistrationAsOwner),
    uint32_to_buf(tx.inputs.length as Uint32_t),
    uint32_to_buf(tx.outputs.length as Uint32_t),
    uint32_to_buf(tx.certificates.length as Uint32_t),
    uint32_to_buf(tx.withdrawals.length as Uint32_t),
    uint32_to_buf(wittnessPaths.length as Uint32_t),
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
  input: ParsedInput
): Promise<void> => {
  const enum P2 {
    UNUSED = 0x00,
  }
  const data = Buffer.concat([
    hex_to_buf(input.txHashHex),
    uint32_to_buf(input.outputIndex),
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
  output: ParsedOutput,
) => {
  const enum P2 {
    UNUSED = 0x00,
  }

  const data = cardano.serializeOutputBasicParamsBefore_2_2(
    output,
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
  output: ParsedOutput,
  flags: {
    appHasMultiassetSupport: boolean
  }
): Promise<void> => {
  if (!flags.appHasMultiassetSupport) {
    return await signTx_addOutputBefore_2_2(_send, output)
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
  for (const assetGroup of output.tokenBundle) {
    const data = Buffer.concat([
      hex_to_buf(assetGroup.policyIdHex),
      uint32_to_buf(assetGroup.tokens.length as Uint32_t),
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
        uint32_to_buf(token.assetNameHex.length / 2 as Uint32_t),
        hex_to_buf(token.assetNameHex),
        uint64_to_buf(token.amountStr),
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
        uint8_to_buf(certificate.type as Uint8_t),
        path_to_buf(certificate.path)
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
        uint8_to_buf(certificate.type as Uint8_t),
        path_to_buf(certificate.path),
        hex_to_buf(certificate.poolKeyHashHex)
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
        uint8_to_buf(certificate.type as Uint8_t),
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
  withdrawal: ParsedWithdrawal
): Promise<void> => {
  const enum P2 {
    UNUSED = 0x00
  }
  const data = Buffer.concat([
    uint64_to_buf(withdrawal.amountStr),
    path_to_buf(withdrawal.path),
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
  feeStr: Uint64_str): Promise<void> => {
  const enum P2 {
    UNUSED = 0x00
  }
  const data = Buffer.concat([uint64_to_buf(feeStr)]);
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
  ttlStr: Uint64_str
): Promise<void> => {
  const enum P2 {
    UNUSED = 0x00
  }
  const data = Buffer.concat([uint64_to_buf(ttlStr)]);
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
  metadataHashHex: HexString
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
  validityIntervalStartStr: Uint64_str
): Promise<void> => {
  const enum P2 {
    UNUSED = 0x00
  }
  const data = Buffer.concat([uint64_to_buf(validityIntervalStartStr)]);
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
  path: ValidBIP32Path,
  flags: {
    appHasMultiassetSupport: boolean
  }
): Promise<{
  path: ValidBIP32Path;
  witnessSignatureHex: string;
}> => {
  const enum P2 {
    UNUSED = 0x00
  }

  const data = Buffer.concat([path_to_buf(path)]);
  const response = await _send({
    ins: INS.SIGN_TX,
    p1: flags.appHasMultiassetSupport ? P1.STAGE_WITNESSES : P1.STAGE_WITNESSES_BEFORE_2_2,
    p2: P2.UNUSED,
    data,
    expectedResponseLength: 64,
  });
  return {
    path: path,
    witnessSignatureHex: buf_to_hex(response),
  };
};


function generateWitnessPaths(tx: ParsedTransaction): ValidBIP32Path[] {
  if (tx.isSigningPoolRegistrationAsOwner) {
    // there should be exactly one owner given by path which will be used for the witness
    assert(tx.certificates.length == 1, "bad certificates length");
    const cert = tx.certificates[0]
    assert(cert.type === CertificateType.STAKE_POOL_REGISTRATION, "bad certificate type");

    const witnessOwner = cert.pool.owners.find((owner) => owner.type === PoolOwnerType.PATH);
    assert(witnessOwner != null, "missing witness owner");
    assert(witnessOwner.type === PoolOwnerType.PATH, "bad witness owner type")
    return [witnessOwner.path]
  } else {
    // we collect required witnesses for inputs, certificates and withdrawals
    // each path is included only once
    const witnessPaths: Record<string, ValidBIP32Path> = {}
    // eslint-disable-next-line no-inner-declarations
    function _insert(path: ValidBIP32Path) {
      const pathKey = JSON.stringify(path);
      witnessPaths[pathKey] = path
    }

    for (const input of tx.inputs) {
      assert(input.path != null, "input missing path")
      _insert(input.path)
    }
    for (const cert of tx.certificates) {
      assert(cert.type !== CertificateType.STAKE_POOL_REGISTRATION, "wrong cert type")
      _insert(cert.path)
    }
    for (const withdrawal of tx.withdrawals) {
      _insert(withdrawal.path)
    }

    return Object.values(witnessPaths)
  }
}

export async function signTransaction(_send: SendFn, version: Version, tx: ParsedTransaction): Promise<SignTransactionResponse> {
  const appHasStakePoolOwnerSupport = isLedgerAppVersionAtLeast(version, 2, 1);
  const appHasMultiassetSupport = isLedgerAppVersionAtLeast(version, 2, 2);

  // check capabilities
  if (tx.isSigningPoolRegistrationAsOwner && !appHasStakePoolOwnerSupport) {
    throw Error(Errors.INCORRECT_APP_VERSION);
  }

  if (tx.outputs.some((output) => output.tokenBundle.length > 0) && !appHasMultiassetSupport) {
    throw Error(Errors.INCORRECT_APP_VERSION);
  }

  // for older app versions:
  // multiasset outputs must not be given
  // validity interval start must not be given
  // ttl must be given
  if (
    !appHasMultiassetSupport && (
      tx.validityIntervalStartStr != null ||
      tx.ttlStr == null
    )
  ) {
    throw Error(Errors.INCORRECT_APP_VERSION);
  }

  const witnessPaths = generateWitnessPaths(tx)

  // init
  await signTx_init(
    _send, tx, witnessPaths,
    { appHasStakePoolOwnerSupport, appHasMultiassetSupport }
  );

  // inputs
  for (const input of tx.inputs) {
    await signTx_addInput(_send, input);
  }

  // outputs
  for (const output of tx.outputs) {
    await signTx_addOutput(_send, output, { appHasMultiassetSupport });
  }

  // fee
  await signTx_setFee(_send, tx.feeStr);

  // ttl
  if (tx.ttlStr != null) {
    await signTx_setTtl(_send, tx.ttlStr);
  }

  // certificates
  for (const certificate of tx.certificates) {
    await signTx_addCertificate(_send, certificate);
  }

  // withdrawals
  for (const withdrawal of tx.withdrawals) {
    await signTx_addWithdrawal(_send, withdrawal);
  }

  // metadata
  if (tx.metadataHashHex != null) {
    await signTx_setMetadata(_send, tx.metadataHashHex);
  }

  // validity start
  if (tx.validityIntervalStartStr != null) {
    await signTx_setValidityIntervalStart(_send, tx.validityIntervalStartStr);
  }

  // confirm
  const { txHashHex } = await signTx_awaitConfirm(_send, { appHasMultiassetSupport });

  // witnesses
  const witnesses = [];
  for (const path of witnessPaths) {
    const witness = await signTx_getWitness(_send, path, { appHasMultiassetSupport });
    witnesses.push(witness);
  }

  return {
    txHashHex,
    witnesses,
  };
}
