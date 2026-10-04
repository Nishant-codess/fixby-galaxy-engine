import React, { useState } from 'react';
import { ICheck } from '../../ui/Icons';
import { useSettings } from '../../../context/SettingsContext';

interface Props {
  onBack: () => void;
  targetPath?: string[];
}

export function BatteryUsageScreen({ onBack, targetPath = [] }: Props) {
  const { settings, setSetting } = useSettings();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isOptimized = settings.batteryOptimized;

  const handleOptimize = () => {
    setSetting('batteryOptimized', true);
    setSetting('deepSleepingAppsCount', 8);
    setToastMessage("Put 4 high-drain background apps into deep sleep");
    setTimeout(() => setToastMessage(null), 2500);
  };

  const isHighlighted = targetPath.some(p => 
    p.toLowerCase().includes('sleep') || 
    p.toLowerCase().includes('usage') || 
    p.toLowerCase().includes('background')
  );

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
          marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '16px',
          border: isHighlighted ? '2px solid var(--oneui-accent)' : 'none',
          boxShadow: isHighlighted ? '0 0 16px rgba(32, 117, 214, 0.3)' : 'none'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '32px', fontWeight: 300, color: '#fff' }}>{settings.batteryPercentage}%</div>
              <div style={{ fontSize: '13px', color: 'var(--oneui-success)', fontWeight: 500 }}>
                {settings.powerSaving ? '18 h 45 m left (Power saving)' : '12 h 35 m left'}
              </div>
            </div>
            <button
              onClick={handleOptimize}
              disabled={isOptimized}
              style={{
                background: isOptimized ? 'rgba(52, 199, 89, 0.2)' : 'var(--oneui-accent)',
                color: isOptimized ? '#34c759' : '#fff',
                border: 'none', borderRadius: '18px', padding: '10px 18px',
                fontSize: '13px', fontWeight: 600, cursor: isOptimized ? 'default' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {isOptimized ? <><ICheck style={{ width: '13px', height: '13px', verticalAlign: 'middle' }} /> Optimized</> : 'Put apps to sleep'}
            </button>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--oneui-text-secondary)' }}>
            Deep sleeping apps: <strong style={{ color: 'var(--oneui-accent)' }}>{settings.deepSleepingAppsCount} apps</strong>
          </div>

          {/* Mini Chart Mockup */}
          <div style={{ height: '70px', display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '10px 0 4px', borderBottom: '1px solid var(--oneui-separator)' }}>
            {[45, 60, 52, 78, 65, 80, 55, 70, 78].map((h, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{
                  width: '100%', height: `${h * 0.6}px`, borderRadius: '4px',
                  background: i === 8 ? (isOptimized ? '#34c759' : 'var(--oneui-accent)') : 'rgba(255,255,255,0.1)'
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
            { name: "Camera", usage: "18.4%", active: "42m active", color: "#e9303a", sleeping: false },
            { name: "Instagram", usage: "14.2%", active: "1h 10m active", color: "#8e5ef5", sleeping: isOptimized },
            { name: "YouTube", usage: "11.5%", active: "55m active", color: "#ff0000", sleeping: false },
            { name: "Game Booster", usage: "8.1%", active: "Background", color: "#ff6400", sleeping: isOptimized },
            { name: "One UI Home", usage: "4.2%", active: "System", color: "#2075d6", sleeping: false }
          ].map((app, i, arr) => (
            <div key={app.name} style={{
              padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: i < arr.length - 1 ? '1px solid var(--oneui-separator)' : 'none'
            }}>
              <div>
                <div style={{ fontSize: '15px', color: 'var(--oneui-text-primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {app.name}
                  {app.sleeping && (
                    <span style={{ fontSize: '10px', background: 'rgba(52, 199, 89, 0.15)', color: '#34c759', padding: '2px 6px', borderRadius: '6px' }}>
                      Deep Sleep
                    </span>
                  )}
                </div>
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
