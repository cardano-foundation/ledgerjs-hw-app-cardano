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
//import type Transport from "@ledgerhq/hw-transport";

import type { BIP32Path, DerivedAddress, DeviceOwnedAddress, ExtendedPublicKey, GetSerialResponse, Network, SignedTransactionData, Transaction, Version } from 'types/public';

import cardano from './cardano'
import type { Interaction, SendParams } from './interactions/common/types';
import { deriveAddress } from "./interactions/deriveAddress";
import { getExtendedPublicKeys } from "./interactions/getExtendedPublicKeys";
import { getSerial } from "./interactions/getSerial";
import { getVersion } from "./interactions/getVersion";
import { runTests } from "./interactions/runTests";
import { showAddress } from "./interactions/showAddress";
import { signTransaction } from "./interactions/signTx";
import { isArray, isValidPath, validate } from './parseUtils';
import {
  parseAddress,
  parseBIP32Path,
  parseTransaction,
} from "./parsing";
import { TxErrors } from "./txErrors";
import type {
  ParsedAddressParams,
  ParsedTransaction,
  ValidBIP32Path,
} from './types/internal';
import { AddressType, CertificateType, RelayType } from "./types/public"
import utils, { assert } from "./utils";

const CLA = 0xd7;

export type KeyOf<T> = keyof T;
export type ValueOf<T> = T[keyof T];


export const GetKeyErrors = {
  INVALID_PATH: "invalid key path",
};

export const DeviceErrorCodes = {
  ERR_STILL_IN_CALL: 0x6e04, // internal
  ERR_INVALID_DATA: 0x6e07,
  ERR_INVALID_BIP_PATH: 0x6e08,
  ERR_REJECTED_BY_USER: 0x6e09,
  ERR_REJECTED_BY_POLICY: 0x6e10,
  ERR_DEVICE_LOCKED: 0x6e11,
  ERR_UNSUPPORTED_ADDRESS_TYPE: 0x6e12,

  // Not thrown by ledger-app-cardano itself but other apps
  ERR_CLA_NOT_SUPPORTED: 0x6e00,
};

const GH_ERRORS_LINK =
  "https://github.com/cardano-foundation/ledger-app-cardano/blob/master/src/errors.h";

const DeviceErrorMessages = {
  [DeviceErrorCodes.ERR_INVALID_DATA]: "Invalid data supplied to Ledger",
  [DeviceErrorCodes.ERR_INVALID_BIP_PATH]:
    "Invalid derivation path supplied to Ledger",
  [DeviceErrorCodes.ERR_REJECTED_BY_USER]: "Action rejected by user",
  [DeviceErrorCodes.ERR_REJECTED_BY_POLICY]:
    "Action rejected by Ledger's security policy",
  [DeviceErrorCodes.ERR_DEVICE_LOCKED]: "Device is locked",
  [DeviceErrorCodes.ERR_CLA_NOT_SUPPORTED]: "Wrong Ledger app",
  [DeviceErrorCodes.ERR_UNSUPPORTED_ADDRESS_TYPE]: "Unsupported address type",
};

export const Errors = {
  INCORRECT_APP_VERSION:
    "Operation not supported by the Ledger device, make sure to have the latest version of the Cardano app installed",
};

export const getErrorDescription = (statusCode: number) => {
  const statusCodeHex = `0x${statusCode.toString(16)}`;
  const defaultMsg = `General error ${statusCodeHex}. Please consult ${GH_ERRORS_LINK}`;

  return DeviceErrorMessages[statusCode] || defaultMsg;
};

function wrapConvertError<T extends Function>(fn: T): T {
  // @ts-ignore
  return async (...args) => {
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
}

/**
 * Cardano ADA API
 *
 * @example
 * import Ada from "@ledgerhq/hw-app-ada";
 * const ada = new Ada(transport);
 */


export type SendFn = (params: SendParams) => Promise<Buffer>;

export type Transport = any

// It can happen that we try to send a message to the device
// when the device thinks it is still in a middle of previous ADPU stream.
// This happens mostly if host does abort communication for some reason
// leaving ledger mid-call.
// In this case Ledger will respond by ERR_STILL_IN_CALL *and* resetting its state to
// default. We can therefore transparently retry the request.

// Note though that only the *first* request in an multi-APDU exchange should be retried.
function wrapRetryStillInCall<T extends Function>(fn: T): T {
  // @ts-ignore
  return async (...args: any) => {
    try {
      return await fn(...args);
    } catch (e) {
      if (
        e &&
        e.statusCode &&
        e.statusCode === DeviceErrorCodes.ERR_STILL_IN_CALL
      ) {
        // Do the retry
        return await fn(...args);
      }
      throw e;
    }
  };
}


async function interact<T>(
  interaction: Interaction<T>,
  send: SendFn,
): Promise<T> {
  let cursor = interaction.next();
  let first = true
  while (!cursor.done) {
    const apdu = cursor.value
    const res = first
      ? await wrapRetryStillInCall(send)(apdu)
      : await send(apdu);
    first = false
    cursor = interaction.next(res);
  }
  return cursor.value;
}


export class Ada {
  transport: Transport;
  _send: SendFn;

  constructor(transport: Transport, scrambleKey: string = "ADA") {
    this.transport = transport;
    const methods = [
      "getVersion",
      "getSerial",
      "getExtendedPublicKey",
      "signTransaction",
      "deriveAddress",
      "showAddress",
    ];
    this.transport.decorateAppAPIMethods(this, methods, scrambleKey);
    this._send = async (params: SendParams): Promise<Buffer> => {
      let response = await wrapConvertError(this.transport.send)(
        CLA,
        params.ins,
        params.p1,
        params.p2,
        params.data
      );
      response = utils.stripRetcodeFromResponse(response);

      if (params.expectedResponseLength != null) {
        assert(
          response.length === params.expectedResponseLength,
          `unexpected response length: ${response.length} instead of ${params.expectedResponseLength}`
        );
      }

      return response;
    };
  }

  /**
   * Returns an object containing the app version.
   *
   * @returns Result object containing the application version number.
   *
   * @example
   * const { major, minor, patch, flags } = await ada.getVersion();
   * console.log(`App version ${major}.${minor}.${patch}`);
   *
   */
  async getVersion(): Promise<GetVersionResponse> {
    const version = await interact(this._getVersion(), this._send)
    return { version }
  }
  // Just for consistency
  *_getVersion(): Interaction<Version> {
    return yield* getVersion()
  }

  /**
   * Returns an object containing the device serial number.
   *
   * @returns Result object containing the device serial number.
   *
   * @example
   * const { serial } = await ada.getSerial();
   * console.log(`Serial number ${serial}`);
   *
   */
  async getSerial(): Promise<GetSerialResponse> {
    return interact(this._getSerial(), this._send);
  }

  *_getSerial(): Interaction<GetSerialResponse> {
    const version = yield* getVersion()
    return yield* getSerial(version)
  }


  /**
   * Runs unit tests on the device (DEVEL app build only)
   */
  async runTests(): Promise<void> {
    return interact(this._runTests(), this._send)
  }

  *_runTests(): Interaction<void> {
    const version = yield* getVersion()
    return yield* runTests(version)
  }


  /**
   * @description Get several public keys; one for each of the specified BIP 32 paths.
   *
   * @param paths The paths. A path must begin with `44'/1815'/account'` or `1852'/1815'/account'`, and may be up to 10 indexes long.
   * @returns The extended public keys (i.e. with chaincode) for the given paths.
   *
   * @example
   * const [{ publicKey, chainCode }] = await ada.getExtendedPublicKeys([[ HARDENED + 44, HARDENED + 1815, HARDENED + 1 ]]);
   * console.log(publicKey);
   *
   */
  async getExtendedPublicKeys(
    { paths }: GetExtendedPublicKeysRequest
  ): Promise<GetExtendedPublicKeysResponse> {
    // validate the input
    validate(isArray(paths), "TODO");
    for (const path of paths) {
      validate(isValidPath(path), "TODO");
    }
    // TODO: move to parsing
    const parsed = paths.map((path) => parseBIP32Path(path, GetKeyErrors.INVALID_PATH));

    return interact(this._getExtendedPublicKeys(parsed), this._send);
  }

  *_getExtendedPublicKeys(paths: ValidBIP32Path[]) {
    const version = yield* getVersion()
    return yield* getExtendedPublicKeys(version, paths)
  }

  /**
   * @description Get a public key from the specified BIP 32 path.
   *
   * @param path BIP32 array. Path must start with `(44 or 1852)'/1815'/n'`, and may be up to 10 indexes long.
   * @return The public key with chaincode for the given path.
   *
   * @example
   * const { publicKey, chainCode } = await ada.getExtendedPublicKey([ HARDENED + 44, HARDENED + 1815, HARDENED + 1 ]);
   * console.log(publicKey);
   *
   */
  async getExtendedPublicKey(
    { path }: GetExtendedPublicKeyRequest
  ): Promise<GetExtendedPublicKeyResponse> {
    return (await this.getExtendedPublicKeys({ paths: [path] }))[0];
  }

  /**
   * @description Gets an address from the specified BIP 32 path.
   *
   * @param addressParams The path indexes. Path must begin with `(44 or 1852)'/1815'/i'/(0 or 1)/j`, and may be up to 10 indexes long.
   * @return The address for the given path.
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
  async deriveAddress({ network, address }: DeriveAddressRequest): Promise<DeriveAddressResponse> {
    const parsedParams = parseAddress(network, address)

    return interact(this._deriveAddress(parsedParams), this._send);
  }

  *_deriveAddress(addressParams: ParsedAddressParams): Interaction<DerivedAddress> {
    const version = yield* getVersion()
    return yield* deriveAddress(version, addressParams)
  }


  async showAddress({ network, address }: ShowAddressRequest): Promise<void> {
    const parsedParams = parseAddress(network, address)

    return interact(this._showAddress(parsedParams), this._send);
  }

  *_showAddress(addressParams: ParsedAddressParams): Interaction<void> {
    const version = yield* getVersion()
    return yield* showAddress(version, addressParams)
  }



  async signTransaction(
    tx: SignTransactionRequest
  ): Promise<SignTransactionResponse> {

    const parsedTx = parseTransaction(tx)


    return interact(this._signTx(parsedTx), this._send);
  }

  * _signTx(tx: ParsedTransaction): Interaction<SignedTransactionData> {
    const version = yield* getVersion()
    return yield* signTransaction(version, tx)
  }
}

// version
export type GetVersionResponse = {
  version: Version
}

// get ext public keys
export type GetExtendedPublicKeysRequest = {
  paths: BIP32Path[]
}
export type GetExtendedPublicKeysResponse = Array<ExtendedPublicKey>

// get ext public key
export type GetExtendedPublicKeyRequest = {
  path: BIP32Path
}
export type GetExtendedPublicKeyResponse = ExtendedPublicKey

// derive address
export type DeriveAddressRequest = {
  network: Network,
  address: DeviceOwnedAddress
}
export type DeriveAddressResponse = DerivedAddress

// show address
export type ShowAddressRequest = DeriveAddressRequest

// sign tx
export type SignTransactionRequest = Transaction
export type SignTransactionResponse = SignedTransactionData

// reexport
export type { Transaction, DeviceOwnedAddress }
export { AddressType, CertificateType, RelayType, TxErrors, cardano, utils };
export default Ada;