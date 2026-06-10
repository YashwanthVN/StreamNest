import { Music, Search } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h2>🎵 StreamNest</h2>

      <nav>
        <button>
          <Music size={18}/>
          Library
        </button>

        <button>
          <Search size={18}/>
          Search
        </button>
      </nav>
    </aside>
  );
}