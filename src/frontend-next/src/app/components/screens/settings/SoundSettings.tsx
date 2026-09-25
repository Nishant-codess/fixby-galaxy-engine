import React, { useState } from 'react';
import { SettingsRow } from '../../ui/SettingsRow';
import { OneUISlider } from '../../ui/OneUISlider';
import { Screen } from '../../../../hooks/usePhoneNavigation';

function isHighlighted(targetPath: string[], ...keywords: string[]): boolean {
  const combined = targetPath.join(' ').toLowerCase();
  return keywords.some(kw => combined.includes(kw.toLowerCase()));
}

interface Props { targetPath: string[]; onNavigate: (s: Screen) => void; }

export function SoundSettings({ targetPath, onNavigate }: Props) {
  const [dolby, setDolby] = useState(true);
  const [volume, setVolume] = useState(70);
  const [vibrationIntensity, setVibrationIntensity] = useState(50);
  const [separateAppSound, setSeparateAppSound] = useState(false);

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
            <div style={{ fontSize: '16px', marginBottom: '12px' }}>Volume</div>
            <OneUISlider value={volume} onChange={setVolume} />
          </div>
        </div>

        {/* Settings rows */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <SettingsRow title="Sound mode" rightLabel="Sound" showChevron onPress={() => {}} divider 
            highlight={isHighlighted(targetPath, 'sound mode')} />
          <SettingsRow title="Ringtone" rightLabel="Over the Horizon" showChevron onPress={() => {}} divider 
            highlight={isHighlighted(targetPath, 'ringtone')} />
          <SettingsRow title="Notification sound" rightLabel="Spaceline" showChevron onPress={() => {}} divider 
            highlight={isHighlighted(targetPath, 'notification sound')} />
          <SettingsRow title="System sound" rightLabel="Galaxy" showChevron onPress={() => {}} divider 
            highlight={isHighlighted(targetPath, 'system sound')} />
          <SettingsRow title="Volume" showChevron onPress={() => {}} divider 
            highlight={isHighlighted(targetPath, 'volume')} />
          <SettingsRow title="Call vibration pattern" rightLabel="Basic call" showChevron onPress={() => {}} divider 
            highlight={isHighlighted(targetPath, 'call vibration pattern')} />
          <SettingsRow title="Notification vibration pattern" rightLabel="Sync with notification sound" showChevron onPress={() => {}} divider 
            highlight={isHighlighted(targetPath, 'notification vibration pattern')} />
          <SettingsRow title="System vibration" showChevron onPress={() => {}} divider 
            highlight={isHighlighted(targetPath, 'system vibration')} />
          <SettingsRow title="Vibration intensity" showChevron onPress={() => {}} divider 
            highlight={isHighlighted(targetPath, 'vibration intensity')} /></div>
        
        {/* Settings group 2 */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <SettingsRow title="Sound quality and effects" showChevron onPress={() => {}} divider 
            highlight={isHighlighted(targetPath, 'sound quality')} />
          <SettingsRow title="Dolby Atmos" toggle toggleValue={dolby} onToggleChange={setDolby} divider
            highlight={isHighlighted(targetPath, 'dolby atmos')} />
          <SettingsRow title="Separate app sound" toggle toggleValue={separateAppSound} onToggleChange={setSeparateAppSound}
            highlight={isHighlighted(targetPath, 'separate app sound')} />
        </div>
      </div>
    </div>
  );
}
