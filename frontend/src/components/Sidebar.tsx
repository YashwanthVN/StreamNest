import { Music4, ListMusic, Heart, Clock, List, Settings } from "lucide-react";

export type View = "library" | "favorites" | "queue" | "history" | "playlists";

type Props = {
  activeView: View;
  onViewChange: (v: View) => void;
  songCount: number;
  queueCount: number;
};

export default function Sidebar({ activeView, onViewChange, songCount, queueCount }: Props) {
  const nav: { id: View; icon: React.ElementType; label: string; count?: number }[] = [
    { id: "library",   icon: Music4,    label: "Library",   count: songCount },
    { id: "favorites", icon: Heart,     label: "Favorites" },
    { id: "playlists", icon: List,      label: "Playlists" },
    { id: "queue",     icon: ListMusic, label: "Queue",     count: queueCount || undefined },
    { id: "history",   icon: Clock,     label: "History" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark"><ListMusic size={20} /></div>
        <span className="logo-text">StreamNest</span>
      </div>
      <nav className="sidebar-nav">
        <p className="nav-section-label">Menu</p>
        {nav.map(({ id, icon: Icon, label, count }) => (
          <button
            key={id}
            className={`nav-item ${activeView === id ? "active" : ""}`}
            onClick={() => onViewChange(id)}
          >
            <Icon size={18} />
            <span>{label}</span>
            {count !== undefined && <span className="nav-badge">{count}</span>}
          </button>
        ))}
      </nav>
      <button className="sidebar-settings">
        <Settings size={16} /><span>Settings</span>
      </button>
    </aside>
  );
}