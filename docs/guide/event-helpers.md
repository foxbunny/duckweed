# Handling events

In this guide, we've used the event object directly in our actions. This is
generally not a very good idea. It makes the code harder to test because we
would need to create or mock event objects. Duckweed comes with helper functions
that can make things a bit easier.

Let's go back to our second example and use the helpers:

```jsx
/** @jsx duckweed.html */

const duckweed = require("duckweed");
const E = require("duckweed/events");

// ...

const actions = {
  updateName(patch, newName) {  // <-- takes a string
    patch((model) => ({...model, name: newName}));
  }
}

const view = ({model, act}) => (
  <div>
    <h1>Hello {model.name || "World"}!</h1>
    <input type="text" value={model.name}
      on-input={E.from(E.inputEvent, act("updateName"))} />
  </div>
);
```

In the `on-input` prop, we are using the `E.from()` function to wrap our `act()`
call. The first argument is the argument processor function, which takes any
arguments and must return an array of arguments that will be passed to our
action. The `E.inputEvent` function handles events triggered on elements that
have a `value` property, and passes only the value to the action.

There is also an `E.checkboxEvent` which will pass the `checked` property and
the checkbox's value, and an `E.auto` function which detects and handles
different kinds of event based on the event type and the element it is triggered
on.

There are currently not a whole lot of processors, and the automatic processor
is not particularly smart or powerful, but this will improve in future.

[Documentation index](../main.md) | [Next topic](./non-standard-events.md)
