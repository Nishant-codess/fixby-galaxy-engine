import React from 'react';
import { SettingsRow } from '../../ui/SettingsRow';
import { Screen } from '../../../../hooks/usePhoneNavigation';
import { useSettings } from '../../../context/SettingsContext';

export function BatteryScreen({ targetPath, onNavigate }: { targetPath: string[]; onNavigate: (s: Screen) => void }) {
  const { settings, setSetting } = useSettings();

  const isHighlighted = (node: string) => {
    return targetPath.some(p => p.toLowerCase().includes(node.toLowerCase()));
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'var(--oneui-bg-primary)' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflowY: 'auto', overflowX: 'hidden', paddingBottom: '72px' }}>
        <div style={{ padding: '64px 16px 20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 300, color: 'var(--oneui-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Battery and device care</h1>
        </div>
        
        {/* Battery Gauge Mockup */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 24px 24px', gap: '12px' }}>
          <div style={{ position: 'relative', width: '120px', height: '120px' }}>
            <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="40" stroke="var(--oneui-separator)" strokeWidth="8" fill="none" />
              <circle 
                cx="50" cy="50" r="40" 
                stroke={settings.powerSaving ? '#ff9500' : '#34c759'} 
                strokeWidth="8" fill="none" 
                strokeDasharray="251.2" 
                strokeDashoffset={251.2 * (1 - settings.batteryPercentage / 100)} 
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 300, color: 'var(--oneui-text-primary)' }}>{settings.batteryPercentage}%</div>
            </div>
          </div>
          <div style={{ color: settings.powerSaving ? 'var(--oneui-accent)' : 'var(--oneui-success)', fontWeight: 500, fontSize: '14px' }}>
            {settings.powerSaving ? '18 h 45 m left (Power saving active)' : '12 h 35 m left'}
          </div>
        </div>

        {/* Group 1 */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <SettingsRow 
            title="Battery usage" 
            subtitle="View app battery drain and activity"
            showChevron 
            onPress={() => onNavigate('settings/battery-usage')} 
            divider 
            highlight={isHighlighted('battery usage')} 
          />
          <SettingsRow 
            title="Power saving" 
            subtitle={settings.powerSaving ? 'Limits CPU to 70% and background network' : 'Off'}
            toggle 
            toggleValue={settings.powerSaving} 
            onToggleChange={(v) => setSetting('powerSaving', v)} 
            divider 
            highlight={isHighlighted('power saving')} 
          />
          <SettingsRow 
            title="Background usage limits" 
            subtitle={`${settings.deepSleepingAppsCount} apps in deep sleep`}
            showChevron 
            onPress={() => onNavigate('settings/battery-usage')} 
            divider 
            highlight={isHighlighted('background usage limits') || isHighlighted('deep sleep')} 
          />
          <SettingsRow 
            title="Protect battery" 
            subtitle={settings.protectBattery ? 'Charge capped at 85% to preserve lifespan' : 'Off'}
            toggle 
            toggleValue={settings.protectBattery} 
            onToggleChange={(v) => setSetting('protectBattery', v)} 
            divider
            highlight={isHighlighted('protect battery')} 
          />
          <SettingsRow 
            title="Wireless power sharing" 
            subtitle={settings.wirelessPowerSharing ? 'Ready to charge accessories on back' : 'Off'}
            toggle 
            toggleValue={settings.wirelessPowerSharing} 
            onToggleChange={(v) => setSetting('wirelessPowerSharing', v)} 
            highlight={isHighlighted('wireless power sharing')} 
          />
        </div>

        {/* Group 2 */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <SettingsRow 
            title="Storage" 
            rightLabel={`${settings.storageUsedGB.toFixed(1)} GB / ${settings.storageTotalGB} GB`} 
            showChevron 
            onPress={() => onNavigate('settings/storage')} 
            divider 
            highlight={isHighlighted('storage')} 
          />
          <SettingsRow 
            title="Memory" 
            rightLabel={`${settings.ramPlusGB} GB RAM Plus`} 
            showChevron 
            onPress={() => onNavigate('settings/device-care')} 
            divider 
            highlight={isHighlighted('memory')} 
          />
          <SettingsRow 
            title="Performance profile" 
            rightLabel={settings.performanceProfile} 
            showChevron 
            onPress={() => onNavigate('settings/device-care')} 
            highlight={isHighlighted('performance profile')} 
          />
        </div>

      </div>
    </div>
  );
}
