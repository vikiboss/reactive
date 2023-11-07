import { useCallback, useRef } from "react";
import { createProxy, isChanged } from "proxy-compare";
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector.js";
import { getSnapshot } from "./utils.js";
import { subscribe } from "./subscribe.js";

import type { DeepReadonly } from "./utils.js";

export interface SnapshotOptions {
  sync?: boolean;
}

const globalTargetCache = new WeakMap<object, any>();
const globalProxyCache = new WeakMap<object, any>();

export function useSnapshot<T extends object>(
  proxyState: T,
  options?: SnapshotOptions
): DeepReadonly<T> {
  const { sync: updateInSync = false } = options || {};
  const affected = new WeakMap();
  const lastAffected = useRef<typeof affected>(affected);

  const _subscribe = useCallback(
    (callback: () => void) => subscribe(proxyState, callback, updateInSync),
    [proxyState, updateInSync]
  );

  const _getSnapshot = useCallback(() => getSnapshot(proxyState), [proxyState]);

  const snapshot = useSyncExternalStoreWithSelector(
    _subscribe,
    _getSnapshot,
    _getSnapshot,
    (snap) => snap,
    (a, b) => !isChanged(a, b, lastAffected.current, new WeakMap())
  );

  lastAffected.current = affected;

  return createProxy(snapshot, affected, globalProxyCache, globalTargetCache);
}
