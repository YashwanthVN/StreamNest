import { Music4, ListMusic, Heart, Settings } from "lucide-react";

type View = "library" | "favorites";

type Props = {
  activeView: View;
  onViewChange: (v: View) => void;
  songCount: number;
};

export default function Sidebar({ activeView, onViewChange, songCount }: Props) {
  const navItems = [
    { id: "library" as View, icon: Music4, label: "Library", count: songCount },
    { id: "favorites" as View, icon: Heart, label: "Favorites" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <ListMusic size={20} />
        </div>
        <span className="logo-text">StreamNest</span>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-section-label">Menu</p>
        {navItems.map(({ id, icon: Icon, label, count }) => (
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
        <Settings size={16} />
        <span>Settings</span>
      </button>
    </aside>
  );
}