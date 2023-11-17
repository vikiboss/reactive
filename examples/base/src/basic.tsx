import { create, ref } from "@shined/reactive";

const store = create({
  name: "John",
  age: 12,
  pets: ["cat", "dog"],
  top: {
    nested: "~",
  },
  ref: ref({
    files: [new File(["", ""], "demo")],
  }),
});

export default function Basic() {
  console.log("Basic render");

  return (
    <div>
      <Basic2 />
      <Basic3 />
      <Basic4 />
      <Basic5 />
      <Basic6 />
    </div>
  );
}

function Basic2() {
  const name = store.useSnapshot((state) => state.name);

  console.log("Basic2 render");

  return (
    <div>
      <h1>name: {name}</h1>
      <button onClick={() => (store.mutate.name += "～")}>变变变</button>
    </div>
  );
}

function Basic3() {
  const age = store.useSnapshot((state) => state.age);

  console.log("Basic3 render");

  return (
    <div>
      <h1>age: {age}</h1>
      <button onClick={() => store.mutate.age++}>变变变</button>
    </div>
  );
}

function Basic4() {
  const nested = store.useSnapshot((state) => state.top.nested);

  console.log("Basic4 render");

  return (
    <div>
      <h1>nested: {nested}</h1>
      <button
        onClick={async () => {
          store.mutate.top.nested += "~";
          store.mutate.top.nested += "~";
          store.mutate.top.nested += "~";
          await new Promise((resolve) => setTimeout(resolve, 1000));
          store.mutate.top.nested += "~";
          store.mutate.top.nested += "~";
          store.mutate.top.nested += "~";
        }}
      >
        变变变
      </button>
    </div>
  );
}

function Basic5() {
  const pets = store.useSnapshot(
    (state) => state.pets,
    (_pre, next) => next.length <= 6 // 精确控制渲染
  );

  console.log("Basic5 render");

  return (
    <div>
      <h1>pets.length: {pets.length}</h1>
      <button onClick={() => store.mutate.pets.push("demo")}>变变变</button>
    </div>
  );
}

function Basic6() {
  const { files } = store.useSnapshot((state) => state.ref);
  // const files = store.useSnapshot((state) => state.ref.files); // <- 错误用例，拿不到原始的 ref 引用

  console.log("Basic6 render");

  return (
    <div>
      <h1>files.length: {files.length}</h1>
      <button
        onClick={() => {
          store.mutate.ref.files.push(new File([""], "demo.png"));
          console.log(files);
        }}
      >
        变变变
      </button>
    </div>
  );
}
