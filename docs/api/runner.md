# `duckweed.runner()`

```javascript
(model, update, view, options) => undefined
```

The runner function kick-starts a Duckweed application. It takes the following
arguments.

 param       | type            | description
-------------|-----------------|---------------------------------------
 model       | any type        | The initial application state
 update      | function        | Model update function
 view        | function        | View function
 options     | object          | Runner options

## Model

Model can be any value or even `undefined` and `null`. Note that this object is
generally not mutated but replaced when actions call a [`patch()`](./patch.md)
function, so it only represents the initial state of the application.

## Update

The model update function takes a model and a message and returns either an
updated copy of the, or a two-tuple (an array with two members) containing an
updated copy of a model and a message or a promise that resolves to a message.

```javascript
(model, address, ...args) => model
(model, address, ...args) => [model, message]
(model, address, ...args) => [model, Promise<message>]
```

The message is a series of arguments starting with the address, and followed by
zero or more extra arguments depending on how the message was sent (see the
[`act()` API documentation](../api/act.md`).

For brevity, the sum of all possible return values from the update function is
called 'model-action'.

Here's a few examples:

```javascript
const update = (model, action, ...args) => {
  switch (action) {
    case 'hide':
      return {...model, shown: false};
    case 'show':
      return {...model, shown: true};
    case 'toggle':
      return {...model, shown: !model.shown};
    case 'submit':
      const [name, msg] = args;
      return [
        {...model, loading: true, error: false},
        xhr.send('/comment', {name, msg})  // returns a Promise
          .then((resp) => ['finishSubmit', resp])
          .catch(() => ['failSubmit'])
      ]
    case 'finishSubmit':
      const [comments] = args;
      return {...model, loading: false, comments: comments}
    case 'failSubmit':
      return {...model, loading: false, error: true}
    default:  // no-op
      return model;
  };
};
```

When the update function is handling DOM events or Snabbdom hooks, and we are
using the [`duckweed.html()`](./html.md) factory function, the update function
may receive additional arguments (event object, `VNode` objects, etc).

## View

A view function that is passed to runner will have the following signature:

```javascript
({model, act}) => VNode
```

The props object is passed to the function with two keys, `model` and `act`. The
`model` is the current application state. The [`act()`](./act.md) function is
the action handler (yes, bad name), which can be used to transmit messages.

## Options

The runner takes the following options:

```javascript
type RunnerOptions {
  root?: string | Element | VNode;
  patch?: VDOMPatchFunction;
  plugins?: Plugin[];
  middleware?: PatchMiddleware[];
}
```

### `root` (string, `Element`, or `VNode`)

The root element is the first argument that's usually passed to Snabbdom's
[`patch()`](https://github.com/snabbdom/snabbdom#patch). If you are using the
default `patch` or a `patch` function created by using the Snabbdom API, this
should be a CSS3 selector, an `Element` object, or a Snabbdom `VNode` object.

By passing a `VNode` object, we can continue the rendering from some previous
state created by this or some other app (provided that the DOM state matches the
`VNode` object).

**default:** `"#app"`

### `patch` (function)

The patch option can be used to specify an alternative `patch` function. This is
usually necessary if we want to use a different set of Snabbdom modules, or even
completely modify the Duckweed behavior by using our own patch function. The
details of writing a custom `patch()` implementation is beyond the scope of this
documentation.

The default value comes from the `duckweed/html` module, and uses the following
Snabbdom and Duckweed modules:

- `snabbdom/modules/class`
- `snabbdom/modules/eventlisteners`
- `snabbdom/modules/props`
- `snabbdom/modules/style`
- `duckweed/modules/offevents`
- `duckweed/modules/keyevents`
- `duckweed/modules/docevents`
- `duckweed/modules/routeevents`

See the [Non-standard events](../guide/non-standard-events) guide for more
information on what the Duckweed modules do.

**default:** `duckweed/html#patch`

### `plugins` (array of plugin objects)

Plugin objects have the following structure:

```javascript
{
  update: UpdateFunction,
  init: (act, state) => undefined
}
```

The `update` function is the same as the update function discussed in the Update
section above. The init function takes a message handler and is invoked once
right before the first render.

See the [Writing plugins](../guide/plugins.md) for more information on how to
write plugins.

**default:** `[]`

### `middleware` (array of middleware functions)

Middleware functions have the following signature:

```javascript
updateFunction => UpdateFunction
```

The middleware functions take an update function function, which receives a
model, and a message and returns a model-action. It returns a new update
function that will be used by the runner instead.

The middleware functions are piped so that the first one in the array will be
the first one to directly handle the user-supplied update function.

See [Writing middleware](../guide/middlware.md) guide for more information.

**default:** `[]`

[Documentation index](../main.md) | [API reference index](./main.md)
