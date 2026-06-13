import type { Playlist, HistoryEntry, Song } from "../types/Song";

const K_PLAYLISTS = "sn_playlists";
const K_FAVORITES = "sn_favorites";
const K_HISTORY   = "sn_history";
const K_QUEUE     = "sn_queue";
const K_POSITION  = "sn_position";
const K_VOLUME    = "sn_volume";
const K_THEME     = "sn_theme";

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
export function getFavorites(): string[] { return load<string[]>(K_FAVORITES, []); }
export function toggleFavorite(id: string): string[] {
  const favs = getFavorites();
  const next = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id];
  save(K_FAVORITES, next); return next;
}

// ── History ───────────────────────────────────────────────
const MAX_HISTORY = 200;
export function getHistory(): HistoryEntry[] { return load<HistoryEntry[]>(K_HISTORY, []); }
export function pushHistory(songId: string) {
  const next = [{ songId, playedAt: Date.now() }, ...getHistory()].slice(0, MAX_HISTORY);
  save(K_HISTORY, next);
}
export function clearHistory() { save(K_HISTORY, []); }

// ── Queue persistence ──────────────────────────────────────
export function getPersistedQueue(): Song[] { return load<Song[]>(K_QUEUE, []); }
export function saveQueue(queue: Song[]) { save(K_QUEUE, queue); }

// ── Playback position ─────────────────────────────────────
export interface Position { songId: string; time: number; }
export function getPosition(): Position | null { return load<Position | null>(K_POSITION, null); }
export function savePosition(songId: string, time: number) { save(K_POSITION, { songId, time }); }
export function clearPosition() { localStorage.removeItem(K_POSITION); }

// ── Volume ────────────────────────────────────────────────
export function getVolume(): number { return load<number>(K_VOLUME, 0.8); }
export function saveVolume(v: number) { save(K_VOLUME, v); }

// ── Theme ─────────────────────────────────────────────────
export type Theme = "dark" | "amoled" | "spotify" | "retro";
export function getTheme(): Theme { return load<Theme>(K_THEME, "dark"); }
export function saveTheme(t: Theme) { save(K_THEME, t); applyTheme(t); }
export function applyTheme(t: Theme) {
  document.documentElement.setAttribute("data-theme", t);
}

// ── Playlists ─────────────────────────────────────────────
export function getPlaylists(): Playlist[] { return load<Playlist[]>(K_PLAYLISTS, []); }
export function createPlaylist(name: string): Playlist {
  const pl: Playlist = { id: `pl_${Date.now()}`, name, songIds: [], createdAt: Date.now() };
  save(K_PLAYLISTS, [...getPlaylists(), pl]); return pl;
}
export function deletePlaylist(id: string) { save(K_PLAYLISTS, getPlaylists().filter(p => p.id !== id)); }
export function renamePlaylist(id: string, name: string) {
  save(K_PLAYLISTS, getPlaylists().map(p => p.id === id ? { ...p, name } : p));
}
export function addToPlaylist(playlistId: string, songId: string) {
  save(K_PLAYLISTS, getPlaylists().map(p =>
    p.id === playlistId && !p.songIds.includes(songId)
      ? { ...p, songIds: [...p.songIds, songId] } : p
  ));
}
export function removeFromPlaylist(playlistId: string, songId: string) {
  save(K_PLAYLISTS, getPlaylists().map(p =>
    p.id === playlistId ? { ...p, songIds: p.songIds.filter(s => s !== songId) } : p
  ));
}
export function exportPlaylist(playlist: Playlist, songs: Song[]) {
  const data = {
    name: playlist.name, exportedAt: new Date().toISOString(),
    songs: playlist.songIds.map(id => songs.find(s => s.id === id)).filter(Boolean)
      .map(s => ({ title: s!.title, artist: s!.artist, album: s!.album })),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${playlist.name.replace(/\s+/g, "_")}.json`;
  a.click(); URL.revokeObjectURL(url);
}