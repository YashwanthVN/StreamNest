import "./App.css";

import { useEffect, useRef, useState } from "react";

import Sidebar from "./components/Sidebar";
import SongList from "./components/SongList";
import SearchBar from "./components/SearchBar";
import Player from "./components/Player";
import AlbumArt from "./components/AlbumArt";
import AnimatedBackground from "./components/AnimatedBackground";

import { getSongs } from "./services/api";

import type { Song } from "./types/Song";

function App() {

  const [songs,setSongs] = useState<Song[]>([]);
  const [search,setSearch] = useState("");

  const [currentSong,setCurrentSong] =
      useState<Song>();

  const [playing,setPlaying] =
      useState(false);

  const audioRef =
      useRef<HTMLAudioElement>(null);

  const [currentTime, setCurrentTime] = useState(0);

  const [duration, setDuration] = useState(0);

  const [shuffle, setShuffle] = useState(false);

  const [repeat, setRepeat] = useState(false);

  const [volume, setVolume] = useState(1);

  useEffect(() => {

    if(audioRef.current){
      audioRef.current.volume = volume;
    }

  }, [volume]);

  useEffect(()=>{
    getSongs().then(setSongs);
  },[]);

  useEffect(() => {

    if(songs.length > 0 && !currentSong){
      selectSong(songs[0]);
    }

  }, [songs]);

  useEffect(() => {

    const audio = audioRef.current;

    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const updateDuration = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {

      if(repeat){

        audio.currentTime = 0;

        audio.play();

        return;
      }

      playNextSong();
    };

    audio.addEventListener(
        "timeupdate",
        updateTime
    );

    audio.addEventListener(
        "loadedmetadata",
        updateDuration
    );

    audio.addEventListener(
      "ended",
      handleEnded
    );

    return () => {

      audio.removeEventListener(
          "timeupdate",
          updateTime
      );

      audio.removeEventListener(
          "loadedmetadata",
          updateDuration
      );

      audio.removeEventListener(
        "ended",
        handleEnded
      );

    };

  }, [currentSong, songs]);

  useEffect(() => {

    function handleKeyDown(
      e: KeyboardEvent
    ) {

      if(!audioRef.current) return;

      const audio = audioRef.current;

      // Ignore when typing in search box
      const target =
        e.target as HTMLElement;

      if(
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA"
      ){
        return;
      }

      // Space = Play / Pause
      if(e.code === "Space"){

        e.preventDefault();

        togglePlay();
      }

      // Seek backward 5 sec
      if(
        e.code === "ArrowLeft" &&
        !e.ctrlKey
      ){

        audio.currentTime =
          Math.max(
            0,
            audio.currentTime - 5
          );
      }

      // Seek forward 5 sec
      if(
        e.code === "ArrowRight" &&
        !e.ctrlKey
      ){

        audio.currentTime =
          Math.min(
            audio.duration,
            audio.currentTime + 5
          );
      }

      // Previous Song
      if(
        e.ctrlKey &&
        e.code === "ArrowLeft"
      ){

        playPreviousSong();
      }

      // Next Song
      if(
        e.ctrlKey &&
        e.code === "ArrowRight"
      ){

        playNextSong();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

    };

  }, [
    playing,
    currentSong,
    songs
  ]);

  const filteredSongs = songs.filter(song => {

    const q = search.toLowerCase();

    return (
        song.title.toLowerCase().includes(q) ||
        song.artist.toLowerCase().includes(q) ||
        song.album.toLowerCase().includes(q)
    );
  });

  function selectSong(song:Song){

    setCurrentSong(song);

    if(audioRef.current){

      audioRef.current.src =
        `http://localhost:8080/api/stream/${encodeURIComponent(song.fileName)}`;

      audioRef.current.play();

      setPlaying(true);
    }
  }

  function togglePlay(){

    if(!audioRef.current) return;

    if(playing){
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setPlaying(prev => !prev);
  }

  function playNextSong() {

    if(!currentSong || songs.length === 0){
      return;
    }

    if(shuffle){

      const randomIndex =
          Math.floor(
              Math.random() * songs.length
          );

      selectSong(
          songs[randomIndex]
      );

      return;
    }

    const currentIndex =
        songs.findIndex(
            s => s.id === currentSong.id
        );

    const nextIndex =
        (currentIndex + 1)
        % songs.length;

    selectSong(
        songs[nextIndex]
    );
  }

  function playPreviousSong() {

    if(!currentSong || songs.length === 0){
      return;
    }

    const currentIndex =
        songs.findIndex(
            s => s.id === currentSong.id
        );

    const previousIndex =
        currentIndex === 0
            ? songs.length - 1
            : currentIndex - 1;

    selectSong(
        songs[previousIndex]
    );
  }

  return (

    <div className="app">

      <AnimatedBackground
        artworkUrl={currentSong?.artworkUrl}
      />


      <Sidebar/>

      <main
        style={{
          flex:1,
          padding:"20px"
        }}
      >

        <SearchBar
          search={search}
          setSearch={setSearch}
        />

        <div className="hero">

          <AlbumArt
            artworkUrl={currentSong?.artworkUrl}
          />

          <div className="hero-info">

            <p className="now-playing">
              NOW PLAYING
            </p>

            <h1>
              {currentSong?.title || "Select a song"}
            </h1>

            <h3>
              {currentSong?.artist}
            </h3>

            <p>
              {currentSong?.album}
            </p>

            <p>
              {filteredSongs.length} songs
            </p>

          </div>

        </div>
        
        <p className="song-count">
          {filteredSongs.length} songs
        </p>

        <SongList
          songs={filteredSongs}
          currentSongId={currentSong?.id}
          onSelect={selectSong}
        />

      </main>
      

      <Player
        currentSong={currentSong}
        audioRef={audioRef}
        playing={playing}
        togglePlay={togglePlay}
        currentTime={currentTime}
        duration={duration}
        playPreviousSong={playPreviousSong}
        playNextSong={playNextSong}

        shuffle={shuffle}
        repeat={repeat}

        toggleShuffle={() =>
            setShuffle(!shuffle)
        }

        toggleRepeat={() =>
            setRepeat(!repeat)
        }

        volume={volume}
        setVolume={setVolume}
      />

    </div>
  );
}

export default App;