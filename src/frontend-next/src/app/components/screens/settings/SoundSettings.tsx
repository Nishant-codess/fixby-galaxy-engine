import React from 'react';
import { SettingsRow } from '../../ui/SettingsRow';
import { OneUISlider } from '../../ui/OneUISlider';
import { Screen } from '../../../../hooks/usePhoneNavigation';
import { useSettings } from '../../../context/SettingsContext';

function isHighlighted(targetPath: string[], ...keywords: string[]): boolean {
  const combined = targetPath.join(' ').toLowerCase();
  return keywords.some(kw => combined.includes(kw.toLowerCase()));
}

interface Props { targetPath: string[]; onNavigate: (s: Screen) => void; }

export function SoundSettings({ targetPath, onNavigate }: Props) {
  const { settings, setSetting } = useSettings();

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'var(--oneui-bg-primary)' }}>
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingBottom: '72px' }}>
        <div style={{ padding: '64px 16px 20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 300, color: 'var(--oneui-text-primary)', margin: 0 }}>
            Sounds and vibration
          </h1>
        </div>

        {/* Volume group with slider */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <div style={{ padding: '16px' }}>
            <div style={{ fontSize: '16px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Media Volume</span>
              <span style={{ fontSize: '14px', color: 'var(--oneui-text-secondary)' }}>{settings.mediaVolume}%</span>
            </div>
            <OneUISlider value={settings.mediaVolume} onChange={(v) => setSetting('mediaVolume', v)} />
          </div>
        </div>

        {/* Settings rows */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <SettingsRow 
            title="Sound mode" 
            rightLabel={settings.soundMode.toUpperCase()} 
            showChevron 
            onPress={() => {
              const nextMode = settings.soundMode === 'sound' ? 'vibrate' : settings.soundMode === 'vibrate' ? 'mute' : 'sound';
              setSetting('soundMode', nextMode);
            }} 
            divider 
            highlight={isHighlighted(targetPath, 'sound mode')} 
          />
          <SettingsRow 
            title="Vibrate while ringing" 
            toggle 
            toggleValue={settings.vibrateWhileRinging} 
            onToggleChange={(v) => setSetting('vibrateWhileRinging', v)} 
            divider 
            highlight={isHighlighted(targetPath, 'vibrate while ringing')} 
          />
          <SettingsRow title="Ringtone" rightLabel="Over the Horizon" showChevron onPress={() => onNavigate('settings/generic/Ringtone')} divider 
            highlight={isHighlighted(targetPath, 'ringtone')} />
          <SettingsRow title="Notification sound" rightLabel="Spaceline" showChevron onPress={() => onNavigate('settings/generic/Notification sound')} divider 
            highlight={isHighlighted(targetPath, 'notification sound')} />
        </div>
        
        {/* Settings group 2: Effects */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <SettingsRow 
            title="Dolby Atmos" 
            subtitle="Rich spatial surround audio"
            toggle 
            toggleValue={settings.dolbyAtmos} 
            onToggleChange={(v) => setSetting('dolbyAtmos', v)} 
            divider 
            highlight={isHighlighted(targetPath, 'dolby')} 
          />
          <SettingsRow 
            title="Separate app sound" 
            subtitle="Play media from YouTube through Bluetooth speakers"
            toggle 
            toggleValue={false} 
            onToggleChange={() => {}} 
            highlight={isHighlighted(targetPath, 'separate app sound')} 
          />
        </div>
      </div>
    </div>
  );
}
