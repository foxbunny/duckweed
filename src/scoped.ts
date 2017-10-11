/**
 * (c) 2017 Hajime Yamasaki Vukelic
 * All rights reserved.
 */

type Scope = Array<string | number>;


/**
 * Retrieves the value within an object, at given scope.
 */
const get = (scope: Scope, object) =>
  scope.length
    ? get(scope.slice(1), object[scope[0]])
    : object;


/**
 * Returns a copy of the object with the value assigned to the property at specified scope
 */
const set = (scope: Scope, val: any, object: any = {}): any => {
  if (scope.length === 0) {
    return val;
  }
  const [first, ...rest] = scope;
  return Array.isArray(object)
    ? (copy => {
        copy[first as number] = set(rest, val, copy[first as number]);
        return copy;
      })(object.slice(0))
    : {...object, [first]: set(rest, val, object[first])};
};


/**
 * Patch a portion of an object or an array using a function
 */
const transform = (scope: Scope, fn: (arg: any) => any, object: any): any => {
  const orig = get(scope, object);
  const updated = fn(orig);
  return orig === updated
    ? object
    : set(scope, updated, object);
};

export {
  Scope,
  get,
  set,
  transform,
};
