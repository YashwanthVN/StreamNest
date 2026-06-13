import type { Song } from "../types/Song";

const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:8080";

  console.log("API_BASE =", API_BASE);
export async function getSongs(): Promise<Song[]> {
  const res = await fetch(`${API_BASE}/api/songs`);
  if (!res.ok) throw new Error("Failed to load songs");
  return res.json();
}

export function getArtworkUrl(artworkUrl?: string): string {
  return artworkUrl ? `${API_BASE}${artworkUrl}` : "";
}

export function getStreamUrl(fileName: string): string {
  return `${API_BASE}/api/stream/${encodeURIComponent(fileName)}`;
}