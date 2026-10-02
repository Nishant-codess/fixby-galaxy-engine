import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useFixbyQuery } from '../../../hooks/useFixbyQuery';
import type { GoalData } from '../../../hooks/useFixbyQuery';
import { OneUISlider } from '../ui/OneUISlider';
import { ResolutionCards } from './ResolutionCards';
import { IZap, ICheck } from '../ui/Icons';

const PRESETS = [
  "battery draining fast",
  "bhai mera phone bohot garam ho raha hai",
  "배터리가 너무 빨리 닳아요",
  "wifi keeps disconnecting",
  "storage full clean up junk files",
  "화면이 버벅거리고 120hz 안돼요",
  "phone hang kar raha hai ruk ruk ke",
  "camera keeps crashing when opening"
];

export interface FixbyOrbProps {
  isOpen: boolean;
  onToggle: (v: boolean) => void;
  onResolved: (path: string[], escalation?: string) => void;
  initialQuery?: string;
  onClearInitialQuery?: () => void;
  onWatchDemo?: (goal: GoalData) => void;
  onPerformAuto?: (goal: GoalData) => void;
  onPerformManual?: (goal: GoalData) => void;
}

export function FixbyOrb({
  isOpen, onToggle, onResolved, initialQuery, onClearInitialQuery,
  onWatchDemo, onPerformAuto, onPerformManual
}: FixbyOrbProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 }); // relative to bottom right
  const [isDragging, setIsDragging] = useState(false);
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  
  // SIIS mock states
  const [siisBattery, setSiisBattery] = useState(85);
  const [siisStorage, setSiisStorage] = useState(60);
  const [siisTemp, setSiisTemp] = useState(32);
  const [siisSignal, setSiisSignal] = useState(80);
  const { executeQuery, stages, isProcessing, allGoals, reset } = useFixbyQuery();
  const { darkMode } = useSettings();
  const orbRef = useRef<HTMLDivElement>(null);
  
  // Track current goals and query for resolution cards
  const [resolvedGoals, setResolvedGoals] = useState<GoalData[]>([]);
  const [resolvedQuery, setResolvedQuery] = useState("");

  useEffect(() => {
    if (isOpen && initialQuery) {
      setQuery(initialQuery);
      handleSubmit(initialQuery);
      onClearInitialQuery?.();
    }
  }, [isOpen, initialQuery]);
  
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
    if (q !== query) setQuery(q);
    setShowResults(false);
    setResolvedQuery(q);
    
    const signalLabel = siisSignal >= 70 ? 'Excellent' : siisSignal >= 40 ? 'Good' : siisSignal >= 15 ? 'Weak' : 'None';
    const siisPayload = JSON.stringify({
      batteryLevel: siisBattery,
      storageUsed: siisStorage,
      temperature: siisTemp,
      signalStrength: signalLabel
    });

    const { dynamicPath, apiTelemetry, allGoals: goals } = await executeQuery(q, siisPayload);
    
    if (goals && goals.length > 0) {
      // Show resolution cards with all ranked solutions
      setResolvedGoals(goals);
      setShowResults(true);
    } else {
      // Fallback: no goals returned, navigate directly
      onResolved(dynamicPath, apiTelemetry?.hardware_escalation);
      handleClose();
    }
  };

  const handleClose = () => {
    onToggle(false);
    reset();
    setQuery("");
    setShowResults(false);
    setResolvedGoals([]);
  };

  const handleGoalAction = (goal: GoalData, mode: 'demo' | 'auto' | 'manual') => {
    // Extract path for navigation
    const pathStr = goal.actions?.[0]?.stepGroups?.[0]?.actionableDeeplink?.classes?.path;
    const path = pathStr ? pathStr.split(">").map((s: string) => s.trim()).filter(Boolean) : [];

    if (mode === 'demo' && onWatchDemo) {
      onWatchDemo(goal);
    } else if (mode === 'auto' && onPerformAuto) {
      onPerformAuto(goal);
    } else if (mode === 'manual' && onPerformManual) {
      onPerformManual(goal);
    } else {
      // Fallback: just navigate
      onResolved(path);
    }

    handleClose();
  };

  // Resolution Cards view
  if (isOpen && showResults && resolvedGoals.length > 0) {
    return (
      <>
        <ResolutionCards
          goals={resolvedGoals}
          query={resolvedQuery}
          onWatchDemo={(g) => handleGoalAction(g, 'demo')}
          onPerformAuto={(g) => handleGoalAction(g, 'auto')}
          onPerformManual={(g) => handleGoalAction(g, 'manual')}
          onClose={handleClose}
        />
      </>
    );
  }

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
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(32,117,214,0.9) 0%, rgba(108,71,255,0.9) 100%)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 12px 32px rgba(32,117,214,0.4), inset 0 2px 4px rgba(255,255,255,0.3)',
          display: isOpen ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: '26px', cursor: 'pointer',
          touchAction: 'none', transition: isDragging ? 'none' : 'bottom 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), right 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          animation: 'pulseGlowPremium 3s infinite ease-in-out'
        }}
      >
        F
      </div>

      {/* Expanded Sheet */}
      {isOpen && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 210,
          pointerEvents: 'auto',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          background: 'rgba(0,0,0,0.5)',
          transition: 'background 0.3s'
        }}>
          <div style={{ flex: 1 }} onClick={() => !isProcessing && handleClose()} />
          
          <div style={{
            background: darkMode ? 'rgba(28,28,30,0.65)' : 'rgba(255,255,255,0.7)', backdropFilter: 'blur(40px) saturate(1.8)', padding: '32px 24px',
            borderTopLeftRadius: '32px', borderTopRightRadius: '32px',
            animation: 'slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            boxShadow: darkMode ? '0 -24px 48px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.15)' : '0 -24px 48px rgba(0,0,0,0.1), inset 0 1px 2px rgba(255,255,255,0.8)', 
            borderTop: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)',
            maxHeight: '85vh', overflowY: 'auto'
          }}>
          {/* Drag Handle */}
          <div style={{ width: '40px', height: '4px', background: 'var(--oneui-text-tertiary)', borderRadius: '2px', margin: '0 auto 24px', flexShrink: 0 }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #2075d6 0%, #6c47ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>F</div>
            <div style={{ fontSize: '18px', fontWeight: 500, color: 'var(--oneui-text-primary)' }}>Fixby AI Assistant</div>
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
                  width: '100%', background: darkMode ? 'var(--oneui-bg-primary)' : 'rgba(0,0,0,0.03)', border: darkMode ? '1px solid var(--oneui-separator)' : '1px solid rgba(0,0,0,0.1)', borderRadius: '16px',
                  padding: '16px', color: 'var(--oneui-text-primary)', fontSize: '16px', outline: 'none', marginBottom: '16px'
                }}
              />

              {/* Horizontally scrollable presets to save vertical space */}
              <div style={{ 
                display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', 
                gap: '8px', marginBottom: '24px', paddingBottom: '8px',
                WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' 
              }}>
                {PRESETS.map(p => (
                  <div key={p} onClick={() => handleSubmit(p)} style={{ 
                    whiteSpace: 'nowrap', padding: '8px 16px', background: darkMode ? 'var(--oneui-bg-primary)' : 'rgba(0,0,0,0.03)', 
                    borderRadius: '16px', fontSize: '14px', border: darkMode ? '1px solid var(--oneui-separator)' : '1px solid rgba(0,0,0,0.1)', 
                    cursor: 'pointer', color: 'var(--oneui-text-primary)' 
                  }}>
                    {p}
                  </div>
                ))}
              </div>

              <div onClick={() => handleSubmit()} style={{ 
                width: '100%', padding: '16px', 
                background: (siisBattery !== 85 || siisStorage !== 60 || siisTemp !== 32 || siisSignal !== 80) ? 'linear-gradient(135deg, rgba(255,59,48,0.9), rgba(255,100,0,0.9))' : 'linear-gradient(135deg, rgba(32,117,214,0.9), rgba(61,139,232,0.9))', 
                boxShadow: (siisBattery !== 85 || siisStorage !== 60 || siisTemp !== 32 || siisSignal !== 80) ? '0 8px 24px rgba(255,59,48,0.3), inset 0 1px 2px rgba(255,255,255,0.3)' : '0 8px 24px rgba(32,117,214,0.3), inset 0 1px 2px rgba(255,255,255,0.3)',
                color: '#fff', borderRadius: '16px', textAlign: 'center', fontWeight: 600, cursor: 'pointer', marginBottom: '24px',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' 
              }}>
                {(siisBattery !== 85 || siisStorage !== 60 || siisTemp !== 32 || siisSignal !== 80) ? <><IZap style={{ width: '16px', height: '16px', verticalAlign: 'middle', marginRight: '4px' }} /> Diagnose with SIIS</> : 'Diagnose →'}
              </div>

              {/* SIIS Telemetry Override */}
              <div style={{ background: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)', padding: '16px', borderRadius: '24px', border: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--oneui-text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Simulate SIIS Telemetry</div>
                
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                      <span style={{ color: siisBattery < 15 ? 'var(--oneui-error)' : 'var(--oneui-text-primary)' }}>Battery</span>
                      <span>{siisBattery}%</span>
                    </div>
                    <OneUISlider value={siisBattery} onChange={setSiisBattery} min={0} max={100} trackColor={siisBattery < 15 ? 'var(--oneui-error)' : 'var(--oneui-success)'} />
                  </div>
                  
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                      <span style={{ color: siisStorage > 95 ? 'var(--oneui-error)' : 'var(--oneui-text-primary)' }}>Storage Fullness</span>
                      <span>{siisStorage}%</span>
                    </div>
                    <OneUISlider value={siisStorage} onChange={setSiisStorage} min={0} max={100} trackColor={siisStorage > 95 ? 'var(--oneui-error)' : 'var(--oneui-accent)'} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                      <span style={{ color: siisTemp > 45 ? 'var(--oneui-error)' : 'var(--oneui-text-primary)' }}>Temperature</span>
                      <span>{siisTemp}°C</span>
                    </div>
                    <OneUISlider value={siisTemp} onChange={setSiisTemp} min={20} max={60} trackColor={siisTemp > 45 ? 'var(--oneui-error)' : '#ff9800'} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                      <span style={{ color: siisSignal < 20 ? 'var(--oneui-error)' : 'var(--oneui-text-primary)' }}>Signal Strength</span>
                      <span>{siisSignal}%</span>
                    </div>
                    <OneUISlider value={siisSignal} onChange={setSiisSignal} min={0} max={100} trackColor={siisSignal < 20 ? 'var(--oneui-error)' : '#2075d6'} />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '200px' }}>
              <div style={{ fontSize: '15px', color: 'var(--oneui-text-secondary)', marginBottom: '8px' }}>Searching: <span style={{ color: 'var(--oneui-text-primary)' }}>&quot;{query}&quot;</span></div>
              {stages.map(s => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "14px", opacity: s.status === "pending" ? 0.3 : 1 }}>
                  <div style={{ width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: s.status === "done" ? "var(--oneui-success)" : s.status === "running" ? "var(--oneui-accent)" : "var(--oneui-text-tertiary)" }}>
                    {s.status === "done" ? <ICheck /> : s.status === "running" ? <div style={{ width: "14px", height: "14px", border: "2px solid rgba(32,117,214,0.3)", borderTopColor: "var(--oneui-accent)", borderRadius: "50%", animation: "spin 1s linear infinite" }} /> : <div style={{ width: "6px", height: "6px", background: "currentColor", borderRadius: "50%" }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "15px", color: s.status === "running" ? 'var(--oneui-text-primary)' : 'var(--oneui-text-secondary)' }}>{s.label}</div>
                    {s.status === "running" && <div style={{ fontSize: "12px", color: "var(--oneui-accent)", marginTop: "2px" }}>{s.sublabel}</div>}
                  </div>
                  {s.ms && <div style={{ fontSize: "12px", color: 'var(--oneui-text-secondary)' }}>{s.ms}ms</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulseGlowPremium { 0% { box-shadow: 0 12px 32px rgba(32,117,214,0.4), inset 0 2px 4px rgba(255,255,255,0.3), 0 0 0 0 rgba(32, 117, 214, 0.6); transform: scale(1); } 50% { box-shadow: 0 16px 48px rgba(32,117,214,0.6), inset 0 2px 4px rgba(255,255,255,0.4), 0 0 0 12px rgba(32, 117, 214, 0); transform: scale(1.02); } 100% { box-shadow: 0 12px 32px rgba(32,117,214,0.4), inset 0 2px 4px rgba(255,255,255,0.3), 0 0 0 0 rgba(32, 117, 214, 0); transform: scale(1); } }
      `}} />
    </>
  );
}
