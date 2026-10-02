import React, { useState } from 'react';
import { SettingsRow } from '../../ui/SettingsRow';
import { Screen } from '../../../../hooks/usePhoneNavigation';

export function BatteryScreen({ targetPath, onNavigate }: { targetPath: string[]; onNavigate: (s: Screen) => void }) {
  const [powerSaving, setPowerSaving] = useState(false);
  const [protectBattery, setProtectBattery] = useState(false);

  const targetNode = targetPath[2];

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'var(--oneui-bg-primary)' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflowY: 'auto', overflowX: 'hidden', paddingBottom: '72px' }}>
        <div style={{ padding: '64px 16px 20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 300, color: 'var(--oneui-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Battery and device care</h1>
        </div>
        
        {/* Battery Gauge Mockup */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 24px 24px', gap: '12px' }}>
          <div style={{ position: 'relative', width: '120px', height: '120px' }}>
            <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="40" stroke="var(--oneui-separator)" strokeWidth="8" fill="none" />
              <circle cx="50" cy="50" r="40" stroke="#34c759" strokeWidth="8" fill="none" strokeDasharray="251.2" strokeDashoffset={251.2 * 0.22} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 300, color: 'var(--oneui-text-primary)' }}>78%</div>
            </div>
          </div>
          <div style={{ color: 'var(--oneui-success)' }}>12 h 35 m left</div>
        </div>

        {/* Group 1 */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <SettingsRow title="Battery usage" showChevron onPress={() => onNavigate('settings/generic/Battery usage')} divider highlight={targetNode?.toLowerCase().includes('usage')} />
          <SettingsRow title="Power saving" toggle toggleValue={powerSaving} onToggleChange={setPowerSaving} divider highlight={targetNode?.toLowerCase().includes('power')} />
          <SettingsRow title="Background usage limits" showChevron onPress={() => onNavigate('settings/generic/Background usage limits')} divider highlight={targetNode?.toLowerCase().includes('background')} />
          <SettingsRow title="Protect battery" toggle toggleValue={protectBattery} onToggleChange={setProtectBattery} highlight={targetNode?.toLowerCase().includes('protect')} />
        </div>

        {/* Group 2 */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <SettingsRow title="Storage" rightLabel="32.4 GB / 256 GB" showChevron onPress={() => onNavigate('settings/generic/Storage')} divider highlight={targetNode?.toLowerCase() === 'storage'} />
          <SettingsRow title="Memory" rightLabel="4.2 GB / 12 GB" showChevron onPress={() => onNavigate('settings/generic/Memory')} divider highlight={targetNode?.toLowerCase() === 'memory'} />
          <SettingsRow title="Device protection" rightLabel="No threats" showChevron onPress={() => onNavigate('settings/generic/Device protection')} highlight={targetNode?.toLowerCase().includes('protection')} />
        </div>

      </div>
    </div>
  );
}
