import { useState } from "react";
import type { Song } from "../types/Song";
import { getArtworkUrl } from "../services/api";
import { Search, Music, Play } from "lucide-react";

type Props = {
  songs: Song[];
  currentSong?: Song;
  playing: boolean;
  onSelect: (song: Song) => void;
};

function SongRow({
  song,
  index,
  isActive,
  isPlaying,
  onSelect,
}: {
  song: Song;
  index: number;
  isActive: boolean;
  isPlaying: boolean;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const artUrl = getArtworkUrl(song.artworkUrl);

  return (
    <div
      className={`song-row ${isActive ? "active" : ""}`}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="song-row-index">
        {hovered || (isActive && isPlaying) ? (
          isActive && isPlaying ? (
            <div className="playing-bars">
              <span /><span /><span />
            </div>
          ) : (
            <Play size={14} />
          )
        ) : (
          <span className={isActive ? "index-active" : ""}>{index + 1}</span>
        )}
      </div>

      <div className="song-row-art">
        {artUrl ? (
          <img src={artUrl} alt="" />
        ) : (
          <div className="art-fallback"><Music size={14} /></div>
        )}
      </div>

      <div className="song-row-meta">
        <p className={`song-row-title ${isActive ? "highlight" : ""}`}>
          {song.title}
        </p>
        <p className="song-row-artist">{song.artist}</p>
      </div>

      <div className="song-row-album">{song.album}</div>
    </div>
  );
}

export default function SongLibrary({ songs, currentSong, playing, onSelect }: Props) {
  const [search, setSearch] = useState("");

  const filtered = songs.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q) ||
      s.album.toLowerCase().includes(q)
    );
  });

  return (
    <div className="library">
      {/* Header */}
      <div className="library-header">
        <div>
          <h1 className="library-title">Your Library</h1>
          <p className="library-subtitle">
            {songs.length} {songs.length === 1 ? "song" : "songs"}
          </p>
        </div>
        <div className="search-wrap">
          <Search size={16} className="search-icon" />
          <input
            className="search-input"
            placeholder="Search songs, artists, albums..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Column headers */}
      <div className="song-list-header">
        <span className="col-index">#</span>
        <span className="col-art" />
        <span className="col-title">Title</span>
        <span className="col-album">Album</span>
      </div>

      {/* Songs */}
      <div className="song-list">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <Music size={40} />
            <p>{search ? "No results found" : "No songs in library"}</p>
            {search && (
              <button onClick={() => setSearch("")}>Clear search</button>
            )}
          </div>
        ) : (
          filtered.map((song, i) => (
            <SongRow
              key={song.id}
              song={song}
              index={i}
              isActive={song.id === currentSong?.id}
              isPlaying={playing}
              onSelect={() => onSelect(song)}
            />
          ))
        )}
      </div>
    </div>
  );
}