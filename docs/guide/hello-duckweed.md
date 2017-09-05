# Hello Duckweed

This is the simplest possible application you can create with Duckweed:

```javascript
const h = require("snabbdom/h");
const duckweed = require("duckweed");

// Look, ma', one-liner!
duckweed.runner(undefined, {}, () => h("div", "Hello Duckweed!"));
```

The first argument is a model. We don't use a model in this example, so passing
`undefined` is just fine. The second argument is the actions object. We don't
have any actions in this simple example, so we're passing it an empty object.
The third argument is the view function.

As can be seen from the snippet, we can use normal Snabbdom `h()` to construct
our VDOM.

[Documentation index](../main.md) | [Next topic](./mav-example.md)
