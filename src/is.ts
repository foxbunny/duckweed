/**
 * (c) 2017 Hajime Yamasaki Vukelic
 * All rights reserved.
 */

import {VNode} from 'snabbdom/vnode';

import {PathData} from './modules/routeevents';

const str = (s): s is string =>
  typeof s === 'string';

const input = (target): target is HTMLInputElement =>
  target.tagName === 'INPUT';

const checkbox = (target): target is HTMLInputElement =>
  target.tagName === 'INPUT' && target.type === 'checkbox';

const event = (ev): ev is Event =>
  ev instanceof Event;

const changeEvent = (ev): ev is Event =>
  event(ev) && ev.type === 'change';

const inputEvent = (ev): ev is Event =>
  event(ev) && ev.type === 'input';

const vnode = (vn): vn is VNode =>
  typeof vn === 'object' && 'sel' in vnode;

const pathData = (data): data is PathData =>
  typeof data === 'object' && typeof data.pathname === 'string';

const promise = <T = any> (p): p is Promise<T> =>
  p instanceof Promise;

export {
  str,
  input,
  checkbox,
  event,
  changeEvent,
  inputEvent,
  vnode,
  pathData,
  promise,
};
