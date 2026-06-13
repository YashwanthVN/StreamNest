import { useRef, useState, useEffect, useCallback } from "react";
import type { Song } from "../types/Song";
import { getStreamUrl, getArtworkUrl } from "../services/api";
import { pushHistory } from "../services/storage";

export function usePlayer(songs: Song[]) {
  const audioRef        = useRef<HTMLAudioElement>(new Audio());
  const [currentSong, setCurrentSong]   = useState<Song | undefined>();
  const [queue, setQueue]               = useState<Song[]>([]);   // upcoming
  const [playing, setPlaying]           = useState(false);
  const [currentTime, setCurrentTime]   = useState(0);
  const [duration, setDuration]         = useState(0);
  const [volume, setVolumeState]        = useState(0.8);
  const [shuffle, setShuffle]           = useState(false);
  const [repeat, setRepeat]             = useState(false);
  const [playHistory, setPlayHistory]   = useState<Song[]>([]);

  // ── Audio events ────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    const onTime     = () => setCurrentTime(audio.currentTime);
    const onMeta     = () => setDuration(audio.duration || 0);
    const onEnded    = () => {
      if (repeat) { audio.currentTime = 0; audio.play(); return; }
      playNext();
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnded);
    };
  }, [repeat, currentSong, queue, shuffle, songs]);

  useEffect(() => { audioRef.current.volume = volume; }, [volume]);

  // ── Media Session API ────────────────────────────────────
  useEffect(() => {
    if (!currentSong || !("mediaSession" in navigator)) return;
    const artUrl = getArtworkUrl(currentSong.artworkUrl);
    navigator.mediaSession.metadata = new MediaMetadata({
      title:  currentSong.title,
      artist: currentSong.artist,
      album:  currentSong.album,
      artwork: artUrl ? [{ src: artUrl, sizes: "512x512", type: "image/jpeg" }] : [],
    });
    navigator.mediaSession.setActionHandler("play",          () => { audioRef.current.play(); setPlaying(true); });
    navigator.mediaSession.setActionHandler("pause",         () => { audioRef.current.pause(); setPlaying(false); });
    navigator.mediaSession.setActionHandler("nexttrack",     () => playNext());
    navigator.mediaSession.setActionHandler("previoustrack", () => playPrev());
    navigator.mediaSession.setActionHandler("seekto", (d) => {
      if (d.seekTime != null) audioRef.current.currentTime = d.seekTime;
    });
  }, [currentSong]);

  // Keep Media Session playback state in sync
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = playing ? "playing" : "paused";
  }, [playing]);

  // ── Keyboard shortcuts ───────────────────────────────────
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.code === "Space")                       { e.preventDefault(); togglePlay(); }
      else if (e.code === "ArrowRight" && e.ctrlKey){ e.preventDefault(); playNext(); }
      else if (e.code === "ArrowLeft"  && e.ctrlKey){ e.preventDefault(); playPrev(); }
      else if (e.code === "ArrowRight") audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, audioRef.current.duration || 0);
      else if (e.code === "ArrowLeft")  audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [currentSong, songs, queue]);

  // ── Core play ────────────────────────────────────────────
  const _playSong = useCallback((song: Song, newQueue?: Song[]) => {
    const audio = audioRef.current;
    audio.src = getStreamUrl(song.fileName);
    audio.play().catch(console.error);
    setCurrentSong(song);
    setPlaying(true);
    pushHistory(song.id);
    setPlayHistory(h => [song, ...h.filter(s => s.id !== song.id)].slice(0, 50));
    if (newQueue !== undefined) setQueue(newQueue);
  }, []);

  // Called from UI: play a song and rebuild queue from library position
  const playSong = useCallback((song: Song) => {
    const idx = songs.findIndex(s => s.id === song.id);
    const tail = idx >= 0 ? songs.slice(idx + 1) : [];
    _playSong(song, tail);
  }, [songs, _playSong]);

  const togglePlay = useCallback(() => {
    if (!currentSong) return;
    const audio = audioRef.current;
    if (playing) { audio.pause(); setPlaying(false); }
    else         { audio.play().catch(console.error); setPlaying(true); }
  }, [playing, currentSong]);

  const playNext = useCallback(() => {
    if (shuffle) {
      const pool = songs.filter(s => s.id !== currentSong?.id);
      if (!pool.length) return;
      _playSong(pool[Math.floor(Math.random() * pool.length)]);
      return;
    }
    if (queue.length > 0) {
      const [next, ...rest] = queue;
      _playSong(next, rest);
      return;
    }
    if (!songs.length) return;
    const idx = songs.findIndex(s => s.id === currentSong?.id);
    _playSong(songs[(idx + 1) % songs.length]);
  }, [queue, songs, currentSong, shuffle, _playSong]);

  const playPrev = useCallback(() => {
    if (audioRef.current.currentTime > 3) { audioRef.current.currentTime = 0; return; }
    if (playHistory.length > 1) { _playSong(playHistory[1]); return; }
    if (!songs.length) return;
    const idx = songs.findIndex(s => s.id === currentSong?.id);
    _playSong(songs[(idx - 1 + songs.length) % songs.length]);
  }, [playHistory, songs, currentSong, _playSong]);

  const seek      = useCallback((t: number) => { audioRef.current.currentTime = t; }, []);
  const setVolume = useCallback((v: number) => { setVolumeState(v); audioRef.current.volume = v; }, []);

  // ── Queue management ─────────────────────────────────────
  const addToQueue        = useCallback((song: Song) => setQueue(q => [...q, song]), []);
  const removeFromQueue   = useCallback((idx: number) => setQueue(q => q.filter((_, i) => i !== idx)), []);
  const clearQueue        = useCallback(() => setQueue([]), []);
  const moveInQueue       = useCallback((from: number, to: number) => {
    setQueue(q => {
      const next = [...q];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }, []);

  return {
    audioRef,
    currentSong,
    queue,
    playing,
    currentTime,
    duration,
    volume,
    shuffle,
    repeat,
    playHistory,
    playSong,
    togglePlay,
    playNext,
    playPrev,
    seek,
    setVolume,
    addToQueue,
    removeFromQueue,
    clearQueue,
    moveInQueue,
    toggleShuffle: () => setShuffle(s => !s),
    toggleRepeat:  () => setRepeat(r => !r),
  };
}