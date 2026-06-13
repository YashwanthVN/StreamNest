import { useState } from "react";
import { Plus, Download, Trash2, ChevronRight, X, Check, Music } from "lucide-react";
import type { Song, Playlist } from "../types/Song";
import { getArtworkUrl } from "../services/api";
import {
  createPlaylist,
  deletePlaylist,
  renamePlaylist,
  removeFromPlaylist,
  exportPlaylist,
} from "../services/storage";

type Props = {
  playlists: Playlist[];
  songs: Song[];
  onPlay: (song: Song) => void;
  onChange: () => void; // trigger re-read from storage
};

export default function PlaylistsPanel({ playlists, songs, onPlay, onChange }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName]   = useState("");
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");

  const activePlaylist = playlists.find(p => p.id === selected);
  const playlistSongs  = activePlaylist
    ? activePlaylist.songIds.map(id => songs.find(s => s.id === id)).filter(Boolean) as Song[]
    : [];

  function handleCreate() {
    if (!newName.trim()) return;
    createPlaylist(newName.trim());
    setNewName(""); setCreating(false); onChange();
  }

  function handleRename(id: string) {
    if (!renameVal.trim()) return;
    renamePlaylist(id, renameVal.trim());
    setRenaming(null); onChange();
  }

  if (selected && activePlaylist) {
    return (
      <div className="panel-page">
        <div className="panel-header">
          <button className="panel-back" onClick={() => setSelected(null)}>← Playlists</button>
          <button
            className="panel-action-btn"
            onClick={() => exportPlaylist(activePlaylist, songs)}
            title="Download playlist"
          >
            <Download size={13} /> Export
          </button>
        </div>
        <p className="panel-playlist-name">{activePlaylist.name}</p>
        <p className="panel-playlist-meta">{playlistSongs.length} songs</p>

        {playlistSongs.length === 0 ? (
          <p className="empty-hint">No songs yet — add from the library</p>
        ) : (
          playlistSongs.map((song) => (
            <div key={song.id} className="queue-row" onClick={() => onPlay(song)}>
              <div className="queue-art">
                {getArtworkUrl(song.artworkUrl)
                  ? <img src={getArtworkUrl(song.artworkUrl)} alt="" />
                  : <div className="queue-art-fallback">♪</div>}
              </div>
              <div className="queue-meta">
                <p className="queue-title">{song.title}</p>
                <p className="queue-artist">{song.artist}</p>
              </div>
              <button
                className="queue-remove"
                onClick={e => {
                  e.stopPropagation();
                  removeFromPlaylist(activePlaylist.id, song.id);
                  onChange();
                }}
              >
                <X size={13} />
              </button>
            </div>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="panel-page">
      <div className="panel-header">
        <div className="panel-header-left">
          <Music size={16} />
          <span>Playlists</span>
        </div>
        <button className="panel-action-btn icon-btn" onClick={() => setCreating(true)} title="New playlist">
          <Plus size={14} />
        </button>
      </div>

      {creating && (
        <div className="create-row">
          <input
            autoFocus
            className="create-input"
            placeholder="Playlist name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setCreating(false); }}
          />
          <button className="create-confirm" onClick={handleCreate}><Check size={14} /></button>
          <button className="create-cancel"  onClick={() => setCreating(false)}><X size={14} /></button>
        </div>
      )}

      {playlists.length === 0 && !creating && (
        <p className="empty-hint">No playlists yet</p>
      )}

      {playlists.map(pl => (
        <div key={pl.id} className="playlist-row">
          {renaming === pl.id ? (
            <div className="create-row">
              <input
                autoFocus
                className="create-input"
                value={renameVal}
                onChange={e => setRenameVal(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleRename(pl.id); if (e.key === "Escape") setRenaming(null); }}
              />
              <button className="create-confirm" onClick={() => handleRename(pl.id)}><Check size={14} /></button>
              <button className="create-cancel" onClick={() => setRenaming(null)}><X size={14} /></button>
            </div>
          ) : (
            <>
              <div className="playlist-info" onClick={() => setSelected(pl.id)}>
                <p className="playlist-name">{pl.name}</p>
                <p className="playlist-meta">{pl.songIds.length} songs</p>
              </div>
              <div className="playlist-actions">
                <button className="playlist-act-btn" onClick={() => { setRenaming(pl.id); setRenameVal(pl.name); }} title="Rename">✎</button>
                <button className="playlist-act-btn danger" onClick={() => { deletePlaylist(pl.id); onChange(); }} title="Delete">
                  <Trash2 size={12} />
                </button>
                <ChevronRight size={14} className="playlist-arrow" onClick={() => setSelected(pl.id)} />
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}