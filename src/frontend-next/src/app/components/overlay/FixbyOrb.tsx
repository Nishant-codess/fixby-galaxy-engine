import React, { useState, useEffect, useRef } from 'react';
import { useFixbyQuery } from '../../../hooks/useFixbyQuery';

const PRESETS = [
  "battery draining fast",
  "phone overheating",
  "wifi keeps disconnecting"
];

export function FixbyOrb({ isOpen, onToggle, onResolved }: { isOpen: boolean, onToggle: (v: boolean) => void, onResolved: (path: string[]) => void }) {
  const [position, setPosition] = useState({ x: 0, y: 0 }); // relative to bottom right
  const [isDragging, setIsDragging] = useState(false);
  const [query, setQuery] = useState("");
  
  const { executeQuery, stages, isProcessing, reset } = useFixbyQuery();
  const orbRef = useRef<HTMLDivElement>(null);
  
  // Drag handling
  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: PointerEvent) => {
      // Calculate relative to a bottom right origin (approximate)
      const x = window.innerWidth - e.clientX - 26; // 26 is half orb width
      const y = window.innerHeight - e.clientY - 26;
      setPosition({ x: Math.max(10, x), y: Math.max(10, Math.min(y, window.innerHeight - 80)) });
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [isDragging]);

  const handleSubmit = async (q: string = query) => {
    if (!q) return;
    const { dynamicPath } = await executeQuery(q);
    onResolved(dynamicPath);
    setTimeout(() => {
      onToggle(false);
      reset();
      setQuery("");
    }, 2000); // Close sheet after 2 seconds showing success
  };

  return (
    <>
      {/* Orb */}
      <div 
        ref={orbRef}
        onPointerDown={(e) => {
          if (!isOpen) {
            // Distinguish click from drag
            const startX = e.clientX;
            const startY = e.clientY;
            let moved = false;
            
            const moveHandler = (me: PointerEvent) => {
              if (Math.hypot(me.clientX - startX, me.clientY - startY) > 5) {
                moved = true;
                setIsDragging(true);
                window.removeEventListener('pointermove', moveHandler);
              }
            };
            
            const upHandler = () => {
              if (!moved) onToggle(true);
              window.removeEventListener('pointermove', moveHandler);
              window.removeEventListener('pointerup', upHandler);
            };
            
            window.addEventListener('pointermove', moveHandler);
            window.addEventListener('pointerup', upHandler);
          }
        }}
        style={{
          position: 'absolute', right: `${position.x || 20}px`, bottom: `${position.y || 80}px`, zIndex: 200,
          width: '52px', height: '52px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #2075d6 0%, #6c47ff 100%)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)',
          display: isOpen ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: '24px', cursor: 'pointer',
          touchAction: 'none', transition: isDragging ? 'none' : 'bottom 0.3s, right 0.3s',
          animation: 'pulseGlow 2s infinite'
        }}
      >
        F
      </div>

      {/* Expanded Sheet */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 210,
        pointerEvents: isOpen ? 'auto' : 'none',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        background: isOpen ? 'rgba(0,0,0,0.5)' : 'transparent',
        transition: 'background 0.3s'
      }}>
        <div style={{ flex: 1 }} onClick={() => !isProcessing && onToggle(false)} />
        
        <div style={{
          background: 'var(--oneui-bg-card)', padding: '24px',
          borderTopLeftRadius: '32px', borderTopRightRadius: '32px',
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.4)', borderTop: '1px solid rgba(255,255,255,0.05)'
        }}>
          {/* Drag Handle */}
          <div style={{ width: '40px', height: '4px', background: 'var(--oneui-text-tertiary)', borderRadius: '2px', margin: '0 auto 24px' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #2075d6 0%, #6c47ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>F</div>
            <div style={{ fontSize: '18px', fontWeight: 500 }}>Fixby AI Assistant</div>
          </div>

          {!isProcessing && stages[0].status === 'pending' ? (
            <>
              <input 
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="Type your problem..."
                autoFocus
                style={{
                  width: '100%', background: 'var(--oneui-bg-primary)', border: '1px solid var(--oneui-separator)', borderRadius: '16px',
                  padding: '16px', color: '#fff', fontSize: '16px', outline: 'none', marginBottom: '16px'
                }}
              />

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                {PRESETS.map(p => (
                  <div key={p} onClick={() => handleSubmit(p)} style={{ padding: '8px 16px', background: 'var(--oneui-bg-primary)', borderRadius: '16px', fontSize: '14px', border: '1px solid var(--oneui-separator)', cursor: 'pointer' }}>
                    {p}
                  </div>
                ))}
              </div>

              <div onClick={() => handleSubmit()} style={{ width: '100%', padding: '16px', background: 'var(--oneui-accent)', color: '#fff', borderRadius: '16px', textAlign: 'center', fontWeight: 600, cursor: 'pointer' }}>
                Diagnose →
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '200px' }}>
              <div style={{ fontSize: '15px', color: 'var(--oneui-text-secondary)', marginBottom: '8px' }}>Searching: <span style={{ color: '#fff' }}>"{query}"</span></div>
              {stages.map(s => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "14px", opacity: s.status === "pending" ? 0.3 : 1 }}>
                  <div style={{ width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: s.status === "done" ? "var(--oneui-success)" : s.status === "running" ? "var(--oneui-accent)" : "var(--oneui-text-tertiary)" }}>
                    {s.status === "done" ? "✓" : s.status === "running" ? <div style={{ width: "14px", height: "14px", border: "2px solid rgba(32,117,214,0.3)", borderTopColor: "var(--oneui-accent)", borderRadius: "50%", animation: "spin 1s linear infinite" }} /> : <div style={{ width: "6px", height: "6px", background: "currentColor", borderRadius: "50%" }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "15px", color: s.status === "running" ? '#fff' : 'var(--oneui-text-secondary)' }}>{s.label}</div>
                    {s.status === "running" && <div style={{ fontSize: "12px", color: "var(--oneui-accent)", marginTop: "2px" }}>{s.sublabel}</div>}
                  </div>
                  {s.ms && <div style={{ fontSize: "12px", color: 'var(--oneui-text-secondary)' }}>{s.ms}ms</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulseGlow { 0% { box-shadow: 0 0 0 0 rgba(32, 117, 214, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(32, 117, 214, 0); } 100% { box-shadow: 0 0 0 0 rgba(32, 117, 214, 0); } }
      `}} />
    </>
  );
}
