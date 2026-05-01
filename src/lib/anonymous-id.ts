const ANONYMOUS_ID_KEY = "openposition.anonymousId";

type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

function defaultIdFactory() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function getOrCreateAnonymousId(
  storage: StorageLike = window.localStorage,
  idFactory = defaultIdFactory,
) {
  const existing = storage.getItem(ANONYMOUS_ID_KEY);
  if (existing) {
    return existing;
  }

  const id = `op_${idFactory()}`;
  storage.setItem(ANONYMOUS_ID_KEY, id);
  return id;
}
