import {
  LISTENERS,
  REACTIVE,
  SNAPSHOT,
  canProxy,
  createObjectFromPrototype,
  isObject,
} from "./utils.js";
import { isRef } from "./ref.js";
import { createSnapshot } from "./snapshot.js";
import { subscribe } from "./subscribe.js";

type Listener = (version?: number) => void;

let globalVersion = 1;

export function proxy<T extends object>(initState: T): T {
  let version = globalVersion;

  const listeners = new Set<Listener>();
  const propListenerMap = new Map<PropertyKey, Listener>();

  const notifyUpdate = (nextVersion = ++globalVersion) => {
    if (version !== nextVersion) {
      version = nextVersion;
      listeners.forEach((cb) => cb());
    }
  };

  const getPropListener = (prop: PropertyKey) => {
    let listener = propListenerMap.get(prop);
    if (!listener) {
      listener = (nextVersion?: number) => notifyUpdate(nextVersion);
      propListenerMap.set(prop, listener);
    }
    return listener;
  };

  const popPropListener = (prop: PropertyKey) => {
    const listener = propListenerMap.get(prop);
    propListenerMap.delete(prop);
    return listener;
  };

  // create empty object from initState's prototype
  const baseObject = createObjectFromPrototype(initState);

  let hasInitiated = false;

  const proxyState = new Proxy(baseObject, {
    get(target, prop, receiver) {
      if (prop === LISTENERS) return listeners;
      if (prop === SNAPSHOT) return createSnapshot(target, version);

      return Reflect.get(target, prop, receiver);
    },
    set(target, prop, value, receiver) {
      const preValue: any = Reflect.get(target, prop, receiver);

      // if current value has LISTENERS , delete child listeners
      const childListeners = preValue?.[LISTENERS];
      if (childListeners) childListeners.delete(popPropListener(prop));

      let nextValue = value;

      if (!isObject(nextValue)) {
        // "return true" means `set` operation is successfully executed, but won't modify value & notify update
        if (Object.is(preValue, nextValue)) return true;
      }

      const isUpdatingRef = hasInitiated && isRef(preValue);

      if (isUpdatingRef) {
        throw new Error("the original ref object should not be assigned to another value");
      }

      if (nextValue?.[LISTENERS]) {
        subscribe(nextValue, getPropListener(prop));
      } else if (canProxy(nextValue)) {
        nextValue = proxy(nextValue);
        nextValue[REACTIVE] = true;
        subscribe(nextValue, getPropListener(prop));
      }

      const success = Reflect.set(target, prop, nextValue, receiver);
      success && notifyUpdate();
      return success;
    },
    deleteProperty(target: T, prop: string | symbol) {
      const childListeners = Reflect.get(target, prop)?.[LISTENERS];
      if (childListeners) childListeners.delete(popPropListener(prop));

      const success = Reflect.deleteProperty(target, prop);
      success && notifyUpdate();
      return success;
    },
  });

  Reflect.ownKeys(initState).forEach((key) => {
    proxyState[key] = initState[key];
  });

  hasInitiated = true;

  return proxyState;
}
