# `duckweed.html()`

```javascript
(element, props, children) => VNode
```

The html function renders an element or a view function into a Snabbdom `VNode`
object. It's a thin wrapper around Snabbdom's `h()` function so you will find
references to Snabbdom documentation.

**WARNING:** If you pass a custom `patch()` function to the
[runner](./runner.md), the behavior described below may differ, or the function
may no longer work. You should use Snabbdom's `h()` instead in such cases.

The `html()` function accepts the following parameters.

---
| element | string or function | Either a HTML element name or a view function|
| props | object or null | The element attributes, event handler bindings, or view props|
| children | array of vnodes or a string | The nested elements, text nodes, and/or views|
---

## Element

Element can either be a function or a string. If you are not using JSX (or TSX)
you generally do not need to pass view functions to `html()`. You can invoke
them directly. The `html()` function was developed specifically for JSX so it
knows how to work with functions.

Here's an example of rendering a `DIV`:

```javascript
html("div");
```

## Props

Props are key-value pairs that have special meaning. You can use most HTML DOM
properties here, including `id`, `innerHTML`, `value`, and so on. For the most
part, they will work just like in HTML, but you should keep in mind that they
are actually DOM element properties, not HTML attributes.

```javascript
html("input", {value: "test", type: "password"});
```

There are some special props that are treated differently.

The `class` prop is special (note that DOM Elements don't have a `class`
property to begin with), and it manages the `className` property for you. The
behavior of this prop is a bit different from the [underlying Snabbdom
API](https://github.com/snabbdom/snabbdom#the-class-module). You can pass a
single class as a string, an array of class names as strings, or an object which
maps class names to their on/off state. Those of you coming from VueJS will feel
right at home. Let's look at the three options:

```javascript
// Just a string
html("div", {class: "menu"});

// Array of strings
html("div", {class: ["menu", "open"]});

// Object
html("div", {class: {menu: true, open: model.isOpen}});
```

The `on` prop is used to bind event handlers. It should be an object which maps
event names to the respective handlers. It is handled by the Snabbdom's
[eventlisteners
module](https://github.com/snabbdom/snabbdom#eventlisteners-module).

For convenience, `html()` also understands `on`-prefixed props, like `on-input`
or `on-click`, for convenience when using JSX:

```jsx
<div on-click={act("toggle")} />
```

The `hook` prop can be used to tap into different [Snabbdom
hooks](https://github.com/snabbdom/snabbdom#hooks). In general, you don't want
to abuse hooks too much. For example, patching the model inside an `update` hook
will cause an infinite loop. The Duckweed API does nothing to stop you from
shooting yourself in the foot when it comes to hooks.

The `style` prop can be used to specify element-specific styles and transitions.
It uses the Snabbdom's [style
module](https://github.com/snabbdom/snabbdom#the-style-module) under the hood.

You may also want to refer to [Non-standard
events](../guide/non-standard-events.md) guide for a few more of the props you
can use.

## Children

Children can either be a single string, or a mixed array of `VNode` objects,
`null`, and strings. They are rendered inside the element.

```javascript
html("div", {}, [
  html("span", "I'm a child"),
]);
```

When the element is a function, children are passed to it as a special `__inner`
prop. It is up to the function where it inserts them, if at all.

```jsx
const Aview = ({__inner}) => (
  <div class="parent">
    {__inner}
  </div>
);

const Bview = () => (
  <Aview>
    <span class="child">I'm a child</span>
  </Aview>
)
```

The `__inner` prop has a `__vnodes` property which contains an array of child
`VNode`, null, and/or string elements. This property is not generally meant to
be tinkered with, but you are free to do so if you know what you are doing.

[Documentation index](../main.md) | [API reference index](./main.md)
