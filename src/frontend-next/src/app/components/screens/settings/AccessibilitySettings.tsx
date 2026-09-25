import React, { useState } from 'react';
import { SettingsRow } from '../../ui/SettingsRow';
import { Screen } from '../../../../hooks/usePhoneNavigation';

function isHighlighted(targetPath: string[], ...keywords: string[]): boolean {
  const combined = targetPath.join(' ').toLowerCase();
  return keywords.some(kw => combined.includes(kw.toLowerCase()));
}

interface Props { targetPath: string[]; onNavigate: (s: Screen) => void; }

export function AccessibilitySettings({ targetPath, onNavigate }: Props) {
  const [accessibilityShortcut, setAccessibilityShortcut] = useState(true);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'var(--oneui-bg-primary)' }}>
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingBottom: '72px' }}>
        <div style={{ padding: '64px 16px 20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 300, color: 'var(--oneui-text-primary)', margin: 0 }}>
            Accessibility
          </h1>
        </div>

        {/* Recommended */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <SettingsRow title="Recommended for you" showChevron onPress={() => {}} highlight={isHighlighted(targetPath, 'recommended for you')} />
        </div>

        {/* Categories */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <SettingsRow title="TalkBack" showChevron onPress={() => {}} divider highlight={isHighlighted(targetPath, 'talkback')} />
          <SettingsRow title="Spoken assistance" showChevron onPress={() => {}} divider highlight={isHighlighted(targetPath, 'spoken assistance')} />
          <SettingsRow title="Visibility enhancements" subtitle="Magnification, Color correction" showChevron onPress={() => {}} divider highlight={isHighlighted(targetPath, 'visibility enhancements', 'magnification', 'color correction')} />
          <SettingsRow title="Hearing enhancements" showChevron onPress={() => {}} divider highlight={isHighlighted(targetPath, 'hearing enhancements')} />
          <SettingsRow title="Interaction and dexterity" showChevron onPress={() => {}} highlight={isHighlighted(targetPath, 'interaction and dexterity')} />
        </div>

        {/* Advanced settings */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <SettingsRow title="Advanced settings" showChevron onPress={() => {}} divider highlight={isHighlighted(targetPath, 'advanced settings')} />
          <SettingsRow title="Installed apps" showChevron onPress={() => {}} highlight={isHighlighted(targetPath, 'installed apps')} />
        </div>
        
        {/* Shortcuts */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <SettingsRow title="Accessibility shortcut" toggle toggleValue={accessibilityShortcut} onToggleChange={setAccessibilityShortcut} highlight={isHighlighted(targetPath, 'accessibility shortcut')} />
        </div>

      </div>
    </div>
  );
}
