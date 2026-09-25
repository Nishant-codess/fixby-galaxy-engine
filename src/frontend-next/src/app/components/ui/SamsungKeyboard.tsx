import React from 'react';
import { Ripple } from './Ripple';

const KB_ROWS = [
  ["q","w","e","r","t","y","u","i","o","p"],
  ["a","s","d","f","g","h","j","k","l"],
  ["z","x","c","v","b","n","m"],
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const K = ({ children, onClick, flex = 1, bg, textColor, style }: any) => (
  <Ripple
    onClick={onClick}
    style={{
      flex, padding: "10px 2px", borderRadius: "6px", background: bg || "var(--oneui-bg-card-alt)",
      color: textColor || "var(--oneui-text-primary)", fontSize: "15px", fontWeight: 500,
      textAlign: "center", userSelect: "none", minWidth: 0,
      boxShadow: `0 1px 0 #000`,
      ...style
    }}
  >
    {children}
  </Ripple>
);

export function SamsungKeyboard({ onKey, onSpace, onBack, onDone }: {
  onKey: (k: string) => void; onSpace: () => void; onBack: () => void; onDone: () => void;
}) {
  
  return (
    <div style={{ background: "var(--oneui-bg-card)", padding: "10px 6px 28px", animation: "slideUp 0.35s cubic-bezier(0.2,0.8,0.2,1)", zIndex: 100 }}>
      {KB_ROWS.map((row, ri) => (
        <div key={ri} style={{ display: "flex", gap: "5px", marginBottom: "8px", justifyContent: "center" }}>
          {ri === 2 && <K onClick={onBack} flex={1.5} bg="var(--oneui-bg-primary)">⌫</K>}
          {row.map(k => <K key={k} onClick={() => onKey(k)}>{k}</K>)}
          {ri === 2 && <K onClick={onDone} flex={1.5} bg="var(--oneui-accent)" textColor="#fff" style={{ fontSize: "12px" }}>Done</K>}
        </div>
      ))}
      <div style={{ display: "flex", gap: "5px" }}>
        <K flex={0.8} bg="var(--oneui-bg-primary)" onClick={() => {}} style={{ fontSize: "12px" }}>!#1</K>
        <K flex={4} onClick={onSpace} style={{ fontSize: "12px", color: "var(--oneui-text-secondary)" }}>English (US)</K>
        <K flex={1.2} bg="var(--oneui-accent)" textColor="#fff" onClick={onDone} style={{ fontSize: "12px" }}>Search</K>
      </div>
    </div>
  );
}
