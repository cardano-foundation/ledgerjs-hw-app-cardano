# Helper functions

Here are functions to make passing of parameters to ledgerjs functions easier

## `str_to_path`


### Params

* `path` - *required* `string` BIP44 derivation path given as string, e.g. `1852'/1815'/0'/2/0`

### Responses

#### Success

returns the derivation path as an array of numbers, e.g. for `1852'/1815'/0'/2/0` it would be:

```javascript
[ 2147485500, 2147485463, 2147483648, 2, 0 ]
```

ES6
```javascript
import { utils } from '@cardano-foundation/ledgerjs-hw-app-cardano';

const result = await utils.str_to_path("1852'/1815'/0'/2/0");
```