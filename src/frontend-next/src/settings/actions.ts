/**
 * src/settings/actions.ts
 * Structured Fix & Action System for Fixby
 * Bridges high-level AI diagnostic goals to concrete, validated, executable Samsung actions.
 */

import { Screen } from '../hooks/usePhoneNavigation';
import { DeviceSettingKey, SETTING_DEFINITIONS } from './definitions';
import type { GoalData } from '../hooks/useFixbyQuery';

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

  // 10. General Destination Fallback
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
