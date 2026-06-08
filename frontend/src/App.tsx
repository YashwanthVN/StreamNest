import { useEffect, useState } from "react";
import { getSongs } from "./services/api";
import type { Song } from "./types/Song";

function App() {
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    getSongs().then(setSongs);
  }, []);

  return (
    <div>
      <h1>StreamNest</h1>

      {songs.map(song => (
        <div key={song.id}>
          <h3>{song.title}</h3>
          <p>{song.artist}</p>
        </div>
      ))}
    </div>
  );
}

export default App;