/**
 * (c) 2017 Hajime Yamasaki Vukelic
 * All rights reserved.
 */

import * as qs from 'query-string';
import {Module} from 'snabbdom/modules/module';
import {VNode, VNodeData} from 'snabbdom/vnode';


type PathData = {
  type: 'popstate',
  pathname: string,
  hash: string,
  query: string,
  params: {[param: string]: any},
};
type RouteListener = (p: PathData) => any;


const handleEvent = (data: PathData, vnode: VNode) =>
  (route =>
    typeof route === 'function' && route(data)
  )((vnode.data as VNodeData).route);


const createListener = () => {
  const handler = (event: PopStateEvent) => {
    const pathData: PathData = {
      hash: location.hash,
      params: qs.parse(location.search),
      pathname: location.pathname,
      query: location.search,
      type: 'popstate',
    };

    handleEvent(pathData, (handler as any).vnode);
  };

  return handler;
};


const updateListener = (oldVNode: VNode, vnode: VNode) => {
  const oldRoute = (oldVNode.data as VNodeData).route;
  const route = vnode && (vnode.data as VNodeData).route;

  if (oldRoute === route) {
    return;
  }

  const oldListener = (oldVNode as any).routeListener;

  // Remove existing listener
  if (oldRoute && oldListener) {
    window.removeEventListener('popstate', oldListener, false);
  }

  if (route) {
    const listener = createListener();
    (listener as any).vnode = vnode;
    (vnode as any).routeListener = listener;
    window.addEventListener('popstate', listener, false);
  }
};


const module = {
  create: updateListener,
  destroy: updateListener,
  update: updateListener,
} as Module;


export {
  PathData,
  RouteListener,
  module,
};

export default module;
