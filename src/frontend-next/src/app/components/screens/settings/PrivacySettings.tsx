import React, { useState } from 'react';
import { SettingsRow } from '../../ui/SettingsRow';
import { Screen } from '../../../../hooks/usePhoneNavigation';

function isHighlighted(targetPath: string[], ...keywords: string[]): boolean {
  const combined = targetPath.join(' ').toLowerCase();
  return keywords.some(kw => combined.includes(kw.toLowerCase()));
}

interface Props { targetPath: string[]; onNavigate: (s: Screen) => void; }

export function PrivacySettings({ targetPath, onNavigate }: Props) {
  const [sendDiagnosticData, setSendDiagnosticData] = useState(true);

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
          <SettingsRow title="Lock screen" rightLabel="PIN, Fingerprints" showChevron onPress={() => {}} divider highlight={isHighlighted(targetPath, 'lock screen', 'screen lock type')} />
          <SettingsRow title="Accounts" rightLabel="Samsung account, Google" showChevron onPress={() => {}} divider highlight={isHighlighted(targetPath, 'accounts')} />
          <SettingsRow title="Find My Mobile" rightLabel="On" showChevron onPress={() => {}} divider highlight={isHighlighted(targetPath, 'find my mobile')} />
          <SettingsRow title="App security" rightLabel="Play Protect" showChevron onPress={() => {}} highlight={isHighlighted(targetPath, 'app security')} />
        </div>

        {/* Biometrics */}
        <div style={{ margin: '0 16px 24px' }}>
            <div style={{ fontSize: '14px', color: 'var(--oneui-accent)', fontWeight: 600, paddingLeft: '16px', marginBottom: '8px' }}>Security</div>
            <div style={{ background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
                <SettingsRow title="Biometrics" subtitle="Fingerprints, Face recognition" showChevron onPress={() => {}} divider highlight={isHighlighted(targetPath, 'biometrics', 'fingerprint', 'face recognition')} />
                <SettingsRow title="Samsung Pass" showChevron onPress={() => {}} divider highlight={isHighlighted(targetPath, 'samsung pass')} />
                <SettingsRow title="Secure Folder" showChevron onPress={() => {}} highlight={isHighlighted(targetPath, 'secure folder')} />
            </div>
        </div>
        
        {/* Privacy */}
        <div style={{ margin: '0 16px 24px' }}>
            <div style={{ fontSize: '14px', color: 'var(--oneui-accent)', fontWeight: 600, paddingLeft: '16px', marginBottom: '8px' }}>Privacy</div>
            <div style={{ background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
                <SettingsRow title="Permission manager" showChevron onPress={() => {}} divider highlight={isHighlighted(targetPath, 'permission manager', 'permissions')} />
                <SettingsRow title="Controls and alerts" showChevron onPress={() => {}} divider highlight={isHighlighted(targetPath, 'controls and alerts')} />
                <SettingsRow title="Samsung Privacy" showChevron onPress={() => {}} divider highlight={isHighlighted(targetPath, 'samsung privacy')} />
                <SettingsRow title="Send diagnostic data" toggle toggleValue={sendDiagnosticData} onToggleChange={setSendDiagnosticData} highlight={isHighlighted(targetPath, 'send diagnostic data')} />
            </div>
        </div>

      </div>
    </div>
  );
}
