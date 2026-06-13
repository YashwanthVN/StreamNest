import { useEffect, useState } from "react";
import type { Song } from "../types/Song";
import { getArtworkUrl } from "../services/api";
import {
  Play, Pause, SkipBack, SkipForward,
  Shuffle, Repeat, Volume2, VolumeX, Heart
} from "lucide-react";

type Props = {
  currentSong?: Song;
  playing: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: boolean;
  togglePlay: () => void;
  playNext: () => void;
  playPrev: () => void;
  seek: (t: number) => void;
  setVolume: (v: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
};

function formatTime(s: number) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function NowPlaying({
  currentSong,
  playing,
  currentTime,
  duration,
  volume,
  shuffle,
  repeat,
  togglePlay,
  playNext,
  playPrev,
  seek,
  setVolume,
  toggleShuffle,
  toggleRepeat,
}: Props) {
  const [liked, setLiked] = useState(false);
  const [muted, setMuted] = useState(false);
  const [prevVol, setPrevVol] = useState(volume);
  const [artVisible, setArtVisible] = useState(false);
  const [displayedArt, setDisplayedArt] = useState<string | undefined>();

  const artUrl = currentSong ? getArtworkUrl(currentSong.artworkUrl) : "";

  // Crossfade artwork on song change
  useEffect(() => {
    setArtVisible(false);
    setLiked(false);
    const t = setTimeout(() => {
      setDisplayedArt(artUrl || undefined);
      setArtVisible(true);
    }, 180);
    return () => clearTimeout(t);
  }, [currentSong?.id]);

  const progress = duration ? (currentTime / duration) * 100 : 0;

  function toggleMute() {
    if (muted) {
      setVolume(prevVol);
      setMuted(false);
    } else {
      setPrevVol(volume);
      setVolume(0);
      setMuted(true);
    }
  }

  return (
    <div className="now-playing-panel">
      {/* Blurred background */}
      <div
        className={`np-backdrop ${artVisible && displayedArt ? "show" : ""}`}
        style={{ backgroundImage: displayedArt ? `url(${displayedArt})` : "none" }}
      />

      <div className="np-content">
        {/* Artwork with vinyl groove rings */}
        <div className="vinyl-wrapper">
          <div className={`vinyl-grooves ${playing ? "spinning" : ""}`}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="groove-ring" style={{ "--i": i } as React.CSSProperties} />
            ))}
          </div>
          <div className={`artwork-frame ${artVisible ? "visible" : ""}`}>
            {displayedArt ? (
              <img src={displayedArt} alt="Album art" className="artwork-img" />
            ) : (
              <div className="artwork-placeholder">
                <span>♪</span>
              </div>
            )}
          </div>
        </div>

        {/* Song info */}
        <div className="np-meta">
          <div className="np-title-row">
            <div className="np-title-group">
              <h2 className="np-title">
                {currentSong?.title ?? "No song selected"}
              </h2>
              <p className="np-artist">
                {currentSong?.artist ?? "—"}
              </p>
              <p className="np-album">
                {currentSong?.album ?? ""}
              </p>
            </div>
            <button
              className={`like-btn ${liked ? "liked" : ""}`}
              onClick={() => setLiked((l) => !l)}
              aria-label="Like"
            >
              <Heart size={20} fill={liked ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Progress */}
          <div className="progress-track">
            <div className="progress-times">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="progress-bar-wrap">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={(e) => seek(Number(e.target.value))}
                className="progress-input"
                style={{ "--prog": `${progress}%` } as React.CSSProperties}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="np-controls">
            <button
              className={`ctrl-ghost ${shuffle ? "active" : ""}`}
              onClick={toggleShuffle}
              title="Shuffle"
            >
              <Shuffle size={18} />
            </button>
            <button className="ctrl-ghost" onClick={playPrev} title="Previous">
              <SkipBack size={22} />
            </button>
            <button
              className={`ctrl-play ${playing ? "playing" : ""}`}
              onClick={togglePlay}
              title="Play/Pause"
            >
              {playing ? <Pause size={22} /> : <Play size={22} />}
            </button>
            <button className="ctrl-ghost" onClick={playNext} title="Next">
              <SkipForward size={22} />
            </button>
            <button
              className={`ctrl-ghost ${repeat ? "active" : ""}`}
              onClick={toggleRepeat}
              title="Repeat"
            >
              <Repeat size={18} />
            </button>
          </div>

          {/* Volume */}
          <div className="volume-row">
            <button className="ctrl-ghost small" onClick={toggleMute}>
              {volume === 0 || muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => {
                setVolume(Number(e.target.value));
                setMuted(false);
              }}
              className="volume-input"
              style={{ "--vol": `${volume * 100}%` } as React.CSSProperties}
            />
          </div>

          {/* Keyboard hint */}
          <p className="kbd-hint">
            Space · Play/Pause &nbsp;|&nbsp; Ctrl+← → · Skip
          </p>
        </div>
      </div>
    </div>
  );
}