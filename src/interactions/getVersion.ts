import {DeviceVersionUnsupported} from '../errors'
import type {DeviceCompatibility, Version} from '../types/internal'
import {getVersionString} from '../utils'
import {INS} from './common/ins'
import type {Interaction, SendParams} from './common/types'

const send = (params: {
  p1: number
  p2: number
  data: Buffer
  expectedResponseLength?: number
}): SendParams => ({ins: INS.GET_VERSION, ...params})

export function* getVersion(): Interaction<Version> {
  // moving getVersion() logic to private function in order
  // to disable concurrent execution protection done by this.transport.decorateAppAPIMethods()
  // when invoked from within other calls to check app version

  const P1_UNUSED = 0x00
  const P2_UNUSED = 0x00
  const response = yield send({
    p1: P1_UNUSED,
    p2: P2_UNUSED,
    data: Buffer.alloc(0),
    expectedResponseLength: 4,
  })
  const [major, minor, patch, flags_value] = response

  const FLAG_IS_DEBUG = 1
  // const FLAG_IS_HEADLESS = 2;
  const FLAG_IS_APP_XS = 4

  const flags = {
    // eslint-disable-next-line no-bitwise
    isDebug: (flags_value & FLAG_IS_DEBUG) === FLAG_IS_DEBUG,
    // eslint-disable-next-line no-bitwise
    isAppXS: (flags_value & FLAG_IS_APP_XS) === FLAG_IS_APP_XS,
  }
  return {major, minor, patch, flags}
}

export function isLedgerAppVersionAtLeast(
  version: Version,
  minMajor: number,
  minMinor: number,
): boolean {
  const {major, minor} = version

  return major > minMajor || (major === minMajor && minor >= minMinor)
}

export function isLedgerAppVersionAtMost(
  version: Version,
  maxMajor: number,
  maxMinor: number,
): boolean {
  const {major, minor} = version

  return major < maxMajor || (major === maxMajor && minor <= maxMinor)
}

export function getCompatibility(version: Version): DeviceCompatibility {
  // We restrict forward compatibility only to backward-compatible semver changes
  const v2_2 =
    isLedgerAppVersionAtLeast(version, 2, 2) &&
    isLedgerAppVersionAtMost(version, 7, Infinity)
  const v2_3 =
    isLedgerAppVersionAtLeast(version, 2, 3) &&
    isLedgerAppVersionAtMost(version, 7, Infinity)
  const v2_4 =
    isLedgerAppVersionAtLeast(version, 2, 4) &&
    isLedgerAppVersionAtMost(version, 7, Infinity)
  const v3_0 =
    isLedgerAppVersionAtLeast(version, 3, 0) &&
    isLedgerAppVersionAtMost(version, 7, Infinity)
  const v4_0 =
    isLedgerAppVersionAtLeast(version, 4, 0) &&
    isLedgerAppVersionAtMost(version, 7, Infinity)
  const v4_1 =
    isLedgerAppVersionAtLeast(version, 4, 1) &&
    isLedgerAppVersionAtMost(version, 7, Infinity)
  const v5_0 =
    isLedgerAppVersionAtLeast(version, 5, 0) &&
    isLedgerAppVersionAtMost(version, 7, Infinity)
  const v6_0 =
    isLedgerAppVersionAtLeast(version, 6, 0) &&
    isLedgerAppVersionAtMost(version, 7, Infinity)
  const v7_0 =
    isLedgerAppVersionAtLeast(version, 7, 0) &&
    isLedgerAppVersionAtMost(version, 7, Infinity)
  const v7_1 =
    isLedgerAppVersionAtLeast(version, 7, 1) &&
    isLedgerAppVersionAtMost(version, 7, Infinity)

  const isAppXS = version.flags.isAppXS

  return {
    isCompatible: v2_2,
    recommendedVersion: v2_2 ? null : '7.0',
    supportsByronAddressDerivation: v2_2 && !isAppXS,
    supportsMary: v2_2,
    supportsCatalystRegistration: v2_3, // CIP-15
    supportsCIP36: v6_0,
    supportsZeroTtl: v2_3,
    supportsPoolRegistrationAsOwner: v2_2 && !isAppXS,
    supportsPoolRegistrationAsOperator: v2_4 && !isAppXS,
    supportsPoolRetirement: v2_4 && !isAppXS,
    supportsNativeScriptHashDerivation: v3_0 && !isAppXS,
    supportsMultisigTransaction: v3_0,
    supportsMint: v3_0,
    supportsAlonzo: v4_0,
    supportsReqSignersInOrdinaryTx: v4_1,
    supportsBabbage: v5_0,
    supportsCIP36Vote: v6_0,
    supportsConway: v7_0,
    supportsMessageSigning: v7_1,
  }
}

export function ensureLedgerAppVersionCompatible(version: Version): void {
  const {isCompatible, recommendedVersion} = getCompatibility(version)

  if (!isCompatible) {
    throw new DeviceVersionUnsupported(
      `Device app version ${getVersionString(
        version,
      )} unsupported, recommended version is ${recommendedVersion}.`,
    )
  }
}
