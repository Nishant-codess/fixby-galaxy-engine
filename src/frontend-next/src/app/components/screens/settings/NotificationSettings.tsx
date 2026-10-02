import React, { useState } from 'react';
import { SettingsRow } from '../../ui/SettingsRow';
import { Screen } from '../../../../hooks/usePhoneNavigation';

function isHighlighted(targetPath: string[], ...keywords: string[]): boolean {
  const combined = targetPath.join(' ').toLowerCase();
  return keywords.some(kw => combined.includes(kw.toLowerCase()));
}

interface Props { targetPath: string[]; onNavigate: (s: Screen) => void; }

export function NotificationSettings({ targetPath, onNavigate }: Props) {
  const [doNotDisturb, setDoNotDisturb] = useState(false);
  const [appIconBadges, setAppIconBadges] = useState(true);
  const [briefPopUp, setBriefPopUp] = useState(true);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'var(--oneui-bg-primary)' }}>
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingBottom: '72px' }}>
        <div style={{ padding: '64px 16px 20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 300, color: 'var(--oneui-text-primary)', margin: 0 }}>
            Notifications
          </h1>
        </div>

        {/* Notifications */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <SettingsRow title="App notifications" showChevron onPress={() => onNavigate('settings/generic/App notifications')} divider highlight={isHighlighted(targetPath, 'app notifications')} />
          <SettingsRow title="Lock screen notifications" rightLabel="Show content" showChevron onPress={() => onNavigate('settings/generic/Lock screen notifications')} divider highlight={isHighlighted(targetPath, 'lock screen notifications')} />
          <SettingsRow title="Notification pop-up style" rightLabel={briefPopUp ? "Brief" : "Detailed"} showChevron onPress={() => onNavigate('settings/generic/Notification pop-up style')} highlight={isHighlighted(targetPath, 'notification pop-up style')} />
        </div>

        {/* Pop-up style specific */}
        {briefPopUp && (
          <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
            <div style={{ fontSize: '14px', color: 'var(--oneui-text-secondary)', padding: '16px 16px 8px' }}>Brief pop-up settings</div>
            <SettingsRow title="Edge lighting style" showChevron onPress={() => onNavigate('settings/generic/Edge lighting style')} divider highlight={isHighlighted(targetPath, 'edge lighting style')} />
            <SettingsRow title="Color by keyword" showChevron onPress={() => onNavigate('settings/generic/Color by keyword')} highlight={isHighlighted(targetPath, 'color by keyword')} />
          </div>
        )}

        {/* Do Not Disturb */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <SettingsRow title="Do not disturb" toggle toggleValue={doNotDisturb} onToggleChange={setDoNotDisturb} highlight={isHighlighted(targetPath, 'do not disturb')} />
        </div>
        
        {/* Advanced settings */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <SettingsRow title="Advanced settings" showChevron onPress={() => onNavigate('settings/generic/Advanced settings')} divider highlight={isHighlighted(targetPath, 'advanced settings')} />
          <SettingsRow title="App icon badges" toggle toggleValue={appIconBadges} onToggleChange={setAppIconBadges} highlight={isHighlighted(targetPath, 'app icon badges')} />
        </div>

      </div>
    </div>
  );
}
