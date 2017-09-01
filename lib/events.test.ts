/**
 * (c) 2017 Hajime Yamasaki Vukelic
 * All rights reserved.
 */

import * as snabbdom from "snabbdom";
import h from "snabbdom/h";
import eventlisteners from "snabbdom/modules/eventlisteners";
import props from "snabbdom/modules/props";

import * as e from "./events";

const patch = snabbdom.init([eventlisteners, props]);

const scaffold = (elm: string, cfg: {[key: string]: any}) => {
  const vnode = patch(document.createElement("div"), h(elm, cfg));
  (vnode.elm as any).vnode = vnode;
  return vnode.elm;
};

describe("events", () => {
  it("Should handle input events", () => {
    const handler = jest.fn();
    const r = scaffold("input", {
      on: {input: e.from(e.inputEvent, handler)},
      props: {value: "my input"},
    });
    r.dispatchEvent(new Event("input"));
    expect(handler).toHaveBeenCalledWith("my input");
  });

  it("Should handle checkbox events", () => {
    const handler = jest.fn();
    const r = scaffold("input", {
      on: {change: e.from(e.checkboxEvent, handler)},
      props: {value: "my checkbox", checked: false, type: "checkbox"},
    });
    r.dispatchEvent(new Event("change"));
    expect(handler).toHaveBeenCalledWith(false, "my checkbox");
  });

  it("Should handle many events automatically", () => {
    const handler = jest.fn();
    const r1 = scaffold("input", {
      on: {
        input: e.from(e.auto, handler),
      },
      props: {value: "my value"},
    });
    const r2 = scaffold("input", {
      on: {
        change: e.from(e.auto, handler),
      },
      props: {type: "checkbox", value: "my value", checked: true},
    });
    r1.dispatchEvent(new Event("input"));
    r2.dispatchEvent(new Event("change"));
    expect(handler.mock.calls).toMatchSnapshot();
  });
});
