
# Cardano: Sign transaction
Asks device to sign given transaction. User is asked to confirm all transaction
details on device.

Stake pool opration transactions are explained in separate file.

ES6
```javascript
const result = await ledger.signTransaction(networkId, protocolMagic, inputs, outputs, feeStr, ttlStr, certificates, withdrawals, metadataHashHex);
```

## Params

### Sign a transaction
* `networkId` - *required* `number` must be 1 for Mainnet, 0 for Testnet
* `protocolMagic` - *required* `number` must be 764824073 for Mainnet, 42 for Testnet
* `inputs` - *required* `Array<InputTypeUTxO>` Array of transaction inputs, for type read below
* `outputs` - *required* `Array<OutputTypeAddress | OutputTypeAddressParams>` Array of transaction outputs, can be Byron or Shelley outputs, for type read below
* `feeStr` - *required* `string` Transaction fee in Lovelace, in decimal notation 
* `ttlStr` - *optional* `string` absolute slot number when before which the transaction needs to be submitted in order to be valid. Must be a stringified positive integer
* `certificates` - *optional* `Array<Certificate>` Array of certificates included in this transaction, for type read below
* `withdrawals` - *optional* `Array<Withdrawal>` Array of withdrawals included in this transaction, for type read below
* `metadataHashHex` - *optional* `string` Metadata for the transaction, must be a CBOR encoded `map` type.
* `validityIntervalStartStr` - *optional* `string` absolute slot number since which given transaction becomes valid. Must be a stringified positive integer

### InputTypeUTxO
* `path` - *optional* `Array<number>` BIP44 derivation path for the address, minimum length `5`, maximum length `10`, accepts only Array (ex. `[(44 | 0x80000000) >>> 0, (1815 | 0x80000000) >>> 0, (0 | 0x80000000) >>> 0, 0, 0]`) format
* `txHashHex` - *required* `string`  Hash in hexadecimal notation of the transaction where this input is an output
* `outputIndex` - *required* `number` Index of this input in the transaction outputs this input uses.

Note: path is actually required in almost all cases, except when a stake pool registration certificates is being signed, as explained in this [article](certificates.md#stake-pool-registration-as-an-owner-limitations)
### OutputTypeAddress
* `amountStr` - *required* `string` The amount of ADA assigned to this output in this transaction in decimal Lovelace
* `tokenBundle` - *optional* `Array<AssetGroup>` Token bundle listing tokens to be sent. Please note that the entries get serialized into the resulting transaction body CBOR in the order they are in the list.
* `addressHex` - *optional* `string` The address where this output is going in hexadecimal notation, used for Byron outputs

### OutputTypeAddressParams
* `amountStr` - *required* `number` The amount of ADA assigned to this output in this transaction in decimal Lovelace
* `tokenBundle` - *optional* `Array<AssetGroup>` Token bundle listing tokens to be sent. Please note that the entries get serialized into the resulting transaction body CBOR in the order they are in the list.
* `addressTypeNibble` - *required* `number` Type of the address you want to derive, accepts `AddressTypeNibbles` enum below
* `spendingPath` — *required* `Array<number>` BIP44 derivation path for the address, minimum length `5`, maximum length `10`, accepts only Array (ex. `[(1852 | 0x80000000) >>> 0, (1815 | 0x80000000) >>> 0, (0 | 0x80000000) >>> 0, 0, 0]`) format
* `stakingPath` — *optional* `Array<number> | null` BIP44 derivation path for the staking part of the address, either this or `stakingKeyHashHex` are required for base address derivation, minimum length `5`, accepts only Array (ex. `[(1852 | 0x80000000) >>> 0, (1815 | 0x80000000) >>> 0, (0 | 0x80000000) >>> 0, 2, 0]`) format
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

### Certificate

Certificates are documented in a separate [article](certificates.md)

### AssetGroup
* `policyIdHex` - *required* `string` Hex string representing given policyId
* `tokens` - *required* `Array<Token>` List of asset name - amount pairs. Please note that the entries get serialized into the resulting transaction body CBOR in the order they are in the list.

### Token
* `assetNameHex` - *required* `string` asset name encoded in hex, the device shows as text only hex strings consisting of visible ASCII characters (ascii code range <33, 126>)
* `amountStr` - *required* `string` the amount of given asset, must be a stringified non-negative integer

### Withdrawal
* `path` - *required* `Array<number>` BIP44 derivation path for the reward address this withdrawal is for, minimum length `5`, accepts only Array (ex. `[(1852 | 0x80000000) >>> 0, (1815 | 0x80000000) >>> 0, (0 | 0x80000000) >>> 0, 2, 0]`) format
* `amountStr` - *required* `number` The amount of ADA withdrawn to this address in decimal Lovelace


## Responses

### Success case
```javascript
{
    success: true,
    payload: {
        txHashHex: string, //blake2b hash of the transaction body, used to index this transaction in the blockchain
        witnesses: Array<Witness> //an array of signed witnesses, caller is responsible for serialising the final transaction
    }
}
```

### Error case
```javascript
{
    success: false,
    payload: {
        error: string // error message
    }
}
```

## Internal validation details

A single transaction can include one or more entries, it can have zero or more outputs, zero or more certificates attached and zero or more staking reward withdrawals.

Every transaction must include at least one input.

The caller is responsible for ensuring inputs contain enough ADA to cover all payments and operational fees, the device does not check is as the blockchain itself is supposed to reject transactions that are not valid in that regard.


## Example
Note: for more convenient path representation using [str_to_path()](helperFunctions.md#str_to_path) helper function

```javascript
ledger.signTransaction(
    1, //networkId
    764824073, //protocolMagic
    [
        {
            path: str_to_path("1852'/1815'/0'/0/1"),
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
            addressHex: "82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c2561",
            amountStr: "4700",
            tokenBundle: [
                {
                    policyIdHex: "75a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39",
                    tokens: [
                        {
                            assetNameHex: "7564247542686911",
                            amountStr: "47"
                        }
                    ]
                },
                {
                    policyIdHex: "95a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39",
                    tokens: [
                        {
                            assetNameHex: "456c204e69c3b16f",
                            amountStr: "7878754"
                        },
                        {
                            assetNameHex: "74652474436f696e", // "te$tCoin"
                            amountStr: "1234"
                        }
                    ]
                }
            ]
        },
        {
            addressTypeNibble: 0b0000,
            spendingPath: str_to_path("1852'/1815'/0'/0/0"),
            stakingPath: str_to_path("1852'/1815'/0'/2/0"),
            amountStr: "7120787",
        }
    ], //outputs
    "42", //feeStr
    "10", //ttlStr
    [
        {
            type: 0,
            path: str_to_path("1852'/1815'/0'/2/0"),
        },
        {
            type: 1,
            path: str_to_path("1852'/1815'/0'/2/0"),
        },
        {
            type: 2,
            path: str_to_path("1852'/1815'/0'/2/0"),
            poolKeyHashHex: "f61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb4973"
        },
    ], //certificates
    [
        {
            path: str_to_path("1852'/1815'/0'/2/0"),
            amountStr: "1000",
        }
    ], //withdrawals
    "a200a11864a118c843aa00ff01a119012c590100a200a11864a1a200a11864a1", //metadataHashHex,
    "7", //validityIntervalStartStr
);
```

## Result
```javascript
{
    txHashHex: '30f6d278f7b5191364f7ae59ecf1db15db10d3efedcb367c5c34761793a653ee',
    witnesses: [
        {
            path: [(44 | 0x80000000) >>> 0, (1815 | 0x80000000) >>> 0, (0 | 0x80000000) >>> 0, 0, 1],
            witnessSignatureHex: '078c05676f2183f7da9f69a23cadf0a34ba04fc5dacf000f40eaf13a1edcbf7591b8fcf56b75b9e157363c4be9cb1ba5d3f01a7713567ee223cffb6e2afda30c'
        },
        {
            path: [(1852 | 0x80000000) >>> 0, (1815 | 0x80000000) >>> 0, (0 | 0x80000000) >>> 0, 2, 0],
            witnessSignatureHex: '5b1439560ce51cd67cdb5922cbc7b42f8fa24f8009d7d9bd49af9206c46d8e32cba96639498e3064ab31b93b7cfa5506fdf167e1eedd298adaa580ae616f800d'
        }
    ]
}
```