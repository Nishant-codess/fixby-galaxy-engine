import React, { useState } from 'react';
import { SettingsRow } from '../../ui/SettingsRow';
import { OneUISlider } from '../../ui/OneUISlider';
import { Screen } from '../../../../hooks/usePhoneNavigation';
import { IChevron, ISun } from '../../ui/Icons';
import { Ripple } from '../../ui/Ripple';
import { useSettings } from '../../../context/SettingsContext';

export function DisplaySettings({ targetPath, onNavigate }: { targetPath: string[]; onNavigate: (s: Screen) => void }) {
  const { darkMode, setDarkMode, brightness, setBrightness, motionSmoothness, extraBrightness, setExtraBrightness, easyMode, setEasyMode } = useSettings();
  const [adaptive, setAdaptive] = useState(true);
  const [eyeComfort, setEyeComfort] = useState(false);
  const [touchSensitivity, setTouchSensitivity] = useState(false);

  const targetNode = targetPath[2]; // e.g. ["Settings", "Display", "Brightness"]

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'var(--oneui-bg-primary)' }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        overflowY: 'auto', overflowX: 'hidden', paddingBottom: '72px'
      }}>
      <div style={{ padding: '64px 16px 20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 300, color: 'var(--oneui-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Display</h1>
        </div>
        
        {/* Light / Dark Mode selector mock */}
        <div style={{ margin: '0 16px 24px', display: 'flex', gap: '16px' }}>
          <Ripple onClick={() => setDarkMode(false)} style={{ flex: 1, height: '120px', borderRadius: '16px', background: !darkMode ? 'rgba(255,255,255,0.9)' : 'var(--oneui-bg-card)', border: !darkMode ? '2px solid var(--oneui-accent)' : '2px solid transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
             <div style={{ color: !darkMode ? '#000' : 'var(--oneui-text-secondary)' }}>Light</div>
          </Ripple>
          <Ripple onClick={() => setDarkMode(true)} style={{ flex: 1, height: '120px', borderRadius: '16px', background: 'var(--oneui-bg-card)', border: darkMode ? '2px solid var(--oneui-accent)' : '2px solid transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
             <div style={{ color: darkMode ? '#fff' : 'var(--oneui-text-secondary)' }}>Dark</div>
          </Ripple>
        </div>

        {/* Settings Group 1 */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden', border: targetNode?.toLowerCase() === 'brightness' ? '2px solid var(--oneui-accent)' : 'none' }}>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '16px' }}>Brightness</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: 'var(--oneui-text-tertiary)', display: 'inline-flex', alignItems: 'center' }}><ISun /></span>
              <OneUISlider value={brightness} onChange={setBrightness} />
              <span style={{ color: 'var(--oneui-text-tertiary)', display: 'inline-flex', alignItems: 'center' }}><ISun /></span>
            </div>
          </div>
          <SettingsRow title="Adaptive brightness" toggle toggleValue={adaptive} onToggleChange={setAdaptive} divider />
          <SettingsRow title="Extra brightness" toggle toggleValue={extraBrightness} onToggleChange={setExtraBrightness} />
        </div>

        {/* Settings Group 2 */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <SettingsRow 
            title="Motion smoothness" 
            rightLabel={motionSmoothness} 
            showChevron 
            onPress={() => onNavigate('settings/motion-smoothness')} 
            divider 
            highlight={targetNode?.toLowerCase().includes('motion') || targetNode?.toLowerCase().includes('smoothness') || targetNode?.toLowerCase().includes('120')} 
          />
          <SettingsRow title="Eye comfort shield" toggle toggleValue={eyeComfort} onToggleChange={setEyeComfort} divider highlight={targetNode?.toLowerCase() === 'eye comfort shield'} />
          <SettingsRow title="Screen mode" rightLabel="Vivid" showChevron onPress={() => onNavigate('settings/generic/Screen mode')} divider highlight={targetNode?.toLowerCase() === 'screen mode'} />
          <SettingsRow title="Font size and style" showChevron onPress={() => onNavigate('settings/generic/Font size and style')} divider />
          <SettingsRow title="Screen zoom" showChevron onPress={() => onNavigate('settings/generic/Screen zoom')} />
        </div>

        {/* Settings Group 3 */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <SettingsRow title="Full screen apps" showChevron onPress={() => onNavigate('settings/generic/Full screen apps')} divider />
          <SettingsRow title="Camera cutout" showChevron onPress={() => onNavigate('settings/generic/Camera cutout')} divider />
          <SettingsRow title="Screen timeout" rightLabel="30 seconds" showChevron onPress={() => onNavigate('settings/generic/Screen timeout')} divider highlight={targetNode?.toLowerCase() === 'screen timeout'} />
          <SettingsRow title="Easy mode" toggle toggleValue={easyMode} onToggleChange={setEasyMode} divider />
          <SettingsRow title="Edge panels" toggle toggleValue={true} divider />
          <SettingsRow title="Navigation bar" rightLabel="Swipe gestures" showChevron onPress={() => onNavigate('settings/generic/Navigation bar')} divider highlight={targetNode?.toLowerCase().includes('navigation') || targetNode?.toLowerCase().includes('gesture')} />
          <SettingsRow title="Touch sensitivity" subtitle="Increase touch sensitivity for use with screen protectors" toggle toggleValue={touchSensitivity} onToggleChange={setTouchSensitivity} highlight={targetNode?.toLowerCase().includes('touch') || targetNode?.toLowerCase().includes('sensitivity')} />
        </div>

      </div>
    </div>
  );
}
