import "babel-polyfill";

// @ts-ignore
import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";

import Ada from "../src/Ada";

export async function getTransport() {
  return await TransportNodeHid.create(1000);
}

export async function getAda() {
  const transport = await TransportNodeHid.create(1000);

  const ada = new Ada(transport);
  (ada as any).t = transport;
  return Promise.resolve(ada);
}

const ProtocolMagics = {
  MAINNET: 764824073,
  TESTNET: 42,
};

const NetworkIds = {
  TESTNET: 0x00,
  MAINNET: 0x01,
};

export const Networks = {
  Mainnet: {
    networkId: NetworkIds.MAINNET,
    protocolMagic: ProtocolMagics.MAINNET,
  },
  Testnet: {
    networkId: NetworkIds.TESTNET,
    protocolMagic: ProtocolMagics.TESTNET,
  },
  Fake: {
    networkId: 0x03,
    protocolMagic: 47,
  }
}