import { useRef, useState, useEffect, useCallback } from "react";
import type { Song } from "../types/Song";
import { getStreamUrl } from "../services/api";

export function usePlayer(songs: Song[]) {
  const audioRef = useRef<HTMLAudioElement>(new Audio());

  const [currentSong, setCurrentSong] = useState<Song | undefined>();
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  /* ---------- Core playback actions ---------- */

  const playSong = useCallback((song: Song) => {
    const audio = audioRef.current;

    audio.src = getStreamUrl(song.fileName);
    audio.play().catch(console.error);

    setCurrentSong(song);
    setHistory((h) => [...h.slice(-49), song.id]);
  }, []);

  const playNext = useCallback(() => {
    if (!songs.length) return;

    if (shuffle) {
      const others = songs.filter((s) => s.id !== currentSong?.id);
      const next =
        others[Math.floor(Math.random() * others.length)] || songs[0];

      playSong(next);
    } else {
      const idx = songs.findIndex((s) => s.id === currentSong?.id);
      playSong(songs[(idx + 1) % songs.length]);
    }
  }, [songs, currentSong, shuffle, playSong]);

  const playPrev = useCallback(() => {
    if (!songs.length) return;

    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    if (history.length > 1) {
      const prevId = history[history.length - 2];
      const prev = songs.find((s) => s.id === prevId);

      if (prev) {
        setHistory((h) => h.slice(0, -1));
        playSong(prev);
        return;
      }
    }

    const idx = songs.findIndex((s) => s.id === currentSong?.id);
    playSong(songs[(idx - 1 + songs.length) % songs.length]);
  }, [songs, currentSong, history, playSong]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;

    if (!currentSong) return;

    if (audio.paused) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [currentSong]);

  const seek = useCallback((time: number) => {
    audioRef.current.currentTime = time;
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    audioRef.current.volume = v;
  }, []);

  /* ---------- Audio event listeners ---------- */

  useEffect(() => {
    const audio = audioRef.current;

    const onTime = () => setCurrentTime(audio.currentTime);

    const onDuration = () => {
      setDuration(audio.duration || 0);
    };

    const onPlay = () => {
      setPlaying(true);
    };

    const onPause = () => {
      setPlaying(false);
    };

    const onEnded = () => {
      if (repeat) {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else {
        playNext();
      }
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onDuration);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onDuration);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, [repeat, playNext]);

  /* ---------- Volume sync ---------- */

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  /* ---------- Keyboard shortcuts ---------- */

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;

      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "ArrowRight" && e.ctrlKey) {
        e.preventDefault();
        playNext();
      } else if (e.code === "ArrowLeft" && e.ctrlKey) {
        e.preventDefault();
        playPrev();
      } else if (e.code === "ArrowRight") {
        audioRef.current.currentTime = Math.min(
          audioRef.current.currentTime + 10,
          audioRef.current.duration || 0
        );
      } else if (e.code === "ArrowLeft") {
        audioRef.current.currentTime = Math.max(
          audioRef.current.currentTime - 10,
          0
        );
      }
    };

    window.addEventListener("keydown", handler);

    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [togglePlay, playNext, playPrev]);

  return {
    audioRef,
    currentSong,
    playing,
    currentTime,
    duration,
    volume,
    shuffle,
    repeat,
    playSong,
    togglePlay,
    playNext,
    playPrev,
    seek,
    setVolume,
    toggleShuffle: () => setShuffle((s) => !s),
    toggleRepeat: () => setRepeat((r) => !r),
  };
}