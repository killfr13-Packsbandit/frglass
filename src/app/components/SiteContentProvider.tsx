"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { clearPublicData } from "./publicData";
import type { SiteContentMap } from "../siteContent";
import { siteContentValue } from "../siteContent";

type SiteContentContextValue = {
  content: SiteContentMap;
  loading: boolean;
  error: boolean;
  get: (key: string, fallback?: string) => string;
  refresh: () => Promise<void>;
};

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

function naturalGermanCopy(value: string) {
  return value
    .replace(/kleine Workshops und individuelle Sessions/g, "Workshops und individuelle Kurse")
    .replace(/Einzel-Sessions/g, "Einzelkurse")
    .replace(/1:1-Sessions/g, "Einzelkurse")
    .replace(/individuelle Sessions/g, "individuelle Kurse")
    .replace(/kleine Sessions/g, "kleine Kurse")
    .replace(/\bSessions\b/g, "Kurse")
    .replace(/\bSession\b/g, "Kurs")
    .replace(/Einzeltermine/g, "Einzelkurse")
    .replace(/individuelle Termine/g, "individuelle Kurse")
    .replace(/\bTermine\b/g, "Kurse")
    .replace(/\bTermin\b/g, "Kurs");
}

export function SiteContentProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [content, setContent] = useState<SiteContentMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    setError(false);
    try {
      const response = await fetch("/api/site-content", { cache: "no-store" });
      if (!response.ok) throw new Error("Content request failed");
      const data = (await response.json()) as { content?: SiteContentMap };
      if (data.content && typeof data.content === "object") {
        setContent(data.content);
      } else {
        throw new Error("Invalid content response");
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (pathname.startsWith("/admin")) {
      clearPublicData();
      return;
    }

    // Refresh on public navigation as well. This is especially important after
    // editing content in /admin so the user immediately sees the saved version
    // without needing a hard reload.
    void refresh();
  }, [pathname, refresh]);

  const value = useMemo<SiteContentContextValue>(
    () => ({
      content,
      loading,
      error,
      get: (key, fallback = "") => {
        // Keep meaningful fallback content in the server-rendered HTML.
        // This prevents crawlers from seeing an almost empty homepage before
        // the client-side CMS request finishes (which can trigger a Soft 404).
        if (loading || error) return fallback;
        const resolved = siteContentValue(content, key, fallback);
        return key.endsWith(".de") ? naturalGermanCopy(resolved) : resolved;
      },
      refresh,
    }),
    [content, loading, error, refresh],
  );

  return (
    <SiteContentContext.Provider value={value}>
      {error && <div role="alert" className="relative z-50 mt-24 bg-neutral-900 p-4 text-center text-sm text-white">Inhalte konnten nicht geladen werden. / Content could not be loaded. <button type="button" onClick={() => void refresh()} className="ml-2 underline">Erneut versuchen / Retry</button></div>}
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
