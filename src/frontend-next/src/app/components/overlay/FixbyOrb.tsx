"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useHistory } from '../../context/HistoryContext';
import { useFixbyQuery } from '../../../hooks/useFixbyQuery';
import type { GoalData } from '../../../hooks/useFixbyQuery';
import { OneUISlider } from '../ui/OneUISlider';
import { ResolutionCards } from './ResolutionCards';
import { IZap, ICheck, IClock, IChevronRight } from '../ui/Icons';
import { FixAction } from '../../../settings/actions';

// Curated intelligent suggestion chips per UX specifications
const CURATED_SUGGESTIONS = [
  { label: "Battery draining", query: "battery draining fast", icon: "🔋", testId: "preset-battery-draining-fast" },
  { label: "Phone overheating", query: "bhai mera phone bohot garam ho raha hai", icon: "🔥", testId: "preset-bhai-mera-phone-bohot-garam-ho-raha-hai" },
  { label: "Wi-Fi not working", query: "wifi keeps disconnecting", icon: "📶", testId: "preset-wifi-keeps-disconnecting" },
  { label: "Storage full", query: "storage full clean up junk files", icon: "💾", testId: "preset-storage-full-clean-up-junk-files" },
];

export interface FixbyOrbProps {
  isOpen: boolean;
  onToggle: (v: boolean) => void;
  onResolved: (path: string[], escalation?: string) => void;
  initialQuery?: string;
  onClearInitialQuery?: () => void;
  onWatchDemo?: (action: FixAction) => void;
  onPerformAuto?: (action: FixAction) => void;
  onPerformManual?: (action: FixAction) => void;
  onOpenHistory?: () => void;
  restoredGoals?: GoalData[] | null;
  restoredQuery?: string;
}

export function FixbyOrb({
  isOpen, onToggle, onResolved, initialQuery, onClearInitialQuery,
  onWatchDemo, onPerformAuto, onPerformManual, onOpenHistory,
  restoredGoals, restoredQuery
}: FixbyOrbProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [showAdvancedSiis, setShowAdvancedSiis] = useState(false);
  
  // SIIS mock telemetry states
  const [siisBattery, setSiisBattery] = useState(85);
  const [siisStorage, setSiisStorage] = useState(60);
  const [siisTemp, setSiisTemp] = useState(32);
  const [siisSignal, setSiisSignal] = useState(80);

  const { executeQuery, stages, isProcessing, reset } = useFixbyQuery();
  const { darkMode } = useSettings();
  const { addHistoryItem, recordAppliedFix, recordDemoViewed, history } = useHistory();
  const orbRef = useRef<HTMLDivElement>(null);
  
  // Current goals and query for resolution cards
  const [resolvedGoals, setResolvedGoals] = useState<GoalData[]>([]);
  const [resolvedQuery, setResolvedQuery] = useState("");

  // Handle external or restored history session
  useEffect(() => {
    if (restoredGoals && restoredGoals.length > 0 && restoredQuery) {
      setResolvedGoals(restoredGoals);
      setResolvedQuery(restoredQuery);
      setQuery(restoredQuery);
      setShowResults(true);
    }
  }, [restoredGoals, restoredQuery]);

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
      const x = window.innerWidth - e.clientX - 26;
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
      // Save session to persistent history
      addHistoryItem(q, goals, apiTelemetry);
      setResolvedGoals(goals);
      setShowResults(true);
    } else {
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

  const handleGoalAction = (action: FixAction, mode: 'demo' | 'auto' | 'manual') => {
    if (mode === 'demo') {
      recordDemoViewed(resolvedQuery, action.title);
      onWatchDemo?.(action);
    } else if (mode === 'auto') {
      recordAppliedFix(resolvedQuery, action.title);
      onPerformAuto?.(action);
    } else if (mode === 'manual') {
      onPerformManual?.(action);
    } else {
      onResolved(action.destinationPath);
    }

    handleClose();
  };

  // Resolution Cards view (Troubleshooting Workspace)
  if (isOpen && showResults && resolvedGoals.length > 0) {
    return (
      <ResolutionCards
        goals={resolvedGoals}
        query={resolvedQuery}
        onWatchDemo={(action) => handleGoalAction(action, 'demo')}
        onPerformAuto={(action) => handleGoalAction(action, 'auto')}
        onPerformManual={(action) => handleGoalAction(action, 'manual')}
        onClose={handleClose}
      />
    );
  }

  return (
    <>
      {/* Floating Orb */}
      <div 
        ref={orbRef}
        data-testid="fixby-orb-trigger"
        onClick={() => onToggle(true)}
        onPointerDown={(e) => {
          if (!isOpen) {
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

      {/* Expanded Assistant Sheet */}
      {isOpen && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 210,
          pointerEvents: 'auto',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          background: 'rgba(0,0,0,0.55)',
          transition: 'background 0.3s'
        }}>
          {/* Backdrop */}
          <div style={{ flex: 1 }} onClick={() => !isProcessing && handleClose()} />
          
          <div style={{
            background: darkMode ? 'rgba(24, 26, 32, 0.88)' : 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(40px) saturate(1.8)',
            padding: '28px 24px 32px',
            borderTopLeftRadius: '32px', borderTopRightRadius: '32px',
            animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: darkMode ? '0 -24px 48px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.15)' : '0 -24px 48px rgba(0,0,0,0.1), inset 0 1px 2px rgba(255,255,255,0.8)', 
            borderTop: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)',
            maxHeight: '88vh', overflowY: 'auto'
          }}>
            {/* Drag Handle */}
            <div style={{ width: '40px', height: '4px', background: 'var(--oneui-text-tertiary)', borderRadius: '2px', margin: '0 auto 20px', flexShrink: 0 }} />

            {/* Header: Title + History button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #2075d6 0%, #6c47ff 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 800, fontSize: '16px',
                  boxShadow: '0 4px 12px rgba(32, 117, 214, 0.3)'
                }}>
                  F
                </div>
                <div>
                  <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--oneui-text-primary)', lineHeight: 1.2 }}>
                    Fixby AI Assistant
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--oneui-text-secondary)', marginTop: '2px' }}>
                    One UI Intelligent Diagnostics
                  </div>
                </div>
              </div>

              {/* History Drawer Trigger in Header */}
              {onOpenHistory && (
                <button
                  data-testid="orb-history-btn"
                  onClick={onOpenHistory}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 12px', borderRadius: '12px',
                    background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
                    color: 'var(--oneui-text-primary)',
                    fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <IClock style={{ width: '13px', height: '13px', color: 'var(--oneui-accent-light)' }} />
                  <span>History</span>
                  {history.length > 0 && (
                    <span style={{
                      fontSize: '10px', fontWeight: 700, padding: '1px 5px',
                      borderRadius: '8px', background: 'var(--oneui-accent)', color: '#fff'
                    }}>
                      {history.length}
                    </span>
                  )}
                </button>
              )}
            </div>

            {!isProcessing && stages[0].status === 'pending' ? (
              <>
                {/* Center Hero Area */}
                <div style={{ marginBottom: '18px' }}>
                  <h2 style={{
                    margin: '0 0 6px',
                    fontSize: '20px',
                    fontWeight: 700,
                    color: 'var(--oneui-text-primary)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.25,
                  }}>
                    What problem are you facing with your Samsung device?
                  </h2>
                  <p style={{
                    margin: 0,
                    fontSize: '13px',
                    color: 'var(--oneui-text-secondary)',
                    lineHeight: 1.4,
                  }}>
                    Describe any battery, heating, network, or display issue in plain words.
                  </p>
                </div>

                {/* Main Query Input Box */}
                <div style={{ position: 'relative', marginBottom: '16px' }}>
                  <input 
                    data-testid="fixby-query-input"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    placeholder="e.g. My battery is draining very fast..."
                    autoFocus
                    style={{
                      width: '100%',
                      background: darkMode ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.03)',
                      border: darkMode ? '1.5px solid rgba(255, 255, 255, 0.12)' : '1.5px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '18px',
                      padding: '16px 20px',
                      color: 'var(--oneui-text-primary)',
                      fontSize: '15px',
                      outline: 'none',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = 'var(--oneui-accent)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(32, 117, 214, 0.25), inset 0 2px 4px rgba(0,0,0,0.2)';
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)';
                      e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2)';
                    }}
                  />
                </div>

                {/* Curated Intelligent Suggestion Chips */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--oneui-text-secondary)',
                    marginBottom: '8px',
                  }}>
                    Quick Diagnostics
                  </div>
                  
                  <div style={{ 
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}>
                    {CURATED_SUGGESTIONS.map(s => (
                      <button 
                        key={s.label}
                        data-testid={s.testId}
                        onClick={() => {
                          setQuery(s.query);
                          handleSubmit(s.query);
                        }}
                        style={{ 
                          padding: '8px 14px',
                          background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', 
                          borderRadius: '14px',
                          fontSize: '13px',
                          fontWeight: 500,
                          border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)', 
                          cursor: 'pointer',
                          color: 'var(--oneui-text-primary)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'rgba(32, 117, 214, 0.15)';
                          e.currentTarget.style.borderColor = 'rgba(32, 117, 214, 0.3)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
                          e.currentTarget.style.borderColor = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <span>{s.icon}</span>
                        <span>{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Diagnose CTA */}
                <div 
                  data-testid="fixby-diagnose-btn"
                  onClick={() => handleSubmit()}
                  style={{ 
                    width: '100%',
                    padding: '16px', 
                    background: (siisBattery !== 85 || siisStorage !== 60 || siisTemp !== 32 || siisSignal !== 80) 
                      ? 'linear-gradient(135deg, #FF453A 0%, #FF9F0A 100%)' 
                      : 'linear-gradient(135deg, #2075D6 0%, #6C47FF 100%)',
                    boxShadow: (siisBattery !== 85 || siisStorage !== 60 || siisTemp !== 32 || siisSignal !== 80) 
                      ? '0 12px 24px rgba(255, 69, 58, 0.4), inset 0 2px 4px rgba(255,255,255,0.4)' 
                      : '0 12px 24px rgba(32, 117, 214, 0.4), inset 0 2px 4px rgba(255,255,255,0.4)',
                    color: '#fff',
                    borderRadius: '18px',
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: '15px',
                    cursor: 'pointer',
                    marginBottom: '16px',
                    transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    animation: (siisBattery !== 85 || siisStorage !== 60 || siisTemp !== 32 || siisSignal !== 80) 
                      ? 'pulseGlowOrange 2s infinite ease-in-out' 
                      : 'pulseGlowPremium 3s infinite ease-in-out'
                  }}
                >
                  {(siisBattery !== 85 || siisStorage !== 60 || siisTemp !== 32 || siisSignal !== 80) ? (
                    <><IZap style={{ width: '18px', height: '18px' }} /> Diagnose with SIIS</>
                  ) : (
                    'Diagnose Problem →'
                  )}
                </div>

                {/* Collapsible Advanced SIIS Telemetry Accordion */}
                <div style={{
                  background: darkMode ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.02)',
                  borderRadius: '20px',
                  border: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.05)',
                  overflow: 'hidden',
                }}>
                  <div 
                    onClick={() => setShowAdvancedSiis(prev => !prev)}
                    style={{
                      padding: '12px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--oneui-text-secondary)',
                    }}
                  >
                    <span>Advanced: Simulate Device Sensors (SIIS)</span>
                    <span style={{
                      transform: showAdvancedSiis ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                    }}>
                      <IChevronRight style={{ width: '14px', height: '14px' }} />
                    </span>
                  </div>

                  {showAdvancedSiis && (
                    <div style={{ padding: '0 18px 16px', display: 'grid', gap: '14px' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                          <span style={{ color: siisBattery < 15 ? 'var(--oneui-error)' : 'var(--oneui-text-primary)' }}>Battery Level</span>
                          <span>{siisBattery}%</span>
                        </div>
                        <OneUISlider value={siisBattery} onChange={setSiisBattery} min={0} max={100} trackColor={siisBattery > 80 ? 'var(--oneui-success)' : siisBattery < 20 ? 'var(--oneui-error)' : '#2075d6'} />
                      </div>
                      
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                          <span style={{ color: siisStorage > 80 ? 'var(--oneui-error)' : 'var(--oneui-text-primary)' }}>Storage Fullness</span>
                          <span>{siisStorage}%</span>
                        </div>
                        <OneUISlider value={siisStorage} onChange={setSiisStorage} min={0} max={100} trackColor={siisStorage > 80 ? 'var(--oneui-error)' : siisStorage < 20 ? 'var(--oneui-success)' : 'var(--oneui-accent)'} />
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                          <span style={{ color: siisTemp > 45 ? 'var(--oneui-error)' : 'var(--oneui-text-primary)' }}>Temperature</span>
                          <span>{siisTemp}°C</span>
                        </div>
                        <OneUISlider value={siisTemp} onChange={setSiisTemp} min={20} max={60} trackColor={siisTemp > 45 ? 'var(--oneui-error)' : siisTemp < 30 ? 'var(--oneui-success)' : '#ff9800'} />
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                          <span style={{ color: siisSignal < 20 ? 'var(--oneui-error)' : 'var(--oneui-text-primary)' }}>Signal Strength</span>
                          <span>{siisSignal}%</span>
                        </div>
                        <OneUISlider value={siisSignal} onChange={setSiisSignal} min={0} max={100} trackColor={siisSignal > 80 ? 'var(--oneui-success)' : siisSignal < 20 ? 'var(--oneui-error)' : '#2075d6'} />
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Live Pipeline Diagnostic Telemetry */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minHeight: '180px', padding: '10px 0' }}>
                <div style={{ fontSize: '14px', color: 'var(--oneui-text-secondary)', marginBottom: '4px' }}>
                  Analyzing issue: <span style={{ color: 'var(--oneui-text-primary)', fontWeight: 600 }}>&quot;{query}&quot;</span>
                </div>
                {stages.map(s => (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "14px", opacity: s.status === "pending" ? 0.3 : 1 }}>
                    <div style={{ width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: s.status === "done" ? "var(--oneui-success)" : s.status === "running" ? "var(--oneui-accent)" : "var(--oneui-text-tertiary)" }}>
                      {s.status === "done" ? <ICheck style={{ width: '16px', height: '16px' }} /> : s.status === "running" ? <div style={{ width: "14px", height: "14px", border: "2px solid rgba(32,117,214,0.3)", borderTopColor: "var(--oneui-accent)", borderRadius: "50%", animation: "spin 1s linear infinite" }} /> : <div style={{ width: "6px", height: "6px", background: "currentColor", borderRadius: "50%" }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "14px", fontWeight: 500, color: s.status === "running" ? 'var(--oneui-text-primary)' : 'var(--oneui-text-secondary)' }}>{s.label}</div>
                      {s.status === "running" && <div style={{ fontSize: "12px", color: "var(--oneui-accent)", marginTop: "2px" }}>{s.sublabel}</div>}
                    </div>
                    {s.ms && <div style={{ fontSize: "12px", color: 'var(--oneui-text-secondary)', fontFamily: 'monospace' }}>{s.ms}ms</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulseGlowPremium { 0% { box-shadow: 0 12px 32px rgba(32,117,214,0.4), inset 0 2px 4px rgba(255,255,255,0.3), 0 0 0 0 rgba(32, 117, 214, 0.6); transform: scale(1); } 50% { box-shadow: 0 16px 48px rgba(32,117,214,0.6), inset 0 2px 4px rgba(255,255,255,0.4), 0 0 0 12px rgba(32, 117, 214, 0); transform: scale(1.02); } 100% { box-shadow: 0 12px 32px rgba(32,117,214,0.4), inset 0 2px 4px rgba(255,255,255,0.3), 0 0 0 0 rgba(32, 117, 214, 0); transform: scale(1); } }
        @keyframes pulseGlowOrange { 0% { box-shadow: 0 12px 24px rgba(255,69,58,0.4), inset 0 2px 4px rgba(255,255,255,0.4), 0 0 0 0 rgba(255, 69, 58, 0.6); transform: scale(1); } 50% { box-shadow: 0 16px 32px rgba(255,69,58,0.6), inset 0 2px 4px rgba(255,255,255,0.4), 0 0 0 12px rgba(255, 69, 58, 0); transform: scale(1.02); } 100% { box-shadow: 0 12px 24px rgba(255,69,58,0.4), inset 0 2px 4px rgba(255,255,255,0.4), 0 0 0 0 rgba(255, 69, 58, 0); transform: scale(1); } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </>
  );
}
export default FixbyOrb;
