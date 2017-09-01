/**
 * (c) 2017 Hajime Yamasaki Vukelic
 * All rights reserved.
 */

import {PatchFunction} from "../runner";

const pause = (delay: number = 0): Promise<void> => {
  return new Promise((res) => {
    setTimeout(res, delay);
  });
};

const modelSnapshotter = (() => {
  let modelSnapshots: Array<[any, any]> = [];
  return {
    get snapshots() {
      return modelSnapshots;
    },
    clear() {
      modelSnapshots = [];
    },
    middleware(fn: PatchFunction) {
      return (model: any) => {
        const before = model;
        const after = fn(model);
        modelSnapshots.push([before, after]);
        return after;
      };
    },
  };
})();

export {
  pause,
  modelSnapshotter,
};
