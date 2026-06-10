import type { Song } from "../types/Song";

type Props = {
  songs: Song[];
  currentSongId?: string;
  onSelect:(song:Song)=>void;
};

export default function SongList({
  songs,
  currentSongId,
  onSelect
}:Props){

  return (
    <div>

      {songs.map(song=>(
        <div
          key={song.id}
          className={
              song.id === currentSongId
                  ? "song-card active"
                  : "song-card"
          }
          onClick={()=>onSelect(song)}
        >
          <div>
            <h3>{song.title}</h3>

            <p>
              {song.artist}
            </p>

            <small>
              {song.album}
            </small>
          </div>
        </div>
      ))}

    </div>
  );
}