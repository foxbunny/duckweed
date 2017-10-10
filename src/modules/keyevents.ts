/**
 * (c) 2017 Hajime Yamasaki Vukelic
 * All rights reserved.
 *
 * Loosely based on snabbdom/src/modules/eventlisteners.ts
 *
 */

import {Module} from 'snabbdom/modules/module';
import {VNode, VNodeData} from 'snabbdom/vnode';


type Keys = {
  [key: string]: EventListener,
};


const keyCodeMap: {[code: number]: string} = {
  8: 'backspace',
  9: 'tab',
  13: 'enter',
  27: 'escape',
  33: 'pageup',
  34: 'pagedown',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
  46: 'delete',
};


const invokeHandler = (handler: any, vnode?: VNode, event?: Event): any => {
  if (typeof handler === 'function') {
    handler.call(vnode, event, vnode);
  } else {
    const [func, ...args] = handler;
    func.call(vnode, ...args, event, vnode);
  }
};


const handleEvent = (event: KeyboardEvent, vnode: VNode) => {
  const name = keyCodeMap[event.keyCode];
  if (!name) {
    return;
  }
  const keys = (vnode.data as VNodeData).keys;
  if (keys && keys[name]) {
    invokeHandler(keys[name], vnode, event);
  }
};


const createListener = (container: Element) => {
  const handler = (event: KeyboardEvent) => {
    handleEvent(event, (handler as any).vnode);
  };
  return handler;
};


const updateListeners = (oldVNode: VNode, vnode: VNode): void => {
  const oldKeys = (oldVNode.data as VNodeData).keys;
  const keys = vnode && (vnode.data as VNodeData).keys;

  // Optimization for reused immutable handlers
  if (oldKeys === keys) {
    return;
  }

  const oldListener = (oldVNode as any).keysListener;

  const elm = (vnode && vnode.elm) as Element;

  // Remove existing listeners
  if (oldKeys && oldListener) {
    const remainingKeys = Object.keys(oldKeys).filter(key => !keys || !(key in keys));
    if (!remainingKeys.length) {
      elm.removeEventListener('keyup', oldListener, false);
    }
  }

  // Add new listeners if necessary
  if (keys && Object.keys(keys).length) {
    const listener = (vnode as any).keysListener || (oldVNode as any).keysListener || createListener(elm);
    listener.vnode = vnode;
    (vnode as any).keysListener = listener;
    elm.addEventListener('keyup', listener, false);
  }
};


const module = {
  create: updateListeners,
  destroy: updateListeners,
  update: updateListeners,
} as Module;


export {
  Keys,
  module,
};

export default module;
