import React, { useState } from 'react';
import { Screen } from '../../../hooks/usePhoneNavigation';
import { SettingsRow } from '../../ui/SettingsRow';
import { ISettings, IDisplay, IUser, IShield, IBell, IBattery, IWifi, IApps, ILock, IPhone, IChart, IInfo, ISearch } from '../../ui/Icons';

const ALL_SETTINGS = [
  { icon: <IUser />,    title: "Samsung account",      color: "#2566d8", screen: "settings/samsung-account" },
  { icon: <IDisplay />, title: "Display",              color: "#f09000", screen: "settings/display" },
  { icon: <IBell />,    title: "Notifications",        color: "#e9303a", screen: "settings/notifications" },
  { icon: <IBattery />, title: "Battery and device care", color: "#28b865", screen: "settings/battery" },
  { icon: <IWifi />,    title: "Connections",          color: "#2566d8", screen: "settings/connections" },
  { icon: <IApps />,    title: "Apps",                 color: "#8e5ef5", screen: "settings/apps" },
  { icon: <ILock />,    title: "Lock screen and AOD",  color: "#f09000", screen: "settings/lock-screen" },
  { icon: <IShield />,  title: "Security and privacy", color: "#e9303a", screen: "settings/security" },
  { icon: <IPhone />,   title: "Phone",                color: "#28b865", screen: "settings/phone" },
  { icon: <ISettings />, title: "General management", color: "#8E8E93", screen: "settings/general" },
  { icon: <IInfo />,    title: "About phone",          color: "#8E8E93", screen: "settings/about" },
  { icon: <IChart />,   title: "Digital Wellbeing",   color: "#8e5ef5", screen: "settings/wellbeing" },
];

export function SettingsRoot({ onNavigate, targetPath }: { onNavigate: (s: Screen) => void; targetPath: string[] }) {
  const [query, setQuery] = useState("");
  
  // Normalize target: path might be ["Settings", "Display"] or the full raw string
  const targetCategory = targetPath[1] ?? targetPath[0] ?? '';

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'var(--oneui-bg-primary)' }}>
      
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        overflowY: 'auto', overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch' as 'auto',
        paddingBottom: '72px'
      }}>
        <div style={{ padding: '64px 16px 20px' }}>
          <h1 style={{ fontSize: '34px', fontWeight: 300, color: 'var(--oneui-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Settings</h1>
        </div>
        
        {/* Search Bar */}
        <div style={{ margin: '0 16px 24px', position: 'relative' }}>
          <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--oneui-text-tertiary)' }}>
            <ISearch />
          </div>
          <input 
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search settings"
            style={{
              width: '100%', background: 'var(--oneui-bg-card)', border: 'none', borderRadius: '24px',
              padding: '14px 16px 14px 44px', color: 'var(--oneui-text-primary)', fontSize: '16px', outline: 'none'
            }}
          />
        </div>

        {/* Samsung Account Mini-Card */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <SettingsRow 
            avatar={<div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#444' }} />}
            title="Fixby User"
            subtitle="Samsung account"
            onPress={() => onNavigate('settings/samsung-account')}
            highlight={targetCategory?.toLowerCase() === 'samsung account'}
          />
        </div>

        {/* Main Settings List */}
        <div style={{ margin: '0 16px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          {ALL_SETTINGS.filter(s => s.title.toLowerCase().includes(query.toLowerCase())).map((item, i, arr) => (
            <SettingsRow 
              key={item.title}
              icon={item.icon}
              iconBg={item.color}
              title={item.title}
              onPress={() => onNavigate(item.screen as Screen)}
              divider={i < arr.length - 1}
              highlight={targetCategory?.toLowerCase() === item.title.toLowerCase()}
              showChevron
            />
          ))}
        </div>
      </div>
    </div>
  );
}
