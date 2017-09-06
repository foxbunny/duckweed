# `duckweed.events`

The duckweed events object exposes a few function that help us with handling and
transforming event objects.

## `duckweed.events.from()`

```javascript
(processor, eventHandler) => EventHandler
```

This is a helper function that composes the event processor and an event handler
(such as the one returned from the [`act()`](../act.md) function). Processors
will transform the event objects in various ways and the result will be added to
the argument list of the event handler.

The processor is a simple function that takes an event object and returns an
array of arguments. For example:

```javascript
const mouseEvent = (event) => [event.clientX, event.clentY];
```

The above example will transform the event object into two arguments which
represent the x and y coordinates of the mouse event. When used with an event
handler, it may look like this:

```javascript
const E = duckweed.events;

html("div", {on: {
  click: E.from(mouseEvent, (x, y) => alert(`You clicked at ${x}, ${y}`))
}});
```

By convention, we name the processor after the names of the events they handle.

## `duckweed.events.inputEvent()`

This processor will convert the event object into an input value.

## `duckweed.events.checkboxEvent()`

This processor will convert a change event on a checkbox into two arguments,
value of the `checked` property, and the input value.

## `duckweed.events.auto()`

This is an autopilot processor that includes all of the above and determines
which processor to run depending on the event and element type.

[Documentation index](../main.md) | [API reference index](./main.md)
