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
import AlbumView from "./components/AlbumView";
import SettingsPanel from "./components/SettingsPanel";
import {
  getFavorites, toggleFavorite,
  getHistory, getPlaylists,
  addToPlaylist,
  getTheme, applyTheme,
  type Theme,
} from "./services/storage";
import "./App.css";

export default function App() {
  const [songs, setSongs]           = useState<Song[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [activeView, setActiveView] = useState<View>("library");
  const [favorites, setFavorites]   = useState<string[]>(getFavorites);
  const [historyEntries, setHistory]= useState(getHistory);
  const [playlists, setPlaylists]   = useState(getPlaylists);
  const [theme, setTheme]           = useState<Theme>(getTheme);

  const player = usePlayer(songs);

  // Apply saved theme on mount
  useEffect(() => { applyTheme(theme); }, []);

  useEffect(() => {
    getSongs()
      .then(setSongs)
      .catch(() => setError("Could not connect to StreamNest server."))
      .finally(() => setLoading(false));
  }, []);

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

  const sharedLibraryProps = {
    songs,
    currentSong: player.currentSong,
    playing: player.playing,
    favorites,
    playlists,
    onSelect: player.playSong,
    onAddToQueue: player.addToQueue,
    onToggleFavorite: handleToggleFavorite,
    onAddToPlaylist: handleAddToPlaylist,
  };

  function renderMain() {
    if (loading) return <div className="loading-state"><div className="loader" /><p>Loading your library…</p></div>;
    if (error)   return <div className="error-state"><p>⚠️ {error}</p><button onClick={() => window.location.reload()}>Retry</button></div>;

    switch (activeView) {
      case "library":
        return <SongLibrary {...sharedLibraryProps} />;
      case "favorites":
        return <SongLibrary {...sharedLibraryProps} songs={songs.filter(s => favorites.includes(s.id))} />;
      case "albums":
        return (
          <AlbumView
            songs={songs}
            currentSong={player.currentSong}
            playing={player.playing}
            onSelect={player.playSong}
            onAddToQueue={player.addToQueue}
          />
        );
      case "queue":
        return (
          <QueuePanel
            queue={player.queue}
            currentSong={player.currentSong}
            onRemove={player.removeFromQueue}
            onClear={player.clearQueue}
            onMove={player.moveInQueue}
            onPlay={song => { player.playSong(song); }}
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
      case "settings":
        return (
          <SettingsPanel
            currentTheme={theme}
            onThemeChange={t => setTheme(t)}
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