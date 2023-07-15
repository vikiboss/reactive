export const isObject = (x: unknown): x is object =>
  typeof x === "object" && x !== null;

export const canProxy = (x: unknown) =>
  isObject(x) &&
  (Array.isArray(x) || !(Symbol.iterator in x)) &&
  !(x instanceof WeakMap) &&
  !(x instanceof WeakSet) &&
  !(x instanceof Error) &&
  !(x instanceof Number) &&
  !(x instanceof Date) &&
  !(x instanceof String) &&
  !(x instanceof RegExp) &&
  !(x instanceof ArrayBuffer);

export const createObjectFromPrototype = <T extends object>(target: T): T => {
  return Array.isArray(target)
    ? []
    : Object.create(Object.getPrototypeOf(target));
};

export const SNAPSHOT = Symbol();
export const LISTENERS = Symbol();
export const REACTIVE = Symbol();

export function getSnapshot<T extends object>(proxyState: T): T {
  return proxyState[SNAPSHOT];
}