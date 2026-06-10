import "./App.css";

import { useEffect, useRef, useState } from "react";

import Sidebar from "./components/Sidebar";
import SongList from "./components/SongList";
import SearchBar from "./components/SearchBar";
import Player from "./components/Player";
import AlbumArt from "./components/AlbumArt";

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

  useEffect(()=>{
    getSongs().then(setSongs);
  },[]);

  useEffect(() => {

  const audio = audioRef.current;

  if (!audio) return;

  const updateTime = () => {
    setCurrentTime(audio.currentTime);
  };

  const updateDuration = () => {
    setDuration(audio.duration || 0);
  };

  audio.addEventListener(
      "timeupdate",
      updateTime
  );

  audio.addEventListener(
      "loadedmetadata",
      updateDuration
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

  };

}, []);

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

    setPlaying(!playing);
  }

  return (

    <div className="app">

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

        <AlbumArt/>
        
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
      />

    </div>
  );
}

export default App;