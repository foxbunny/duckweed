/**
 * (c) 2017 Hajime Yamasaki Vukelic
 * All rights reserved.
 */

import * as snabbdom from "snabbdom";
import h from "snabbdom/h";
import eventlisteners from "snabbdom/modules/eventlisteners";
import props from "snabbdom/modules/props";

import runner from "./runner";

import {modelSnapshotter, pause} from "./__helpers__/helpers";

const patch = snabbdom.init([eventlisteners, props]);

describe("runner", () => {
  beforeEach(() => modelSnapshotter.clear());

  it("Should render the initial view", () => {
    const root = document.createElement("div");
    const view = () => h("div", "Hello, root");
    runner(undefined, {}, view, {root});
    expect(root).toMatchSnapshot();
  });

  it("Should pass the model to the view as props", () => {
    const root = document.createElement("div");
    const m = {iam: "model"};
    const view = ({model}) => {
      expect(model.iam).toBe("model");
      return h("div", `Hello, ${model.iam}`);
    };
    runner(m, {}, view, {root});
    expect(root).toMatchSnapshot();
  });

  it("Should pass the action handler to view as props", () => {
    const root = document.createElement("div");
    const a = {
      foo: jest.fn((x) => x),
    };
    const view = ({act}) => {
      act("foo", "arg")();
      return h("div", `Hello, action`);
    };
    runner(undefined, a, view, {root});
    expect(a.foo).toHaveBeenCalled();
  });

  it("Should have action handler handle events", () => {
    const root = document.createElement("div");
    const a = {
      foo: jest.fn((x) => x),
    };
    const view = ({act}) => {
      return h("div", [
        h("a", {props: {href: "/foo"}, on: {click: act("foo", "bar")}}),
      ]);
    };
    runner(undefined, a, view, {root});
    const event = new Event("click");
    root.querySelector("a").dispatchEvent(event);
    expect(a.foo).toHaveBeenCalled();
    expect(a.foo.mock.calls[0][1]).toBe("bar");
    expect(a.foo.mock.calls[0][2]).toBe(event);
  });

  it("Should pass a patcher for action to mutate the model", async () => {
    const root = document.createElement("div");
    const m = 0;
    const a = {
      foo: (patcher) => {
        patcher((model) => model + 1);
      },
    };
    const view = ({act}) => {
      return h("div", [
        h("a", {props: {href: "/foo"}, on: {click: act("foo")}}),
      ]);
    };
    runner(m, a, view, {root, middleware: [modelSnapshotter.middleware]});
    const event = new Event("click");
    root.querySelector("a").dispatchEvent(event);
    await pause();
    root.querySelector("a").dispatchEvent(event);
    await pause();
    expect(modelSnapshotter.snapshots).toEqual([[0, 1], [1, 2]]);
  });

  xit("Should fail loudly if handler is passed a non-existent action", async () => {
    const root = document.createElement("div");
    const view = ({act}) => {
      return h("div", [
        h("a", {props: {href: "/foo"}, on: {click: act("foo")}}),
      ]);
    };
    runner(undefined, {}, view, {root});
    root.querySelector("a").dispatchEvent(new Event("click"));
    // FIXME: how do we test this anyway?
  });

  it("Should pass an action handler that can generate a subaction", () => {
    const root = document.createElement("div");

    // Submodule

    const suba = {
      bar: jest.fn(),
    };
    const subview = ({act}) => {
      return h("div", [
        h("a", {props: {href: "/foo"}, on: {click: act("bar")}}),
      ]);
    };

    // Main module

    const a = {
      foo: () => {
        suba.bar();
      },
    };
    const view = ({act}) => {
      return h("div", [
        subview({act: act.as("foo")}),
      ]);
    };

    runner(undefined, {}, view, {root});
    root.querySelector("a").dispatchEvent(new Event("click"));
  });
});
