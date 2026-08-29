/*
  Quiet Cupertino design system: native-feeling system typography, one cobalt accent,
  luminous material surfaces, generous whitespace, and calm once-per-second motion.
*/
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  Globe2,
  Maximize2,
  Moon,
  RotateCcw,
  Settings2,
  Sun,
  ScanLine,
} from "lucide-react";

const DAWN_TEXTURE = "/manus-storage/ios-clock-dawn_4c433a11.jpg";
const NIGHT_TEXTURE = "/manus-storage/ios-clock-night_3b598186.jpg";
const CLOCK_MARK = "/manus-storage/ios-clock-mark_0d3d39ae.png";
const PRODUCT_NAME = "TICK.";
type Preset = "dawn" | "ink" | "focus";

const defaultSettings = {
  theme: "light",
  accent: "cobalt",
  background: "dawn",
  surface: "glass",
  font: "system",
  clockSize: "standard",
  density: "spacious",
  motion: "full",
  hour12: true,
  showSeconds: true,
  showProgress: true,
  showDate: true,
} as const;

type Settings = {
  theme: "light" | "dark" | "auto";
  accent: "cobalt" | "violet" | "emerald" | "coral" | "mono";
  background: "dawn" | "midnight" | "paper" | "lavender";
  surface: "glass" | "solid" | "contrast";
  font: "system" | "rounded" | "mono";
  clockSize: "compact" | "standard" | "large";
  density: "spacious" | "balanced" | "focused";
  motion: "full" | "subtle" | "off";
  hour12: boolean;
  showSeconds: boolean;
  showProgress: boolean;
  showDate: boolean;
};

function getGreeting(hour: number) {
  if (hour < 5) return "good night";
  if (hour < 12) return "good morning";
  if (hour < 18) return "good afternoon";
  return "good evening";
}

function formatTime(date: Date, hour12: boolean) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12,
  }).format(date);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}

function loadSettings(): Settings {
  try {
    const saved = JSON.parse(window.localStorage.getItem("moments-settings") || "null");
    return { ...defaultSettings, ...(saved || {}) } as Settings;
  } catch {
    return { ...defaultSettings };
  }
}

function SettingSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<[string, string]> }) {
  return (
    <label className="setting-select">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}
      </select>
    </label>
  );
}

function SettingToggle({ label, detail, checked, onChange }: { label: string; detail: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="setting-toggle">
      <span className="setting-toggle-copy"><span>{label}</span><small>{detail}</small></span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="toggle-track" aria-hidden="true"><span /></span>
    </label>
  );
}

export default function Home() {
  const [now, setNow] = useState(() => new Date());
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [view, setView] = useState<"clock" | "settings">("clock");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [toast, setToast] = useState("");
  const shellRef = useRef<HTMLElement | null>(null);
  const pointerFrame = useRef<number | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("moments-settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      if (settings.motion === "off") return;
      if (pointerFrame.current) window.cancelAnimationFrame(pointerFrame.current);
      pointerFrame.current = window.requestAnimationFrame(() => {
        const shell = shellRef.current;
        if (!shell) return;
        shell.style.setProperty("--pointer-x", ((event.clientX / window.innerWidth - 0.5) * 2).toFixed(3));
        shell.style.setProperty("--pointer-y", ((event.clientY / window.innerHeight - 0.5) * 2).toFixed(3));
      });
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      if (pointerFrame.current) window.cancelAnimationFrame(pointerFrame.current);
    };
  }, [settings.motion]);

  useEffect(() => {
    const syncFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (focusMode) setFocusMode(false);
        else if (document.fullscreenElement) void document.exitFullscreen?.();
      }
    };
    document.addEventListener("fullscreenchange", syncFullscreen);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreen);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [focusMode]);

  const systemDark = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = settings.theme === "dark" || (settings.theme === "auto" && systemDark);
  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone.replace("_", " "), []);
  const timeParts = useMemo(() => {
    const formatted = formatTime(now, settings.hour12);
    const match = formatted.match(/^(.*?)(?::(\d{2}))?(?:\s(AM|PM))?$/i);
    return match ? { main: match[1], seconds: match[2] || "", meridiem: match[3] || "" } : { main: formatted, seconds: "", meridiem: "" };
  }, [now, settings.hour12]);
  const dayProgress = ((now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) / 86400) * 100;

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => setSettings((current) => ({ ...current, [key]: value }));
  const resetSettings = () => {
    setSettings({ ...defaultSettings });
    setToast("Settings reset to default");
    window.setTimeout(() => setToast(""), 1800);
  };

  const applyPreset = (preset: Preset) => {
    const presets: Record<Preset, Partial<Settings>> = {
      dawn: { theme: "light", accent: "cobalt", background: "dawn", surface: "glass", font: "system", clockSize: "standard", density: "spacious", motion: "full", showSeconds: true, showProgress: true, showDate: true },
      ink: { theme: "dark", accent: "mono", background: "midnight", surface: "contrast", font: "mono", clockSize: "large", density: "balanced", motion: "subtle", showSeconds: true, showProgress: true, showDate: true },
      focus: { theme: "dark", accent: "cobalt", background: "midnight", surface: "glass", font: "system", clockSize: "large", density: "focused", motion: "subtle", showSeconds: false, showProgress: false, showDate: false },
    };
    setSettings((current) => ({ ...current, ...presets[preset] }));
    setFocusMode(preset === "focus");
    setToast(`${preset[0].toUpperCase()}${preset.slice(1)} preset applied`);
    window.setTimeout(() => setToast(""), 1800);
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
    else await document.exitFullscreen?.();
  };

  const copyTime = async () => {
    try { await navigator.clipboard?.writeText(`${formatTime(now, settings.hour12)} · ${formatDate(now)}`); } catch { /* clipboard can be unavailable in local files */ }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <main
      ref={shellRef}
      className={`clock-shell ${isDark ? "clock-shell--dark" : ""} ${focusMode ? "focus-mode" : ""} theme-${settings.theme} accent-${settings.accent} background-${settings.background} surface-${settings.surface} font-${settings.font} size-${settings.clockSize} density-${settings.density} motion-${settings.motion}`}
      style={{ "--clock-texture": `url(${isDark ? NIGHT_TEXTURE : DAWN_TEXTURE})` } as React.CSSProperties}
    >
      <div className="clock-haze" aria-hidden="true" />
      <header className="clock-header">
        <button className="brand-lockup brand-button" type="button" onClick={() => setView("clock")} aria-label="Return to clock">
          <img className="brand-mark" src={CLOCK_MARK} alt="" />
          <span><span className="brand-name">{PRODUCT_NAME}</span><span className="brand-kicker">a quieter way to watch time</span></span>
        </button>
        <nav className="view-tabs" aria-label="Primary">
          <button className={view === "clock" ? "view-tab active" : "view-tab"} type="button" onClick={() => setView("clock")}>Clock</button>
          <button className={view === "settings" ? "view-tab active" : "view-tab"} type="button" onClick={() => setView("settings")}><Settings2 size={14} /> Settings</button>
        </nav>
        <div className="header-status" aria-label="Current location and local time status"><Globe2 size={15} strokeWidth={1.8} /><span>{timezone}</span><span className="status-dot" aria-hidden="true" /><span>live</span></div>
      </header>

      {view === "clock" ? (
        <>
          <section className="clock-stage" aria-labelledby="clock-heading">
            <div className="stage-copy"><p className="eyebrow">{getGreeting(now.getHours())}</p><h1 id="clock-heading">for this moment.</h1><p className="stage-note">A quiet read on now.</p></div>
            <div className="time-block" aria-live="polite">
              {settings.showDate && <p className="date-label"><CalendarDays size={15} strokeWidth={1.8} aria-hidden="true" />{formatDate(now)}</p>}
              <div className="time-readout" aria-label={`Current time ${formatTime(now, settings.hour12)}`}>
                <span className="time-main" key={`${now.getHours()}-${now.getMinutes()}`}>{timeParts.main}</span>
                {settings.showSeconds && <span className="time-seconds" key={now.getSeconds()}>{timeParts.seconds}</span>}
                {timeParts.meridiem && <span className="time-meridiem" key={timeParts.meridiem}>{timeParts.meridiem}</span>}
              </div>
              <div className="time-meta"><span>{settings.hour12 ? "12-hour format" : "24-hour format"}</span><span className="meta-rule" aria-hidden="true" /><span>{formatShortDate(now)}</span></div>
            </div>
            {settings.showProgress && <div className="stage-aside" aria-label="Day progress"><div className="progress-orbit"><svg viewBox="0 0 100 100" role="img" aria-label={`${Math.round(dayProgress)} percent of the day elapsed`}><circle className="orbit-track" cx="50" cy="50" r="44" /><circle className="orbit-progress" cx="50" cy="50" r="44" style={{ strokeDashoffset: 276.46 - (276.46 * dayProgress) / 100 }} /></svg><div className="orbit-center"><span className="orbit-value">{Math.round(dayProgress)}%</span><span className="orbit-label">of today</span></div></div><p className="aside-caption">The day is still unfolding.</p></div>}
          </section>
          <section className="utility-rail" aria-label="Quick clock controls"><div className="rail-intro"><span className="rail-icon"><Clock3 size={17} strokeWidth={1.8} /></span><div><p className="rail-title">clock preferences</p><p className="rail-subtitle">Make it feel like yours.</p></div></div><div className="rail-actions"><button className="control-chip" type="button" onClick={() => updateSetting("hour12", !settings.hour12)}><span className="chip-label">format</span><span className="chip-value">{settings.hour12 ? "12-hour" : "24-hour"}</span><span className="chip-check"><Check size={13} /></span></button><button className="control-chip" type="button" onClick={() => updateSetting("theme", isDark ? "light" : "dark")}><span className="chip-icon">{isDark ? <Moon size={15} /> : <Sun size={15} />}</span><span className="chip-label">appearance</span><span className="chip-value">{isDark ? "night" : "daylight"}</span></button><button className="icon-button" type="button" onClick={copyTime} aria-label="Copy current time" title="Copy current time">{copied ? <Check size={17} /> : <RotateCcw size={17} />}</button><button className="icon-button" type="button" onClick={() => setFocusMode((value) => !value)} aria-pressed={focusMode} aria-label={focusMode ? "Exit focus mode" : "Enter focus mode"} title={focusMode ? "Exit focus mode" : "Enter focus mode"}><ScanLine size={17} /></button><button className="icon-button" type="button" onClick={toggleFullscreen} aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"} title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}><Maximize2 size={17} /></button></div></section>
          <footer className="clock-footer"><p>Designed for the in-between moments.</p><p><span className="footer-line" aria-hidden="true" />local, precise, present</p></footer>
        </>
      ) : (
        <section className="settings-view" aria-labelledby="settings-heading">
          <div className="settings-heading"><button className="back-button" type="button" onClick={() => setView("clock")}><ArrowLeft size={16} /> Clock</button><div><p className="eyebrow">personalize your space</p><h1 id="settings-heading">Settings</h1><p>Shape the clock around the way you like to see time.</p></div><div className="settings-heading-actions"><button className="reset-button" type="button" onClick={resetSettings}>Reset all</button><button className="settings-fullscreen" type="button" onClick={toggleFullscreen}><Maximize2 size={14} /> {isFullscreen ? "Exit full screen" : "Full screen"}</button></div></div>
          <div className="preset-strip"><div><p className="group-heading-label">Quick presets</p><p className="group-heading-detail">Start with a complete mood</p></div><div className="preset-actions"><button type="button" className="preset-button preset-dawn" onClick={() => applyPreset("dawn")}><span />Dawn</button><button type="button" className="preset-button preset-ink" onClick={() => applyPreset("ink")}><span />Ink</button><button type="button" className="preset-button preset-focus" onClick={() => applyPreset("focus")}><span />Focus</button></div></div>
          <div className="settings-grid">
            <section className="settings-group"><div className="group-heading"><span>Visual system</span><small>Set the mood</small></div><div className="setting-row"><SettingSelect label="Theme" value={settings.theme} onChange={(value) => updateSetting("theme", value as Settings["theme"])} options={[["light", "Light"], ["dark", "Dark"], ["auto", "System"]]} /><SettingSelect label="Surface" value={settings.surface} onChange={(value) => updateSetting("surface", value as Settings["surface"])} options={[["glass", "Glass material"], ["solid", "Soft solid"], ["contrast", "High contrast"]]} /></div><div className="setting-row"><SettingSelect label="Background" value={settings.background} onChange={(value) => updateSetting("background", value as Settings["background"])} options={[["dawn", "Dawn haze"], ["midnight", "Midnight"], ["paper", "Warm paper"], ["lavender", "Blue lavender"]]} /><div className="setting-select"><span>Accent</span><div className="swatches" role="radiogroup" aria-label="Accent color">{(["cobalt", "violet", "emerald", "coral", "mono"] as const).map((accent) => <button key={accent} className={`swatch swatch-${accent} ${settings.accent === accent ? "selected" : ""}`} type="button" onClick={() => updateSetting("accent", accent)} aria-label={accent} aria-pressed={settings.accent === accent}><span /></button>)}</div></div></div></section>
            <section className="settings-group"><div className="group-heading"><span>Clock display</span><small>Choose your readout</small></div><div className="setting-row"><SettingSelect label="Clock size" value={settings.clockSize} onChange={(value) => updateSetting("clockSize", value as Settings["clockSize"])} options={[["compact", "Compact"], ["standard", "Standard"], ["large", "Large"]]} /><SettingSelect label="Layout density" value={settings.density} onChange={(value) => updateSetting("density", value as Settings["density"])} options={[["spacious", "Spacious"], ["balanced", "Balanced"], ["focused", "Focused"]]} /></div><div className="setting-stack"><SettingToggle label="12-hour format" detail="Use AM and PM markers" checked={settings.hour12} onChange={(value) => updateSetting("hour12", value)} /><SettingToggle label="Show seconds" detail="Keep the live tick visible" checked={settings.showSeconds} onChange={(value) => updateSetting("showSeconds", value)} /><SettingToggle label="Show date" detail="Keep today’s date above the clock" checked={settings.showDate} onChange={(value) => updateSetting("showDate", value)} /><SettingToggle label="Show day progress" detail="Display the circular progress ring" checked={settings.showProgress} onChange={(value) => updateSetting("showProgress", value)} /></div></section>
            <section className="settings-group"><div className="group-heading"><span>Type & motion</span><small>Feel every interaction</small></div><div className="setting-row"><SettingSelect label="Typography" value={settings.font} onChange={(value) => updateSetting("font", value as Settings["font"])} options={[["system", "System"], ["rounded", "Rounded"], ["mono", "Monospaced"]]} /><SettingSelect label="Motion" value={settings.motion} onChange={(value) => updateSetting("motion", value as Settings["motion"])} options={[["full", "Full fluid"], ["subtle", "Subtle"], ["off", "Reduced"]]} /></div><div className="settings-note"><span className="note-mark">✦</span><p>Changes save automatically on this device. Full fluid mode uses requestAnimationFrame for pointer response and second-aligned clock updates.</p></div></section>
          </div>
        </section>
      )}
      {focusMode && <button className="focus-exit" type="button" onClick={() => setFocusMode(false)}><ScanLine size={15} /> Exit focus mode <span>Esc</span></button>}
      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}
