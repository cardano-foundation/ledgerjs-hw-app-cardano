# Get Ledger app version

Returns Ledger Cardano app version and additional flags (for internal purposes)

ES6
```javascript
const result = await ledger.getVersion();
```

## Responses

### Success

The response contains the individual version numbers:

```javascript
{
    major: 2,
    minor: 1,
    patch: 0,
    flags: {
        isDebug: false
    }
}
```

Sample response corresponds to Ledger Cardano app version `2.1.0`
