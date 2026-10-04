import React, { useState } from 'react';
import { SettingsRow } from '../../ui/SettingsRow';
import { Screen } from '../../../../hooks/usePhoneNavigation';
import { useSettings } from '../../../context/SettingsContext';
import { ICheck } from '../../ui/Icons';

function isHighlighted(targetPath: string[], ...keywords: string[]): boolean {
  const combined = targetPath.join(' ').toLowerCase();
  return keywords.some(kw => combined.includes(kw.toLowerCase()));
}

interface Props { targetPath: string[]; onNavigate: (s: Screen) => void; }

export function CameraSettings({ targetPath, onNavigate }: Props) {
  const { settings, setSetting } = useSettings();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleReset = () => {
    setSetting('sceneOptimizer', true);
    setSetting('autoHdr', true);
    setSetting('scanQrCodes', true);
    setToastMessage("Camera settings reset to factory defaults");
    setTimeout(() => setToastMessage(null), 2500);
  };

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
                <SettingsRow 
                  title="Scene optimizer" 
                  subtitle="Automatically optimize color and contrast of pictures." 
                  toggle 
                  toggleValue={settings.sceneOptimizer} 
                  onToggleChange={(v) => setSetting('sceneOptimizer', v)} 
                  divider 
                  highlight={isHighlighted(targetPath, 'scene optimizer')} 
                />
                <SettingsRow 
                  title="Scan QR codes" 
                  toggle 
                  toggleValue={settings.scanQrCodes} 
                  onToggleChange={(v) => setSetting('scanQrCodes', v)} 
                  highlight={isHighlighted(targetPath, 'scan qr codes')} 
                />
            </div>
        </div>

        {/* Useful features */}
        <div style={{ margin: '0 16px 16px' }}>
            <div style={{ fontSize: '14px', color: 'var(--oneui-accent)', fontWeight: 600, paddingLeft: '16px', marginBottom: '8px' }}>Useful features</div>
            <div style={{ background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
                <SettingsRow 
                  title="Auto HDR" 
                  subtitle="Capture more detail in bright and dark areas." 
                  toggle 
                  toggleValue={settings.autoHdr} 
                  onToggleChange={(v) => setSetting('autoHdr', v)} 
                  divider 
                  highlight={isHighlighted(targetPath, 'auto hdr')} 
                />
                <SettingsRow 
                  title="Tracking auto-focus" 
                  subtitle="Keep the camera focused on the selected subject." 
                  toggle 
                  toggleValue={true} 
                  onToggleChange={() => {}} 
                  highlight={isHighlighted(targetPath, 'tracking auto-focus')} 
                />
            </div>
        </div>
        
        {/* Bottom actions */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
            <SettingsRow 
              title="Reset settings" 
              subtitle="Restore default camera settings without deleting photos"
              onPress={handleReset} 
              divider 
              highlight={isHighlighted(targetPath, 'reset settings', 'camera reset', 'blurry', 'blur')} 
            />
            <SettingsRow title="About Camera" rightLabel="v14.0.01" onPress={() => {}} highlight={isHighlighted(targetPath, 'about camera')} />
        </div>
      </div>

      {toastMessage && (
        <div style={{
          position: 'absolute', bottom: '88px', left: '20px', right: '20px',
          background: 'rgba(20, 20, 20, 0.95)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px', padding: '12px 18px', textAlign: 'center',
          color: '#fff', fontSize: '13px', fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          animation: 'popIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          zIndex: 100
        }}>
          <ICheck style={{ width: '13px', height: '13px', verticalAlign: 'middle' }} /> {toastMessage}
        </div>
      )}
    </div>
  );
}
