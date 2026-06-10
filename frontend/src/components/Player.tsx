import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
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
};

export default function Player({
  currentSong,
  audioRef,
  playing,
  togglePlay,
  currentTime,
  duration,
  playPreviousSong,
  playNextSong
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
      <div className="player-top">
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

          <div>

            <strong>
              {currentSong?.title}
            </strong>

            <p>
              {currentSong?.artist}
            </p>

          </div>

        </div>

        <div className="player-controls">

          <button onClick={playPreviousSong}>
            <SkipBack />
          </button>

          <button onClick={togglePlay}>
            {playing ? <Pause /> : <Play />}
          </button>

          <button onClick={playNextSong}>
            <SkipForward />
          </button>

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