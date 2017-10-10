/**
 * (c) 2017 Hajime Yamasaki Vukelic
 * All rights reserved.
 *
 * Loosely based on snabbdom/src/modules/eventlisteners.ts
 *
 */

import {Module} from 'snabbdom/modules/module';
import {VNode, VNodeData} from 'snabbdom/vnode';


type Off = {
  [N in keyof HTMLElementEventMap]?: (ev: HTMLElementEventMap[N]) => void
} & {
  [event: string]: EventListener,
};


const invokeHandler = (handler: any, vnode?: VNode, event?: Event): any => {
  if (typeof handler === 'function') {
    handler.call(vnode, event, vnode);
  } else {
    const [func, ...args] = handler;
    func.call(vnode, ...args, event, vnode);
  }
};


const handleEvent = (event: Event, vnode: VNode) => {
  const name = event.type;
  const off = (vnode.data as VNodeData).off;
  if (off && off[name]) {
    invokeHandler(off[name], vnode, event);
  }
};


const createListener = (container: Element) => {
  const handler = (event: Event) => {
    if (container.contains((event.target as Element))) {
      // Event target it inside the container so we're not interested.
      return;
    }
    // We will only handle events that are triggered outside the container.
    handleEvent(event, (handler as any).vnode);
  };
  return handler;
};


const updateListeners = (oldVNode: VNode, vnode: VNode): void => {
  const oldOff = (oldVNode.data as VNodeData).off;
  const off = vnode && (vnode.data as VNodeData).off;

  // Optimization for reused immutable handlers
  if (oldOff === off) {
    return;
  }

  const oldListener = (oldVNode as any).offListener;

  // Remove existing listeners
  if (oldOff && oldListener) {
    Object.keys(oldOff)
      .filter(name => !off || !(name in off))
      .forEach(name => {
        document.removeEventListener(name, oldListener, false);
      });
  }

  const elm = (vnode && vnode.elm) as Element;

  // Add new listeners if necessary
  if (off) {
    const listener = (vnode as any).offListener || (oldVNode as any).offListener || createListener(elm);
    listener.vnode = vnode;
    (vnode as any).offListener = listener;
    Object.keys(off)
      .filter(name => !oldOff || !(name in oldOff))
      .forEach(name => {
        document.addEventListener(name, listener, false);
      });
  }
};


const module = {
  create: updateListeners,
  destroy: updateListeners,
  update: updateListeners,
} as Module;


export {
  Off,
  module,
};

export default module;
