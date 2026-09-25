import React from 'react';
import { SettingsRow } from '../../ui/SettingsRow';
import { Screen } from '../../../../hooks/usePhoneNavigation';

function isHighlighted(targetPath: string[], ...keywords: string[]): boolean {
  const combined = targetPath.join(' ').toLowerCase();
  return keywords.some(kw => combined.includes(kw.toLowerCase()));
}

interface Props { targetPath: string[]; onNavigate: (s: Screen) => void; }

export function GeneralSettings({ targetPath }: Props) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'var(--oneui-bg-primary)' }}>
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingBottom: '72px' }}>
        <div style={{ padding: '64px 16px 20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 300, color: 'var(--oneui-text-primary)', margin: 0 }}>
            General management
          </h1>
        </div>

        {/* Settings Group 1 */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <SettingsRow title="Language" rightLabel="English (US)" showChevron onPress={() => {}} divider highlight={isHighlighted(targetPath, 'language')} />
          <SettingsRow title="Text-to-speech output" showChevron onPress={() => {}} divider highlight={isHighlighted(targetPath, 'text-to-speech output')} />
          <SettingsRow title="Date and time" showChevron onPress={() => {}} divider highlight={isHighlighted(targetPath, 'date and time')} />
          <SettingsRow title="Samsung Keyboard settings" showChevron onPress={() => {}} divider highlight={isHighlighted(targetPath, 'samsung keyboard settings', 'keyboard')} />
          <SettingsRow title="Keyboard list and default" showChevron onPress={() => {}} divider highlight={isHighlighted(targetPath, 'keyboard list')} />
          <SettingsRow title="Physical keyboard" showChevron onPress={() => {}} highlight={isHighlighted(targetPath, 'physical keyboard')} />
        </div>

        {/* Settings Group 2 */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <SettingsRow title="Mouse and trackpad" showChevron onPress={() => {}} divider highlight={isHighlighted(targetPath, 'mouse and trackpad')} />
          <SettingsRow title="Passwords and autofill" showChevron onPress={() => {}} highlight={isHighlighted(targetPath, 'passwords and autofill')} />
        </div>

        {/* Settings Group 3 */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <SettingsRow title="Customization Service" showChevron onPress={() => {}} divider highlight={isHighlighted(targetPath, 'customization service')} />
          <SettingsRow title="Reset" showChevron onPress={() => {}} divider highlight={isHighlighted(targetPath, 'reset', 'factory', 'network settings', 'all settings')} />
          <SettingsRow title="Contact us" showChevron onPress={() => {}} highlight={isHighlighted(targetPath, 'contact us')} />
        </div>
      </div>
    </div>
  );
}
