import { useRef, useState } from "react";
import { X, GripVertical, ListMusic } from "lucide-react";
import type { Song } from "../types/Song";
import { getArtworkUrl } from "../services/api";

type Props = {
  queue: Song[];
  currentSong?: Song;
  onRemove: (idx: number) => void;
  onClear: () => void;
  onPlay: (song: Song) => void;
  onMove: (from: number, to: number) => void;
};

export default function QueuePanel({ queue, currentSong, onRemove, onClear, onPlay, onMove }: Props) {
  const dragIdx   = useRef<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  function onDragStart(i: number) { dragIdx.current = i; }
  function onDragOver(e: React.DragEvent, i: number) {
    e.preventDefault();
    setOverIdx(i);
  }
  function onDrop(i: number) {
    if (dragIdx.current !== null && dragIdx.current !== i) onMove(dragIdx.current, i);
    dragIdx.current = null; setOverIdx(null);
  }
  function onDragEnd() { dragIdx.current = null; setOverIdx(null); }

  return (
    <div className="panel-page">
      <div className="panel-header">
        <div className="panel-header-left">
          <ListMusic size={16} />
          <span>Queue</span>
          {queue.length > 0 && <span className="panel-count">{queue.length}</span>}
        </div>
        {queue.length > 0 && <button className="panel-action-btn" onClick={onClear}>Clear</button>}
      </div>

      {currentSong && (
        <div className="queue-section">
          <p className="queue-section-label">Now playing</p>
          <div className="queue-row current">
            <div className="queue-art">
              {getArtworkUrl(currentSong.artworkUrl)
                ? <img src={getArtworkUrl(currentSong.artworkUrl)} alt="" />
                : <div className="queue-art-fallback">♪</div>}
            </div>
            <div className="queue-meta">
              <p className="queue-title accent">{currentSong.title}</p>
              <p className="queue-artist">{currentSong.artist}</p>
            </div>
          </div>
        </div>
      )}

      <div className="queue-section">
        <p className="queue-section-label">Up next{queue.length === 0 ? " · empty" : ""}</p>
        {queue.length === 0 ? (
          <p className="empty-hint">Songs you add will appear here</p>
        ) : (
          queue.map((song, i) => (
            <div
              key={`${song.id}-${i}`}
              className={`queue-row draggable ${overIdx === i ? "drag-over" : ""}`}
              draggable
              onDragStart={() => onDragStart(i)}
              onDragOver={e => onDragOver(e, i)}
              onDrop={() => onDrop(i)}
              onDragEnd={onDragEnd}
              onClick={() => onPlay(song)}
            >
              <GripVertical size={14} className="queue-grip active-grip" />
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
                onClick={e => { e.stopPropagation(); onRemove(i); }}
                title="Remove"
              >
                <X size={13} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}