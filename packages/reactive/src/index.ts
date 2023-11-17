import { ref } from "./ref.js";
import { proxy } from "./proxy.js";
import { subscribe } from "./subscribe.js";
import { useSnapshot } from "./use-snapshot.js";
import { isProduction } from "./utils.js";
import { enableDevtool } from "./devtool.js";

import type { Config as ReduxDevtoolConfig } from "@redux-devtools/extension";
import type { DeepExpandType, IsEqual } from "./utils.js";

/** redux devtool options, if set, will enable redux devtool */
export type DevtoolOptions = DeepExpandType<
  {
    /** the instance name to be showed on the monitor page */
    name: string;
    /** @default false */
    forceEnable?: boolean;
  } & ReduxDevtoolConfig
>;

/** initial options for creation */
export interface CreateOptions {
  devtool?: DevtoolOptions;
}

function create<T extends object>(initState: T, options?: CreateOptions) {
  const state = proxy(initState);

  const restore = () => {
    const _ = structuredClone(initState);
    Object.keys(_).forEach((k) => {
      state[k] = _[k];
    });
  };

  let disableDevtool: false | (() => void) = () => {};

  if (options?.devtool) {
    if (!options?.devtool.name) {
      throw new Error("devtool.name is required");
    }

    const isForceEnable = !!options?.devtool?.forceEnable;

    if (!isProduction || isForceEnable) {
      disableDevtool = enableDevtool(state, options.devtool, restore);
    }
  }

  const store = {
    mutate: state,
    useSnapshot: <S = T>(selector?: (state: T) => S, isEqual?: IsEqual<S>) => {
      return useSnapshot(state, selector, isEqual);
    },
    subscribe: (cb: () => unknown) => subscribe(state, cb),
    restore,
  } as const;

  Object.freeze(store);

  return store;
}

export { create, ref, proxy, subscribe, useSnapshot };
