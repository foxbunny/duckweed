/**
 * (c) 2017 Hajime Yamasaki Vukelic
 * All rights reserved.
 */

import {VNode} from "snabbdom/vnode";

import {PathData} from "./modules/routeevents";

const input = (target: any): target is HTMLInputElement =>
  target.tagName === "INPUT";

const checkbox = (target: any): target is HTMLInputElement =>
  target.tagName === "INPUT" && target.type === "checkbox";

const event = (ev: any): ev is Event =>
  ev instanceof Event;

const changeEvent = (ev: any): ev is Event =>
  event(ev) && ev.type === "change";

const inputEvent = (ev: any): ev is Event =>
  event(ev) && ev.type === "input";

const vnode = (vn: any): vn is VNode =>
  typeof vn === "object" && "sel" in vnode;

const pathData = (data: any): data is PathData =>
  typeof data === "object" && typeof data.pathname === "string";

export {
  input,
  checkbox,
  event,
  changeEvent,
  inputEvent,
  vnode,
  pathData,
};
