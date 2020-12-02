## Cardano: show address

Show requested address derived by given BIP32-Ed25519 path on the device so the user can verify it. The API is the same as the [deriveAddress()](getAddress.md)

ES6
```javascript
const result = await ledger.showAddress(addressType, networkIdOrProtocolMagic, spendingPath, stakingPath?, stakingKeyHashHex?, stakingBlockchainPointer?);
```

### Params

see [deriveAddress()](getAddress.md)

### Responses

#### Success
    returns `undefined`

