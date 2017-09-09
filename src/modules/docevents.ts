/**
 * (c) 2017 Hajime Yamasaki Vukelic
 * All rights reserved.
 */

// FIXME: This module and offevents module are nearly identical. The common
// parts should be refactored.

import {Module} from "snabbdom/modules/module";
import {VNode, VNodeData} from "snabbdom/vnode";

type Doc = {
  [N in keyof HTMLElementEventMap]?: (ev: HTMLElementEventMap[N]) => void;
} & {
  [event: string]: EventListener;
};

const invokeHandler = (handler: any, vnode?: VNode, event?: Event): any => {
  if (typeof handler === "function") {
    handler.call(vnode, event, vnode);
  } else {
    const [func, ...args] = handler;
    func.call(vnode, ...args, event, vnode);
  }
};

const handleEvent = (event: Event, vnode: VNode) => {
  const name = event.type;
  const doc = (vnode.data as VNodeData).doc;
  if (doc && doc[name]) {
    invokeHandler(doc[name], vnode, event);
  }
};

const createListener = (container: Element) => {
  const handler = (event: Event) => {
    handleEvent(event, (handler as any).vnode);
  };
  return handler;
};

const updateListeners = (oldVNode: VNode, vnode: VNode): void => {
  const oldDoc = (oldVNode.data as VNodeData).doc;
  const doc = vnode && (vnode.data as VNodeData).doc;

  // Optimization for reused immutable handlers
  if (oldDoc === doc) {
    return;
  }

  const oldListener = (oldVNode as any).docListener;

  // Remove existing listeners
  if (oldDoc && oldListener) {
    Object.keys(oldDoc)
      .filter((name) => !doc || !(name in doc))
      .forEach((name) => {
        document.removeEventListener(name, oldListener, false);
      });
  }

  const elm = (vnode && vnode.elm) as Element;

  // Add new listeners if necessary
  if (doc) {
    const listener = (vnode as any).docListener || (oldVNode as any).docListener || createListener(elm);
    listener.vnode = vnode;
    (vnode as any).docListener = listener;
    Object.keys(doc)
      .filter((name) => !oldDoc || !(name in oldDoc))
      .forEach((name) => {
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
  Doc,
  module,
};
export default module;
