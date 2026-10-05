import React from 'react';
import { SettingsRow } from '../../ui/SettingsRow';
import { Screen } from '../../../../hooks/usePhoneNavigation';
import { useSettings } from '../../../context/SettingsContext';

function isHighlighted(targetPath: string[], ...keywords: string[]): boolean {
  const combined = targetPath.join(' ').toLowerCase();
  return keywords.some(kw => combined.includes(kw.toLowerCase()));
}

interface Props { targetPath: string[]; onNavigate: (s: Screen) => void; }

export function DeviceCareScreen({ targetPath, onNavigate }: Props) {
  const { settings, setSetting } = useSettings();

  const handleOptimizeNow = () => {
    setSetting('storageCleaned', true);
    setSetting('autoOptimization', true);
    setSetting('storageUsedGB', Math.max(40, settings.storageUsedGB - 4.8));
  };

  const togglePerformanceProfile = () => {
    setSetting('performanceProfile', settings.performanceProfile === 'Standard' ? 'Light' : 'Standard');
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'var(--oneui-bg-primary)' }}>
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingBottom: '72px' }}>
        <div style={{ padding: '64px 16px 20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 300, color: 'var(--oneui-text-primary)', margin: 0 }}>
            Device care
          </h1>
        </div>
        
        {/* Optimize Now widget */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 24px 24px', gap: '12px', position: 'relative' }}>
          <div style={{ fontSize: '72px' }}>😊</div>
          <div style={{ color: 'var(--oneui-success)', fontSize: '20px', fontWeight: 500 }}>
            {settings.storageCleaned ? 'Optimized! (100/100)' : 'Great (92/100)'}
          </div>
          <div style={{ position: 'relative' }}>
            <button 
              onClick={handleOptimizeNow}
              style={{
                background: settings.storageCleaned ? 'rgba(52, 199, 89, 0.2)' : 'var(--oneui-accent)', 
                color: settings.storageCleaned ? '#34c759' : '#fff', 
                border: 'none', borderRadius: '24px',
                padding: '12px 32px', fontSize: '15px', fontWeight: 600, marginTop: '8px', cursor: 'pointer',
                boxShadow: isHighlighted(targetPath, 'optimize now') ? '0 0 0 4px rgba(32,117,214,0.4)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {settings.storageCleaned ? 'Optimized' : 'Optimize now'}
            </button>
            {isHighlighted(targetPath, 'optimize now') && !settings.storageCleaned && (
              <div style={{
                position: 'absolute', right: '-20px', top: '-10px',
                background: 'linear-gradient(135deg, #2075d6, #6c47ff)',
                color: '#fff', fontSize: '10px', fontWeight: 700,
                padding: '3px 8px', borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(32,117,214,0.5)',
                animation: 'popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                whiteSpace: 'nowrap'
              }}>
                Tap here
              </div>
            )}
          </div>
        </div>

        {/* Group 1 */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <SettingsRow 
            title="Battery" 
            rightLabel={settings.powerSaving ? "Power saving active" : "12h 35m left"} 
            showChevron 
            onPress={() => onNavigate('settings/battery')} 
            divider 
            highlight={isHighlighted(targetPath, 'battery')} 
          />
          <SettingsRow 
            title="Storage" 
            rightLabel={`${settings.storageUsedGB.toFixed(1)} GB / ${settings.storageTotalGB} GB`} 
            showChevron 
            onPress={() => onNavigate('settings/storage')} 
            divider 
            highlight={isHighlighted(targetPath, 'storage')} 
          />
          <SettingsRow 
            title="Memory" 
            rightLabel={`${settings.ramPlusGB} GB RAM Plus`} 
            showChevron 
            onPress={() => onNavigate('settings/generic/Memory')} 
            divider 
            highlight={isHighlighted(targetPath, 'memory')} 
          />
          <SettingsRow title="App protection" rightLabel="No threats" showChevron onPress={() => {}} divider highlight={isHighlighted(targetPath, 'app protection')} />
          <SettingsRow
            title="Device temperature"
            rightLabel={`${settings.deviceTemperatureC}°C${settings.deviceTemperatureC >= 43 ? ' · High' : ''}`}
            highlight={isHighlighted(targetPath, 'temperature', 'thermal')}
          />
        </div>

        {/* Group 2 */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <SettingsRow 
            title="Auto optimization" 
            subtitle="Restarts device automatically when inactive to clear memory" 
            toggle 
            toggleValue={settings.autoOptimization} 
            onToggleChange={(v) => setSetting('autoOptimization', v)} 
            divider 
            highlight={isHighlighted(targetPath, 'auto optimization')} 
          />
          <SettingsRow 
            title="Performance profile" 
            subtitle={settings.performanceProfile === 'Light' ? 'Prioritizes battery life and cooling' : 'Maximum CPU processing speed'}
            rightLabel={settings.performanceProfile} 
            showChevron 
            onPress={togglePerformanceProfile} 
            highlight={isHighlighted(targetPath, 'performance profile')} 
          />
        </div>
      </div>
    </div>
  );
}
