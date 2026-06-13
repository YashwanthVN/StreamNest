import { useState, useEffect } from "react";
import { getSongs } from "./services/api";
import type { Song } from "./types/Song";
import { usePlayer } from "./hooks/usePlayer";
import Sidebar from "./components/Sidebar";
import NowPlaying from "./components/NowPlaying";
import SongLibrary from "./components/SongLibrary";
import "./App.css";

type View = "library" | "favorites";

export default function App() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<View>("library");

  const player = usePlayer(songs);

  useEffect(() => {
    getSongs()
      .then(setSongs)
      .catch(() => setError("Could not connect to StreamNest server."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-shell">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        songCount={songs.length}
      />

      <main className="main-content">
        {loading && (
          <div className="loading-state">
            <div className="loader" />
            <p>Loading your library…</p>
          </div>
        )}
        {error && (
          <div className="error-state">
            <p>⚠️ {error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}
        {!loading && !error && (
          <SongLibrary
            songs={activeView === "favorites" ? [] : songs}
            currentSong={player.currentSong}
            playing={player.playing}
            onSelect={player.playSong}
          />
        )}
      </main>

      <NowPlaying
        currentSong={player.currentSong}
        playing={player.playing}
        currentTime={player.currentTime}
        duration={player.duration}
        volume={player.volume}
        shuffle={player.shuffle}
        repeat={player.repeat}
        togglePlay={player.togglePlay}
        playNext={player.playNext}
        playPrev={player.playPrev}
        seek={player.seek}
        setVolume={player.setVolume}
        toggleShuffle={player.toggleShuffle}
        toggleRepeat={player.toggleRepeat}
      />
    </div>
  );
}