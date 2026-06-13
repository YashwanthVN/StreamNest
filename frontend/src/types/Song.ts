export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  fileName: string;
  artworkUrl?: string;
}

export interface Playlist {
  id: string;
  name: string;
  songIds: string[];
  createdAt: number;
}

export interface HistoryEntry {
  songId: string;
  playedAt: number;
}