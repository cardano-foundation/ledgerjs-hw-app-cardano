import "babel-polyfill";
import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";

import Ada, { utils, cardano } from "../../lib/Ada";

export const serializeStakingInfo = cardano.serializeStakingInfo;
export const str_to_path = cardano.str_to_path;
export const hex_to_buf = utils.hex_to_buf;
export const pathToBuffer = str => utils.path_to_buf(str_to_path(str));

export async function getTransport() {
  return await TransportNodeHid.create(1000);
}

export async function getAda() {
  const transport = await TransportNodeHid.create(1000);

  const ada = new Ada(transport);
  ada.t = transport;
  return Promise.resolve(ada);
}
