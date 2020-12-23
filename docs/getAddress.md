# Cardano: get address
Get requested address derived by given BIP32-Ed25519 path from device and return it to caller.

ES6
```javascript
const result = await ledger.deriveAddress(addressType, networkIdOrProtocolMagic, spendingPath, stakingPath?, stakingKeyHashHex?, stakingBlockchainPointer?);
```


## Params

### Exporting address
* `addressTypeNibble` - *required* `number` Type of the address you want to derive, accepts `AddressTypeNibbles` enum below
* `networkIdOrProtocolMagic` - *required* `number` Either NetworkId or ProtocolMagic, NetworkId accepts `1` for mainnet and `0` for testnet, ProtocolMagic accepts `764824073` for mainnet and `42` for testnet. Protocol magic is expected for Byron-era addresses, Network id for Shelley-era addresses.
* `spendingPath` - *required* `Array<number>` BIP44 derivation path for the address, minimum length `5`, maximum length `10`, accepts only Array (ex. `[(1852 | 0x80000000) >>> 0, (1815 | 0x80000000) >>> 0, (0 | 0x80000000) >>> 0, 0, 0]`) format
* `stakingPath` - *optional* `Array<number> | null` BIP44 derivation path for the staking part of the address, either this or `stakingKeyHashHex` are required for base address derivation, minimum length `5`, accepts only Array (ex. `[(1852 | 0x80000000) >>> 0, (1815 | 0x80000000) >>> 0, (0 | 0x80000000) >>> 0, 2, 0]`) format
* `stakingKeyHashHex` - *optional* `string | null` Staking part of the address as hex string, either this or `stakingPath` are required for base address derivation, device cannot verify ownership of the staking key.
* `stakingBlockchainPointer` - *optional* `StakingBlockchainPointer | null` object below, required for pointer address derivation

### AddressTypeNibbles
```javascript
    BASE: 0b0000,
    POINTER: 0b0100,
    ENTERPRISE: 0b0110,
    BYRON: 0b1000,
    REWARD: 0b1110
```

### StakingBlockchainPointer
```javascript
{
    blockIndex: number, //index of the block this pointer is pointing to
    txIndex: number, //index of the transaction within the block this pointer is pointing to
    certificatePointer: number, //index of the certificate within the transaction this pointer is pointing to
}
```

## Responses

### Success
```javascript
{
    addressHex: string, //derived address in hexadecimal notation
}
```

To convert the address in hex format to its human-readable representation, you will need to Base58-encode the Byron-era addresses and bech32-encode the Shelley-era addresses. We offer for that the respective utility functions `bech32_encodeAddress(Buffer)` and `base58_encode(Buffer)`.

### Error case
```javascript
//Throws HwTransport.TransportStatusError with errorcode and message set by https://github.com/cardano-foundation/ledger-app-cardano/blob/master/src/errors.h
```


## Examples

Note: for more convenient path representation using [str_to_path()](helperFunctions.md#str_to_path) helper function

Derive byron address of second cardano account:

### Request
```javascript
ledger.deriveAddress(
    0b1000,
    764824073,
    str_to_path("44'/1815'/1'/0/5"),
    null,
    null,
    null
);
```
### Response
```javascript
{
    addressHex: '82d818582183581cccb2a5aebff21cde864d7b4604ce0f0720b819200315ae7834c6a6a5a0001ab0fc69cb'
}
```

Derive base address of first cardano account:

### Request
```javascript
ledger.deriveAddress(
    0b0000,
    0x00,
    str_to_path("1852'/1815'/0'/0/5"),
    str_to_path("1852'/1815'/0'/2/0"),
    null,
    null,
);
```
### Response
```javascript
{
    addressHex: '014e309255e1af0b1a9f2b05f242c1f4d9f714cae099d7a8fc3211be40f4c4b61d90aaf31f4a72a941d166b7ef7e57885531ef6f72fc3bccc7'
}
```

Derive pointer address of first cardano account:

### Request
```javascript
ledger.deriveAddress(
    0b0100,
    0x00,
    str_to_path("1852'/1815'/0'/0/0"),
    null,
    null,
    {
        blockIndex: 1,
        txIndex: 2,
        certificatePointer: 3
    }
);
```
### Response
```javascript
{
    addressHex: '40f641cc7e1b7e8058e96db6020d798a2cf1eb85c3310417b2980ab37c010203'
}
```

Derive enterprise address of third cardano account:

### Request
```javascript
ledger.deriveAddress(
    0b0110,
    764824073,
    str_to_path("1852'/1815'/2'/0/0"),
    null,
    null,
    null
);
```
### Response
```javascript
{
    addressHex: '618cd778352910dc08d3833c0f25372e10cbefe262136830260e6c4fc1'
}
```

Derive reward address of first cardano account:

### Request
```javascript
ledger.deriveAddress(
    0b1110,
    764824073,
    str_to_path("1852'/1815'/0'/2/0"),
    null,
    null,
    null
);
```
### Response

```javascript
{
    addressHex: 'e1f4c4b61d90aaf31f4a72a941d166b7ef7e57885531ef6f72fc3bccc7'
}
```
