"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { SiteContentMap } from "../siteContent";
import { siteContentValue } from "../siteContent";

type SiteContentContextValue = {
  content: SiteContentMap;
  get: (key: string, fallback?: string) => string;
  refresh: () => Promise<void>;
};

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

export function SiteContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<SiteContentMap>({});

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/site-content", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as { content?: SiteContentMap };
      if (data.content && typeof data.content === "object") {
        setContent(data.content);
      }
    } catch {
      // Keep code defaults when the CMS cannot be reached.
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo<SiteContentContextValue>(
    () => ({
      content,
      get: (key, fallback = "") => siteContentValue(content, key, fallback),
      refresh,
    }),
    [content, refresh],
  );

  return (
    <SiteContentContext.Provider value={value}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  const value = useContext(SiteContentContext);
  if (!value) {
    throw new Error("useSiteContent must be used inside SiteContentProvider");
  }
  return value;
}
