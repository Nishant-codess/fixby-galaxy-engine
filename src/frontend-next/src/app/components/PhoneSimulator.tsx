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

import { SoundSettings } from './screens/settings/SoundSettings';
import { CameraSettings } from './screens/settings/CameraSettings';
import { AdvancedFeatures } from './screens/settings/AdvancedFeatures';
import { DeviceCareScreen } from './screens/settings/DeviceCareScreen';
import { PrivacySettings } from './screens/settings/PrivacySettings';
import { AccessibilitySettings } from './screens/settings/AccessibilitySettings';
import { LockScreenSettings } from './screens/settings/LockScreenSettings';
import { AboutDevice } from './screens/settings/AboutDevice';
import { NotificationSettings } from './screens/settings/NotificationSettings';
import { SecuritySettings } from './screens/settings/SecuritySettings';
import { AppsSettings } from './screens/settings/AppsSettings';
import { WellbeingSettings } from './screens/settings/WellbeingSettings';
import { GeneralSettings } from './screens/settings/GeneralSettings';

// Maps keywords from the API path to a Settings sub-screen
const SETTINGS_SCREEN_MAP: { keywords: string[]; screen: Screen }[] = [
  { keywords: ['display', 'brightness', 'dark mode', 'screen mode', 'eye comfort', 'motion smoothness', 'screen timeout', 'navigation bar'], screen: 'settings/display' },
  { keywords: ['samsung account', 'cloud', 'find my mobile', 'samsung pass'], screen: 'settings/samsung-account' },
  { keywords: ['connection', 'wifi', 'wi-fi', 'bluetooth', 'nfc', 'mobile network', 'hotspot', 'flight', 'data usage', 'airplane'], screen: 'settings/connections' },
  { keywords: ['battery', 'power saving', 'background usage', 'protect battery', 'charging', 'wireless power'], screen: 'settings/battery' },
  { keywords: ['device care', 'storage', 'memory', 'ram plus', 'performance profile', 'app protection', 'optimize'], screen: 'settings/device-care' },
  { keywords: ['notification', 'alert', 'do not disturb', 'dnd', 'edge lighting', 'brief popup'], screen: 'settings/notifications' },
  { keywords: ['lock screen', 'aod', 'always on display', 'wallpaper', 'clock style'], screen: 'settings/lock-screen' },
  { keywords: ['security', 'biometric', 'fingerprint', 'face recognition', 'screen lock', 'secure folder'], screen: 'settings/privacy' },
  { keywords: ['privacy', 'permission manager', 'permission'], screen: 'settings/privacy' },
  { keywords: ['general management', 'language', 'date', 'time', 'reset', 'keyboard', 'software update', 'safe mode', 'factory'], screen: 'settings/general' },
  { keywords: ['about', 'android version', 'model', 'serial', 'status'], screen: 'settings/about' },
  { keywords: ['wellbeing', 'digital wellbeing', 'screen time', 'focus mode', 'app timer', 'bedtime'], screen: 'settings/wellbeing' },
  { keywords: ['apps', 'applications', 'default apps', 'clear cache', 'force stop', 'clear data'], screen: 'settings/apps' },
  { keywords: ['phone', 'call', 'voicemail', 'block number'], screen: 'settings/phone' },
  { keywords: ['sound', 'volume', 'ringtone', 'vibration', 'dolby', 'speaker', 'audio', 'mute', 'sounds and vibration'], screen: 'settings/sound' },
  { keywords: ['camera', 'scene optimizer', 'camera settings', 'camera reset', 'reset settings'], screen: 'settings/camera' },
  { keywords: ['game booster', 'thermal management', 'advanced features', 'multiwindow', 'dex', 'labs', 'performance mode'], screen: 'settings/advanced' },
  { keywords: ['accessibility', 'talkback', 'magnification', 'color correction', 'interaction'], screen: 'settings/accessibility' },
];

function resolveSettingsScreen(path: string[]): Screen | null {
  // path is like: ["Settings", "Display", "Brightness"] or ["Settings > Connections > Wi-Fi"]
  // Flatten and normalize for matching
  const combined = path.join(' ').toLowerCase();
  
  let bestMatch: Screen | null = null;
  let maxKeywordLen = 0;

  for (const entry of SETTINGS_SCREEN_MAP) {
    for (const kw of entry.keywords) {
      if (combined.includes(kw)) {
        if (kw.length > maxKeywordLen) {
          maxKeywordLen = kw.length;
          bestMatch = entry.screen;
        }
      }
    }
  }
  return bestMatch;
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

      // New Screens
      case 'settings/sound':           return <SoundSettings targetPath={targetPath} onNavigate={push} />;
      case 'settings/camera':          return <CameraSettings targetPath={targetPath} onNavigate={push} />;
      case 'settings/advanced':        return <AdvancedFeatures targetPath={targetPath} onNavigate={push} />;
      case 'settings/device-care':     return <DeviceCareScreen targetPath={targetPath} onNavigate={push} />;
      case 'settings/privacy':         return <PrivacySettings targetPath={targetPath} onNavigate={push} />;
      case 'settings/accessibility':   return <AccessibilitySettings targetPath={targetPath} onNavigate={push} />;
      case 'settings/notifications':   return <NotificationSettings targetPath={targetPath} onNavigate={push} />;
      case 'settings/wellbeing':       return <WellbeingSettings targetPath={targetPath} onNavigate={push} />;
      case 'settings/general':         return <GeneralSettings targetPath={targetPath} onNavigate={push} />;

      // Generic Mock Settings
      case 'settings/lock-screen':     return <LockScreenSettings targetPath={targetPath} onBack={pop} />;
      case 'settings/about':           return <AboutDevice targetPath={targetPath} onBack={pop} />;
      case 'settings/security':        return <SecuritySettings targetPath={targetPath} onNavigate={push} />;
      case 'settings/apps':            return <AppsSettings targetPath={targetPath} onNavigate={push} />;
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
