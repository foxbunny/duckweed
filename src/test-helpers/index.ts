/**
 * (c) 2017 Hajime Yamasaki Vukelic
 * All rights reserved.
 */

import {PatchFunction} from '../runner';


/**
 * The Promise version of setTimeout, for use in `async` functions
 */
const pause = (delay = 0): Promise<void> =>
  new Promise(res => setTimeout(res, delay));


/**
 * The middleware that captures model states before and after an update
 *
 * Simply install this middleware by adding `modelSnapshotter.middleware` to the
 * list of runner middleware functions.
 *
 * The complete list of snapshots can be obtained by inspecting the `snapshots`
 * property. The current state of the model is available by accessing the
 * `current` property.
 *
 * The snapshotter history can be cleared by calling the `clear()` method.
 */
const modelSnapshotter = (modelSnapshots =>
  ({
    get snapshots() {
      return modelSnapshots;
    },
    get current() {
      return modelSnapshots[modelSnapshots.length - 1][1];
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
  })
)([]);


export {
  pause,
  modelSnapshotter,
};
