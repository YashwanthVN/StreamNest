import { useState, useRef, useEffect } from "react";
import type { Song, Playlist } from "../types/Song";
import { getArtworkUrl } from "../services/api";
import { Search, Music, Play, Heart, ListPlus, Plus } from "lucide-react";

type Props = {
  songs: Song[];
  currentSong?: Song;
  playing: boolean;
  favorites: string[];
  playlists: Playlist[];
  onSelect: (song: Song) => void;
  onAddToQueue: (song: Song) => void;
  onToggleFavorite: (id: string) => void;
  onAddToPlaylist: (playlistId: string, songId: string) => void;
};

type ContextMenu = { x: number; y: number; song: Song } | null;

function SongRow({
  song, index, isActive, isPlaying, isFav,
  onSelect, onContext,
}: {
  song: Song; index: number; isActive: boolean; isPlaying: boolean; isFav: boolean;
  onSelect: () => void; onContext: (e: React.MouseEvent) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const artUrl = getArtworkUrl(song.artworkUrl);

  return (
    <div
      className={`song-row ${isActive ? "active" : ""}`}
      onClick={onSelect}
      onContextMenu={onContext}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="song-row-index">
        {hovered || (isActive && isPlaying) ? (
          isActive && isPlaying
            ? <div className="playing-bars"><span /><span /><span /></div>
            : <Play size={14} />
        ) : (
          <span className={isActive ? "index-active" : ""}>{index + 1}</span>
        )}
      </div>
      <div className="song-row-art">
        {artUrl ? <img src={artUrl} alt="" /> : <div className="art-fallback"><Music size={14} /></div>}
      </div>
      <div className="song-row-meta">
        <p className={`song-row-title ${isActive ? "highlight" : ""}`}>{song.title}</p>
        <p className="song-row-artist">{song.artist}</p>
      </div>
      <div className="song-row-album">{song.album}</div>
      {isFav && <Heart size={12} className="row-fav-icon" fill="currentColor" />}
    </div>
  );
}

export default function SongLibrary({
  songs, currentSong, playing, favorites, playlists,
  onSelect, onAddToQueue, onToggleFavorite, onAddToPlaylist,
}: Props) {
  const [search, setSearch]     = useState("");
  const [ctx, setCtx]           = useState<ContextMenu>(null);
  const [subMenu, setSubMenu]   = useState(false);
  const ctxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ctxRef.current && !ctxRef.current.contains(e.target as Node)) setCtx(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const filtered = songs.filter(s => {
    const q = search.toLowerCase();
    return s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q) || s.album.toLowerCase().includes(q);
  });

  const favSongs = songs.filter(s => favorites.includes(s.id));
  const showFavs = !search && favorites.length > 0;

  function openCtx(e: React.MouseEvent, song: Song) {
    e.preventDefault();
    setSubMenu(false);
    setCtx({ x: e.clientX, y: e.clientY, song });
  }

  return (
    <div className="library">
      <div className="library-header">
        <div>
          <h1 className="library-title">Your Library</h1>
          <p className="library-subtitle">{songs.length} {songs.length === 1 ? "song" : "songs"}</p>
        </div>
        <div className="search-wrap">
          <Search size={16} className="search-icon" />
          <input
            className="search-input"
            placeholder="Search songs, artists, albums..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {showFavs && (
        <div className="fav-section">
          <p className="section-label"><Heart size={13} /> Favorites</p>
          <div className="fav-chips">
            {favSongs.map(s => (
              <div key={s.id} className="fav-chip" onClick={() => onSelect(s)}>
                {getArtworkUrl(s.artworkUrl)
                  ? <img src={getArtworkUrl(s.artworkUrl)} alt="" />
                  : <div className="fav-chip-art">♪</div>}
                <span>{s.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="song-list-header">
        <span className="col-index">#</span>
        <span className="col-art" />
        <span className="col-title">Title</span>
        <span className="col-album">Album</span>
      </div>

      <div className="song-list">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <Music size={40} />
            <p>{search ? "No results found" : "No songs in library"}</p>
            {search && <button onClick={() => setSearch("")}>Clear search</button>}
          </div>
        ) : (
          filtered.map((song, i) => (
            <SongRow
              key={song.id}
              song={song}
              index={i}
              isActive={song.id === currentSong?.id}
              isPlaying={playing}
              isFav={favorites.includes(song.id)}
              onSelect={() => onSelect(song)}
              onContext={e => openCtx(e, song)}
            />
          ))
        )}
      </div>

      {/* Context menu */}
      {ctx && (
        <div
          ref={ctxRef}
          className="ctx-menu"
          style={{ top: ctx.y, left: ctx.x }}
        >
          <button onClick={() => { onSelect(ctx.song); setCtx(null); }}>
            <Play size={13} /> Play now
          </button>
          <button onClick={() => { onAddToQueue(ctx.song); setCtx(null); }}>
            <ListPlus size={13} /> Add to queue
          </button>
          <button onClick={() => { onToggleFavorite(ctx.song.id); setCtx(null); }}>
            <Heart size={13} /> {favorites.includes(ctx.song.id) ? "Remove from favorites" : "Add to favorites"}
          </button>
          <div className="ctx-divider" />
          <button
            className="ctx-has-sub"
            onMouseEnter={() => setSubMenu(true)}
          >
            <Plus size={13} /> Add to playlist <span className="ctx-arrow">›</span>
          </button>
          {subMenu && (
            <div className="ctx-submenu">
              {playlists.length === 0
                ? <span className="ctx-empty">No playlists</span>
                : playlists.map(pl => (
                    <button key={pl.id} onClick={() => { onAddToPlaylist(pl.id, ctx.song.id); setCtx(null); }}>
                      {pl.name}
                    </button>
                  ))
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
}