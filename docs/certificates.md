# Cardano: Signing transactions containing certificates

Ledger Cardano app supports several certificate types to be included in the transaction, namely:

```javascript
STAKE_REGISTRATION: 0, // staking key registration
STAKE_DEREGISTRATION: 1, // staking key deregistration
STAKE_DELEGATION: 2, // delegation to stake pool
STAKE_POOL_REGISTRATION : 3 // stake pool registration (as an owner) available since Ledger Cardano app 2.1.0
```

## Inclusion of certificates into the transaction

Certificates are included in the signTransaction call's parameters in an array, see respective [article](signTransaction.md)

## Params

### Staking key registration

* `type` - *required* `number` Certificate type - fixed to 0
* `path` - *required* `Array<number>` BIP44 derivation path for the staking address included in this certificate, required length `5`, accepts only Array (ex. `[(1852 | 0x80000000) >>> 0, (1815 | 0x80000000) >>> 0, (0 | 0x80000000) >>> 0, 2, 0]`) format

### Staking key deregistration

* `type` - *required* `number` Certificate type - fixed to 1
* `path` - *required* `Array<number>` BIP44 derivation path for the staking address included in this certificate, required length `5`, accepts only Array (ex. `[(1852 | 0x80000000) >>> 0, (1815 | 0x80000000) >>> 0, (0 | 0x80000000) >>> 0, 2, 0]`) format

### Stake delegation

* `type` - *required* `number` Certificate type - fixed to 2
* `path` - *required* `Array<number>` BIP44 derivation path for the staking address included in this certificate, required length `5`, accepts only Array (ex. `[(1852 | 0x80000000) >>> 0, (1815 | 0x80000000) >>> 0, (0 | 0x80000000) >>> 0, 2, 0]`) format
* `poolKeyHashHex` - *required* `string` Hash of pool ID in hexadecimal notation, required for certificates that represent a pool operation

### Stake pool registration (as an owner)

* `type` - *required* `number` Certificate type - fixed to 3
* `poolRegistrationParams` - *required* `PoolRegistrationParams`

#### PoolRegistrationParams object structure

* `poolKeyHashHex` - *required* `string` Hash of pool ID in hexadecimal notation, required for certificates that represent a pool operation
* `vrfKeyHashHex` - *required* `string` Hash of VRF public key in hexadecimal notation, required for certificates that represent a pool operation
* `pledgeStr` - *required* `string` The amount of ADA as stake pool's pledge in decimal Lovelace
* `costStr` - *required* `string` The amount of ADA as stake pool's cost in decimal Lovelace
* `margin` - *required* `Object` Stake pool margin given as a fraction (object with numeratorStr and denominatorStr keys), e.g. 1/2 would be `{ numeratorStr: "1", denominatorStr: "2" }`
* `rewardAccountHex` - *required* `string` Stake pool reward address encoded as hex
* `poolOwners` - *required* `Array<PoolOwner>` List of stake pool owners
* `relays` - *required* `Array<PoolRelay>` List of stake pool relays
* `metadata` - *optional* `PoolMetadataParams` Stake pool metadata parameters object

#### PoolOwner object structure

`PoolOwner` object must either contain `stakingKeyHashHex` or `stakingPath`

* `stakingKeyHashHex` - *optional* `string` Hash of pool owner's staking key
* `stakingPath` - *optional* `Array<number>` BIP44 derivation path for the staking key of the given owner, required length `5`, accepts only Array (ex. `[(1852 | 0x80000000) >>> 0, (1815 | 0x80000000) >>> 0, (0 | 0x80000000) >>> 0, 2, 0]`) format

#### PoolRelay object structure

* `type` - *required* `number` Stake pool relay type (can be 0 - single host IP, 1 - single host DNS, 2 - multiple hosts DNS)
* `params` - *required* `PoolRelayParams` Pool relay params (depending on the type)

#### PoolRelayParams object structure

##### Single host IP

* `portNumber` - *optional* `number` network port number, e.g. `3000`
* `ipv4` - *optional* `string` IPv4 address of the host, e.g. `"54.48.78.2"`
* `ipv6` - *optional* `string` IPv6 address of the host, e.g. `"24ff:7801:33a2:e383:a5c4:340a:07c2:76e5"` (needs to be full form)

Either IPv4 or IPv6 address has to be provided (or both)

##### Single host DNS

* `portNumber` - *optional* `number` network port number, e.g. `3000`
* `dnsName` - *required* `string` IPv6 address of the host, e.g. `"aaaa.bbbb.com"`

Either IPv4 or IPv6 address has to be provided (or both)

##### Multiple hosts DNS

* `dnsName` - *required* `string` IPv6 address of the host, e.g. `"aaaa.bbbb.com"`

#### PoolMetadataParams object structure

* `metadataUrl` - *required* `string` URL where stake pool metadata JSON is hosted, URL should have max 64 ASCII printable characters
* `metadataHashHex` - *required* `string` Blake2b-256 metadata JSON hash in hexadecimal notation

## Examples

Note: for more convenient path representation using [str_to_path()](helperFunctions.md#str_to_path) helper function

### Staking key registration

Register staking key for Shelley account `1852'/1815'/0'`

```javascript
{
    type: 0,
    path: str_to_path("1852'/1815'/0'/2/0")
}
```

### Staking key deregistration

Deregister staking key for Shelley account `1852'/1815'/0'`

```javascript
{
    type: 1,
    path: str_to_path("1852'/1815'/0'/2/0")
}
```

### Stake delegation

Register staking key from Shelley account `1852'/1815'/0'` to stake pool `f61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb4973`

```javascript
{
    type: 2,
    path: str_to_path("1852'/1815'/0'/2/0"),
    poolKeyHashHex: "f61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb4973"
}
```

### Stake pool registration (as an owner)

```javascript
{
  type: 3,
  poolRegistrationParams: {
    poolKeyHashHex: "13381d918ec0283ceeff60f7f4fc21e1540e053ccf8a77307a7a32ad",
    vrfKeyHashHex: "07821cd344d7fd7e3ae5f2ed863218cb979ff1d59e50c4276bdc479b0d084450",
    pledgeStr: "50000000000", // 500 ADA
    costStr: "340000000", // 340 ADA
    margin: {
        numeratorStr: "3",
        denominatorStr: "100",
    },
    rewardAccountHex: "e1794d9b3408c9fb67b950a48a0690f070f117e9978f7fc1d120fc58ad",
    poolOwners: [
        { // the owner which is requesting the respective signature from Ledger
            stakingPath: str_to_path("1852'/1815'/0'/2/1")
        },
        { // other owner
            stakingKeyHashHex: "0bd5d796f5e54866a14300ec2a18d706f7461b8f0502cc2a182bc88d"
        }
    ],
    relays: [
        {
            type: 0, // single host IP
            params: {
                portNumber: 3000,
                ipv4: "54.228.75.154",
                ipv6: null
            }
        },
        {
            type: 1, // single host DNS
            params: {
                portNumber: null, // could be the port number as well
                dnsName: "aaaa.bbbb.com"
            }
        },
        {
            type: 2, // multpiple hosts DNS
            params: {
                dnsName: "testttt.com"
            }
        }
    ]
    metadata: {
        metadataUrl: "https://www.testurllll.com/sampleUrl.json",
        metadataHashHex: "cdb714fd722c24aeb10c93dbb0ff03bd4783441cd5ba2a8b6f373390520535bb"
    }
  }
}
```

### Stake pool registration (as an owner) limitations

Ledger supports signing of stake pool registration certificates only when providing pool owner signatures. In the general case, the transaction may contain external inputs (e.g. belonging to the pool operator) and Ledger is not able verify whether they are actually external or not, so if we allowed signing the transaction with a spending key, there is the risk of losing funds from an input that the user did not intend to spend from. Moreover there is the risk of inadvertedly signing a withdrawal in the transaction if there's any. To mitigate those risks, Ledger has special validation rules for stake pool registration transactions. The validation rules are the following:

1. The transaction must not contain any other certificates, not even another stake pool registration
2. The transaction must not contain any withdrawals
3. The transaction inputs must all be external, i.e. path must be either undefined or null
4. Exactly one owner should be passed as a staking path and the rest of owners should be passed as bech32-encoded reward addresses