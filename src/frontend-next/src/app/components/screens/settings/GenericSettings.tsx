import React from 'react';
import { SettingsRow } from '../../ui/SettingsRow';
import { Screen } from '../../../../hooks/usePhoneNavigation';

const GENERIC_DATA: Record<string, { title: string, rows: { title: string, toggle?: boolean, rightLabel?: string }[] }> = {
  'settings/notifications': {
    title: 'Notifications',
    rows: [
      { title: 'App notifications' },
      { title: 'Lock screen notifications', rightLabel: 'Show all' },
      { title: 'Do not disturb', toggle: true },
      { title: 'Advanced settings' }
    ]
  },
  'settings/lock-screen': {
    title: 'Lock screen and AOD',
    rows: [
      { title: 'Always On Display', toggle: true },
      { title: 'Clock style' },
      { title: 'Wallpapers' },
      { title: 'Screen lock type', rightLabel: 'PIN' },
      { title: 'Secure lock settings' }
    ]
  },
  'settings/security': {
    title: 'Security and privacy',
    rows: [
      { title: 'Security status' },
      { title: 'Google Play Protect', rightLabel: 'Protected' },
      { title: 'Biometrics' },
      { title: 'Permission manager' },
      { title: 'Send diagnostic data', toggle: true }
    ]
  },
  'settings/general': {
    title: 'General management',
    rows: [
      { title: 'Language', rightLabel: 'English (US)' },
      { title: 'Text-to-speech output' },
      { title: 'Date and time' },
      { title: 'Samsung Keyboard settings' },
      { title: 'Reset' }
    ]
  },
  'settings/about': {
    title: 'About phone',
    rows: [
      { title: 'Fixby Phone 5G' },
      { title: 'Status information' },
      { title: 'Legal information' },
      { title: 'Software information' }
    ]
  },
  'settings/wellbeing': {
    title: 'Digital Wellbeing',
    rows: [
      { title: 'Screen time' },
      { title: 'App timers' },
      { title: 'Focus mode' }
    ]
  },
  'settings/apps': {
    title: 'Apps',
    rows: [
      { title: 'Choose default apps' },
      { title: 'Samsung app settings' },
      { title: 'Chrome', rightLabel: '240 MB' },
      { title: 'Fixby', rightLabel: '120 MB' }
    ]
  },
  'settings/phone': {
    title: 'Phone settings',
    rows: [
      { title: 'Block numbers' },
      { title: 'Caller ID and spam protection' },
      { title: 'Voicemail' }
    ]
  }
};

export function GenericSettings({ screen, targetPath, onNavigate }: { screen: string; targetPath: string[]; onNavigate: (s: Screen) => void }) {
  const data = GENERIC_DATA[screen] || { title: 'Settings', rows: [{ title: 'Option 1' }, { title: 'Option 2' }] };
  const targetNode = targetPath[2];

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'var(--oneui-bg-primary)' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflowY: 'auto', overflowX: 'hidden', paddingBottom: '72px' }}>
        <div style={{ padding: '64px 16px 20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 300, color: 'var(--oneui-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>{data.title}</h1>
        </div>
        
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          {data.rows.map((row, i) => (
            <SettingsRow 
              key={i}
              title={row.title}
              rightLabel={row.rightLabel}
              toggle={row.toggle}
              toggleValue={row.toggle ? false : undefined}
              showChevron={!row.toggle}
              onPress={!row.toggle ? () => {} : undefined}
              divider={i < data.rows.length - 1}
              highlight={targetNode === row.title}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
