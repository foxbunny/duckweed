# Duckweed documentation

Duckweed is a JavaScript microframework for programming reactive interfaces
using Model-Action-View architecture.

Let's define that a bit further:

- *microframework*: It has a tiny API surface (just a few functions), and it is
  also quite small (under 10KB minified and gzipped).
- *reactive interfaces*: It allows the user to write interfaces as a function of
  the application state.
- *Model-Action-View*: more on that in a [separate guide](./mav.md)

This documentation is aimed at Duckweed users. Those of you who wish to hack at
the Duckweed internals will find useful comments in the source code.

## Documentation outline

- [Duckweed developer guide](./guide/main.md)
  - [Hello Duckweed](./guide/hello-duckweed.md)
  - [A small but complete example with JSX](./guide/mav-example.md)
  - [Introduction to Model-Action-View](./guide/mav-intro.md)
  - [Composing modules](./guide/composition.md)
  - [Event helpers](./guide/event-helpers.md)
  - [Non-standard events](./guide/non-standard-events.md)
  - [About (not) using external state](./guide/external-state.md)
  - [Writing middleware functions](./guide/middleware.md)
  - [Writing plugins](./guide/plugins.md)
  - [Testing Duckweed applications](./guide/testing.md)
  - [Performance optimizations](./guide/perf.md)
- [API Reference](./api/main.md)
  - [`duckweed.runner()`](./api/runner.md)
  - [`duckweed.html()`](./api/html.md)
  - [`duckweed.events`](./api/events.md)
  - [`duckweed.scoped`](./api/scoped.md)
  - [`act()`](./api/act.md)
  - [`patch()`](./api/patch.md)
  - [`duckweed/test-helpers`](./api/test-helpers.md)

