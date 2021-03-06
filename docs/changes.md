# Changelog

- 1.1.0
  - Documentation cleanup
  - Add the ability to specify HTML attributes using `_name` props in `html()`
- 1.0.0
  - Code base cleaned up with a completely new coding style
  - New architecture using synchronous update function and continuation with
    promises, removed `patch()`
  - Removed `act.as()` (we can just do `act.bind(null, ....)`)
  - Exposed utility functions for scoped object patching (a.k.a. lenses) via
    `scoped` module
  - Event processors can now suppress event handling completely by returning
    `undefined`
  - Updated and cleaned up the documentation
- 0.x
  - Initial version
