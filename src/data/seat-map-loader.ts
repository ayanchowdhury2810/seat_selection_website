import type { RawSeatMap } from "./seat-map-schema";

export async function loadSeatMap(json: RawSeatMap): Promise<RawSeatMap> {
  return json;
}

export async function loadSeatMapFromFile(path: string): Promise<RawSeatMap> {
  const response = await fetch(path);
  const data = await response.json();
  return data;
}
