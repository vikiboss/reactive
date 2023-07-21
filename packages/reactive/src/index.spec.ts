import { describe, it, expect, vitest } from "vitest";
import { create, proxy, subscribe, useSnapshot } from "./index";

describe("index", () => {
  it("create, proxy, useSnapshot and subscribe should be defined", () => {
    expect(create).toBeDefined();
    
    expect(proxy).toBeDefined();
    expect(subscribe).toBeDefined();
    expect(useSnapshot).toBeDefined();
  });

  it("should return current, useSnapshot and subscribe by current state", () => {
    const store = create({
      name: "Pikachu",
      address: {
        city: "NanJing",
      },
    });

    expect(store.current).toMatchObject({
      name: "Pikachu",
      address: {
        city: "NanJing",
      },
    });

    const snapshot = store.useSnapshot();
    expect(snapshot).toEqual(store.current);

    const callback = vitest.fn();
    store.subscribe(callback);
    expect(callback).toHaveBeenCalledTimes(0);

    // 修改状态后，验证订阅回调被调用
    store.current.name = "Charmander";
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
