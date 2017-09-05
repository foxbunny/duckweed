/**
 * (c) 2017 Hajime Yamasaki Vukelic
 * All rights reserved.
 */

import {VNode} from "snabbdom/vnode";

import * as events from "./events";
import html, {GenericProps} from "./html";
import runner, {ViewFunction} from "./runner";

declare global {
  namespace JSX {
    // tslint:disable:no-empty-interface
    interface Element extends VNode {}
    type ElementClass = ViewFunction;
    interface IntrinsicElements {
      [element: string]: GenericProps;
    }
  }
}

export {
  html,
  runner,
  events,
};
