import type {Version} from '../types/public'

export function getVersionString(version: Version): string {
  const xs = version.flags.isAppXS ? '-NanoS' : ''
  return `${version.major}.${version.minor}.${version.patch}${xs}`
}
