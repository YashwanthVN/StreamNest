import { useEffect, useState } from "react";
import { FaPlay } from "react-icons/fa";

import { getSongs } from "./services/api";
import type { Song } from "./types/Song";

import "./App.css";

const API_BASE = "http://localhost:8080";

function App() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);

  useEffect(() => {
    getSongs().then(setSongs);
  }, []);

  return (
    <div className="app">

      <div className="header">
        🎵 StreamNest
      </div>

      <div className="song-list">

        {songs.map(song => (

          <div
            key={song.id}
            className="song-card"
          >
            <div className="song-info">
              <h3>{song.title}</h3>
              <p>{song.artist}</p>
            </div>

            <button
              className="play-button"
              onClick={() => setCurrentSong(song)}
            >
              <FaPlay />
            </button>

          </div>

        ))}

      </div>

      {currentSong && (

        <div className="player">

          <h3>
            Now Playing
          </h3>

          <p>
            {currentSong.title}
          </p>

          <audio
            controls
            autoPlay
            style={{ width: "100%" }}
            src={`${API_BASE}/api/stream/${encodeURIComponent(
              currentSong.fileName
            )}`}
          />

        </div>

      )}

    </div>
  );
}

export default App;