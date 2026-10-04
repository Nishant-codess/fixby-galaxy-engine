import React from 'react';
import { SettingsRow } from '../../ui/SettingsRow';
import { Screen } from '../../../../hooks/usePhoneNavigation';
import { useSettings } from '../../../context/SettingsContext';

export function Connections({ targetPath, onNavigate }: { targetPath: string[]; onNavigate: (s: Screen) => void }) {
  const { settings, setSetting } = useSettings();

  const isHighlighted = (node: string) => {
    return targetPath.some(p => p.toLowerCase().includes(node.toLowerCase()));
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'var(--oneui-bg-primary)' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflowY: 'auto', overflowX: 'hidden', paddingBottom: '72px' }}>
        <div style={{ padding: '64px 16px 20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 300, color: 'var(--oneui-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Connections</h1>
        </div>
        
        {/* Group 1 */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <SettingsRow 
            title="Wi-Fi" 
            subtitle={settings.wifi ? "Fixby-5G (Connected)" : "Turned off"}
            toggle 
            toggleValue={settings.wifi} 
            onToggleChange={(v) => setSetting('wifi', v)} 
            divider 
            highlight={isHighlighted('wi-fi') && !isHighlighted('intelligent')}
          />
          {/* Intelligent Wi-Fi row */}
          <div style={{ 
            background: isHighlighted('intelligent') ? 'rgba(32,117,214,0.1)' : 'transparent', 
            borderLeft: isHighlighted('intelligent') ? '3px solid var(--oneui-accent)' : 'none', 
            paddingLeft: isHighlighted('intelligent') ? '8px' : '0' 
          }}>
            <SettingsRow 
              title="Intelligent Wi-Fi" 
              subtitle="Switch to mobile data when Wi-Fi is unstable" 
              toggle 
              toggleValue={settings.intelligentWifi} 
              onToggleChange={(v) => setSetting('intelligentWifi', v)}
              divider 
              highlight={isHighlighted('intelligent')}
            />
          </div>
          <SettingsRow 
            title="Wi-Fi calling" 
            subtitle="SIM 1" 
            toggle 
            toggleValue={settings.wifiCalling} 
            onToggleChange={(v) => setSetting('wifiCalling', v)}
            divider 
          />
          <SettingsRow 
            title="Bluetooth" 
            subtitle={settings.bluetooth ? "On (Galaxy Buds Pro)" : "Off"} 
            toggle 
            toggleValue={settings.bluetooth} 
            onToggleChange={(v) => setSetting('bluetooth', v)} 
            divider 
            highlight={isHighlighted('bluetooth')} 
          />
          <SettingsRow 
            title="NFC and contactless payments" 
            subtitle={settings.nfc ? "On (Samsung Wallet ready)" : "Off"}
            toggle 
            toggleValue={settings.nfc} 
            onToggleChange={(v) => setSetting('nfc', v)} 
            highlight={isHighlighted('nfc')} 
          />
        </div>

        {/* Group 2 */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <SettingsRow 
            title="Flight mode" 
            subtitle="Turn off calls, messages, and mobile data"
            toggle 
            toggleValue={settings.flightMode} 
            onToggleChange={(v) => setSetting('flightMode', v)} 
            divider 
            highlight={isHighlighted('flight')} 
          />
          <SettingsRow 
            title="Mobile networks" 
            subtitle={settings.mobileData ? "5G / LTE Auto" : "Disabled"}
            toggle
            toggleValue={settings.mobileData}
            onToggleChange={(v) => setSetting('mobileData', v)}
            divider 
            highlight={isHighlighted('mobile network') || isHighlighted('mobile data')}
          />
          <SettingsRow 
            title="Mobile Hotspot and Tethering" 
            subtitle={settings.hotspot ? "Sharing Fixby-AP" : "Off"}
            toggle
            toggleValue={settings.hotspot}
            onToggleChange={(v) => setSetting('hotspot', v)}
            divider 
            highlight={isHighlighted('hotspot')} 
          />
          <SettingsRow 
            title="Data usage" 
            rightLabel="2.4 GB / 25 GB used" 
            showChevron 
            onPress={() => onNavigate('settings/generic/Data usage')} 
          />
        </div>

      </div>
    </div>
  );
}
