# Pages

Pages are components that handle routes. Generally, they have very minimal markup,
and they fetch and provide data to partials and widgets.

Pages can use in-component route navigation guards.

Pages are registered automatically following the [Nuxt](https://nuxtjs.org/guide/routing) convention, with a few exceptions:

1. If the page component exposes a field named `route`, the value of this field will be merged into the generated route config.
2. Folders and components that start with `$` are ignored, so that it's possible to define utility components close to where they are used. A recommended practice is the `$parts` folder, where all the assets and utility components can go.

## Caveats

VueRouter treats `:user-id` as `:{user}-id`, not as `:{user-id}`, and the URL matched by this route look like `abc-id`, not like `abc`. So be careful when naming pages, and prefer to use cameCase when naming parameters, e.g. `_userId.vue`.

## TODO

- Support for [named view](https://router.vuejs.org/en/essentials/named-views.html).
