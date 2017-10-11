# Testing Duckweed applications

Duckweed applications are generally neither easy nor difficult to test. They are
as hard to test as the most untestable code you have in your app. Most of your
app is just JavaScript/TypeScript anyway.

Having said that, there are ways to avoid shooting yourself in the foot.

## It's all just functions

Views, model initializers, actions... these are all functions in Duckweed. Keep
them that way as much as possible. Don't try to invent class-based solutions or
complicated factory functions for their own sake because they make testing all
that harder.

## Use event helpers

Use [event helpers](./event-helpers.md) when you need to handle events. The API
documentation [contains information](../api/events.md) on how you can write your
own event processors for cases where existing event helpers don't cut it.

This helps you write message handlers that work with simple data instead of
event objects. Some event objects are quite impossible to recreate.

## Avoid unmanaged state

Managed state is the one that is kept in the model. Any other state is
unmanaged. Consider this example:

```jsx
let count = 0;

const actions = {
  increment: () => {
    count += 1;
  },
};

const view = ({act}) => (
  <div>
    {count}
    <button on-click={act("increment")}>increment</button>
  </div>
);

module.exports {
  actions,
  view,
}
```

At first it may sound cool to have private state that is specific to that view.
It may even make sense for that particular module. But it's sadly impossible to
test this.

## Use a service layer

For complicated logic (such as performing XHR), use separate helper functions /
objects, that you can easily mock later. This also includes things that are not
easy to mock, like browser APIs. Keep your actions as lean as possible.

## Don't (ab)use hooks

Hooks won't always trigger in test environment unless your test runner can run
in a browser (not necessarily the case).

## Don't depend on Duckweed API when you don't need to

Duckweed does what it does. It's a reactive view framework. Think about what
code absolutely must depend on its API for your app to work, and put everything
else outside Duckweed, into the pure-JavaScript land.

[Documentation index](../main.md) | [Next topic](./perf.md)
