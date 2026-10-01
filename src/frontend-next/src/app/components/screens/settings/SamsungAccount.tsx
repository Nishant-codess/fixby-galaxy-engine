import React from 'react';
import { SettingsRow } from '../../ui/SettingsRow';
import { Screen } from '../../../../hooks/usePhoneNavigation';

export function SamsungAccount({ targetPath, onNavigate }: { targetPath: string[]; onNavigate: (s: Screen) => void }) {
  const targetNode = targetPath[2];

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'var(--oneui-bg-primary)' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflowY: 'auto', overflowX: 'hidden', paddingBottom: '72px' }}>
        <div style={{ padding: '64px 16px 20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 300, color: 'var(--oneui-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Samsung account</h1>
        </div>
        
        {/* Profile Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px', gap: '12px' }}>
          <img 
            src="/assets/panda_avatar.jpg" 
            alt="Fixby User" 
            style={{ 
              width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover', 
              border: '2.5px solid rgba(255,255,255,0.2)', 
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)' 
            }} 
          />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 500, marginBottom: '4px' }}>Fixby User</div>
            <div style={{ fontSize: '15px', color: 'var(--oneui-text-secondary)' }}>demo@samsung.com</div>
          </div>
        </div>

        {/* Group 1 */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <SettingsRow title="Profile info" showChevron onPress={() => {}} divider highlight={targetNode === 'Profile info'} />
          <SettingsRow title="Password and security" showChevron onPress={() => {}} divider highlight={targetNode === 'Password and security'} />
          <SettingsRow title="Registered devices" showChevron onPress={() => {}} divider />
          <SettingsRow title="Places" showChevron onPress={() => {}} />
        </div>

        {/* Group 2 */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <SettingsRow title="Payment methods" showChevron onPress={() => {}} divider />
          <SettingsRow title="Subscriptions" showChevron onPress={() => {}} />
        </div>

        {/* Group 3 */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <SettingsRow title="Samsung Cloud" rightLabel="Synced" showChevron onPress={() => {}} divider highlight={targetNode === 'Samsung Cloud'} />
          <SettingsRow title="Find My Mobile" showChevron onPress={() => {}} divider highlight={targetNode === 'Find My Mobile'} />
          <SettingsRow title="Samsung Pass" showChevron onPress={() => {}} />
        </div>

      </div>
    </div>
  );
}
