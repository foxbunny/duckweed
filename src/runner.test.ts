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

  it('Should render the initial view', () => {
    const root = document.createElement('div');
    const view = () => h('div', 'Hello, root');
    runner(undefined, {}, view, {root});
    expect(root).toMatchSnapshot();
  });

  it('Should pass the model to the view as props', () => {
    const root = document.createElement('div');
    const m = {iam: 'model'};
    const view = ({model}) => {
      expect(model.iam).toBe('model');
      return h('div', `Hello, ${model.iam}`);
    };
    runner(m, {}, view, {root});
    expect(root).toMatchSnapshot();
  });

  it('Should pass the action handler to view as props', () => {
    const root = document.createElement('div');
    const a = {
      foo: jest.fn(x => x),
    };
    const view = ({act}) => {
      act('foo', 'arg')();
      return h('div', `Hello, action`);
    };
    runner(undefined, a, view, {root});
    expect(a.foo).toHaveBeenCalled();
  });

  it('Should have action handler handle events', () => {
    const root = document.createElement('div');
    const a = {
      foo: jest.fn(x => x),
    };
    const view = ({act}) =>
      h('div', [
        h('a', {props: {href: '/foo'}, on: {click: act('foo', 'bar')}}),
      ]);

    runner(undefined, a, view, {root});
    const event = new Event('click');
    root.querySelector('a').dispatchEvent(event);
    expect(a.foo).toHaveBeenCalled();
    expect(a.foo.mock.calls[0][1]).toBe('bar');
    expect(a.foo.mock.calls[0][2]).toBe(event);
  });

  it('Should pass a patcher for action to mutate the model', async () => {
    const root = document.createElement('div');
    const m = 0;
    const a = {
      foo: patcher => {
        patcher(model => model + 1);
      },
    };
    const view = ({act}) =>
      h('div', [
        h('a', {props: {href: '/foo'}, on: {click: act('foo')}}),
      ]);

    runner(m, a, view, {root, middleware: [modelSnapshotter.middleware]});
    const event = new Event('click');
    root.querySelector('a').dispatchEvent(event);
    await pause();
    root.querySelector('a').dispatchEvent(event);
    await pause();
    expect(modelSnapshotter.snapshots).toEqual([[0, 1], [1, 2]]);
  });

  it('Should rerender after action patches the model', async () => {
    const root = document.createElement('div');
    const m = 0;
    const a = {
      foo: patcher => {
        patcher(model => model + 1);
      },
    };
    const view = ({act, model}) =>
      h('div', [
        h('span', '' + model),
        h('a', {props: {href: '/foo'}, on: {click: act('foo')}}),
      ]);

    runner(m, a, view, {root, middleware: [modelSnapshotter.middleware]});
    expect(root).toMatchSnapshot();
    const event = new Event('click');
    root.querySelector('a').dispatchEvent(event);
    await pause();
    root.querySelector('a').dispatchEvent(event);
    await pause();
    expect(root).toMatchSnapshot();
  });

  xit('Should fail loudly if handler is passed a non-existent action', async () => {
    const root = document.createElement('div');
    const view = ({act}) =>
      h('div', [
        h('a', {props: {href: '/foo'}, on: {click: act('foo')}}),
      ]);

    runner(undefined, {}, view, {root});
    root.querySelector('a').dispatchEvent(new Event('click'));
    // FIXME: how do we test this anyway?
  });

  it('Should pass an action handler that can generate a subaction', () => {
    const root = document.createElement('div');

    // Sub-submodule

    const subsuba = {
      baz: jest.fn(),
    };
    const subsubview = ({act}) =>
      h('a', {props: {id: 'baz'}, on: {click: act('baz')}});

    // Submodule

    const suba = {
      bar: jest.fn(),
      delegateSubSub: (patcher, action, ...args) => {
        subsuba[action](patcher, ...args);
      },
    };
    const subview = ({act}) =>
      h('div', [
        h('a', {props: {href: '/foo', id: 'bar'}, on: {click: act('bar')}}),
        subsubview({act: act.as('delegateSubSub')}),
      ]);

    // Main module

    const a = {
      delegateSub: (patcher, action, ...args) => {
        suba[action](patcher, ...args);
      },
    };
    const view = ({act}) =>
      h('div', [
        subview({act: act.as('delegateSub')}),
      ]);

    runner(undefined, a, view, {root});

    root.querySelector('#bar').dispatchEvent(new Event('click'));
    expect(suba.bar).toHaveBeenCalled();

    root.querySelector('#baz').dispatchEvent(new Event('click'));
    expect(subsuba.baz).toHaveBeenCalled();
  });

  it('Should provide a way to create scoped patchers', async () => {
    const root = document.createElement('div');

    const counterModel = () => ({
      count: 0,
    });

    const counterActions = {
      increment(patcher) {
        patcher(model => ({
          count: model.count + 1,
        }));
      },
    };

    const counterView = ({model, act, id}) =>
      h('div', {props: {id}, on: {click: act('increment')}}, `count: ${model.count}`);

    const listModel = () => ({
      counters: [
        counterModel(),
        counterModel(),
        counterModel(),
        counterModel(),
      ],
      total: 0,
    });

    const listActions = {
      updateCounter(patcher, counterId, counterAction, ...args) {
        const sub = patcher.as(['counters', counterId], model => ({
          ...model,
          total: model.counters.reduce((s, c) => s + c.count, 0),
        }));
        counterActions[counterAction](sub, ...args);
      },
    };

    const listView = ({model, act}) => (
      h('div', model.counters.map((c, id) => counterView({
        act: act.as('updateCounter', id),
        id: `counter-${id}`,
        model: c,
      })).concat(h('div', `total: ${model.total}`)))
    );

    const rootModel = () => ({
      list: listModel(),
    });

    const rootActions = {
      updateList(patcher, listAction, ...args) {
        const scoped = patcher.as(['list']);
        listActions[listAction](scoped, ...args);
      },
    };

    const rootView = ({model, act}) => (
      listView({model: model.list, act: act.as('updateList')})
    );

    runner(rootModel(), rootActions, rootView, {root, middleware: [modelSnapshotter.middleware]});

    root.querySelector('#counter-0').dispatchEvent(new Event('click'));
    await pause();
    root.querySelector('#counter-1').dispatchEvent(new Event('click'));
    await pause();
    root.querySelector('#counter-2').dispatchEvent(new Event('click'));
    await pause();
    expect(modelSnapshotter.current.list.total).toBe(3);
    expect(modelSnapshotter.snapshots).toMatchSnapshot();
  });

  it('Should accept a plugin which can control the app from within the runner', async () => {
    const root = document.createElement('div');
    const m = {
      name: 'Test',
    };
    const v = ({model}) => h('div', model.name);
    // Fake event system
    const contraption = {
      listener: undefined,
      listen(fn: any) {
        this.listener = fn;
      },
      trigger(data: any) {
        this.listener(data);
      },
    };
    const plugin = {
      actions: {
        pluginAction(patcher: any, data: any) {
          patcher(model => ({
            name: data,
          }));
        },
      },
      init(act: any, state: any) {
        contraption.listen(data => act('pluginAction', data));
        expect(state.model).toBe(m);
        expect(state.vnodes).toBe(root);
      },
    };
    runner(m, {}, v, {plugins: [plugin], root});
    contraption.trigger('Pluginized');
    await pause();
    expect(root).toMatchSnapshot();
  });

  it('Should take an alternative patch function', () => {
    const root = document.createElement('div');
    const p = jest.fn();
    const v = () => h('div');
    runner(undefined, {}, v, {patch: p, root});
    expect(p).toHaveBeenCalledWith(root, v());
  });

  it('Should not call the render function if patch returns model as is', async () => {
    const root = document.createElement('div');
    const p = jest.fn(patch);
    const m = {foo: 'bar'};
    const a = {foo: patcher => patcher(model => model)};
    const v = ({act}) => h('div', {on: {click: act('foo')}});
    runner(m, a, v, {patch: p, root});
    // First clear the mocks because it's guaranteed to be called once
    p.mockReset();
    root.dispatchEvent(new Event('click'));
    await pause();
    expect(p).not.toHaveBeenCalled();
  });
});

