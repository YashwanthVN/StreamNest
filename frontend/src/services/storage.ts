import type { Playlist, HistoryEntry } from "../types/Song";

// ── Keys ──────────────────────────────────────────────────
const K_PLAYLISTS  = "sn_playlists";
const K_FAVORITES  = "sn_favorites";
const K_HISTORY    = "sn_history";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

function save(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ── Favorites ─────────────────────────────────────────────
export function getFavorites(): string[] {
  return load<string[]>(K_FAVORITES, []);
}

export function toggleFavorite(id: string): string[] {
  const favs = getFavorites();
  const next = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id];
  save(K_FAVORITES, next);
  return next;
}

// ── History ───────────────────────────────────────────────
const MAX_HISTORY = 200;

export function getHistory(): HistoryEntry[] {
  return load<HistoryEntry[]>(K_HISTORY, []);
}

export function pushHistory(songId: string) {
  const h = getHistory();
  const entry: HistoryEntry = { songId, playedAt: Date.now() };
  const next = [entry, ...h].slice(0, MAX_HISTORY);
  save(K_HISTORY, next);
}

export function clearHistory() {
  save(K_HISTORY, []);
}

// ── Playlists ─────────────────────────────────────────────
export function getPlaylists(): Playlist[] {
  return load<Playlist[]>(K_PLAYLISTS, []);
}

export function createPlaylist(name: string): Playlist {
  const pl: Playlist = {
    id: `pl_${Date.now()}`,
    name,
    songIds: [],
    createdAt: Date.now(),
  };
  save(K_PLAYLISTS, [...getPlaylists(), pl]);
  return pl;
}

export function deletePlaylist(id: string) {
  save(K_PLAYLISTS, getPlaylists().filter(p => p.id !== id));
}

export function renamePlaylist(id: string, name: string) {
  save(K_PLAYLISTS, getPlaylists().map(p => p.id === id ? { ...p, name } : p));
}

export function addToPlaylist(playlistId: string, songId: string) {
  save(K_PLAYLISTS, getPlaylists().map(p =>
    p.id === playlistId && !p.songIds.includes(songId)
      ? { ...p, songIds: [...p.songIds, songId] }
      : p
  ));
}

export function removeFromPlaylist(playlistId: string, songId: string) {
  save(K_PLAYLISTS, getPlaylists().map(p =>
    p.id === playlistId
      ? { ...p, songIds: p.songIds.filter(s => s !== songId) }
      : p
  ));
}

export function exportPlaylist(playlist: Playlist, songs: import("../types/Song").Song[]) {
  const data = {
    name: playlist.name,
    exportedAt: new Date().toISOString(),
    songs: playlist.songIds
      .map(id => songs.find(s => s.id === id))
      .filter(Boolean)
      .map(s => ({ title: s!.title, artist: s!.artist, album: s!.album })),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${playlist.name.replace(/\s+/g, "_")}.json`;
  a.click();
  URL.revokeObjectURL(url);
}