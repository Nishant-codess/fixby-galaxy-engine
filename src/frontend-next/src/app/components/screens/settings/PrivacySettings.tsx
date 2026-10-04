import React from 'react';
import { SettingsRow } from '../../ui/SettingsRow';
import { Screen } from '../../../../hooks/usePhoneNavigation';
import { useSettings } from '../../../context/SettingsContext';

function isHighlighted(targetPath: string[], ...keywords: string[]): boolean {
  const combined = targetPath.join(' ').toLowerCase();
  return keywords.some(kw => combined.includes(kw.toLowerCase()));
}

interface Props { targetPath: string[]; onNavigate: (s: Screen) => void; }

export function PrivacySettings({ targetPath, onNavigate }: Props) {
  const { settings, setSetting } = useSettings();

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'var(--oneui-bg-primary)' }}>
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingBottom: '72px' }}>
        <div style={{ padding: '64px 16px 20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 300, color: 'var(--oneui-text-primary)', margin: 0 }}>
            Security and privacy
          </h1>
        </div>

        {/* Security Status */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <SettingsRow title="Lock screen" rightLabel="PIN, Fingerprints" showChevron onPress={() => onNavigate('settings/generic/Lock screen and AOD')} divider highlight={isHighlighted(targetPath, 'lock screen', 'screen lock type')} />
          <SettingsRow title="Biometrics" subtitle="Fingerprints, Face recognition" showChevron onPress={() => onNavigate('settings/generic/Biometrics')} divider highlight={isHighlighted(targetPath, 'biometrics', 'fingerprint')} />
          <SettingsRow title="App security" rightLabel="Play Protect active" showChevron onPress={() => {}} highlight={isHighlighted(targetPath, 'app security')} />
        </div>
        
        {/* Privacy Controls */}
        <div style={{ margin: '0 16px 24px' }}>
            <div style={{ fontSize: '14px', color: 'var(--oneui-accent)', fontWeight: 600, paddingLeft: '16px', marginBottom: '8px' }}>Privacy toggles</div>
            <div style={{ background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
                <SettingsRow 
                  title="Camera access" 
                  subtitle="Allow apps to use camera hardware"
                  toggle 
                  toggleValue={settings.cameraAccess} 
                  onToggleChange={(v) => setSetting('cameraAccess', v)} 
                  divider 
                  highlight={isHighlighted(targetPath, 'camera access')} 
                />
                <SettingsRow 
                  title="Microphone access" 
                  subtitle="Allow apps to use microphone hardware"
                  toggle 
                  toggleValue={settings.microphoneAccess} 
                  onToggleChange={(v) => setSetting('microphoneAccess', v)} 
                  divider 
                  highlight={isHighlighted(targetPath, 'microphone access')} 
                />
                <SettingsRow 
                  title="Location access" 
                  subtitle="Allow apps with permission to locate device"
                  toggle 
                  toggleValue={settings.locationAccess} 
                  onToggleChange={(v) => setSetting('locationAccess', v)} 
                  divider 
                  highlight={isHighlighted(targetPath, 'location')} 
                />
                <SettingsRow 
                  title="Send diagnostic data" 
                  subtitle="Send anonymous usage data to Samsung"
                  toggle 
                  toggleValue={settings.sendDiagnosticData} 
                  onToggleChange={(v) => setSetting('sendDiagnosticData', v)} 
                  highlight={isHighlighted(targetPath, 'send diagnostic data')} 
                />
            </div>
        </div>

      </div>
    </div>
  );
}
