# sails-vue

a [Sails](http://sailsjs.org) application

---

## Environmental variables

### COMPILE_ASSETS

Will set the compilation strategy for assets. Accepted values are:
- `skip` will not run the compilation
- `once` will run the compilation once upon start

Default value is `once`.

This is useful for when you are developing the backend, and want the server to restart faster.

Example: `cross-env COMPILE_ASSETS=skip node app`.

### COMPILE_WEBAPP

Will set the compilation strategy for webapp. Accepted values are:
- `skip` will not run the compilation
- `once` will run the compilation once upon start
- `watch` will run the compilation whenever the source files change

Default value is `watch`.

This is useful for when you are developing the backend, and want the server to restart faster.

Example: `cross-env COMPILE_WEBAPP=skip node app`.
