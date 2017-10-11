# Writing plugins

Plugins can be used to facilitate interaction between external sources of events
(e.g., push notifications, localStorage events, etc.) and your Duckweed app.

Plugins are objects with the `update` and `init` functions.

The `update` function is the same as the application's update function, with
exactly the same behavior.

The `init` function is called when the plugin is registered, and is given an
action trigger object and a runner state object.

The action trigger function works the same way as the `act` property in the view
prop, but it sends messages addressed to the plugin's own actions instead of the
application actions.

The runner state object has `model`, `vnodes`, and `nextRenderId` properties,
which represent the application model, currently rendered vnodes (which is
usually the root DOM node initially), and the `setTimeout()` timer ID of the
next scheduled render. Plugin therefore gains access to the key data in the
runner and is free to do whatever it wants with it.

## Example plugin

Here's an example of a supposed plugin that receives notifications from an
external source, and updates the model.

```javascript
const notificationPlugin = {
  update: (model, address, ...args) => {
    switch(address) {
      case 'receiveNotification':
        const [message] = args;
        return {
          ...model,
          lastMessage: message,
          messages: model.messages.concat(message),
        };
    }
  }
  init(act, state) {
    pushNotifier.addListener((message) => {
      act('receiveNotification', message)();
    });
  }
}
```

Note that `act()` is a higher-order function, so its direct return value is a
function that needs to be invoked. It may look weird, but if we refactor the
above code to take advantage of this, it becomes clearer why it's designed that
way:

```javascript
const notificationPlugin = {
  // ...
  init(act, state) {
    pushNotifier.addListener(act('receiveNotification'));
  }
}
```

## Registering plugins

Plugins are registered by passing them as an array to the `plugins` runner option.

For example:

```javascript
duckweed.runner(model, update, view, {
  plugins: [notificationPlugin],
});
```

[Documentation index](../main.md) | [Next topic](./testing.md)
