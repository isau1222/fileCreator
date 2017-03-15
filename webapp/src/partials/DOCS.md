# Partials

Partials are components that encapsulate some meaningful part of the app (e.g. header, footer, form).
Generaly, they get data from props and global store, and can dispatch store actions.
A partial usually consists of widgets and other partials.

Partials can NOT use in-component route navigation guards.

Partials are registered automatically under their filenames (folders are not supported yet).
