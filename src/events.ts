/**
 * (c) 2017 Hajime Yamasaki Vukelic
 * All rights reserved.
 */

import * as is from './is';

type ArgsProcessor = (...args) => any[] | undefined;
type EventHandler = (...args) => void;


/**
 * Decorates an event handler with a processor
 */
const from = (processor: ArgsProcessor, handler: EventHandler): EventHandler => (...eventArgs) =>
  (args => args && handler(...args)
  )(processor(...eventArgs));


/**
 * Processor that handles input DOM events
 */
const inputEvent: ArgsProcessor = (event: Event): [string] =>
  [(event.target as HTMLInputElement).value];


/**
 * Processor that handles change DOM events on checkboxes
 */
const checkboxEvent: ArgsProcessor = (event: Event): [boolean, string] =>
  [(event.target as HTMLInputElement).checked, (event.target as HTMLInputElement).value];


/**
 * Automatic processor that handles various events and hooks
 */
const auto = (...eventCallbackArgs) => {
  const first = eventCallbackArgs[0];
  if (is.vnode(first)) {
    // This is mostly for hooks. We add the vnode objects to args.
    return eventCallbackArgs;
  } else if (is.changeEvent(first) && is.checkbox(first.target)) {
    return checkboxEvent(first);
  } else if (is.inputEvent(first) && is.input(first.target)) {
    first.preventDefault();
    return inputEvent(first);
  } else if (is.pathData(first)) {
    return [first];
  }
  return [];
};


export {
  ArgsProcessor,
  EventHandler,
  from,
  inputEvent,
  checkboxEvent,
  auto,
};
