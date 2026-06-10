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

  if(currentSong?.artworkUrl){

    document.body.style.setProperty(
      "--bg-art",
      `url(http://localhost:8080${currentSong.artworkUrl})`
    );

  }

}, [currentSong]);

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

    if(!currentSong) return;

    const index = songs.findIndex(
      s => s.id === currentSong.id
    );

    const nextSong =
      songs[(index + 1) % songs.length];

    if(nextSong){
      selectSong(nextSong);
    }

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

  function playNextSong() {

    if(!currentSong) return;

    const index =
        songs.findIndex(
            s => s.id === currentSong.id
        );

    const nextSong =
        songs[index + 1];

    if(nextSong){
      selectSong(nextSong);
    }
  }

  function playPreviousSong() {

    if(!currentSong) return;

    const index =
        songs.findIndex(
            s => s.id === currentSong.id
        );

    const previousSong =
        songs[index - 1];

    if(previousSong){
      selectSong(previousSong);
    }
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
      />

    </div>
  );
}

export default App;