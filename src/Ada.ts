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
import type Transport from "@ledgerhq/hw-transport";
import type { BIP32Path, DerivedAddress, DeviceCompatibility, DeviceOwnedAddress, ExtendedPublicKey, Network, Serial, SignedTransactionData, Transaction, Version } from 'types/public';

import { DeviceStatusCodes, DeviceStatusError } from './errors';
import { InvalidDataReason } from "./errors/invalidDataReason";
import type { Interaction, SendParams } from './interactions/common/types';
import { deriveAddress } from "./interactions/deriveAddress";
import { getExtendedPublicKeys } from "./interactions/getExtendedPublicKeys";
import { getSerial } from "./interactions/getSerial";
import { getCompatibility, getVersion } from "./interactions/getVersion";
import { runTests } from "./interactions/runTests";
import { showAddress } from "./interactions/showAddress";
import { signTransaction } from "./interactions/signTx";
import { parseAddress } from './parsing/address'
import { parseTransaction, } from "./parsing/transaction";
import type {
  ParsedAddressParams,
  ParsedTransaction,
  ValidBIP32Path,
} from './types/internal';
import { AddressType, CertificateType, RelayType } from "./types/public"
import utils from "./utils";
import { assert } from './utils/assert'
import { isArray, parseBIP32Path, validate, } from './utils/parse';

export * from './errors'
export * from './types/public'

const CLA = 0xd7;

function wrapConvertDeviceStatusError<T extends Function>(fn: T): T {
  // @ts-ignore
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (e) {
      if (e && e.statusCode) {
        throw new DeviceStatusError(e.statusCode)
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

/** @ignore */
export type SendFn = (params: SendParams) => Promise<Buffer>;

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
        e.statusCode === DeviceStatusCodes.ERR_STILL_IN_CALL
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

/**
 * Main API endpoint
 * @category Main
 */
export class Ada {
  /** @ignore */
  transport: Transport;
  /** @ignore */
  _send: SendFn;

  constructor(transport: Transport, scrambleKey: string = "ADA") {
    this.transport = transport;
    // Note: this is list of methods that should "lock" the transport to avoid concurrent use
    const methods = [
      "getVersion",
      "getSerial",
      "getExtendedPublicKeys",
      "signTransaction",
      "deriveAddress",
      "showAddress",
    ];
    this.transport.decorateAppAPIMethods(this, methods, scrambleKey);
    this._send = async (params: SendParams): Promise<Buffer> => {
      let response = await wrapConvertDeviceStatusError(this.transport.send)(
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
    return { version, compatibility: getCompatibility(version) }
  }

  // Just for consistency
  /** @ignore */
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

  /** @ignore */
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

  /** @ignore */
  *_runTests(): Interaction<void> {
    const version = yield* getVersion()
    return yield* runTests(version)
  }


  /**
   * Get several public keys; one for each of the specified BIP 32 path.
   *
   * @param paths The paths. A path must begin with `44'/1815'/account'` or `1852'/1815'/account'`, and may be up to 10 indexes long.
   * @returns The extended public keys (i.e. with chaincode) for the given paths.
   *
   * @example
   * ```
   * const [{ publicKey, chainCode }] = await ada.getExtendedPublicKeys([[ HARDENED + 44, HARDENED + 1815, HARDENED + 1 ]]);
   * console.log(publicKey);
   * ```
   */
  async getExtendedPublicKeys(
    { paths }: GetExtendedPublicKeysRequest
  ): Promise<GetExtendedPublicKeysResponse> {
    // validate the input
    validate(isArray(paths), InvalidDataReason.GET_EXT_PUB_KEY_PATHS_NOT_ARRAY);
    const parsed = paths.map((path) => parseBIP32Path(path, InvalidDataReason.INVALID_PATH));

    return interact(this._getExtendedPublicKeys(parsed), this._send);
  }

  /** @ignore */
  *_getExtendedPublicKeys(paths: ValidBIP32Path[]) {
    const version = yield* getVersion()
    return yield* getExtendedPublicKeys(version, paths)
  }

  /**
   * Get a public key from the specified BIP 32 path.
   *
   */
  async getExtendedPublicKey(
    { path }: GetExtendedPublicKeyRequest
  ): Promise<GetExtendedPublicKeyResponse> {
    return (await this.getExtendedPublicKeys({ paths: [path] }))[0];
  }

  /**
   * Derives an address for the specified BIP 32 path.
   * Note that the address is returned in raw *hex* format without any bech32/base58 encoding
   */
  async deriveAddress({ network, address }: DeriveAddressRequest): Promise<DeriveAddressResponse> {
    const parsedParams = parseAddress(network, address)

    return interact(this._deriveAddress(parsedParams), this._send);
  }

  /** @ignore */
  *_deriveAddress(addressParams: ParsedAddressParams): Interaction<DerivedAddress> {
    const version = yield* getVersion()
    return yield* deriveAddress(version, addressParams)
  }


  /**
   * Show address corresponding to a given derivation path on the device.
   * This is useful for users to check whether the wallet does not try to scam the user.
   */
  async showAddress({ network, address }: ShowAddressRequest): Promise<void> {
    const parsedParams = parseAddress(network, address)

    return interact(this._showAddress(parsedParams), this._send);
  }

  /** @ignore */
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

  /** @ignore */
  * _signTx(tx: ParsedTransaction): Interaction<SignedTransactionData> {
    const version = yield* getVersion()
    return yield* signTransaction(version, tx)
  }
}

/**
 * Response to [[Ada.getVersion]] call
 * @category Main
 */
export type GetVersionResponse = {
  version: Version
  compatibility: DeviceCompatibility
}

/**
 * Get multiple public keys ([[Ada.getExtendedPublicKeys]]) request data
 * @category Main
 * @see [[GetExtendedPublicKeysResponse]]
 */
export type GetExtendedPublicKeysRequest = {
  /** Paths to public keys which should be derived by the device */
  paths: BIP32Path[]
}

/**
 * [[Ada.getExtendedPublicKeys]] response data
 * @category Main
 * @see [[GetExtendedPublicKeysRequest]]
 */
export type GetExtendedPublicKeysResponse = Array<ExtendedPublicKey>

/**
 * Get single public keys ([[Ada.getExtendedPublicKey]]) request data
 * @category Main
 * @see [[GetExtendedPublicKeysResponse]]
 */
export type GetExtendedPublicKeyRequest = {
  /** Path to public key which should be derived */
  path: BIP32Path
}
/**
 * Get single public key ([[Ada.getExtendedPublicKey]]) response data
 * @category Main
 * @see [[GetExtendedPublicKeysResponse]]
 */
export type GetExtendedPublicKeyResponse = ExtendedPublicKey

/**
 * Derive address ([[Ada.deriveAddress]]) request data
 * @category Main
 * @see [[DeriveAddressResponse]]
 */
export type DeriveAddressRequest = {
  network: Network,
  address: DeviceOwnedAddress
}
/**
 * Derive address ([[Ada.deriveAddress]]) response data
 * @category Main
 * @see [[DeriveAddressRequest]]
 */
export type DeriveAddressResponse = DerivedAddress

/**
 * Show address on derivce ([[Ada.showAddress]]) request data
 * @category Main
 */
export type ShowAddressRequest = DeriveAddressRequest

/**
 * Get device serial number ([[Ada.getSerial]]) response data
 * @category Main
 */
export type GetSerialResponse = Serial


/**
 * Sign transaction ([[Ada.signTransaction]]) request data
 * @category Main
 * @see [[SignTransactionResponse]]
 */
export type SignTransactionRequest = Transaction

/**
 * Sign transaction ([[Ada.signTransaction]]) response data
 * @category Main
 * @see [[SignTransactionRequest]]
 */
export type SignTransactionResponse = SignedTransactionData

// reexport
export type { Transaction, DeviceOwnedAddress }
export { AddressType, CertificateType, RelayType, InvalidDataReason, utils };
export default Ada;

/**
 * Default Cardano networks
 * @see [[Network]]
 */
export const Networks = {
  Mainnet: {
    networkId: 0x01,
    protocolMagic: 764824073,
  } as Network,
  Testnet: {
    networkId: 0x00,
    protocolMagic: 42,
  } as Network,
}