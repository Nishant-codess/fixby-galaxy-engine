import React from 'react';

export function OneUISwitch({ checked, onChange }: { checked: boolean; onChange?: (v: boolean) => void }) {
  return (
    <div 
      onClick={(e) => { e.stopPropagation(); onChange?.(!checked); }}
      style={{
        width: "38px", height: "22px", borderRadius: "22px",
        background: checked ? "var(--oneui-accent)" : "rgba(255,255,255,0.22)",
        position: "relative", flexShrink: 0,
        cursor: "pointer",
        transition: "background 0.22s cubic-bezier(0.4, 0, 0.2, 1)"
      }}
    >
      <div style={{
        width: "18px", height: "18px", borderRadius: "50%",
        background: "#fff", position: "absolute", top: "2px",
        left: checked ? "18px" : "2px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        transition: "left 0.22s cubic-bezier(0.4, 0, 0.2, 1)"
      }} />
    </div>
  );
}
