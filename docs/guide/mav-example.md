# A small but complete example with JSX

This is a small example that covers the keys aspects of creating Duckweed
applications.

```jsx
/** @jsx duckweed.html */

const duckweed = require('duckweed');

const model = {
  name: 'Duckweed',
};

const update = (model, address, ...args) => {
  switch (address) {
    case 'update':
      const [e] = args;
      return {...model, name: e.target.value});
    case 'reset':
      return {...model, name: 'Duckweed'}
    default:
      return model;
  };
};

const view = ({model, act}) => (
  <div>
    <h1>Hello {model.name || "World"}!</h1>
    <input type="text" value={model.name} on-input={act('update')} />
    <button on-click={act('reset')}>Reset</button>
  </div>
);

duckweed.runner(model, actions, view);
```

The `model` object is the initial state. It doesn't really matter how you
generate it as long as the runner receives an object in the end. In this case,
we've chosen to use a POJO, but it could be a sync function, or an async
function if you need to fetch some data from the server.

The `update` function is your application's dispatch center. It takes a model,
and a message, which consists of the address, and optional payload (we call it
'args' in our example), and chooses the correct action based on the address. It
may or may not update the model in the process. Note that we must always return
a *copy* of the model, not modify it in-place.

Any time a modified *copy* of the model is returned, the view is re-rendered.
Returning the model unchanged from the `update` function will suppress
re-renders. This gives us a way of telling Duckweed, "Hey, I was just joking, I
don't want to do anything."

The payload that gets sent in the message depends on the sender. For example, if
we send a message for a DOM event, we may receive `Event` and Snabbdom's `VNode`
objects as the payload. User-specified payload can also be passed by supplying
additional arguments to `act()`. For example: `act('goToIndex', 1)`.

In our example, all unaddressed messages go to the `default` branch which
returns the model unchanged. We can use this to troubleshoot our application by,
say, throwing an exception when not in production mode.

Although not shown in this example, actions can also send messages. This is
discussed in more depth in other parts of the documentation.

The `view` function receives an object with `model` and `act` properties. The
`model` is the current state of the model. The `act` is a function that lets us
construct messages that will be handled by actions.

For JSX, we use `duckweed.html()` which is a wrapper around Snabbdom's `h()`
with some power-ups to make it JSX-compatible and make our JSX look a bit more
natural. (You can also use
[Snabbdom-pragma](https://github.com/Swizz/snabbdom-pragma), and Duckweed won't
mind at all.)

[Documentation index](../main.md) | [Next topic](./mav-intro.md)
