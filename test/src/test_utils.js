import "babel-polyfill";
import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";

import Ada, { utils, cardano } from "../../lib/Ada";

export const Assert = utils.Assert;

export const serializeAddressInfo = cardano.serializeAddressInfo;
export const str_to_path = utils.str_to_path;
export const hex_to_buf = utils.hex_to_buf;
export const pathToBuffer = str => utils.path_to_buf(str_to_path(str));
export const uint32_to_buf = utils.uint32_to_buf

export async function getTransport() {
  return await TransportNodeHid.create(1000);
}

export async function getAda() {
  const transport = await TransportNodeHid.create(1000);

  const ada = new Ada(transport);
  ada.t = transport;
  return Promise.resolve(ada);
}

export const ProtocolMagics = {
  MAINNET: 764824073,
  TESTNET: 42
}

export const NetworkIds = {
  TESTNET: 0x00,
  MAINNET: 0x01
}
