# A small but complete example with JSX

This is a small example that covers the keys aspects of creating Duckweed
applications.

```jsx
/** @jsx duckweed.html */

const duckweed = require("duckweed");

const model = {
  name: "Duckweed",
};

const actions = {
  updateName(patch, e) {
    patch((model) => ({
      ...model,
      name: e.target.value,
    }));
  }
}

const view = ({model, act}) => (
  <div>
    <h1>Hello {model.name || "World"}!</h1>
    <input type="text" value={model.name} on-input={act("updateName")} />
  </div>
);

duckweed.runner(model, actions, view);
```

The `model` object is the initial state. It doesn't really matter how you
generate it as long as the runner receives an object in the end. In this case,
we've chosen to use a POJO, but it could be a sync function, or an async
function if you need to fetch some data from the server.

The `actions` object is a mapping between key (a.k.a., addresses) and actions.
Actions receive a model patcher, which is used to patch the model state. In case
of actions that are invoked as event callbacks, the event object is passed as
the last argument.

Patch callback should always return a **copy** of the model, not mutate it
directly.

The `view` function receives `model` and `act` props. The `model` is the current
state of the model. The `act` is a function that lets us construct messages that
will be handled by actions.

For JSX, we use `duckweed.html()` which is a wrapper around Snabbdom's `h()`
with some powerups to make it JSX-compatible and make our JSX look a bit more
natural. (You can also use
[Snabbdom-pragma](https://github.com/Swizz/snabbdom-pragma), and Duckweed won't
mind at all.)

[Documentation index](../main.md) | [Next topic](./mav-intro.md)
