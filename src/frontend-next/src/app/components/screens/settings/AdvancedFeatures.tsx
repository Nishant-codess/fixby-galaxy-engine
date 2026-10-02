import React, { useState } from 'react';
import { SettingsRow } from '../../ui/SettingsRow';
import { Screen } from '../../../../hooks/usePhoneNavigation';
import { IFlame } from '../../ui/Icons';

function isHighlighted(targetPath: string[], ...keywords: string[]): boolean {
  const combined = targetPath.join(' ').toLowerCase();
  return keywords.some(kw => combined.includes(kw.toLowerCase()));
}

interface Props { targetPath: string[]; onNavigate: (s: Screen) => void; }

export function AdvancedFeatures({ targetPath, onNavigate }: Props) {
  const [callTextOnOtherDevices, setCallTextOnOtherDevices] = useState(false);
  const [continueAppsOnOtherDevices, setContinueAppsOnOtherDevices] = useState(false);
  const [linkToWindows, setLinkToWindows] = useState(false);
  const [samsungDex, setSamsungDex] = useState(false);
  
  const [androidAuto, setAndroidAuto] = useState(false);
  const [quickShare, setQuickShare] = useState(false);

  const [motionsAndGestures, setMotionsAndGestures] = useState(false);
  const [oneHandedMode, setOneHandedMode] = useState(false);
  const [smartSuggestions, setSmartSuggestions] = useState(true);
  const [screenshotsAndScreenRecorder, setScreenshotsAndScreenRecorder] = useState(false);
  const [showContactsWhenSharingContent, setShowContactsWhenSharingContent] = useState(true);
  
  const [videoCallEffects, setVideoCallEffects] = useState(false);
  const [dualMessenger, setDualMessenger] = useState(false);
  
  // Game Booster sub-section states
  const [thermal, setThermal] = useState(false);

  const targetNode = targetPath[2]?.toLowerCase() ?? '';
  const targetSubNode = targetPath[3]?.toLowerCase() ?? '';

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'var(--oneui-bg-primary)' }}>
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingBottom: '72px' }}>
        <div style={{ padding: '64px 16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 300, color: 'var(--oneui-text-primary)', margin: 0 }}>
            Advanced features
          </h1>
          <span style={{ background: 'var(--oneui-accent)', color: '#fff', padding: '4px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>New</span>
        </div>

        {/* Sync */}
        <div style={{ margin: '0 16px 16px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
            <SettingsRow title="Call & text on other devices" toggle toggleValue={callTextOnOtherDevices} onToggleChange={setCallTextOnOtherDevices} divider highlight={isHighlighted(targetPath, 'call & text on other devices')} />
            <SettingsRow title="Continue apps on other devices" toggle toggleValue={continueAppsOnOtherDevices} onToggleChange={setContinueAppsOnOtherDevices} divider highlight={isHighlighted(targetPath, 'continue apps on other devices')} />
            <SettingsRow title="Link to Windows" toggle toggleValue={linkToWindows} onToggleChange={setLinkToWindows} divider highlight={isHighlighted(targetPath, 'link to windows')} />
            <SettingsRow title="Samsung DeX" toggle toggleValue={samsungDex} onToggleChange={setSamsungDex} highlight={isHighlighted(targetPath, 'samsung dex')} />
        </div>

        {/* Labs and Game Booster */}
        <div style={{ margin: '0 16px 16px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
            <SettingsRow title="Labs" showChevron onPress={() => {}} divider highlight={isHighlighted(targetPath, 'labs')} />
            <SettingsRow title="Game Booster" showChevron onPress={() => {}} divider highlight={targetNode.includes('game booster')} />
            
            {/* Thermal Management SUB-SECTION shown when path includes 'Thermal management' */}
            {targetNode.includes('game booster') && (
              <div style={{ margin: '0 16px 16px', background: 'rgba(255,100,0,0.1)', borderRadius: '16px', 
                            border: '1px solid rgba(255,100,0,0.4)', padding: '16px' }}>
                <div style={{ color: '#ff6400', fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>
                  <IFlame style={{ width: '13px', height: '13px', verticalAlign: 'middle', marginRight: '4px' }} /> GAME BOOSTER
                </div>
                <SettingsRow title="Thermal management" toggle toggleValue={thermal} onToggleChange={setThermal} divider
                  highlight={targetNode.includes('thermal') || targetSubNode.includes('thermal')} />
                <SettingsRow title="Game performance mode" rightLabel="Standard" showChevron onPress={() => {}}
                  highlight={targetSubNode.includes('performance')} />
              </div>
            )}
        </div>
        
        {/* Motions and Gestures */}
        <div style={{ margin: '0 16px 16px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
            <SettingsRow title="Side key" showChevron onPress={() => {}} divider highlight={isHighlighted(targetPath, 'side key')} />
            <SettingsRow title="Motions and gestures" showChevron onPress={() => {}} divider highlight={isHighlighted(targetPath, 'motions and gestures')} />
            <SettingsRow title="One-handed mode" subtitle="Scale down the display size to use the phone with one hand." toggle toggleValue={oneHandedMode} onToggleChange={setOneHandedMode} divider highlight={isHighlighted(targetPath, 'one-handed mode')} />
            <SettingsRow title="Smart suggestions" subtitle="Get suggestions for useful actions based on how you use your phone." toggle toggleValue={smartSuggestions} onToggleChange={setSmartSuggestions} divider highlight={isHighlighted(targetPath, 'smart suggestions')} />
            <SettingsRow title="Screenshots and screen recorder" showChevron onPress={() => {}} divider highlight={isHighlighted(targetPath, 'screenshots and screen recorder')} />
            <SettingsRow title="Show contacts when sharing content" toggle toggleValue={showContactsWhenSharingContent} onToggleChange={setShowContactsWhenSharingContent} highlight={isHighlighted(targetPath, 'show contacts when sharing content')} />
        </div>
        
        {/* Others */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
            <SettingsRow title="Video call effects" subtitle="Apply background effects to video calls." toggle toggleValue={videoCallEffects} onToggleChange={setVideoCallEffects} divider highlight={isHighlighted(targetPath, 'video call effects')} />
            <SettingsRow title="Dual Messenger" subtitle="Sign in to a second account in your favorite social apps." toggle toggleValue={dualMessenger} onToggleChange={setDualMessenger} highlight={isHighlighted(targetPath, 'dual messenger')} />
        </div>

      </div>
    </div>
  );
}
