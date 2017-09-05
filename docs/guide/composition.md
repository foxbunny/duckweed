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

[Documentation index](../main.md) | [Next topic](./event-helpers.md)
