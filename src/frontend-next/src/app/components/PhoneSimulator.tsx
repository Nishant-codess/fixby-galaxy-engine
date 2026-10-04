"use client";

import React, { useState, useCallback } from 'react';
import { usePhoneNavigation, Screen } from '../../hooks/usePhoneNavigation';
import { useAnimatedNavigation } from '../../hooks/useAnimatedNavigation';
import { StatusBar } from './ui/StatusBar';
import { NavBar } from './ui/NavBar';
import { FixbyOrb } from './overlay/FixbyOrb';
import { DemoOverlay } from './overlay/DemoOverlay';
import { GuidedBreadcrumb } from './overlay/GuidedBreadcrumb';
import { SuccessToast } from './overlay/SuccessToast';
import { ConfirmationDialog } from './ui/ConfirmationDialog';
import { useSettings } from '../context/SettingsContext';
import { useHistory, TroubleshootHistoryItem } from '../context/HistoryContext';
import { HistoryDrawer } from './history/HistoryDrawer';
import { FixAction, checkCapability } from '../../settings/actions';
import { resolveSettingsPath } from '../../settings/navigation';
import type { GoalData } from '../../hooks/useFixbyQuery';

import { LockScreen } from './screens/LockScreen';
import { HomeScreen } from './screens/HomeScreen';
import { RecentApps } from './screens/RecentApps';

import { SettingsRoot } from './screens/settings/SettingsRoot';
import { DisplaySettings } from './screens/settings/DisplaySettings';
import { MotionSmoothnessScreen } from './screens/settings/MotionSmoothnessScreen';
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
import { BatteryUsageScreen } from './screens/settings/BatteryUsageScreen';
import { StorageScreen } from './screens/settings/StorageScreen';

// Maps keywords from the API path to a Settings sub-screen
const SETTINGS_SCREEN_MAP: { keywords: string[]; screen: Screen }[] = [
  { keywords: ['motion smoothness', 'refresh rate', '120hz', 'adaptive refresh'], screen: 'settings/motion-smoothness' },
  { keywords: ['battery usage', 'background usage', 'deep sleep', 'sleeping apps', 'background limit'], screen: 'settings/battery-usage' },
  { keywords: ['storage', 'clean storage', 'internal storage', 'clean now'], screen: 'settings/storage' },
  { keywords: ['display', 'brightness', 'dark mode', 'screen mode', 'eye comfort', 'screen timeout', 'navigation bar'], screen: 'settings/display' },
  { keywords: ['samsung account', 'cloud', 'find my mobile', 'samsung pass'], screen: 'settings/samsung-account' },
  { keywords: ['connection', 'wifi', 'wi-fi', 'bluetooth', 'nfc', 'mobile network', 'hotspot', 'flight', 'data usage', 'airplane'], screen: 'settings/connections' },
  { keywords: ['battery', 'power saving', 'protect battery', 'charging', 'wireless power'], screen: 'settings/battery' },
  { keywords: ['device care', 'memory', 'ram plus', 'performance profile', 'app protection', 'optimize'], screen: 'settings/device-care' },
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

function resolveScreenSequence(path: string[]): Screen[] {
  const screens: Screen[] = ['settings'];
  
  for (let i = 1; i < path.length; i++) {
    const subPath = path.slice(0, i + 1);
    const screen = resolveSettingsScreen(subPath);
    if (screen && !screens.includes(screen)) {
      screens.push(screen);
    }
  }
  
  return screens;
}

export default function PhoneSimulator() {
  const { currentScreen, push, pop, reset, pushMany } = usePhoneNavigation('lock');
  const { startDemo, startDemoSteps, cancelDemo, isAnimating, currentStep, totalSteps, highlightedTarget } = useAnimatedNavigation();
  const { settings, setSetting, executeAction, darkMode } = useSettings();
  
  const [orbOpen, setOrbOpen] = useState(false);
  const [targetPath, setTargetPath] = useState<string[]>([]);
  const [escalation, setEscalation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Resolution mode states
  const [activeMode, setActiveMode] = useState<'idle' | 'demo' | 'manual'>('idle');
  const [activeAction, setActiveAction] = useState<FixAction | null>(null);
  const [pendingAction, setPendingAction] = useState<FixAction | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [activePath, setActivePath] = useState<string[]>([]);
  const [activeScreenSequence, setActiveScreenSequence] = useState<Screen[]>([]);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { isDrawerOpen, setIsDrawerOpen } = useHistory();
  const [restoredGoals, setRestoredGoals] = useState<GoalData[] | null>(null);
  const [restoredQuery, setRestoredQuery] = useState<string>("");

  const handleSelectHistoryItem = useCallback((item: TroubleshootHistoryItem) => {
    setIsDrawerOpen(false);
    setRestoredGoals(item.goals);
    setRestoredQuery(item.query);
    setOrbOpen(true);
  }, [setIsDrawerOpen]);

  const handleFixbySearch = (q: string) => {
    setSearchQuery(q);
    setOrbOpen(true);
  };

  const handleOrbResolved = (path: string[], escalationLevel?: string) => {
    setTargetPath(path);
    setEscalation(escalationLevel || null);

    if (path.length === 0) {
      pushMany(['home', 'settings']);
      return;
    }

    const subScreen = resolveSettingsScreen(path);
    if (subScreen) {
      pushMany(['home', 'settings', subScreen]);
    } else {
      pushMany(['home', 'settings']);
    }
  };

  // ── Central Action Execution Core ──

  const applyAction = useCallback(async (action: FixAction) => {
    // 1. Centralized action execution
    const result = await executeAction(action);

    // 2. Navigation to relevant screen
    const resolvedNav = resolveSettingsPath(action.destinationPath);
    const subScreen = resolvedNav.screen !== 'settings' ? resolvedNav.screen : resolveSettingsScreen(action.destinationPath);
    
    if (subScreen && subScreen !== 'settings') {
      pushMany(['home', 'settings', subScreen]);
    } else {
      pushMany(['home', 'settings']);
    }

    // 3. Highlight target setting
    setTargetPath(action.destinationPath);

    // 4. Result message
    setSuccessMessage(result.message);
    setShowSuccessToast(true);
  }, [executeAction, pushMany]);

  // ── Resolution Mode Handlers ──
  
  const handleWatchDemo = useCallback((action: FixAction) => {
    const path = action.destinationPath;
    const sequence = resolveScreenSequence(path);
    
    setActiveMode('demo');
    setActiveAction(action);
    setActivePath(path);
    setActiveScreenSequence(sequence);
    setTargetPath(path);

    if (action.demoSequence && action.demoSequence.length > 0) {
      startDemoSteps(action.demoSequence, {
        push,
        reset,
        setHighlight: (target: string) => {
          setTargetPath([target]);
        },
        executeDemoToggle: (targetKey: string, value: any) => {
          setSetting(targetKey as any, value);
        },
        onMessage: (msg: string) => {
          setSuccessMessage(msg);
        }
      });
    } else {
      startDemo(sequence, push, reset, 650);
    }
  }, [startDemoSteps, startDemo, push, reset, setSetting]);

  const handlePerformAuto = useCallback(async (action: FixAction) => {
    setActiveMode('idle');
    setActiveAction(action);

    // 1. Check capability
    const capability = checkCapability(action);
    if (capability.mode === 'UNSUPPORTED') {
      setSuccessMessage(capability.reason || 'This action is not supported in the current environment.');
      setShowSuccessToast(true);
      return;
    }

    // 2. Check confirmation requirement
    if (action.requiresConfirmation) {
      setPendingAction(action);
      setShowConfirmDialog(true);
      return;
    }

    await applyAction(action);
  }, [applyAction]);

  const handleConfirmAction = useCallback(async () => {
    if (pendingAction) {
      const act = pendingAction;
      setPendingAction(null);
      setShowConfirmDialog(false);
      await applyAction(act);
    }
  }, [pendingAction, applyAction]);

  const handleCancelAction = useCallback(() => {
    setPendingAction(null);
    setShowConfirmDialog(false);
  }, []);

  const handlePerformManual = useCallback((action: FixAction) => {
    const path = action.destinationPath;
    const sequence = resolveScreenSequence(path);
    
    setActiveMode('manual');
    setActiveAction(action);
    setActivePath(path);
    setActiveScreenSequence(sequence);
    setTargetPath(path);

    // Navigate to Settings root — user does the rest
    pushMany(['home', 'settings']);
  }, [pushMany]);

  const handleDismissManual = useCallback(() => {
    setActiveMode('idle');
    setActiveAction(null);
    setActivePath([]);
  }, []);

  const handleSkipDemo = useCallback(() => {
    cancelDemo();
    setActiveMode('idle');
    
    // Jump to final screen
    if (activeAction) {
      const resolvedNav = resolveSettingsPath(activeAction.destinationPath);
      const subScreen = resolvedNav.screen !== 'settings' ? resolvedNav.screen : resolveSettingsScreen(activeAction.destinationPath);
      if (subScreen && subScreen !== 'settings') {
        pushMany(['home', 'settings', subScreen]);
      } else {
        pushMany(['home', 'settings']);
      }
      setSuccessMessage(`Demo finished — ${activeAction.title}`);
      setShowSuccessToast(true);
      setActiveAction(null);
    }
  }, [cancelDemo, activeAction, pushMany]);

  // When demo finishes naturally, show success
  React.useEffect(() => {
    if (activeMode === 'demo' && !isAnimating && currentStep === -1 && activeAction) {
      setActiveMode('idle');
      setSuccessMessage(`Demo complete — ${activeAction.title}`);
      setShowSuccessToast(true);
      setActiveAction(null);
    }
  }, [isAnimating, currentStep, activeMode, activeAction]);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'lock':   return <LockScreen onUnlock={reset} />;
      case 'home':   return <HomeScreen onNavigate={push} onFixbyOrb={() => setOrbOpen(true)} />;
      case 'recents': return <RecentApps onNavigate={(s) => { pop(); push(s); }} onCloseAll={reset} />;

      // Settings Root
      case 'settings': return <SettingsRoot onNavigate={push} targetPath={targetPath} onFixbyQuery={handleFixbySearch} />;

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

      // Interactive Sub-screens
      case 'settings/motion-smoothness':
      case 'settings/display/motion-smoothness':
        return <MotionSmoothnessScreen targetPath={targetPath} onBack={pop} />;
      case 'settings/battery-usage':
        return <BatteryUsageScreen targetPath={targetPath} onBack={pop} />;
      case 'settings/storage':
        return <StorageScreen targetPath={targetPath} onBack={pop} />;

      // Generic Mock Settings
      case 'settings/lock-screen':     return <LockScreenSettings targetPath={targetPath} onBack={pop} />;
      case 'settings/about':           return <AboutDevice targetPath={targetPath} onBack={pop} />;
      case 'settings/security':        return <SecuritySettings targetPath={targetPath} onNavigate={push} />;
      case 'settings/apps':            return <AppsSettings targetPath={targetPath} onNavigate={push} />;
      case 'settings/phone':
        return <GenericSettings screen={currentScreen} targetPath={targetPath} onNavigate={push} />;
      default: 
        if (currentScreen.startsWith('settings/generic')) {
          return <GenericSettings screen={currentScreen} targetPath={targetPath} onNavigate={push} />;
        }
        return <div style={{ color: '#fff', padding: '64px 24px' }}>Mock Screen: {currentScreen}</div>;
    }
  };

  const isWallpaperScreen = currentScreen === 'lock' || currentScreen === 'home' || currentScreen === 'recents';
  const isDarkScreen = !isWallpaperScreen;

  const lightModeVars = {
    '--oneui-bg-primary': '#f2f2f7',
    '--oneui-bg-card': '#ffffff',
    '--oneui-text-primary': '#000000',
    '--oneui-text-secondary': '#8e8e93',
    '--oneui-text-tertiary': '#c7c7cc',
    '--oneui-separator': 'rgba(0,0,0,0.08)',
  } as React.CSSProperties;

  return (
    <div style={{
      ...(darkMode ? {} : lightModeVars),
      width: '100%', height: '100%', borderRadius: 'inherit',
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
      <div className="phone-edge-fade" style={{ position: 'absolute', inset: 0 }}>
        <div className="phone-screen-scroll" style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <StatusBar theme={isDarkScreen ? 'dark' : 'light'} />

        {/* Active screen */}
        {renderScreen()}

        {/* Demo Overlay — shows during animated walkthrough */}
        {activeMode === 'demo' && isAnimating && (
          <DemoOverlay
            title={activeAction?.title || 'Setting'}
            pathSegments={activePath}
            currentStep={currentStep}
            totalSteps={totalSteps}
            onSkip={handleSkipDemo}
          />
        )}

        {/* Guided Breadcrumb — shows during manual navigation */}
        {activeMode === 'manual' && activeAction && (
          <GuidedBreadcrumb
            pathSegments={activePath}
            currentScreen={currentScreen}
            targetScreens={activeScreenSequence}
            onDismiss={handleDismissManual}
          />
        )}

        {/* Success Toast — auto-dismiss after auto-fix or demo completion */}
        {showSuccessToast && (
          <SuccessToast
            message={successMessage}
            onDismiss={() => setShowSuccessToast(false)}
          />
        )}

        {/* Confirmation Dialog for actions requiring confirmation */}
        <ConfirmationDialog
          isOpen={showConfirmDialog}
          title={pendingAction?.title || 'Confirm Setting Change'}
          message={`Are you sure you want to apply "${pendingAction?.title}"? This will modify your device settings.`}
          confirmLabel="Apply Fix"
          cancelLabel="Cancel"
          isDestructive={pendingAction?.risk === 'high'}
          onConfirm={handleConfirmAction}
          onCancel={handleCancelAction}
        />

        {/* Fixby Orb — overlay on every screen except lock */}
        {currentScreen !== 'lock' && (
          <FixbyOrb
            isOpen={orbOpen}
            onToggle={setOrbOpen}
            onResolved={handleOrbResolved}
            initialQuery={searchQuery}
            onClearInitialQuery={() => setSearchQuery("")}
            onWatchDemo={handleWatchDemo}
            onPerformAuto={handlePerformAuto}
            onPerformManual={handlePerformManual}
            onOpenHistory={() => setIsDrawerOpen(true)}
            restoredGoals={restoredGoals}
            restoredQuery={restoredQuery}
          />
        )}

        <NavBar
          currentScreen={currentScreen}
          onBack={pop}
          onHome={reset}
          onRecents={() => push('recents')}
        />

        {/* Persistent History Drawer */}
        <HistoryDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onSelectHistoryItem={handleSelectHistoryItem}
        />
      </div>
      </div>

    </div>
  );
}
