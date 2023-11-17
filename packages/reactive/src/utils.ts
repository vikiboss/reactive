import { isRef } from "./ref";

export const SNAPSHOT = Symbol("SNAPSHOT");
export const LISTENERS = Symbol("LISTENERS");
export const REACTIVE = Symbol("REACTIVE");

export const isProduction = process.env.NODE_ENV === "production";
export const REACTIVE_STORE_CHANGED = "REACTIVE_STORE_CHANGED";

export const isObject = (x: unknown): x is object => typeof x === "object" && x !== null;

export const createObjectFromPrototype = <T extends object>(target: T): T => {
  return Array.isArray(target) ? [] : Object.create(Object.getPrototypeOf(target));
};

export const canProxy = (x: unknown) =>
  isObject(x) &&
  !isRef(x) &&
  (Array.isArray(x) || !(Symbol.iterator in x)) &&
  !(x instanceof WeakMap) &&
  !(x instanceof WeakSet) &&
  !(x instanceof Error) &&
  !(x instanceof Number) &&
  !(x instanceof Date) &&
  !(x instanceof String) &&
  !(x instanceof RegExp) &&
  !(x instanceof ArrayBuffer);

export function deepPreventExtensions(obj: any) {
  if (isRef(obj)) return;
  Object.preventExtensions(obj);

  Reflect.ownKeys(obj).forEach((key) => {
    const value = Reflect.get(obj, key);
    if (isRef(value)) return;
    if (isObject(value)) deepPreventExtensions(value);
  });
}

export function deepFreeze(obj: any) {
  if (isRef(obj)) return;
  Object.freeze(obj);

  Reflect.ownKeys(obj).forEach((key) => {
    const value = Reflect.get(obj, key);
    if (isRef(value)) return;
    if (isObject(value)) deepFreeze(value);
  });
}

export type IsEqual<T> = (pre: T, next: T) => boolean;

export type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

export type DeepWritable<T> = {
  -readonly [K in keyof T]: T[K] extends object ? DeepWritable<T[K]> : T[K];
};

export type DeepExpandType<T> = {
  [K in keyof T]: T[K] extends object ? DeepExpandType<T[K]> : T[K];
};
