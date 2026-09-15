"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export function usePublicData<T>(resource: { read: () => T | null; load: (force?: boolean) => Promise<T> }) {
  const [data, setData] = useState<T | null>(() => resource.read());
  const [loading, setLoading] = useState(() => resource.read() === null);
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
    void load(false);
    // A completed request may populate the shared cache, but cannot update a departed page.
    return () => { sequence.current++; };
  }, [load]);
  const refresh = useCallback(() => load(true), [load]);
  return { data, loading, error, refresh };
}
