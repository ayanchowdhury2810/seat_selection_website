import { assertValidSeatMap } from "./seat-map-normalizer";
import type { RawSeatMap } from "./seat-map-schema";

export class SeatMapLoadError extends Error {
  readonly status?: number;
  readonly url: string;

  constructor(url: string, message: string, options?: { status?: number; cause?: unknown }) {
    super(`Failed to load seat map from ${url}: ${message}`, options ? { cause: options.cause } : undefined);
    this.name = "SeatMapLoadError";
    this.url = url;
    this.status = options?.status;
  }
}

export interface LoadSeatMapOptions {
  signal?: AbortSignal;
}

/** Validate + return an in-memory object (e.g. imported TS fallback, test fixture). */
export async function loadSeatMap(json: unknown): Promise<RawSeatMap> {
  assertValidSeatMap(json);
  return json;
}

async function fetchJson(url: string, options: LoadSeatMapOptions = {}): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, { signal: options.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new SeatMapLoadError(url, "network request failed", { cause: error });
  }
  if (!response.ok) {
    throw new SeatMapLoadError(url, `request failed with status ${response.status}`, {
      status: response.status,
    });
  }
  try {
    return await response.json();
  } catch (error) {
    throw new SeatMapLoadError(url, "response is not valid JSON", { cause: error });
  }
}

async function loadValidated(url: string, options: LoadSeatMapOptions = {}): Promise<RawSeatMap> {
  const json = await fetchJson(url, options);
  try {
    assertValidSeatMap(json);
  } catch (error) {
    throw new SeatMapLoadError(url, "payload failed schema validation", { cause: error });
  }
  return json;
}

/** Fetch a seat-map JSON file (public/ asset, CDN, backend URL). */
export async function loadSeatMapFromFile(
  path: string,
  options: LoadSeatMapOptions = {},
): Promise<RawSeatMap> {
  return loadValidated(path, options);
}

/** Alias kept for intent: URL is a backend endpoint rather than a static file. */
export async function loadSeatMapFromUrl(
  url: string,
  options: LoadSeatMapOptions = {},
): Promise<RawSeatMap> {
  return loadValidated(url, options);
}

function resolveApiBase(explicitBase?: string): string {
  return explicitBase ?? process.env.NEXT_PUBLIC_SEATMAP_API_URL ?? "/api/seat-map";
}

/**
 * Load the seat map for an event from the backend.
 * Defaults to the same-origin `/api/seat-map` proxy so no CORS config is needed;
 * point NEXT_PUBLIC_SEATMAP_API_URL at the real backend when ready.
 */
export async function loadSeatMapFromApi(
  eventId: string,
  options: LoadSeatMapOptions & { baseUrl?: string } = {},
): Promise<RawSeatMap> {
  const base = resolveApiBase(options.baseUrl).replace(/\/$/, "");
  const url = `${base}?eventId=${encodeURIComponent(eventId)}`;
  return loadValidated(url, { signal: options.signal });
}
