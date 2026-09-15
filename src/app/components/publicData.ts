// Only confirmed public CMS responses are reused, in memory, for 20 seconds.
// No templates, credentials or localStorage; a reload always reads fresh data.
const resources: Array<() => void> = [];
export function clearPublicData() { resources.forEach((clear) => clear()); }

export function publicData<T>(url: string, parse: (value: unknown) => T) {
  let saved: { value: T; at: number } | null = null;
  let pending: Promise<T> | null = null;
  let generation = 0;
  let controller: AbortController | null = null;
  const read = () => saved && Date.now() - saved.at < 20_000 ? saved.value : null;
  const clear = () => { generation++; saved = null; pending = null; controller?.abort(); };
  resources.push(clear);
  function load(force = false): Promise<T> {
    if (force) clear();
    const cached = read();
    if (cached !== null) return Promise.resolve(cached);
    if (pending) return pending;
    const current = generation;
    pending = (async () => {
      for (let attempt = 0; attempt < 2; attempt++) {
        const requestController = new AbortController();
        controller = requestController;
        const timeout = setTimeout(() => requestController.abort(), 15_000);
        let retryable = true;
        try {
          const response = await fetch(url, { cache: "no-store", signal: requestController.signal });
          if (!response.ok) {
            retryable = response.status >= 500;
            throw new Error(`Could not load ${url}: ${response.status}`);
          }
          retryable = false;
          const value = parse(await response.json());
          if (current !== generation) throw new Error("Request superseded");
          saved = { value, at: Date.now() };
          return value;
        } catch (error) {
          if (current !== generation || attempt === 1 || !retryable) throw error;
        } finally { clearTimeout(timeout); }
      }
      throw new Error(`Could not load ${url}`);
    })().finally(() => { if (current === generation) { pending = null; controller = null; } });
    return pending;
  }
  return { read, load };
}

export function arrayField<T>(value: unknown, key: string): T[] {
  if (!value || typeof value !== "object" || !Array.isArray((value as Record<string, unknown>)[key])) {
    throw new Error(`Invalid ${key} response`);
  }
  return (value as Record<string, T[]>)[key];
}
