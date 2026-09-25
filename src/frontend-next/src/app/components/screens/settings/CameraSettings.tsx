import React, { useState } from 'react';
import { SettingsRow } from '../../ui/SettingsRow';
import { Screen } from '../../../../hooks/usePhoneNavigation';

function isHighlighted(targetPath: string[], ...keywords: string[]): boolean {
  const combined = targetPath.join(' ').toLowerCase();
  return keywords.some(kw => combined.includes(kw.toLowerCase()));
}

interface Props { targetPath: string[]; onNavigate: (s: Screen) => void; }

export function CameraSettings({ targetPath, onNavigate }: Props) {
  const [sceneOptimizer, setSceneOptimizer] = useState(true);
  const [shotSuggestions, setShotSuggestions] = useState(false);
  const [scanQrCodes, setScanQrCodes] = useState(true);
  const [swipeShutter, setSwipeShutter] = useState(false);
  const [heif, setHeif] = useState(false);
  const [saveSelfiesAsPreviewed, setSaveSelfiesAsPreviewed] = useState(true);
  const [videoStabilization, setVideoStabilization] = useState(true);
  const [autoHdr, setAutoHdr] = useState(true);
  const [trackingAutoFocus, setTrackingAutoFocus] = useState(false);
  const [gridLines, setGridLines] = useState(false);
  const [locationTags, setLocationTags] = useState(false);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'var(--oneui-bg-primary)' }}>
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingBottom: '72px' }}>
        <div style={{ padding: '64px 16px 20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 300, color: 'var(--oneui-text-primary)', margin: 0 }}>
            Camera settings
          </h1>
        </div>

        {/* Intelligent features */}
        <div style={{ margin: '0 16px 16px' }}>
            <div style={{ fontSize: '14px', color: 'var(--oneui-accent)', fontWeight: 600, paddingLeft: '16px', marginBottom: '8px' }}>Intelligent features</div>
            <div style={{ background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
                <SettingsRow title="Scene optimizer" subtitle="Automatically optimize color and contrast of pictures." toggle toggleValue={sceneOptimizer} onToggleChange={setSceneOptimizer} divider highlight={isHighlighted(targetPath, 'scene optimizer')} />
                <SettingsRow title="Shot suggestions" subtitle="Get on-screen guides to help you line up great shots." toggle toggleValue={shotSuggestions} onToggleChange={setShotSuggestions} divider highlight={isHighlighted(targetPath, 'shot suggestions')} />
                <SettingsRow title="Scan QR codes" toggle toggleValue={scanQrCodes} onToggleChange={setScanQrCodes} highlight={isHighlighted(targetPath, 'scan qr codes')} />
            </div>
        </div>

        {/* Pictures */}
        <div style={{ margin: '0 16px 16px' }}>
            <div style={{ fontSize: '14px', color: 'var(--oneui-accent)', fontWeight: 600, paddingLeft: '16px', marginBottom: '8px' }}>Pictures</div>
            <div style={{ background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
                <SettingsRow title="Swipe Shutter button to" rightLabel="Take burst shot" showChevron onPress={() => {}} divider highlight={isHighlighted(targetPath, 'swipe shutter')} />
                <SettingsRow title="High efficiency pictures" subtitle="Save space by saving pictures in High Efficiency Image Format (HEIF)." toggle toggleValue={heif} onToggleChange={setHeif} divider highlight={isHighlighted(targetPath, 'high efficiency pictures', 'heif')} />
                <SettingsRow title="Save selfies as previewed" subtitle="Save selfies as they appear in the preview without flipping them." toggle toggleValue={saveSelfiesAsPreviewed} onToggleChange={setSaveSelfiesAsPreviewed} highlight={isHighlighted(targetPath, 'save selfies as previewed')} />
            </div>
        </div>
        
        {/* Videos */}
        <div style={{ margin: '0 16px 16px' }}>
            <div style={{ fontSize: '14px', color: 'var(--oneui-accent)', fontWeight: 600, paddingLeft: '16px', marginBottom: '8px' }}>Videos</div>
            <div style={{ background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
                <SettingsRow title="Video stabilization" toggle toggleValue={videoStabilization} onToggleChange={setVideoStabilization} divider highlight={isHighlighted(targetPath, 'video stabilization')} />
                <SettingsRow title="Advanced recording options" showChevron onPress={() => {}} highlight={isHighlighted(targetPath, 'advanced recording options')} />
            </div>
        </div>

        {/* Useful features */}
        <div style={{ margin: '0 16px 16px' }}>
            <div style={{ fontSize: '14px', color: 'var(--oneui-accent)', fontWeight: 600, paddingLeft: '16px', marginBottom: '8px' }}>Useful features</div>
            <div style={{ background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
                <SettingsRow title="Auto HDR" subtitle="Capture more detail in the bright and dark areas of your shots." toggle toggleValue={autoHdr} onToggleChange={setAutoHdr} divider highlight={isHighlighted(targetPath, 'auto hdr')} />
                <SettingsRow title="Tracking auto-focus" subtitle="Keep the rear camera focused on the selected subject even if they move." toggle toggleValue={trackingAutoFocus} onToggleChange={setTrackingAutoFocus} divider highlight={isHighlighted(targetPath, 'tracking auto-focus')} />
                <SettingsRow title="Grid lines" toggle toggleValue={gridLines} onToggleChange={setGridLines} divider highlight={isHighlighted(targetPath, 'grid lines')} />
                <SettingsRow title="Location tags" subtitle="Add location tags to your pictures and videos." toggle toggleValue={locationTags} onToggleChange={setLocationTags} divider highlight={isHighlighted(targetPath, 'location tags')} />
                <SettingsRow title="Shooting methods" showChevron onPress={() => {}} divider highlight={isHighlighted(targetPath, 'shooting methods')} />
                <SettingsRow title="Settings to keep" showChevron onPress={() => {}} highlight={isHighlighted(targetPath, 'settings to keep')} />
            </div>
        </div>
        
        {/* Bottom actions */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
            <SettingsRow title="Watermark" showChevron onPress={() => {}} divider highlight={isHighlighted(targetPath, 'watermark')} />
            <SettingsRow title="Reset settings" onPress={() => {}} divider highlight={isHighlighted(targetPath, 'reset settings', 'camera reset', 'blurry', 'blur')} />
            <SettingsRow title="About Camera" onPress={() => {}} highlight={isHighlighted(targetPath, 'about camera')} />
        </div>
      </div>
    </div>
  );
}
