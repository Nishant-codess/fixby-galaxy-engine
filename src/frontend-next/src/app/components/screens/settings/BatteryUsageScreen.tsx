import React, { useState } from 'react';
import { Ripple } from '../../ui/Ripple';
import { ICheck } from '../../ui/Icons';

interface Props {
  onBack: () => void;
  targetPath?: string[];
}

export function BatteryUsageScreen({ onBack, targetPath = [] }: Props) {
  const [optimized, setOptimized] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleOptimize = () => {
    setOptimized(true);
    setToastMessage("Put 4 background apps to sleep");
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 35, background: 'var(--oneui-bg-primary)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Scrollable Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '56px 16px 72px' }}>
        
        {/* Back navigation */}
        <div 
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '12px', width: 'fit-content', color: 'var(--oneui-accent)', userSelect: 'none' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span style={{ fontSize: '15px', fontWeight: 500 }}>Battery</span>
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: 300, color: 'var(--oneui-text-primary)', margin: '0 0 20px', letterSpacing: '-0.02em' }}>
          Battery usage
        </h1>

        {/* Battery Summary Card */}
        <div style={{
          background: 'var(--oneui-bg-card)', borderRadius: '24px', padding: '20px',
          marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '32px', fontWeight: 300, color: '#fff' }}>78%</div>
              <div style={{ fontSize: '13px', color: 'var(--oneui-success)', fontWeight: 500 }}>12 h 35 m left</div>
            </div>
            <button
              onClick={handleOptimize}
              disabled={optimized}
              style={{
                background: optimized ? 'rgba(52, 199, 89, 0.2)' : 'var(--oneui-accent)',
                color: optimized ? '#34c759' : '#fff',
                border: 'none', borderRadius: '18px', padding: '10px 18px',
                fontSize: '13px', fontWeight: 600, cursor: optimized ? 'default' : 'pointer'
              }}
            >
              {optimized ? <><ICheck style={{ width: '13px', height: '13px', verticalAlign: 'middle' }} /> Optimized</> : 'Put apps to sleep'}
            </button>
          </div>

          {/* Mini Chart Mockup */}
          <div style={{ height: '70px', display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '10px 0 4px', borderBottom: '1px solid var(--oneui-separator)' }}>
            {[45, 60, 52, 78, 65, 80, 55, 70, 78].map((h, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{
                  width: '100%', height: `${h * 0.6}px`, borderRadius: '4px',
                  background: i === 8 ? 'var(--oneui-accent)' : 'rgba(255,255,255,0.1)'
                }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--oneui-text-tertiary)' }}>
            <span>Yesterday</span>
            <span>Today (Now)</span>
          </div>
        </div>

        {/* App Consumption List */}
        <div style={{ fontSize: '14px', color: 'var(--oneui-accent)', fontWeight: 600, paddingLeft: '8px', marginBottom: '8px' }}>
          App usage since last charge
        </div>
        <div style={{ background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          {[
            { name: "Camera", usage: "18.4%", active: "42m active", color: "#e9303a" },
            { name: "Instagram", usage: "14.2%", active: "1h 10m active", color: "#8e5ef5" },
            { name: "YouTube", usage: "11.5%", active: "55m active", color: "#ff0000" },
            { name: "Game Booster", usage: "8.1%", active: "Background", color: "#ff6400" },
            { name: "One UI Home", usage: "4.2%", active: "System", color: "#2075d6" }
          ].map((app, i, arr) => (
            <div key={app.name} style={{
              padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: i < arr.length - 1 ? '1px solid var(--oneui-separator)' : 'none'
            }}>
              <div>
                <div style={{ fontSize: '15px', color: 'var(--oneui-text-primary)', fontWeight: 500 }}>{app.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--oneui-text-secondary)' }}>{app.active}</div>
              </div>
              <div style={{ fontSize: '15px', color: 'var(--oneui-accent)', fontWeight: 600 }}>{app.usage}</div>
            </div>
          ))}
        </div>

      </div>

      {toastMessage && (
        <div style={{
          position: 'absolute', bottom: '88px', left: '20px', right: '20px',
          background: 'rgba(20, 20, 20, 0.95)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px', padding: '12px 18px', textAlign: 'center',
          color: '#fff', fontSize: '13px', fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          animation: 'popIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          zIndex: 100
        }}>
          <ICheck style={{ width: '13px', height: '13px', verticalAlign: 'middle' }} /> {toastMessage}
        </div>
      )}

    </div>
  );
}
