# Composition

For our discussion of this topic, we'll call the model-actions-views triplet a
*module*. Although the usual pattern is to have modules that are saved in a
physical JavaScript module, they don't need to be colocated in a single file.
The module we talk about is simply a concept of having related models, actions,
and views.

First of all, you must keep in mind that the concepts described in this guide
are simply a starting point for further exploration. You will need to modify the
pattern slightly (or dramatically) to suit your particular use case.

## Basic concepts

In Duckweed applications, models, actions, and views, are composed separately.
We loosely group related models, update functions, and views in modules, and we
treat modules as a unit of reusable interface. You should not think in terms of
components in the strict sense of the word, though. Duckweed apps are
constructed a bit differently, as you will see in the examples that follow.

We also said that modules contain models, update functions, and views, but that
is also just a generalization. In reality, a module may contain only views, or
only views and models, or some other combination of the three ingredients.

A common theme in the composition pattern discussed here is that children
generally don't know anything about the parent. All modules should be designed
as if they would be used as the root module. The flip side is that the parent
modules will have full and absolute control over children, including the ability
to swap out their models and deny execution of their actions. (If this sounds
scary, you probably did not have a happy childhood.) Another way to look at it
is that the parents are responsible for their children and their well-being.
(There, trauma cured!)

As noted previously, this pattern is simply a recommendation, and not something
imposed by the Duckweed API. You are free to explore and come up with new
patterns!

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
  <input type="number" on-input={act('update')} />
);

const rootView = ({model, act}) => {
  <div>
    <h1>Awesome calculator</h1>

    <inputView model={model.inputs[0]} act={act.bind(null, 'updateInput', 0)} />
    +
    <inputView model={model.inputs[1]} act={act.bind(null, 'updateInput', 1)} />
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
inputs. The input view also accepts the `model` and `act` props, and the
responsibility of passing them is root's. We have two inputs, and each is given
its own piece of the root's model. The `act.as()` call is used to pass a
modified version of `act` that is specific to the inputs.

The `act.bind()` bit requires further explanation. Suppose that input wants to
send a message `update`. It is given an `act` object that was created by
`act.bind(null, 'updateInput', 1, 'update')`. When the input sends the `update`
message, the modified `act` will translate that to `'updateInput', 1, 'update'`,
where the address is no longer `'update'`, but `'updateInput'`. Instead of
directly invoking the `update` action for the input, Duckweed will, instead,
invoke the `updateInput` action for the root, and the action will receive `1,
'update'` as its arguments. The root's action will then decide what to do with
those. This way, root view claimed full ownership over any actions that its
children may emit.

## Actions composition

Actions (well, the update functions that perform them) can be composed in many
different ways. Update functions are just functions after all, so there is no
limit to how crazy you can go with them.

We won't go too crazy here, though. Here we will take a look at the most basic
example, and leave more complex solutions to StackOverflow and similar places.

We have already seen bound `act()` which prefixes the children's messages with
the parent's address. Now let's see how that works:

```javascript
const scoped = require('duckweed/scoped');

const inputUpdate = (model, address, ...args) => {
  switch (address) {
    case 'update':
      const [e] = args;
      return {...model, value: parseInt(e.target.value, 10)};
    default:
      return model;
  };
};

const rootUpdate = (model, address, ...args) => {
  switch (address) {
    case 'updateInput':
      const [inputId, ...inputMessage] = args;
      const updated = scoped.transform(
        ['inputs', inputId],
        inputModel => inputUpdate(inputModel, ...inputMessage)
        model
      )
      return {...updated, sum: updated.inputs.reduce((x, y) => x + y, 0)}
    default:
      return model;
  }
};
```

Let's break it down.

Take a look at the arguments. As we discussed in the section about view
composition, we are capturing all messages from the input views and handling
them in the root's `updateInput` branch. `inputId` was passed to `act.bind()`
along with the `'updateInput'` address. The parts of the `args` after the
`inputId` belongs to the input module itself, so we pass those down to
`inputUpdate()` along with the piece of the model that belongs to the input we
are working with.

The `scoped.transform()` function is used to allow the input to operate on the
portion of the model that belongs to the input. The scope is defined as
`['inputs', inputId]`, and the second argument is a function that transforms
this part of the model. We use `inputUpdate()` here to perform the
transformation. You may have seen this pattern in libraries like Ramda, where it
is called 'lenses'.

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
