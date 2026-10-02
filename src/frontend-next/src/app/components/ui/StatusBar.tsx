import React, { useState, useEffect } from 'react';
import { ISun, IMoon } from './Icons';

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

export function StatusBar({ battery = 78, hasNotif = true, theme = 'dark', onToggleTheme }: {
  battery?: number; hasNotif?: boolean; theme?: 'dark' | 'light'; onToggleTheme?: () => void;
}) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const getTime = () => {
      const d = new Date();
      const use24 = Intl.DateTimeFormat([], { hour: 'numeric' }).resolvedOptions().hour12 === false;
      if (use24) return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      const h = d.getHours() % 12 || 12;
      return `${h}:${d.getMinutes().toString().padStart(2, '0')}`;
    };
    setTime(getTime());
    const i = setInterval(() => setTime(getTime()), 10000);
    return () => clearInterval(i);
  }, []);

  const color = theme === 'dark' ? '#fff' : '#000';

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px 6px", color, position: "relative", zIndex: 10, mixBlendMode: theme === 'dark' ? 'normal' : 'multiply' }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={{ fontSize: "14px", fontWeight: 700 }}>{time}</span>
        {hasNotif && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#2075d6" }} />}
      </div>
      
      {/* Notch */}
      <div style={{ position: 'absolute', left: '50%', top: '10px', transform: 'translateX(-50%)', width: '12px', height: '12px', borderRadius: '50%', background: '#000', boxShadow: 'inset 0 -1px 2px rgba(255,255,255,0.2)' }} />

      <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
        {onToggleTheme && (
          <button onClick={onToggleTheme} style={{ background: "none", border: "none", cursor: "pointer", color, display: "flex", opacity: 0.75, padding: 0 }}>
            {theme === "dark" ? <ISun /> : <IMoon />}
          </button>
        )}
        <SignalBars bars={4} color={color} />
        <span style={{ fontSize: "11px", fontWeight: 600 }}>5G</span>
        <BatterySVG level={battery} color={color} />
      </div>
    </div>
  );
}
