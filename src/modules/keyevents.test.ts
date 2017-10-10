/**
 * (c) 2017 Hajime Yamasaki Vukelic
 * All rights reserved.
 */

import keyevents from './keyevents';

import * as snabbdom from 'snabbdom';
import h from 'snabbdom/h';

import {pause} from '../test-helpers';


const patch = snabbdom.init([keyevents]);


describe('keyevents module', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  [
    {keyName: 'backspace', keyCode: 8, callback: jest.fn()},
    {keyName: 'tab', keyCode: 9, callback: jest.fn()},
    {keyName: 'enter', keyCode: 13, callback: jest.fn()},
    {keyName: 'pageup', keyCode: 33, callback: jest.fn()},
    {keyName: 'pagedown', keyCode: 34, callback: jest.fn()},
    {keyName: 'left', keyCode: 37, callback: jest.fn()},
    {keyName: 'up', keyCode: 38, callback: jest.fn()},
    {keyName: 'right', keyCode: 39, callback: jest.fn()},
    {keyName: 'down', keyCode: 40, callback: jest.fn()},
    {keyName: 'delete', keyCode: 46, callback: jest.fn()},
  ].forEach(({keyName, keyCode, callback}) => {
    it(`Should handle a key event for specific keys, like '${keyName}'`, () => {
      const r = document.createElement('div');
      document.body.appendChild(r);
      patch(r, h('div', {keys: {[keyName]: callback}}));
      // NOTE: TypeScript does not support `keyCode` in KeyboardEventInit, but
      // it's a valid field, so we're forcing it by declaring it an `any`.
      const event = new KeyboardEvent('keyup', {keyCode} as any);
      document.querySelector('div').dispatchEvent(event);
      expect(callback).toHaveBeenCalled();
    });
  });

  [
    {keyName: 'backspace', callback: jest.fn()},
    {keyName: 'tab', callback: jest.fn()},
    {keyName: 'enter', callback: jest.fn()},
    {keyName: 'pageup', callback: jest.fn()},
    {keyName: 'pagedown', callback: jest.fn()},
    {keyName: 'left', callback: jest.fn()},
    {keyName: 'up', callback: jest.fn()},
    {keyName: 'right', callback: jest.fn()},
    {keyName: 'down', callback: jest.fn()},
    {keyName: 'delete', callback: jest.fn()},
  ].forEach(({keyName, callback}) => {
    it(`Sholdn't trigger for wrong code like 1 for '${keyName}'`, () => {
      const r = document.createElement('div');
      document.body.appendChild(r);
      patch(r, h('div', {keys: {[keyName]: callback}}));
      // NOTE: TypeScript does not support `keyCode` in KeyboardEventInit, but
      // it's a valid field, so we're forcing it by declaring it an `any`.
      const event = new KeyboardEvent('keyup', {keyCode: 1} as any);
      document.querySelector('div').dispatchEvent(event);
      expect(callback).not.toHaveBeenCalled();
    });
  });

  it('Can swap handlers on update', async () => {
    const cb1 = jest.fn();
    const cb2 = jest.fn();
    const r = document.createElement('div');
    document.body.appendChild(r);
    const vn = patch(r, h('div', {keys: {enter: cb1}}));
    await pause();
    patch(vn, h('div', {keys: {enter: cb2}}));
    const event = new KeyboardEvent('keyup', {keyCode: 13} as any);
    r.dispatchEvent(event);
    expect(cb1).not.toHaveBeenCalled();
    expect(cb2).toHaveBeenCalled();
  });
});
