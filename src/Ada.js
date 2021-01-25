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

import utils, { Precondition, Assert, invariant } from "./utils";
import cardano, { CertificateTypes, AddressTypeNibbles, SignTxIncluded, TxErrors } from "./cardano";

const CLA = 0xd7;

const INS = Object.freeze({
  GET_VERSION: 0x00,
  GET_SERIAL: 0x01,

  GET_EXT_PUBLIC_KEY: 0x10,
  DERIVE_ADDRESS: 0x11,

  SIGN_TX: 0x21,

  RUN_TESTS: 0xf0
});

export type BIP32Path = Array<number>;

export type InputTypeUTxO = {|
  txHashHex: string,
  outputIndex: number,
  path: ?BIP32Path
|};


export type Token =
{|
  assetNameHex: string,
  amountStr: string
|};

export type AssetGroup =
{|
  policyIdHex: string,
  tokens: Array<Token>
|};

export type TxOutputTypeAddress = {|
  amountStr: string,
  tokenBundle: Array<AssetGroup>,
  addressHex: string
|};

export type TxOutputTypeAddressParams = {|
  amountStr: string,
  tokenBundle: Array<AssetGroup>,
  addressTypeNibble: $Values<typeof AddressTypeNibbles>,
  spendingPath: BIP32Path,
  stakingPath: ?BIP32Path,
  stakingKeyHashHex: ?string,
  stakingBlockchainPointer: ?StakingBlockchainPointer,
|};

export type TxOutput = TxOutputTypeAddress | TxOutputTypeAddressParams;

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
  ipv4: ?string, // e.g. "192.168.0.1"
  ipv6: ?string  // e.g. "2001:0db8:85a3:0000:0000:8a2e:0370:7334"
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
  type: $Values<typeof CertificateTypes>,
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
  major: number,
  minor: number,
  patch: number,
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

const PoolRegistrationCodes = {
	SIGN_TX_POOL_REGISTRATION_NO: 3,
	SIGN_TX_POOL_REGISTRATION_YES: 4
}

export const TxOutputTypeCodes = {
  SIGN_TX_OUTPUT_TYPE_ADDRESS_BYTES: 1,
  SIGN_TX_OUTPUT_TYPE_ADDRESS_PARAMS: 2
}

export const DeviceErrorCodes = {
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

const DeviceErrorMessages = {
  [DeviceErrorCodes.ERR_INVALID_DATA]: "Invalid data supplied to Ledger",
  [DeviceErrorCodes.ERR_INVALID_BIP_PATH]: "Invalid derivation path supplied to Ledger",
  [DeviceErrorCodes.ERR_REJECTED_BY_USER]: "Action rejected by user",
  [DeviceErrorCodes.ERR_REJECTED_BY_POLICY]: "Action rejected by Ledger's security policy",
  [DeviceErrorCodes.ERR_DEVICE_LOCKED]: "Device is locked",
  [DeviceErrorCodes.ERR_CLA_NOT_SUPPORTED]: "Wrong Ledger app",
  [DeviceErrorCodes.ERR_UNSUPPORTED_ADDRESS_TYPE]: "Unsupported address type"
};

const Errors = {
  INCORRECT_APP_VERSION: "Operation not supported by the Ledger device, make sure to have the latest version of the Cardano app installed"
}

export const getErrorDescription = (statusCode: number) => {
  const statusCodeHex = `0x${statusCode.toString(16)}`;
  const defaultMsg = `General error ${statusCodeHex}. Please consult ${GH_ERRORS_LINK}`;

  return DeviceErrorMessages[statusCode] || defaultMsg;
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
    if (e && e.statusCode && e.statusCode === DeviceErrorCodes.ERR_STILL_IN_CALL) {
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

const buildSendFn = (cls: Object, instructionCode: $Values<typeof INS>) => {
  return (
    async (p1: number, p2: number, data: Buffer, expectedResponseLength: ?number): Promise<Buffer> => {
      let response = await cls.send(CLA, instructionCode, p1, p2, data);
      response = utils.stripRetcodeFromResponse(response);

      if (expectedResponseLength != null) {
        Assert.assert(
          response.length === expectedResponseLength,
          `unexpected response length: ${response.length} instead of ${expectedResponseLength}`
        );
      }

      return response;
    }
  )
}

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
    // moving getVersion() logic to private function in order
    // to disable concurrent execution protection done by this.transport.decorateAppAPIMethods()
    // when invoked from within other calls to check app version

    const _send = buildSendFn(this, INS.GET_VERSION);
    const P1_UNUSED = 0x00;
    const P2_UNUSED = 0x00;
    const response = await wrapRetryStillInCall(_send)(
      P1_UNUSED,
      P2_UNUSED,
      utils.hex_to_buf(""),
      4
    );
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

  async _isLedgerAppVersionAtLeast(minMajor: number, minMinor: number): Promise<boolean> {
    const version = await this._getVersion();
    const major = parseInt(version.major);
    const minor = parseInt(version.minor);

    if (isNaN(major) || isNaN(minor))
      return false;

    return (major >= minMajor) && (major>minMajor || minor>=minMinor);
  }

  async _ensureLedgerAppVersionAtLeast(minMajor: number, minMinor: number) {
    const versionCheckSuccess = await this._isLedgerAppVersionAtLeast(minMajor, minMinor)

    if (!versionCheckSuccess) {
      throw new Error(Errors.INCORRECT_APP_VERSION);
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
    await this._ensureLedgerAppVersionAtLeast(1, 2);

    const _send = buildSendFn(this, INS.GET_SERIAL);
    const P1_UNUSED = 0x00;
    const P2_UNUSED = 0x00;
    const response = await wrapRetryStillInCall(_send)(
      P1_UNUSED,
      P2_UNUSED,
      utils.hex_to_buf(""),
      7
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
   * @description Get several public keys; one for each of the specified BIP 32 paths.
   *
   * @param {Array<BIP32Path>} paths The paths. A path must begin with `44'/1815'/account'` or `1852'/1815'/account'`, and may be up to 10 indexes long.
   * @return {Promise<Array<GetExtendedPublicKeyResponse>>} The extended public keys (i.e. with chaincode) for the given paths.
   *
   * @example
   * const [{ publicKey, chainCode }] = await ada.getExtendedPublicKeys([[ HARDENED + 44, HARDENED + 1815, HARDENED + 1 ]]);
   * console.log(publicKey);
   *
   */
  async getExtendedPublicKeys(
    paths: Array<BIP32Path>
  ): Promise<Array<GetExtendedPublicKeyResponse>> {
    // validate the input
    Precondition.checkIsArray(paths);
    for (const path of paths) {
      Precondition.checkIsValidPath(path);
    }

    if (paths.length > 1) {
      await this._ensureLedgerAppVersionAtLeast(2, 1);
    }
    
    const _send = buildSendFn(this, INS.GET_EXT_PUBLIC_KEY);

    const P1_INIT = 0x00;
    const P1_NEXT_KEY = 0x01;
    const P2_UNUSED = 0x00;

    const result = [];

    for (let i = 0; i < paths.length; i++) {
      const pathData = cardano.serializeGetExtendedPublicKeyParams(paths[i]);

      let response: Buffer;
      if (i === 0) {
        // initial APDU

        // passing empty Buffer for backwards compatibility
        // of single key export on Ledger app version 2.0.4
        const remainingKeysData = paths.length > 1
          ? utils.uint32_to_buf(paths.length - 1)
          : Buffer.from([]);

        response = await wrapRetryStillInCall(_send)(
          P1_INIT, P2_UNUSED, Buffer.concat([pathData, remainingKeysData])
        );
      } else {
        // next key APDU
        response = await _send(
          P1_NEXT_KEY, P2_UNUSED,
          pathData,
          64
        );
      }

      const [publicKey, chainCode, rest] = utils.chunkBy(response, [32, 32]);
      Assert.assert(rest.length === 0);

      result.push({
        publicKeyHex: publicKey.toString("hex"),
        chainCodeHex: chainCode.toString("hex")
      });
    }

    return result;
  }

  /**
   * @description Get a public key from the specified BIP 32 path.
   *
   * @param {BIP32Path} indexes The path indexes. Path must begin with `44'/1815'/n'`, and may be up to 10 indexes long.
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
    return (await this.getExtendedPublicKeys([path]))[0];
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
    const _send = buildSendFn(this, INS.DERIVE_ADDRESS);

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
    const _send = buildSendFn(this, INS.DERIVE_ADDRESS);

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

    await _send(P1_DISPLAY, P2_UNUSED, data, 0);
  }

  async signTransaction(
    networkId: number,
    protocolMagic: number,
    inputs: Array<InputTypeUTxO>,
    outputs: Array<TxOutput>,
    feeStr: string,
    ttlStr: ?string,
    certificates: Array<Certificate>,
    withdrawals: Array<Withdrawal>,
    metadataHashHex: ?string,
    validityIntervalStartStr: ?string
  ): Promise<SignTransactionResponse> {

    // pool registrations are quite restricted
    // this affects witness set construction and many validations
    const isSigningPoolRegistrationAsOwner = certificates.some(
      cert => cert.type === CertificateTypes.STAKE_POOL_REGISTRATION
    );

    const appHasStakePoolOwnerSupport = await this._isLedgerAppVersionAtLeast(2, 1);
    if (isSigningPoolRegistrationAsOwner && !appHasStakePoolOwnerSupport) {
      throw Error(Errors.INCORRECT_APP_VERSION);
    }

    // TODO replace this with a better mechanism for detecting ledger app capabilities
    const appHasMultiassetSupport = await this._isLedgerAppVersionAtLeast(2, 2);
    if (!appHasMultiassetSupport) {

      const containsMultiassets = outputs.some(
        output => (output.tokenBundle != null)
      );

      // for older app versions:
      // multiasset outputs must not be given
      // validity interval start must not be given
      // ttl must be given
      if (containsMultiassets || (validityIntervalStartStr != null) || (ttlStr == null)) {
        throw Error(Errors.INCORRECT_APP_VERSION);
      }
    }

    cardano.validateTransaction(
      networkId, protocolMagic,
      inputs, outputs, feeStr, ttlStr,
      certificates, withdrawals, metadataHashHex,
      validityIntervalStartStr
    );


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

    const _send = buildSendFn(this, INS.SIGN_TX);

    const signTx_init = async (
      networkId: number,
      protocolMagic: number,
      numInputs: number,
      numOutputs: number,
      includeTtl: boolean,
      numCertificates: number,
      numWithdrawals: number,
      includeMetadata: boolean,
      includeValidityIntervalStart: boolean,
      numWitnesses: number
    ): Promise<void> => {

      const _serializePoolRegistrationCode = (isSigningPoolRegistrationAsOwner: boolean): Buffer => {
        // backwards compatible way of serializing the flag to signalize pool registration
        // transactions.
        // TODO To be removed/refactored once Ledger app 2.1 or later is rolled out
        if (!appHasStakePoolOwnerSupport) {
          return Buffer.from([])
        }

        return utils.uint8_to_buf(
          isSigningPoolRegistrationAsOwner
          ? PoolRegistrationCodes.SIGN_TX_POOL_REGISTRATION_YES
          : PoolRegistrationCodes.SIGN_TX_POOL_REGISTRATION_NO
        )
      };

      const _serializeIncludeInTxData = (hasMultiassetSupport: boolean): Buffer => {
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
        utils.uint8_to_buf(networkId),
        utils.uint32_to_buf(protocolMagic),
        _serializeIncludeInTxData(appHasMultiassetSupport),
        _serializePoolRegistrationCode(isSigningPoolRegistrationAsOwner),
        utils.uint32_to_buf(numInputs),
        utils.uint32_to_buf(numOutputs),
        utils.uint32_to_buf(numCertificates),
        utils.uint32_to_buf(numWithdrawals),
        utils.uint32_to_buf(numWitnesses),
      ]);
      const response = await wrapRetryStillInCall(_send)(
        P1_STAGE_INIT,
        P2_UNUSED,
        data,
        0
      );
    };

    const signTx_addInput = async (
      input: InputTypeUTxO
    ): Promise<void> => {
      const data = Buffer.concat([
        utils.hex_to_buf(input.txHashHex),
        utils.uint32_to_buf(input.outputIndex),
      ]);
      await _send(P1_STAGE_INPUTS, P2_UNUSED, data, 0);
    };

    const signTx_addOutput = async (
      output: TxOutput
    ): Promise<void> => {
      const P2_BASIC_DATA = 0x30;
      const P2_ASSET_GROUP = 0x31;
      const P2_TOKEN = 0x32;
      const P2_CONFIRM = 0x33;

      // TODO remove the Before_2_2 version after ledger app 2.2 is rolled out
      let outputData;
      let outputP2;
      if (appHasMultiassetSupport) {
        outputData = cardano.serializeOutputBasicParams(output, protocolMagic, networkId);
        outputP2 = P2_BASIC_DATA;
      } else {
        outputData = cardano.serializeOutputBasicParamsBefore_2_2(output, protocolMagic, networkId);
        outputP2 = P2_UNUSED;
      }

      await _send(
        P1_STAGE_OUTPUTS,
        outputP2,
        outputData,
        0
      );

      if (output.tokenBundle != null) {
        for (const assetGroup of output.tokenBundle) {
          const data = Buffer.concat([
            utils.hex_to_buf(assetGroup.policyIdHex),
            utils.uint32_to_buf(assetGroup.tokens.length)
          ]);
          await _send(P1_STAGE_OUTPUTS, P2_ASSET_GROUP, data, 0);

          for(const token of assetGroup.tokens) {
            const data = Buffer.concat([
              utils.uint32_to_buf(token.assetNameHex.length / 2),
              utils.hex_to_buf(token.assetNameHex),
              utils.uint64_to_buf(token.amountStr)
            ]);
            await _send(P1_STAGE_OUTPUTS, P2_TOKEN, data, 0);
          }
        }
      }

      // TODO remove the if condition after ledger app 2.2 is rolled out
      if (appHasMultiassetSupport) {
        await _send(P1_STAGE_OUTPUTS, P2_CONFIRM, Buffer.alloc(0), 0);
      }
    }

    const signTx_addCertificate = async (
      type: $Values<typeof CertificateTypes>,
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
        if (path != null)
          dataFields.push(utils.path_to_buf(path));
        break;
      }
      case CertificateTypes.STAKE_POOL_REGISTRATION: {
        Assert.assert(isSigningPoolRegistrationAsOwner, "tx certificates validation messed up");
        // OK, data are serialized and sent later in additional APDUs
        break;
      }
      default:
        // validation should catch invalid certificate type
        Assert.assert(false, "invalid certificate type");
      }

      if (poolKeyHashHex != null) {
        dataFields.push(utils.hex_to_buf(poolKeyHashHex));
      }

      const data = Buffer.concat(dataFields);
      await _send(P1_STAGE_CERTIFICATES, P2_UNUSED, data, 0);

      // we are done for every certificate except pool registration

      if (type === CertificateTypes.STAKE_POOL_REGISTRATION) {
        invariant(poolParams != null);

        // additional data for pool certificate
        const APDU_INSTRUCTIONS = {
          POOL_PARAMS: 0x30,
          OWNERS: 0x31,
          RELAYS: 0x32,
          METADATA: 0x33,
          CONFIRMATION: 0x34
        };

        await _send(
          P1_STAGE_CERTIFICATES,
          APDU_INSTRUCTIONS.POOL_PARAMS,
          cardano.serializePoolInitialParams(poolParams),
          0
        );

        for (const owner of poolParams.poolOwners) {
          await _send(
            P1_STAGE_CERTIFICATES,
            APDU_INSTRUCTIONS.OWNERS,
            cardano.serializePoolOwnerParams(owner),
            0
          );
        }
        for (const relay of poolParams.relays) {
          await _send(
            P1_STAGE_CERTIFICATES,
            APDU_INSTRUCTIONS.RELAYS,
            cardano.serializePoolRelayParams(relay),
            0
          );
        }

        await _send(
          P1_STAGE_CERTIFICATES,
          APDU_INSTRUCTIONS.METADATA,
          cardano.serializePoolMetadataParams(poolParams.metadata),
          0
        );

        await _send(
          P1_STAGE_CERTIFICATES,
          APDU_INSTRUCTIONS.CONFIRMATION,
          Buffer.alloc(0),
          0
        );
      }
    }

    const signTx_addWithdrawal = async (
      path: BIP32Path,
      amountStr: string,
    ): Promise<void> => {
      const data = Buffer.concat([
        utils.ada_amount_to_buf(amountStr),
        utils.path_to_buf(path)
      ]);
      await _send(P1_STAGE_WITHDRAWALS, P2_UNUSED, data, 0);
    }

    const signTx_setFee = async (
      feeStr: string
    ): Promise<void> => {
      const data = Buffer.concat([
        utils.ada_amount_to_buf(feeStr),
      ]);
      await _send(P1_STAGE_FEE, P2_UNUSED, data, 0);
    };

    const signTx_setTtl = async (
      ttlStr: string
    ): Promise<void> => {
      const data = Buffer.concat([
        utils.uint64_to_buf(ttlStr),
      ]);
      await _send(P1_STAGE_TTL, P2_UNUSED, data, 0);
    };

    const signTx_setMetadata = async (
      metadataHashHex: string
    ): Promise<void> => {
      const data = utils.hex_to_buf(metadataHashHex);

      await _send(P1_STAGE_METADATA, P2_UNUSED, data, 0);
    };

    const signTx_setValidityIntervalStart = async (
      validityIntervalStartStr: string
    ): Promise<void> => {
      const data = Buffer.concat([
        utils.uint64_to_buf(validityIntervalStartStr),
      ]);
      await _send(P1_STAGE_VALIDITY_INTERVAL_START, P2_UNUSED, data);
    };

    const signTx_awaitConfirm = async (): Promise<{
      txHashHex: string
    }> => {

      // TODO remove after ledger app 2.2 is rolled out
      let confirmP1;
      if (appHasMultiassetSupport) {
        confirmP1 = P1_STAGE_CONFIRM;
      } else {
        confirmP1 = 0x09; // needed for backward compatibility
      }

      const response = await _send(
        confirmP1,
        P2_UNUSED,
        utils.hex_to_buf(""),
        cardano.TX_HASH_LENGTH
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

      // TODO remove after ledger app 2.2 is rolled out
      let witnessP1;
      if (appHasMultiassetSupport) {
        witnessP1 = P1_STAGE_WITNESSES;
      } else {
        witnessP1 = 0x0a; // needed for backward compatibility
      }

      const data = Buffer.concat([utils.path_to_buf(path)]);
      const response = await _send(
        witnessP1,
        P2_UNUSED,
        data,
        64
      );
      return {
        path: path,
        witnessSignatureHex: utils.buf_to_hex(response)
      };
    };

    const witnessPaths = [];
    if (isSigningPoolRegistrationAsOwner) {
      // there should be exactly one owner given by path which will be used for the witness
      Assert.assert(certificates.length == 1);
      invariant(certificates[0].poolRegistrationParams != null);

      const owners = certificates[0].poolRegistrationParams.poolOwners;
      const witnessOwner = owners.find(owner => !!owner.stakingPath);
      invariant(witnessOwner != null);

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
      ttlStr != null,
      certificates.length,
      withdrawals.length,
      metadataHashHex != null,
      validityIntervalStartStr != null,
      witnessPaths.length
    );

    // inputs
    for (const input of inputs) {
      await signTx_addInput(input);
    }

    // outputs
    for (const output of outputs) {
      await signTx_addOutput(output);
    }

    await signTx_setFee(feeStr);

    if (ttlStr != null) {
      await signTx_setTtl(ttlStr);
    }

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

    if (validityIntervalStartStr != null) {
      await signTx_setValidityIntervalStart(validityIntervalStartStr);
    }

    // confirm
    const { txHashHex } = await signTx_awaitConfirm();

    // witnesses
    const witnesses = [];
    for (const path of witnessPaths) {
      invariant(path != null);
      Precondition.checkIsValidPath(path, "Invalid path to witness has been supplied");
      
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
  AddressTypeNibbles,
  CertificateTypes,
  TxErrors,

  cardano,
  utils
};
