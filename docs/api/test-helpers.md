# `duckweed/test-helpers`

The `duckweed/test-helpers` module contains functions and objects for testing
Duckweed applications.

## `test-helpers.pause()`

```javascript
([n]) => Promise
```

This function takes a number (in milliseconds) and returns a `Promise` that
resolves once the `setTimeout()` call invokes its callback. This function is
normally used in `async` test functions to either wait for the [next
tick](https://foxbunny.gitbooks.io/assimilate-js/content/async.html), or for a
specific period of time.

For example:

```javascript
it("will pause", async () => {
  // some code
  await pause();
  // this code runs on the next tick
});
```

## `test-helpers.modelSnapshotter`

The `modelSnapshotter` object sports functions and properties for inspecting the
model state changes during testing (in fact, even in production).

### `modelSnapshotter.current`

The current model state.

### `modelSnapshotter.snapshots`

An array of snapshots, each item in `[before, after]` format.

### `modelSnapshotter.middleware()`

A middleware function that should be passed to a runner.

For example:

```javascript
it("should increment on click", () => {
  const root = document.createElement("div");
  duckweed.runner(counter.init(), counter.actions, counter.view, {
    root,
    middleware: [modelSnapshotter.middleware],
  });
  root.querySelector(".increment").dispatchEvent(new Event("click"));
  expect(modelSnapshotter.current.count).toBe(1);
});
```

### `modelSnapshotter.clear()`

Function that clears all snapshots. This is usually called in `beforeEach` and
similar test runner hooks.
