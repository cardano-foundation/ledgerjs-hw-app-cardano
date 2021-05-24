import type { ParsedAddressParams, Version } from "../types/internal"
import type { DerivedAddress } from '../types/public'
import { INS } from "./common/ins"
import type { Interaction, SendParams } from "./common/types"
import { serializeAddressParams } from "./serialization/addressParams"

const send = (params: {
  p1: number,
  p2: number,
  data: Buffer,
  expectedResponseLength?: number
}): SendParams => ({ ins: INS.DERIVE_ADDRESS, ...params })

export function* deriveAddress(
    version: Version,
    addressParams: ParsedAddressParams,
): Interaction<DerivedAddress> {
    const P1_RETURN = 0x01
    const P2_UNUSED = 0x00

    const response = yield send({
        p1: P1_RETURN,
        p2: P2_UNUSED,
        data: serializeAddressParams(addressParams, version),
    })

    return {
        addressHex: response.toString("hex"),
    }
}
