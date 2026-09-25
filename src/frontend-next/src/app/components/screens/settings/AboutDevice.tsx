import React from 'react';
import { SettingsRow } from '../../ui/SettingsRow';

interface Props {
  onBack: () => void;
  targetPath?: string[];
}

export function AboutDevice({ onBack, targetPath = [] }: Props) {
  const highlightSoftware = targetPath.join(' ').toLowerCase().includes('software');

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'var(--oneui-bg-primary)' }}>
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingBottom: '72px' }}>
        <div style={{ padding: '64px 16px 20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 300, color: 'var(--oneui-text-primary)', margin: 0 }}>
            About phone
          </h1>
        </div>

        <div style={{ padding: '0 16px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>Galaxy S24 Ultra</div>
          <div style={{ fontSize: '14px', color: 'var(--oneui-text-secondary)', marginTop: '4px' }}>+1 (555) 019-2834</div>
        </div>
        
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <SettingsRow title="Status information" showChevron divider />
          <SettingsRow title="Legal information" showChevron divider />
          <SettingsRow title="Software information" highlight={highlightSoftware} showChevron divider />
          <SettingsRow title="Battery information" showChevron />
        </div>
        
        <div style={{ padding: '24px 16px', color: 'var(--oneui-text-secondary)', fontSize: '14px', textAlign: 'center' }}>
          Looking for something else?
          <br />
          <span style={{ color: 'var(--oneui-accent)', cursor: 'pointer', marginTop: '8px', display: 'inline-block' }}>Reset</span>
        </div>
      </div>
    </div>
  );
}
