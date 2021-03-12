import type { HexString, ParsedCertificate, ParsedInput, ParsedOutput, ParsedTransaction, ParsedWithdrawal, Uint64_str, ValidBIP32Path, Version } from "../types/internal";
import { CertificateType, PoolOwnerType, TX_HASH_LENGTH } from "../types/internal";
import type { SignedTransactionData } from '../types/public'
import { assert } from "../utils/assert";
import { buf_to_hex, } from "../utils/serialize";
import { INS } from "./common/ins";
import type { Interaction, SendParams } from "./common/types";
import { ensureLedgerAppVersionCompatible } from "./getVersion";
import { serializePoolInitialParams, serializePoolMetadata, serializePoolOwner, serializePoolRelay } from "./serialization/poolRegistrationCertificate";
import { serializeTxCertificate } from "./serialization/txCertificate";
import { serializeTxInit } from "./serialization/txInit";
import { serializeTxFee, serializeTxInput, serializeTxMetadata, serializeTxTtl, serializeTxValidityStart, serializeTxWithdrawal, serializeTxWitnessRequest } from "./serialization/txOther";
import { serializeAssetGroup, serializeToken, serializeTxOutputBasicParams } from "./serialization/txOutput";

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
): Interaction<void> {
  const enum P2 {
    UNUSED = 0x00,
  }

  const _response = yield send({
    p1: P1.STAGE_INIT,
    p2: P2.UNUSED,
    data: serializeTxInit(tx, wittnessPaths.length),
    expectedResponseLength: 0,
  });
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
  });
}

function* signTx_addOutput(
  output: ParsedOutput,
): Interaction<void> {
  const enum P2 {
    BASIC_DATA = 0x30,
    ASSET_GROUP = 0x31,
    TOKEN = 0x32,
    CONFIRM = 0x33,
  }

  // Basic data
  {
    yield send({
      p1: P1.STAGE_OUTPUTS,
      p2: P2.BASIC_DATA,
      data: serializeTxOutputBasicParams(output),
      expectedResponseLength: 0,
    });
  }

  // Assets
  for (const assetGroup of output.tokenBundle) {
    yield send({
      p1: P1.STAGE_OUTPUTS,
      p2: P2.ASSET_GROUP,
      data: serializeAssetGroup(assetGroup),
      expectedResponseLength: 0,
    });

    for (const token of assetGroup.tokens) {
      yield send({
        p1: P1.STAGE_OUTPUTS,
        p2: P2.TOKEN,
        data: serializeToken(token),
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
  yield send({
    p1: P1.STAGE_CERTIFICATES,
    p2: P2.UNUSED,
    data: serializeTxCertificate(certificate),
    expectedResponseLength: 0,
  });

  // additional data for pool certificate
  if (certificate.type === CertificateType.STAKE_POOL_REGISTRATION) {
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
      data: serializePoolInitialParams(pool),
      expectedResponseLength: 0,
    });

    for (const owner of pool.owners) {
      yield send({
        p1: P1.STAGE_CERTIFICATES,
        p2: P2.OWNERS,
        data: serializePoolOwner(owner),
        expectedResponseLength: 0,
      });
    }

    for (const relay of pool.relays) {
      yield send({
        p1: P1.STAGE_CERTIFICATES,
        p2: P2.RELAYS,
        data: serializePoolRelay(relay),
        expectedResponseLength: 0,
      });
    }

    yield send({
      p1: P1.STAGE_CERTIFICATES,
      p2: P2.METADATA,
      data: serializePoolMetadata(pool.metadata),
      expectedResponseLength: 0,
    });

    yield send({
      p1: P1.STAGE_CERTIFICATES,
      p2: P2.CONFIRMATION,
      data: Buffer.alloc(0),
      expectedResponseLength: 0,
    });
  }
}

function* signTx_addWithdrawal(
  withdrawal: ParsedWithdrawal
): Interaction<void> {
  const enum P2 {
    UNUSED = 0x00
  }

  yield send({
    p1: P1.STAGE_WITHDRAWALS,
    p2: P2.UNUSED,
    data: serializeTxWithdrawal(withdrawal),
    expectedResponseLength: 0,
  });
}

function* signTx_setFee(
  fee: Uint64_str
): Interaction<void> {
  const enum P2 {
    UNUSED = 0x00
  }
  yield send({
    p1: P1.STAGE_FEE,
    p2: P2.UNUSED,
    data: serializeTxFee(fee),
    expectedResponseLength: 0,
  });
}

function* signTx_setTtl(
  ttl: Uint64_str
): Interaction<void> {
  const enum P2 {
    UNUSED = 0x00
  }
  yield send({
    p1: P1.STAGE_TTL,
    p2: P2.UNUSED,
    data: serializeTxTtl(ttl),
    expectedResponseLength: 0,
  });
}

function* signTx_setMetadata(
  metadataHashHex: HexString
): Interaction<void> {
  const enum P2 {
    UNUSED = 0x00
  }
  yield send({
    p1: P1.STAGE_METADATA,
    p2: P2.UNUSED,
    data: serializeTxMetadata(metadataHashHex),
    expectedResponseLength: 0,
  });
}

function* signTx_setValidityIntervalStart(
  validityIntervalStartStr: Uint64_str
): Interaction<void> {
  const enum P2 {
    UNUSED = 0x00
  }
  yield send({
    p1: P1.STAGE_VALIDITY_INTERVAL_START,
    p2: P2.UNUSED,
    data: serializeTxValidityStart(validityIntervalStartStr),
  });
}

function* signTx_awaitConfirm(
): Interaction<{ txHashHex: string; }> {
  const enum P2 {
    UNUSED = 0x00
  }

  const response = yield send({
    p1: P1.STAGE_CONFIRM,
    p2: P2.UNUSED,
    data: Buffer.alloc(0),
    expectedResponseLength: TX_HASH_LENGTH,
  });
  return {
    txHashHex: response.toString("hex"),
  };
}

function* signTx_getWitness(
  path: ValidBIP32Path,
): Interaction<{
  path: ValidBIP32Path;
  witnessSignatureHex: string;
}> {
  const enum P2 {
    UNUSED = 0x00
  }

  const response = yield send({
    p1: P1.STAGE_WITNESSES,
    p2: P2.UNUSED,
    data: serializeTxWitnessRequest(path),
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

export function* signTransaction(version: Version, tx: ParsedTransaction): Interaction<SignedTransactionData> {
  ensureLedgerAppVersionCompatible(version);

  const witnessPaths = generateWitnessPaths(tx)

  // init
  yield* signTx_init(
    tx, witnessPaths,
  );

  // inputs
  for (const input of tx.inputs) {
    yield* signTx_addInput(input);
  }

  // outputs
  for (const output of tx.outputs) {
    yield* signTx_addOutput(output);
  }

  // fee
  yield* signTx_setFee(tx.fee);

  // ttl
  if (tx.ttl != null) {
    yield* signTx_setTtl(tx.ttl);
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
  if (tx.validityIntervalStart != null) {
    yield* signTx_setValidityIntervalStart(tx.validityIntervalStart);
  }

  // confirm
  const { txHashHex } = yield* signTx_awaitConfirm();

  // witnesses
  const witnesses = [];
  for (const path of witnessPaths) {
    const witness = yield* signTx_getWitness(path);
    witnesses.push(witness);
  }

  return {
    txHashHex,
    witnesses,
  };
}
