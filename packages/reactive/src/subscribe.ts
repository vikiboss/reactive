import { LISTENERS } from "./utils.js";

export function subscribe<T extends object>(proxyObject: T, callback: () => void) {
  proxyObject[LISTENERS].add(callback);

  return () => {
    proxyObject[LISTENERS].delete(callback);
  };
}
