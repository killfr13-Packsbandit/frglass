"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export function usePublicData<T>(
  resource: { read: () => T | null; load: (force?: boolean) => Promise<T> },
  initialData?: T,
) {
  const [data, setData] = useState<T | null>(() => resource.read() ?? initialData ?? null);
  const [loading, setLoading] = useState(() => resource.read() === null && initialData === undefined);
  const [error, setError] = useState(false);
  const sequence = useRef(0);
  const load = useCallback(async (force: boolean) => {
    const request = ++sequence.current;
    setError(false);
    setLoading(force || resource.read() === null);
    try {
      const value = await resource.load(force);
      if (request === sequence.current) setData(value);
    } catch {
      if (request === sequence.current) setError(true);
    } finally {
      if (request === sequence.current) setLoading(false);
    }
  }, [resource]);
  useEffect(() => {
    // Server-rendered data is already fresh for this navigation. A manual
    // refresh can still force an API request when needed.
    if (initialData !== undefined) return;
    const request = sequence.current + 1;
    // Loading this external resource is the synchronization purpose of this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(false);
    // A completed request may populate the shared cache, but cannot update a departed page.
    return () => {
      if (sequence.current === request) sequence.current += 1;
    };
  }, [initialData, load]);
  const refresh = useCallback(() => load(true), [load]);
  return { data, loading, error, refresh };
}
