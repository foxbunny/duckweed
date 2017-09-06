# `duckweed.runner()`

```javascript
(model, actions, view, options) => undefined
```

The runner function kick-starts a Duckweed application. It takes the following
arguments.

 param       | type            | description
-------------|-----------------|---------------------------------------
 model       | any type        | The initial application state
 actions     | object          | Mapping from key to message handler
 view        | function        | View function
 options     | object          | Runner options

## Model

Model can be any value or even `undefined` and `null`. Note that this object is
generally not mutated but replaced when actions call a [`patch()`](./patch.md)
function, so it only represents the initial state of the application.

## Actions

The actions object represents a mapping between action address (the first
element in a message), and the message handler. The message handler function has
the following signature:

```javascript
(patch, [...data]) => undefined
```

The message handler function can be either sync or async. Duckweed will not use
its return value and it, therefore, does not care if we use an async function.

The first argument is always the [`patch()`](./patch.md) function which is used
to *patch* the model. This function can be called multiple times within the
message handler, so we can use it to set intermediate states during asyncrhonous
operations.

Here's an example:

```javascript
const actions = {
  getData: async (patch, recordId) => {
    patch((model) => ({
      ...model,
      loading: true,
    }));
    const response = await xhr.get("/data/" + recordId);
    patch((model) => ({
      ...model,
      loading: false,
      data: response.json,
    }));
  },
};
```

When the message handler is handling DOM events or Snabbdom hooks, it may
receive additional arguments (event object, `VNode` objects, etc) if we are
using the [`duckweed.html()`](./html.md) factory to generate our VDOM.

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

interface RunnerOptions {
  root?: string | Element | VNode;
  patch?: VDOMPatchFunction;
  plugins?: Plugin[];
  middleware?: PatchMiddleware[];
}

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

- snabbdom/modules/class
- snabbdom/modules/eventlisteners
- snabbdom/modules/props
- snabbdom/modules/style
- duckweed/modules/documentevents
- duckweed/modules/keyevents
- duckweed/modules/routeevents

See the [Non-standard events](../guide/non-standard-events) guide for more
information on what the Duckweed modules do.

**default:** `duckweed/html#patch`

### `plugins` (array of plugin objects)

Plugin objects have the following structure:

```javascript
{
  actions: object,
  init(act) => undefined
}
```

The `actions` object has the same strucutre as `actions` passed to the runner.
The init function takes a message handler and is invoked once right before the
first render.

See the [Writing plugins](../guide/plugins.md) for more information on how to
write plugins.

**default:** `[]`

### `middleware` (array of middleware functions)

Middleware functions have the following signature:

```javascript
(patchFunction) => (model) => model
```

The middlware functions take a patch function, which receives a model and
returns a patched model, and returns a patch function with modified behavior.

The middleware functions will be piped (first to last) such that when
[`patch()`](./patch.md) is invoked in a message handler, the call goes from the
first middleware to last, then through the actual patch callback, and back up to
the first middleware.

See [Writing middlware](../guide/middlware.md) guide for more information.

**default:** `[]`

[Documentation index](../main.md) | [API reference index](./main.md)
