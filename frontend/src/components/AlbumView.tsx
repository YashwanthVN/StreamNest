import { useState, useMemo } from "react";
import { Music, Disc, Mic2 } from "lucide-react";
import type { Song } from "../types/Song";
import { getArtworkUrl } from "../services/api";

type GroupBy = "artist" | "album";

type Props = {
  songs: Song[];
  currentSong?: Song;
  playing: boolean;
  onSelect: (song: Song) => void;
  onAddToQueue: (song: Song) => void;
};

function fmt(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// ── Artist Detail Page ────────────────────────────────────
function ArtistPage({ artist, songs, currentSong, playing, onSelect, onBack }: {
  artist: string; songs: Song[]; currentSong?: Song;
  playing: boolean; onSelect: (s: Song) => void; onBack: () => void;
}) {
  const albums = useMemo(() => {
    const map = new Map<string, Song[]>();
    songs.forEach(s => {
      const a = s.album || "Unknown Album";
      map.set(a, [...(map.get(a) || []), s]);
    });
    return Array.from(map.entries());
  }, [songs]);

  const art = getArtworkUrl(songs[0]?.artworkUrl);
  const totalDuration = songs.length * 210; // estimate ~3.5min avg

  return (
    <div className="panel-page">
      <button className="panel-back" onClick={onBack}>← Artists</button>

      <div className="artist-hero">
        <div className="artist-avatar">
          {art ? <img src={art} alt="" /> : <Mic2 size={40} />}
        </div>
        <div className="artist-hero-meta">
          <h2 className="artist-name">{artist}</h2>
          <p className="artist-stats">
            {albums.length} {albums.length === 1 ? "album" : "albums"} · {songs.length} songs · ~{fmt(totalDuration)}
          </p>
        </div>
      </div>

      {albums.map(([album, albumSongs]) => (
        <div key={album} className="album-block">
          <p className="album-block-title">
            <Disc size={13} /> {album}
          </p>
          {albumSongs.map((song, i) => (
            <div
              key={song.id}
              className={`song-row ${song.id === currentSong?.id ? "active" : ""}`}
              onClick={() => onSelect(song)}
            >
              <div className="song-row-index">
                {song.id === currentSong?.id && playing
                  ? <div className="playing-bars"><span /><span /><span /></div>
                  : <span className={song.id === currentSong?.id ? "index-active" : ""}>{i + 1}</span>}
              </div>
              <div className="song-row-meta" style={{ gridColumn: "2 / 4" }}>
                <p className={`song-row-title ${song.id === currentSong?.id ? "highlight" : ""}`}>{song.title}</p>
                <p className="song-row-artist">{song.artist}</p>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Album Detail Page ─────────────────────────────────────
function AlbumPage({ album, songs, currentSong, playing, onSelect, onBack }: {
  album: string; songs: Song[]; currentSong?: Song;
  playing: boolean; onSelect: (s: Song) => void; onBack: () => void;
}) {
  const art = getArtworkUrl(songs[0]?.artworkUrl);
  const artist = songs[0]?.artist || "Unknown Artist";

  return (
    <div className="panel-page">
      <button className="panel-back" onClick={onBack}>← Albums</button>

      <div className="album-hero">
        <div className="album-cover-lg">
          {art ? <img src={art} alt="" /> : <div className="album-cover-fallback"><Music size={40} /></div>}
        </div>
        <div>
          <h2 className="artist-name">{album}</h2>
          <p className="artist-stats">{artist}</p>
          <p className="artist-stats">{songs.length} songs</p>
        </div>
      </div>

      <div className="song-list-header">
        <span className="col-index">#</span>
        <span className="col-art" />
        <span className="col-title">Title</span>
      </div>

      {songs.map((song, i) => (
        <div
          key={song.id}
          className={`song-row ${song.id === currentSong?.id ? "active" : ""}`}
          onClick={() => onSelect(song)}
          style={{ gridTemplateColumns: "40px 44px 1fr" }}
        >
          <div className="song-row-index">
            {song.id === currentSong?.id && playing
              ? <div className="playing-bars"><span /><span /><span /></div>
              : <span className={song.id === currentSong?.id ? "index-active" : ""}>{i + 1}</span>}
          </div>
          <div className="song-row-art">
            {art ? <img src={art} alt="" /> : <div className="art-fallback"><Music size={14} /></div>}
          </div>
          <div className="song-row-meta">
            <p className={`song-row-title ${song.id === currentSong?.id ? "highlight" : ""}`}>{song.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Album/Artist grid ────────────────────────────────
export default function AlbumView({ songs, currentSong, playing, onSelect }: Props) {
  const [groupBy, setGroupBy]     = useState<GroupBy>("artist");
  const [selected, setSelected]   = useState<string | null>(null);

  const groups = useMemo(() => {
    const map = new Map<string, Song[]>();
    songs.forEach(s => {
      const key = groupBy === "artist" ? (s.artist || "Unknown Artist") : (s.album || "Unknown Album");
      map.set(key, [...(map.get(key) || []), s]);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [songs, groupBy]);

  if (selected) {
    const groupSongs = groups.find(([k]) => k === selected)?.[1] || [];
    if (groupBy === "artist") return (
      <ArtistPage artist={selected} songs={groupSongs} currentSong={currentSong}
        playing={playing} onSelect={onSelect} onBack={() => setSelected(null)} />
    );
    return (
      <AlbumPage album={selected} songs={groupSongs} currentSong={currentSong}
        playing={playing} onSelect={onSelect} onBack={() => setSelected(null)} />
    );
  }

  return (
    <div className="library">
      <div className="library-header">
        <div>
          <h1 className="library-title">{groupBy === "artist" ? "Artists" : "Albums"}</h1>
          <p className="library-subtitle">{groups.length} {groupBy === "artist" ? "artists" : "albums"}</p>
        </div>
        <div className="group-toggle">
          <button className={groupBy === "artist" ? "active" : ""} onClick={() => { setGroupBy("artist"); setSelected(null); }}>
            <Mic2 size={14} /> Artists
          </button>
          <button className={groupBy === "album" ? "active" : ""} onClick={() => { setGroupBy("album"); setSelected(null); }}>
            <Disc size={14} /> Albums
          </button>
        </div>
      </div>

      <div className="album-grid">
        {groups.map(([key, groupSongs]) => {
          const art = getArtworkUrl(groupSongs[0]?.artworkUrl);
          const sub = groupBy === "artist"
            ? `${groupSongs.length} songs`
            : groupSongs[0]?.artist || "Unknown Artist";
          return (
            <button key={key} className="album-card" onClick={() => setSelected(key)}>
              <div className="album-card-art">
                {art ? <img src={art} alt="" /> : <div className="album-card-fallback">
                  {groupBy === "artist" ? <Mic2 size={28} /> : <Disc size={28} />}
                </div>}
              </div>
              <p className="album-card-title">{key}</p>
              <p className="album-card-sub">{sub}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}