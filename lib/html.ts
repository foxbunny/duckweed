/**
 * (c) 2017 Hajime Yamasaki Vukelic
 * All rights reserved.
 */

import * as snabbdom from "snabbdom";
import snab from "snabbdom/h";
import snabClass from "snabbdom/modules/class";
import snabEvents from "snabbdom/modules/eventlisteners";
import snabProps from "snabbdom/modules/props";
import styleModule from "snabbdom/modules/style";
import {VNode} from "snabbdom/vnode";

import documentevents from "./modules/documentevents";
import keyevents from "./modules/keyevents";
import routeevents from "./modules/routeevents";

type ChildVNodes = Array<VNode | null | undefined>;
type ChildVNodesArg = Array<VNode | undefined | null | InlineChild | [VNode]>;

interface InlineChild {
  __vnodes: ChildVNodes;
}

interface GenericProps {
  [prop: string]: any;
}

interface PropsBase {
  key?: string;
  prefix?: any[];
}

type ViewFunction<T = any> = (props?: T, children?: InlineChild) => VNode;

type ActionHandler = (action?: any, ...args: any[]) => (e?: Event) => any;

const EVENT_MODULES = ["on", "off", "hook", "keys"];

// This is a default dummy action handler
let actionHandler: ActionHandler = () => (e?: Event) => undefined;

const patch = snabbdom.init([
  snabClass,
  styleModule,
  snabEvents,
  snabProps,
  documentevents,
  keyevents,
  routeevents,
]);

const isInlineChild = (obj: any): obj is InlineChild => {
  return typeof obj === "object" && obj !== null && typeof obj.vnodes !== "undefined";
};

const prepareClasses = (classes: string | string[] | {[name: string]: any} | null | undefined) => {
  if (classes == null) {
    return {};
  }
  if (typeof classes === "object" && !Array.isArray(classes)) {
    return classes;
  }
  if (typeof classes === "string") {
    return {[classes]: true};
  }
  return classes.reduce((o: {[name: string]: any}, c: string) => {
    o[c] = true;
    return o;
  }, {});
};

const prepareProps = (props: GenericProps | null): GenericProps => {
  if (props == null) {
    return {};
  }
  const finalProps: GenericProps = {};
  Object.keys(props).forEach((prop) => {
    const [mod, sub] = prop.split("-");
    if (sub) {
      finalProps[mod] = finalProps[mod] || {};
      if (EVENT_MODULES.includes(mod)) {
        finalProps[mod][sub] = actionHandler(...props[prop]);
      } else {
        finalProps[mod][sub] = props[prop];
      }
    } else if (prop === "key") {
      finalProps.key = props[prop];
    } else if (prop === "class") {
      finalProps.class = prepareClasses(props[prop]);
    } else if (prop === "style") {
      finalProps.style = props[prop];
    } else if (prop === "route") {
      finalProps.route = actionHandler(...props[prop]);
    } else {
      finalProps.props = finalProps.props || {};
      finalProps.props[prop] = props[prop];
    }
  });
  return finalProps;
};

const renderIntrinsic = (elm: string, props: GenericProps, children: ChildVNodesArg): VNode => {
  children = children.reduce((arr, c) => {
    if (isInlineChild(c)) {
      // Case where we have something like `{props.__inner}` somewhere in the
      // render functions.
      return arr.concat(c.__vnodes);
    }
    if (Array.isArray(c)) {
      // Case where we have something like `{arr.map(() => ...)}`
      return arr.concat(c);
    }
    return arr.concat([c]);
  }, [] as ChildVNodes);
  return snab(elm, prepareProps(props), children as ChildVNodes);
};

const renderFunction = (func: ViewFunction, props: any, children: ChildVNodes): VNode => {
  const key = props.key;
  if (key) {
    delete props.key;
  }
  const vnode = func(props, {__vnodes: children});
  vnode.key = vnode.key || key;
  return vnode;
};

const setActionHandler = (func: ActionHandler) => actionHandler = func;

const html = (elm: string | ViewFunction, props: any, ...children: ChildVNodesArg): VNode => {
  if (typeof elm === "string") {
    return renderIntrinsic(elm, props, children);
  } else {
    return renderFunction(elm, props, children as ChildVNodes);
  }
};

export {
  VNode,
  ChildVNodes,
  InlineChild,
  GenericProps,
  PropsBase,
  ViewFunction,
  ActionHandler,
  setActionHandler,
  patch,
  html,
};
export default html;
