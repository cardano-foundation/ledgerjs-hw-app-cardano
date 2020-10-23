/********************************************************************************
 *   Ledger Node JS API
 *   (c) 2016-2017 Ledger
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 ********************************************************************************/
// @flow

import type Transport from "@ledgerhq/hw-transport";
import { TransportStatusError } from "@ledgerhq/hw-transport";

import utils, { Precondition, Assert } from "./utils";
import cardano from "./cardano";

const CLA = 0xd7;

const INS = {
  GET_VERSION: 0x00,
  GET_SERIAL: 0x01,

  GET_EXT_PUBLIC_KEY: 0x10,
  DERIVE_ADDRESS: 0x11,

  SIGN_TX: 0x21,

  RUN_TESTS: 0xf0
};

export const CertTypes = Object.freeze({
  staking_key_registration: 0,
  staking_key_deregistration: 1,
  delegation: 2,
});

export type BIP32Path = Array<number>;

export type InputTypeUTxO = {|
  txHashHex: string,
  outputIndex: number,
  path: ?BIP32Path
|};

export type OutputTypeAddress = {|
  amountStr: string,
  addressHex: string
|};

export type OutputTypeAddressParams = {|
  addressTypeNibble: $Values<typeof AddressTypeNibbles>,
  spendingPath: BIP32Path,
  amountStr: string,
  stakingPath: ?BIP32Path,
  stakingKeyHashHex: ?string,
  stakingBlockchainPointer: ?StakingBlockchainPointer,
  amountStr: string
|};

export type StakingBlockchainPointer = {|
  blockIndex: number,
  txIndex: number,
  certificateIndex: number
|}

export type PoolOwnerParams = {|
  stakingPath: ?BIP32Path,
  stakingKeyHashHex: ?string
|}

export type SingleHostIPRelay = {|
  portNumber: ?number,
  ipv4Hex: ?string, // TODO something more natural?
  ipv6Hex: ?string // TODO something more natural?
|}

export type SingleHostNameRelay = {|
  portNumber: ?number,
  dnsName: string
|}

export type MultiHostNameRelay = {|
  dnsName: string
|}

export type RelayParams = {|
  type: number, // single host ip = 0, single hostname = 1, multi host name = 2
  params: SingleHostIPRelay | SingleHostNameRelay | MultiHostNameRelay
|}

export type PoolMetadataParams = {|
  metadataUrl: string,
  metadataHashHex: string
|}

export type Margin = {|
  numeratorStr: string,
  denominatorStr: string,
|}

export type PoolParams = {|
  poolKeyHashHex: string,
  vrfKeyHashHex: string,
  pledgeStr: string,
  costStr: string,
  margin: Margin,
  rewardAccountHex: string,
  poolOwners: Array<PoolOwnerParams>,
  relays: Array<RelayParams>,
  metadata: PoolMetadataParams
|};

export type Certificate = {|
  type: $Values<typeof CertTypes>,
  path: BIP32Path,
  poolKeyHashHex: ?string,
  poolRegistrationParams: ?PoolParams
|};

export type Withdrawal = {|
  path: BIP32Path,
  amountStr: string
|};

export type Flags = {|
  isDebug: boolean
|};

export type GetVersionResponse = {|
  major: string,
  minor: string,
  patch: string,
  flags: Flags
|};

export type GetSerialResponse = {|
  serial: string
|};

export type DeriveAddressResponse = {|
  addressHex: string
|};

export type GetExtendedPublicKeyResponse = {|
  publicKeyHex: string,
  chainCodeHex: string
|};

export type Witness = {|
  path: BIP32Path,
  // Note: this is *only* a signature
  // you need to add proper extended public key
  // to form a full witness
  witnessSignatureHex: string
|};

export type SignTransactionResponse = {|
  txHashHex: string,
  witnesses: Array<Witness>
|};

export const AddressTypeNibbles = Object.freeze({
  BASE: 0b0000,
  POINTER: 0b0100,
  ENTERPRISE: 0b0110,
  BYRON: 0b1000,
  REWARD: 0b1110
});

const MetadataCodes = {
	SIGN_TX_METADATA_NO: 1,
	SIGN_TX_METADATA_YES: 2
}

const PoolRegistrationCodes = {
	SIGN_TX_POOL_REGISTRATION_NO: 3,
	SIGN_TX_POOL_REGISTRATION_YES: 4
}

const TxOutputTypeCodes = {
  SIGN_TX_OUTPUT_TYPE_ADDRESS: 1,
  SIGN_TX_OUTPUT_TYPE_ADDRESS_PARAMS: 2
}


const CertificateTypes = {
	STAKE_REGISTRATION: 0,
	STAKE_DEREGISTRATION: 1,
	STAKE_DELEGATION: 2,
	STAKE_POOL_REGISTRATION : 3
}

export const ErrorCodes = {
  ERR_STILL_IN_CALL: 0x6e04, // internal
  ERR_INVALID_DATA: 0x6e07,
  ERR_INVALID_BIP_PATH: 0x6e08,
  ERR_REJECTED_BY_USER: 0x6e09,
  ERR_REJECTED_BY_POLICY: 0x6e10,
  ERR_DEVICE_LOCKED: 0x6e11,
  ERR_UNSUPPORTED_ADDRESS_TYPE: 0x6e12,

  // Not thrown by ledger-app-cardano itself but other apps
  ERR_CLA_NOT_SUPPORTED: 0x6e00
};

const GH_ERRORS_LINK =
  "https://github.com/cardano-foundation/ledger-app-cardano/blob/master/src/errors.h";

const ErrorMsgs = {
  [ErrorCodes.ERR_INVALID_DATA]: "Invalid data supplied to Ledger",
  [ErrorCodes.ERR_INVALID_BIP_PATH]:
    "Invalid derivation path supplied to Ledger",
  [ErrorCodes.ERR_REJECTED_BY_USER]: "Action rejected by user",
  [ErrorCodes.ERR_REJECTED_BY_POLICY]:
    "Action rejected by Ledger's security policy",
  [ErrorCodes.ERR_DEVICE_LOCKED]: "Device is locked",
  [ErrorCodes.ERR_CLA_NOT_SUPPORTED]: "Wrong Ledger app",
  [ErrorCodes.ERR_UNSUPPORTED_ADDRESS_TYPE]: "Unsupported address type"
};

export const getErrorDescription = (statusCode: number) => {
  const statusCodeHex = `0x${statusCode.toString(16)}`;
  const defaultMsg = `General error ${statusCodeHex}. Please consult ${GH_ERRORS_LINK}`;

  return ErrorMsgs[statusCode] || defaultMsg;
};

// It can happen that we try to send a message to the device
// when the device thinks it is still in a middle of previous ADPU stream.
// This happens mostly if host does abort communication for some reason
// leaving ledger mid-call.
// In this case Ledger will respond by ERR_STILL_IN_CALL *and* resetting its state to
// default. We can therefore transparently retry the request.
// Note though that only the *first* request in an multi-APDU exchange should be retried.
const wrapRetryStillInCall = fn => async (...args: any) => {
  try {
    return await fn(...args);
  } catch (e) {
    if (e && e.statusCode && e.statusCode === ErrorCodes.ERR_STILL_IN_CALL) {
      // Do the retry
      return await fn(...args);
    }
    throw e;
  }
};

const wrapConvertError = fn => async (...args) => {
  try {
    return await fn(...args);
  } catch (e) {
    if (e && e.statusCode) {
      // keep HwTransport.TransportStatusError
      // just override the message
      e.message = `Ledger device: ${getErrorDescription(e.statusCode)}`;
    }
    throw e;
  }
};

/**
 * Cardano ADA API
 *
 * @example
 * import Ada from "@ledgerhq/hw-app-ada";
 * const ada = new Ada(transport);
 */

type SendFn = (number, number, number, number, Buffer) => Promise<Buffer>;

export default class Ada {
  transport: Transport<*>;
  methods: Array<string>;
  send: SendFn;

  constructor(transport: Transport<*>, scrambleKey: string = "ADA") {
    this.transport = transport;
    this.methods = [
      "getVersion",
      "getSerial",
      "getExtendedPublicKey",
      "signTransaction",
      "deriveAddress",
      "showAddress"
    ];
    this.transport.decorateAppAPIMethods(this, this.methods, scrambleKey);
    this.send = wrapConvertError(this.transport.send);
  }

  async _getVersion(): Promise<GetVersionResponse> {
    const _send = (p1, p2, data) =>
      this.send(CLA, INS.GET_VERSION, p1, p2, data).then(
        utils.stripRetcodeFromResponse
      );
    const P1_UNUSED = 0x00;
    const P2_UNUSED = 0x00;
    const response = await wrapRetryStillInCall(_send)(
      P1_UNUSED,
      P2_UNUSED,
      utils.hex_to_buf("")
    );
    Assert.assert(response.length === 4);
    const [major, minor, patch, flags_value] = response;

    const FLAG_IS_DEBUG = 1;
    //const FLAG_IS_HEADLESS = 2;

    const flags = {
      isDebug: (flags_value & FLAG_IS_DEBUG) === FLAG_IS_DEBUG
    };
    return { major, minor, patch, flags };
  }

  /**
   * Returns an object containing the app version.
   *
   * @returns {Promise<GetVersionResponse>} Result object containing the application version number.
   *
   * @example
   * const { major, minor, patch, flags } = await ada.getVersion();
   * console.log(`App version ${major}.${minor}.${patch}`);
   *
   */
  async getVersion(): Promise<GetVersionResponse> {
    return this._getVersion();
  }

  _isGetSerialSupported(version: GetVersionResponse): boolean {
    const major = parseInt(version.major);
    const minor = parseInt(version.minor);
    const patch = parseInt(version.patch);
    if (isNaN(major) || isNaN(minor) || isNaN(patch))
      return false;

    if (major > 1) {
      return true;
    } else if (major === 1) {
      return minor >= 2;
    } else {
      return false;
    }
  }

  /**
   * Returns an object containing the device serial number.
   *
   * @returns {Promise<GetSerialResponse>} Result object containing the device serial number.
   *
   * @example
   * const { serial } = await ada.getSerial();
   * console.log(`Serial number ${serial}`);
   *
   */
  async getSerial(): Promise<GetSerialResponse> {
    const version = await this._getVersion();
    if (!this._isGetSerialSupported(version))
      throw new Error("getSerial not supported by device firmware");

    const _send = (p1, p2, data) =>
      this.send(CLA, INS.GET_SERIAL, p1, p2, data).then(
        utils.stripRetcodeFromResponse
      );
    const P1_UNUSED = 0x00;
    const P2_UNUSED = 0x00;
    const response = await wrapRetryStillInCall(_send)(
      P1_UNUSED,
      P2_UNUSED,
      utils.hex_to_buf("")
    );
    Assert.assert(response.length === 7);

    const serial = utils.buf_to_hex(response);
    return { serial };
  }

  /**
   * Runs unit tests on the device (DEVEL app build only)
   *
   * @returns {Promise<void>}
   */
  async runTests(): Promise<void> {
    await wrapRetryStillInCall(this.send)(CLA, INS.RUN_TESTS, 0x00, 0x00);
  }

  /**
   * @description Get a public key from the specified BIP 32 path.
   *
   * @param {BIP32Path} indexes The path indexes. Path must begin with `(44 or 1852)'/1815'/n'`, and may be up to 10 indexes long.
   * @return {Promise<GetExtendedPublicKeyResponse>} The public key with chaincode for the given path.
   *
   * @example
   * const { publicKey, chainCode } = await ada.getExtendedPublicKey([ HARDENED + 44, HARDENED + 1815, HARDENED + 1 ]);
   * console.log(publicKey);
   *
   */
  async getExtendedPublicKey(
    path: BIP32Path
  ): Promise<GetExtendedPublicKeyResponse> {
    Precondition.checkIsValidPath(path, "invalid key path");

    const _send = (p1, p2, data) =>
      this.send(CLA, INS.GET_EXT_PUBLIC_KEY, p1, p2, data).then(
        utils.stripRetcodeFromResponse
      );

    const P1_UNUSED = 0x00;
    const P2_UNUSED = 0x00;

    const data = utils.path_to_buf(path);

    const response = await wrapRetryStillInCall(_send)(
      P1_UNUSED,
      P2_UNUSED,
      data
    );

    const [publicKey, chainCode, rest] = utils.chunkBy(response, [32, 32]);
    Assert.assert(rest.length === 0);

    return {
      publicKeyHex: publicKey.toString("hex"),
      chainCodeHex: chainCode.toString("hex")
    };
  }

  /**
   * @description Gets an address from the specified BIP 32 path.
   *
   * @param {BIP32Path} indexes The path indexes. Path must begin with `(44 or 1852)'/1815'/i'/(0 or 1)/j`, and may be up to 10 indexes long.
   * @return {Promise<DeriveAddressResponse>} The address for the given path.
   *
   * @throws 5001 - The path provided does not have the first 3 indexes hardened or 4th index is not 0, 1 or 2
   * @throws 5002 - The path provided is less than 5 indexes
   * @throws 5003 - Some of the indexes is not a number
   *
   * TODO update error codes
   *
   * @example
   * const { address } = await ada.deriveAddress(
   *   0b1000, // byron address
   *   764824073,
   *   [ HARDENED | 44, HARDENED | 1815, HARDENED | 1, 0, 5 ],
   *   null
   *   null
   *   null
   * );
   *
   * @example
   * const { address } = await ada.deriveAddress(
   *   0b0000, // base address
   *   0x00,
   *   [ HARDENED | 1852, HARDENED | 1815, HARDENED | 0, 0, 5 ],
   *   [ HARDENED | 1852, HARDENED | 1815, HARDENED | 0, 2, 0 ]
   *   null
   *   null
   * );
   *
   */
  async deriveAddress(
      addressTypeNibble: $Values<typeof AddressTypeNibbles>,
      networkIdOrProtocolMagic: number,
      spendingPath: BIP32Path,
      stakingPath: ?BIP32Path = null,
      stakingKeyHashHex: ?string = null,
      stakingBlockchainPointer: ?StakingBlockchainPointer = null
      ): Promise<DeriveAddressResponse> {
    const _send = (p1, p2, data) =>
      this.send(CLA, INS.DERIVE_ADDRESS, p1, p2, data).then(
        utils.stripRetcodeFromResponse
      );

    const P1_RETURN = 0x01;
    const P2_UNUSED = 0x00;

    const data = cardano.serializeAddressParams(
      addressTypeNibble,
      networkIdOrProtocolMagic,
      spendingPath,
      stakingPath,
      stakingKeyHashHex,
      stakingBlockchainPointer
    );

    const response = await _send(P1_RETURN, P2_UNUSED, data);

    return {
      addressHex: response.toString('hex')
    };
  }

  async showAddress(
      addressTypeNibble: $Values<typeof AddressTypeNibbles>,
      networkIdOrProtocolMagic: number,
      spendingPath: BIP32Path,
      stakingPath: ?BIP32Path = null,
      stakingKeyHashHex: ?string = null,
      stakingBlockchainPointer: ?StakingBlockchainPointer = null
  ): Promise<void> {
    const _send = (p1, p2, data) =>
      this.send(CLA, INS.DERIVE_ADDRESS, p1, p2, data).then(
        utils.stripRetcodeFromResponse
      );

    const P1_DISPLAY = 0x02;
    const P2_UNUSED = 0x00;
    const data = cardano.serializeAddressParams(
      addressTypeNibble,
      networkIdOrProtocolMagic,
      spendingPath,
      stakingPath,
      stakingKeyHashHex,
      stakingBlockchainPointer
    );

    const response = await _send(P1_DISPLAY, P2_UNUSED, data);
    Assert.assert(response.length === 0);
  }

  async signTransaction(
    networkId: number,
    protocolMagic: number,
    inputs: Array<InputTypeUTxO>,
    outputs: Array<OutputTypeAddress | OutputTypeAddressParams>,
    feeStr: string,
    ttlStr: string,
    certificates: Array<Certificate>,
    withdrawals: Array<Withdrawal>,
    metadataHashHex: ?string
  ): Promise<SignTransactionResponse> {

    const P1_STAGE_INIT = 0x01;
    const P1_STAGE_INPUTS = 0x02;
    const P1_STAGE_OUTPUTS = 0x03;
    const P1_STAGE_FEE = 0x04;
    const P1_STAGE_TTL = 0x05;
    const P1_STAGE_CERTIFICATES = 0x06;
    const P1_STAGE_WITHDRAWALS = 0x07;
    const P1_STAGE_METADATA = 0x08;
    const P1_STAGE_CONFIRM = 0x09;
    const P1_STAGE_WITNESSES = 0x0a;
    const P2_UNUSED = 0x00;

    const _send = (p1, p2, data) =>
      this.send(CLA, INS.SIGN_TX, p1, p2, data).then(
        utils.stripRetcodeFromResponse
      );

    // pool registrations are quite restricted
    // this affects witness set construction and many validations
    const isSigningPoolRegistrationAsOwner = certificates.some(
      cert => cert.type === CertificateTypes.STAKE_POOL_REGISTRATION
    );

    const signTx_init = async (
      networkId: number,
      protocolMagic: number,
      numInputs: number,
      numOutputs: number,
      numCertificates: number,
      numWithdrawals: number,
      numWitnesses: number,
      includeMetadata: boolean,
    ): Promise<void> => {

      const data = Buffer.concat([
        utils.uint8_to_buf(networkId),
        utils.uint32_to_buf(protocolMagic),
        utils.uint8_to_buf(
          includeMetadata
          ? MetadataCodes.SIGN_TX_METADATA_YES
          : MetadataCodes.SIGN_TX_METADATA_NO
        ),
        utils.uint8_to_buf(
          isSigningPoolRegistrationAsOwner
          ? PoolRegistrationCodes.SIGN_TX_POOL_REGISTRATION_YES
          : PoolRegistrationCodes.SIGN_TX_POOL_REGISTRATION_NO
        ),
        utils.uint32_to_buf(numInputs),
        utils.uint32_to_buf(numOutputs),
        utils.uint32_to_buf(numCertificates),
        utils.uint32_to_buf(numWithdrawals),
        utils.uint32_to_buf(numWitnesses),
      ]);
      const response = await wrapRetryStillInCall(_send)(
        P1_STAGE_INIT,
        P2_UNUSED,
        data
      );
      Assert.assert(response.length === 0);
    };

    const signTx_addInput = async (
      input: InputTypeUTxO
    ): Promise<void> => {
      Precondition.checkIsHexString(input.txHashHex, "invalid tx hash");
      Precondition.check(input.txHashHex.length === 32 * 2, "invalid tx hash");

      const data = Buffer.concat([
        utils.hex_to_buf(input.txHashHex),
        utils.uint32_to_buf(input.outputIndex),
      ]);
      const response = await _send(P1_STAGE_INPUTS, P2_UNUSED, data);
      Assert.assert(response.length === 0);
    };

    const signTx_addAddressOutput = async (
      amountStr: string,
      addressHex: string
    ): Promise<void> => {
      Precondition.checkIsHexString(addressHex, "invalid address in output");
      Precondition.checkIsValidAmount(amountStr, "invalid amount in output");

      const data = Buffer.concat([
        utils.amount_to_buf(amountStr),
        utils.uint8_to_buf(TxOutputTypeCodes.SIGN_TX_OUTPUT_TYPE_ADDRESS),
        utils.hex_to_buf(addressHex)
      ]);
      const response = await _send(P1_STAGE_OUTPUTS, P2_UNUSED, data);
      Assert.assert(response.length === 0);
    };

    const signTx_addChangeOutput = async (
      amountStr: string,
      addressTypeNibble: $Values<typeof AddressTypeNibbles>,,
      spendingPath: BIP32Path,
      stakingPath: ?BIP32Path = null,
      stakingKeyHashHex: ?string = null,
      stakingBlockchainPointer: ?StakingBlockchainPointer = null,
    ): Promise<void> => {
      Precondition.checkIsValidAmount(amountStr, "invalid amount in output");

      const data = Buffer.concat([
        utils.amount_to_buf(amountStr),
        utils.uint8_to_buf(TxOutputTypeCodes.SIGN_TX_OUTPUT_TYPE_ADDRESS_PARAMS),
        cardano.serializeAddressParams(
          addressTypeNibble,
          addressTypeNibble === AddressTypeNibbles.BYRON ? protocolMagic : networkId,
          spendingPath,
          stakingPath,
          stakingKeyHashHex,
          stakingBlockchainPointer
        )
      ]);
      const response = await _send(P1_STAGE_OUTPUTS, P2_UNUSED, data);
      Assert.assert(response.length === 0);
    };

    const signTx_addCertificate = async (
      type: $Values<typeof CertTypes>,,
      path: ?BIP32Path,
      poolKeyHashHex: ?string,
      poolParams: ?PoolParams
    ): Promise<void> => {
      const dataFields = [
        utils.uint8_to_buf(type),
      ];

      switch (type) {
      case CertificateTypes.STAKE_REGISTRATION:
      case CertificateTypes.STAKE_DEREGISTRATION:
      case CertificateTypes.STAKE_DELEGATION: {
        // these certificates are not allowed within a pool registration tx
        Precondition.check(!isSigningPoolRegistrationAsOwner,
            "cannot combine pool registration with other certificates");

        if (path != null)
          dataFields.push(utils.path_to_buf(path));
        else
          throw new Error("path is required for a certificate of type " + type);
        break;
      }
      case CertificateTypes.STAKE_POOL_REGISTRATION: {
        Assert.assert(isSigningPoolRegistrationAsOwner);
        // OK, data are serialized and sent later in additional APDUs
        break;
      }
      default:
        throw new Error("invalid certificate type");
      }

      if (poolKeyHashHex != null) {
        Precondition.check(
          type === CertificateTypes.STAKE_DELEGATION,
          "superfluous pool key hash in a certificate of type " + type
        );
        dataFields.push(utils.hex_to_buf(poolKeyHashHex));
      }

      const data = Buffer.concat(dataFields);
      const response = await _send(P1_STAGE_CERTIFICATES, P2_UNUSED, data);
      Assert.assert(response.length === 0);

      // we are done for every certificate except pool registration

      if (type == CertificateTypes.STAKE_POOL_REGISTRATION) {
        if(!poolParams)
          throw new Error("missing stake pool params in a pool registration certificate");

        // additional data for pool certificate
        const APDU_INSTRUCTIONS = {
          POOL_PARAMS: 0x30,
          OWNERS: 0x31,
          RELAYS: 0x32,
          METADATA: 0x33,
          CONFIRMATION: 0x34
        };

        const response = await _send(
          P1_STAGE_CERTIFICATES,
          APDU_INSTRUCTIONS.POOL_PARAMS,
          cardano.serializePoolInitialParams(poolParams)
        );
        Assert.assert(response.length === 0);

        for (const owner of poolParams.poolOwners) {
          const response = await _send(
            P1_STAGE_CERTIFICATES,
            APDU_INSTRUCTIONS.OWNERS,
            cardano.serializePoolOwnerParams(owner)
          );
          Assert.assert(response.length === 0);
        }

        for (const relay of poolParams.relays) {
          const response = await _send(
            P1_STAGE_CERTIFICATES,
            APDU_INSTRUCTIONS.RELAYS,
            cardano.serializePoolRelayParams(relay)
          );
          Assert.assert(response.length === 0);
        }

        const mdResponse = await _send(
          P1_STAGE_CERTIFICATES,
          APDU_INSTRUCTIONS.METADATA,
          cardano.serializePoolMetadataParams(poolParams.metadata)
        );
        Assert.assert(mdResponse.length === 0);

        const confirmResponse = await _send(
          P1_STAGE_CERTIFICATES,
          APDU_INSTRUCTIONS.CONFIRMATION,
          Buffer.alloc(0)
        );
        Assert.assert(confirmResponse.length === 0);
      }
    }

    const signTx_addWithdrawal = async (
      path: BIP32Path,
      amountStr: string,
    ): Promise<void> => {
      const data = Buffer.concat([
        utils.amount_to_buf(amountStr),
        utils.path_to_buf(path)
      ]);
      const response = await _send(P1_STAGE_WITHDRAWALS, P2_UNUSED, data);
      Assert.assert(response.length === 0);
    }

    const signTx_setFee = async (
      feeStr: string
    ): Promise<void> => {
      const data = Buffer.concat([
        utils.amount_to_buf(feeStr),
      ]);
      const response = await _send(P1_STAGE_FEE, P2_UNUSED, data);
      Assert.assert(response.length === 0);
    };

    const signTx_setTtl = async (
      ttlStr: string
    ): Promise<void> => {
      const data = Buffer.concat([
        utils.amount_to_buf(ttlStr),
      ]);
      const response = await _send(P1_STAGE_TTL, P2_UNUSED, data);
      Assert.assert(response.length === 0);
    };

    const signTx_setMetadata = async (
      metadataHashHex: string
    ): Promise<void> => {
      const data = utils.hex_to_buf(metadataHashHex);

      const response = await _send(P1_STAGE_METADATA, P2_UNUSED, data);
      Assert.assert(response.length === 0);
    };

    const signTx_awaitConfirm = async (): Promise<{
      txHashHex: string
    }> => {
      const response = await _send(
        P1_STAGE_CONFIRM,
        P2_UNUSED,
        utils.hex_to_buf("")
      );
      return {
        txHashHex: response.toString("hex")
      };
    };

    const signTx_getWitness = async (
      path: BIP32Path
    ): Promise<{|
      path: BIP32Path,
      witnessSignatureHex: string
    |}> => {
      const data = Buffer.concat([utils.path_to_buf(path)]);
      const response = await _send(P1_STAGE_WITNESSES, P2_UNUSED, data);
      return {
        path: path,
        witnessSignatureHex: utils.buf_to_hex(response)
      };
    };

    // we need exactly one owner given by path to have a witness
    const witnessPaths = [];
    if (isSigningPoolRegistrationAsOwner) {
      if (certificates.length > 1)
        throw new Error("A pool registration certificate must be standalone");
      if (withdrawals.length)
        throw new Error("No withdrawals allowed for transactions registering stake pools");

      // verify that no input is given with a path (just to avoid potential confusion)
      for (const input of inputs) {
        Precondition.check(!input.path, "stake pool registration: inputs should not contain the witness path");
      }

      if (!certificates) throw new Error("missing certificates");
      if (!certificates[0]) throw new Error("invalid certificate");
      if (!certificates[0].poolRegistrationParams) throw new Error("missing stake pool registration params");
      if (!certificates[0].poolRegistrationParams.poolOwners) throw new Error("missing stake pool owners");

      let witnessOwner: ?PoolOwnerParams = null;
      for (const owner of certificates[0].poolRegistrationParams.poolOwners) {
        if (owner.stakingPath) {
          Precondition.checkIsValidPath(owner.stakingPath);
          if (witnessOwner) {
            throw new Error("two pool owners given by path");
          } else {
            witnessOwner = owner;
          }
        }
      }
      if (!witnessOwner) throw new Error("no owner given by path");

      // a single witness for the pool owner given by path
      witnessPaths.push(witnessOwner.stakingPath);
    } else {
      // we collect required witnesses for inputs, certificates and withdrawals
      // each path is included only once
      const witnessPathsSet = new Set();
      for (const {path} of [...inputs, ...certificates, ...withdrawals]) {
        const pathKey = JSON.stringify(path);
        if (!witnessPathsSet.has(pathKey)) {
          witnessPathsSet.add(pathKey);
          witnessPaths.push(path);
        }
      }
    }

    await signTx_init(
      networkId,
      protocolMagic,
      inputs.length,
      outputs.length,
      certificates.length,
      withdrawals.length,
      witnessPaths.length,
      metadataHashHex != null
    )

    // inputs
    for (const input of inputs) {
      await signTx_addInput(input);
    }

    // outputs
    for (const output of outputs) {
      if (output.addressHex) {
        await signTx_addAddressOutput(output.amountStr, output.addressHex);
      } else if (output.spendingPath) {
        await signTx_addChangeOutput(
          output.amountStr,
          output.addressTypeNibble,
          output.spendingPath,
          output.stakingPath,
          output.stakingKeyHashHex,
          output.stakingBlockchainPointer,
        );
      } else {
        throw new Error("unknown output type");
      }
    }

    await signTx_setFee(feeStr);

    await signTx_setTtl(ttlStr);

    if (certificates.length > 0) {
      for (const certificate of certificates) {
        await signTx_addCertificate(
          certificate.type,
          certificate.path,
          certificate.poolKeyHashHex,
          certificate.poolRegistrationParams
        )
      }
    }

    if (withdrawals.length > 0) {
      for (const withdrawal of withdrawals) {
        await signTx_addWithdrawal(
          withdrawal.path,
          withdrawal.amountStr
        )
      }
    }

    if (metadataHashHex != null) {
      await signTx_setMetadata(metadataHashHex);
    }

    // confirm
    const { txHashHex } = await signTx_awaitConfirm();

    // witnesses
    const witnesses = [];
    for (const path of witnessPaths) {
      const witness = await signTx_getWitness(path);
      witnesses.push(witness);
    }

    return {
      txHashHex,
      witnesses
    };
  }
}

// reexport
export {
  cardano,
  utils
};
