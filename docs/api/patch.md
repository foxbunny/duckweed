# `patch()`

```javascript
(patchFunction) => undefined
```

The `patch()` function is the first argument in message handlers (actions). It's
is also known as a *module patcher*.

This function takes a single function, a *patch function*, as its argument and
has no useful return value. Patch functions take a model, and are expected to
return a modified **copy** of the model.

```javascript
const actions = {
  increment: (patch) => {
    patch((model) => ({...model, count: model.count + 1}));
  },
};
```

Note that the return value from the patch functions must be a copy. Mutating the
model will not work, and may result in subtle bugs or complete failure. For
example, this is an antipattern:

```javascript
const actions = {
  increment: (patch) => {
    patch((model) => {
      model.count += 1;
    });
  },
};
```

The above implementation does not return the model after it's been modified.
This effectively replaces the model with `undefined` and breaks the app in all
kinds of horrible ways.

## Scoped module patcher

Just like the [`act()`](./act.md) function, patch can be scoped using the `as()`
method. It has the following signature:

```javascript
(scope, [callback]) => function
```

The `patch.as()` method takes a scope array as its first argument, and
an optional callback as the second, and returns a scoped module patcher which
operates on the part of the model pointed to by the scope.

The scope array can be a mix of strings and numbers, where strings are object
keys and numbers represent array indices.

See the [Composition](../guide/composition.md) guide for information on how to
use scoped patchers.

[Documentation index](../main.md) | [API reference index](./main.md)
