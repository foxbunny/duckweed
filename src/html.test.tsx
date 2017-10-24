/**
 * (c) 2017 Hajime Yamasaki Vukelic
 * All rights reserved.
 */

import html from './html';

describe('html', () => {
  it('Should render a normal VNODE', () => {
    const vn = html('div');
    expect(vn).toMatchSnapshot();
  });

  it('Should accept normal DOM properties', () => {
    const vn = html('div', {title: 'undivided'});
    expect(vn).toMatchSnapshot();
  });

  it('Should pass keys', () => {
    const vn = html('div', {key: "don't change"});
    expect(vn).toMatchSnapshot();
  });

  it('Should pass event handlers', () => {
    const vn = html('div', {on: {click: jest.fn()}});
    expect(vn).toMatchSnapshot();
  });

  it('Should also accept shorthands for handlers', () => {
    const vn = html('div', {'on-click': jest.fn()});
    expect(vn).toMatchSnapshot();
  });

  it('Should accept hooks', () => {
    const vn = html('div', {hook: {init: jest.fn()}});
    expect(vn).toMatchSnapshot();
  });

  it('Should also accept shorthands for hooks', () => {
    const vn = html('div', {'hook-init': jest.fn()});
    expect(vn).toMatchSnapshot();
  });

  it('Should be able to render functions', () => {
    const vn = html(() => html('div'));
    expect(vn).toMatchSnapshot();
  });

  it('Should pass props to functions', () => {
    const v = ({foo}) => html('div', {}, foo);
    const vn = html(v, {foo: 'bar'});
    expect(vn).toMatchSnapshot();
  });

  it('Should pass a key to root vnode in a function', () => {
    const v = () => html('div');
    const vn = html(v, {key: "don't change"});
    expect(vn).toMatchSnapshot();
  });

  it('Should not freak out of props is null', () => {
    const vn = html('div', null);
    expect(vn).toMatchSnapshot();
    const vn2 = html(() => html('div'), null);
    expect(vn2).toMatchSnapshot();
  });

  it('Should render children', () => {
    const vn = html('div', {}, [
      html('span', {}, 'Hello'),
      html('span', {}, 'world'),
    ]);
    expect(vn).toMatchSnapshot();
  });
});

describe('html with jsx', () => {
  it('Should render JSX just fine', () => {
    const vn = (
      <div>Foo</div>
    );
    expect(vn).toMatchSnapshot();
  });

  it('Should handle children', () => {
    const vn = (
      <div><span>Foo</span></div>
    );
    expect(vn).toMatchSnapshot();
  });

  it('Should handle mixed text/vnode children', () => {
    const vn = (
      <p>
        go to
        <a href="#foo">foo</a>
      </p>
    );
    expect(vn).toMatchSnapshot();
  });

  it('Should handle arrays', () => {
    const a = [1, 2, 3];
    const vn = (
      <ul>
        {a.map(x => <li>{x}</li>)}
      </ul>
    );
    expect(vn).toMatchSnapshot();
  });

  it('should be able to add attributes to elements', () => {
    const vn = (
      <label _for="something">
        <input _id="something" />
      </label>
    );
    expect(vn).toMatchSnapshot();
  });
});
