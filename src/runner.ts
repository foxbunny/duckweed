/**
 * (c) 2017 Hajime Yamasaki Vukelic
 * All rights reserved.
 */

import {VNode} from 'snabbdom/vnode';

import {patch as duckweedPatch} from './html';
import * as is from './is';


type PatchFunction<T = any> = (model: T) => T;
type Scope = Array<string | number>;
type ModelPatcher<T = any> = {
  (fn: PatchFunction<T>): void,
  as<S = any>(scope: Scope, callback?: (model: T) => T): ModelPatcher<S>,
};
type Actions<T = any> = {
  [action: string]: (patch: ModelPatcher<T>, ...args) => void | Promise<void>,
};
type ActionHandler = {
  (...message): (...eventArgs) => any,
  prefix: any[],
  as(...message): ActionHandler,
};
type Props = {
  model,
  act: ActionHandler,
};
type ViewFunction = (props: Props) => VNode;
type RenderFunction = (handler: ActionHandler) => void;
type PatchMiddleware = (fn: PatchFunction) => PatchFunction;
type RunnerState<T = any> = {
  vnodes: Element | VNode,
  model: T,
  nextRenderId: null | number,
};
type Plugin = {
  actions: Actions<any>,
  init(act: (...args) => void, state: RunnerState): void,
};
type VDOMPatchFunction = (oldVnode: Element | VNode, vnode: VNode) => VNode;
type RunnerOptions = {
  root?: string | Element | VNode,
  patch?: VDOMPatchFunction,
  plugins?: Plugin[],
  middleware?: PatchMiddleware[],
};


const identity = <T = any> (x: T): T => x;

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
const createRenderer = (state: RunnerState, patch: VDOMPatchFunction, view: ViewFunction) =>
  (actionHandler: ActionHandler) => {
    state.vnodes = patch(state.vnodes, view({model: state.model, act: actionHandler} as Props));
    state.nextRenderId = null;
  };


/**
 * Retrieves the value within an object, at given scope.
 */
const scopeGet = (scope: Array<string | number>, object) =>
  scope.length
    ? scopeGet(scope.slice(1), object[scope[0]])
    : object;


/**
 * Returns a copy of the object with the value assigned to the property at specified scope
 */
const scopeSet = (scope: Scope, val, object) =>
  scope.length
    ? (([first, ...rest]) =>
        Array.isArray(object)
          ? (() => {
              const copy = object.concat([]);
              copy[first as number] = scopeSet(rest, val, copy[first as number]);
              return copy;
            })()
          : {...object, [first]: scopeSet(rest, val, object[first])}
      )(scope)
    : val;


const scopePatch = (scope: Scope, fn: (arg) => any, object) =>
  scopeSet(scope, fn(scopeGet(scope, object)), object);


const createPatcher = <T = any>(
  state: RunnerState,
  middleware: PatchMiddleware,
  patchCallback: () => void,
  scope: Scope = [],
  parentScope: Scope = [],
  scopeCallback: ((model) => any) = identity,
): ModelPatcher<T> => {

  const mutate: PatchMiddleware = (fn: PatchFunction<T>) => model =>
    (updated => scopePatch(parentScope, scopeCallback, updated)
    )(scope ? scopePatch(scope, fn, model) : fn(model));

  const patcher = (fn: PatchFunction<T>) => {
    const updatedModel = middleware(mutate(fn))(state.model);
    if (updatedModel === state.model) {
      // When these are identical, the application state hasn't changed at all,
      // so we won't do anything else.
      return;
    }
    state.model = updatedModel;
    patchCallback();
  };

  (patcher as any).as = <S = any>(childScope: Scope, parentCallback: (model: T) => T): ModelPatcher<S> =>
    (patcherScope => createPatcher(state, middleware, patchCallback, patcherScope, scope, parentCallback)
    )(scope ? scope.concat(childScope) : childScope);

  return patcher as ModelPatcher<T>;
};


const actionHandlerFactory = (patcher: ModelPatcher, actions: Actions, prefix = []): ActionHandler => {
  const handler = (...args) => (...eventArgs) => {
    const [action, ...actionArgs] = prefix.concat(args, eventArgs);
    if (action == null) {
      return;
    }
    const actionFn = actions[action];
    if (!actionFn) {
      throw Error(`No action found for message [${action}, ${actionArgs.join(', ')}]`);
    }
    actionFn(patcher, ...actionArgs);
  };

  (handler as any).as = (...args) => actionHandlerFactory(patcher, actions, prefix.concat(args));

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
 * A message consists of an action identifier, and zero or more arbitrary
 * user-specified arguments. The message is specified in the prop, and it is
 * passed to the action handler, which returns an event handler that is used by
 * Snabbdom to handle the events. When an event is triggered, the control is
 * returned to the action handler which uses the original message to determine
 * which action handler will be invoked.
 */
const createActionHandler = <T = any>(
  state: RunnerState,
  actions: Actions<T>,
  render: RenderFunction,
  middleware: PatchMiddleware,
): ActionHandler => {
  const patcher = createPatcher(state, middleware, () => setNextRender(state, () => render(handler)));
  const handler = actionHandlerFactory(patcher, actions);
  return handler;
};


const DEFAULT_OPTIONS: RunnerOptions = {
  middleware: [],
  patch: duckweedPatch,
  plugins: [],
  root: '#app',
};


/**
 * Create and start a new application runtime
 *
 * The runner function takes a model, actions mapping, view function, and an
 * an object containing runner options, and kick starts the app.
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

  // Collect plugin actions
  const pluginActions = (opt.plugins as Plugin[]).reduce((ps, p) => ({...ps, ...p.actions}), {});

  // Prepare the engine
  const middlewareStack = (opt.middleware as PatchMiddleware[])
    .reduce((m1, m2) => fn => m1(m2(fn)), identity);

  const render = createRenderer(state, opt.patch as VDOMPatchFunction, view);

  const actionHandler = createActionHandler<T>(
    state,
    {...pluginActions, ...actions},
    render,
    middlewareStack,
  );

  const pluginActionHandler = (...args) => actionHandler(...args)();

  // Init plugins
  (opt.plugins as Plugin[]).forEach(({init}) => {
    init(pluginActionHandler, state);
  });

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
  RenderFunction,
  Plugin,
  VDOMPatchFunction,
  RunnerOptions,
  runner,
};

export default runner;
