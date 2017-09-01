/**
 * (c) 2017 Hajime Yamasaki Vukelic
 * All rights reserved.
 */

import {VNode} from "snabbdom/vnode";

import html, {patch} from "./html";
import * as is from "./is";

type PatchFunction<T = any> = (model: T) => T;

type ModelPatcher<T = any> = (fn: PatchFunction<T>) => void;

interface ActionHandler {
  (...message: any[]): (...eventArgs: any[]) => any;
  as(...message: any[]): ActionHandler;
}

interface Props {
  model: any;
  act: ActionHandler;
}

type ViewFunction = (props: Props) => VNode;

type RenderFunction = (handler: ActionHandler) => void;

interface Actions<T = any> {
  [action: string]: (patch: ModelPatcher<T>, ...args: any[]) => Promise<void>;
}

interface RunnerState<T = any> {
  vnodes: Element | VNode;
  model: T;
  nextRenderId: null | number;
}

interface RunnerOptions {
  root?: string | Element | VNode;
}

/**
 * Clears the timer if one was set by the patch function.
 */
const cancelNextRender = (state: RunnerState): void => {
  if (state.nextRenderId) {
    clearTimeout(state.nextRenderId);
    state.nextRenderId = null;
  }
};

/**
 * Cancel the next-scheduled render, and reschedule another render
 */
const setNextRender = (state: RunnerState, render: RenderFunction): void => {
  cancelNextRender(state);
  state.nextRenderId = setTimeout(render);
};

/**
 * Create a renderer function
 *
 * The renderer function will keep updating the vnodes stored in the runner
 * state using a specified view function.
 */
const createRenderer = (state: RunnerState, view: ViewFunction) => {
  return (actionHandler: ActionHandler) => {
    const props: Props = {model: state.model, act: actionHandler};
    state.vnodes = patch(state.vnodes, html(view, props));
    state.nextRenderId = null;
  };
};

/**
 * Construct the final argument list for action handlers
 *
 * This function takes the user arguments (which are supplied in the props), and
 * event handler callback arguments (usually an `Event` object for event
 * handlers, `VNode` objects for hooks, or some special object for synthetic
 * events), and combines those two as needed.
 *
 * This method generates various convenience arguments, like input value for
 * input events, checkbox state for checkbox toggle events, and so on.
 */
const actionArgs = (userArgs: any[], eventCallbackArgs: any[]) => {
  const first = eventCallbackArgs[0];
  if (is.vnode(first)) {
    // This is mostly for hooks. We add the vnode objects to args.
    return userArgs.concat(eventCallbackArgs);
  } else if (is.changeEvent(first) && is.checkbox(first.target)) {
    return userArgs.concat(first.target.checked, first.target.value);
  } else if (is.inputEvent(first) && is.input(first.target)) {
    // For convenience, process events and extract implied arguments
    first.preventDefault();
    return userArgs.concat(first.target.value);
  } else if (is.pathData(first)) {
    return userArgs.concat(first);
  }
  return userArgs;
};

const actionHandlerFactory = (patcher: ModelPatcher, actions: Actions, baseArgs: any[] = []): ActionHandler => {
  const handler = (action: any, ...args: any[]) => (...eventArgs: any[]) => {
    if (action == null) {
      return;
    }
    const actionFn = actions[action];
    actionFn(patcher, ...actionArgs(baseArgs.concat(args), eventArgs));
  };
  (handler as any).as = (...args: any[]) => actionHandlerFactory(patcher, actions, args);
  return handler as ActionHandler;
};

/**
 * Create an action handler
 *
 * Action handler is a proxy event/hook handler factory which allows the user to
 * specify messages which will then be tied to action handlers when the events
 * trigger.
 *
 * A message constists of an action identifier, and zero or more arbitrary
 * user-specified arguments. The message is specified in the prop, and it is
 * passsed to the action handler, which returns an event handler that is used by
 * Snabbdom to handle the events. When an event is triggered, the control is
 * returned to the action handler which uses the original message to determine
 * which action handler will be invoked.
 */
const createActionHandler = <T = any>(
  state: RunnerState,
  actions: Actions<T>,
  render: RenderFunction,
): ActionHandler => {
  const patcher = (fn: PatchFunction<T>) => {
    state.model = fn(state.model);
    setNextRender(state, () => render(handler));
  };
  const handler = actionHandlerFactory(patcher, actions);
  return handler;
};

const DEFAULT_OPTIONS = {
  root: "#app",
};

/**
 * Create and start a new application runtime
 *
 * The runner function takes a model, actions mapping, view function, and an
 * optional root element selector (defaults to "#app"). It then kicks off the
 * render process, rendering the initial view onto the root element (root
 * element is replaced in the process).
 */
const runner = <T = any> (model: T, actions: Actions<T>, view: ViewFunction, options: RunnerOptions = {}) => {
  const opt = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const state: RunnerState<T> = {
    model,
    nextRenderId: null,
    vnodes: is.str(opt.root) ? (document.querySelector(opt.root) as Element) : opt.root,
  };

  // Prepare the engine
  const render = createRenderer(state, view);
  const actionHandler = createActionHandler<T>(state, actions, render);

  // Start rendering
  render(actionHandler);
};

export {
  PatchFunction,
  ModelPatcher,
  ActionHandler,
  Actions,
  Props,
  ViewFunction,
  RunnerState,
  RunnerOptions,
  runner,
};
export default runner;
