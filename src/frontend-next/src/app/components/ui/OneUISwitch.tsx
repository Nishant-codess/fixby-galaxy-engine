import React from 'react';

export function OneUISwitch({ checked, onChange, ariaLabel, dataTestId }: { checked: boolean; onChange?: (v: boolean) => void; ariaLabel?: string; dataTestId?: string }) {
  return (
    <div 
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      data-checked={checked ? "true" : "false"}
      data-testid={dataTestId || "oneui-switch"}
      onClick={(e) => { e.stopPropagation(); onChange?.(!checked); }}
      style={{
        width: "48px", height: "28px", borderRadius: "14px",
        background: checked ? "var(--oneui-accent)" : "rgba(255,255,255,0.15)",
        boxShadow: checked ? "0 0 16px rgba(32, 117, 214, 0.4), inset 0 2px 4px rgba(0,0,0,0.3)" : "inset 0 2px 6px rgba(0,0,0,0.4)",
        border: "1px solid rgba(255,255,255,0.05)",
        position: "relative", flexShrink: 0,
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      }}
    >
      <div style={{
        width: "24px", height: "24px", borderRadius: "50%",
        background: "#ffffff", position: "absolute", top: "1px",
        left: checked ? "21px" : "1px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.4), inset 0 -2px 4px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.8)",
        transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)"
      }} />
    </div>
  );
}
