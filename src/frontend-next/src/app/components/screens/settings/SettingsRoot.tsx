import React, { useState } from 'react';
import { Screen } from '../../../../hooks/usePhoneNavigation';
import { SettingsRow } from '../../ui/SettingsRow';
import { ISettings, IDisplay, IUser, IShield, IBell, IBattery, IWifi, IApps, ILock, IPhone, IChart, IInfo, ISearch, IZap } from '../../ui/Icons';

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

export function SettingsRoot({ 
  onNavigate, 
  targetPath,
  onFixbyQuery 
}: { 
  onNavigate: (s: Screen) => void; 
  targetPath: string[]; 
  onFixbyQuery?: (q: string) => void;
}) {
  const [query, setQuery] = useState("");
  
  // Normalize target: path might be ["Settings", "Display"] or the full raw string
  const targetCategory = targetPath[1] ?? targetPath[0] ?? '';

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'var(--oneui-bg-primary)' }}>
      
      <div 
        data-lenis-prevent="true"
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          overflowY: 'scroll', pointerEvents: 'auto', overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch' as 'auto',
          paddingBottom: '72px'
      }}>
        <div style={{ padding: '64px 16px 20px' }}>
          <h1 style={{ fontSize: '34px', fontWeight: 300, color: 'var(--oneui-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Settings</h1>
        </div>
        
        {/* Search Bar */}
        <div style={{ margin: '0 16px 16px', position: 'relative' }}>
          <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--oneui-text-tertiary)' }}>
            <ISearch />
          </div>
          <input 
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && query.trim()) {
                onFixbyQuery?.(query.trim());
              }
            }}
            placeholder="Search settings"
            style={{
              width: '100%', background: 'var(--oneui-bg-card)', border: 'none', borderRadius: '24px',
              padding: '14px 16px 14px 44px', color: 'var(--oneui-text-primary)', fontSize: '16px', outline: 'none'
            }}
          />
        </div>

        {/* Fixby AI Search Prompt Chip */}
        {query.trim().length > 0 && (
          <div 
            onClick={() => onFixbyQuery?.(query.trim())}
            style={{
              margin: '0 16px 20px',
              padding: '10px 16px',
              background: 'linear-gradient(135deg, rgba(32,117,214,0.2), rgba(108,71,255,0.2))',
              border: '1px solid rgba(108,71,255,0.4)',
              borderRadius: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#fff',
              fontSize: '13px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
              <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center' }}><IZap style={{ width: '15px', height: '15px' }} /></span>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Fix with AI: <strong>&quot;{query}&quot;</strong>
              </span>
            </div>
            <span style={{ color: 'var(--oneui-accent)', fontWeight: 600, flexShrink: 0, marginLeft: '8px' }}>Diagnose →</span>
          </div>
        )}

        {/* Samsung Account Mini-Card */}
        <div style={{ margin: '0 16px 24px', background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden' }}>
          <SettingsRow 
            avatar={
              <div
                aria-hidden
                style={{
                  width: '42px', height: '42px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2075d6, #5b8def)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: 700, letterSpacing: '-0.02em',
                }}
              >
                FU
              </div>
            }
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
