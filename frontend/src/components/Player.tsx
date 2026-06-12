import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2 } from "lucide-react";
import type { Song } from "../types/Song";

type Props = {
  currentSong?: Song;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  playing: boolean;
  togglePlay: () => void;
  currentTime: number;
  duration: number;
  playPreviousSong: () => void;
  playNextSong: () => void;
  shuffle: boolean;
  repeat: boolean;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  volume: number;
  setVolume: (volume:number) => void;
};

export default function Player({
  currentSong,
  audioRef,
  playing,
  togglePlay,
  currentTime,
  duration,
  playPreviousSong,
  playNextSong,
  shuffle,
  repeat,
  toggleShuffle,
  toggleRepeat,
  volume,
  setVolume
}:Props){
  function seekSong(
    e: React.ChangeEvent<HTMLInputElement>
  ){

    if(!audioRef.current) return;

    audioRef.current.currentTime =
        Number(e.target.value);
  }

  function formatTime(seconds:number){

  if(!seconds) return "0:00";

  const mins = Math.floor(seconds / 60);

  const secs = Math.floor(seconds % 60);

  return `${mins}:${secs
      .toString()
      .padStart(2,"0")}`;
}
  return (
    <div className="player">
      <audio ref={audioRef} />
      <div className="player-layout">
        <div className="player-left">
          <div className="player-song">

            <img
              className="mini-cover"
              src={
                currentSong?.artworkUrl
                  ? `http://localhost:8080${currentSong.artworkUrl}`
                  : "https://placehold.co/100x100/1e293b/ffffff?text=🎵"
              }
              alt="album art"
            />

            <div className="song-meta">

              <div className="song-title-container">

                <div
                  className={
                    currentSong?.title &&
                    currentSong.title.length > 30
                      ? "song-title-scroll marquee"
                      : "song-title-scroll"
                  }
                >
                  {currentSong?.title}
                </div>

              </div>

              <p className="song-artist">
                {currentSong?.artist}
              </p>

            </div>

          </div>
        </div>

        <div className="player-center">
          <div className="player-controls">

            <button
              onClick={toggleShuffle}
              className={
                shuffle ? "active-control" : ""
              }
            >
              <Shuffle />
            </button>

            <button onClick={playPreviousSong}>
              <SkipBack />
            </button>

            <button onClick={togglePlay}>
              {playing ? <Pause /> : <Play />}
            </button>

            <button onClick={playNextSong}>
              <SkipForward />
            </button>

            <button
              onClick={toggleRepeat}
              className={
                repeat ? "active-control" : ""
              }
            >
              <Repeat />
            </button>

          </div>
          <div className="shortcut-help">
              Space • Play/Pause |
              ← → Seek |
              Ctrl+← Previous |
              Ctrl+→ Next
            </div>
        </div>

        <div className="player-right">
          <div className="volume-section">

            <Volume2 size={18} />

            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e)=>
                setVolume(
                  Number(e.target.value)
                )
              }
            />

          </div>
        </div>      

      </div>

      <div className="progress-section">

        <span>
          {formatTime(currentTime)}
        </span>

        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={seekSong}
          className="progress-bar"
        />

        <span>
          {formatTime(duration)}
        </span>

      </div>

    </div>
  );
}