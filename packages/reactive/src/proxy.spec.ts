import { proxy } from "./proxy.js";
import { describe, it, expect, vitest } from "vitest";
import { LISTENERS, SNAPSHOT } from "./utils.js";
import { getSnapshot } from "./snapshot.js";

const runMacroTask = (fn: Function) => setTimeout(fn, 0);

describe("proxy", () => {
  it("should be defined", () => {
    expect(proxy).toBeDefined();
  });

  it("should return a reactive proxy object", () => {
    const state = { count: 0 };
    const reactiveState = proxy(state);

    expect(reactiveState.count).toBe(0);
  });

  it("should update the reactive state when a property is set", () => {
    const state = { count: 0 };
    const reactiveState = proxy(state);

    reactiveState.count = 5;
    runMacroTask(() => expect(reactiveState.count).toBe(5));
  });

  it("should notify listeners when a property is set", () => {
    const state = { count: 0 };
    const reactiveState = proxy(state);
    const listener = vitest.fn();

    reactiveState[LISTENERS].add(listener);
    reactiveState.count = 10;

    runMacroTask(() => {
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith();
    });
  });

  it("should create a frozen snapshot with recursive properties", () => {
    const initState = { person: { name: "John" } };
    const proxyObj = proxy(initState);
    const snapshot = proxyObj[SNAPSHOT];

    expect(snapshot).toMatchObject(initState);
  });

  it("should create a snapshot of the state", () => {
    const state = { count: 0 };
    const reactiveState = proxy(state);

    const snapshot1 = reactiveState[SNAPSHOT];
    expect(snapshot1.count).toBe(0);

    reactiveState.count = 5;

    const snapshot2 = reactiveState[SNAPSHOT];

    runMacroTask(() => {
      expect(snapshot2.count).toBe(5);

      // Snapshots should be different object references
      expect(snapshot1).not.toBe(snapshot2);
    });
  });

  it("should handle nested objects and arrays", () => {
    const state = { nested: { array: [1, 2, 3] } };
    const reactiveState = proxy(state);

    expect(Array.isArray(reactiveState.nested.array)).toBe(true);

    reactiveState.nested.array.push(4);

    expect(reactiveState.nested.array.length).toBe(4);
    expect(reactiveState.nested.array[3]).toBe(4);
  });

  it("should delete a property from the state", () => {
    const state = { count: 0 };
    const reactiveState = proxy(state);

    delete reactiveState.count;

    expect(reactiveState.count).toBeUndefined();
  });

  it("should notify listeners when a property is deleted", () => {
    const state = { count: 0 };
    const reactiveState = proxy(state);
    const listener = vitest.fn();

    reactiveState[LISTENERS].add(listener);
    delete reactiveState.count;

    runMacroTask(() => {
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith();
    });
  });

  it("should handle nested listeners correctly", () => {
    const state = { nested: { prop: 0 } };
    const reactiveState = proxy(state);
    const listener1 = vitest.fn();
    const listener2 = vitest.fn();

    reactiveState.nested[LISTENERS].add(listener1);
    reactiveState[LISTENERS].add(listener2);

    reactiveState.nested.prop = 5;

    runMacroTask(() => {
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });
  });

  it("should be handled correctly deletion logic .", () => {
    const state = { nested: { prop: 0 } };
    const reactiveState = proxy(state);
    const listener1 = vitest.fn();
    const listener2 = vitest.fn();

    reactiveState.nested[LISTENERS].add(listener1);
    reactiveState[LISTENERS].add(listener2);

    delete reactiveState.nested;

    runMacroTask(() => {
      expect(listener1).not.toBeCalled();
      expect(listener2).toHaveBeenCalledTimes(1);
    });
  });

  it("should be handled correctly Use cached listeners.", () => {
    const state = { nested: { prop: 0 } };
    const reactiveState = proxy(state);
    const listener1 = vitest.fn();

    reactiveState.nested[LISTENERS].add(listener1);

    reactiveState.nested = reactiveState.nested;
    reactiveState.nested.prop = 2;

    runMacroTask(() => {
      expect(listener1).toHaveBeenCalledTimes(1);
    });
  });

  it("should not notify listeners when a property is not truly changed", () => {
    const state = { count: 0 };
    const reactiveState = proxy(state);
    const listener = vitest.fn();

    reactiveState[LISTENERS].add(listener);
    reactiveState.count = 0;

    runMacroTask(() => {
      expect(listener).toHaveBeenCalledTimes(0);
    });
  });

  describe("getSnapshot", () => {
    it("should get snapshot from proxyState", () => {
      const proxyState = { [SNAPSHOT]: "snapshot" } as any;
      expect(getSnapshot(proxyState)).toBe("snapshot");
    });

    it("should return undefined if no snapshot", () => {
      const proxyState = {} as any;
      expect(getSnapshot(proxyState)).toBeUndefined();
    });
  });
});
