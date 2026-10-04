"use client";

import React from 'react';
import { useHistory } from '../../context/HistoryContext';
import { useSettings } from '../../context/SettingsContext';
import { IClock, ISettings, IZap } from '../ui/Icons';

interface FixbyTopNavProps {
  onOpenHistory: () => void;
  onOpenDeviceModal: () => void;
  onExitConsole: () => void;
  onNewTroubleshoot?: () => void;
}

export function FixbyTopNav({
  onOpenHistory,
  onOpenDeviceModal,
  onExitConsole,
  onNewTroubleshoot
}: FixbyTopNavProps) {
  const { history } = useHistory();
  const { darkMode } = useSettings();

  return (
    <header
      data-testid="fixby-top-nav"
      style={{
        position: 'fixed',
        top: '20px',
        left: '24px',
        right: '24px',
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        borderRadius: '24px',
        background: darkMode ? 'rgba(18, 20, 26, 0.75)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(30px) saturate(1.8)',
        border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: darkMode ? '0 12px 32px rgba(0, 0, 0, 0.4)' : '0 12px 32px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Brand & Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={onExitConsole}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #2075D6 0%, #6C47FF 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '16px',
            boxShadow: '0 4px 12px rgba(32, 117, 214, 0.3)',
          }}>
            F
          </div>
          <span style={{
            fontSize: '17px',
            fontWeight: 700,
            color: 'var(--oneui-text-primary)',
            letterSpacing: '-0.02em',
          }}>
            Fixby
          </span>
        </button>

        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          padding: '3px 9px',
          borderRadius: '12px',
          background: 'rgba(32, 117, 214, 0.15)',
          color: 'var(--oneui-accent-light)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          border: '1px solid rgba(32, 117, 214, 0.25)',
        }}>
          Galaxy AI Engine
        </span>
      </div>

      {/* Nav Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {onNewTroubleshoot && (
          <button
            data-testid="nav-new-troubleshoot-btn"
            onClick={onNewTroubleshoot}
            style={{
              padding: '8px 16px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #2075D6 0%, #6C47FF 100%)',
              border: 'none',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(32, 117, 214, 0.3)',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <IZap style={{ width: '14px', height: '14px' }} />
            <span>New Diagnose</span>
          </button>
        )}

        {/* History Button */}
        <button
          data-testid="nav-history-btn"
          onClick={onOpenHistory}
          style={{
            padding: '8px 14px',
            borderRadius: '14px',
            background: darkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
            border: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
            color: 'var(--oneui-text-primary)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = darkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)'}
        >
          <IClock style={{ width: '15px', height: '15px', color: 'var(--oneui-accent-light)' }} />
          <span>History</span>
          {history.length > 0 && (
            <span
              data-testid="nav-history-badge"
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '8px',
                background: 'var(--oneui-accent)',
                color: '#fff',
              }}
            >
              {history.length}
            </span>
          )}
        </button>

        {/* Device & Capabilities Button */}
        <button
          data-testid="nav-device-btn"
          onClick={onOpenDeviceModal}
          style={{
            padding: '8px 14px',
            borderRadius: '14px',
            background: darkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
            border: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
            color: 'var(--oneui-text-primary)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = darkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)'}
        >
          <ISettings style={{ width: '15px', height: '15px', color: 'var(--oneui-text-secondary)' }} />
          <span>About Device</span>
        </button>

        {/* Back to landing */}
        <button
          data-testid="nav-exit-btn"
          onClick={onExitConsole}
          style={{
            padding: '8px 14px',
            borderRadius: '14px',
            background: 'transparent',
            border: 'none',
            color: 'var(--oneui-text-secondary)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--oneui-text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--oneui-text-secondary)'}
        >
          Exit Console →
        </button>
      </div>
    </header>
  );
}
