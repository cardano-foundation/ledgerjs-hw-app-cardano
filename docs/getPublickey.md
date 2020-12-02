## Cardano: get public keys
Retrieve a BIP32-Ed25519 extended public derived by given BIP32-Ed25519 path.

ES6
```javascript
const result = await ledger.getExtendedPublicKey(path)
```

Since Ledger Cardano App version 2.1.0, also the bulk version of the call is supported to be able export one or more public keys with a single prompt on the device:

ES6
```javascript
const result = await ledger.getExtendedPublicKeys(paths)
```


### Params

#### Exporting single path

* `path` — *required* `Array<number>` BIP44 derivation path for the public key, minimum length `3`, maximum length `10`, accepts only Array (ex. `[(1852 | 0x80000000) >>> 0, (1815 | 0x80000000) >>> 0, (0 | 0x80000000) >>> 0]`) format

#### Exporting multiple paths

* `paths` - *required* `Array<Array<number>>`, each `Array<number>` having the same structure as `path` defined above


### Responses

#### Success

One public key

```javascript
{
	publicKeyHex: string, //first half of the extended public key in hexadecimal string notation
	chainCodeHex: string //second half of the extended public key in hexadecimal string notation
}
```

Multiple public keys:

```javascript
[
    { publicKeyHex: string, chainCodeHex: string },
    { publicKeyHex: string, chainCodeHex: string },
    { publicKeyHex: string, chainCodeHex: string },
]

```

#### Error case
```javascript
//Throws HwTransport.TransportStatusError with errorcode and message set by https://github.com/cardano-foundation/ledger-app-cardano/blob/master/src/errors.h
```

### Examples
Get root public key of first cardano byron account:

#### Request
```javascript
ledger.getExtendedPublicKey([(44 | 0x80000000) >>> 0, (1815 | 0x80000000) >>> 0, (0 | 0x80000000) >>> 0]);
```
#### Response
```javascript
{
    chainCodeHex: "68418151f0f892b99d6c4fdda3b6d16a3725afde8357e6709220eaa27b48c014".
    publicKeyHex: "2e781b77c8346761a51192b68770459e364de828e211521bae19fa868a494631"
}

```