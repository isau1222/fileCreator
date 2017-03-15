# Widgets

Widgets are self-sustained components that do not depend on particualr app (e.g. inputs, buttons).
A widget does not own it's data, but instead it gets data from parent via props.
A widget does not change the data, but instead it emits events to the parent.

Widgets can NOT use in-component route navigation guards.

Widgets are registered automatically under their filenames (folders are not supported yet).
