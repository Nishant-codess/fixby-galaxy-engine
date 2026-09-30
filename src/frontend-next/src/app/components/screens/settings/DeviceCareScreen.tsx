import React, { useState } from 'react';
import { SettingsRow } from '../../ui/SettingsRow';
import { Screen } from '../../../../hooks/usePhoneNavigation';

function isHighlighted(targetPath: string[], ...keywords: string[]): boolean {
  const combined = targetPath.join(' ').toLowerCase();
  return keywords.some(kw => combined.includes(kw.toLowerCase()));
}

interface Props { targetPath: string[]; onNavigate: (s: Screen) => void; }

export function DeviceCareScreen({ targetPath, onNavigate }: Props) {
  const [autoOptimization, setAutoOptimization] = useState(true);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'var(--oneui-bg-primary)' }}>
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingBottom: '72px' }}>
        <div style={{ padding: '64px 16px 20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 300, color: 'var(--oneui-text-primary)', margin: 0 }}>
            Device care
          </h1>
        </div>
        
        {/* Optimize Now mockup */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 24px 24px', gap: '12px', position: 'relative' }}>
          <div style={{ fontSize: '100px' }}>😊</div>
          <div style={{ color: 'var(--oneui-success)', fontSize: '20px' }}>Great!</div>
          <div style={{ position: 'relative' }}>
            <button style={{
              background: 'var(--oneui-accent)', color: '#fff', border: 'none', borderRadius: '24px',
              padding: '12px 32px', fontSize: '16px', fontWeight: 600, marginTop: '8px', cursor: 'pointer',
              boxShadow: isHighlighted(targetPath, 'optimize now') ? '0 0 0 4px rgba(32,117,214,0.4)' : 'none'
            }}>Optimize now</button>
            {isHighlighted(targetPath, 'optimize now') && (
              <div style={{
                position: 'absolute', right: '-20px', top: '-10px',
                background: 'linear-gradient(135deg, #2075d6, #6c47ff)',
                color: '#fff', fontSize: '10px', fontWeight: 700,
                padding: '3px 8px', borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(32,117,214,0.5)',
                animation: 'popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                whiteSpace: 'nowrap'
              }}>
                Tap here
              </div>
            )}
          </div>
        </div>

        {/* Group 1 */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <SettingsRow title="Battery" rightLabel="12h 35m left" showChevron onPress={() => onNavigate('settings/battery')} divider highlight={isHighlighted(targetPath, 'battery')} />
          <SettingsRow title="Storage" rightLabel="32.4 GB / 256 GB" showChevron onPress={() => {}} divider highlight={isHighlighted(targetPath, 'storage')} />
          <SettingsRow title="Memory" rightLabel="4.2 GB / 12 GB" showChevron onPress={() => {}} divider highlight={isHighlighted(targetPath, 'memory')} />
          <SettingsRow title="App protection" rightLabel="No threats" showChevron onPress={() => {}} highlight={isHighlighted(targetPath, 'app protection')} />
        </div>

        {/* Group 2 */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <SettingsRow title="Software update" rightLabel="Last checked 2h ago" showChevron onPress={() => {}} divider highlight={isHighlighted(targetPath, 'software update')} />
          <SettingsRow title="Diagnostics" showChevron onPress={() => {}} highlight={isHighlighted(targetPath, 'diagnostics')} />
        </div>

        {/* Group 3 */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <SettingsRow title="Auto optimization" subtitle="Restart when needed" toggle toggleValue={autoOptimization} onToggleChange={setAutoOptimization} divider highlight={isHighlighted(targetPath, 'auto optimization')} />
          <SettingsRow title="Performance profile" rightLabel="Standard" showChevron onPress={() => {}} highlight={isHighlighted(targetPath, 'performance profile')} />
        </div>
      </div>
    </div>
  );
}
