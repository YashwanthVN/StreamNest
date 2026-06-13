import { useEffect, useState } from "react";
import type { Song } from "../types/Song";
import { getArtworkUrl } from "../services/api";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, VolumeX, Heart } from "lucide-react";

type Props = {
  currentSong?: Song;
  playing: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: boolean;
  isFavorite: boolean;
  togglePlay: () => void;
  playNext: () => void;
  playPrev: () => void;
  seek: (t: number) => void;
  setVolume: (v: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  onToggleFavorite: () => void;
};

function fmt(s: number) {
  if (!s || isNaN(s)) return "0:00";
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

export default function NowPlaying({
  currentSong, playing, currentTime, duration, volume,
  shuffle, repeat, isFavorite,
  togglePlay, playNext, playPrev, seek, setVolume,
  toggleShuffle, toggleRepeat, onToggleFavorite,
}: Props) {
  const [muted, setMuted]           = useState(false);
  const [prevVol, setPrevVol]       = useState(volume);
  const [artVisible, setArtVisible] = useState(false);
  const [displayedArt, setDisplayedArt] = useState<string | undefined>();

  const artUrl = currentSong ? getArtworkUrl(currentSong.artworkUrl) : "";
  const progress = duration ? (currentTime / duration) * 100 : 0;

  useEffect(() => {
    setArtVisible(false);
    const t = setTimeout(() => { setDisplayedArt(artUrl || undefined); setArtVisible(true); }, 180);
    return () => clearTimeout(t);
  }, [currentSong?.id]);

  function toggleMute() {
    if (muted) { setVolume(prevVol); setMuted(false); }
    else { setPrevVol(volume); setVolume(0); setMuted(true); }
  }

  return (
    <div className="now-playing-panel">
      <div className={`np-backdrop ${artVisible && displayedArt ? "show" : ""}`}
        style={{ backgroundImage: displayedArt ? `url(${displayedArt})` : "none" }} />

      <div className="np-content">
        <div className="vinyl-wrapper">
          <div className={`vinyl-grooves ${playing ? "spinning" : ""}`}>
            {[1,2,3,4,5].map(i => (
              <div key={i} className="groove-ring" style={{ "--i": i } as React.CSSProperties} />
            ))}
          </div>
          <div className={`artwork-frame ${artVisible ? "visible" : ""}`}>
            {displayedArt
              ? <img src={displayedArt} alt="Album art" className="artwork-img" />
              : <div className="artwork-placeholder"><span>♪</span></div>}
          </div>
        </div>

        <div className="np-meta">
          <div className="np-title-row">
            <div className="np-title-group">
              <h2 className="np-title">{currentSong?.title ?? "No song selected"}</h2>
              <p className="np-artist">{currentSong?.artist ?? "—"}</p>
              <p className="np-album">{currentSong?.album ?? ""}</p>
            </div>
            <button className={`like-btn ${isFavorite ? "liked" : ""}`} onClick={onToggleFavorite} aria-label="Like">
              <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
            </button>
          </div>

          <div className="progress-track">
            <div className="progress-times">
              <span>{fmt(currentTime)}</span>
              <span>{fmt(duration)}</span>
            </div>
            <input
              type="range" min={0} max={duration || 100} value={currentTime}
              onChange={e => seek(Number(e.target.value))}
              className="progress-input"
              style={{ "--prog": `${progress}%` } as React.CSSProperties}
            />
          </div>

          <div className="np-controls">
            <button className={`ctrl-ghost ${shuffle ? "active" : ""}`} onClick={toggleShuffle} title="Shuffle"><Shuffle size={18} /></button>
            <button className="ctrl-ghost" onClick={playPrev} title="Previous"><SkipBack size={22} /></button>
            <button className={`ctrl-play ${playing ? "playing" : ""}`} onClick={togglePlay} title="Play/Pause">
              {playing ? <Pause size={22} /> : <Play size={22} />}
            </button>
            <button className="ctrl-ghost" onClick={playNext} title="Next"><SkipForward size={22} /></button>
            <button className={`ctrl-ghost ${repeat ? "active" : ""}`} onClick={toggleRepeat} title="Repeat"><Repeat size={18} /></button>
          </div>

          <div className="volume-row">
            <button className="ctrl-ghost small" onClick={toggleMute}>
              {volume === 0 || muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range" min={0} max={1} step={0.01} value={volume}
              onChange={e => { setVolume(Number(e.target.value)); setMuted(false); }}
              className="volume-input"
              style={{ "--vol": `${volume * 100}%` } as React.CSSProperties}
            />
          </div>

          <p className="kbd-hint">Space · Play/Pause &nbsp;|&nbsp; Ctrl+← → · Skip</p>
        </div>
      </div>
    </div>
  );
}