## `duckweed.scoped`

Helper functions for manipulating nested objects and arrays.

### `duckweed.scoped.get()`

```javascript
(scope, object) => object
```

The `scoped.get()` function takes a scope, which is a mixed array of strings
and/or numbers, and an object, and retrieves the value at that scope.

For example:

```javascript
const o = {foo: {bar: [1, 2, 3]}};
scoped.get(['foo', 'bar', 2]);
// => 3
```

It returns undefined if there is nothing at the specified scope, regardless of
the nesting depth.

```javascript
const o = {foo: {bar: [1, 2, 3]}};
scoped.get(['foo', 'baz', 'foo'], o);
// => undefined
```

### `duckweed.scoped.set()`

```javascript
(scope, value, object) => object
```

This is the `scoped.get()`'s counterpart that sets the value at the given scope.
It takes the scope as a mixed array of strings and/or numbers, a value, and the
object.

Despite its name, `scoped.set()` does not set the value in-place, but returns a
modified copy of the object instead.

For example:

```javascript
const o = {foo: {bar: [1, 2, 3]}};
scoped.set(['foo', 'bar', 2], 10, o);
// => {foo: {bar: [1, 2, 10]}}
```

This function will recreate the necessary path in order to set the value.
Creating the path only works with objects, though.

```javascript
const o = {foo: {bar: 12}};
scoped.set(['foo', 'baz', 2], 12, o);
// => {foo: {bar: 12, baz: {2: 12}}}
```

Copying is done to the scope. That it to say that it will create shallow copies
of the objects and arrays that are not under the scope.

### `duckweed.scoped.transform()`

```javascript
(scope, fn, object) => object
```

The `scoped.transform()` function is a combination of `scoped.get()` and
`scoped.set()` such that the output of `scoped.get()` is passed through the
specified function before being passed to `scoped.set()`.

For example:

```javascript
const incBy2 = x => x + 2;
const o = {foo: {bar: [1, 2, 3]}};
scope.transform(['foo', 'bar', 0], incBy2, o);
// => {foo: {bar: [3, 2, 3]}}
```

This function has a small optimization that checks if the transformation
function returned a value identical to the one it was given, in which case it
returns the object as is. This allows us to use it to process the model object
in update function without causing unnecessary re-renders:

```javascript
const id = x => x;
const o = {foo: {bar: [1, 2, 3]}};
const r = scope.transform(['foo', 'bar'], id, o);s
r === o
// => true
```

[Documentation index](../main.md) | [API reference index](./main.md)
