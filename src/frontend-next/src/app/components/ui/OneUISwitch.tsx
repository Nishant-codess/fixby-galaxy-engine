import React from 'react';

export function OneUISwitch({ checked, onChange }: { checked: boolean; onChange?: (v: boolean) => void }) {
  return (
    <div 
      onClick={(e) => { e.stopPropagation(); onChange?.(!checked); }}
      style={{
        width: "51px", height: "31px", borderRadius: "31px",
        background: checked ? "var(--oneui-accent)" : "rgba(255,255,255,0.2)",
        position: "relative", flexShrink: 0,
        cursor: "pointer",
        transition: "background 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
      }}
    >
      <div style={{
        width: "27px", height: "27px", borderRadius: "50%",
        background: "#fff", position: "absolute", top: "2px",
        left: checked ? "22px" : "2px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        transition: "left 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
      }} />
    </div>
  );
}
