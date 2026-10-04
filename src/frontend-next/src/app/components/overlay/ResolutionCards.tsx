import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import type { GoalData } from '../../../hooks/useFixbyQuery';
import { ISearchMag, IStar, IClipboard, IChevronRight, IMapPin, IFilm, IZap, IWrench, IXClose } from '../ui/Icons';
import { resolveGoalToAction, FixAction } from '../../../settings/actions';
import { getHonestCapabilityLabel } from '../../../settings/capabilities';

export interface ResolutionCardsProps {
  goals: GoalData[];
  query: string;
  onWatchDemo: (action: FixAction) => void;
  onPerformAuto: (action: FixAction) => void;
  onPerformManual: (action: FixAction) => void;
  onClose: () => void;
  executingActionId?: string | null;
}

export function ResolutionCards({ 
  goals, 
  query, 
  onWatchDemo, 
  onPerformAuto, 
  onPerformManual, 
  onClose,
  executingActionId
}: ResolutionCardsProps) {
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
      <div data-testid="resolution-cards-backdrop" style={{ flex: 1 }} onClick={onClose} />

      {/* Bottom sheet */}
      <div style={{
        background: darkMode ? 'rgba(24, 24, 28, 0.88)' : 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(40px) saturate(1.8)',
        borderTopLeftRadius: '32px', borderTopRightRadius: '32px',
        animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        boxShadow: darkMode ? '0 -24px 48px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.15)' : '0 -24px 48px rgba(0,0,0,0.1), inset 0 1px 2px rgba(255,255,255,0.8)',
        borderTop: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)',
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
          <div style={{ fontSize: '13px', color: 'var(--oneui-text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{goals.length} solution{goals.length > 1 ? 's' : ''}</span>
            <button
              data-testid="resolution-cards-close-btn"
              onClick={onClose}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                border: 'none',
                color: 'var(--oneui-text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <IXClose style={{ width: '14px', height: '14px' }} />
            </button>
          </div>
        </div>

        {/* Diagnostic Reasoning Section */}
        {(() => {
          const primaryGoal = goals[0];
          const diagnosisText = primaryGoal?.diagnosis;
          const likelyCauses = primaryGoal?.likelyCauses;
          if (!diagnosisText && (!likelyCauses || likelyCauses.length === 0)) return null;

          return (
            <div
              data-testid="diagnostic-reasoning-panel"
              style={{
                margin: '0 16px 14px',
                padding: '14px 18px',
                borderRadius: '20px',
                background: darkMode ? 'rgba(32, 117, 214, 0.12)' : 'rgba(32, 117, 214, 0.06)',
                border: darkMode ? '1px solid rgba(32, 117, 214, 0.25)' : '1px solid rgba(32, 117, 214, 0.15)',
                display: 'flex', flexDirection: 'column', gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: 'var(--oneui-accent)',
                  boxShadow: '0 0 8px var(--oneui-accent)'
                }} />
                <span style={{
                  fontSize: '12px', fontWeight: 700,
                  color: 'var(--oneui-accent)',
                  letterSpacing: '0.6px', textTransform: 'uppercase'
                }}>
                  Diagnostic Reasoning
                </span>
              </div>

              {diagnosisText && (
                <div style={{
                  fontSize: '13px', color: 'var(--oneui-text-primary)',
                  lineHeight: 1.45, fontWeight: 500
                }}>
                  {diagnosisText}
                </div>
              )}

              {likelyCauses && likelyCauses.length > 0 && (
                <div style={{ marginTop: '4px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--oneui-text-secondary)', marginBottom: '4px' }}>
                    Likely causes:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {likelyCauses.map((cause, ci) => (
                      <div key={ci} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12px', color: 'var(--oneui-text-secondary)', lineHeight: 1.4 }}>
                        <span style={{ color: 'var(--oneui-accent)', fontWeight: 800 }}>•</span>
                        <span>{cause}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Resolution Cards */}
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {goals.map((goal, idx) => {
            const isPrimary = idx === 0;
            const isExpanded = expandedIndex === idx;
            const matchPct = Math.round(goal.score * 100);
            const action = resolveGoalToAction(goal);
            const isExecuting = executingActionId === action.id;
            const capLabel = getHonestCapabilityLabel(goal.capabilityId);

            return (
              <div
                key={`${action.id || 'fix'}-${idx}`}
                data-testid={`fix-card-${idx}`}
                style={{
                  background: isPrimary
                    ? (darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)')
                    : (darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)'),
                  backdropFilter: 'blur(20px)',
                  borderRadius: '24px',
                  border: isPrimary
                    ? '1.5px solid var(--oneui-accent)'
                    : (darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)'),
                  boxShadow: isPrimary
                    ? '0 8px 24px rgba(32, 117, 214, 0.2)'
                    : 'none',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                {/* Card Header — always visible */}
                <div
                  data-testid={`fix-card-header-${idx}`}
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
                    <div style={{ fontSize: '13px', color: 'var(--oneui-text-secondary)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {action.title}
                    </div>
                  </div>
                  <div style={{
                    padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700,
                    background: isPrimary ? 'rgba(32, 117, 214, 0.15)' : 'rgba(255,255,255,0.06)',
                    color: isPrimary ? 'var(--oneui-accent)' : 'var(--oneui-text-secondary)',
                    flexShrink: 0,
                  }}>
                    {matchPct}%
                  </div>
                  <div style={{
                    fontSize: '14px', color: 'var(--oneui-text-tertiary)',
                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                    flexShrink: 0,
                  }}>
                    <IChevronRight style={{ width: '14px', height: '14px' }} />
                  </div>
                </div>

                {/* Expanded Content */}
                <div style={{
                  maxHeight: isExpanded ? '700px' : '0px',
                  overflow: 'hidden',
                  transition: 'max-height 0.35s ease',
                }}>
                  <div style={{ padding: '0 18px 16px' }}>
                    {/* Action Meta Badges */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      <span style={{
                        padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 600,
                        background: action.type.includes('TOGGLE') ? 'rgba(52, 199, 89, 0.15)' : 'rgba(32, 117, 214, 0.15)',
                        color: action.type.includes('TOGGLE') ? '#34c759' : 'var(--oneui-accent)',
                      }}>
                        ⚡ {action.type.replace('_', ' ')}
                      </span>
                      <span style={{
                        padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 600,
                        background: action.risk === 'high' ? 'rgba(255, 59, 48, 0.15)' : action.risk === 'medium' ? 'rgba(255, 149, 0, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                        color: action.risk === 'high' ? '#ff3b30' : action.risk === 'medium' ? '#ff9500' : 'var(--oneui-text-secondary)',
                      }}>
                        🛡️ {action.risk.toUpperCase()} RISK
                      </span>
                      <span style={{
                        padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 600,
                        background: capLabel.requiresNative ? 'rgba(255, 149, 0, 0.15)' : 'rgba(32, 117, 214, 0.15)',
                        color: capLabel.requiresNative ? '#ff9500' : 'var(--oneui-accent)',
                      }}>
                        📱 {capLabel.badgeText}
                      </span>
                    </div>

                    {/* Why this helps & Estimated impact */}
                    <div style={{
                      fontSize: '13px', color: 'var(--oneui-text-secondary)',
                      padding: '10px 12px', borderRadius: '14px',
                      background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                      marginBottom: '10px', lineHeight: 1.5,
                      display: 'flex', flexDirection: 'column', gap: '6px'
                    }}>
                      <div><strong>Why:</strong> {goal.whyItHelps || action.reason}</div>
                      <div style={{ color: 'var(--oneui-success)', fontWeight: 500 }}>
                        <strong>Impact:</strong> {goal.expectedImpact || action.estimatedImpact}
                      </div>
                    </div>

                    {/* Navigation Path Breadcrumb */}
                    {action.destinationPath && action.destinationPath.length > 0 && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        padding: '8px 12px', borderRadius: '12px',
                        background: 'rgba(32, 117, 214, 0.08)',
                        marginBottom: '12px', flexWrap: 'wrap'
                      }}>
                        <span style={{ marginRight: '4px', display: 'inline-flex', alignItems: 'center' }}>
                          <IMapPin style={{ width: '13px', height: '13px', color: 'var(--oneui-accent)' }} />
                        </span>
                        {action.destinationPath.map((seg, si) => (
                          <span key={si} style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{
                              color: si === action.destinationPath.length - 1 ? 'var(--oneui-accent)' : 'var(--oneui-text-secondary)',
                              fontWeight: si === action.destinationPath.length - 1 ? 600 : 400
                            }}>
                              {seg}
                            </span>
                            {si < action.destinationPath.length - 1 && <span style={{ color: 'var(--oneui-text-tertiary)' }}>›</span>}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Steps */}
                    <div style={{ marginBottom: '16px' }}>
                      {action.steps.map((step, si) => (
                        <div key={si} style={{
                          display: 'flex', alignItems: 'flex-start', gap: '10px',
                          padding: '5px 0',
                        }}>
                          <div style={{
                            width: '20px', height: '20px', borderRadius: '50%',
                            background: 'rgba(32, 117, 214, 0.12)',
                            color: 'var(--oneui-accent)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '11px', fontWeight: 700, flexShrink: 0, marginTop: '1px'
                          }}>{si + 1}</div>
                          <div style={{ fontSize: '13px', color: 'var(--oneui-text-primary)', lineHeight: 1.4 }}>{step}</div>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button 
                        data-testid={`demo-btn-${idx}`}
                        onClick={() => onWatchDemo(action)} 
                        disabled={isExecuting}
                        style={{
                          flex: 1, minWidth: '90px', padding: '12px 14px', borderRadius: '16px',
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          transition: 'all 0.2s ease',
                          opacity: isExecuting ? 0.5 : 1
                        }}
                      >
                        <IFilm style={{ width: '15px', height: '15px' }} /> Watch Demo
                      </button>

                      <button 
                        data-testid={`auto-fix-btn-${idx}`}
                        onClick={() => onPerformAuto(action)} 
                        disabled={isExecuting}
                        style={{
                          flex: 1.2, minWidth: '100px', padding: '12px 14px', borderRadius: '16px',
                          background: 'linear-gradient(135deg, #2075d6 0%, #155bb5 100%)',
                          border: 'none',
                          boxShadow: '0 4px 14px rgba(32, 117, 214, 0.4)',
                          color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          transition: 'all 0.2s ease',
                          opacity: isExecuting ? 0.7 : 1
                        }}
                      >
                        <IZap style={{ width: '15px', height: '15px' }} /> 
                        {isExecuting ? 'Applying...' : 'Apply Fix'}
                      </button>

                      <button 
                        onClick={() => onPerformManual(action)} 
                        disabled={isExecuting}
                        style={{
                          flex: 0.8, minWidth: '80px', padding: '12px 14px', borderRadius: '16px',
                          background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                          color: 'var(--oneui-text-primary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                          border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          transition: 'all 0.2s ease',
                          opacity: isExecuting ? 0.5 : 1
                        }}
                      >
                        <IWrench style={{ width: '15px', height: '15px' }} /> Manual
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom spacing */}
        <div style={{ height: '16px' }} />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}} />
    </div>
  );
}
