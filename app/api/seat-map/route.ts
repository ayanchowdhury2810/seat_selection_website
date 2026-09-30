import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { validateRaw } from "@/data/seat-map-normalizer";

export const dynamic = "force-dynamic";

/**
 * Dynamic seat-map endpoint. Always serves JSON, never a TS import.
 * - SEATMAP_BACKEND_URL set: proxies GET {SEATMAP_BACKEND_URL}?eventId=...
 * - Otherwise: serves public/dummy-seat-map.json (local stand-in until backend ready).
 * - ?source=... query on page: client fetches that URL directly, bypassing proxy.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId") ?? "default";
  const backendBase = process.env.SEATMAP_BACKEND_URL?.replace(/\/$/, "");

  if (!backendBase) {
    // No backend yet: serve dummy JSON file from public/.
    try {
      const raw = await readFile(join(process.cwd(), "public", "dummy-seat-map.json"), "utf-8");
      const json: unknown = JSON.parse(raw);
      if (!validateRaw(json)) {
        return NextResponse.json({ error: "Dummy seat map failed schema validation" }, { status: 500 });
      }
      return NextResponse.json(json, {
        headers: { "cache-control": "no-store" },
      });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Dummy seat map unavailable" },
        { status: 500 },
      );
    }
  }

  const target = `${backendBase}?eventId=${encodeURIComponent(eventId)}`;
  try {
    const upstream = await fetch(target, {
      headers: { accept: "application/json" },
      // Seat maps change on booking; never cache upstream at the edge here.
      cache: "no-store",
    });
    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Backend responded with status ${upstream.status}` },
        { status: 502 },
      );
    }
    const json: unknown = await upstream.json();
    if (!validateRaw(json)) {
      return NextResponse.json({ error: "Backend payload failed schema validation" }, { status: 502 });
    }
    return NextResponse.json(json, {
      headers: { "cache-control": "no-store" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Backend fetch failed" },
      { status: 502 },
    );
  }
}
