import { useState } from "react";
import { Clock, Info, X } from "lucide-react";
import type { Song, HistoryEntry } from "../types/Song";
import { getArtworkUrl } from "../services/api";
import { clearHistory } from "../services/storage";

type Props = {
  entries: HistoryEntry[];
  songs: Song[];
  onPlay: (song: Song) => void;
  onClear: () => void;
};

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function fullStamp(ms: number): string {
  return new Date(ms).toLocaleString(undefined, {
    dateStyle: "medium", timeStyle: "short",
  });
}

export default function HistoryPanel({ entries, songs, onPlay, onClear }: Props) {
  const [tooltip, setTooltip] = useState<number | null>(null);

  const resolved = entries
    .map(e => ({ entry: e, song: songs.find(s => s.id === e.songId) }))
    .filter(r => r.song);

  return (
    <div className="panel-page">
      <div className="panel-header">
        <div className="panel-header-left">
          <Clock size={16} />
          <span>Recently played</span>
          {resolved.length > 0 && <span className="panel-count">{resolved.length}</span>}
        </div>
        {resolved.length > 0 && (
          <button
            className="panel-action-btn"
            onClick={() => { clearHistory(); onClear(); }}
          >
            Clear
          </button>
        )}
      </div>

      {resolved.length === 0 ? (
        <p className="empty-hint">Nothing played yet</p>
      ) : (
        resolved.map(({ entry, song }, i) => (
          <div key={i} className="queue-row" onClick={() => onPlay(song!)}>
            <div className="queue-art">
              {getArtworkUrl(song!.artworkUrl)
                ? <img src={getArtworkUrl(song!.artworkUrl)} alt="" />
                : <div className="queue-art-fallback">♪</div>}
            </div>
            <div className="queue-meta">
              <p className="queue-title">{song!.title}</p>
              <p className="queue-artist">{song!.artist}</p>
            </div>
            <div className="history-right">
              <span className="history-time">{timeAgo(entry.playedAt)}</span>
              <button
                className="info-btn"
                onClick={e => { e.stopPropagation(); setTooltip(tooltip === i ? null : i); }}
                title="Details"
              >
                <Info size={13} />
              </button>
            </div>
            {tooltip === i && (
              <div className="history-tooltip">
                <button className="tooltip-close" onClick={e => { e.stopPropagation(); setTooltip(null); }}>
                  <X size={11} />
                </button>
                <p className="tooltip-song">{song!.title}</p>
                <p className="tooltip-detail">{song!.artist} · {song!.album}</p>
                <p className="tooltip-stamp">{fullStamp(entry.playedAt)}</p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}