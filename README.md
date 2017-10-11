![Duckweed logo](./docs/media/duckweed-logo.svg)

**Duckweed: JavaScript microframework for programming reactive interfaces using
Model-Action-View architecture**

![Travis build status](https://travis-ci.org/foxbunny/duckweed.svg?branch=master)
![Coverage status](https://codecov.io/gh/foxbunny/duckweed/branch/master/graph/badge.svg)

Duckweed is inspired by [Elm](http://elm-lang.org/) and [Simon Friis
Vindum's](https://github.com/paldepind) [Functional Frontend
Architecture](https://github.com/paldepind/functional-frontend-architecture).
Unlike its sources of inspiration, though, Duckweed's parimary goal is not to
promote or enforce functional programming paradigm. It's main goal is to provide
a simple API, and functions happen to be a good step in that direction.

Duckweed is written in [TypeScript](https://www.typescriptlang.org), and uses
[Snabbdom](https://github.com/snabbdom/snabbdom) under the hood.

Although Duckweed is small (only 7KB min+gz), it includes state managent,
transitions, routing events, and the full power of Snabbdom.

# Installation

To install Duckweed, use:

```
npm install duckweed
```

Currently, only beta releases are available.

# Take it for a spin

This [fiddle](https://jsfiddle.net/foxbunny/e0pjybw7/) contains a small counter
example that you can fork and play with.

# Demo app

A more fully featured proof-of-concept application can be found [on
GitHub](https://github.com/foxbunny/duckweed-tasks). You can see it in action
[here](https://foxbunny.github.io/duckweed-tasks/).

# Documentation

Documentation can be read [on
GitHub](https://github.com/foxbunny/duckweed/tree/master/docs/main.md). It
includes a developer guide and the API reference.

# I want class-based components!

Here you go:

```jsx
class HelloDuckweed {
  constructor(initialState = {}) {
    this.state = initialState;
    this.update = this.update.bind(this);
    this.render = this.render.bind(this);
  }

  update(_, address, ...args) {
    return this[address](...args);
  }

  updateName(e) {
    this.state.name = e.target.value;
  }

  render({act}) {
    return (
      <div>
        <h1>Hello {this.state.name || "World"}!</h1>
        <input type="text" value={this.state.name} on-input={act("updateName")} />
      </div>
    );
  }
};

const comp = new HelloDuckweed();

duckweed.runner(undefined, comp.update, comp.render);
```

No, sorry, it was just a joke. I'm pretty sure it would work, but, to be honest,
I designed Duckweed specifically to avoid using this pattern.

# What's with the name?

[Duckweed](https://en.wikipedia.org/wiki/Lemnoideae) is a water plant with
simple no-frills features, and one of the fastest growing plants on Earth. It
has been argued that a single duckweed could create a mass of duckweeds the size
of the Earth in a single month. It is also an invaluable water purifier, and
being studied as a potential source of clean energy. What I'm trying to say is,
duckweed is pretty awesome.

# Benchmarks

It's... erm... fast enough. :)

# Under construction

Duckweed is still in very very early stages of development. Don't expect it to
be production-ready. The API may also fluctuate between versions. The level of
breakage you can expect is predictable, though.

Duckweed uses semantic versioning, so no major problems should be expected until
the next major version bump. Each time a major version is bumped, though, you
can be certain it's backwards-incompatible with the previous verisons.

# License

Duckweed is licensed under the terms of the MIT license. See the `LICENSE` file
for more information.
