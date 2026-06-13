import { useState, useEffect, useCallback } from "react";
import { getSongs } from "./services/api";
import type { Song } from "./types/Song";
import { usePlayer } from "./hooks/usePlayer";
import Sidebar, { type View } from "./components/Sidebar";
import NowPlaying from "./components/NowPlaying";
import SongLibrary from "./components/SongLibrary";
import QueuePanel from "./components/QueuePanel";
import HistoryPanel from "./components/HistoryPanel";
import PlaylistsPanel from "./components/PlaylistsPanel";
import {
  getFavorites, toggleFavorite,
  getHistory, getPlaylists,
  addToPlaylist,
} from "./services/storage";
import "./App.css";

export default function App() {
  const [songs, setSongs]         = useState<Song[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [activeView, setActiveView] = useState<View>("library");

  // Local state driven from localStorage
  const [favorites, setFavorites]   = useState<string[]>(getFavorites);
  const [historyEntries, setHistory] = useState(getHistory);
  const [playlists, setPlaylists]   = useState(getPlaylists);

  const player = usePlayer(songs);

  useEffect(() => {
    getSongs()
      .then(setSongs)
      .catch(() => setError("Could not connect to StreamNest server."))
      .finally(() => setLoading(false));
  }, []);

  // Refresh history when currentSong changes
  useEffect(() => {
    if (player.currentSong) setHistory(getHistory());
  }, [player.currentSong]);

  const handleToggleFavorite = useCallback((id: string) => {
    setFavorites(toggleFavorite(id));
  }, []);

  const handleAddToPlaylist = useCallback((plId: string, songId: string) => {
    addToPlaylist(plId, songId);
    setPlaylists(getPlaylists());
  }, []);

  const refreshPlaylists = useCallback(() => setPlaylists(getPlaylists()), []);
  const refreshHistory   = useCallback(() => setHistory(getHistory()), []);

  const currentIsFav = player.currentSong ? favorites.includes(player.currentSong.id) : false;

  function renderMain() {
    if (loading) return <div className="loading-state"><div className="loader" /><p>Loading your library…</p></div>;
    if (error)   return <div className="error-state"><p>⚠️ {error}</p><button onClick={() => window.location.reload()}>Retry</button></div>;

    switch (activeView) {
      case "library":
      case "favorites":
        return (
          <SongLibrary
            songs={activeView === "favorites" ? songs.filter(s => favorites.includes(s.id)) : songs}
            currentSong={player.currentSong}
            playing={player.playing}
            favorites={favorites}
            playlists={playlists}
            onSelect={player.playSong}
            onAddToQueue={player.addToQueue}
            onToggleFavorite={handleToggleFavorite}
            onAddToPlaylist={handleAddToPlaylist}
          />
        );
      case "queue":
        return (
          <QueuePanel
            queue={player.queue}
            currentSong={player.currentSong}
            onRemove={player.removeFromQueue}
            onClear={player.clearQueue}
            onPlay={song => { player.playSong(song); player.removeFromQueue(player.queue.indexOf(song)); }}
          />
        );
      case "history":
        return (
          <HistoryPanel
            entries={historyEntries}
            songs={songs}
            onPlay={player.playSong}
            onClear={refreshHistory}
          />
        );
      case "playlists":
        return (
          <PlaylistsPanel
            playlists={playlists}
            songs={songs}
            onPlay={player.playSong}
            onChange={refreshPlaylists}
          />
        );
    }
  }

  return (
    <div className="app-shell">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        songCount={songs.length}
        queueCount={player.queue.length}
      />
      <main className="main-content">{renderMain()}</main>
      <NowPlaying
        currentSong={player.currentSong}
        playing={player.playing}
        currentTime={player.currentTime}
        duration={player.duration}
        volume={player.volume}
        shuffle={player.shuffle}
        repeat={player.repeat}
        isFavorite={currentIsFav}
        togglePlay={player.togglePlay}
        playNext={player.playNext}
        playPrev={player.playPrev}
        seek={player.seek}
        setVolume={player.setVolume}
        toggleShuffle={player.toggleShuffle}
        toggleRepeat={player.toggleRepeat}
        onToggleFavorite={() => player.currentSong && handleToggleFavorite(player.currentSong.id)}
      />
    </div>
  );
}