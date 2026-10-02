import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import type { GoalData } from '../../../hooks/useFixbyQuery';
import { ISearchMag, IStar, IClipboard, IChevronRight, IMapPin, IFilm, IZap, IWrench } from '../ui/Icons';

export interface ResolutionCardsProps {
  goals: GoalData[];
  query: string;
  onWatchDemo: (goal: GoalData) => void;
  onPerformAuto: (goal: GoalData) => void;
  onPerformManual: (goal: GoalData) => void;
  onClose: () => void;
}

export function ResolutionCards({ goals, query, onWatchDemo, onPerformAuto, onPerformManual, onClose }: ResolutionCardsProps) {
  const [expandedIndex, setExpandedIndex] = useState(0); // Primary card expanded by default
  const { darkMode } = useSettings();

  if (!goals || goals.length === 0) return null;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 210,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      background: 'rgba(0,0,0,0.55)',
    }}>
      {/* Tap backdrop to close */}
      <div style={{ flex: 1 }} onClick={onClose} />

      {/* Bottom sheet */}
      <div style={{
        background: darkMode ? 'rgba(28,28,30,0.65)' : 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(40px) saturate(1.8)',
        borderTopLeftRadius: '32px', borderTopRightRadius: '32px',
        animation: 'slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        boxShadow: darkMode ? '0 -24px 48px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.15)' : '0 -24px 48px rgba(0,0,0,0.1), inset 0 1px 2px rgba(255,255,255,0.8)',
        borderTop: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)',
        maxHeight: '88vh', overflowY: 'auto',
        paddingBottom: '24px',
      }}>
        {/* Drag Handle */}
        <div style={{ padding: '16px 24px 0' }}>
          <div style={{ width: '40px', height: '4px', background: 'var(--oneui-text-tertiary)', borderRadius: '2px', margin: '0 auto 16px' }} />
        </div>

        {/* Header */}
        <div style={{ padding: '0 24px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #2075d6 0%, #6c47ff 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: '16px', flexShrink: 0
          }}>F</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '17px', fontWeight: 600, color: 'var(--oneui-text-primary)', lineHeight: 1.3 }}>
              <ISearchMag style={{ width: '18px', height: '18px', verticalAlign: 'middle', marginRight: '4px' }} /> Issue Identified
            </div>
            <div style={{ fontSize: '13px', color: 'var(--oneui-text-secondary)', marginTop: '2px', lineHeight: 1.3 }}>
              &quot;{query}&quot;
            </div>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--oneui-text-secondary)' }}>
            {goals.length} solution{goals.length > 1 ? 's' : ''}
          </div>
        </div>

        {/* Resolution Cards */}
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {goals.map((goal, idx) => {
            const isPrimary = idx === 0;
            const isExpanded = expandedIndex === idx;
            const matchPct = Math.round(goal.score * 100);
            const steps = goal.actions?.[0]?.stepGroups?.[0]?.steps || [];
            const pathSegments = goal.navigation_path || [];
            const modes = goal.resolution_modes || ['auto', 'demo', 'manual'];

            return (
              <div
                key={idx}
                style={{
                  background: isPrimary ? 'linear-gradient(145deg, rgba(32,117,214,0.15) 0%, rgba(108,71,255,0.05) 100%)' : (darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                  backdropFilter: 'blur(20px)',
                  borderRadius: '24px',
                  border: isPrimary ? '1px solid rgba(32,117,214,0.4)' : (darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)'),
                  boxShadow: isPrimary ? '0 12px 32px rgba(32,117,214,0.15), inset 0 1px 1px rgba(255,255,255,0.1)' : (darkMode ? 'inset 0 1px 1px rgba(255,255,255,0.05)' : 'inset 0 1px 2px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.02)'),
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transform: isExpanded ? 'scale(1)' : 'scale(0.98)',
                }}
              >
                {/* Card Header — always visible */}
                <div
                  onClick={() => setExpandedIndex(isExpanded ? -1 : idx)}
                  style={{
                    padding: '14px 18px',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{
                    fontSize: '18px', flexShrink: 0,
                    filter: isPrimary ? 'none' : 'grayscale(0.5)',
                  }}>
                    {isPrimary ? <IStar style={{ width: '18px', height: '18px', color: '#f5a623' }} /> : <IClipboard style={{ width: '18px', height: '18px' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '15px', fontWeight: 600,
                      color: 'var(--oneui-text-primary)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>
                      {isPrimary ? 'Recommended Fix' : `Alternative Fix ${idx}`}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--oneui-text-secondary)', marginTop: '2px' }}>
                      {goal.title}
                    </div>
                  </div>
                  <div style={{
                    padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700,
                    background: isPrimary
                      ? 'rgba(32, 117, 214, 0.15)'
                      : 'rgba(255,255,255,0.05)',
                    color: isPrimary
                      ? 'var(--oneui-accent, #2075d6)'
                      : 'var(--oneui-text-secondary)',
                    flexShrink: 0,
                  }}>
                    {matchPct}%
                  </div>
                  <div style={{
                    fontSize: '14px', color: 'var(--oneui-text-tertiary)',
                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                    flexShrink: 0,
                  }}><IChevronRight style={{ width: '14px', height: '14px' }} /></div>
                </div>

                {/* Expanded Content */}
                <div style={{
                  maxHeight: isExpanded ? '600px' : '0px',
                  overflow: 'hidden',
                  transition: 'max-height 0.35s ease',
                }}>
                  <div style={{ padding: '0 18px 16px' }}>
                    {/* Description */}
                    <div style={{
                      fontSize: '13px', color: 'var(--oneui-text-secondary)',
                      padding: '8px 12px', borderRadius: '12px',
                      background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                      marginBottom: '12px', lineHeight: 1.5
                    }}>
                      {goal.actions?.[0]?.description || 'Troubleshooting recommendation'}
                    </div>

                    {/* Navigation Path Breadcrumb */}
                    {pathSegments.length > 0 && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        padding: '8px 12px', borderRadius: '12px',
                        background: 'rgba(32, 117, 214, 0.06)',
                        marginBottom: '12px', flexWrap: 'wrap'
                      }}>
                        <span style={{ marginRight: '4px', display: 'inline-flex', alignItems: 'center' }}><IMapPin style={{ width: '13px', height: '13px' }} /></span>
                        {pathSegments.map((seg, si) => (
                          <span key={si} style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ color: si === pathSegments.length - 1 ? 'var(--oneui-accent, #2075d6)' : 'var(--oneui-text-secondary)', fontWeight: si === pathSegments.length - 1 ? 600 : 400 }}>{seg}</span>
                            {si < pathSegments.length - 1 && <span style={{ color: 'var(--oneui-text-tertiary)' }}>›</span>}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Steps */}
                    <div style={{ marginBottom: '16px' }}>
                      {steps.map((step, si) => (
                        <div key={si} style={{
                          display: 'flex', alignItems: 'flex-start', gap: '10px',
                          padding: '6px 0',
                        }}>
                          <div style={{
                            width: '20px', height: '20px', borderRadius: '50%',
                            background: 'rgba(32, 117, 214, 0.1)',
                            color: 'var(--oneui-accent, #2075d6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '10px', fontWeight: 700, flexShrink: 0, marginTop: '1px'
                          }}>{si + 1}</div>
                          <div style={{ fontSize: '13px', color: 'var(--oneui-text-primary)', lineHeight: 1.5 }}>{step}</div>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {modes.includes('demo') && (
                        <button onClick={() => onWatchDemo(goal)} style={{
                          flex: 1, minWidth: '80px', padding: '12px 16px', border: 'none', borderRadius: '16px',
                          background: 'linear-gradient(135deg, rgba(32,117,214,0.9), rgba(61,139,232,0.9))',
                          boxShadow: '0 8px 16px rgba(32,117,214,0.3), inset 0 1px 2px rgba(255,255,255,0.3)',
                          color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        }}>
                          <IFilm style={{ width: '16px', height: '16px' }} /> Watch Demo
                        </button>
                      )}
                      {modes.includes('auto') && (
                        <button onClick={() => onPerformAuto(goal)} style={{
                          flex: 1, minWidth: '80px', padding: '12px 16px', border: 'none', borderRadius: '16px',
                          background: 'linear-gradient(135deg, rgba(52,199,89,0.9), rgba(48,176,80,0.9))',
                          boxShadow: '0 8px 16px rgba(52,199,89,0.3), inset 0 1px 2px rgba(255,255,255,0.3)',
                          color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        }}>
                          <IZap style={{ width: '16px', height: '16px' }} /> Auto Fix
                        </button>
                      )}
                      {modes.includes('manual') && (
                        <button onClick={() => onPerformManual(goal)} style={{
                          flex: 1, minWidth: '80px', padding: '12px 16px', borderRadius: '16px',
                          background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                          color: 'var(--oneui-text-primary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                          border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                          boxShadow: darkMode ? 'inset 0 1px 1px rgba(255,255,255,0.05)' : 'none',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        }}>
                          <IWrench style={{ width: '16px', height: '16px' }} /> Manual
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom spacing for safe area */}
        <div style={{ height: '16px' }} />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}} />
    </div>
  );
}
