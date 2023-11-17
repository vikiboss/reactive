const internal_refSet = new WeakSet();

export function ref<T extends object>(obj: T): T {
  internal_refSet.add(obj);
  return obj as T;
}

export function isRef<T extends object>(obj: T) {
  return internal_refSet.has(obj);
}
