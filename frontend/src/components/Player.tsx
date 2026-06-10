import { Play, Pause } from "lucide-react";

type Props = {
  currentSong?: string;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  playing:boolean;
  togglePlay:()=>void;
};

export default function Player({
  currentSong,
  audioRef,
  playing,
  togglePlay
}:Props){

  return (
    <div className="player">

      <audio ref={audioRef} />

      <button onClick={togglePlay}>
        {playing ? <Pause /> : <Play />}
      </button>

      <p>{currentSong}</p>

    </div>
  );
}