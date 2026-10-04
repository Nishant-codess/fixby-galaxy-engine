import React, { useState, useCallback } from 'react';

export function useRipple() {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const createRipple = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples(r => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples(r => r.filter(rip => rip.id !== id)), 600);
  }, []);
  return { ripples, createRipple };
}

export function Ripple({ onClick, style, children, className, dataTestId, ...rest }: {
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  style?: React.CSSProperties;
  className?: string;
  children: React.ReactNode;
  dataTestId?: string;
  [key: string]: any;
}) {
  const { ripples, createRipple } = useRipple();
  const testId = dataTestId || rest['data-testid'];
  return (
    <div
      data-testid={testId}
      className={className}
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
