"use client";

import React from 'react';
import { useHistory, TroubleshootHistoryItem } from '../../context/HistoryContext';
import { useSettings } from '../../context/SettingsContext';
import { IClock, IXClose, ICheck, IZap, IFilm, IChevronRight, IAlertTriangle } from '../ui/Icons';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectHistoryItem: (item: TroubleshootHistoryItem) => void;
}

export function HistoryDrawer({ isOpen, onClose, onSelectHistoryItem }: HistoryDrawerProps) {
  const { history, clearHistory, deleteHistoryItem } = useHistory();
  const { darkMode } = useSettings();

  if (!isOpen) return null;

  return (
    <div 
      data-testid="history-drawer-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 500,
        display: 'flex',
        justifyContent: 'flex-end',
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.25s ease-out',
      }}
    >
      {/* Click backdrop to close */}
      <div 
        style={{ flex: 1 }} 
        onClick={onClose} 
      />

      {/* Drawer Panel */}
      <aside 
        data-testid="history-drawer-panel"
        style={{
          width: '100%',
          maxWidth: '440px',
          height: '100%',
          background: darkMode ? 'rgba(18, 20, 26, 0.95)' : 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(30px) saturate(1.8)',
          borderLeft: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '-16px 0 48px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden',
          zIndex: 501,
        }}
      >
        {/* Drawer Header */}
        <div style={{
          padding: '24px 28px 20px',
          borderBottom: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2075D6 0%, #6C47FF 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(32, 117, 214, 0.3)',
            }}>
              <IClock style={{ width: '18px', height: '18px' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '17px',
                  fontWeight: 700,
                  color: 'var(--oneui-text-primary)',
                  letterSpacing: '-0.01em',
                }}>
                  Troubleshooting History
                </h3>
                <span 
                  data-testid="history-count-badge"
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    background: history.length > 0 ? 'rgba(32, 117, 214, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                    color: history.length > 0 ? 'var(--oneui-accent-light)' : 'var(--oneui-text-tertiary)',
                    border: '1px solid rgba(32, 117, 214, 0.2)',
                  }}
                >
                  {history.length} / 5
                </span>
              </div>
              <div style={{
                fontSize: '12px',
                color: 'var(--oneui-text-secondary)',
                marginTop: '2px',
              }}>
                Stored locally on this device
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {history.length > 0 && (
              <button
                data-testid="history-clear-btn"
                onClick={clearHistory}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--oneui-text-secondary)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--oneui-danger)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--oneui-text-secondary)'}
              >
                Clear all
              </button>
            )}
            <button
              data-testid="history-close-btn"
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                border: 'none',
                color: 'var(--oneui-text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = darkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'}
            >
              <IXClose style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}>
          {history.length === 0 ? (
            /* Empty State */
            <div 
              data-testid="history-empty-state"
              style={{
                margin: 'auto 0',
                padding: '48px 24px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '24px',
                background: darkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                border: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--oneui-text-tertiary)',
              }}>
                <IClock style={{ width: '28px', height: '28px' }} />
              </div>
              <div>
                <h4 style={{
                  margin: '0 0 6px',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'var(--oneui-text-primary)',
                }}>
                  No troubleshooting history yet
                </h4>
                <p style={{
                  margin: 0,
                  fontSize: '13px',
                  lineHeight: 1.5,
                  color: 'var(--oneui-text-secondary)',
                  maxWidth: '280px',
                }}>
                  When you diagnose an issue with Fixby, your recent resolutions and applied fixes will be saved here.
                </p>
              </div>
            </div>
          ) : (
            /* History Items List (up to 5 items) */
            history.map((item, index) => {
              const hasApplied = item.status === 'applied' && item.appliedFix;
              const hasDemoed = item.status === 'demonstrated';

              return (
                <div
                  key={item.id}
                  data-testid={`history-item-${index}`}
                  onClick={() => onSelectHistoryItem(item)}
                  style={{
                    padding: '16px 18px',
                    borderRadius: '20px',
                    background: darkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                    border: darkMode ? '1px solid rgba(255, 255, 255, 0.07)' : '1px solid rgba(0, 0, 0, 0.06)',
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    position: 'relative',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = darkMode ? 'rgba(32, 117, 214, 0.08)' : 'rgba(32, 117, 214, 0.04)';
                    e.currentTarget.style.borderColor = 'rgba(32, 117, 214, 0.3)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = darkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)';
                    e.currentTarget.style.borderColor = darkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Top line: Problem Title + Timestamp */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      color: 'var(--oneui-text-primary)',
                      lineHeight: 1.3,
                    }}>
                      {item.problemTitle}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: 'var(--oneui-text-secondary)',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}>
                      {item.timestamp}
                    </div>
                  </div>

                  {/* Query text */}
                  <div style={{
                    fontSize: '13px',
                    color: 'var(--oneui-text-secondary)',
                    fontStyle: 'italic',
                    lineHeight: 1.4,
                  }}>
                    &quot;{item.query}&quot;
                  </div>

                  {/* Status Badges & Fix Count */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '4px',
                    gap: '8px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: '8px',
                        background: darkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
                        color: 'var(--oneui-text-primary)',
                      }}>
                        {item.suggestedFixes.length} {item.suggestedFixes.length === 1 ? 'fix' : 'fixes'} suggested
                      </span>

                      {hasApplied && (
                        <span 
                          data-testid={`history-status-applied-${index}`}
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '8px',
                            background: 'rgba(52, 199, 89, 0.15)',
                            color: 'var(--oneui-success)',
                            border: '1px solid rgba(52, 199, 89, 0.3)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <ICheck style={{ width: '12px', height: '12px' }} />
                          {item.appliedFix} applied
                        </span>
                      )}

                      {!hasApplied && hasDemoed && (
                        <span
                          data-testid={`history-status-demonstrated-${index}`}
                          style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '8px',
                          background: 'rgba(32, 117, 214, 0.15)',
                          color: 'var(--oneui-accent-light)',
                          border: '1px solid rgba(32, 117, 214, 0.3)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                        >
                          <IFilm style={{ width: '12px', height: '12px' }} />
                          Demo viewed
                        </span>
                      )}
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: 'var(--oneui-accent)',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}>
                      <span>Reopen</span>
                      <IChevronRight style={{ width: '14px', height: '14px' }} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer note */}
        <div style={{
          padding: '16px 28px',
          borderTop: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: 'var(--oneui-text-tertiary)',
        }}>
          <span>Cap: latest 5 queries</span>
          <span>Click any session to reload</span>
        </div>
      </aside>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}} />
    </div>
  );
}
