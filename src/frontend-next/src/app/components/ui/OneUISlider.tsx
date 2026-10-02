import React, { useState, useEffect, useRef } from 'react';

export function OneUISlider({ value, onChange, min = 0, max = 100, trackColor = 'var(--oneui-accent)' }: { value: number; onChange?: (v: number) => void; min?: number; max?: number; trackColor?: string }) {
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  
  const percent = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  const updateValue = (clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const p = x / rect.width;
    onChange?.(Math.round(min + p * (max - min)));
  };

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: PointerEvent) => updateValue(e.clientX);
    const onUp = () => setIsDragging(false);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [isDragging]);

  return (
    <div 
      ref={trackRef}
      onPointerDown={(e) => { setIsDragging(true); updateValue(e.clientX); }}
      style={{ height: '24px', display: 'flex', alignItems: 'center', cursor: 'pointer', flex: 1, touchAction: 'none' }}
    >
      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', position: 'relative', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)', overflow: 'visible' }}>
        <div style={{ width: `${percent}%`, height: '100%', background: trackColor, borderRadius: '3px', boxShadow: `0 0 10px ${trackColor}, inset 0 1px 2px rgba(255,255,255,0.3)`, transition: isDragging ? 'none' : 'width 0.1s' }} />
        <div style={{ 
          position: 'absolute', top: '50%', left: `${percent}%`, transform: `translate(-50%, -50%) scale(${isDragging ? 1.25 : 1})`,
          width: '24px', height: '24px', borderRadius: '50%', background: '#ffffff', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 -2px 4px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.8)',
          transition: isDragging ? 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'left 0.1s, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }} />
      </div>
    </div>
  );
}
