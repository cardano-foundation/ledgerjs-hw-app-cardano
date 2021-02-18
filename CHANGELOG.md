# Change Log
All notable changes to this project will be documented in this file.
 
The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [2.2.1](https://github.com/cardano-foundation/ledgerjs-hw-app-cardano/compare/v2.2.0...v2.2.1)

Patch release with a minor fix in signTransaction() call's parameters validation

### Added

### Changed

### Fixed

- relax the tokenBundle feature check to allow an empty array https://github.com/cardano-foundation/ledgerjs-hw-app-cardano/pull/17

## [2.2.0](https://github.com/cardano-foundation/ledgerjs-hw-app-cardano/compare/v2.1.0...v2.2.0) - [February 8th 2020]

Works with Ledger Cardano app 2.2.0 and is backwards compatible with older versions down to 2.0.4/2.0.5\*. Older versions of this js library do not support Ledger Cardano app 2.2.0, hence an update to this version of the library is required before Ledger Cardano app 2.2.0 is released.

### Added

- Support for Allegra-era transaction min validity property, transaction TTL is now optional: https://github.com/vacuumlabs/ledgerjs-cardano-shelley/pull/27/files
- Support for Mary-era multiasset outputs (no minting yet) https://github.com/vacuumlabs/ledgerjs-cardano-shelley/pull/27/files
- Update docs with a stake pool registration (as an owner) example https://github.com/vacuumlabs/ledgerjs-cardano-shelley/pull/23

 
### Changed

### Fixed

- Fixed incorrect validation of numerical parameters passed as strings which failed for values over JS max safe integer: https://github.com/vacuumlabs/ledgerjs-cardano-shelley/pull/29

## [2.1.0](https://github.com/cardano-foundation/ledgerjs-hw-app-cardano/releases/tag/v2.1.0) - [December 11th 2020]

Works with Ledger Cardano app 2.1.0 and is backwards compatible with 2.0.4/2.0.5 as well\*. Older versions of this library do not support Ledger Cardano app 2.1.0, therefore an update to this version of the library is required before Ledger Cardano app 2.1.0 is released.

### Added

- Support for bulk public key export https://github.com/vacuumlabs/ledgerjs-cardano-shelley/pull/13/files
- Support for stake pool registration certificate as a pool owner https://github.com/vacuumlabs/ledgerjs-cardano-shelley/pull/12
- Docs for available calls https://github.com/vacuumlabs/ledgerjs-cardano-shelley/pull/17
 
### Changed

- Allow transactions without outputs: https://github.com/vacuumlabs/ledgerjs-cardano-shelley/pull/16
- Updated flow types for Certificates, [commit](https://github.com/vacuumlabs/ledgerjs-cardano-shelley/commit/c50d383fe65e0db1787bda39984423f165bf0316#diff-6e0ee7e0e42296aeb681e34e50808e744aeeeff03702bab5ab7994bb4e0562e3)

### Fixed

## [2.0.1] - [August 20th 2020]
 
### Added

- Certificate and address type Flow enums, [commit](https://github.com/vacuumlabs/ledgerjs-cardano-shelley/commit/df08b3fdb7383b1065e7ad971626430a126f98aa)
 
### Changed

### Fixed


## [2.0.0] - [August 18th 2020]

First release with Shelley-era support, works with Ledger Cardano app version 2.0.4 (Nano S) and 2.0.5 (Nano X). Older versions of this library no longer work with the Cardano blockchain.


### Added

### Changed

### Fixed


\* *backwards compatibility refers only to features supported by the respective app versions, unsupported features result in an error being thrown.*
