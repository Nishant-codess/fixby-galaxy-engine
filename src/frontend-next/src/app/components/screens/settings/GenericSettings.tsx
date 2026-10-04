import React from 'react';
import { SettingsRow } from '../../ui/SettingsRow';
import { Screen } from '../../../../hooks/usePhoneNavigation';
import { useSettings } from '../../../context/SettingsContext';
import { DeviceSettingKey } from '../../../../settings/definitions';

interface RowDef {
  title: string;
  subtitle?: string;
  toggle?: boolean;
  settingKey?: DeviceSettingKey;
  rightLabel?: string;
  isUnsupported?: boolean;
}

interface GroupDef {
  header?: string;
  rows: RowDef[];
}

export function GenericSettings({ screen, targetPath, onNavigate }: { screen: string; targetPath: string[]; onNavigate: (s: Screen) => void }) {
  const { settings, setSetting } = useSettings();

  const getGenericData = (): { title: string; groups: GroupDef[]; unsupportedNotice?: string } => {
    // 1. Notifications
    if (screen === 'settings/notifications' || screen === 'settings/generic/Notifications') {
      return {
        title: 'Notifications',
        groups: [
          {
            rows: [
              { title: 'App notifications', subtitle: 'Manage notifications for each app', toggle: true, settingKey: 'appNotifications' },
              { title: 'Lock screen notifications', subtitle: 'Show or hide alert content', toggle: true, settingKey: 'lockScreenNotifications' },
              { title: 'Notification pop-up style', rightLabel: 'Brief' }
            ]
          },
          {
            rows: [
              { title: 'Do not disturb', subtitle: 'Mute calls and alerts with exceptions', toggle: true, settingKey: 'doNotDisturb' },
              { title: 'App icon badges', subtitle: 'Show dot or count on app icon', toggle: true, settingKey: 'appIconBadges' }
            ]
          }
        ]
      };
    }

    // 2. Lock screen and AOD
    if (screen === 'settings/lock-screen' || screen === 'settings/generic/Lock screen and AOD') {
      return {
        title: 'Lock screen and AOD',
        groups: [{
          rows: [
            { title: 'Always On Display', subtitle: 'Show clock and notifications when screen is off', toggle: true, settingKey: 'alwaysOnDisplay' },
            { title: 'Screen lock type', rightLabel: 'PIN, Fingerprints' },
            { title: 'Clock style' },
            { title: 'Wallpapers' },
            { title: 'Secure lock settings' }
          ]
        }]
      };
    }

    // 3. Background usage limits
    if (screen === 'settings/generic/Background usage limits' || screen === 'settings/generic/Deep sleeping apps') {
      return {
        title: 'Background usage limits',
        groups: [
          {
            rows: [
              { title: 'Put unused apps to sleep', subtitle: 'Limit battery use for apps you do not use often', toggle: true, settingKey: 'batteryOptimized' }
            ]
          },
          {
            header: 'App sleep lists',
            rows: [
              { title: 'Sleeping apps', rightLabel: '12 apps' },
              { title: 'Deep sleeping apps', subtitle: 'Apps will never run in background', rightLabel: `${settings.deepSleepingAppsCount} apps` },
              { title: 'Never sleeping apps', rightLabel: '0 apps' }
            ]
          }
        ]
      };
    }

    // 4. General Management
    if (screen === 'settings/general' || screen === 'settings/generic/General management') {
      return {
        title: 'General management',
        groups: [{
          rows: [
            { title: 'Language', rightLabel: 'English (US)' },
            { title: 'Samsung Keyboard settings' },
            { title: 'Date and time', rightLabel: 'Auto' },
            { title: 'Reset' }
          ]
        }]
      };
    }

    // 5. Digital Wellbeing
    if (screen === 'settings/wellbeing' || screen === 'settings/generic/Digital Wellbeing') {
      return {
        title: 'Digital Wellbeing',
        groups: [{
          rows: [
            { title: 'Screen time', rightLabel: '4h 15m today' },
            { title: 'App timers' },
            { title: 'Focus mode' }
          ]
        }]
      };
    }

    // 6. Unknown / Unimplemented Leaf Screen Fallback
    const title = screen.startsWith('settings/generic/')
      ? decodeURIComponent(screen.replace('settings/generic/', ''))
      : 'Settings';

    return {
      title,
      unsupportedNotice: 'Not available in this demo environment',
      groups: [{
        header: 'One UI Configuration',
        rows: [
          { title: `${title} status`, rightLabel: 'Standard' },
          { title: 'Detailed options', isUnsupported: true }
        ]
      }]
    };
  };

  const data = getGenericData();
  const targetNode = targetPath[targetPath.length - 1];

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'var(--oneui-bg-primary)' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflowY: 'auto', overflowX: 'hidden', paddingBottom: '72px' }}>
        <div style={{ padding: '64px 16px 20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 300, color: 'var(--oneui-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            {data.title}
          </h1>
        </div>

        {data.unsupportedNotice && (
          <div style={{
            margin: '0 16px 20px', padding: '14px 18px', borderRadius: '16px',
            background: 'rgba(255, 149, 0, 0.1)', border: '1px solid rgba(255, 149, 0, 0.25)',
            color: '#ff9500', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <span>⚠️</span>
            <span>{data.unsupportedNotice}</span>
          </div>
        )}
        
        {data.groups.map((group, groupIdx) => (
          <div key={groupIdx} style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
            {group.header && (
              <div style={{ padding: '16px 16px 8px', fontSize: '13px', color: 'var(--oneui-accent)', fontWeight: 600 }}>
                {group.header}
              </div>
            )}
            {group.rows.map((row, i) => {
              const hasToggle = row.toggle && row.settingKey;
              const toggleVal = hasToggle ? Boolean(settings[row.settingKey!]) : false;

              return (
                <SettingsRow 
                  key={i}
                  title={row.title}
                  subtitle={row.subtitle}
                  rightLabel={row.rightLabel}
                  toggle={row.toggle}
                  toggleValue={hasToggle ? toggleVal : undefined}
                  onToggleChange={hasToggle ? (v) => setSetting(row.settingKey!, v as any) : undefined}
                  showChevron={!row.toggle}
                  onPress={!row.toggle && !row.isUnsupported ? () => onNavigate(`settings/generic/${row.title}` as Screen) : undefined}
                  divider={i < group.rows.length - 1}
                  highlight={targetNode?.toLowerCase() === row.title.toLowerCase()}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
