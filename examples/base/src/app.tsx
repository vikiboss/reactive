import {
  addProperty,
  asyncChangeName,
  deleteProperty,
  mutateNestedProperty,
  mutateTopProperty,
  popFromArray,
  pushToArray,
  store,
} from "./store";
import { memo } from "react";
import { create } from "zustand";
import Basic from "./basic";

export default function App() {
  return (
    <>
      <Basic />
      <Zustand />
      <Children />
      <C2 />
      <div>
        <button onClick={mutateTopProperty}>mutate top property</button>
        <button onClick={mutateNestedProperty}>mutate nested property</button>
      </div>

      <div>
        <button onClick={addProperty}>add property</button>
        <button onClick={deleteProperty}>delete property</button>
      </div>

      <div>
        <button onClick={pushToArray}>push to array</button>
        <button onClick={popFromArray}>pop from array</button>
      </div>

      <button onClick={asyncChangeName}>async change name</button>
      <button onClick={store.restore}>restore to initial state</button>
    </>
  );
}

function Children() {
  const state = store.useSnapshot();
  const content = JSON.stringify(state, null, 2);

  return <pre style={{ marginBottom: "2rem" }}>{content}</pre>;
}

const C2 = memo(() => {
  const state = store.useSnapshot((state) => state);
  console.log("render C2");
  return <h1>{state.name}</h1>;
});

const useStore = create<{ value: string; changeValue: () => Promise<void> }>((set) => ({
  value: "name",
  changeValue: async () => {
    set({ value: "1" });
    set({ value: "2" });
    set({ value: "3" });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    set({ value: "4" });
    set({ value: "5" });
    set({ value: "6" });
  },
}));

function Zustand() {
  const value = useStore((state) => state.value);
  const changeValue = useStore((state) => state.changeValue);

  console.log("render", value);

  return (
    <div>
      <input type="text" defaultValue={value} />
      <button onClick={() => changeValue()}>change</button>
    </div>
  );
}
