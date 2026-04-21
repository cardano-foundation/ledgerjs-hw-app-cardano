import {DeviceVersionUnsupported} from '../errors'
import type {DeviceCompatibility, Version} from '../types/internal'
import {getVersionString} from '../utils'
import {applyV7XsCompatibilityAdjustments} from './v7/xs'

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

export function isV7App(version: Version): boolean {
  return version.major <= 7
}

export function isV8App(version: Version): boolean {
  return version.major >= 8
}

export function getCompatibility(version: Version): DeviceCompatibility {
  if (isV8App(version)) {
    return {
      isCompatible: true,
      recommendedVersion: null,
      supportsByronAddressDerivation: true,
      supportsMary: true,
      supportsCatalystRegistration: true,
      supportsCIP36: true,
      supportsZeroTtl: true,
      supportsPoolRegistrationAsOwner: true,
      supportsPoolRegistrationAsOperator: true,
      supportsPoolRetirement: true,
      supportsNativeScriptHashDerivation: true,
      supportsMultisigTransaction: true,
      supportsMint: true,
      supportsAlonzo: true,
      supportsReqSignersInOrdinaryTx: true,
      supportsBabbage: true,
      supportsCIP36Vote: true,
      supportsConway: true,
      supportsMultipleVoters: true,
      supportsMultipleVotesPerVoter: true,
      supportsMessageSigning: true,
    }
  }

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

  return applyV7XsCompatibilityAdjustments(
    {
      isCompatible: v2_2,
      recommendedVersion: v2_2 ? null : '7.0',
      supportsByronAddressDerivation: v2_2,
      supportsMary: v2_2,
      supportsCatalystRegistration: v2_3, // CIP-15
      supportsCIP36: v6_0,
      supportsZeroTtl: v2_3,
      supportsPoolRegistrationAsOwner: v2_2,
      supportsPoolRegistrationAsOperator: v2_4,
      supportsPoolRetirement: v2_4,
      supportsNativeScriptHashDerivation: v3_0,
      supportsMultisigTransaction: v3_0,
      supportsMint: v3_0,
      supportsAlonzo: v4_0,
      supportsReqSignersInOrdinaryTx: v4_1,
      supportsBabbage: v5_0,
      supportsCIP36Vote: v6_0,
      supportsConway: v7_0,
      supportsMultipleVoters: false,
      supportsMultipleVotesPerVoter: false,
      supportsMessageSigning: v7_1,
    },
    version.flags.isAppXS,
  )
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
