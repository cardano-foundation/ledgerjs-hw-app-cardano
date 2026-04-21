import type {DeviceCompatibility} from '../../types/internal'

// XS is a v7-only concern carried by legacy Nano S app builds.
// v8 capability handling must not depend on this flag.
export function applyV7XsCompatibilityAdjustments(
  compatibility: DeviceCompatibility,
  isAppXS: boolean,
): DeviceCompatibility {
  if (!isAppXS) {
    return compatibility
  }

  return {
    ...compatibility,
    supportsByronAddressDerivation: false,
    supportsPoolRegistrationAsOwner: false,
    supportsPoolRegistrationAsOperator: false,
    supportsPoolRetirement: false,
    supportsNativeScriptHashDerivation: false,
  }
}
