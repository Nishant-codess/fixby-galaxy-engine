import React from 'react';
import { Screen } from '../../../hooks/usePhoneNavigation';
import { Ripple } from '../ui/Ripple';

export function RecentApps({ onNavigate, onCloseAll }: { onNavigate: (s: Screen) => void; onCloseAll: () => void }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* Mock Settings Card */}
      <div style={{ width: '70%', height: '60%', background: 'var(--oneui-bg-primary)', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 48px rgba(0,0,0,0.5)', transition: 'transform 0.3s', cursor: 'pointer' }} onClick={() => onNavigate('settings')}>
        
        {/* App Header */}
        <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--oneui-bg-card)' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#8E8E93', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </div>
          <span style={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>Settings</span>
        </div>

        {/* Snapshot Mock */}
        <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', opacity: 0.5 }}>
          <div style={{ height: '32px', width: '60%', background: 'var(--oneui-bg-card-alt)', borderRadius: '8px' }} />
          <div style={{ height: '64px', width: '100%', background: 'var(--oneui-bg-card-alt)', borderRadius: '16px' }} />
          <div style={{ height: '64px', width: '100%', background: 'var(--oneui-bg-card-alt)', borderRadius: '16px' }} />
          <div style={{ height: '64px', width: '100%', background: 'var(--oneui-bg-card-alt)', borderRadius: '16px' }} />
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '100px' }}>
        <Ripple onClick={onCloseAll} style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.15)', borderRadius: '24px', color: '#fff', fontSize: '14px', fontWeight: 600, backdropFilter: 'blur(10px)' }}>
          Close all
        </Ripple>
      </div>

    </div>
  );
}
