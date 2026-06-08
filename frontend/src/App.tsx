import { useEffect, useState } from "react";
import { getSongs } from "./services/api";
import type { Song } from "./types/Song";

const API_BASE = "http://localhost:8080";

function App() {

  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);

  useEffect(() => {
    getSongs().then(setSongs);
  }, []);

  return (
    <div>

      <h1>StreamNest</h1>

      {songs.map(song => (
        <div
          key={song.id}
          style={{
            border: "1px solid gray",
            margin: "10px",
            padding: "10px"
          }}
        >
          <h3>{song.title}</h3>

          <p>{song.artist}</p>

          <button
            onClick={() => setCurrentSong(song)}
          >
            Play
          </button>

        </div>
      ))}

      {currentSong && (
        <div>

          <h2>Now Playing</h2>

          <p>
            {currentSong.title}
          </p>

          <audio
            controls
            autoPlay
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