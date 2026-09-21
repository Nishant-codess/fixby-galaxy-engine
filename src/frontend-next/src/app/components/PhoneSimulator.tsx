"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, Battery, Wifi, Shield, Thermometer, Activity, Search, Bell,
  Monitor, Lock, LayoutGrid, User, Phone, Info, Sparkles, Sun, Moon,
  ChevronRight, Check, Camera, Bluetooth, Plane, Volume2, ArrowLeft, RotateCcw
} from "lucide-react";

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
type Phase = "input" | "processing" | "navigating" | "resolved" | "escalation";

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

// ─── Icon Library ─────────────────────────────────────────────────────────────
const ISettings  = () => <Settings size={20} />;
const IBattery   = () => <Battery size={20} />;
const IWifi      = () => <Wifi size={20} />;
const IShield    = () => <Shield size={20} />;
const IThermo    = () => <Thermometer size={20} />;
const IChart     = () => <Activity size={20} />;
const ISearch    = () => <Search size={20} />;
const IBell      = () => <Bell size={20} />;
const IDisplay   = () => <Monitor size={20} />;
const ILock      = () => <Lock size={20} />;
const IApps      = () => <LayoutGrid size={20} />;
const IUser      = () => <User size={20} />;
const IPhone     = () => <Phone size={20} />;
const IInfo      = () => <Info size={20} />;
const IGalaxyAI  = () => <Sparkles size={20} />;
const ISun       = () => <Sun size={16} />;
const IMoon      = () => <Moon size={16} />;
const IChevron   = ({ color }: { color?: string }) => <ChevronRight size={18} color={color || "currentColor"} />;
const ICheck     = () => <Check size={18} strokeWidth={3} />;
const ICamera    = () => <Camera size={20} />;
const IBluetooth = () => <Bluetooth size={20} />;
const IPlane     = () => <Plane size={20} />;
const IVolume    = () => <Volume2 size={20} />;
const IArrowLeft = () => <ArrowLeft size={20} />;
const IRefresh   = () => <RotateCcw size={20} />;

// ─── Samsung One UI Switch ───────────────────────────────────────────────────
function OneUIToggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      style={{
        width: "48px", height: "28px", borderRadius: "28px",
        background: checked ? "#3E91FF" : "rgba(120, 120, 128, 0.32)",
        position: "relative", cursor: "pointer",
        transition: "background 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
        flexShrink: 0,
      }}
    >
      <div style={{
        width: "24px", height: "24px", borderRadius: "50%",
        background: "#ffffff", position: "absolute", top: "2px", left: "2px",
        transform: checked ? "translateX(20px)" : "translateX(0px)",
        transition: "transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
        boxShadow: "0 2px 5px rgba(0,0,0,0.25)",
      }} />
    </div>
  );
}

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

function Ripple({ onClick, style, className, children }: {
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  style?: React.CSSProperties;
  className?: string;
  children: React.ReactNode;
}) {
  const { ripples, createRipple } = useRipple();
  return (
    <div
      onClick={e => { createRipple(e); onClick?.(e); }}
      className={className}
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
  { icon: <IUser />,    title: "Samsung account",      subtitle: "Alex Kim • alex.kim@samsung.com", color: "#007AFF" },
  { icon: <IWifi />,    title: "Connections",          subtitle: "Wi-Fi, Bluetooth, Flight mode", color: "#007AFF" },
  { icon: <IBell />,    title: "Notifications",        subtitle: "App notifications, Do not disturb", color: "#FF3B30" },
  { icon: <IVolume />,  title: "Sounds and vibration", subtitle: "Sound mode, Volume, Dolby Atmos", color: "#AF52DE" },
  { icon: <IDisplay />, title: "Display",              subtitle: "Brightness, Eye comfort, 120Hz", color: "#FF9500" },
  { icon: <ILock />,    title: "Lock screen and AOD",  subtitle: "Screen lock type, Clock style", color: "#FF6B00" },
  { icon: <IShield />,  title: "Security and privacy", subtitle: "Biometrics, Auto Blocker, Permissions", color: "#FF2D55" },
  { icon: <IBattery />, title: "Battery and device care", subtitle: "Battery, Storage, Memory, Protection", color: "#34C759" },
  { icon: <IApps />,    title: "Apps",                 subtitle: "Default apps, Camera, Permissions", color: "#5856D6" },
  { icon: <ISettings />, title: "General management",  subtitle: "Language, Keyboard, Date & time, Reset", color: "#8E8E93" },
  { icon: <IInfo />,    title: "About phone",          subtitle: "Galaxy S24 Ultra • One UI 6.1", color: "#636366" },
  { icon: <IChart />,   title: "Digital Wellbeing",   subtitle: "Screen time, App timers, Bedtime mode", color: "#30B0C7" },
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

// ─── Sub-Screen Header ───────────────────────────────────────────────────────
function OneUIHeader({ title, onBack, theme }: { title: string; onBack: () => void; theme: Theme }) {
  const c = getColors(theme);
  return (
    <div style={{ paddingTop: "14px", paddingBottom: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
      <Ripple
        onClick={onBack}
        style={{
          width: "36px", height: "36px", borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: c.text, flexShrink: 0
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </Ripple>
      <h2 style={{ fontSize: "22px", fontWeight: 600, color: c.text, margin: 0, letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {title}
      </h2>
    </div>
  );
}

// ─── Sub-Screen View ─────────────────────────────────────────────────────────
function SubScreenView({ screen, onBack, onNavigate, theme, onSetTheme, onDiagnose }: {
  screen: string;
  onBack: () => void;
  onNavigate: (s: string) => void;
  theme: Theme;
  onSetTheme?: (t: Theme) => void;
  onDiagnose: (q: string, path: SettingsNode[]) => void;
}) {
  const c = getColors(theme);

  // Interactive toggle states
  const [wifiOn, setWifiOn] = useState(true);
  const [btOn, setBtOn] = useState(true);
  const [flightOn, setFlightOn] = useState(false);
  const [brightness, setBrightness] = useState(72);
  const [adaptiveBright, setAdaptiveBright] = useState(true);
  const [eyeComfort, setEyeComfort] = useState(false);
  const [accidentalTouch, setAccidentalTouch] = useState(true);
  const [dndOn, setDndOn] = useState(false);
  const [protectBatt, setProtectBatt] = useState(true);
  const [autoBlocker, setAutoBlocker] = useState(true);
  const [camSceneOpt, setCamSceneOpt] = useState(true);
  const [camHdr, setCamHdr] = useState(true);
  const [camHeif, setCamHeif] = useState(false);
  const [camWatermark, setCamWatermark] = useState(false);
  const [camGrid, setCamGrid] = useState(true);
  const [deviceScore, setDeviceScore] = useState(98);
  const [optimizing, setOptimizing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleOptimize = () => {
    setOptimizing(true);
    setTimeout(() => {
      setOptimizing(false);
      setDeviceScore(100);
      showToast("Phone optimized! Cleaned 1.2 GB RAM");
    }, 900);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: c.bg, backgroundImage: c.wallpaper, animation: "slideLeft 0.25s cubic-bezier(0.2,0.8,0.2,1)" }}>
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "0 16px 20px" }}>
        <OneUIHeader title={screen} onBack={onBack} theme={theme} />

        {/* 1. Connections Screen */}
        {screen === "Connections" && (
          <div>
            <div style={{ background: c.surface, borderRadius: "22px", marginBottom: "14px", overflow: "hidden" }}>
              <Ripple onClick={() => onNavigate("Wi-Fi")} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: `1px solid ${c.sep}` }}>
                <div>
                  <div style={{ fontSize: "16px", color: c.text, fontWeight: 500 }}>Wi-Fi</div>
                  <div style={{ fontSize: "13px", color: wifiOn ? "#3E91FF" : c.textSub, marginTop: "2px" }}>
                    {wifiOn ? "Galaxy_Ultra_5G (Connected)" : "Off"}
                  </div>
                </div>
                <OneUIToggle checked={wifiOn} onChange={() => setWifiOn(v => !v)} />
              </Ripple>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: `1px solid ${c.sep}` }}>
                <div>
                  <div style={{ fontSize: "16px", color: c.text, fontWeight: 500 }}>Bluetooth</div>
                  <div style={{ fontSize: "13px", color: btOn ? "#3E91FF" : c.textSub, marginTop: "2px" }}>
                    {btOn ? "Galaxy Buds2 Pro (Connected)" : "Off"}
                  </div>
                </div>
                <OneUIToggle checked={btOn} onChange={() => setBtOn(v => !v)} />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px" }}>
                <div>
                  <div style={{ fontSize: "16px", color: c.text, fontWeight: 500 }}>Flight mode</div>
                  <div style={{ fontSize: "13px", color: c.textSub, marginTop: "2px" }}>Turn off calls, messages, and Mobile data</div>
                </div>
                <OneUIToggle checked={flightOn} onChange={() => setFlightOn(v => !v)} />
              </div>
            </div>

            <div style={{ background: c.surface, borderRadius: "22px", marginBottom: "14px", overflow: "hidden" }}>
              {[
                { t: "SIM manager", s: "SIM 1 (Jio 5G) • eSIM 1 (Airtel)" },
                { t: "Mobile networks", s: "5G / LTE / 3G / 2G (Auto connect)" },
                { t: "Data usage", s: "14.2 GB used of 50 GB limit" },
                { t: "More connection settings", s: "VPN, Private DNS, Nearby device scanning" },
              ].map((item, i, arr) => (
                <Ripple key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: i < arr.length - 1 ? `1px solid ${c.sep}` : "none" }}>
                  <div>
                    <div style={{ fontSize: "16px", color: c.text }}>{item.t}</div>
                    <div style={{ fontSize: "13px", color: c.textSub, marginTop: "2px" }}>{item.s}</div>
                  </div>
                  <IChevron />
                </Ripple>
              ))}
            </div>
          </div>
        )}

        {/* 2. Display Screen */}
        {screen === "Display" && (
          <div>
            {/* Light / Dark Mode selector */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
              <Ripple
                onClick={() => onSetTheme?.("light")}
                style={{
                  flex: 1, padding: "14px", borderRadius: "18px", background: c.surface,
                  border: theme === "light" ? "2px solid #3E91FF" : `1px solid ${c.sep}`,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "8px"
                }}
              >
                <div style={{ width: "36px", height: "54px", borderRadius: "8px", background: "#f2f2f7", border: "1px solid #d1d1d6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ISun />
                </div>
                <span style={{ fontSize: "14px", fontWeight: theme === "light" ? 600 : 400, color: c.text }}>Light</span>
              </Ripple>

              <Ripple
                onClick={() => onSetTheme?.("dark")}
                style={{
                  flex: 1, padding: "14px", borderRadius: "18px", background: c.surface,
                  border: theme === "dark" ? "2px solid #3E91FF" : `1px solid ${c.sep}`,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "8px"
                }}
              >
                <div style={{ width: "36px", height: "54px", borderRadius: "8px", background: "#1c1c1e", border: "1px solid #3a3a3c", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                  <IMoon />
                </div>
                <span style={{ fontSize: "14px", fontWeight: theme === "dark" ? 600 : 400, color: c.text }}>Dark</span>
              </Ripple>
            </div>

            {/* Brightness Card */}
            <div style={{ background: c.surface, borderRadius: "22px", padding: "16px 18px", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ fontSize: "16px", color: c.text, fontWeight: 500 }}>Brightness</span>
                <span style={{ fontSize: "14px", color: "#3E91FF", fontWeight: 600 }}>{brightness}%</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                <ISun />
                <input
                  type="range" min="5" max="100" value={brightness}
                  onChange={e => setBrightness(Number(e.target.value))}
                  style={{ flex: 1, accentColor: "#3E91FF", cursor: "pointer" }}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px", borderTop: `1px solid ${c.sep}` }}>
                <div>
                  <div style={{ fontSize: "15px", color: c.text }}>Adaptive brightness</div>
                  <div style={{ fontSize: "12px", color: c.textSub }}>Optimizes brightness for ambient lighting</div>
                </div>
                <OneUIToggle checked={adaptiveBright} onChange={() => setAdaptiveBright(v => !v)} />
              </div>
            </div>

            {/* Display Options */}
            <div style={{ background: c.surface, borderRadius: "22px", marginBottom: "14px", overflow: "hidden" }}>
              <Ripple style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: `1px solid ${c.sep}` }}>
                <div>
                  <div style={{ fontSize: "16px", color: c.text }}>Motion smoothness</div>
                  <div style={{ fontSize: "13px", color: "#3E91FF", marginTop: "2px" }}>Adaptive (Up to 120 Hz)</div>
                </div>
                <IChevron />
              </Ripple>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: `1px solid ${c.sep}` }}>
                <div>
                  <div style={{ fontSize: "16px", color: c.text }}>Eye comfort shield</div>
                  <div style={{ fontSize: "13px", color: c.textSub, marginTop: "2px" }}>Limits blue light to prevent eye fatigue</div>
                </div>
                <OneUIToggle checked={eyeComfort} onChange={() => setEyeComfort(v => !v)} />
              </div>

              <Ripple style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: `1px solid ${c.sep}` }}>
                <div>
                  <div style={{ fontSize: "16px", color: c.text }}>Screen timeout</div>
                  <div style={{ fontSize: "13px", color: c.textSub, marginTop: "2px" }}>After 2 minutes of inactivity</div>
                </div>
                <IChevron />
              </Ripple>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px" }}>
                <div>
                  <div style={{ fontSize: "16px", color: c.text }}>Accidental touch protection</div>
                  <div style={{ fontSize: "13px", color: c.textSub, marginTop: "2px" }}>Prevent screen touches in bags or pockets</div>
                </div>
                <OneUIToggle checked={accidentalTouch} onChange={() => setAccidentalTouch(v => !v)} />
              </div>
            </div>
          </div>
        )}

        {/* 3. Battery and Device Care Screen */}
        {screen === "Battery and device care" && (
          <div>
            {/* One UI Circular Score Gauge */}
            <div style={{ background: c.surface, borderRadius: "24px", padding: "20px", marginBottom: "14px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <div style={{ position: "relative", width: "100px", height: "100px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="50" cy="50" r="42" fill="none" stroke={c.sep} strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke={deviceScore === 100 ? "#34C759" : "#3E91FF"} strokeWidth="8" strokeDasharray="264" strokeDashoffset={264 - (264 * deviceScore) / 100} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.8s ease" }} />
                </svg>
                <div style={{ position: "absolute", fontSize: "26px", fontWeight: 700, color: c.text }}>
                  {deviceScore}
                </div>
              </div>
              <div style={{ fontSize: "18px", fontWeight: 600, color: c.text, marginBottom: "4px" }}>
                {deviceScore === 100 ? "All good! Excellent condition" : "Good • Device running well"}
              </div>
              <div style={{ fontSize: "13px", color: c.textSub, marginBottom: "16px" }}>
                No malware threats • Battery health normal
              </div>
              <Ripple
                onClick={handleOptimize}
                style={{
                  padding: "10px 24px", borderRadius: "20px", background: "#3E91FF", color: "#fff",
                  fontSize: "14px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px"
                }}
              >
                {optimizing ? "Optimizing..." : "Optimize now"}
              </Ripple>
            </div>

            {/* 4 Cards: Battery, Storage, Memory, Protection */}
            <div style={{ background: c.surface, borderRadius: "22px", marginBottom: "14px", overflow: "hidden" }}>
              {[
                { i: <IBattery />, t: "Battery", s: "18h 42m left • 85%", c: "#34C759" },
                { i: <IChart />,   t: "Storage", s: "128.4 GB / 256 GB used (50%)", c: "#FF9500" },
                { i: <ISettings />,t: "Memory (RAM)", s: "5.2 GB / 8.0 GB available (+4 GB RAM Plus)", c: "#007AFF" },
                { i: <IShield />,  t: "Device protection", s: "No threats detected • Auto Blocker active", c: "#34C759" },
              ].map((item, i, arr) => (
                <Ripple key={i} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 18px", borderBottom: i < arr.length - 1 ? `1px solid ${c.sep}` : "none" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: item.c, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <div style={{ transform: "scale(0.8)" }}>{item.i}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "16px", color: c.text, fontWeight: 500 }}>{item.t}</div>
                    <div style={{ fontSize: "13px", color: c.textSub, marginTop: "2px" }}>{item.s}</div>
                  </div>
                  <IChevron />
                </Ripple>
              ))}
            </div>

            {/* Sub-options */}
            <div style={{ background: c.surface, borderRadius: "22px", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: `1px solid ${c.sep}` }}>
                <div>
                  <div style={{ fontSize: "16px", color: c.text }}>Protect battery</div>
                  <div style={{ fontSize: "13px", color: c.textSub, marginTop: "2px" }}>Limit max charge to 85% to extend lifespan</div>
                </div>
                <OneUIToggle checked={protectBatt} onChange={() => setProtectBatt(v => !v)} />
              </div>
              <Ripple style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px" }}>
                <div>
                  <div style={{ fontSize: "16px", color: c.text }}>Background usage limits</div>
                  <div style={{ fontSize: "13px", color: c.textSub, marginTop: "2px" }}>Put unused apps to sleep automatically</div>
                </div>
                <IChevron />
              </Ripple>
            </div>
          </div>
        )}

        {/* 4. Apps Screen */}
        {screen === "Apps" && (
          <div>
            <div style={{ fontSize: "13px", color: c.textSub, fontWeight: 600, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Installed Applications (54)
            </div>
            <div style={{ background: c.surface, borderRadius: "22px", overflow: "hidden" }}>
              {[
                { i: <ICamera />,  t: "Camera", s: "Permissions, Storage, Camera settings", c: "#FF2D55", target: "Camera settings" },
                { i: <IDisplay />, t: "Gallery", s: "Photos, Albums, Stories", c: "#FF9500", target: null },
                { i: <IBell />,    t: "Messages", s: "Default SMS and RCS application", c: "#007AFF", target: null },
                { i: <IPhone />,   t: "Phone", s: "Default caller and voicemail app", c: "#34C759", target: null },
                { i: <ISettings />,t: "Settings", s: "One UI 6.1 System configuration", c: "#8E8E93", target: null },
                { i: <IChart />,   t: "Clock", s: "Alarms, World clock, Timer, Stopwatch", c: "#AF52DE", target: null },
              ].map((app, i, arr) => (
                <Ripple
                  key={i}
                  onClick={() => { if (app.target) onNavigate(app.target); }}
                  style={{ display: "flex", alignItems: "center", gap: "14px", padding: "13px 18px", borderBottom: i < arr.length - 1 ? `1px solid ${c.sep}` : "none" }}
                >
                  <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: app.c, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <div style={{ transform: "scale(0.85)" }}>{app.i}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "16px", color: c.text, fontWeight: 500 }}>{app.t}</div>
                    <div style={{ fontSize: "13px", color: c.textSub, marginTop: "2px" }}>{app.s}</div>
                  </div>
                  <IChevron />
                </Ripple>
              ))}
            </div>
          </div>
        )}

        {/* 5. Camera Settings Sub-screen (Drilled down from Apps > Camera) */}
        {screen === "Camera settings" && (
          <div>
            <div style={{ fontSize: "13px", color: c.textSub, fontWeight: 600, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Intelligent Features
            </div>
            <div style={{ background: c.surface, borderRadius: "22px", marginBottom: "14px", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: `1px solid ${c.sep}` }}>
                <div>
                  <div style={{ fontSize: "16px", color: c.text, fontWeight: 500 }}>Scene optimizer</div>
                  <div style={{ fontSize: "13px", color: c.textSub, marginTop: "2px" }}>Use AI to enhance photo contrast and colors</div>
                </div>
                <OneUIToggle checked={camSceneOpt} onChange={() => setCamSceneOpt(v => !v)} />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: `1px solid ${c.sep}` }}>
                <div>
                  <div style={{ fontSize: "16px", color: c.text, fontWeight: 500 }}>Auto HDR</div>
                  <div style={{ fontSize: "13px", color: c.textSub, marginTop: "2px" }}>Capture more detail in bright and dark areas</div>
                </div>
                <OneUIToggle checked={camHdr} onChange={() => setCamHdr(v => !v)} />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px" }}>
                <div>
                  <div style={{ fontSize: "16px", color: c.text, fontWeight: 500 }}>High efficiency pictures (HEIF)</div>
                  <div style={{ fontSize: "13px", color: c.textSub, marginTop: "2px" }}>Save space with HEIF format</div>
                </div>
                <OneUIToggle checked={camHeif} onChange={() => setCamHeif(v => !v)} />
              </div>
            </div>

            <div style={{ fontSize: "13px", color: c.textSub, fontWeight: 600, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              General Camera Tools
            </div>
            <div style={{ background: c.surface, borderRadius: "22px", marginBottom: "14px", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: `1px solid ${c.sep}` }}>
                <div>
                  <div style={{ fontSize: "16px", color: c.text }}>Watermark</div>
                  <div style={{ fontSize: "13px", color: c.textSub, marginTop: "2px" }}>Add Galaxy watermark to bottom of photos</div>
                </div>
                <OneUIToggle checked={camWatermark} onChange={() => setCamWatermark(v => !v)} />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px" }}>
                <div>
                  <div style={{ fontSize: "16px", color: c.text }}>Grid lines</div>
                  <div style={{ fontSize: "13px", color: c.textSub, marginTop: "2px" }}>3x3 rule-of-thirds grid on viewfinder</div>
                </div>
                <OneUIToggle checked={camGrid} onChange={() => setCamGrid(v => !v)} />
              </div>
            </div>

            {/* Reset Camera Settings Action */}
            <div style={{ background: c.surface, borderRadius: "22px", overflow: "hidden" }}>
              <Ripple
                onClick={() => {
                  setCamSceneOpt(true);
                  setCamHdr(true);
                  setCamHeif(false);
                  setCamWatermark(false);
                  setCamGrid(true);
                  showToast("Camera settings restored to default!");
                }}
                style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 18px", color: "#FF3B30" }}
              >
                <IRefresh />
                <div style={{ fontSize: "16px", fontWeight: 600 }}>Reset camera settings</div>
              </Ripple>
            </div>
          </div>
        )}

        {/* 6. Notifications Screen */}
        {screen === "Notifications" && (
          <div>
            <div style={{ background: c.surface, borderRadius: "22px", marginBottom: "14px", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: `1px solid ${c.sep}` }}>
                <div>
                  <div style={{ fontSize: "16px", color: c.text, fontWeight: 500 }}>Do not disturb</div>
                  <div style={{ fontSize: "13px", color: dndOn ? "#3E91FF" : c.textSub, marginTop: "2px" }}>
                    {dndOn ? "Active • Only priority calls allowed" : "Schedule: 10:00 PM - 7:00 AM (Sleep)"}
                  </div>
                </div>
                <OneUIToggle checked={dndOn} onChange={() => setDndOn(v => !v)} />
              </div>

              <Ripple style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: `1px solid ${c.sep}` }}>
                <div>
                  <div style={{ fontSize: "16px", color: c.text }}>Notification pop-up style</div>
                  <div style={{ fontSize: "13px", color: "#3E91FF", marginTop: "2px" }}>Brief (Edge lighting style)</div>
                </div>
                <IChevron />
              </Ripple>

              <Ripple style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px" }}>
                <div>
                  <div style={{ fontSize: "16px", color: c.text }}>App notifications</div>
                  <div style={{ fontSize: "13px", color: c.textSub, marginTop: "2px" }}>Allowed: 48 apps • Blocked: 6 apps</div>
                </div>
                <IChevron />
              </Ripple>
            </div>
          </div>
        )}

        {/* 7. Sounds and Vibration */}
        {screen === "Sounds and vibration" && (
          <div>
            <div style={{ background: c.surface, borderRadius: "22px", marginBottom: "14px", overflow: "hidden" }}>
              {[
                { t: "Sound mode", s: "Sound (Ring & Vibrate)" },
                { t: "Ringtone", s: "Over the Horizon (Samsung Official)" },
                { t: "Notification sound", s: "Spaceline" },
                { t: "System sound", s: "Galaxy Touch Sounds" },
                { t: "Volume", s: "Media: 80% • Ringtone: 70%" },
                { t: "Dolby Atmos", s: "Auto (Music, Voice, Movies)" },
              ].map((item, i, arr) => (
                <Ripple key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: i < arr.length - 1 ? `1px solid ${c.sep}` : "none" }}>
                  <div>
                    <div style={{ fontSize: "16px", color: c.text }}>{item.t}</div>
                    <div style={{ fontSize: "13px", color: c.textSub, marginTop: "2px" }}>{item.s}</div>
                  </div>
                  <IChevron />
                </Ripple>
              ))}
            </div>
          </div>
        )}

        {/* 8. Security and Privacy */}
        {screen === "Security and privacy" && (
          <div>
            <div style={{ background: c.surface, borderRadius: "22px", padding: "18px", marginBottom: "14px", display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "#34C759", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <IShield />
              </div>
              <div>
                <div style={{ fontSize: "17px", fontWeight: 600, color: c.text }}>All good!</div>
                <div style={{ fontSize: "13px", color: c.textSub }}>No security risks detected on your Galaxy</div>
              </div>
            </div>

            <div style={{ background: c.surface, borderRadius: "22px", marginBottom: "14px", overflow: "hidden" }}>
              <Ripple style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: `1px solid ${c.sep}` }}>
                <div>
                  <div style={{ fontSize: "16px", color: c.text }}>Lock screen</div>
                  <div style={{ fontSize: "13px", color: c.textSub, marginTop: "2px" }}>PIN • Fingerprints</div>
                </div>
                <IChevron />
              </Ripple>

              <Ripple style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: `1px solid ${c.sep}` }}>
                <div>
                  <div style={{ fontSize: "16px", color: c.text }}>Biometrics</div>
                  <div style={{ fontSize: "13px", color: c.textSub, marginTop: "2px" }}>2 fingerprints registered • Face recognition on</div>
                </div>
                <IChevron />
              </Ripple>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px" }}>
                <div>
                  <div style={{ fontSize: "16px", color: c.text }}>Auto Blocker</div>
                  <div style={{ fontSize: "13px", color: c.textSub, marginTop: "2px" }}>Blocks malware and sideloaded app installations</div>
                </div>
                <OneUIToggle checked={autoBlocker} onChange={() => setAutoBlocker(v => !v)} />
              </div>
            </div>
          </div>
        )}

        {/* 9. General Management */}
        {screen === "General management" && (
          <div>
            <div style={{ background: c.surface, borderRadius: "22px", marginBottom: "14px", overflow: "hidden" }}>
              {[
                { t: "Language", s: "English (United States)" },
                { t: "Samsung Keyboard settings", s: "English (US), Predictive text, Swipe" },
                { t: "Date and time", s: "Automatic (GMT+05:30)" },
              ].map((item, i) => (
                <Ripple key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: `1px solid ${c.sep}` }}>
                  <div>
                    <div style={{ fontSize: "16px", color: c.text }}>{item.t}</div>
                    <div style={{ fontSize: "13px", color: c.textSub, marginTop: "2px" }}>{item.s}</div>
                  </div>
                  <IChevron />
                </Ripple>
              ))}

              <Ripple onClick={() => onNavigate("Reset")} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px" }}>
                <div>
                  <div style={{ fontSize: "16px", color: c.text, fontWeight: 500 }}>Reset</div>
                  <div style={{ fontSize: "13px", color: c.textSub, marginTop: "2px" }}>Reset network, all settings, or factory data</div>
                </div>
                <IChevron />
              </Ripple>
            </div>
          </div>
        )}

        {/* 10. Reset Sub-screen (Drilled down from General management > Reset) */}
        {screen === "Reset" && (
          <div>
            <div style={{ background: c.surface, borderRadius: "22px", overflow: "hidden" }}>
              <Ripple onClick={() => showToast("All system preferences reset to default")} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: `1px solid ${c.sep}` }}>
                <div>
                  <div style={{ fontSize: "16px", color: c.text }}>Reset all settings</div>
                  <div style={{ fontSize: "13px", color: c.textSub, marginTop: "2px" }}>Reset phone defaults without deleting personal data</div>
                </div>
                <IChevron />
              </Ripple>

              <Ripple onClick={() => showToast("Network settings (Wi-Fi, Bluetooth) reset successfully")} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: `1px solid ${c.sep}` }}>
                <div>
                  <div style={{ fontSize: "16px", color: c.text }}>Reset network settings</div>
                  <div style={{ fontSize: "13px", color: "#3E91FF", marginTop: "2px" }}>Restore default Wi-Fi, Mobile data, and Bluetooth</div>
                </div>
                <IChevron />
              </Ripple>

              <Ripple onClick={() => showToast("Factory data reset canceled (Demo protection)")} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", color: "#FF3B30" }}>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 600 }}>Factory data reset</div>
                  <div style={{ fontSize: "13px", color: c.textSub, marginTop: "2px" }}>Erase all accounts and restore phone to factory state</div>
                </div>
                <IChevron color="#FF3B30" />
              </Ripple>
            </div>
          </div>
        )}

        {/* 11. About Phone */}
        {screen === "About phone" && (
          <div>
            <div style={{ background: c.surface, borderRadius: "22px", padding: "20px", marginBottom: "14px", textAlign: "center" }}>
              <div style={{ fontSize: "20px", fontWeight: 700, color: c.text, marginBottom: "4px" }}>Galaxy S24 Ultra</div>
              <div style={{ fontSize: "13px", color: c.textSub }}>SM-S928B/DS • Titanium Gray</div>
            </div>

            <div style={{ background: c.surface, borderRadius: "22px", overflow: "hidden" }}>
              {[
                { t: "One UI version", v: "6.1" },
                { t: "Android version", v: "14" },
                { t: "Processor", v: "Snapdragon 8 Gen 3 for Galaxy" },
                { t: "RAM", v: "12 GB" },
                { t: "Battery status", v: "85% • Normal" },
                { t: "Battery capacity", v: "5,000 mAh" },
              ].map((item, i, arr) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", borderBottom: i < arr.length - 1 ? `1px solid ${c.sep}` : "none" }}>
                  <span style={{ fontSize: "15px", color: c.text }}>{item.t}</span>
                  <span style={{ fontSize: "14px", color: c.textSub, fontWeight: 500 }}>{item.v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 12. Fallback for other settings (Samsung account, Digital Wellbeing, Lock screen) */}
        {!["Connections", "Display", "Battery and device care", "Apps", "Camera settings", "Notifications", "Sounds and vibration", "Security and privacy", "General management", "Reset", "About phone"].includes(screen) && (
          <div style={{ background: c.surface, borderRadius: "22px", padding: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "36px", marginBottom: "10px" }}>⚙️</div>
            <div style={{ fontSize: "18px", fontWeight: 600, color: c.text, marginBottom: "6px" }}>{screen}</div>
            <div style={{ fontSize: "13px", color: c.textSub, marginBottom: "18px" }}>Configure preferences for {screen}</div>
            <Ripple onClick={onBack} style={{ padding: "10px 20px", borderRadius: "18px", background: "#3E91FF", color: "#fff", display: "inline-block", fontSize: "14px" }}>
              Return to Settings
            </Ripple>
          </div>
        )}

        {/* Galaxy AI Assist banner inside sub-screen */}
        <Ripple
          onClick={() => onDiagnose(`${screen.toLowerCase()} issues`, PRESETS[0].path)}
          style={{
            marginTop: "20px", padding: "12px 16px", borderRadius: "18px",
            background: "rgba(62,145,255,0.08)", border: "1px solid rgba(62,145,255,0.25)",
            display: "flex", alignItems: "center", gap: "10px"
          }}
        >
          <div style={{ color: "#3E91FF" }}><IGalaxyAI /></div>
          <div style={{ flex: 1, fontSize: "13px", color: c.text }}>
            Ask Fixby AI about <span style={{ color: "#3E91FF", fontWeight: 600 }}>{screen}</span> troubleshooting
          </div>
          <IChevron color="#3E91FF" />
        </Ripple>
      </div>

      {/* Samsung One UI Bottom Pill Toast */}
      {toast && (
        <div style={{
          position: "absolute", bottom: "34px", left: "50%", transform: "translateX(-50%)",
          background: theme === "dark" ? "rgba(255,255,255,0.92)" : "rgba(30,30,30,0.92)",
          color: theme === "dark" ? "#000" : "#fff",
          padding: "10px 18px", borderRadius: "20px", fontSize: "13px", fontWeight: 600,
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)", zIndex: 9999, animation: "popIn 0.2s ease-out",
          whiteSpace: "nowrap", pointerEvents: "none"
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}

// ─── Input Screen ─────────────────────────────────────────────────────────────
function InputScreen({ theme, onSetTheme, onDiagnose, initialQuery, recentItems }: {
  theme: Theme;
  onSetTheme?: (t: Theme) => void;
  onDiagnose: (q: string, path: SettingsNode[], siisStr?: string) => void;
  initialQuery: string;
  recentItems: string[];
}) {
  const [query, setQuery] = useState(initialQuery);
  const [focused, setFocused] = useState(false);
  const [showKb, setShowKb] = useState(false);
  const [suggestions, setSuggestions] = useState<typeof PRESETS>([]);
  const [screenStack, setScreenStack] = useState<string[]>(["Settings"]);
  const c = getColors(theme);

  const currentScreen = screenStack[screenStack.length - 1];

  // ── SIIS State ──
  const [showSiis, setShowSiis] = useState(false);
  const [siisBat, setSiisBat] = useState(78);
  const [siisStorage, setSiisStorage] = useState(45);
  const [siisTemp, setSiisTemp] = useState(32);
  const [siisSignal, setSiisSignal] = useState("Excellent");

  // ── Voice State ──
  const [isListening, setIsListening] = useState(false);

  const toggleListening = () => {
    if (isListening) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Speech recognition not supported in this browser.");
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      const matched = PRESETS.find(p => transcript.toLowerCase().includes(p.label.split(" ")[0]));
      const siisPayload = showSiis ? JSON.stringify({ batteryLevel: siisBat, storageUsed: siisStorage, temperature: siisTemp, signalStrength: siisSignal }) : "";
      onDiagnose(transcript, matched?.path || PRESETS[0].path, siisPayload);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const change = (val: string) => {
    setQuery(val);
    sessionStorage.setItem("fixby_query", val);
    setSuggestions(val.length > 1 ? PRESETS.filter(p => p.label.includes(val.toLowerCase())) : []);
  };

  const submit = (q: string = query) => {
    const qLower = q.toLowerCase();
    let matched = PRESETS.find(p => qLower.includes(p.label.split(" ")[0]));
    let fallback = PRESETS[0].path;
    if (qLower.includes("cam") || qLower.includes("photo") || qLower.includes("picture")) {
      fallback = [
        { label: "Settings", icon: <ISettings />, depth: 0 },
        { label: "Apps", icon: <IApps />, depth: 1 },
        { label: "Camera", icon: <ISettings />, depth: 2 },
        { label: "Camera settings", icon: <ISettings />, depth: 3 }
      ];
    }
    setShowKb(false); setFocused(false);
    const siisPayload = showSiis ? JSON.stringify({ batteryLevel: siisBat, storageUsed: siisStorage, temperature: siisTemp, signalStrength: siisSignal }) : "";
    onDiagnose(q, matched?.path || fallback, siisPayload);
  };

  // If inside a sub-screen, render SubScreenView
  if (currentScreen !== "Settings") {
    return (
      <SubScreenView
        screen={currentScreen}
        onBack={() => setScreenStack(prev => (prev.length > 1 ? prev.slice(0, -1) : prev))}
        onNavigate={(s) => setScreenStack(prev => [...prev, s])}
        theme={theme}
        onSetTheme={onSetTheme}
        onDiagnose={submit}
      />
    );
  }

  return (
    <div className="mesh-bg" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: c.bg, backgroundImage: c.wallpaper }}>
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "0 16px 16px", WebkitOverflowScrolling: "touch" }}>

        {/* Header */}
        <div style={{ paddingTop: "32px", paddingBottom: "18px" }}>
          <h1 style={{ fontSize: "34px", fontWeight: 400, color: c.text, letterSpacing: "-0.02em", margin: 0 }}>Settings</h1>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: "16px", display: "flex", gap: "8px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: c.textSub, display: "flex", pointerEvents: "none", zIndex: 2 }}>
              <ISearch />
            </div>
            <input
              type="text"
              placeholder="Search settings or ask Fixby"
              value={query}
              className="glass-pane"
              onFocus={() => { setFocused(true); setShowKb(true); }}
              onBlur={() => { setFocused(false); }}
              onChange={e => change(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") { e.preventDefault(); setShowKb(false); if (query) submit(); }
                if (e.key === "Escape") { setShowKb(false); setFocused(false); }
              }}
              style={{ width: "100%", padding: "13px 36px 13px 42px", borderRadius: "22px", color: c.text, fontSize: "16px", outline: "none", boxSizing: "border-box", boxShadow: focused ? "0 0 0 2px #3E91FF" : "none", transition: "box-shadow 0.2s" }}
            />
            {query && (
              <button onClick={() => { change(""); setSuggestions([]); }} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: c.textFaint, border: "none", borderRadius: "50%", width: "18px", height: "18px", color: c.bg, fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>✕</button>
            )}
          </div>
          <button 
            className="glass-pane"
            onClick={toggleListening}
            style={{ 
              width: "44px", height: "44px", borderRadius: "22px", 
              color: isListening ? "#FF2D55" : c.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              boxShadow: isListening ? "0 0 0 4px rgba(255,45,85,0.3)" : "none", transition: "all 0.2s"
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
          </button>
        </div>

        {/* SIIS Toggle */}
        <div className="glass-pane" style={{ marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ color: "#3E91FF" }}><IChart /></div>
            <div style={{ fontSize: "14px", fontWeight: 500, color: c.text }}>Simulate SIIS Telemetry</div>
          </div>
          <label style={{ position: "relative", display: "inline-block", width: "42px", height: "24px" }}>
            <input type="checkbox" checked={showSiis} onChange={e => setShowSiis(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
            <span style={{ position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: showSiis ? "#34C759" : c.textFaint, transition: ".3s", borderRadius: "24px" }} />
            <span style={{ position: "absolute", content: '""', height: "18px", width: "18px", left: showSiis ? "21px" : "3px", bottom: "3px", backgroundColor: "white", transition: ".3s", borderRadius: "50%", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }} />
          </label>
        </div>

        {/* SIIS Sliders */}
        <AnimatePresence>
        {showSiis && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="glass-pane" style={{ borderRadius: "16px", padding: "16px", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "16px", overflow: "hidden" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: c.textSub, marginBottom: "4px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><IBattery /> Battery Level</span> 
                <span style={{ fontWeight: 600, color: siisBat <= 20 ? "#FF3B30" : siisBat <= 40 ? "#FF9500" : "#34C759" }}>{siisBat}%</span>
              </div>
              <input type="range" min="1" max="100" value={siisBat} onChange={e => setSiisBat(parseInt(e.target.value))} 
                className={`premium-slider ${siisBat <= 20 ? 'color-red' : siisBat <= 40 ? 'color-orange' : 'color-green'}`}
                style={{ "--val": `${siisBat}%` } as React.CSSProperties} />
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: c.textSub, marginBottom: "4px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><IShield /> Storage Used</span> 
                <span style={{ fontWeight: 600, color: siisStorage >= 90 ? "#FF3B30" : siisStorage >= 70 ? "#FF9500" : "#34C759" }}>{siisStorage}%</span>
              </div>
              <input type="range" min="1" max="100" value={siisStorage} onChange={e => setSiisStorage(parseInt(e.target.value))} 
                className={`premium-slider ${siisStorage >= 90 ? 'color-red' : siisStorage >= 70 ? 'color-orange' : 'color-green'}`}
                style={{ "--val": `${siisStorage}%` } as React.CSSProperties} />
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: c.textSub, marginBottom: "4px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><IThermo /> CPU Temp</span> 
                <span style={{ fontWeight: 600, color: siisTemp >= 50 ? "#FF3B30" : siisTemp >= 35 ? "#FF9500" : "#3E91FF" }}>{siisTemp}°C</span>
              </div>
              <input type="range" min="20" max="80" value={siisTemp} onChange={e => setSiisTemp(parseInt(e.target.value))} 
                className={`premium-slider ${siisTemp >= 50 ? 'color-red' : siisTemp >= 35 ? 'color-orange' : 'color-blue'}`}
                style={{ "--val": `${((siisTemp - 20) / 60) * 100}%` } as React.CSSProperties} />
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: c.textSub, marginBottom: "4px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><IWifi /> Signal Strength</span>
              </div>
              <div className="premium-select-wrapper">
                <select value={siisSignal} onChange={e => setSiisSignal(e.target.value)} className="premium-select">
                  <option value="Excellent">Excellent (5G)</option>
                  <option value="Good">Good (LTE)</option>
                  <option value="Weak">Weak (1 bar)</option>
                  <option value="None">No Signal</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
        </AnimatePresence>

        {/* Autocomplete */}
        {suggestions.length > 0 && (
          <div className="glass-pane" style={{ borderRadius: "16px", marginBottom: "12px", overflow: "hidden" }}>
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
              <Ripple key={p.label} onClick={() => submit(p.label)} className="glass-pane" style={{ padding: "7px 15px", borderRadius: "20px", color: query === p.label ? "#3E91FF" : c.text, fontSize: "14px" }}>
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

        {/* Clickable Samsung One UI Settings list */}
        {!showKb && (
          <div style={{ background: c.surface, borderRadius: "22px", overflow: "hidden" }}>
            {ALL_SETTINGS.map((item, i) => (
              <Ripple
                key={i}
                onClick={() => setScreenStack(prev => [...prev, item.title])}
                style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 16px", borderBottom: i < ALL_SETTINGS.length - 1 ? `1px solid ${c.sep}` : "none" }}
              >
                <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: item.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <div style={{ transform: "scale(0.76)" }}>{item.icon}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "16px", color: c.text, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.title}
                  </div>
                  {item.subtitle && (
                    <div style={{ fontSize: "12px", color: c.textSub, marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.subtitle}
                    </div>
                  )}
                </div>
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
    <div className="mesh-bg" style={{ flex: 1, display: "flex", flexDirection: "column", background: c.bg, position: "relative", backgroundImage: c.wallpaper }}>
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
    <div className="mesh-bg" style={{ flex: 1, display: "flex", flexDirection: "column", background: c.bg, overflow: "hidden", backgroundImage: c.wallpaper }}>
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
function ResolvedScreen({ path, query, telemetry, onReset, theme, onFollowup, onFeedback }: {
  path: SettingsNode[]; query: string; telemetry: any; onReset: () => void; theme: Theme;
  onFollowup: () => void; onFeedback: (rating: 1 | -1, actionName: string) => void;
}) {
  const [feedbackState, setFeedbackState] = useState<number>(0);
  const leaf = path && path.length > 0 ? path[path.length - 1] : null;
  const parentLabel = path && path.length > 1 ? path[path.length - 2]?.label : "Settings";
  const c = getColors(theme);

  // Guard: if path is empty for any reason, show a safe fallback UI
  if (!leaf) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: c.bg, padding: "24px", textAlign: "center" }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔍</div>
        <div style={{ fontSize: "18px", color: c.text, marginBottom: "8px" }}>Setting Located</div>
        <div style={{ fontSize: "13px", color: c.textSub, marginBottom: "24px" }}>Fixby AI resolved your query successfully.</div>
        <Ripple onClick={onReset} style={{ padding: "14px 28px", borderRadius: "22px", background: c.surface, color: c.text, fontSize: "15px", fontWeight: 500 }}>
          Try another query
        </Ripple>
      </div>
    );
  }

  return (
    <div className="mesh-bg" style={{ flex: 1, display: "flex", flexDirection: "column", background: c.bg, overflowY: "auto", backgroundImage: c.wallpaper }}>
      <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
        <Ripple onClick={onReset} style={{ color: "#3E91FF", display: "flex" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3E91FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </Ripple>
        <div style={{ fontSize: "28px", fontWeight: 400, color: c.text, letterSpacing: "-0.02em" }}>{parentLabel}</div>
      </div>

      <div style={{ margin: "8px 16px 20px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ width: "60px", height: "60px", borderRadius: "16px", background: "#3E91FF", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
          <div style={{ transform: "scale(1.4)" }}>{leaf.icon ?? "⚙️"}</div>
        </div>
        <div style={{ fontSize: "20px", color: c.text, marginBottom: "4px" }}>{leaf.label || "Target Setting"}</div>
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

      {/* Feedback Section */}
      <div style={{ margin: "0 16px 14px", display: "flex", gap: "10px", alignItems: "center" }}>
        {feedbackState === 0 ? (
          <>
            <Ripple onClick={() => { setFeedbackState(1); onFeedback(1, leaf.label); }} style={{ flex: 1, padding: "12px", borderRadius: "16px", background: c.surface, display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", border: `1px solid ${c.sep}` }}>
              <span>👍</span> <span style={{ fontSize: "14px", color: c.text }}>Helpful</span>
            </Ripple>
            <Ripple onClick={() => { setFeedbackState(-1); onFeedback(-1, leaf.label); }} style={{ flex: 1, padding: "12px", borderRadius: "16px", background: c.surface, display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", border: `1px solid ${c.sep}` }}>
              <span>👎</span> <span style={{ fontSize: "14px", color: c.text }}>Not Helpful</span>
            </Ripple>
          </>
        ) : (
          <div style={{ flex: 1, padding: "12px", borderRadius: "16px", background: "rgba(52,199,89,0.1)", color: "#34C759", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 500, animation: "popIn 0.3s ease" }}>
            <ICheck /> Thanks! Teaching Fixby AI...
          </div>
        )}
      </div>

      <div style={{ flex: 1 }} />
      <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <Ripple onClick={onFollowup} style={{ padding: "16px", borderRadius: "22px", background: "rgba(255,45,85,0.1)", display: "flex", justifyContent: "center", color: "#FF2D55", fontSize: "16px", fontWeight: 600 }}>
          Still not working?
        </Ripple>
        <Ripple onClick={onReset} style={{ padding: "16px", borderRadius: "22px", background: c.surface, display: "flex", justifyContent: "center", color: c.text, fontSize: "16px", fontWeight: 500 }}>
          Try another query
        </Ripple>
      </div>
    </div>
  );
}

// ─── Escalation Screen ────────────────────────────────────────────────────────
function EscalationScreen({ path, query, escalationLevel, onReset, theme }: {
  path: SettingsNode[]; query: string; escalationLevel: string; onReset: () => void; theme: Theme;
}) {
  const leaf = path.length > 0 ? path[path.length - 1] : null;
  const c = getColors(theme);
  const isCritical = escalationLevel === "CRITICAL";

  return (
    <div className="mesh-bg" style={{ flex: 1, display: "flex", flexDirection: "column", background: c.bg, overflowY: "auto", backgroundImage: c.wallpaper }}>
      <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
        <Ripple onClick={onReset} style={{ color: "#3E91FF", display: "flex" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3E91FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </Ripple>
        <div style={{ fontSize: "28px", fontWeight: 400, color: c.text, letterSpacing: "-0.02em" }}>Escalation</div>
      </div>

      <div style={{ margin: "8px 16px 20px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ width: "60px", height: "60px", borderRadius: "16px", background: isCritical ? "#FF2D55" : "#FF9500", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
          <div style={{ transform: "scale(1.4)" }}>⚠️</div>
        </div>
        <div style={{ fontSize: "20px", color: c.text, marginBottom: "4px" }}>Advanced Troubleshooting</div>
        <div style={{ fontSize: "13px", color: c.textSub }}>{isCritical ? "Critical action required" : "Caution recommended"}</div>
      </div>

      {leaf && (
        <div style={{ background: c.surface, borderRadius: "22px", margin: "0 16px 14px", overflow: "hidden", border: `1px solid ${isCritical ? "#FF2D55" : "#FF9500"}` }}>
          <Ripple style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 18px" }}>
            <div style={{ fontSize: "16px", color: c.text }}>{leaf.label}</div>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: isCritical ? "#FF2D55" : "#FF9500", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IChevron color="#fff" />
            </div>
          </Ripple>
        </div>
      )}

      <div style={{ margin: "0 16px 14px", padding: "16px", borderRadius: "16px", border: `1px solid ${c.sep}`, background: "rgba(255,45,85,0.05)" }}>
        <div style={{ fontSize: "14px", color: c.text, marginBottom: "8px", fontWeight: 500 }}>Warning</div>
        <div style={{ fontSize: "13px", color: c.textSub, lineHeight: 1.5 }}>
          This action may erase data, reset settings, or require professional service. Ensure you have backed up your device before proceeding.
        </div>
      </div>

      <div style={{ flex: 1 }} />
      <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <Ripple onClick={onReset} style={{ padding: "16px", borderRadius: "22px", background: c.surface, display: "flex", justifyContent: "center", color: c.text, fontSize: "16px", fontWeight: 500 }}>
          Cancel
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
  const [escalationLevel, setEscalationLevel] = useState<string>("CAUTION");
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

  const handleDiagnose = async (q: string, fallbackPath: SettingsNode[], siisStr: string = "") => {
    setQuery(q); setSettingsPath(fallbackPath);
    sessionStorage.setItem("fixby_path", JSON.stringify(fallbackPath));
    setPhase("processing"); setHasNotif(false);
    setRecentItems(prev => [q, ...prev.filter(r => r !== q)].slice(0, 3));

    const sc = PIPELINE_STAGES.map(s => ({ ...s }));
    sc[0].status = "running"; setStages([...sc]); await sleep(300);
    sc[0].status = "skipped"; sc[0].ms = 3; sc[1].status = "running"; setStages([...sc]);

    // ── Fetch from backend FIRST, then animate. Prevents race condition. ──
    let apiTelemetry: any = null;
    let dynamicPath: SettingsNode[] = [];

    try {
      const res = await fetch("http://localhost:8000/v1/troubleshoot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": "test-api-key-123",
        },
        body: JSON.stringify({ query: q, context: {}, siis_response: siisStr }),
        signal: AbortSignal.timeout(30000),
      });
      if (res.ok) {
        const d = await res.json();
        apiTelemetry = d.meta;
        const pathStr = d.response?.contexts?.[0]?.actions?.[0]?.stepGroups?.[0]?.actionableDeeplink?.classes?.path;
        if (pathStr) {
          const parts = (pathStr as string).split(">").map((s: string) => s.trim()).filter(Boolean);
          dynamicPath = parts.map((label: string, idx: number) => ({
            label,
            icon: getIconForLabel(label),
            depth: idx
          }));
        }
      }
    } catch (e) {
      console.warn("Fixby API unavailable, using fallback path.", e);
    }

    // Use live path from API; only fall back to preset if API gave nothing
    const finalPath = dynamicPath.length > 0 ? dynamicPath : (fallbackPath.length > 0 ? fallbackPath : PRESETS[0].path);
    setSettingsPath(finalPath);
    sessionStorage.setItem("fixby_path", JSON.stringify(finalPath));

    // ── Now animate the pipeline stages ──
    sc[1].status = "done"; sc[1].ms = 42; sc[2].status = "running"; setStages([...sc]);
    await sleep(500);
    sc[2].status = "done"; sc[2].ms = apiTelemetry?.latency_ms ?? 188; sc[3].status = "skipped"; setStages([...sc]);
    await sleep(250);

    setPhase("navigating"); setNavIdx(0);
    for (let i = 0; i < finalPath.length; i++) { await sleep(420); setNavIdx(i + 1); }

    if (apiTelemetry) { setTelemetry(apiTelemetry); sessionStorage.setItem("fixby_telemetry", JSON.stringify(apiTelemetry)); }
    sessionStorage.setItem("fixby_query", q);
    await sleep(500);
    setPhase("resolved");
  };

  const handleFollowup = async () => {
    setPhase("processing");
    const sc = PIPELINE_STAGES.map(s => ({ ...s }));
    sc.forEach(s => s.status = "skipped");
    sc[3].status = "running"; sc[3].sublabel = "Evaluating escalation...";
    setStages([...sc]);

    let dynPath = PRESETS[0].path; // fallback
    let escLvl = "CAUTION";
    
    try {
      const leafName = settingsPath[settingsPath.length - 1]?.label || "Unknown";
      const res = await fetch("http://localhost:8000/v1/troubleshoot/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-Key": "test-api-key-123" },
        body: JSON.stringify({ query, attempted_action_ids: [leafName], turn: 2 }),
      });
      if (res.ok) {
        const d = await res.json();
        escLvl = d.escalation_level || "CAUTION";
        const pathStr = d.response?.contexts?.[0]?.actions?.[0]?.stepGroups?.[0]?.actionableDeeplink?.classes?.path;
        if (pathStr) {
          const parts = (pathStr as string).split(">").map((s: string) => s.trim()).filter(Boolean);
          dynPath = parts.map((label: string, idx: number) => ({ label, icon: getIconForLabel(label), depth: idx }));
        }
      }
    } catch(e) {}
    
    setSettingsPath(dynPath);
    setEscalationLevel(escLvl);
    sc[3].status = "done"; setStages([...sc]);
    await sleep(600);
    setPhase("escalation");
  };

  const handleFeedback = (rating: 1 | -1, actionName: string) => {
    fetch("http://localhost:8000/v1/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": "test-api-key-123" },
      body: JSON.stringify({ query, action_name: actionName, rating }),
    }).catch(console.error);
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

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", paddingBottom: "20px", position: "relative" }}>
        <AnimatePresence mode="wait">
          {phase === "input"      && <motion.div key="input" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} style={{ display: 'flex', flex: 1, flexDirection: 'column' }}><InputScreen      theme={theme} onSetTheme={setTheme} onDiagnose={handleDiagnose} initialQuery={query} recentItems={recentItems} /></motion.div>}
          {phase === "processing" && <motion.div key="processing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ display: 'flex', flex: 1, flexDirection: 'column' }}><ProcessingScreen theme={theme} query={query} stages={stages} /></motion.div>}
          {phase === "navigating" && <motion.div key="navigating" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} style={{ display: 'flex', flex: 1, flexDirection: 'column' }}><NavigatingScreen theme={theme} path={settingsPath} activeIdx={navIdx} /></motion.div>}
          {phase === "resolved"   && <motion.div key="resolved" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.4 }} style={{ display: 'flex', flex: 1, flexDirection: 'column' }}><ResolvedScreen   theme={theme} path={settingsPath} query={query} telemetry={telemetry} onReset={handleReset} onFollowup={handleFollowup} onFeedback={handleFeedback} /></motion.div>}
          {phase === "escalation" && <motion.div key="escalation" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} style={{ display: 'flex', flex: 1, flexDirection: 'column' }}><EscalationScreen theme={theme} path={settingsPath} query={query} escalationLevel={escalationLevel} onReset={handleReset} /></motion.div>}
        </AnimatePresence>
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
