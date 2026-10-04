import React from 'react';
import { SettingsRow } from '../../ui/SettingsRow';
import { OneUISlider } from '../../ui/OneUISlider';
import { Screen } from '../../../../hooks/usePhoneNavigation';
import { ISun } from '../../ui/Icons';
import { Ripple } from '../../ui/Ripple';
import { useSettings } from '../../../context/SettingsContext';

export function DisplaySettings({ targetPath, onNavigate }: { targetPath: string[]; onNavigate: (s: Screen) => void }) {
  const { settings, setSetting } = useSettings();

  const isHighlighted = (node: string) => {
    return targetPath.some(p => p.toLowerCase().includes(node.toLowerCase()));
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'var(--oneui-bg-primary)' }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        overflowY: 'auto', overflowX: 'hidden', paddingBottom: '72px'
      }}>
        <div style={{ padding: '64px 16px 20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 300, color: 'var(--oneui-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Display</h1>
        </div>
        
        {/* Light / Dark Mode selector */}
        <div style={{ margin: '0 16px 24px', display: 'flex', gap: '16px' }}>
          <Ripple 
            onClick={() => setSetting('darkMode', false)} 
            style={{ 
              flex: 1, height: '120px', borderRadius: '16px', 
              background: !settings.darkMode ? 'rgba(255,255,255,0.95)' : 'var(--oneui-bg-card)', 
              border: !settings.darkMode ? '2px solid var(--oneui-accent)' : '2px solid transparent', 
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' 
            }}
          >
            <div style={{ color: !settings.darkMode ? '#000' : 'var(--oneui-text-secondary)', fontWeight: 600 }}>Light</div>
          </Ripple>
          <Ripple 
            onClick={() => setSetting('darkMode', true)} 
            style={{ 
              flex: 1, height: '120px', borderRadius: '16px', 
              background: 'var(--oneui-bg-card)', 
              border: settings.darkMode ? '2px solid var(--oneui-accent)' : '2px solid transparent', 
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' 
            }}
          >
            <div style={{ color: settings.darkMode ? '#fff' : 'var(--oneui-text-secondary)', fontWeight: 600 }}>Dark</div>
          </Ripple>
        </div>

        {/* Settings Group 1 */}
        <div style={{ 
          margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden', 
          border: isHighlighted('brightness') ? '2px solid var(--oneui-accent)' : 'none' 
        }}>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '16px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Brightness</span>
              <span style={{ fontSize: '14px', color: 'var(--oneui-text-secondary)' }}>{settings.brightness}%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: 'var(--oneui-text-tertiary)', display: 'inline-flex', alignItems: 'center' }}><ISun /></span>
              <OneUISlider value={settings.brightness} onChange={(v) => setSetting('brightness', v)} />
              <span style={{ color: 'var(--oneui-text-tertiary)', display: 'inline-flex', alignItems: 'center' }}><ISun /></span>
            </div>
          </div>
          <SettingsRow 
            title="Adaptive brightness" 
            subtitle="Automatically optimizes brightness for ambient light"
            toggle 
            toggleValue={settings.autoBrightness} 
            onToggleChange={(v) => setSetting('autoBrightness', v)} 
            divider 
            highlight={isHighlighted('adaptive brightness')} 
          />
          <SettingsRow 
            title="Extra brightness" 
            subtitle="Increases maximum luminance under direct sunlight"
            toggle 
            toggleValue={settings.extraBrightness} 
            onToggleChange={(v) => setSetting('extraBrightness', v)} 
            highlight={isHighlighted('extra brightness')} 
          />
        </div>

        {/* Settings Group 2 */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <SettingsRow 
            title="Motion smoothness" 
            rightLabel={settings.motionSmoothness === 'Adaptive' ? 'Adaptive (120 Hz)' : 'Standard (60 Hz)'} 
            showChevron 
            onPress={() => onNavigate('settings/display/motion-smoothness')} 
            divider 
            highlight={isHighlighted('motion') || isHighlighted('smoothness') || isHighlighted('120')} 
          />
          <SettingsRow 
            title="Eye comfort shield" 
            subtitle="Keeps eyes comfortable by limiting blue light"
            toggle 
            toggleValue={settings.eyeComfortShield} 
            onToggleChange={(v) => setSetting('eyeComfortShield', v)} 
            divider 
            highlight={isHighlighted('eye comfort')} 
          />
          <SettingsRow 
            title="Screen timeout" 
            rightLabel={`${settings.screenTimeout} seconds`} 
            showChevron 
            onPress={() => onNavigate('settings/generic/Screen timeout')} 
            divider 
            highlight={isHighlighted('screen timeout')} 
          />
          <SettingsRow 
            title="Accidental touch protection" 
            subtitle="Protects phone from touches in pockets"
            toggle 
            toggleValue={settings.accidentalTouchProtection} 
            onToggleChange={(v) => setSetting('accidentalTouchProtection', v)} 
            divider 
            highlight={isHighlighted('accidental touch')} 
          />
          <SettingsRow 
            title="Easy mode" 
            subtitle="Simple home screen and larger icons"
            toggle 
            toggleValue={settings.easyMode} 
            onToggleChange={(v) => setSetting('easyMode', v)} 
            highlight={isHighlighted('easy mode')} 
          />
        </div>

      </div>
    </div>
  );
}
