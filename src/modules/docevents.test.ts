/**
 * (c) 2017 Hajime Yamasaki Vukelic
 * All rights reserved.
 */

import docevents from './docevents';

import * as snabbdom from 'snabbdom';
import h from 'snabbdom/h';

import {pause} from '../test-helpers';

const patch = snabbdom.init([docevents]);

describe('docevents module', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('Should handle a click that happens on the document', () => {
    const callback = jest.fn();
    const r = document.createElement('div');
    document.body.appendChild(r);
    patch(r, h('div', {doc: {click: callback}}));
    document.body.dispatchEvent(new Event('click', {bubbles: true}));
    expect(callback).toHaveBeenCalled();
  });

  it('Should handle a click that happens inside or on the element', () => {
    const callback = jest.fn();
    const r = document.createElement('div');
    document.body.appendChild(r);
    patch(r,
      h('div.root', {doc: {click: callback}}, [
        h('span.inner'),
      ]),
    );
    const inner = document.querySelector('span.inner') as Element;
    const el = document.querySelector('div.root') as Element;
    inner.dispatchEvent(new Event('click', {bubbles: true}));
    el.dispatchEvent(new Event('click', {bubbles: true}));
    expect(callback).toHaveBeenCalled();
  });

  it('Can swap handlers on update', async () => {
    const cb1 = jest.fn();
    const cb2 = jest.fn();
    (cb1 as any).bogus = 'cb1';
    (cb2 as any).bogus = 'cb2';
    const r = document.createElement('div');
    document.body.appendChild(r);
    const vn = patch(r, h('div', {doc: {click: cb1}}));
    await pause();
    patch(vn, h('div', {doc: {click: cb2}}));
    document.body.dispatchEvent(new Event('click', {bubbles: true}));
    expect(cb1).not.toHaveBeenCalled();
    expect(cb2).toHaveBeenCalled();
  });
});
