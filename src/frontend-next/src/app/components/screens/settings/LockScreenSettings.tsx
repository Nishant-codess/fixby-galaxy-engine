import React from 'react';
import { SettingsRow } from '../../ui/SettingsRow';

interface Props {
  onBack: () => void;
  targetPath?: string[];
}

export function LockScreenSettings({ onBack, targetPath = [] }: Props) {
  const highlightAOD = targetPath.join(' ').toLowerCase().includes('always on');
  const highlightWallpaper = targetPath.join(' ').toLowerCase().includes('wallpaper');

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'var(--oneui-bg-primary)' }}>
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingBottom: '72px' }}>
        <div style={{ padding: '64px 16px 20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 300, color: 'var(--oneui-text-primary)', margin: 0 }}>
            Lock screen
          </h1>
        </div>

        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <SettingsRow title="Wallpaper and style" highlight={highlightWallpaper} showChevron divider />
          <SettingsRow title="Always On Display" highlight={highlightAOD} toggle toggleValue={true} divider />
          <SettingsRow title="Clock style" showChevron divider />
          <SettingsRow title="Roaming clock" toggle toggleValue={false} divider />
          <SettingsRow title="Widgets" showChevron divider />
          <SettingsRow title="Contact information" showChevron divider />
          <SettingsRow title="Notifications" rightLabel="Icons only" showChevron />
        </div>
      </div>
    </div>
  );
}
