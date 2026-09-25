import React, { useState } from 'react';
import { SettingsRow } from '../../ui/SettingsRow';
import { Screen } from '../../../../hooks/usePhoneNavigation';

function isHighlighted(targetPath: string[], ...keywords: string[]): boolean {
  const combined = targetPath.join(' ').toLowerCase();
  return keywords.some(kw => combined.includes(kw.toLowerCase()));
}

interface Props { targetPath: string[]; onNavigate: (s: Screen) => void; }

export function WellbeingSettings({ targetPath, onNavigate }: Props) {
  const [focusMode, setFocusMode] = useState(false);
  const [bedtimeMode, setBedtimeMode] = useState(false);
  const [drivingMonitor, setDrivingMonitor] = useState(false);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'var(--oneui-bg-primary)' }}>
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingBottom: '72px' }}>
        <div style={{ padding: '64px 16px 20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 300, color: 'var(--oneui-text-primary)', margin: 0, lineHeight: 1.1 }}>
            Digital Wellbeing and parental controls
          </h1>
        </div>

        {/* Screen Time Goal */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '150px', height: '150px' }}>
             <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="none" />
                <circle cx="50" cy="50" r="40" stroke="#8e5ef5" strokeWidth="12" fill="none" strokeDasharray="251.2" strokeDashoffset={251.2 * 0.4} />
             </svg>
             <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 300 }}>4h 12m</div>
             </div>
          </div>
          <div style={{ marginTop: '16px', color: 'var(--oneui-text-secondary)', fontSize: '14px' }}>Screen time goal: 7h</div>
        </div>

        {/* Goals */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <SettingsRow title="Screen time" showChevron onPress={() => {}} divider highlight={isHighlighted(targetPath, 'screen time')} />
          <SettingsRow title="App timers" showChevron onPress={() => {}} divider highlight={isHighlighted(targetPath, 'app timers')} />
          <SettingsRow title="Volume monitor" showChevron onPress={() => {}} highlight={isHighlighted(targetPath, 'volume monitor')} />
        </div>

        {/* Ways to disconnect */}
        <div style={{ margin: '0 16px 24px' }}>
            <div style={{ fontSize: '14px', color: 'var(--oneui-accent)', fontWeight: 600, paddingLeft: '16px', marginBottom: '8px' }}>Ways to disconnect</div>
            <div style={{ background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
                <SettingsRow title="Focus mode" toggle toggleValue={focusMode} onToggleChange={setFocusMode} divider highlight={isHighlighted(targetPath, 'focus mode')} />
                <SettingsRow title="Bedtime mode" toggle toggleValue={bedtimeMode} onToggleChange={setBedtimeMode} divider highlight={isHighlighted(targetPath, 'bedtime mode')} />
                <SettingsRow title="Driving monitor" toggle toggleValue={drivingMonitor} onToggleChange={setDrivingMonitor} highlight={isHighlighted(targetPath, 'driving monitor')} />
            </div>
        </div>

      </div>
    </div>
  );
}
