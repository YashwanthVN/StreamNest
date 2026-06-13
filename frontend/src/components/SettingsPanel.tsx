import { Settings } from "lucide-react";
import type { Theme } from "../services/storage";
import { saveTheme } from "../services/storage";

type Props = {
  currentTheme: Theme;
  onThemeChange: (t: Theme) => void;
};

const THEMES: { id: Theme; label: string; desc: string; preview: string }[] = [
  { id: "dark",    label: "Dark",         desc: "Default deep navy",         preview: "#080C14" },
  { id: "amoled",  label: "AMOLED",       desc: "True black, saves battery", preview: "#000000" },
  { id: "spotify", label: "Spotify Green", desc: "Classic green accent",     preview: "#121212" },
  { id: "retro",   label: "Retro Vinyl",  desc: "Warm sepia tones",          preview: "#1A1208" },
];

export default function SettingsPanel({ currentTheme, onThemeChange }: Props) {
  function handleTheme(t: Theme) {
    saveTheme(t);
    onThemeChange(t);
  }

  return (
    <div className="panel-page">
      <div className="panel-header">
        <div className="panel-header-left">
          <Settings size={16} />
          <span>Settings</span>
        </div>
      </div>

      <div className="settings-section">
        <p className="settings-section-label">Theme</p>
        <div className="theme-grid">
          {THEMES.map(t => (
            <button
              key={t.id}
              className={`theme-card ${currentTheme === t.id ? "selected" : ""}`}
              onClick={() => handleTheme(t.id)}
            >
              <div className="theme-swatch" style={{ background: t.preview }}>
                <div className="theme-swatch-accent" data-theme-id={t.id} />
              </div>
              <p className="theme-name">{t.label}</p>
              <p className="theme-desc">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <p className="settings-section-label">About</p>
        <div className="settings-row">
          <span>Version</span><span className="settings-val">1.0.0</span>
        </div>
        <div className="settings-row">
          <span>Storage</span>
          <span className="settings-val">{(JSON.stringify(localStorage).length / 1024).toFixed(1)} KB used</span>
        </div>
      </div>
    </div>
  );
}