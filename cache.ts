const t = Symbol("t");

type Cache<T> = T & { [t]: number };

export function getCache<T>(cache: Map<string, T>, id: string): T | null {
  const d = cache.get(id);
  if (!d) return null;
  if (Date.now() - (d as Cache<T>)[t] > 6 * 60 * 60 * 1000) return d;
  cache.delete(id);
  return null;
}

export function setCache<T>(cache: Map<string, T>, id: string, u: T) {
  const d = cache.get(id);
  if (d) {
    (d as Cache<T>)[t] = Date.now();
    return;
  }

  (u as Cache<T>)[t] = Date.now();
  cache.set(id, u as T & { _t: number });
}
