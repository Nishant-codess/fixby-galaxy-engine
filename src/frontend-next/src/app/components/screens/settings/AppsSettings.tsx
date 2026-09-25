import React from 'react';
import { SettingsRow } from '../../ui/SettingsRow';
import { Screen } from '../../../../hooks/usePhoneNavigation';

function isHighlighted(targetPath: string[], ...keywords: string[]): boolean {
  const combined = targetPath.join(' ').toLowerCase();
  return keywords.some(kw => combined.includes(kw.toLowerCase()));
}

interface Props { targetPath: string[]; onNavigate: (s: Screen) => void; }

export function AppsSettings({ targetPath, onNavigate }: Props) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'var(--oneui-bg-primary)' }}>
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingBottom: '72px' }}>
        <div style={{ padding: '64px 16px 20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 300, color: 'var(--oneui-text-primary)', margin: 0 }}>
            Apps
          </h1>
        </div>

        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <SettingsRow title="Choose default apps" showChevron onPress={() => {}} divider highlight={isHighlighted(targetPath, 'default')} />
          <SettingsRow title="Samsung app settings" showChevron onPress={() => {}} divider highlight={isHighlighted(targetPath, 'samsung')} />
          <SettingsRow title="Camera" subtitle="84 MB" showChevron onPress={() => {}} divider highlight={isHighlighted(targetPath, 'camera')} />
          <SettingsRow title="Messages" subtitle="120 MB" showChevron onPress={() => {}} highlight={isHighlighted(targetPath, 'messages')} />
        </div>
      </div>
    </div>
  );
}
