/**
 * (c) 2017 Hajime Yamasaki Vukelic
 * All rights reserved.
 */

import * as snabbdom from 'snabbdom';
import h from 'snabbdom/h';
import eventlisteners from 'snabbdom/modules/eventlisteners';
import props from 'snabbdom/modules/props';

import runner from './runner';

import {modelSnapshotter, pause} from './test-helpers';

const patch = snabbdom.init([eventlisteners, props]);

describe('runner', () => {
  beforeEach(() => modelSnapshotter.clear());

  it('should render the initial view', async () => {
    const root = document.createElement('div');
    const view = () => h('div', 'Hello, root');
    runner(undefined, x => x, view, {root});
    await pause();
    expect(root).toMatchSnapshot();
  });

  it('should pass the model to the view as props', async () => {
    const root = document.createElement('div');
    const m = {iam: 'model'};
    const view = ({model}) => {
      expect(model.iam).toBe('model');
      return h('div', `Hello, ${model.iam}`);
    };
    runner(m, x => x, view, {root});
    await pause();
    expect(root).toMatchSnapshot();
  });

  it('should pass an action trigger function as props', async () => {
    const root = document.createElement('div');
    const m = {iam: 'model'};
    const u = jest.fn(x => x);
    const view = ({act}) =>
      h('div', [
        h('a', {props: {href: '/foo'}, on: {click: act('foo')}}, 'clickme'),
      ]);
    runner(m, u, view, {root});
    await pause();
    const e = new Event('click');
    root.querySelector('a').dispatchEvent(e);
    expect(u).toHaveBeenCalled();
    expect(u.mock.calls[0][0]).toBe(m);
    expect(u.mock.calls[0][1]).toBe('foo');
    expect(u.mock.calls[0][2]).toBe(e);
  });

  it('should be able to use actions to modify the model', async () => {
    const root = document.createElement('div');
    const m = {iam: 'model'};
    const u = (action, model) => ({...model, iam: 'action'});
    const view = ({model, act}) =>
      h('div', [
        h('span', model.iam),
        h('a', {props: {href: '/foo'}, on: {click: act('foo')}}, 'clickme'),
      ]);
    runner(m, u, view, {root});
    await pause();
    expect(root).toMatchSnapshot();
    const e = new Event('click');
    root.querySelector('a').dispatchEvent(e);
    await pause();
    expect(root).toMatchSnapshot();
  });

  it('should be able to use additional arguments in actions', async () => {
    const root = document.createElement('div');
    const m = {iam: 'model'};
    const u = (model, action, name) => ({...model, iam: name});
    const view = ({model, act}) =>
      h('div', [
        h('span', model.iam),
        h('a', {props: {href: '/foo'}, on: {click: act('foo', 'bar')}}, 'clickme'),
      ]);
    runner(m, u, view, {root});
    await pause();
    expect(root).toMatchSnapshot();
    const e = new Event('click');
    root.querySelector('a').dispatchEvent(e);
    await pause();
    expect(root).toMatchSnapshot();
  });

  it('should be able to send additional actions from an action', async () => {
    const root = document.createElement('div');
    const m = {iam: 'model', count: 0};
    const u = (model, action, ...args) => {
      switch (action) {
        case 'foo':
          const [name] = args;
          return [
            ({...model, iam: name}),
            ['bar'],
          ];
        case 'bar':
          return ({...model, count: model.count + 1});
        default:
          return model;
      }
    };
    const view = ({model, act}) =>
      h('div', [
        h('span', model.iam),
        h('span', model.count),
        h('a', {props: {href: '/foo'}, on: {click: act('foo', 'bar')}}, 'clickme'),
      ]);
    runner(m, u, view, {root});
    await pause();
    expect(root).toMatchSnapshot();
    const e = new Event('click');
    root.querySelector('a').dispatchEvent(e);
    await pause();
    expect(root).toMatchSnapshot();
  });

  it('should be able to send additional actions as promises', async () => {
    const root = document.createElement('div');
    const m = {iam: 'model', count: 0};
    const u = (model, action, ...args) => {
      switch (action) {
        case 'foo':
          const [name] = args;
          return [
            ({...model, iam: name}),
            new Promise(r => setTimeout(r))
              .then(() => ['bar']),
          ];
        case 'bar':
          return ({...model, count: model.count + 1});
        default:
          return model;
      }
    };
    const view = ({model, act}) =>
      h('div', [
        h('span', model.iam),
        h('span', model.count),
        h('a', {props: {href: '/foo'}, on: {click: act('foo', 'bar')}}, 'clickme'),
      ]);
    runner(m, u, view, {root});
    await pause();
    expect(root).toMatchSnapshot();
    const e = new Event('click');
    root.querySelector('a').dispatchEvent(e);
    await pause();
    await pause();
    expect(root).toMatchSnapshot();
  });

  it('should not render if update returns an unmodified model', async () => {
    const root = document.createElement('div');
    const m = {iam: 'model', count: 0};
    const u = model => model;
    const view = jest.fn(({model, act}) =>
      h('div', [
        h('a', {props: {href: '/foo'}, on: {click: act('foo', 'bar')}}, 'clickme'),
      ]),
    );
    runner(m, u, view, {root});
    await pause();
    // Reset the mock here because we only want to count renders after the initial one
    view.mockReset();
    const e = new Event('click');
    root.querySelector('a').dispatchEvent(e);
    await pause();
    expect(view).not.toHaveBeenCalled();
  });

  it('should not render for each action when actions are chained syncrhonously', async () => {
    const root = document.createElement('div');
    const m = {iam: 'model', count: 0};
    const u = (model, action, ...args) => {
      switch (action) {
        case 'foo':
          const [name] = args;
          return [
            ({...model, iam: name}),
            ['bar'],
          ];
        case 'bar':
          return ({...model, count: model.count + 1});
        default:
          return model;
      }
    };
    const view = jest.fn(({model, act}) =>
      h('div', [
        h('span', model.iam),
        h('span', model.count),
        h('a', {props: {href: '/foo'}, on: {click: act('foo', 'bar')}}, 'clickme'),
      ]),
    );
    runner(m, u, view, {root});
    await pause();
    // Reset the mock here because we only want to count renders after the initial one
    view.mockReset();
    const e = new Event('click');
    root.querySelector('a').dispatchEvent(e);
    await pause();
    expect(view).toHaveBeenCalledTimes(1);
  });

  it('should take middleware functions that modify update behavior', async () => {
    const root = document.createElement('div');
    const m = {iam: 'model'};
    const u = (model, address, name) => ({...model, iam: name});
    const view = ({model, act}) =>
      h('div', [
        h('span', model.iam),
        h('a', {props: {href: '/foo'}, on: {click: act('foo')}}, 'clickme'),
      ]);
    const middleware = fn => (model, address, ...args) =>
      fn(model, address, 'middleware', ...args);
    runner(m, u, view, {root, middleware: [middleware]});
    await pause();
    root.querySelector('a').dispatchEvent(new Event('click'));
    await pause();
    expect(root).toMatchSnapshot();
  });

  it('should allow multiple middleware to be composed', async () => {
    const root = document.createElement('div');
    const m = {iam: 'model'};
    const u = (model, address, name) => ({...model, iam: name});
    const view = ({model, act}) =>
      h('div', [
        h('span', model.iam),
        h('a', {props: {href: '/foo'}, on: {click: act('foo', 'base')}}, 'clickme'),
      ]);
    const middleware1 = fn => (model, address, ...args) =>
      fn(model, address, args[0] + '-middleware1', ...args.slice(1));
    const middleware2 = fn => (model, address, ...args) => {
      const [model1, action] = fn(model, address, ...args);
      return [{...model1, iam: model1.iam + '-middleware2'}, action];
    };
    runner(m, u, view, {root, middleware: [middleware1, middleware2]});
    await pause();
    root.querySelector('a').dispatchEvent(new Event('click'));
    await pause();
    expect(root).toMatchSnapshot();
  });

  it('should accept a plugin that can be initialized when runner is called', () => {
    const plugin = {
      update: jest.fn(x => x),
      init: jest.fn(),
    };
    const root = document.createElement('div');
    const view = () => h('div', 'Hello, root');
    runner(undefined, x => x, view, {root, plugins: [plugin]});
    expect(plugin.init).toHaveBeenCalled();
  });

  it('should allow the plugin to set up using state', () => {
    const m = {iam: 'model'};
    const plugin = {
      update: jest.fn(x => x),
      init: (act, state) => {
        expect(state.model).toBe(m);
      },
    };
    const root = document.createElement('div');
    const view = () => h('div', 'Hello, root');
    runner(m, x => x, view, {root, plugins: [plugin]});
  });

  it('should allow the plugin to send messages to itself', () => {
    const m = {iam: 'model'};
    const plugin = {
      update: jest.fn(x => x),
      init: (act, state) => {
        act('foo', 'bar', 'baz')();
      },
    };
    const root = document.createElement('div');
    const view = () => h('div', 'Hello, root');
    runner(m, x => x, view, {root, plugins: [plugin]});
    expect(plugin.update).toHaveBeenCalledWith(m, 'foo', 'bar', 'baz');
  });
});

