![Duckweed logo](./media/duckweed-logo.svg)

**Duckweed: JavaScript microframework for programming reactive interfaces using
Model-Action-View architecture**

![Travis build status](https://travis-ci.org/foxbunny/duckweed.svg?branch=master)
![Coverage status](https://codecov.io/gh/foxbunny/duckweed/branch/master/graph/badge.svg)

Duckweed is inspired by [Elm](http://elm-lang.org/) and [Simon Friis
Vindum's](https://github.com/paldepind) [Functional Frontend
Architecture](https://github.com/paldepind/functional-frontend-architecture).
Unlike its sources of inspiration, though, Duckweed's parimary goal is not to
promote or enforce functional programming paradigm. It's main goal is to provide
a simple API, and functions happen to be a good step in that direction.

Duckweed is written in [TypeScript](https://www.typescriptlang.org), and uses
[Snabbdom](https://github.com/snabbdom/snabbdom) under the hood.

Although Duckweed is small (only 7KB min+gz), it includes state managent,
transitions, routing events, and the full power of Snabbdom.

- [Installation](#installation)
- [Take it for a spin](#take-it-for-a-spin)
- [Hello Duckweed!](#hello-duckweed)
- [A bit more contrived example](#a-bit-more-convoluted-example)
- [Model-action-view in a nutshell](#model-action-view-in-a-nutshell)
- [Composition](#composition)
- [Handling events](#handling-events)
- [I want class-based components](#i-want-class-based-components)
- [What's with the name?](#whats-with-the-name)

# Installation

To install Duckweed, use:

```
npm install duckweed@beta
```

Currently, only beta releases are available.

# Take it for a spin

This [fiddle](https://jsfiddle.net/foxbunny/e0pjybw7/) contains a small counter
example that you can fork and play with.

# Hello Duckweed!

This is the simplest possible application you can create with Duckweed:

```javascript
const h = require("snabbdom/h");
const duckweed = require("duckweed");

// Look, ma', one-liner!
duckweed.runner(undefined, {}, () => h("div", "Hello Duckweed!"));
```

As can be seen from the snippet, we can use normal Snabbdom `h()` to construct
our VDOM.

# A bit more contrived example

To demonstrate slightly more features, here's another example, complete with JSX:

```jsx
/** @jsx duckweed.html */

const duckweed = require("duckweed");

// The `model` object is the initial state. It doesn't really matter how you
// generate it as long as the runner receives an object in the end. In this case,
// we've chosen to use a POJO, but it could be a sync function, or an async
// function if you need to fetch some data from the server.
const model = {
  name: "Duckweed",
};

// The `actions` object is a mapping between messages (keys) and actions. Actions
// receive a model patcher, which is used to patch the model state. In case of
// actions that are invoked as event callbacks, the event object is passed as
// the last argument.
const actions = {
  updateName(patch, e) {
    // Patch callback should always return a **copy** of the model, not mutate
    // it directly.
    patch((model) => ({
      ...model,
      name: e.target.value,
    }));
  }
}

// The `view` function receives `model` and `act` props. The `model` is the current
// state of the model. The `act` is a function that lets us construct messages that
// will be handled by actions.
const view = ({model, act}) => (
  <div>
    <h1>Hello {model.name || "World"}!</h1>
    <input type="text" value={model.name} on-input={act("updateName")} />
  </div>
);

// Mix it all well, and start the show!
duckweed.runner(model, actions, view);
```

For JSX, we use `duckweed.html()` which is a wrapper around Snabbdom's `h()`
with some powerups to make it JSX-compatible and make our JSX look a bit more
natural. (You can also use
[Snabbdom-pragma](https://github.com/Swizz/snabbdom-pragma), and Duckweed won't
mind at all.)

# Model-action-view in a nutshell

As in most web UI architectures, the Duckweed architecture allows us to model a
cycle between a rendered view, through events, to state updates.

![Model-action-view diagram](./media/mav-diagram.svg)

The cycle is started by the runner based on the initial application state, **the
model**.

A **view** is a function that translates the application state to VNODE. Its
input is the model, and its output is a VNODE object, which specifies how the
interface should be rendered, and also how events should be translated into
messages.

Once a view is rendered, it will react to user input, and various other events
(hooks, navigation, etc). Whenever an event happens, a **message** is
transmitted. The message consists of an address (action name), and arbitrary
data.

When a matching **action** is found, it receives the message's data, and it can
act on it. Typically, an action modifies the application state by patching the
model.

In Duckweed, model patching is done by returning a modified copy of the model
which is to replace the existing state.

Once the state is modified, the cycle repeats.

# Composition

For our discussion of this topic, we'll call the model-actions-views triplet a
*module*. Although the usual pattern is to have modules that are saved in a
physical JavaScript module, they don't need to be colocated in a single file.
The module we talk about is simply a concept of having related models, actions,
and views.

In Duckweed applications, models, actions, and views, are composed separately.
We group related models, actions, and views in modules, and we treat modules as
a unit of reusable interface--like components in component-based architectures.

A common theme in the composition pattern discussed here is that children
generally don't know anything about the parent. All modules should be designed
as if they would be used as the root module. The flip side is that the parent
modules will have full and absolute component over children, including the
ability to swap out their models and deny execution of their actions. (If this
sounds scary, you probably did not have a happy childhood.) Another way to look
at it is that the parents are responsible for their children and their
well-being. (There, trauma cured!)

This pattern is simply a recommendation, however, and not something imposed by
the Duckweed API. You are free to explore and come up with new patterns!

## Model composition

Models can be composed like so:

```javascript
const inputModel = () => ({
  value: 0,
});

const rootModel = {
  sum: 0,
  inputs: [
    inputModel(),
    inputModel(),
  ]
};
```

Note that we've used a function for the `inputModel`, and a POJO for the
`rootModel`. This is because `rootModel` doesn't need to do anything dynamic,
but for `inputModel` we want to generate a fresh object for multiple inputs.

Even though we have defined two separate models, Duckweed will only care about
the root model, and will treat everything as a single big object. This is
important to keep in mind once we start working with actions.

## View composition

We'll come back to actions a bit later. First let's take a look at how to
compose views.

```jsx
const inputView = ({model, act}) => (
  <input type="number" on-input={act("update")} />
);

const rootView = ({model, act}) => {
  <div>
    <h1>Awesome calculator</h1>

    <inputView model={model.inputs[0]} act={act.as("updateInput", 0)} />
    +
    <inputView model={model.inputs[1]} act={act.as("updateInput", 1)} />
    =
    {model.sum}
  </div>
};
```

The root view takes two props, the `model` and `act`. The `model` prop is the
current state of the model. The `act` object is a function used to dispatch
messages. From the code snippet, we don't really know what action the root view
may support, and that's kind of the point. View is thusly decoupled from the
actions.

The root view uses the input view as one of the elements in order to render the
inputs. The input view also acceps the `model` and `act` props, and the
responsibility of passing them is root's. We have two inputs, and each is given
its own piece of the root's model. The `act.as()` call is used to pass a
modified version of `act` that is specific to the inputs.

The `act.as()` bit requires further explanation. Suppose that input wants to
send a message `update`. It is given an `act` object that was created by
`act.as("updateInput", 1)`. When the input sends the `update` message, the
modified `act` will translate that to `"updateInput", 1, "update"`. The first
element in the message is the message's address, which belongs to the root.
Instead of directly invoking the `update` action for the input, Duckweed will,
instead, invoke the `updateInput` action for the root, and the action will
receive `1, "update"` as its arguments. The root's action will then decide what
to do with those.

## Actions composition

The actions composition can a bit more tricky. They are composed by delegation
and scoped patchers.

Now let's see that in action (pun intentional):

```javascript
const inputActions = {
  update(patch, e) {
    patch((model) => ({
      ...model,
      value: parseInt(e.target.value, 10),
    }));
  },
};

const rootActions = {
  updateInput(patch, inputId, inputAction, e) {
    const scoped = patch.as(["inputs", inputId], (model) => ({
      ...model,
      sum: updated.inputs.reduce((x, y) => x + y, 0),
    });
    // Delegate to input actions
    inputActions[inputAction](scoped, e);
  },
};
```

Let's break it down.

Take a look at the arguments. As we discussed in the section about view
composition, we are capturing all messages from the input views and handling
them in the root's `updateInput` action. `inputId` was passed to `act.as()`
along with the `"updateInput"` address, and `inputAction`is the captured message
from the input view. The event object, `e`, comes from the `input` event. This
is automatically captured by `act()` and passed onto our actions.

We begin by creating a `scoped` patcher, which is a patcher that operates on a
particular subtree of the model. The subtree is specified as an array of keys
and/or array indices. In our example, we are going down into the `inputs` key,
which is an array, and then looking up a particular index at `inputId`. The
`scoped` patcher will only patch this particular array element in the model. The
callback function we pass to `patch.as()` will be triggered every time an input
action invokes the patcher, and will receive the model at the caller's scope,
which the caller can further modify.

We pass the scoped patcher and the event object to the correct action
in the input actions (determined by `inputAction` argument).

As a side note, it would be more correct to capture *all* arguments following
the `inputAction` argument using a rest spread. We may later decide to enhance
the input actions to handle hooks, and other types of events that have more than
one argument, or input messages may have their own arguments. For this
particular case, we know that there's just one possible argument, so this code
works.

## Integrating the app

To integrate all of our composition work, we just need to pass the root stuff
into the runner.

```javascript
duckweed.runner(rootModel, rootActions, rootView);
```

## It's fractal

Composition in Duckweed is fractal. The pattern you saw for composing root and
input can be applied any levels deep, and each level can behave as though *they*
are the root.

# Handling events

So far, we've used the event object directly in our actions. This is generally
not a very good idea. It makes the code harder to test because we would need to
create or mock event objects. Duckweed comes with helper functions that can make
things a bit easier.

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

# I want class-based components!

Here you go:

```jsx
class HelloDuckweed {
  constructor(initialState = {}) {
    this.state = initialState;
    this.updateName = this.updateName.bind(this);
    this.render = this.render.bind(this);
  }

  updateName(patch, e) {
    this.state.name = e.target.value;
    patch(() => {});
  }

  render({act}) {
    return (
      <div>
        <h1>Hello {this.state.name || "World"}!</h1>
        <input type="text" value={this.state.name} on-input={act("updateName")} />
      </div>
    );
  }
};

const comp = new HelloDuckweed();

duckweed.runner(undefined, comp, comp.render);
```

No, sorry, it was just a joke. I'm pretty sure it would work, but I don't even
want to imagine what horrible composition nightmare this would introduce. Use
React, Angular, or Vue if you want that.

# What's with the name?

[Duckweed](https://en.wikipedia.org/wiki/Lemnoideae) is a water plant with
simple no-frills features, and one of the fastest growing plants on Earth. It
has been argued that a single duckweed could create a mass of duckweeds the size
of the Earth in a single month. It is also an invaluable water purifier, and
being studied as a potential source of clean energy. What I'm trying to say is,
duckweed is pretty awesome.

# Demo app

A proof-of-concept application can be found [on
GitHub](https://github.com/foxbunny/duckweed-tasks). You can see it in action
[here](https://foxbunny.github.io/duckweed-tasks/).

# Benchmarks

It's... erm... fast enough. :)

# Under construction

Duckweed is still in very very early stages of development. Don't expect it to
be production-ready.

# License

Duckweed is licensed under the terms of the MIT license. See the `LICENSE` file
for more information.
