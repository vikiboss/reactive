import { isRef } from "./ref.js";
import { REACTIVE, SNAPSHOT, createObjectFromPrototype } from "./utils.js";

const snapshotCache = new WeakMap<object, [version: number, snapshot: unknown]>();
const proxyStateMap = new WeakMap<object, object>();

export function getSnapshot<T extends object>(proxyState: T): T {
  return proxyState[SNAPSHOT];
}

export const createSnapshot = <T extends object>(target: T, version: number) => {
  // if cache exists and version is equal, use cache
  const cache = snapshotCache.get(target);
  if (cache?.[0] === version) return cache[1] as T;

  // create snapshot by target prototype
  const snapshot = createObjectFromPrototype(target);
  snapshotCache.set(target, [version, snapshot]);

  Reflect.ownKeys(target).forEach((key) => {
    if (key === REACTIVE) return;

    const value: any = Reflect.get(target, key, target);

    if (isRef(value)) {
      snapshot[key] = value;
    } else if (value?.[REACTIVE]) {
      // if it has REACTIVE symbol, it means it's a reactive proxy object
      snapshot[key] = getSnapshot(value);
    } else {
      snapshot[key] = value;
    }
  });

  return snapshot;
};
