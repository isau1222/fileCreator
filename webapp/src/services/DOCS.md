# Services

Services are collections of data and functions, accessible from anywhere in your app.

Services are registered automatically by merging then into global `App` object.

## Examples

The following service will make `App.config` available.

```
module.exports.config = {
  // contents of `config`
};
```

The following service will make `App.config` and `App.consts` available:

```
module.exports = {
  config: {
    // contents of `config`
  },
  consts: {
    // contents of `consts`
  },
};
