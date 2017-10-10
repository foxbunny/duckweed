/**
 * (c) 2017 Hajime Yamasaki Vukelic
 * All rights reserved.
 */

import * as snabbdom from 'snabbdom';
import snab from 'snabbdom/h';
import snabClass from 'snabbdom/modules/class';
import snabEvents from 'snabbdom/modules/eventlisteners';
import snabProps from 'snabbdom/modules/props';
import styleModule from 'snabbdom/modules/style';
import {VNode} from 'snabbdom/vnode';

import docevents from './modules/docevents';
import keyevents from './modules/keyevents';
import offevents from './modules/offevents';
import routeevents from './modules/routeevents';


type ChildVNodes = Array<VNode | null | undefined>;
type ChildVNodesArg = Array<VNode | undefined | null | InlineChild | [VNode] | string>;
type InlineChild = {
  __vnodes: ChildVNodes;
};
type GenericProps = {
  [prop: string]: any;
};
type PropsBase = {
  key?: string;
  prefix?: any[];
};
type ViewFunction<T = any> = (props?: T, children?: InlineChild) => VNode;
type ClassMap = {[className: string]: any};
type ClassNames = string | string[] | ClassMap;


const patch = snabbdom.init([
  snabClass,
  styleModule,
  snabEvents,
  snabProps,
  docevents,
  offevents,
  keyevents,
  routeevents,
]);


const isInlineChild = (obj): obj is InlineChild =>
  typeof obj === 'object' && obj !== null && typeof obj.vnodes !== 'undefined';


const prepareClasses = (classes: ClassNames | null | undefined) => {
  if (classes == null) {
    return {};
  }
  if (typeof classes === 'object' && !Array.isArray(classes)) {
    return classes;
  }
  if (typeof classes === 'string') {
    return {[classes]: true};
  }
  return classes.reduce((o: ClassMap, c: string) => {
    o[c] = true;
    return o;
  }, {});
};


const prepareProps = (props: GenericProps | null): GenericProps =>
  props == null
    ? {}
    : Object.keys(props)
        .reduce(
          (ps: GenericProps, prop: string) => {
            const [mod, sub] = prop.split('-');
            if (sub) {
              ps[mod] = ps[mod] || {};
              ps[mod][sub] = props[prop];
            } else if (prop === 'key') {
              ps.key = props[prop];
            } else if (prop === 'on') {
              ps.on = props[prop];
            } else if (prop === 'hook') {
              ps.hook = props[prop];
            } else if (prop === 'class') {
              ps.class = prepareClasses(props[prop]);
            } else if (prop === 'style') {
              ps.style = props[prop];
            } else if (prop === 'route') {
              ps.route = props[prop];
            } else {
              ps.props = ps.props || {};
              ps.props[prop] = props[prop];
            }
            return ps;
          }, {});


const renderIntrinsic = (elm: string, props: GenericProps = {}, children: ChildVNodesArg = []): VNode => {
  // FIXME: We're messing with any a lot here
  children = (children.length === 1
    ? children[0]
    : children.reduce((arr, c) => {
      if (isInlineChild(c)) {
        // Case where we have something like `{props.__inner}` somewhere in the
        // render functions.
        return arr.concat(c.__vnodes);
      }
      if (Array.isArray(c)) {
        // Case where we have something like `{arr.map(() => ...)}`
        return arr.concat(c);
      }
      return arr.concat([c as VNode]);
    }, [] as ChildVNodes)) as any;
  return snab(elm, prepareProps(props), children as any);
};

const dissoc = (prop: string, props?: GenericProps): GenericProps =>
  props == null
    ? null
    : Object.keys(props)
      .filter(x => prop !== x)
      .reduce((o, k) => ({...o, [k]: props[k]}), {});


const renderFunction = (func: ViewFunction, props: GenericProps = {}, children: ChildVNodes = []): VNode =>
  (vnode =>
    ({...vnode, key: vnode.key || (props && props.key)})
  )(func(dissoc('key', props), {__vnodes: children || []}));


const html = (elm: string | ViewFunction, props?, ...children: ChildVNodesArg): VNode => {
  if (typeof elm === 'string') {
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
  patch,
  html,
};

export default html;
