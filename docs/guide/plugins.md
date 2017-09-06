# Writing plugins

Plugins consist of the `actions` key which points to an object, and the `init`
property which is a function that takes a message handler as the only argument.

The `actions` object has the same structure as the `actions` parameter of the
`runner()` function. It defines a set of plugin-specific actions. Each plugin
action has access to the entire model and can patch the model just like any
application action.

The `init()` function is called before the application is rendered for the first
time, and is given a modified action handler that immediately transmits
messages.

Here's an example of a supposed plugin that receives notifications from an
external source, and updates the model.

```javascript
const notificationPlugin = {
  actions: {
    receiveNotification: (patch, message) => {
      patch((model) => ({
        ...model,
        lastMessage: message,
        messages: model.messages.concat(message),
      }));
    },
  },
  init(act) {
    pushNotifier.addListener((message) => {
      act("receiveNotification", message);
    });
  }
}
```

[Documentation index](../main.md) | [Next topic](./testing.md)
