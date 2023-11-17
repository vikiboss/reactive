import { useCallback } from "react";
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector.js";

import { subscribe } from "./subscribe.js";
import { deepPreventExtensions, deepFreeze, isObject, IsEqual } from "./utils.js";
import { getSnapshot } from "./snapshot.js";

/**
 * @description use snapshot of the store, optionally with selector or custom `isEqual`
 *
 * @example
 *
 * ```ts
 * // => use snapshot of the entire store
 * const snap = store.useSnapshot();
 * // => use snapshot with `selector`
 * const name = store.useSnapshot((s) => s.name);
 * // => use snapshot with `selector` & custom `isEqual`
 * const count = store.useSnapshot((s) => s.count, Object.is);
 * ```
 */
export function useSnapshot<T extends object, S = T>(
  proxyState: T,
  selector: (snap: T) => S = (snap) => snap as unknown as S,
  isEqual: IsEqual<S> = () => false
) {
  const _subscribe = useCallback((cb) => subscribe(proxyState, cb), [proxyState]);
  const _getSnapshot = useCallback(() => getSnapshot(proxyState), [proxyState]);

  const snapshot = useSyncExternalStoreWithSelector(
    _subscribe,
    _getSnapshot,
    _getSnapshot,
    selector,
    isEqual
  );

  isObject(snapshot) && deepFreeze(snapshot);
  // isObject(snapshot) && deepPreventExtensions(snapshot);

  return snapshot;
}
