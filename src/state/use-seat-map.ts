"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadSeatMapFromApi, loadSeatMapFromUrl, SeatMapLoadError } from "@/data/seat-map-loader";
import type { RawSeatMap } from "@/data/seat-map-schema";

export interface UseSeatMapOptions {
  /** Backend event id. Fetch uses /api/seat-map?eventId=. Ignored when `url` set. */
  eventId?: string;
  /** Explicit JSON URL. Takes precedence over eventId. */
  url?: string;
  /** Static data used when fetch fails (dev / offline). Scene stays usable. */
  fallback?: RawSeatMap;
  /** Skip fetch (e.g. waiting for user input). */
  enabled?: boolean;
}

export interface UseSeatMapResult {
  raw: RawSeatMap | null;
  loading: boolean;
  error: string | null;
  /** True when showing `fallback` after a fetch failure. */
  isFallback: boolean;
  eventId: string | undefined;
  reload: () => void;
}

interface SeatMapState {
  key: string;
  raw: RawSeatMap | null;
  error: string | null;
  isFallback: boolean;
}

function toMessage(error: unknown): string {
  if (error instanceof SeatMapLoadError) return error.message;
  if (error instanceof Error) return error.message;
  return "Unknown seat map load error";
}

/**
 * Fetch seat-map JSON from backend. Single fetch per eventId/url.
 * Stale data stays visible while a new venue loads; `loading` is derived
 * so the effect never sets state synchronously.
 */
export function useSeatMap(options: UseSeatMapOptions = {}): UseSeatMapResult {
  const { eventId, url, fallback, enabled = true } = options;
  const [nonce, setNonce] = useState(0);
  const [state, setState] = useState<SeatMapState>({ key: "", raw: null, error: null, isFallback: false });
  const fallbackRef = useRef(fallback);

  useEffect(() => {
    fallbackRef.current = fallback;
  }, [fallback]);

  const reload = useCallback(() => {
    // Event-handler setState: clears a previous error so loading resumes.
    setState((prev) => ({ ...prev, error: null }));
    setNonce((n) => n + 1);
  }, []);

  const key = `${url ?? ""}|${eventId ?? "default"}|${nonce}`;

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    let cancelled = false;

    const run = async () => {
      try {
        const data = url
          ? await loadSeatMapFromUrl(url, { signal: controller.signal })
          : await loadSeatMapFromApi(eventId ?? "default", { signal: controller.signal });
        if (cancelled) return;
        setState({ key, raw: data, error: null, isFallback: false });
      } catch (fetchError) {
        if (cancelled || controller.signal.aborted) return;
        const fb = fallbackRef.current;
        if (fb) {
          setState({ key, raw: fb, error: null, isFallback: true });
        } else {
          setState({ key, raw: null, error: toMessage(fetchError), isFallback: false });
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [key, url, eventId, enabled]);

  const current = state.key === key ? state : { raw: null, error: null, isFallback: false };
  const loading = enabled && current.raw === null && current.error === null;

  return { raw: current.raw, loading, error: current.error, isFallback: current.isFallback, eventId, reload };
}
