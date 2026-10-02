import React from 'react';
import { SettingsRow } from '../../ui/SettingsRow';
import { Screen } from '../../../../hooks/usePhoneNavigation';

type RowDef = { title: string, toggle?: boolean, rightLabel?: string };
type GroupDef = { header?: string, rows: RowDef[] };

const GENERIC_DATA: Record<string, { title: string, groups: GroupDef[] }> = {
  'settings/notifications': {
    title: 'Notifications',
    groups: [
      {
        rows: [
          { title: 'App notifications' },
          { title: 'Lock screen notifications', rightLabel: 'Show content' },
          { title: 'Notification pop-up style', rightLabel: 'Brief' }
        ]
      },
      {
        header: 'Brief pop-up settings',
        rows: [
          { title: 'Edge lighting style' },
          { title: 'Color by keyword' }
        ]
      },
      {
        rows: [
          { title: 'Do not disturb', toggle: true }
        ]
      },
      {
        rows: [
          { title: 'Advanced settings' },
          { title: 'App icon badges', toggle: true }
        ]
      }
    ]
  },
  'settings/lock-screen': {
    title: 'Lock screen and AOD',
    groups: [{
      rows: [
        { title: 'Always On Display', toggle: true },
        { title: 'Clock style' },
        { title: 'Wallpapers' },
        { title: 'Screen lock type', rightLabel: 'PIN' },
        { title: 'Secure lock settings' }
      ]
    }]
  },
  'settings/security': {
    title: 'Security and privacy',
    groups: [{
      rows: [
        { title: 'Security status' },
        { title: 'Google Play Protect', rightLabel: 'Protected' },
        { title: 'Biometrics' },
        { title: 'Permission manager' },
        { title: 'Send diagnostic data', toggle: true }
      ]
    }]
  },
  'settings/general': {
    title: 'General management',
    groups: [{
      rows: [
        { title: 'Language', rightLabel: 'English (US)' },
        { title: 'Text-to-speech output' },
        { title: 'Date and time' },
        { title: 'Samsung Keyboard settings' },
        { title: 'Reset' }
      ]
    }]
  },
  'settings/about': {
    title: 'About phone',
    groups: [{
      rows: [
        { title: 'Fixby Phone 5G' },
        { title: 'Status information' },
        { title: 'Legal information' },
        { title: 'Software information' }
      ]
    }]
  },
  'settings/wellbeing': {
    title: 'Digital Wellbeing',
    groups: [{
      rows: [
        { title: 'Screen time' },
        { title: 'App timers' },
        { title: 'Focus mode' }
      ]
    }]
  },
  'settings/apps': {
    title: 'Apps',
    groups: [{
      rows: [
        { title: 'Choose default apps' },
        { title: 'Samsung app settings' },
        { title: 'Camera', rightLabel: '412 MB' },
        { title: 'Chrome', rightLabel: '240 MB' },
        { title: 'Fixby', rightLabel: '120 MB' }
      ]
    }]
  },
  'settings/phone': {
    title: 'Phone settings',
    groups: [{
      rows: [
        { title: 'Block numbers' },
        { title: 'Caller ID and spam protection' },
        { title: 'Voicemail' }
      ]
    }]
  },
  'settings/generic/Battery usage': {
    title: 'Battery usage',
    groups: [
      {
        header: 'Usage since last full charge',
        rows: [
          { title: 'Screen on time', rightLabel: '4 h 12 m' },
          { title: 'Screen off time', rightLabel: '8 h 45 m' }
        ]
      },
      {
        header: 'App usage',
        rows: [
          { title: 'YouTube', rightLabel: '14%' },
          { title: 'Chrome', rightLabel: '9%' },
          { title: 'Instagram', rightLabel: '7%' },
          { title: 'Maps', rightLabel: '4%' }
        ]
      }
    ]
  },
  'settings/generic/Background usage limits': {
    title: 'Background usage limits',
    groups: [
      {
        rows: [
          { title: 'Put unused apps to sleep', toggle: true }
        ]
      },
      {
        rows: [
          { title: 'Sleeping apps', rightLabel: '12 apps' },
          { title: 'Deep sleeping apps', rightLabel: '4 apps' },
          { title: 'Never sleeping apps', rightLabel: '0 apps' }
        ]
      }
    ]
  }
};

export function GenericSettings({ screen, targetPath, onNavigate }: { screen: string; targetPath: string[]; onNavigate: (s: Screen) => void }) {
  let data = GENERIC_DATA[screen];
  
  if (!data && screen.startsWith('settings/generic/')) {
    const title = decodeURIComponent(screen.replace('settings/generic/', ''));
    data = {
      title,
      groups: [{
        rows: [
          { title: `${title} details` },
          { title: 'Advanced options', rightLabel: 'Off' },
          { title: 'Sync with cloud', toggle: true }
        ]
      }]
    };
  } else if (!data) {
    data = { title: 'Settings', groups: [{ rows: [{ title: 'Option 1' }, { title: 'Option 2' }] }] };
  }
  
  const targetNode = targetPath[2];

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'var(--oneui-bg-primary)' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflowY: 'auto', overflowX: 'hidden', paddingBottom: '72px' }}>
        <div style={{ padding: '64px 16px 20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 300, color: 'var(--oneui-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>{data.title}</h1>
        </div>
        
        {data.groups.map((group, groupIdx) => (
          <div key={groupIdx} style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
            {group.header && (
              <div style={{ padding: '16px 16px 8px', fontSize: '13px', color: 'var(--oneui-text-secondary)', fontWeight: 500 }}>
                {group.header}
              </div>
            )}
            {group.rows.map((row, i) => (
              <SettingsRow 
                key={i}
                title={row.title}
                rightLabel={row.rightLabel}
                toggle={row.toggle}
                toggleValue={row.toggle ? false : undefined}
                showChevron={!row.toggle}
                onPress={!row.toggle ? () => onNavigate(`settings/generic/${row.title}`) : undefined}
                divider={i < group.rows.length - 1}
                highlight={targetNode === row.title}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
