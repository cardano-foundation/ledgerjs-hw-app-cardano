
## Cardano: Sign transaction
Asks device to sign given transaction. User is asked to confirm all transaction
details on device.

Stake pool opration transactions are explained in separate file.

ES6
```javascript
const result = await ledger.signTransaction(networkId, protocolMagic, inputs, outputs, feeStr, ttlStr, certificates, withdrawals, metadataHashHex);
```

### Params

#### Sign a transaction
* `networkId` - *required* `number` must be 1 for Mainnet, 0 for Testnet
* `protocolMagic` - *required* `number` must be 764824073 for Mainnet, 42 for Testnet
* `inputs` - *required* `Array<InputTypeUTxO>` Array of transaction inputs, for type read below
* `outputs` - *required* `Array<OutputTypeAddress | OutputTypeAddressParams>` Array of transaction outputs, can be Byron or Shelley outputs, for type read below
* `feeStr` - *required* `string` Transaction fee in Lovelace, in decimal notation 
* `ttlStr` - *required* `string` How many blocks into the future can this transaction wait before it becomes invalid
* `certificates` - *optional* `Array<Certificate>` Array of certificates included in this transaction, for type read below
* `withdrawals` - *optional* `Array<Withdrawal>` Array of withdrawals included in this transaction, for type read below
* `metadataHashHex` - *optional* `string` Metadata for the transaction, must be a CBOR encoded `map` type.

#### InputTypeUTxO
* `path` - *required* `Array<number>` BIP44 derivation path for the address, minimum length `5`, maximum length `10`, accepts only Array (ex. `[(44 | 0x80000000) >>> 0, (1815 | 0x80000000) >>> 0, (0 | 0x80000000) >>> 0, 0, 0]`) format
* `txHashHex` - *required* `string`  Hash in hexadecimal notation of the transaction where this input is an output
* `outputIndex` - *required* `number` Index of this input in the transaction outputs this input uses.

#### OutputTypeAddress
* `amountStr` - *required* `string` The amount of ADA assigned to this output in this transaction in decimal Lovelace
* `addressHex` - *optional* `string` The address where this output is going in hexadecimal notation, used for Byron outputs

#### OutputTypeAddressParams
* `amountStr` - *required* `number` The amount of ADA assigned to this output in this transaction in decimal Lovelace
* `addressTypeNibble` - *required* `number` Type of the address you want to derive, accepts `AddressTypeNibbles` enum below
* `spendingPath` — *required* `Array<number>` BIP44 derivation path for the address, minimum length `5`, maximum length `10`, accepts only Array (ex. `[(1852 | 0x80000000) >>> 0, (1815 | 0x80000000) >>> 0, (0 | 0x80000000) >>> 0, 0, 0]`) format
* `stakingPath` — *optional* `Array<number> | null` BIP44 derivation path for the staking part of the address, either this or `stakingKeyHashHex` are required for base address derivation, minimum length `5`, accepts only Array (ex. `[(1852 | 0x80000000) >>> 0, (1815 | 0x80000000) >>> 0, (0 | 0x80000000) >>> 0, 2, 0]`) format
* `stakingKeyHashHex` - *optional* `string | null` Staking part of the address as hex string, either this or `stakingPath` are required for base address derivation, device cannot verify ownership of the staking key.
* `stakingBlockchainPointer` - *optional* `StakingBlockchainPointer | null` object below, required for pointer address derivation

#### AddressTypeNibbles
```javascript
    BASE: 0b0000,
    POINTER: 0b0100,
    ENTERPRISE: 0b0110,
    BYRON: 0b1000,
    REWARD: 0b1110
```

#### StakingBlockchainPointer
```javascript
{
    blockIndex: number, //index of the block this pointer is pointing to
    txIndex: number, //index of the transaction within the block this pointer is pointing to
    certificatePointer: number, //index of the certificate within the transaction this pointer is pointing to
}
```

#### Certificate
* `type` - *required* `number` Certificate type.
* `path` - *required* `Array<number>` BIP44 derivation path for the staking address included in this certificate, minimum length `5`, accepts only Array (ex. `[(1852 | 0x80000000) >>> 0, (1815 | 0x80000000) >>> 0, (0 | 0x80000000) >>> 0, 2, 0]`) format
* `poolKeyHashHex` - *optional* `string` Hash of pool ID in hexadecimal notation, required for certificates that represent a pool operation

##### Supported Certificate Types:
```javascript
    STAKE_REGISTRATION: 0, // requires path
	STAKE_DEREGISTRATION: 1, // requires path
	STAKE_DELEGATION: 2, // requires path and poolKeyHashHex
	STAKE_POOL_REGISTRATION : 3 // TODO document, available since Ledger app 2.1.0
```

#### Withdrawal
* `path` - *required* `Array<number>` BIP44 derivation path for the reward address this withdrawal is for, minimum length `5`, accepts only Array (ex. `[(1852 | 0x80000000) >>> 0, (1815 | 0x80000000) >>> 0, (0 | 0x80000000) >>> 0, 2, 0]`) format
* `amountStr` - *required* `number` The amount of ADA withdrawn to this address in decimal Lovelace


### Responses

#### Success case
```javascript
{
    success: true,
    payload: {
        txHashHex: string, //blake2b hash of the transaction body, used to index this transaction in the blockchain
        witnesses: Array<Witness> //an array of signed witnesses, caller is responsible for serialising the final transaction
    }
}
```

#### Error case
```javascript
{
    success: false,
    payload: {
        error: string // error message
    }
}
```

### Internal validation details

A single transaction can include one or more entries, it can have one or more outputs, zero or more certificates attached and zero or more staking reward withdrawals.

Every transaction must include at least one input and one output.

The caller is responsible for ensuring inputs contain enough ADA to cover all payments and operational fees, the device does not check is as the blockchain itself is supposed to reject transactions that are not valid in that regard.


### Example
```javascript
ledger.signTransaction(
    1, //networkId
    764824073, //protocolMagic
    [
        {
            path: [(44 | 0x80000000) >>> 0, (1815 | 0x80000000) >>> 0, (0 | 0x80000000) >>> 0, 0, 1],
            txHashHex: "1af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163f63dcfc",
            outputIndex: 0,
        }
    ], //inputs
    [
        {
            addressHex: "82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c2561",
            amountStr: "3003112",
        },
        {
            addressTypeNibble: 0b0000,
            spendingPath: [(1852 | 0x80000000) >>> 0, (1815 | 0x80000000) >>> 0, (0 | 0x80000000) >>> 0, 0, 0],
            stakingPath: [(1852 | 0x80000000) >>> 0, (1815 | 0x80000000) >>> 0, (0 | 0x80000000) >>> 0, 2, 0],
            amountStr: "7120787",
        }
    ], //outputs
    "42", //feeStr
    "10", //ttlStr
    [
        {
            type: 0,
            path: [(1852 | 0x80000000) >>> 0, (1815 | 0x80000000) >>> 0, (0 | 0x80000000) >>> 0, 2, 0]
        },
        {
            type: 1,
            path: [(1852 | 0x80000000) >>> 0, (1815 | 0x80000000) >>> 0, (0 | 0x80000000) >>> 0, 2, 0]
        },
        {
            type: 2,
            path: [(1852 | 0x80000000) >>> 0, (1815 | 0x80000000) >>> 0, (0 | 0x80000000) >>> 0, 2, 0],
            poolKeyHashHex: "f61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb4973"
        },
    ], //certificates
    [
        {
            path: [(1852 | 0x80000000) >>> 0, (1815 | 0x80000000) >>> 0, (0 | 0x80000000) >>> 0, 2, 0],
            amountStr: "1000",
        }
    ], //withdrawals
    "a200a11864a118c843aa00ff01a119012c590100a200a11864a1a200a11864a1" //metadataHashHex
);
```

### Result
```javascript
{
    txHashHex: '7c6f577545a532527000fb112456f368262ab57648fe135567fa1c97971c87b4',
    witnesses: [
        {
            path: [(44 | 0x80000000) >>> 0, (1815 | 0x80000000) >>> 0, (0 | 0x80000000) >>> 0, 0, 1],
            witnessSignatureHex: 'c4ec6a31047dd987c626a75c8c1087189f5f6ff2ba845c73a8866a73b66e9ded4e722c1e7a4c96ed11cee6e749bb485352256a1c654b2cecb1a68dca592dfc0c'
        },
        {
            path: [(1852 | 0x80000000) >>> 0, (1815 | 0x80000000) >>> 0, (0 | 0x80000000) >>> 0, 2, 0],
            witnessSignatureHex: 'cafe10383d955fcf9f6fea032628916ea5030776f34762cadfbd92352918250e173b149479c50d101d79af435de78f05fb9ebb63f7f3e977b9e5a82422b34c0f'
        }
    ]
}
```