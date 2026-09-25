import React, { useState } from 'react';
import { SettingsRow } from '../../ui/SettingsRow';
import { Screen } from '../../../../hooks/usePhoneNavigation';

export function Connections({ targetPath, onNavigate }: { targetPath: string[]; onNavigate: (s: Screen) => void }) {
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(true);
  const [nfc, setNfc] = useState(true);
  const [flight, setFlight] = useState(false);

  const targetNode = targetPath[2];

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'var(--oneui-bg-primary)' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflowY: 'auto', overflowX: 'hidden', paddingBottom: '72px' }}>
        <div style={{ padding: '64px 16px 20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 300, color: 'var(--oneui-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Connections</h1>
        </div>
        
        {/* Group 1 */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <SettingsRow 
            title="Wi-Fi" subtitle={wifi ? "Fixby-5G" : undefined} rightLabel={wifi ? "" : "Off"} 
            toggle toggleValue={wifi} onToggleChange={setWifi} divider 
            highlight={targetNode?.toLowerCase() === 'wi-fi' && !targetPath[3]}
          />
          {targetNode?.toLowerCase() === 'wi-fi' && (
            <div style={{ background: 'rgba(32,117,214,0.05)', borderLeft: '3px solid var(--oneui-accent)', paddingLeft: '8px' }}>
              <SettingsRow 
                title="Intelligent Wi-Fi" 
                subtitle="Switch to mobile data when Wi-Fi is unstable" 
                toggle toggleValue={true} divider 
                highlight={targetPath[3]?.toLowerCase().includes('intelligent')}
              />
            </div>
          )}
          <SettingsRow title="Wi-Fi calling" rightLabel="SIM 1" toggle toggleValue={true} divider />
          <SettingsRow title="Bluetooth" rightLabel={bluetooth ? "On" : "Off"} toggle toggleValue={bluetooth} onToggleChange={setBluetooth} divider highlight={targetNode?.toLowerCase() === 'bluetooth'} />
          <SettingsRow title="NFC and contactless payments" toggle toggleValue={nfc} onToggleChange={setNfc} highlight={targetNode?.toLowerCase().includes('nfc')} />
        </div>

        {/* Group 2 */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <SettingsRow title="Flight mode" toggle toggleValue={flight} onToggleChange={setFlight} divider highlight={targetNode?.toLowerCase().includes('flight')} />
          <SettingsRow title="Mobile networks" showChevron onPress={() => {}} divider />
          <SettingsRow title="Data usage" rightLabel="2.4 GB used" showChevron onPress={() => {}} divider />
          <SettingsRow title="SIM manager" showChevron onPress={() => {}} />
        </div>

        {/* Group 3 */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <SettingsRow title="Mobile Hotspot and Tethering" showChevron onPress={() => {}} divider highlight={targetNode?.toLowerCase().includes('hotspot')} />
          <SettingsRow title="More connection settings" showChevron onPress={() => {}} highlight={targetNode?.toLowerCase().includes('more')} />
        </div>

      </div>
    </div>
  );
}
