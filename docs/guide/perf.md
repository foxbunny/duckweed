# Performance optimizations

Duckweed currently supports two ways to optimize performance:

- Preventing re-renders when model hasn't changed
- Preventing unnecessary VDOM diffing by using keys

Additionally, we can wrap our view functions to perform advanced optimizations.

## Preventing re-renders when model hasn't changed

Duckweed will re-generate the entire VDOM tree each time the model changes. When
the VDOM tree is regenerated, it is diffed against a previous version of the
VDOM, and the diff is applied to the actual DOM.

VDOM diffing is generally fast, but it's still a waste of time if your model
hasn't changed at all. If your model has not changed, the best course of action
is to avoid diffing in the first place.

To prevent diffing, we just return the model object as is. Duckweed detects
changes based on identity test (`oldModel === newModel`), so returning the model
object that was passed to the update function without touching it will pass this
test.

Here's an example:

```javascript
const update = (model, address, ...args) => {
  switch (address) {
    case 'goToIndex':
      const [index] = args;
      return model.index === index
        // Nothing has changed
        ? model
        : {...model, index};

    // ....
  }
}
```

## Using keys

When writing view code, we can use the `key` prop to identify a particular
configuration of a `VNode`. As long as the key is the same, Snabbdom will skip
diffing that particular node. (It will still diff its children, though.)

We can calculate the value for a key by using the the data that is used to
render the VNode and outputting a value to be used as the key. Keep in mind that
this is still a tradeoff between the cost of diffing the node versus the cost of
calculating a key. If calculating keys for a node is expensive, it doesn't make
sense to use this technique for that particular node.

## Wrapping views

A view function takes some arguments and outputs a VNode tree. Similarly to how
we deal with single `VNode`s using keys, we can deal with the whole trees using
wrappers.

Here's an example:

```javascript
const guard = (cond, fn)  => {
  let lastVnodes;
  let lastProps;

  return (props) => {
    if (!lastVnodes || cond(lastProps, props)) {
      lastProps = props;
      lastVnodes = fn(props);
    }
    return lastVnodes;
  };
};

const view = guard(
  // Test function
  (p1, p2) => p1.model.timestamp !== p2.model.timestamp,
  // Actual view
  ({model, act}) => // ....
)
```

The `guard` function takes a condition function and a view function, and returns
the cached version of the view function's output as long as the condition
functions returns `false`.

If you are familiar with React, this is similar to the `shouldComponentUpdate`
method.

Note that this is not the same as suppressing the diffing. It just prevents the
view function from getting invoked, but the cached VDOM subtree that is returned
will still be taken into account when diffing the whole tree.

[Documentation index](../main.md)
