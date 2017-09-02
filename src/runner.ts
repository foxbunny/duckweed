/**
 * (c) 2017 Hajime Yamasaki Vukelic
 * All rights reserved.
 */

import {VNode} from "snabbdom/vnode";

import {patch} from "./html";
import * as is from "./is";

type PatchFunction<T = any> = (model: T) => T;

type Scope = Array<string | number>;

interface ModelPatcher<T = any> {
  (fn: PatchFunction<T>): void;
  as<S = any>(scope: Scope): ModelPatcher<S>;
}

interface Actions<T = any> {
  [action: string]: (patch: ModelPatcher<T>, ...args: any[]) => void | Promise<void>;
}

interface ActionHandler {
  (...message: any[]): (...eventArgs: any[]) => any;
  prefix: any[];
  as(...message: any[]): ActionHandler;
}

interface Props {
  model: any;
  act: ActionHandler;
}

type ViewFunction = (props: Props) => VNode;

type RenderFunction = (handler: ActionHandler) => void;

type PatchMiddleware = (fn: PatchFunction) => PatchFunction;

interface RunnerState<T = any> {
  vnodes: Element | VNode;
  model: T;
  nextRenderId: null | number;
}

interface RunnerOptions {
  root?: string | Element | VNode;
  middleware?: PatchMiddleware[];
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
    state.vnodes = patch(state.vnodes, view({model: state.model, act: actionHandler} as Props));
    state.nextRenderId = null;
  };
};

/**
 * Retrieves the value within an object, at given scope.
 */
const scopeGet = (scope: Array<string | number>, object: any): any => {
  return scope.length
    ? scopeGet(scope.slice(1), object[scope[0]])
    : object;
};

/**
 * Returns a copy of the object with the value assigned to the property at specified scope
 */
const scopeSet = (scope: Scope, val: any, object: any): any => {
  if (scope.length === 0) {
    return val;
  }
  const [first, ...rest] = scope;
  return Array.isArray(object)
    ? (() => {
      const copy = object.concat([]);
      copy[first as number] = scopeSet(rest, val, copy[first as number]);
      return copy;
    })()
    : {...object, [first]: scopeSet(rest, val, object[first])};
};

const scopePatch = (scope: Scope, fn: (arg: any) => any, object: any): any =>
  scopeSet(scope, fn(scopeGet(scope, object)), object);

const createPatcher = <T = any>(
  state: RunnerState,
  middleware: PatchMiddleware[],
  patchCallback: () => void,
  scope: Scope = [],
  parentScope: Scope = [],
  scopeCallback: (model: any) => any = (model) => model,
): ModelPatcher<T> => {
  const middlewareStack = middleware.reduce((m1, m2) => {
    return (fn: PatchFunction) => m1(m2(fn));
  }, (fn: PatchFunction) => fn);
  const mutate: PatchMiddleware = (fn: PatchFunction<T>) => (model: any) => {
    const updated = scope
      ? scopePatch(scope, fn, model)
      : fn(model);
    return scopePatch(parentScope, scopeCallback, updated);
  };
  const patcher = (fn: PatchFunction<T>) => {
    state.model = middlewareStack(mutate(fn))(state.model);
    patchCallback();
  };
  (patcher as any).as = <S = any>(childScope: Scope, parentCallback: (model: any) => any): ModelPatcher<S> => {
    const patcherScope = scope ? scope.concat(childScope) : childScope;
    return createPatcher(state, middleware, patchCallback, patcherScope, scope, parentCallback);
  };
  return patcher as ModelPatcher<T>;
};

const actionHandlerFactory = (patcher: ModelPatcher, actions: Actions, prefix: any[] = []): ActionHandler => {
  const handler = (...args: any[]) => (...eventArgs: any[]) => {
    const [action, ...actionArgs] = prefix.concat(args, eventArgs);
    if (action == null) {
      return;
    }
    const actionFn = actions[action];
    if (!actionFn) {
      throw Error(`No action found for message [${action}, ${actionArgs.join(", ")}]`);
    }
    actionFn(patcher, ...actionArgs);
  };
  (handler as any).as = (...args: any[]) => {
    return actionHandlerFactory(patcher, actions, prefix.concat(args));
  };
  (handler as any).prefix = prefix;
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
  middleware: PatchMiddleware[],
): ActionHandler => {
  const patcher = createPatcher(state, middleware, () => setNextRender(state, () => render(handler)));
  const handler = actionHandlerFactory(patcher, actions);
  return handler;
};

const DEFAULT_OPTIONS: RunnerOptions = {
  middleware: [],
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
    vnodes: is.str(opt.root) ? (document.querySelector(opt.root) as Element) : opt.root as Element | VNode,
  };

  // Prepare the engine
  const render = createRenderer(state, view);
  const actionHandler = createActionHandler<T>(
    state,
    actions,
    render,
    opt.middleware as PatchMiddleware[],
  );

  // Start rendering
  render(actionHandler);
};

export {
  PatchFunction,
  Scope,
  ModelPatcher,
  Actions,
  ActionHandler,
  PatchMiddleware,
  Props,
  ViewFunction,
  RunnerState,
  RunnerOptions,
  runner,
};
export default runner;
