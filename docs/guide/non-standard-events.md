# Non-standard events

When using `duckweed.html()` to generate the VDOM, we can take advantage of a
few special and non-standard bindings.

## DOM events that are triggered on or bubble up to the `document`

In some cases you may want to capture events globally. The `doc` events can be
used for that purpose. The `doc` event callbacks will be triggered on specific
events that bubble up to the `document` object regardless of what element they
are defined on.

Here's an example:

```jsx
cosnt view = ({model, act}) => (
  <div class="popup" doc-click={act("close")}>
    You have been logged in!
  </div>
);
```

The `doc-click` prop is used to pass an event handler. Wherever the user clicks,
the `close` message will be transmitted. The action handling the event will
receive the event object as its last argument.

There are a few caveats, though. If an element that's outside the targeted
element prevents the event propagation, this mechanism will fail, so be mindful
of that.

When not using `duckweed.html()` factory, these props are specified as `{doc:
{eventName: ...}}`.

## DOM events triggered outside an element

It's a common pattern to want to handle events that happen outside an element.
For example, if we have a menu widget, we want it to close when user clicks
outside it.

Here's an example:

```jsx
cosnt view = ({model, act}) => (
  <nav class={{menu: true, open: model.open}} off-click={act("closeMenu")}>
    <a href="/">Home</a>
    <a href="/list">List</a>
    <a href="/contact">Contact</a>
  </nav>
);
```

The `off-click` prop is used to send a message (or handle an event) when a
`click` event is triggered outside the `<nav>` element. This can be used with
any events, of course, not just click.

The action handling the message will receive the event object as its last
argument.

What happens under the hood is that an event listener is bound to the
`document.body`, and the low-level listener checks if the event target was
inside the element. It will only transmit the message (or trigger an event
listener) that we specified if the event target was outside the element.

There are a few caveats, though. If an element that's outside the targeted
element prevents the event propagation, this mechanism will fail, so be mindful
of that.

When not using `duckweed.html()` factory, these props are specified as `{off:
{eventName: ...}}`.

## Keyboard events

Even though keyboard events can be handled using `on-keyup`, `on-keydown`, and
similar props, a set of special props are provided as a convenience:

- `key-backspace`
- `key-tab`
- `key-enter`
- `key-escape`
- `key-pageup`
- `key-pagedown`
- `key-left`
- `key-up`
- `key-right`
- `key-down`
- `key-delete`

These props are an alias for `on-keyup` event that trigger only for the specific
keys. They are used the same way as `on-keyup` prop.

When not using the `duckweed.html()` factory, these props are specified as
`{key: {keyName: ...}}`.

## Routing events

Duckweed does not come with a proper router, but it has a prop that can be used
for building one quickly.

Let's take a look at an example:

```jsx
const view = ({model, act}) => (
  <div route={act("changeRoute")}>
    <model.view model={model.routeModel} act={act.as("routeAction")} />
  </div>
);
```

In the above view, we use the `route` prop to transmit an event on `popstate`
event. Try to imagine that the `changeRoute` action will match the current path
against a mapping between paths and views, and select a new view that should be
rendered, and store it on the `model.view` property, and it will also create a
model for the view and set it as `model.routeModel`.

This is the pattern used [in the demo
app](https://github.com/foxbunny/duckweed-tasks/blob/master/src/routing/route-view.tsx).

The `route` prop can be set on any element, and it will always trigger on all
`popstate` events. The action handling the `route` event cannot prevent it, and
it will receive a path data object as its last argument.

The path data object has the following structure:

```javascript
{
  type: "popstate";  // always "popstate" so it's uniform with `Event` objects
  pathname: String;  // the value of `location.pathname` when event was triggered
  hash: String;  // the value of `location.hash` when event was triggered
  query: String;  // the value of `location.search` when event was triggered
  params: {param: string};  // the parsed `location.search` as an object
}
```

[Documentation index](../main.md) | [Next topic](./middleware.md)

