"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Theme System ─────────────────────────────────────────────────────────────
type Theme = "dark" | "light";

function getColors(theme: Theme) {
  const dark = theme === "dark";
  return {
    bg:            dark ? "#000"                   : "#f2f2f7",
    surface:       dark ? "#1c1c1e"               : "#ffffff",
    surface2:      dark ? "#2c2c2e"               : "#f2f2f7",
    text:          dark ? "#ffffff"               : "#000000",
    textSub:       dark ? "#8a8a8e"               : "#6c6c70",
    textFaint:     dark ? "#48484a"               : "#aeaeb2",
    accent:        "#3E91FF",
    success:       dark ? "#34C759"               : "#30b956",
    statusColor:   dark ? "#ffffff"               : "#000000",
    sep:           dark ? "rgba(255,255,255,0.07)": "rgba(0,0,0,0.09)",
    wallpaper: dark
      ? "radial-gradient(ellipse at 30% 15%, rgba(76,141,255,0.06) 0%, transparent 60%), radial-gradient(ellipse at 75% 80%, rgba(93,58,155,0.05) 0%, transparent 55%)"
      : "radial-gradient(ellipse at 30% 15%, rgba(76,141,255,0.07) 0%, transparent 55%), radial-gradient(ellipse at 70% 85%, rgba(255,80,130,0.04) 0%, transparent 50%)",
    keyboardBg:    dark ? "#1c1c1e"               : "#cdd0d5",
    keyBg:         dark ? "#3a3a3c"               : "#ffffff",
    keySpecialBg:  dark ? "#2c2c2e"               : "#adb5bd",
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Phase = "input" | "processing" | "navigating" | "resolved";

interface SettingsNode {
  label: string;
  icon: React.ReactNode;
  depth: number;
}

interface PipelineStage {
  id: string;
  label: string;
  sublabel: string;
  status: "pending" | "running" | "done" | "skipped";
  ms?: number;
}

// ─── SVG Icon Library ─────────────────────────────────────────────────────────
const S = ({ d, children, vb = "0 0 24 24", ...p }: any) => (
  <svg width="20" height="20" viewBox={vb} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    {d ? <path d={d} /> : children}
  </svg>
);

const ISettings  = () => <S><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></S>;
const IBattery   = () => <S><rect x="1" y="6" width="18" height="12" rx="2"/><line x1="23" y1="13" x2="23" y2="11"/></S>;
const IWifi      = () => <S><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></S>;
const IShield    = () => <S d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;
const IThermo    = () => <S d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />;
const IChart     = () => <S><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></S>;
const ISearch    = () => <S><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></S>;
const IBell      = () => <S><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></S>;
const IDisplay   = () => <S><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></S>;
const ILock      = () => <S><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></S>;
const IApps      = () => <S><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></S>;
const IUser      = () => <S><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></S>;
const IPhone     = () => <S d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.5 1.32h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 5.68 5.68l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.04z" />;
const IInfo      = () => <S><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></S>;
const IGalaxyAI  = () => <S><path d="M12 2v20M17 5l-10 14M7 5l10 14"/><circle cx="12" cy="12" r="2" fill="currentColor"/></S>;
const ISun       = () => <S width="16" height="16"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></S>;
const IMoon      = () => <S width="16" height="16" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />;
const IChevron   = ({ color }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const ICheck     = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ─── Battery & Signal SVGs ────────────────────────────────────────────────────
function BatterySVG({ level, color }: { level: number; color: string }) {
  const fill = Math.max(0, Math.min(1, level / 100)) * 14;
  const fillColor = level > 20 ? color : "#FF3B30";
  return (
    <svg width="22" height="12" viewBox="0 0 22 12" fill="none">
      <rect x="0.5" y="0.5" width="18" height="11" rx="2.5" stroke={color} strokeWidth="1" />
      <rect x="2" y="2" width={fill} height="8" rx="1.5" fill={fillColor} />
      <path d="M20 4v4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SignalBars({ bars, color }: { bars: number; color: string }) {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
      {[0, 1, 2, 3].map(i => (
        <rect key={i} x={i * 4} y={12 - (i + 1) * 3} width="3" height={(i + 1) * 3} rx="0.5"
          fill={i < bars ? color : `${color}33`} />
      ))}
    </svg>
  );
}

// ─── Ripple Hook & Container ──────────────────────────────────────────────────
function useRipple() {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const createRipple = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples(r => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples(r => r.filter(rip => rip.id !== id)), 600);
  }, []);
  return { ripples, createRipple };
}

function Ripple({ onClick, style, children }: {
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const { ripples, createRipple } = useRipple();
  return (
    <div
      onClick={e => { createRipple(e); onClick?.(e); }}
      style={{ position: "relative", overflow: "hidden", cursor: "pointer", ...style }}
    >
      {ripples.map(r => (
        <span key={r.id} style={{
          position: "absolute", left: r.x, top: r.y,
          width: 0, height: 0, borderRadius: "50%",
          background: "rgba(255,255,255,0.18)",
          transform: "translate(-50%, -50%)",
          animation: "rippleExpand 0.6s ease-out forwards",
          pointerEvents: "none", zIndex: 9999,
        }} />
      ))}
      {children}
    </div>
  );
}

// ─── Settings Data ────────────────────────────────────────────────────────────
const ALL_SETTINGS = [
  { icon: <IUser />,    title: "Samsung account",      color: "#007AFF" },
  { icon: <IDisplay />, title: "Display",              color: "#FF9500" },
  { icon: <IBell />,    title: "Notifications",        color: "#FF3B30" },
  { icon: <IBattery />, title: "Battery and device care", color: "#34C759" },
  { icon: <IWifi />,    title: "Connections",          color: "#007AFF" },
  { icon: <IApps />,    title: "Apps",                 color: "#5856D6" },
  { icon: <ILock />,    title: "Lock screen and AOD",  color: "#FF6B00" },
  { icon: <IShield />,  title: "Security and privacy", color: "#FF2D55" },
  { icon: <IPhone />,   title: "Phone",                color: "#34C759" },
  { icon: <ISettings />, title: "General management", color: "#8E8E93" },
  { icon: <IInfo />,    title: "About phone",          color: "#636366" },
  { icon: <IChart />,   title: "Digital Wellbeing",   color: "#AF52DE" },
];

function getIconForLabel(label: string) {
  const l = label.toLowerCase();
  if (l.includes("battery") || l.includes("power")) return <IBattery />;
  if (l.includes("wifi") || l.includes("connection") || l.includes("internet")) return <IWifi />;
  if (l.includes("display") || l.includes("screen") || l.includes("brightness")) return <IDisplay />;
  if (l.includes("lock") || l.includes("security") || l.includes("privacy")) return <ILock />;
  if (l.includes("app")) return <IApps />;
  if (l.includes("account") || l.includes("user")) return <IUser />;
  if (l.includes("device care") || l.includes("performance") || l.includes("storage") || l.includes("wellbeing")) return <IChart />;
  if (l.includes("temperature") || l.includes("heat")) return <IThermo />;
  if (l.includes("reset") || l.includes("general") || l.includes("about")) return <IInfo />;
  if (l.includes("notification") || l.includes("sound") || l.includes("vibrat") || l.includes("disturb")) return <IBell />;
  if (l.includes("shield") || l.includes("protect")) return <IShield />;
  if (l.includes("phone") || l.includes("call")) return <IPhone />;
  return <ISettings />;
}

const PRESETS = [
  { label: "battery draining fast", path: [
    { label: "Settings",              icon: <ISettings />, depth: 0 },
    { label: "Battery and device care", icon: <IBattery />, depth: 1 },
    { label: "Battery",               icon: <IBattery />, depth: 2 },
    { label: "Background usage limits", icon: <IChart />, depth: 3 },
  ]},
  { label: "phone overheating", path: [
    { label: "Settings",              icon: <ISettings />, depth: 0 },
    { label: "Battery and device care", icon: <IBattery />, depth: 1 },
    { label: "Device protection",     icon: <IShield />,  depth: 2 },
    { label: "Temperature control",   icon: <IThermo />,  depth: 3 },
  ]},
  { label: "wifi keeps disconnecting", path: [
    { label: "Settings",              icon: <ISettings />, depth: 0 },
    { label: "Connections",           icon: <IWifi />,    depth: 1 },
    { label: "Wi-Fi",                 icon: <IWifi />,    depth: 2 },
    { label: "Advanced Wi-Fi settings", icon: <ISettings />, depth: 3 },
  ]},
];

const PIPELINE_STAGES: PipelineStage[] = [
  { id: "cache",  label: "Exact Match Cache",     sublabel: "Checking SHKG cache",   status: "pending" },
  { id: "vector", label: "Semantic Vector Store", sublabel: "Embedding query",        status: "pending" },
  { id: "rag",    label: "RAG + SHKG Traversal",  sublabel: "Descending hierarchy",   status: "pending" },
  { id: "llm",    label: "Deep LLM Fallback",     sublabel: "Querying Llama-3",       status: "pending" },
];

// ─── Samsung Keyboard ─────────────────────────────────────────────────────────
const KB_ROWS = [
  ["q","w","e","r","t","y","u","i","o","p"],
  ["a","s","d","f","g","h","j","k","l"],
  ["z","x","c","v","b","n","m"],
];

function SamsungKeyboard({ theme, onKey, onSpace, onBack, onDone }: {
  theme: Theme; onKey: (k: string) => void; onSpace: () => void; onBack: () => void; onDone: () => void;
}) {
  const c = getColors(theme);
  const K = ({ children, onClick, flex = 1, bg, textColor }: any) => (
    <Ripple
      onClick={onClick}
      style={{
        flex, padding: "10px 2px", borderRadius: "6px", background: bg || c.keyBg,
        color: textColor || c.text, fontSize: "15px", fontWeight: 500,
        textAlign: "center", userSelect: "none", minWidth: 0,
        boxShadow: `0 1px 0 ${theme === "dark" ? "#000" : "#868e96"}`,
      }}
    >
      {children}
    </Ripple>
  );
  return (
    <div style={{ background: c.keyboardBg, padding: "10px 6px 28px", animation: "slideUp 0.35s cubic-bezier(0.2,0.8,0.2,1)" }}>
      {KB_ROWS.map((row, ri) => (
        <div key={ri} style={{ display: "flex", gap: "5px", marginBottom: "8px", justifyContent: "center" }}>
          {ri === 2 && <K onClick={onBack} flex={1.5} bg={c.keySpecialBg}>⌫</K>}
          {row.map(k => <K key={k} onClick={() => onKey(k)}>{k}</K>)}
          {ri === 2 && <K onClick={onDone} flex={1.5} bg="#3E91FF" textColor="#fff" style={{ fontSize: "12px" }}>Done</K>}
        </div>
      ))}
      <div style={{ display: "flex", gap: "5px" }}>
        <K flex={0.8} bg={c.keySpecialBg} onClick={() => {}} style={{ fontSize: "12px" }}>123</K>
        <Ripple onClick={onSpace} style={{ flex: 4, padding: "10px 2px", borderRadius: "6px", background: c.keyBg, textAlign: "center", boxShadow: `0 1px 0 ${theme === "dark" ? "#000" : "#868e96"}` }}>
          <span style={{ opacity: 0.5, fontSize: "12px", color: c.text }}>space</span>
        </Ripple>
        <K flex={1.2} bg="#3E91FF" textColor="#fff" onClick={onDone} style={{ fontSize: "12px" }}>return</K>
      </div>
    </div>
  );
}

// ─── Status Bar ───────────────────────────────────────────────────────────────
function StatusBar({ theme, onToggle, battery, hasNotif }: {
  theme: Theme; onToggle: () => void; battery: number; hasNotif: boolean;
}) {
  const [time, setTime] = useState(() => {
    const d = new Date();
    const use24 = Intl.DateTimeFormat([], { hour: "numeric" }).resolvedOptions().hour12 === false;
    if (use24) return `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;
    const h = d.getHours() % 12 || 12;
    return `${h}:${d.getMinutes().toString().padStart(2,"0")}`;
  });

  useEffect(() => {
    const i = setInterval(() => {
      const d = new Date();
      const use24 = Intl.DateTimeFormat([], { hour: "numeric" }).resolvedOptions().hour12 === false;
      if (use24) setTime(`${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`);
      else { const h = d.getHours() % 12 || 12; setTime(`${h}:${d.getMinutes().toString().padStart(2,"0")}`); }
    }, 10000);
    return () => clearInterval(i);
  }, []);

  const c = getColors(theme);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px 6px", color: c.statusColor, position: "relative", zIndex: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={{ fontSize: "14px", fontWeight: 700 }}>{time}</span>
        {hasNotif && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#3E91FF" }} />}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
        <button onClick={onToggle} style={{ background: "none", border: "none", cursor: "pointer", color: c.statusColor, display: "flex", opacity: 0.75, padding: 0 }}>
          {theme === "dark" ? <ISun /> : <IMoon />}
        </button>
        <SignalBars bars={4} color={c.statusColor} />
        <span style={{ fontSize: "11px", fontWeight: 600 }}>5G</span>
        <BatterySVG level={battery} color={c.statusColor} />
      </div>
    </div>
  );
}

// ─── Input Screen ─────────────────────────────────────────────────────────────
function InputScreen({ theme, onDiagnose, initialQuery, recentItems }: {
  theme: Theme; onDiagnose: (q: string, path: SettingsNode[]) => void; initialQuery: string; recentItems: string[];
}) {
  const [query, setQuery] = useState(initialQuery);
  const [focused, setFocused] = useState(false);
  const [showKb, setShowKb] = useState(false);
  const [suggestions, setSuggestions] = useState<typeof PRESETS>([]);
  const c = getColors(theme);

  const change = (val: string) => {
    setQuery(val);
    sessionStorage.setItem("fixby_query", val);
    setSuggestions(val.length > 1 ? PRESETS.filter(p => p.label.includes(val.toLowerCase())) : []);
  };
  const submit = (q: string = query) => {
    setShowKb(false); setFocused(false);
    onDiagnose(q, []);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: c.bg, backgroundImage: c.wallpaper, animation: "fadeIn 0.3s ease-out" }}>
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "0 16px 16px", WebkitOverflowScrolling: "touch" }}>

        {/* Header */}
        <div style={{ paddingTop: "36px", paddingBottom: "20px" }}>
          <h1 style={{ fontSize: "34px", fontWeight: 400, color: c.text, letterSpacing: "-0.02em", margin: 0 }}>Settings</h1>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: "16px" }}>
          <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: c.textSub, display: "flex", pointerEvents: "none" }}>
            <ISearch />
          </div>
          <input
            type="text"
            placeholder="Search settings or ask Fixby"
            value={query}
            onFocus={() => { setFocused(true); setShowKb(true); }}
            onBlur={() => { setFocused(false); }}
            onChange={e => change(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") { e.preventDefault(); setShowKb(false); if (query) submit(); }
              if (e.key === "Escape") { setShowKb(false); setFocused(false); }
            }}
            style={{ width: "100%", padding: "13px 36px 13px 42px", borderRadius: "22px", background: c.surface, border: "none", color: c.text, fontSize: "16px", outline: "none", boxSizing: "border-box", boxShadow: focused ? "0 0 0 2px #3E91FF" : "none", transition: "box-shadow 0.2s" }}
          />
          {query && (
            <button onClick={() => { change(""); setSuggestions([]); }} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: c.textFaint, border: "none", borderRadius: "50%", width: "18px", height: "18px", color: c.bg, fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          )}
        </div>

        {/* Autocomplete */}
        {suggestions.length > 0 && (
          <div style={{ background: c.surface, borderRadius: "16px", marginBottom: "12px", overflow: "hidden" }}>
            {suggestions.map((s, i) => (
              <Ripple key={s.label} onClick={() => submit(s.label)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderBottom: i < suggestions.length - 1 ? `1px solid ${c.sep}` : "none" }}>
                <div style={{ color: c.accent }}><ISearch /></div>
                <span style={{ color: c.text, fontSize: "15px" }}>{s.label}</span>
              </Ripple>
            ))}
          </div>
        )}

        {/* Preset chips */}
        {!showKb && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
            {PRESETS.map(p => (
              <Ripple key={p.label} onClick={() => submit(p.label)} style={{ padding: "7px 15px", borderRadius: "20px", background: query === p.label ? "rgba(62,145,255,0.12)" : c.surface, border: `1px solid ${query === p.label ? "#3E91FF" : c.sep}`, color: query === p.label ? "#3E91FF" : c.text, fontSize: "14px" }}>
                {p.label}
              </Ripple>
            ))}
          </div>
        )}

        {/* Recently viewed */}
        {!showKb && recentItems.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "13px", color: c.textSub, fontWeight: 600, marginBottom: "8px" }}>Recently viewed</div>
            <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
              {recentItems.map((item, i) => (
                <div key={i} style={{ flexShrink: 0, padding: "6px 14px", borderRadius: "16px", background: c.surface, color: c.text, fontSize: "13px", whiteSpace: "nowrap" }}>{item}</div>
              ))}
            </div>
          </div>
        )}

        {/* Settings list */}
        {!showKb && (
          <div style={{ background: c.surface, borderRadius: "22px", overflow: "hidden" }}>
            {ALL_SETTINGS.map((item, i) => (
              <Ripple key={i} onClick={() => submit(item.title)} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "11px 16px", borderBottom: i < ALL_SETTINGS.length - 1 ? `1px solid ${c.sep}` : "none" }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: item.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <div style={{ transform: "scale(0.72)" }}>{item.icon}</div>
                </div>
                <div style={{ flex: 1, fontSize: "16px", color: c.text }}>{item.title}</div>
                <div style={{ color: c.textFaint }}><IChevron /></div>
              </Ripple>
            ))}
          </div>
        )}
      </div>

      {/* Simulated keyboard */}
      {showKb && (
        <SamsungKeyboard
          theme={theme}
          onKey={k => change(query + k)}
          onSpace={() => change(query + " ")}
          onBack={() => change(query.slice(0, -1))}
          onDone={() => { setShowKb(false); setFocused(false); if (query) submit(); }}
        />
      )}
    </div>
  );
}

// ─── Processing Screen ────────────────────────────────────────────────────────
function ProcessingScreen({ query, stages, theme }: { query: string; stages: PipelineStage[]; theme: Theme }) {
  const c = getColors(theme);
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: c.bg, position: "relative", backgroundImage: c.wallpaper }}>
      <div style={{ flex: 1, padding: "20px", opacity: 0.25, filter: "blur(4px)", pointerEvents: "none" }}>
        <div style={{ height: "50px", background: c.surface, borderRadius: "22px", marginBottom: "16px" }} />
        <div style={{ height: "220px", background: c.surface, borderRadius: "22px" }} />
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: c.surface, borderTopLeftRadius: "32px", borderTopRightRadius: "32px", padding: "20px 20px 36px", boxShadow: "0 -8px 40px rgba(0,0,0,0.25)", animation: "slideUp 0.5s cubic-bezier(0.2,0.8,0.2,1)" }}>
        <div style={{ width: "36px", height: "4px", background: c.textFaint, borderRadius: "2px", margin: "0 auto 20px" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <div style={{ color: "#3E91FF" }}><IGalaxyAI /></div>
          <div style={{ fontSize: "18px", fontWeight: 600, color: c.text }}>Fixby AI Engine</div>
        </div>
        <div style={{ fontSize: "14px", color: c.textSub, marginBottom: "24px" }}>Searching: <span style={{ color: c.text }}>"{query}"</span></div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {stages.map(s => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "14px", opacity: s.status === "pending" ? 0.3 : 1, transition: "opacity 0.4s ease, transform 0.4s ease", transform: s.status === "pending" ? "translateY(8px)" : "translateY(0)" }}>
              <div style={{ width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: s.status === "done" ? "#34C759" : s.status === "running" ? "#3E91FF" : c.textFaint }}>
                {s.status === "done" ? <ICheck /> : s.status === "running" ? <div style={{ width: "14px", height: "14px", border: "2px solid rgba(62,145,255,0.3)", borderTopColor: "#3E91FF", borderRadius: "50%", animation: "spin 1s linear infinite" }} /> : <div style={{ width: "6px", height: "6px", background: c.textFaint, borderRadius: "50%" }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "15px", color: s.status === "running" ? c.text : c.textSub }}>{s.label}</div>
                {s.status === "running" && <div style={{ fontSize: "12px", color: "#3E91FF", marginTop: "2px" }}>{s.sublabel}</div>}
              </div>
              {s.ms && <div style={{ fontSize: "12px", color: c.textSub }}>{s.ms}ms</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Navigation Screen ────────────────────────────────────────────────────────
function NavigatingScreen({ path, activeIdx, theme }: { path: SettingsNode[]; activeIdx: number; theme: Theme }) {
  const c = getColors(theme);
  const header = activeIdx > 0 ? path[activeIdx - 1]?.label : "Settings";
  const current = path[activeIdx];
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: c.bg, overflow: "hidden", animation: "slideLeft 0.3s cubic-bezier(0.2,0.8,0.2,1)", backgroundImage: c.wallpaper }}>
      <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
        {activeIdx > 0 && <div style={{ color: "#3E91FF", display: "flex", animation: "fadeIn 0.2s ease" }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3E91FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg></div>}
        <div style={{ fontSize: "28px", fontWeight: 400, color: c.text, letterSpacing: "-0.02em" }}>{header}</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ background: c.surface, borderRadius: "22px", margin: "4px 16px 16px", overflow: "hidden" }}>
          {ALL_SETTINGS.slice(0, 4).map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "11px 16px", opacity: 0.3, borderBottom: `1px solid ${c.sep}` }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: item.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <div style={{ transform: "scale(0.72)" }}>{item.icon}</div>
              </div>
              <div style={{ flex: 1, fontSize: "16px", color: c.text }}>{item.title}</div>
              <div style={{ color: c.textFaint }}><IChevron /></div>
            </div>
          ))}
          {current && (
            <Ripple style={{ display: "flex", alignItems: "center", gap: "14px", padding: "11px 16px", background: "rgba(62,145,255,0.1)", borderBottom: `1px solid ${c.sep}`, animation: "popIn 0.4s cubic-bezier(0.2,0.8,0.2,1)" }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "#3E91FF", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <div style={{ transform: "scale(0.72)" }}>{current.icon}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "16px", color: c.text }}>{current.label}</div>
                <div style={{ fontSize: "12px", color: "#3E91FF", marginTop: "2px" }}>Auto-navigating...</div>
              </div>
              <IChevron color="#3E91FF" />
            </Ripple>
          )}
          {ALL_SETTINGS.slice(4, 6).map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "11px 16px", opacity: 0.3, borderBottom: i < 1 ? `1px solid ${c.sep}` : "none" }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: item.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <div style={{ transform: "scale(0.72)" }}>{item.icon}</div>
              </div>
              <div style={{ flex: 1, fontSize: "16px", color: c.text }}>{item.title}</div>
              <div style={{ color: c.textFaint }}><IChevron /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Resolved Screen ──────────────────────────────────────────────────────────
function ResolvedScreen({ path, query, telemetry, onReset, theme }: {
  path: SettingsNode[]; query: string; telemetry: any; onReset: () => void; theme: Theme;
}) {
  const leaf = path && path.length > 0 ? path[path.length - 1] : { label: "Target Setting", icon: <ISettings />, depth: 0 };
  const parentLabel = path && path.length > 1 ? path[path.length - 2]?.label : "Settings";
  const c = getColors(theme);
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: c.bg, overflowY: "auto", animation: "slideUpFade 0.4s cubic-bezier(0.2,0.8,0.2,1)", backgroundImage: c.wallpaper }}>
      <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
        <Ripple onClick={onReset} style={{ color: "#3E91FF", display: "flex" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3E91FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </Ripple>
        <div style={{ fontSize: "28px", fontWeight: 400, color: c.text, letterSpacing: "-0.02em" }}>{parentLabel}</div>
      </div>

      <div style={{ margin: "8px 16px 20px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ width: "60px", height: "60px", borderRadius: "16px", background: "#3E91FF", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
          <div style={{ transform: "scale(1.4)" }}>{leaf?.icon || <ISettings />}</div>
        </div>
        <div style={{ fontSize: "20px", color: c.text, marginBottom: "4px" }}>{leaf?.label || "Target Setting"}</div>
        <div style={{ fontSize: "13px", color: c.textSub }}>Target setting reached by Fixby AI</div>
      </div>

      <div style={{ background: c.surface, borderRadius: "22px", margin: "0 16px 14px", overflow: "hidden" }}>
        <Ripple style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 18px" }}>
          <div style={{ fontSize: "16px", color: c.text }}>{leaf?.label || "Target Setting"}</div>
          <div style={{ width: "51px", height: "31px", borderRadius: "31px", background: c.success, position: "relative", flexShrink: 0 }}>
            <div style={{ width: "27px", height: "27px", borderRadius: "50%", background: "#fff", position: "absolute", top: "2px", right: "2px", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }} />
          </div>
        </Ripple>
      </div>

      {telemetry && (
        <div style={{ margin: "0 16px 14px", padding: "16px", borderRadius: "16px", border: `1px solid ${c.sep}` }}>
          <div style={{ fontSize: "11px", color: c.textSub, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>Diagnostic Details</div>
          {[{ l: "Path resolved", v: "✓", vc: c.success }, { l: "Latency", v: `${telemetry.latency_ms || "—"}ms` }, { l: "Engine", v: telemetry.pipeline_source || "RAG" }].map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: i < 2 ? "8px" : 0 }}>
              <span style={{ fontSize: "14px", color: c.text }}>{r.l}</span>
              <span style={{ fontSize: "14px", color: (r as any).vc || c.textSub }}>{r.v}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ flex: 1 }} />
      <div style={{ padding: "12px 16px 16px" }}>
        <Ripple onClick={onReset} style={{ padding: "16px", borderRadius: "22px", background: c.surface, display: "flex", justifyContent: "center", color: c.text, fontSize: "16px", fontWeight: 500 }}>
          Try another query
        </Ripple>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PhoneSimulator({ isActive }: { isActive: boolean }) {
  const [phase, setPhase]     = useState<Phase>("input");
  const [query, setQuery]     = useState("");
  const [telemetry, setTelemetry] = useState<any>(null);
  const [settingsPath, setSettingsPath] = useState<SettingsNode[]>(PRESETS[0].path);
  const [stages, setStages]   = useState<PipelineStage[]>(PIPELINE_STAGES.map(s => ({ ...s })));
  const [navIdx, setNavIdx]   = useState(0);
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme]     = useState<Theme>("dark");
  const [battery, setBattery] = useState(78);
  const [hasNotif, setHasNotif] = useState(true);
  const [screenOn, setScreenOn] = useState(false);
  const [recentItems, setRecentItems] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    // Screen-on flash animation
    setTimeout(() => setScreenOn(true), 80);
    // Restore from session
    if (sessionStorage.getItem("fixby_mode") === "console" && sessionStorage.getItem("fixby_steps"))
      setPhase("resolved");
    setQuery(sessionStorage.getItem("fixby_query") || "");
    try { const t = sessionStorage.getItem("fixby_telemetry"); if (t) setTelemetry(JSON.parse(t)); } catch {}
    try { const p = sessionStorage.getItem("fixby_path"); if (p) setSettingsPath(JSON.parse(p)); } catch {}
    // Battery drain sim
    const t = setInterval(() => setBattery(l => Math.max(0, l - 1)), 60000);
    return () => clearInterval(t);
  }, []);

  if (!mounted) return null;

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  const handleDiagnose = async (q: string, fallbackPath: SettingsNode[]) => {
    setQuery(q); setSettingsPath(fallbackPath);
    sessionStorage.setItem("fixby_path", JSON.stringify(fallbackPath));
    setPhase("processing"); setHasNotif(false);
    setRecentItems(prev => [q, ...prev.filter(r => r !== q)].slice(0, 3));

    const sc = PIPELINE_STAGES.map(s => ({ ...s }));
    sc[0].status = "running"; setStages([...sc]); await sleep(400);
    sc[0].status = "skipped"; sc[0].ms = 3; sc[1].status = "running"; setStages([...sc]);

    let apiTelemetry: any = null;
    let dynamicPath: SettingsNode[] = [];
    
    try {
      const res = await fetch("http://localhost:8000/v1/troubleshoot", {
        method: "POST", headers: { "Content-Type": "application/json", "X-API-Key": "test-api-key-123" },
        body: JSON.stringify({ query: q, context: {}, siis_response: "" }),
      });
      const d = await res.json();
      apiTelemetry = d.meta;
      
      const pathStr = d.response?.contexts?.[0]?.actions?.[0]?.stepGroups?.[0]?.actionableDeeplink?.classes?.path;
      if (pathStr) {
        const parts = pathStr.split(">").map((s: string) => s.trim()).filter(Boolean);
        dynamicPath = parts.map((label: string, idx: number) => ({
          label,
          icon: getIconForLabel(label),
          depth: idx
        }));
      }
    } catch (e) {}

    const finalPath = dynamicPath.length > 0 ? dynamicPath : fallbackPath;
    setSettingsPath(finalPath);
    sessionStorage.setItem("fixby_path", JSON.stringify(finalPath));

    await sleep(450); sc[1].status = "done"; sc[1].ms = 42; sc[2].status = "running"; setStages([...sc]);
    await sleep(550); sc[2].status = "done"; sc[2].ms = apiTelemetry?.latency_ms || 188; sc[3].status = "skipped"; setStages([...sc]);
    await sleep(250);

    setPhase("navigating"); setNavIdx(0);
    for (let i = 0; i < finalPath.length; i++) { await sleep(450); setNavIdx(i + 1); }

    if (apiTelemetry) { setTelemetry(apiTelemetry); sessionStorage.setItem("fixby_telemetry", JSON.stringify(apiTelemetry)); }
    sessionStorage.setItem("fixby_query", q);
    await sleep(600);
    setPhase("resolved");
  };

  const handleReset = () => {
    setPhase("input"); setStages(PIPELINE_STAGES.map(s => ({ ...s }))); setNavIdx(0);
    sessionStorage.removeItem("fixby_steps");
  };

  const c = getColors(theme);

  return (
    <div style={{
      width: "100%", height: "100%", position: "relative", overflow: "hidden",
      display: "flex", flexDirection: "column",
      background: c.bg, color: c.text, borderRadius: "32px",
      opacity: screenOn ? 1 : 0, transition: "opacity 0.35s ease",
    }}>
      {/* Screen-edge vignette (curved display simulation) */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 200, boxShadow: "inset 0 0 28px rgba(0,0,0,0.35)", borderRadius: "32px" }} />

      <StatusBar theme={theme} onToggle={() => setTheme(t => t === "dark" ? "light" : "dark")} battery={battery} hasNotif={hasNotif} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", paddingBottom: "20px" }}>
        {phase === "input"      && <InputScreen      theme={theme} onDiagnose={handleDiagnose} initialQuery={query} recentItems={recentItems} />}
        {phase === "processing" && <ProcessingScreen theme={theme} query={query} stages={stages} />}
        {phase === "navigating" && <NavigatingScreen theme={theme} path={settingsPath} activeIdx={navIdx} />}
        {phase === "resolved"   && <ResolvedScreen   theme={theme} path={settingsPath} query={query} telemetry={telemetry} onReset={handleReset} />}
      </div>

      {/* Bottom gesture bar (Samsung home indicator) */}
      <div style={{
        position: "absolute", bottom: "8px", left: "50%", transform: "translateX(-50%)",
        width: "120px", height: "4px", borderRadius: "4px",
        background: theme === "dark" ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.18)",
        zIndex: 201,
      }} />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn      { from { opacity: 0; }                        to { opacity: 1; } }
        @keyframes slideUp     { from { transform: translateY(100%); }        to { transform: translateY(0); } }
        @keyframes slideLeft   { from { transform: translateX(20px); opacity:0; } to { transform: translateX(0); opacity:1; } }
        @keyframes slideUpFade { from { transform: translateY(20px); opacity:0; } to { transform: translateY(0); opacity:1; } }
        @keyframes popIn       { 0%   { transform: scale(0.95); opacity:0; }  100% { transform: scale(1); opacity:1; } }
        @keyframes spin        { 100% { transform: rotate(360deg); } }
        @keyframes rippleExpand { 0%  { width: 0; height: 0; opacity: 0.5; } 100% { width: 300px; height: 300px; opacity: 0; } }
      `}} />
    </div>
  );
}
