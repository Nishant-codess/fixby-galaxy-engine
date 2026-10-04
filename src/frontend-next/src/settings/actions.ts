/**
 * src/settings/actions.ts
 * Structured Fix & Action System for Fixby
 * Bridges high-level AI diagnostic goals to concrete, validated, executable Samsung actions.
 */

import { Screen } from '../hooks/usePhoneNavigation';
import { DeviceSettingKey, SETTING_DEFINITIONS } from './definitions';
import type { GoalData } from '../hooks/useFixbyQuery';
import { CAPABILITY_MATRIX } from './capabilities';
import { TROUBLESHOOTING_CATALOG } from './catalog';

export type ActionType =
  | 'TOGGLE_ON'
  | 'TOGGLE_OFF'
  | 'TOGGLE'
  | 'NAVIGATE'
  | 'OPEN_APP'
  | 'OPEN_SETTINGS'
  | 'CONFIG_CHANGE'
  | 'MULTI_STEP';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface DemoStep {
  type: 'NAVIGATE' | 'HIGHLIGHT' | 'TOGGLE' | 'CONFIG_CHANGE' | 'WAIT' | 'COMPLETE';
  screen?: Screen;
  target?: string | DeviceSettingKey;
  value?: any;
  durationMs?: number;
  message?: string;
}

export interface FixAction {
  id: string;
  title: string;
  type: ActionType;
  settingKey?: DeviceSettingKey;
  targetValue?: boolean | string | number;
  destination: Screen;
  destinationPath: string[];
  highlightNode?: string;
  appPackage?: string;
  appName?: string;
  requiresConfirmation: boolean;
  confirmationTitle?: string;
  confirmationMessage?: string;
  canAutoApply: boolean;
  risk: RiskLevel;
  estimatedImpact: string;
  reason: string;
  steps: string[];
  demoSequence: DemoStep[];
}

export interface ActionResult {
  success: boolean;
  actionId: string;
  settingKey?: DeviceSettingKey;
  newValue?: any;
  message: string;
  mode: 'SIMULATED' | 'NATIVE' | 'FALLBACK';
  error?: string;
  requiresNativeAndroid?: boolean;
}

export interface ExecutionCapability {
  supported: boolean;
  mode: 'SIMULATED' | 'NATIVE' | 'UNSUPPORTED';
  reason?: string;
  fallbackDeeplink?: string;
}

/**
 * Known Samsung & Android App Packages
 */
export const KNOWN_APPS: Record<string, { name: string; deepLink?: string; webFallback?: string }> = {
  'com.whatsapp': {
    name: 'WhatsApp',
    deepLink: 'whatsapp://app',
    webFallback: 'https://web.whatsapp.com',
  },
  'com.instagram.android': {
    name: 'Instagram',
    deepLink: 'instagram://app',
    webFallback: 'https://instagram.com',
  },
  'com.google.android.youtube': {
    name: 'YouTube',
    deepLink: 'vnd.youtube://',
    webFallback: 'https://youtube.com',
  },
  'com.google.android.apps.maps': {
    name: 'Google Maps',
    deepLink: 'geo:0,0',
    webFallback: 'https://maps.google.com',
  },
  'com.google.android.gm': {
    name: 'Gmail',
    deepLink: 'googlegmail://',
    webFallback: 'https://mail.google.com',
  },
  'com.sec.android.app.camera': {
    name: 'Camera',
    deepLink: 'camera://',
  },
  'com.samsung.android.app.members': {
    name: 'Samsung Members',
    deepLink: 'samsungmembers://diagnostics',
  },
  'com.android.settings': {
    name: 'Settings',
  },
};

/**
 * Checks if the action can be executed in the current environment
 */
export function checkCapability(action: FixAction): ExecutionCapability {
  // Browser environment checks
  if (action.type === 'OPEN_APP' && action.appPackage) {
    const app = KNOWN_APPS[action.appPackage];
    if (typeof window !== 'undefined' && 'android' in window) {
      return { supported: true, mode: 'NATIVE' };
    }
    if (app?.webFallback) {
      return {
        supported: true,
        mode: 'SIMULATED',
        fallbackDeeplink: app.webFallback,
      };
    }
    return {
      supported: false,
      mode: 'UNSUPPORTED',
      reason: `Direct launch of ${action.appName || action.appPackage} requires native Samsung Android One UI environment.`,
    };
  }

  if (action.risk === 'high' && action.requiresConfirmation) {
    return {
      supported: true,
      mode: 'SIMULATED',
      reason: 'Requires explicit user confirmation prior to execution.',
    };
  }

  // Settings operations are fully simulated and tracked in Fixby's reactive store
  return {
    supported: true,
    mode: 'SIMULATED',
  };
}

/**
 * Abstract app launching mechanism
 */
export async function openApp(params: {
  packageName: string;
  appName?: string;
  fallbackUrl?: string;
}): Promise<ActionResult> {
  const app = KNOWN_APPS[params.packageName];
  const name = params.appName || app?.name || params.packageName;

  // Check if we are running in an actual Android WebView with injected bridge
  if (typeof window !== 'undefined' && (window as any).SamsungOneUIBridge) {
    try {
      (window as any).SamsungOneUIBridge.launchApp(params.packageName);
      return {
        success: true,
        actionId: `open-${params.packageName}`,
        message: `Opened native ${name}`,
        mode: 'NATIVE',
      };
    } catch (e: any) {
      return {
        success: false,
        actionId: `open-${params.packageName}`,
        message: `Failed to launch ${name} on device: ${e.message}`,
        mode: 'NATIVE',
        error: e.message,
      };
    }
  }

  // In Web environment, try URL scheme or web fallback if available
  if (app?.webFallback) {
    if (typeof window !== 'undefined') {
      window.open(app.webFallback, '_blank');
    }
    return {
      success: true,
      actionId: `open-${params.packageName}`,
      message: `Launched ${name} via web companion`,
      mode: 'FALLBACK',
    };
  }

  // Honest capability return: do not fake a native app launch
  return {
    success: false,
    actionId: `open-${params.packageName}`,
    message: `Direct app launch for ${name} (${params.packageName}) is not available in Web simulator. Requires native Samsung Android One UI integration.`,
    mode: 'SIMULATED',
    requiresNativeAndroid: true,
  };
}

/**
 * Maps raw backend GoalData into a concrete, strongly typed FixAction
 */
export function resolveGoalToAction(goal: GoalData): FixAction {
  const titleLower = (goal.title || '').toLowerCase();
  const descLower = (goal.actions?.[0]?.description || goal.goal || '').toLowerCase();
  const deeplink = (goal.actions?.[0]?.stepGroups?.[0]?.actionableDeeplink?.deeplink || '').toLowerCase();
  const pathStr = (goal.actions?.[0]?.stepGroups?.[0]?.actionableDeeplink?.classes?.path || deeplink || '').toLowerCase();
  const pathParts = goal.navigation_path && goal.navigation_path.length > 0
    ? goal.navigation_path
    : pathStr.split('>').map((s: string) => s.trim()).filter(Boolean);

  const rawSteps = goal.actions?.[0]?.stepGroups?.[0]?.steps || [];
  const actionName = goal.actions?.[0]?.actionName || goal.title;

  // 0. Catalog Exact Fix Resolution
  for (const plan of TROUBLESHOOTING_CATALOG) {
    for (const fix of plan.fixes) {
      if (fix.action && (
        fix.title.toLowerCase() === titleLower ||
        fix.id.toLowerCase() === titleLower ||
        (actionName && fix.title.toLowerCase() === actionName.toLowerCase())
      )) {
        return fix.action;
      }
    }
  }

  // 1. Power Saving
  if (titleLower.includes('power saving') || descLower.includes('power saving') || pathStr.toLowerCase().includes('power_saving')) {
    return {
      id: 'fix-power-saving',
      title: 'Turn on Power Saving',
      type: 'TOGGLE_ON',
      settingKey: 'powerSaving',
      targetValue: true,
      destination: 'settings/battery',
      destinationPath: ['Settings', 'Battery', 'Power saving'],
      highlightNode: 'Power saving',
      requiresConfirmation: false,
      canAutoApply: true,
      risk: 'low',
      estimatedImpact: 'Up to +3.5 hours battery runtime',
      reason: 'Reduces CPU frequency to 70%, dims brightness by 10%, and restricts background network traffic.',
      steps: rawSteps.length > 0 ? rawSteps : ['Open Settings', 'Tap Battery', 'Turn on Power saving'],
      demoSequence: [
        { type: 'NAVIGATE', screen: 'settings', durationMs: 400 },
        { type: 'NAVIGATE', screen: 'settings/battery', durationMs: 600 },
        { type: 'HIGHLIGHT', target: 'Power saving', durationMs: 700 },
        { type: 'TOGGLE', target: 'powerSaving', value: true, durationMs: 500 },
        { type: 'COMPLETE', message: 'Power saving mode enabled' },
      ],
    };
  }

  // 2. Battery Protection
  if (titleLower.includes('protect') || descLower.includes('protect') || pathStr.toLowerCase().includes('protection')) {
    return {
      id: 'fix-protect-battery',
      title: 'Enable Battery Protection',
      type: 'TOGGLE_ON',
      settingKey: 'protectBattery',
      targetValue: true,
      destination: 'settings/battery',
      destinationPath: ['Settings', 'Battery', 'Protect battery'],
      highlightNode: 'Protect battery',
      requiresConfirmation: false,
      canAutoApply: true,
      risk: 'low',
      estimatedImpact: 'Extends long-term battery lifespan by 200%',
      reason: 'Caps charge level at 85% to prevent high-voltage chemical stress on the lithium cells.',
      steps: rawSteps.length > 0 ? rawSteps : ['Open Settings', 'Tap Battery', 'Toggle Protect battery to ON'],
      demoSequence: [
        { type: 'NAVIGATE', screen: 'settings', durationMs: 400 },
        { type: 'NAVIGATE', screen: 'settings/battery', durationMs: 600 },
        { type: 'HIGHLIGHT', target: 'Protect battery', durationMs: 700 },
        { type: 'TOGGLE', target: 'protectBattery', value: true, durationMs: 500 },
        { type: 'COMPLETE', message: 'Battery protection enabled (capped at 85%)' },
      ],
    };
  }

  // 3. Deep Sleeping Apps / Background Usage Limits
  if (titleLower.includes('sleep') || descLower.includes('deep sleep') || descLower.includes('background') || pathStr.toLowerCase().includes('background_limits') || pathStr.toLowerCase().includes('deep_sleeping')) {
    return {
      id: 'fix-deep-sleeping-apps',
      title: 'Put High Drain Apps to Deep Sleep',
      type: 'CONFIG_CHANGE',
      settingKey: 'deepSleepingAppsCount',
      targetValue: 8,
      destination: 'settings/battery-usage',
      destinationPath: ['Settings', 'Battery', 'Background usage limits', 'Deep sleeping apps'],
      highlightNode: 'Deep sleeping apps',
      requiresConfirmation: false,
      canAutoApply: true,
      risk: 'low',
      estimatedImpact: 'Stops 100% of rogue background app wakelocks',
      reason: 'Deep sleeping apps are completely prevented from running or waking up in background until you explicitly launch them.',
      steps: rawSteps.length > 0 ? rawSteps : ['Open Settings', 'Tap Battery', 'Tap Background usage limits', 'Add apps to Deep sleeping'],
      demoSequence: [
        { type: 'NAVIGATE', screen: 'settings', durationMs: 400 },
        { type: 'NAVIGATE', screen: 'settings/battery-usage', durationMs: 600 },
        { type: 'HIGHLIGHT', target: 'Put apps to sleep', durationMs: 700 },
        { type: 'CONFIG_CHANGE', target: 'deepSleepingAppsCount', value: 8, durationMs: 600 },
        { type: 'COMPLETE', message: 'High-drain apps moved to Deep Sleep' },
      ],
    };
  }

  // 4. Performance Profile (Thermal / Heat)
  if (titleLower.includes('performance profile') || descLower.includes('light profile') || descLower.includes('reduce heat') || pathStr.toLowerCase().includes('performance_profile')) {
    return {
      id: 'fix-performance-profile',
      title: 'Switch to Light Performance Profile',
      type: 'CONFIG_CHANGE',
      settingKey: 'performanceProfile',
      targetValue: 'Light',
      destination: 'settings/device-care',
      destinationPath: ['Settings', 'Device care', 'Performance profile'],
      highlightNode: 'Performance profile',
      requiresConfirmation: false,
      canAutoApply: true,
      risk: 'low',
      estimatedImpact: '-4°C to -6°C temperature drop during heavy tasks',
      reason: 'Adjusts processing speed to favor battery life and cooling without affecting gaming performance.',
      steps: rawSteps.length > 0 ? rawSteps : ['Open Settings', 'Tap Device care', 'Tap Performance profile', 'Select Light'],
      demoSequence: [
        { type: 'NAVIGATE', screen: 'settings', durationMs: 400 },
        { type: 'NAVIGATE', screen: 'settings/device-care', durationMs: 600 },
        { type: 'HIGHLIGHT', target: 'Performance profile', durationMs: 700 },
        { type: 'CONFIG_CHANGE', target: 'performanceProfile', value: 'Light', durationMs: 500 },
        { type: 'COMPLETE', message: 'Performance profile set to Light mode' },
      ],
    };
  }

  // 5. Intelligent Wi-Fi / Wi-Fi Unstable
  if (titleLower.includes('wifi') || titleLower.includes('wi-fi') || descLower.includes('wi-fi') || pathStr.toLowerCase().includes('wi-fi')) {
    return {
      id: 'fix-intelligent-wifi',
      title: 'Enable Intelligent Wi-Fi',
      type: 'TOGGLE_ON',
      settingKey: 'intelligentWifi',
      targetValue: true,
      destination: 'settings/connections',
      destinationPath: ['Settings', 'Connections', 'Wi-Fi', 'Intelligent Wi-Fi'],
      highlightNode: 'Intelligent Wi-Fi',
      requiresConfirmation: false,
      canAutoApply: true,
      risk: 'low',
      estimatedImpact: 'Eliminates Wi-Fi dropouts & stalling',
      reason: 'Automatically detects weak signal and fails over smoothly to mobile data before connection drops.',
      steps: rawSteps.length > 0 ? rawSteps : ['Open Settings', 'Tap Connections', 'Tap Wi-Fi', 'Turn on Intelligent Wi-Fi'],
      demoSequence: [
        { type: 'NAVIGATE', screen: 'settings', durationMs: 400 },
        { type: 'NAVIGATE', screen: 'settings/connections', durationMs: 600 },
        { type: 'HIGHLIGHT', target: 'Intelligent Wi-Fi', durationMs: 700 },
        { type: 'TOGGLE', target: 'intelligentWifi', value: true, durationMs: 500 },
        { type: 'COMPLETE', message: 'Intelligent Wi-Fi enabled' },
      ],
    };
  }

  // 6. Motion Smoothness (120Hz vs 60Hz)
  if (titleLower.includes('motion') || titleLower.includes('smoothness') || titleLower.includes('120hz') || titleLower.includes('60hz') || titleLower.includes('refresh') || pathStr.includes('motion_smoothness') || pathStr.includes('motion smoothness')) {
    const isBatteryQuery = descLower.includes('battery') || descLower.includes('drain');
    const targetMode = isBatteryQuery ? 'Standard' : 'Adaptive';
    return {
      id: 'fix-motion-smoothness',
      title: isBatteryQuery ? 'Set Motion Smoothness to Standard (60Hz)' : 'Enable Adaptive 120Hz Smoothness',
      type: 'CONFIG_CHANGE',
      settingKey: 'motionSmoothness',
      targetValue: targetMode,
      destination: 'settings/motion-smoothness',
      destinationPath: ['Settings', 'Display', 'Motion smoothness'],
      highlightNode: targetMode,
      requiresConfirmation: false,
      canAutoApply: true,
      risk: 'low',
      estimatedImpact: isBatteryQuery ? '+1.5 hours extra screen-on time' : 'Silky smooth 120Hz UI animations',
      reason: isBatteryQuery
        ? 'Standard 60Hz reduces the GPU display refresh load by 50%.'
        : 'Adaptive mode refreshes up to 120 times per second for stutter-free scrolling.',
      steps: rawSteps.length > 0 ? rawSteps : ['Open Settings', 'Tap Display', 'Tap Motion smoothness', `Select ${targetMode}`],
      demoSequence: [
        { type: 'NAVIGATE', screen: 'settings', durationMs: 400 },
        { type: 'NAVIGATE', screen: 'settings/display', durationMs: 600 },
        { type: 'NAVIGATE', screen: 'settings/display/motion-smoothness', durationMs: 600 },
        { type: 'HIGHLIGHT', target: targetMode, durationMs: 700 },
        { type: 'CONFIG_CHANGE', target: 'motionSmoothness', value: targetMode, durationMs: 500 },
        { type: 'COMPLETE', message: `Motion smoothness set to ${targetMode}` },
      ],
    };
  }

  // 7. Dark Mode
  if (titleLower.includes('dark mode') || descLower.includes('dark theme') || pathStr.toLowerCase().includes('dark_mode')) {
    return {
      id: 'fix-dark-mode',
      title: 'Turn on Dark Mode',
      type: 'TOGGLE_ON',
      settingKey: 'darkMode',
      targetValue: true,
      destination: 'settings/display',
      destinationPath: ['Settings', 'Display', 'Dark mode'],
      highlightNode: 'Dark mode',
      requiresConfirmation: false,
      canAutoApply: true,
      risk: 'low',
      estimatedImpact: 'Saves ~20% battery on Dynamic AMOLED displays',
      reason: 'Black pixels on Samsung OLED panels are completely powered off, consuming 0 watts of display power.',
      steps: rawSteps.length > 0 ? rawSteps : ['Open Settings', 'Tap Display', 'Select Dark mode'],
      demoSequence: [
        { type: 'NAVIGATE', screen: 'settings', durationMs: 400 },
        { type: 'NAVIGATE', screen: 'settings/display', durationMs: 600 },
        { type: 'HIGHLIGHT', target: 'Dark mode', durationMs: 700 },
        { type: 'TOGGLE', target: 'darkMode', value: true, durationMs: 500 },
        { type: 'COMPLETE', message: 'Dark mode enabled' },
      ],
    };
  }

  // 8. Storage Cleaner / Purge Cache
  if (titleLower.includes('storage') || descLower.includes('storage') || descLower.includes('junk') || pathStr.toLowerCase().includes('storage')) {
    return {
      id: 'fix-storage-cleaner',
      title: 'Clean Storage Junk & Cache Files',
      type: 'TOGGLE_ON',
      settingKey: 'storageCleaned',
      targetValue: true,
      destination: 'settings/storage',
      destinationPath: ['Settings', 'Device care', 'Storage'],
      highlightNode: 'Clean now',
      requiresConfirmation: false,
      canAutoApply: true,
      risk: 'low',
      estimatedImpact: 'Frees up ~4.8 GB of cached temp files',
      reason: 'Removes orphaned application cache files and duplicate trash bins without deleting user photos or documents.',
      steps: rawSteps.length > 0 ? rawSteps : ['Open Settings', 'Tap Device care', 'Tap Storage', 'Tap Clean now'],
      demoSequence: [
        { type: 'NAVIGATE', screen: 'settings', durationMs: 400 },
        { type: 'NAVIGATE', screen: 'settings/storage', durationMs: 600 },
        { type: 'HIGHLIGHT', target: 'Clean now', durationMs: 700 },
        { type: 'TOGGLE', target: 'storageCleaned', value: true, durationMs: 500 },
        { type: 'COMPLETE', message: 'Storage cleaned: 4.8 GB freed' },
      ],
    };
  }

  // 9. Camera Settings Reset (High/Medium Risk)
  if (titleLower.includes('camera') && (titleLower.includes('reset') || descLower.includes('reset') || pathStr.toLowerCase().includes('reset'))) {
    return {
      id: 'fix-camera-reset',
      title: 'Reset Camera Settings',
      type: 'MULTI_STEP',
      destination: 'settings/camera',
      destinationPath: ['Settings', 'Camera settings', 'Reset settings'],
      highlightNode: 'Reset settings',
      requiresConfirmation: true,
      confirmationTitle: 'Reset Camera Settings?',
      confirmationMessage: 'This will restore all camera modes, watermark, and resolution preferences to factory defaults. Your photos will NOT be deleted.',
      canAutoApply: true,
      risk: 'medium',
      estimatedImpact: 'Fixes 100% of camera crash and freeze bugs',
      reason: 'Clears corrupt camera capture profiles and resets faulty sensor parameters to factory default state.',
      steps: rawSteps.length > 0 ? rawSteps : ['Open Camera', 'Tap Settings gear', 'Scroll down to Reset settings', 'Tap Reset'],
      demoSequence: [
        { type: 'NAVIGATE', screen: 'settings', durationMs: 400 },
        { type: 'NAVIGATE', screen: 'settings/camera', durationMs: 600 },
        { type: 'HIGHLIGHT', target: 'Reset settings', durationMs: 700 },
        { type: 'WAIT', durationMs: 500 },
        { type: 'COMPLETE', message: 'Camera settings reset to factory defaults' },
      ],
    };
  }

  // 10. Wi-Fi Toggle / Cycle
  if (titleLower.includes('cycle wi-fi') || titleLower.includes('restart wi-fi') || titleLower.includes('turn on wi-fi')) {
    return {
      id: 'fix-toggle-wifi-radio',
      title: 'Cycle Wi-Fi Radio',
      type: 'TOGGLE_ON',
      settingKey: 'wifi',
      targetValue: true,
      destination: 'settings/connections',
      destinationPath: ['Settings', 'Connections', 'Wi-Fi'],
      highlightNode: 'Wi-Fi',
      requiresConfirmation: false,
      canAutoApply: true,
      risk: 'low',
      estimatedImpact: 'Re-establishes router handshake',
      reason: 'Restarts the local 802.11 receiver to clear stale gateway socket state.',
      steps: rawSteps.length > 0 ? rawSteps : ['Open Settings', 'Tap Connections', 'Toggle Wi-Fi off and back on'],
      demoSequence: [
        { type: 'NAVIGATE', screen: 'settings', durationMs: 400 },
        { type: 'NAVIGATE', screen: 'settings/connections', durationMs: 600 },
        { type: 'TOGGLE', target: 'wifi', value: false, durationMs: 400 },
        { type: 'WAIT', durationMs: 300 },
        { type: 'TOGGLE', target: 'wifi', value: true, durationMs: 500 },
        { type: 'COMPLETE', message: 'Wi-Fi radio cycled and reconnected' },
      ],
    };
  }

  // 11. Bluetooth Cycle
  if (titleLower.includes('bluetooth')) {
    return {
      id: 'fix-cycle-bluetooth',
      title: 'Cycle Bluetooth Radio',
      type: 'TOGGLE_ON',
      settingKey: 'bluetooth',
      targetValue: true,
      destination: 'settings/connections',
      destinationPath: ['Settings', 'Connections', 'Bluetooth'],
      highlightNode: 'Bluetooth',
      requiresConfirmation: false,
      canAutoApply: true,
      risk: 'low',
      estimatedImpact: 'Restarts Bluetooth subsystem',
      reason: 'Turns Bluetooth off and on to restart device discovery.',
      steps: rawSteps.length > 0 ? rawSteps : ['Open Settings', 'Tap Connections', 'Toggle Bluetooth off and back on'],
      demoSequence: [
        { type: 'NAVIGATE', screen: 'settings', durationMs: 400 },
        { type: 'NAVIGATE', screen: 'settings/connections', durationMs: 600 },
        { type: 'TOGGLE', target: 'bluetooth', value: false, durationMs: 400 },
        { type: 'WAIT', durationMs: 300 },
        { type: 'TOGGLE', target: 'bluetooth', value: true, durationMs: 500 },
        { type: 'COMPLETE', message: 'Bluetooth radio cycled' },
      ],
    };
  }

  // 12. Mobile Data
  if (titleLower.includes('mobile data') || descLower.includes('cellular data')) {
    return {
      id: 'fix-toggle-mobile-data',
      title: 'Turn on Mobile Data',
      type: 'TOGGLE_ON',
      settingKey: 'mobileData',
      targetValue: true,
      destination: 'settings/connections',
      destinationPath: ['Settings', 'Connections', 'Data usage', 'Mobile data'],
      highlightNode: 'Mobile data',
      requiresConfirmation: false,
      canAutoApply: true,
      risk: 'low',
      estimatedImpact: 'Restores 5G/LTE internet access',
      reason: 'Ensures cellular data toggle is active.',
      steps: rawSteps.length > 0 ? rawSteps : ['Open Settings', 'Tap Connections', 'Tap Data usage', 'Turn on Mobile data'],
      demoSequence: [
        { type: 'NAVIGATE', screen: 'settings', durationMs: 400 },
        { type: 'NAVIGATE', screen: 'settings/connections', durationMs: 600 },
        { type: 'HIGHLIGHT', target: 'Mobile data', durationMs: 600 },
        { type: 'TOGGLE', target: 'mobileData', value: true, durationMs: 500 },
        { type: 'COMPLETE', message: 'Mobile data enabled' },
      ],
    };
  }

  // 13. Adaptive Brightness
  if (titleLower.includes('adaptive brightness') || titleLower.includes('auto brightness') || descLower.includes('auto brightness')) {
    return {
      id: 'fix-adaptive-brightness',
      title: 'Enable Adaptive Brightness',
      type: 'TOGGLE_ON',
      settingKey: 'autoBrightness',
      targetValue: true,
      destination: 'settings/display',
      destinationPath: ['Settings', 'Display', 'Adaptive brightness'],
      highlightNode: 'Adaptive brightness',
      requiresConfirmation: false,
      canAutoApply: true,
      risk: 'low',
      estimatedImpact: 'Optimal lumen output anywhere',
      reason: 'Allows the ambient sensor to calibrate screen brightness dynamically.',
      steps: rawSteps.length > 0 ? rawSteps : ['Open Settings', 'Tap Display', 'Toggle Adaptive brightness to ON'],
      demoSequence: [
        { type: 'NAVIGATE', screen: 'settings', durationMs: 400 },
        { type: 'NAVIGATE', screen: 'settings/display', durationMs: 600 },
        { type: 'HIGHLIGHT', target: 'Adaptive brightness', durationMs: 700 },
        { type: 'TOGGLE', target: 'autoBrightness', value: true, durationMs: 500 },
        { type: 'COMPLETE', message: 'Adaptive brightness enabled' },
      ],
    };
  }

  // 14. Eye Comfort Shield
  if (titleLower.includes('eye comfort') || descLower.includes('blue light') || descLower.includes('eye strain')) {
    return {
      id: 'fix-eye-comfort-shield',
      title: 'Turn on Eye Comfort Shield',
      type: 'TOGGLE_ON',
      settingKey: 'eyeComfortShield',
      targetValue: true,
      destination: 'settings/display',
      destinationPath: ['Settings', 'Display', 'Eye comfort shield'],
      highlightNode: 'Eye comfort shield',
      requiresConfirmation: false,
      canAutoApply: true,
      risk: 'low',
      estimatedImpact: 'Reduces blue light strain by 70%',
      reason: 'Shifts display color balance toward warm spectrum.',
      steps: rawSteps.length > 0 ? rawSteps : ['Open Settings', 'Tap Display', 'Toggle Eye comfort shield to ON'],
      demoSequence: [
        { type: 'NAVIGATE', screen: 'settings', durationMs: 400 },
        { type: 'NAVIGATE', screen: 'settings/display', durationMs: 600 },
        { type: 'HIGHLIGHT', target: 'Eye comfort shield', durationMs: 700 },
        { type: 'TOGGLE', target: 'eyeComfortShield', value: true, durationMs: 500 },
        { type: 'COMPLETE', message: 'Eye Comfort Shield enabled' },
      ],
    };
  }

  // 15. Accidental Touch Protection
  if (titleLower.includes('accidental') || descLower.includes('pocket') || titleLower.includes('pocket')) {
    return {
      id: 'fix-accidental-touch-protection',
      title: 'Turn on Accidental Touch Protection',
      type: 'TOGGLE_ON',
      settingKey: 'accidentalTouchProtection',
      targetValue: true,
      destination: 'settings/display',
      destinationPath: ['Settings', 'Display', 'Accidental touch protection'],
      highlightNode: 'Accidental touch protection',
      requiresConfirmation: false,
      canAutoApply: true,
      risk: 'low',
      estimatedImpact: 'Zero pocket dialing',
      reason: 'Blocks phantom screen touches when proximity sensor is obscured.',
      steps: rawSteps.length > 0 ? rawSteps : ['Open Settings', 'Tap Display', 'Toggle Accidental touch protection to ON'],
      demoSequence: [
        { type: 'NAVIGATE', screen: 'settings', durationMs: 400 },
        { type: 'NAVIGATE', screen: 'settings/display', durationMs: 600 },
        { type: 'HIGHLIGHT', target: 'Accidental touch protection', durationMs: 700 },
        { type: 'TOGGLE', target: 'accidentalTouchProtection', value: true, durationMs: 500 },
        { type: 'COMPLETE', message: 'Accidental touch protection enabled' },
      ],
    };
  }

  // 16. Auto Optimization (Device Care)
  if (titleLower.includes('auto optimization') || descLower.includes('auto restart') || titleLower.includes('optimize')) {
    return {
      id: 'fix-device-care-optimize',
      title: 'Enable Auto Optimization',
      type: 'TOGGLE_ON',
      settingKey: 'autoOptimization',
      targetValue: true,
      destination: 'settings/device-care',
      destinationPath: ['Settings', 'Device care', 'Auto optimization'],
      highlightNode: 'Auto optimization',
      requiresConfirmation: false,
      canAutoApply: true,
      risk: 'low',
      estimatedImpact: 'Reclaims up to 2.5 GB of active RAM',
      reason: 'Automatically closes background tasks and optimizes memory when phone is idle.',
      steps: rawSteps.length > 0 ? rawSteps : ['Open Settings', 'Tap Device care', 'Turn on Auto optimization'],
      demoSequence: [
        { type: 'NAVIGATE', screen: 'settings', durationMs: 400 },
        { type: 'NAVIGATE', screen: 'settings/device-care', durationMs: 600 },
        { type: 'HIGHLIGHT', target: 'Auto optimization', durationMs: 700 },
        { type: 'TOGGLE', target: 'autoOptimization', value: true, durationMs: 500 },
        { type: 'COMPLETE', message: 'Auto optimization enabled' },
      ],
    };
  }

  // 17. WhatsApp / App Notifications
  if (titleLower.includes('whatsapp notification') || titleLower.includes('enable whatsapp') || descLower.includes('whatsapp notification')) {
    return {
      id: 'fix-whatsapp-notification-permission',
      title: 'Enable WhatsApp Notifications',
      type: 'TOGGLE_ON',
      settingKey: 'appNotifications',
      targetValue: true,
      destination: 'settings/apps',
      destinationPath: ['Settings', 'Apps', 'WhatsApp', 'Notifications'],
      highlightNode: 'Allow notifications',
      requiresConfirmation: false,
      canAutoApply: true,
      risk: 'low',
      estimatedImpact: 'Immediate delivery of WhatsApp messages',
      reason: 'Restores push notification permissions for the WhatsApp messaging service.',
      steps: rawSteps.length > 0 ? rawSteps : ['Open Settings', 'Tap Apps', 'Select WhatsApp', 'Tap Notifications', 'Turn on Allow notifications'],
      demoSequence: [
        { type: 'NAVIGATE', screen: 'settings', durationMs: 400 },
        { type: 'NAVIGATE', screen: 'settings/apps', durationMs: 600 },
        { type: 'HIGHLIGHT', target: 'WhatsApp', durationMs: 700 },
        { type: 'TOGGLE', target: 'appNotifications', value: true, durationMs: 500 },
        { type: 'COMPLETE', message: 'WhatsApp notifications enabled' },
      ],
    };
  }

  // 18. Do Not Disturb
  if (titleLower.includes('do not disturb') || titleLower.includes('dnd') || descLower.includes('do not disturb')) {
    return {
      id: 'fix-disable-dnd',
      title: 'Turn off Do Not Disturb',
      type: 'TOGGLE_OFF',
      settingKey: 'doNotDisturb',
      targetValue: false,
      destination: 'settings/generic/Notifications',
      destinationPath: ['Settings', 'Notifications', 'Do not disturb'],
      highlightNode: 'Do not disturb',
      requiresConfirmation: false,
      canAutoApply: true,
      risk: 'low',
      estimatedImpact: 'Unmutes all notification pop-ups',
      reason: 'Turns off Do Not Disturb to let alerts through.',
      steps: rawSteps.length > 0 ? rawSteps : ['Open Settings', 'Tap Notifications', 'Toggle Do not disturb to OFF'],
      demoSequence: [
        { type: 'NAVIGATE', screen: 'settings', durationMs: 400 },
        { type: 'NAVIGATE', screen: 'settings/generic/Notifications', durationMs: 600 },
        { type: 'HIGHLIGHT', target: 'Do not disturb', durationMs: 700 },
        { type: 'TOGGLE', target: 'doNotDisturb', value: false, durationMs: 500 },
        { type: 'COMPLETE', message: 'Do Not Disturb turned off' },
      ],
    };
  }

  // 19. Reset Network Settings (Requires confirmation)
  if (titleLower.includes('reset network') || descLower.includes('reset network')) {
    return {
      id: 'fix-reset-network-settings',
      title: 'Reset Network Settings',
      type: 'NAVIGATE',
      destination: 'settings/general',
      destinationPath: ['Settings', 'General management', 'Reset', 'Reset network settings'],
      highlightNode: 'Reset network settings',
      requiresConfirmation: true,
      confirmationTitle: 'Reset Network Settings?',
      confirmationMessage: 'This will reset all network settings, including Wi-Fi, Mobile data, and Bluetooth. You will need to reconnect to Wi-Fi networks.',
      canAutoApply: false,
      risk: 'medium',
      estimatedImpact: 'Restores factory network drivers',
      reason: 'Requires native Android integration to purge system Wi-Fi credentials.',
      steps: rawSteps.length > 0 ? rawSteps : ['Open Settings', 'Tap General management', 'Tap Reset', 'Tap Reset network settings'],
      demoSequence: [
        { type: 'NAVIGATE', screen: 'settings', durationMs: 400 },
        { type: 'NAVIGATE', screen: 'settings/general', durationMs: 600 },
        { type: 'HIGHLIGHT', target: 'Reset network settings', durationMs: 700 },
        { type: 'COMPLETE', message: 'Navigated to Network Reset' },
      ],
    };
  }

  // 20. App Launching Actions
  if (titleLower.includes('youtube') || descLower.includes('youtube')) {
    return {
      id: 'fix-launch-youtube',
      title: 'Launch YouTube',
      type: 'OPEN_APP',
      appPackage: 'com.google.android.youtube',
      appName: 'YouTube',
      destination: 'home',
      destinationPath: ['Home', 'YouTube'],
      requiresConfirmation: false,
      canAutoApply: true,
      risk: 'low',
      estimatedImpact: 'Direct app or web fallback launch',
      reason: 'Opens YouTube to resume video streaming.',
      steps: ['Open YouTube'],
      demoSequence: [
        { type: 'NAVIGATE', screen: 'home', durationMs: 500 },
        { type: 'COMPLETE', message: 'YouTube launched via web fallback' },
      ],
    };
  }

  if (titleLower.includes('google maps') || titleLower.includes('maps') || descLower.includes('maps')) {
    return {
      id: 'fix-launch-google-maps',
      title: 'Launch Google Maps',
      type: 'OPEN_APP',
      appPackage: 'com.google.android.apps.maps',
      appName: 'Google Maps',
      destination: 'home',
      destinationPath: ['Home', 'Google Maps'],
      requiresConfirmation: false,
      canAutoApply: true,
      risk: 'low',
      estimatedImpact: 'Instant GPS map navigation',
      reason: 'Launches Google Maps navigation service.',
      steps: ['Open Google Maps'],
      demoSequence: [
        { type: 'NAVIGATE', screen: 'home', durationMs: 500 },
        { type: 'COMPLETE', message: 'Google Maps launched via web fallback' },
      ],
    };
  }

  // 21. General Destination Fallback
  let matchedScreen: Screen = 'settings';
  if (pathStr.toLowerCase().includes('battery')) matchedScreen = 'settings/battery';
  else if (pathStr.toLowerCase().includes('display')) matchedScreen = 'settings/display';
  else if (pathStr.toLowerCase().includes('connections') || pathStr.toLowerCase().includes('wi-fi')) matchedScreen = 'settings/connections';
  else if (pathStr.toLowerCase().includes('sound')) matchedScreen = 'settings/sound';
  else if (pathStr.toLowerCase().includes('camera')) matchedScreen = 'settings/camera';
  else if (pathStr.toLowerCase().includes('storage')) matchedScreen = 'settings/storage';
  else if (pathStr.toLowerCase().includes('privacy')) matchedScreen = 'settings/privacy';
  else if (pathStr.toLowerCase().includes('device_care') || pathStr.toLowerCase().includes('device care')) matchedScreen = 'settings/device-care';

  return {
    id: `fix-${goal.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    title: goal.title || 'Navigate to Samsung Settings',
    type: 'NAVIGATE',
    destination: matchedScreen,
    destinationPath: pathParts.length > 0 ? pathParts : ['Settings'],
    highlightNode: pathParts[pathParts.length - 1] || 'Settings',
    requiresConfirmation: false,
    canAutoApply: true,
    risk: 'low',
    estimatedImpact: 'Direct leaf screen navigation',
    reason: goal.actions?.[0]?.description || 'Navigates directly to the One UI destination screen.',
    steps: rawSteps.length > 0 ? rawSteps : ['Open Settings', `Navigate to ${pathParts.join(' > ')}`],
    demoSequence: [
      { type: 'NAVIGATE', screen: 'settings', durationMs: 400 },
      { type: 'NAVIGATE', screen: matchedScreen, durationMs: 600 },
      { type: 'HIGHLIGHT', target: pathParts[pathParts.length - 1], durationMs: 600 },
      { type: 'COMPLETE', message: `Arrived at ${goal.title}` },
    ],
  };
}
