import React, { useState, useEffect, useRef } from 'react';

export function OneUISlider({ value, onChange, min = 0, max = 100 }: { value: number; onChange?: (v: number) => void; min?: number; max?: number }) {
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
      <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', position: 'relative' }}>
        <div style={{ width: `${percent}%`, height: '100%', background: 'var(--oneui-accent)', borderRadius: '2px' }} />
        <div style={{ 
          position: 'absolute', top: '50%', left: `${percent}%`, transform: 'translate(-50%, -50%)',
          width: '20px', height: '20px', borderRadius: '50%', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          transition: isDragging ? 'none' : 'left 0.1s'
        }} />
      </div>
    </div>
  );
}
