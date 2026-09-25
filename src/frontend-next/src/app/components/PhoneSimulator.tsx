"use client";

import React, { useState } from 'react';
import { usePhoneNavigation, Screen } from '../../hooks/usePhoneNavigation';
import { StatusBar } from './ui/StatusBar';
import { NavBar } from './ui/NavBar';
import { FixbyOrb } from './overlay/FixbyOrb';

import { LockScreen } from './screens/LockScreen';
import { HomeScreen } from './screens/HomeScreen';
import { RecentApps } from './screens/RecentApps';

import { SettingsRoot } from './screens/settings/SettingsRoot';
import { DisplaySettings } from './screens/settings/DisplaySettings';
import { SamsungAccount } from './screens/settings/SamsungAccount';
import { Connections } from './screens/settings/Connections';
import { BatteryScreen } from './screens/settings/BatteryScreen';
import { GenericSettings } from './screens/settings/GenericSettings';

// Maps keywords from the API path to a Settings sub-screen
const SETTINGS_SCREEN_MAP: { keywords: string[]; screen: Screen }[] = [
  { keywords: ['display', 'brightness', 'dark mode', 'screen mode', 'eye comfort'], screen: 'settings/display' },
  { keywords: ['samsung account', 'cloud', 'find my mobile', 'samsung pass'], screen: 'settings/samsung-account' },
  { keywords: ['connection', 'wifi', 'wi-fi', 'bluetooth', 'nfc', 'mobile network', 'hotspot', 'flight'], screen: 'settings/connections' },
  { keywords: ['battery', 'device care', 'power', 'storage', 'memory', 'background usage', 'protect battery'], screen: 'settings/battery' },
  { keywords: ['notification', 'alert', 'do not disturb'], screen: 'settings/notifications' },
  { keywords: ['lock screen', 'aod', 'always on display', 'wallpaper'], screen: 'settings/lock-screen' },
  { keywords: ['security', 'privacy', 'biometric', 'fingerprint', 'face recognition', 'permission'], screen: 'settings/security' },
  { keywords: ['general management', 'language', 'date', 'time', 'reset', 'keyboard'], screen: 'settings/general' },
  { keywords: ['about', 'software update', 'android version', 'model', 'serial'], screen: 'settings/about' },
  { keywords: ['wellbeing', 'digital wellbeing', 'screen time', 'focus mode', 'app timer'], screen: 'settings/wellbeing' },
  { keywords: ['apps', 'applications', 'default apps'], screen: 'settings/apps' },
  { keywords: ['phone', 'call', 'voicemail', 'block number'], screen: 'settings/phone' },
];

function resolveSettingsScreen(path: string[]): Screen | null {
  // path is like: ["Settings", "Display", "Brightness"] or ["Settings > Connections > Wi-Fi"]
  // Flatten and normalize for matching
  const combined = path.join(' ').toLowerCase();
  for (const entry of SETTINGS_SCREEN_MAP) {
    if (entry.keywords.some(kw => combined.includes(kw))) {
      return entry.screen;
    }
  }
  return null;
}

export default function PhoneSimulator() {
  const { currentScreen, push, pop, reset, pushMany } = usePhoneNavigation('lock');
  const [orbOpen, setOrbOpen] = useState(false);
  const [targetPath, setTargetPath] = useState<string[]>([]);

  const handleOrbResolved = (path: string[]) => {
    setTargetPath(path);

    if (path.length === 0) {
      // No specific path — just open Settings root
      pushMany(['home', 'settings']);
      return;
    }

    const subScreen = resolveSettingsScreen(path);
    if (subScreen) {
      // Atomically jump to: home → settings → subScreen
      pushMany(['home', 'settings', subScreen]);
    } else {
      // Fall back to settings root with the path highlighted
      pushMany(['home', 'settings']);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'lock':   return <LockScreen onUnlock={reset} />;
      case 'home':   return <HomeScreen onNavigate={push} onFixbyOrb={() => setOrbOpen(true)} />;
      case 'recents': return <RecentApps onNavigate={(s) => { pop(); push(s); }} onCloseAll={reset} />;

      // Settings Root
      case 'settings': return <SettingsRoot onNavigate={push} targetPath={targetPath} />;

      // Settings Branches
      case 'settings/display':         return <DisplaySettings targetPath={targetPath} onNavigate={push} />;
      case 'settings/samsung-account': return <SamsungAccount targetPath={targetPath} onNavigate={push} />;
      case 'settings/connections':     return <Connections targetPath={targetPath} onNavigate={push} />;
      case 'settings/battery':         return <BatteryScreen targetPath={targetPath} onNavigate={push} />;

      // Generic Mock Settings
      case 'settings/notifications':
      case 'settings/lock-screen':
      case 'settings/security':
      case 'settings/general':
      case 'settings/about':
      case 'settings/wellbeing':
      case 'settings/apps':
      case 'settings/phone':
        return <GenericSettings screen={currentScreen} targetPath={targetPath} onNavigate={push} />;

      default: return <div style={{ color: '#fff', padding: '64px 24px' }}>Mock Screen</div>;
    }
  };

  const isWallpaperScreen = currentScreen === 'lock' || currentScreen === 'home' || currentScreen === 'recents';
  const isDarkScreen = !isWallpaperScreen;

  return (
    <div style={{
      width: '380px', height: '820px', borderRadius: '48px',
      backgroundColor: isWallpaperScreen ? 'transparent' : 'var(--oneui-bg-primary)',
      backgroundImage: isWallpaperScreen ? 'var(--oneui-wallpaper)' : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'relative', overflow: 'hidden',
      boxShadow: '0 0 0 12px #111, 0 32px 84px rgba(0,0,0,0.8), inset 0 0 0 2px rgba(255,255,255,0.1)',
      fontFamily: '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", sans-serif'
    }}>

      {/* Screen container */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <StatusBar theme={isDarkScreen ? 'dark' : 'light'} />

        {/* Active screen */}
        {renderScreen()}

        {/* Fixby Orb — overlay on every screen except lock */}
        {currentScreen !== 'lock' && (
          <FixbyOrb
            isOpen={orbOpen}
            onToggle={setOrbOpen}
            onResolved={handleOrbResolved}
          />
        )}

        <NavBar
          currentScreen={currentScreen}
          onBack={pop}
          onHome={reset}
          onRecents={() => push('recents')}
        />
      </div>

    </div>
  );
}
