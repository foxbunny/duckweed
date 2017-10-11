/**
 * (c) 2017 Hajime Yamasaki Vukelic
 * All rights reserved.
 */

import * as scoped from './scoped';

describe('scoped', () => {
  it('should be able to retrieve an object as specified scope', () => {
    const o = {foo: {bar: {baz: 12}}};
    expect(scoped.get(['foo', 'bar'], o)).toEqual({baz: 12});
    expect(scoped.get(['foo', 'bar', 'baz'], o)).toBe(12);
    expect(scoped.get(['foo', 'baz'], o)).toBeUndefined();
    expect(scoped.get(['bar'], o)).toBeUndefined();
  });

  it('should be able to retrieve objects from arrays', () => {
    const o = {foo: [{bar: 1, baz: 'a'}, {bar: 2, baz: 'b'}]};
    expect(scoped.get(['foo', 1, 'baz'], o)).toBe('b');
  });

  it('should be able to set an object at specified scope', () => {
    const o = {foo: {bar: {baz: 12}}};
    expect(scoped.set(['foo', 'bar', 'baz'], 11, o)).toEqual({foo: {bar: {baz: 11}}});
    expect(scoped.set(['foo', 'bar', 'foo'], 11, o)).toEqual({foo: {bar: {baz: 12, foo: 11}}});
    expect(scoped.set(['foo', 'foo'], {bar: 10}, o)).toEqual({foo: {bar: {baz: 12}, foo: {bar: 10}}});
  });

  it('should be able to set within arrays', () => {
    const o = {foo: [1, 2, 3]};
    expect(scoped.set(['foo', 1], 10, o))
      .toEqual({foo: [1, 10, 3]});
  });

  it('should recreate the path using objects when using set()', () => {
    const o = {foo: {bar: {baz: 12}}};
    expect(scoped.set(['foo', 2, 'bar'], 12, o))
      .toEqual({foo: {bar: {baz: 12}, 2: {bar: 12}}});
  });

  it('should be able to transform an object at given scope', () => {
    const o = {foo: {bar: {baz: 12}}};
    const inc = x => x + 1;
    expect(scoped.transform(['foo', 'bar', 'baz'], inc, o))
      .toEqual({foo: {bar: {baz: 13}}});
    const safeInc = x => x ? x + 1 : 0;
    expect(scoped.transform(['foo', 'bar', 'foo'], safeInc, o))
      .toEqual({foo: {bar: {baz: 12, foo: 0}}});
  });

  it('should optimize when transform function returns an identical object', () => {
    const o = {foo: {bar: {baz: 12}}};
    const r = scoped.transform(['foo', 'bar'], x => x, o);
    expect(r).toBe(o);
  });
});
