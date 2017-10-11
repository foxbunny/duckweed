/**
 * (c) 2017 Hajime Yamasaki Vukelic
 * All rights reserved.
 */

import {VNode} from 'snabbdom/vnode';

import {patch as duckweedPatch} from './html';
import * as is from './is';


type Message = any[];

type NormalizedModelAction<T = any> = [T, Message | Promise<Message> | undefined];

type UpdateFunction<T = any> =  (model: T, address: string | number, ...args) => T | NormalizedModelAction;

type NormalizedUpdateFunction<T = any> = (model: T, address: string | number, ...args) => NormalizedModelAction;

type ActionTrigger = (address, ...message) => (...eventArgs) => any;

type Props = {
  model,
  act: ActionTrigger,
};

type ViewFunction = (props: Props) => VNode;

type RenderFunction = (trigger: ActionTrigger) => void;

type UpdateMiddleware = (fn: NormalizedUpdateFunction) => NormalizedUpdateFunction;

type RunnerState<T = any> = {
  vnodes: Element | VNode,
  model: T,
  nextRenderId: null | number,
};

type Plugin<T = any> = {
  update: UpdateFunction,
  init: (act: ActionTrigger, state: RunnerState<T>) => void,
};

type VDOMPatchFunction = (oldVnode: Element | VNode, vnode: VNode) => VNode;

type RunnerOptions = {
  root?: string | Element | VNode,
  patch?: VDOMPatchFunction,
  plugins?: Plugin[],
  middleware?: UpdateMiddleware[],
};


// UTILITY FUNCTIONS


const identity = x => x;


const pipe = fns => fns.reduce((f, g) => (...args) => f(g(...args)), identity);


// RENDERING FUNCTIONS


/**
 * Create a renderer function
 *
 * The renderer function will keep updating the vnodes stored in the runner
 * state using a specified view function. It does so asyncrhonously using the
 * setTimeout function, and it will cancel the previous timeout if called
 * multiple times in a row..
 */
const createRenderer = <T = any> (
  state: RunnerState<T>,
  patch: VDOMPatchFunction,
  view: ViewFunction,
): RenderFunction =>
  (trigger: ActionTrigger) => {
    if (state.nextRenderId) {
      clearTimeout(state.nextRenderId);
      state.nextRenderId = null;
    }
    state.nextRenderId = setTimeout(() => {
      state.vnodes = patch(state.vnodes, view({model: state.model, act: trigger} as Props));
      state.nextRenderId = null;
    });
  };



// ACTION-RELATED FUNCTIONS


/**
 * Convert the output of the update function into a model-action two-tuple
 */
const modelAction = <T = any> (ret: T | NormalizedModelAction<T>): NormalizedModelAction<T> =>
Array.isArray(ret) ? ret : [ret, undefined];


/**
 * Create an action trigger function
 *
 * The created function is used in the view to trigger actions by sending
 * messages. The action triggers drive the application by updating the model and
 * performing renders using the provided render function, so it can be
 * considered the pumping heart of a duckweed app.
 */
const createActionTrigger = <T = any> (
  state: RunnerState<T>,
  update: NormalizedUpdateFunction<T>,
  render: RenderFunction,
): ActionTrigger => {
  const trigger = (address, ...args) => (...eventArgs) => {
    const [model, message] = update(state.model, address, ...args, ...eventArgs);
    const hasChanged = model !== state.model;
    state.model = model;

    if (is.promise(message)) {
      // Update returned a promise that should resolve to a message.
      message.then(([address1, ...args1]) => trigger(address1, ...args1)());

    } else if (message) {
      // Update returned an message that is not a promise.
      const [address1, ...args1] = message;
      trigger(address1, ...args1)();
    }

    if (hasChanged) {
      // Only render if the model has been modified.
      render(trigger);
    }
  };
  return trigger;
};



// THE RUNNER



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
const runner = <T = any> (model: T, update: UpdateFunction<T>, view: ViewFunction, options: RunnerOptions = {}) => {
  const opt = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const state: RunnerState<T> = {
    model,
    nextRenderId: null,
    vnodes: is.str(opt.root) ? (document.querySelector(opt.root) as Element) : opt.root as Element | VNode,
  };

  const render = createRenderer(state, opt.patch as VDOMPatchFunction, view);
  const middleware = pipe(opt.middleware);
  const update1 = middleware((m, a, ...args) => modelAction<T>(update(m, a, ...args)));
  const actionTrigger = createActionTrigger<T>(state, update1, render);
  opt.plugins.forEach(plugin =>
    (act => plugin.init(act, state)
    )(createActionTrigger<T>(state, plugin.update, render)),
  );

  // Start rendering
  render(actionTrigger);
};


export {
  Message,
  NormalizedModelAction,
  UpdateFunction,
  NormalizedUpdateFunction,
  ActionTrigger,
  UpdateMiddleware,
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
