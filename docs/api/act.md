# `act()`

```javascript
(address, [...messageData]) => EventHandler
```

The `act()` function is passed to the root view function as an `act` prop. It
takes an action address as the first argument, and 0 or more additional
arguments which are called message data. It returns an event handler which can
be used in event and hook props.

```javascript
const view = ({act}) => (
  html("div", {}, [
    html("button", {"on-click": act("go", "left")}, "<-"),
    html("button", {"on-click": act("go", "right")}, "->"),
  ])
);
```

## Scoped act

To create 'scoped' `act()` function, you can simply partially apply it using the
`bind()` function. For example:

```javascript
const view = ({act}) => (
  html("div", {}, [
    html("button", {"on-click": act("go", "left")}, "<-"),
    html("button", {"on-click": act("go", "right")}, "->"),
    someViewFunc({act: act.bind(null, 'foo')}),
  ])
);
```

[Documentation index](../main.md) | [API reference index](./main.md)
