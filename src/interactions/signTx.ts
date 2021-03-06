import type { SendFn, } from "../Ada";
import { Errors, } from "../Ada"
import cardano, { SignTxIncluded } from "../cardano";
import { buf_to_hex, hex_to_buf, path_to_buf, uint8_to_buf, uint32_to_buf, uint64_to_buf } from "../serializeUtils";
import type { HexString, ParsedCertificate, ParsedInput, ParsedOutput, ParsedTransaction, ParsedWithdrawal, Uint8_t, Uint32_t, Uint64_str, ValidBIP32Path, Version } from "../types/internal";
import { CertificateType, PoolOwnerType } from "../types/internal";
import type { SignTransactionResponse, } from '../types/public'
import utils, { assert, unreachable } from "../utils";
import { INS } from "./common/ins";
import type { Interaction, SendParams } from "./common/types";
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

const send = (params: {
  p1: number,
  p2: number,
  data: Buffer,
  expectedResponseLength?: number
}): SendParams => ({ ins: INS.SIGN_TX, ...params })


function* signTx_init(
  tx: ParsedTransaction,
  wittnessPaths: ValidBIP32Path[],
  flags: {
    appHasStakePoolOwnerSupport: boolean,
    appHasMultiassetSupport: boolean,
  }
): Interaction<void> {
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
  const _response = yield send({
    p1: P1.STAGE_INIT,
    p2: P2.UNUSED,
    data,
    expectedResponseLength: 0,
  });
}

function* signTx_addInput(
  input: ParsedInput
): Interaction<void> {
  const enum P2 {
    UNUSED = 0x00,
  }
  const data = Buffer.concat([
    hex_to_buf(input.txHashHex),
    uint32_to_buf(input.outputIndex),
  ]);
  yield send({
    p1: P1.STAGE_INPUTS,
    p2: P2.UNUSED,
    data,
    expectedResponseLength: 0,
  });
}

function* signTx_addOutputBefore_2_2(
  output: ParsedOutput,
): Interaction<void> {
  const enum P2 {
    UNUSED = 0x00,
  }

  const data = cardano.serializeOutputBasicParamsBefore_2_2(
    output,
  );

  yield send({
    p1: P1.STAGE_OUTPUTS,
    p2: P2.UNUSED,
    data,
    expectedResponseLength: 0,
  });

}

function* signTx_addOutput(
  output: ParsedOutput,
  flags: {
    appHasMultiassetSupport: boolean
  }
): Interaction<void> {
  if (!flags.appHasMultiassetSupport) {
    return yield* signTx_addOutputBefore_2_2(output)
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

    yield send({
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
    yield send({
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
      yield send({
        p1: P1.STAGE_OUTPUTS,
        p2: P2.TOKEN,
        data,
        expectedResponseLength: 0,
      });
    }
  }

  yield send({
    p1: P1.STAGE_OUTPUTS,
    p2: P2.CONFIRM,
    data: Buffer.alloc(0),
    expectedResponseLength: 0,
  });
}

function* signTx_addCertificate(
  certificate: ParsedCertificate,
): Interaction<void> {
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
      yield send({
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
      yield send({
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
      yield send({
        p1: P1.STAGE_CERTIFICATES,
        p2: P2.UNUSED,
        data,
        expectedResponseLength: 0,
      });

      const pool = certificate.pool
      yield send({
        p1: P1.STAGE_CERTIFICATES,
        p2: P2.POOL_PARAMS,
        data: cardano.serializePoolInitialParams(pool),
        expectedResponseLength: 0,
      });

      for (const owner of pool.owners) {
        yield send({
          p1: P1.STAGE_CERTIFICATES,
          p2: P2.OWNERS,
          data: cardano.serializePoolOwner(owner),
          expectedResponseLength: 0,
        });
      }

      for (const relay of pool.relays) {
        yield send({
          p1: P1.STAGE_CERTIFICATES,
          p2: P2.RELAYS,
          data: cardano.serializePoolRelay(relay),
          expectedResponseLength: 0,
        });
      }

      yield send({
        p1: P1.STAGE_CERTIFICATES,
        p2: P2.METADATA,
        data: cardano.serializePoolMetadata(pool.metadata),
        expectedResponseLength: 0,
      });

      yield send({
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
}

function* signTx_addWithdrawal(
  withdrawal: ParsedWithdrawal
): Interaction<void> {
  const enum P2 {
    UNUSED = 0x00
  }
  const data = Buffer.concat([
    uint64_to_buf(withdrawal.amountStr),
    path_to_buf(withdrawal.path),
  ]);
  yield send({
    p1: P1.STAGE_WITHDRAWALS,
    p2: P2.UNUSED,
    data,
    expectedResponseLength: 0,
  });
}

function* signTx_setFee(
  feeStr: Uint64_str
): Interaction<void> {
  const enum P2 {
    UNUSED = 0x00
  }
  const data = Buffer.concat([uint64_to_buf(feeStr)]);
  yield send({
    p1: P1.STAGE_FEE,
    p2: P2.UNUSED,
    data,
    expectedResponseLength: 0,
  });
}

function* signTx_setTtl(
  ttlStr: Uint64_str
): Interaction<void> {
  const enum P2 {
    UNUSED = 0x00
  }
  const data = Buffer.concat([uint64_to_buf(ttlStr)]);
  yield send({
    p1: P1.STAGE_TTL,
    p2: P2.UNUSED,
    data,
    expectedResponseLength: 0,
  });
}

function* signTx_setMetadata(
  metadataHashHex: HexString
): Interaction<void> {
  const enum P2 {
    UNUSED = 0x00
  }
  const data = utils.hex_to_buf(metadataHashHex);

  yield send({
    p1: P1.STAGE_METADATA,
    p2: P2.UNUSED,
    data,
    expectedResponseLength: 0,
  });
}

function* signTx_setValidityIntervalStart(
  validityIntervalStartStr: Uint64_str
): Interaction<void> {
  const enum P2 {
    UNUSED = 0x00
  }
  const data = Buffer.concat([uint64_to_buf(validityIntervalStartStr)]);
  yield send({
    p1: P1.STAGE_VALIDITY_INTERVAL_START,
    p2: P2.UNUSED,
    data,
  });
}

function* signTx_awaitConfirm(
  flags: {
    appHasMultiassetSupport: boolean
  }
): Interaction<{ txHashHex: string; }> {
  const enum P2 {
    UNUSED = 0x00
  }

  const response = yield send({
    p1: flags.appHasMultiassetSupport ? P1.STAGE_CONFIRM : P1.STAGE_CONFIRM_BEFORE_2_2,
    p2: P2.UNUSED,
    data: Buffer.alloc(0),
    expectedResponseLength: cardano.TX_HASH_LENGTH,
  });
  return {
    txHashHex: response.toString("hex"),
  };
}

function* signTx_getWitness(
  path: ValidBIP32Path,
  flags: {
    appHasMultiassetSupport: boolean
  }
): Interaction<{
  path: ValidBIP32Path;
  witnessSignatureHex: string;
}> {
  const enum P2 {
    UNUSED = 0x00
  }

  const data = Buffer.concat([path_to_buf(path)]);
  const response = yield send({
    p1: flags.appHasMultiassetSupport ? P1.STAGE_WITNESSES : P1.STAGE_WITNESSES_BEFORE_2_2,
    p2: P2.UNUSED,
    data,
    expectedResponseLength: 64,
  });
  return {
    path: path,
    witnessSignatureHex: buf_to_hex(response),
  };
}


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

export function* signTransaction(version: Version, tx: ParsedTransaction): Interaction<SignTransactionResponse> {
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
  yield* signTx_init(
    tx, witnessPaths,
    { appHasStakePoolOwnerSupport, appHasMultiassetSupport }
  );

  // inputs
  for (const input of tx.inputs) {
    yield* signTx_addInput(input);
  }

  // outputs
  for (const output of tx.outputs) {
    yield* signTx_addOutput(output, { appHasMultiassetSupport });
  }

  // fee
  yield* signTx_setFee(tx.feeStr);

  // ttl
  if (tx.ttlStr != null) {
    yield* signTx_setTtl(tx.ttlStr);
  }

  // certificates
  for (const certificate of tx.certificates) {
    yield* signTx_addCertificate(certificate);
  }

  // withdrawals
  for (const withdrawal of tx.withdrawals) {
    yield* signTx_addWithdrawal(withdrawal);
  }

  // metadata
  if (tx.metadataHashHex != null) {
    yield* signTx_setMetadata(tx.metadataHashHex);
  }

  // validity start
  if (tx.validityIntervalStartStr != null) {
    yield* signTx_setValidityIntervalStart(tx.validityIntervalStartStr);
  }

  // confirm
  const { txHashHex } = yield* signTx_awaitConfirm({ appHasMultiassetSupport });

  // witnesses
  const witnesses = [];
  for (const path of witnessPaths) {
    const witness = yield* signTx_getWitness(path, { appHasMultiassetSupport });
    witnesses.push(witness);
  }

  return {
    txHashHex,
    witnesses,
  };
}
