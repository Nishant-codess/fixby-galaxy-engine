/**
 * src/settings/navigation.ts
 * Samsung One UI Navigation & Deep Link Resolver
 * Maps authentic One UI paths and bixby:// deep links to simulator screens and leaf targets.
 */

import { Screen } from '../hooks/usePhoneNavigation';
import { DeviceSettingKey, SETTING_DEFINITIONS } from './definitions';

export interface ResolvedNavigation {
  screen: Screen;
  targetNode?: string;
  settingKey?: DeviceSettingKey;
  path: string[];
}

export function resolveSettingsPath(pathOrDeeplink: string | string[]): ResolvedNavigation {
  let pathSegments: string[] = [];

  if (Array.isArray(pathOrDeeplink)) {
    pathSegments = pathOrDeeplink;
  } else if (pathOrDeeplink.startsWith('bixby://settings/')) {
    const rawPath = pathOrDeeplink.replace('bixby://settings/', '');
    pathSegments = ['Settings', ...rawPath.split('/').map(p => p.replace(/_/g, ' '))];
  } else if (pathOrDeeplink.includes('>')) {
    pathSegments = pathOrDeeplink.split('>').map(s => s.trim()).filter(Boolean);
  } else {
    pathSegments = [pathOrDeeplink];
  }

  const pathStr = pathSegments.join(' > ').toLowerCase();
  const leafNode = pathSegments[pathSegments.length - 1] || 'Settings';

  // 1. Battery & Power
  if (pathStr.includes('battery usage') || pathStr.includes('deep sleeping') || pathStr.includes('background limits') || pathStr.includes('background usage')) {
    return {
      screen: 'settings/battery-usage',
      targetNode: leafNode,
      settingKey: pathStr.includes('deep') ? 'deepSleepingAppsCount' : 'batteryOptimized',
      path: pathSegments,
    };
  }
  if (pathStr.includes('battery') || pathStr.includes('power saving') || pathStr.includes('protect battery')) {
    return {
      screen: 'settings/battery',
      targetNode: leafNode,
      settingKey: pathStr.includes('power saving') ? 'powerSaving' : pathStr.includes('protect') ? 'protectBattery' : undefined,
      path: pathSegments,
    };
  }

  // 2. Display & Motion
  if (pathStr.includes('motion smoothness') || pathStr.includes('refresh rate') || pathStr.includes('120hz')) {
    return {
      screen: 'settings/motion-smoothness',
      targetNode: leafNode,
      settingKey: 'motionSmoothness',
      path: pathSegments,
    };
  }
  if (pathStr.includes('display') || pathStr.includes('dark mode') || pathStr.includes('brightness') || pathStr.includes('eye comfort')) {
    return {
      screen: 'settings/display',
      targetNode: leafNode,
      settingKey: pathStr.includes('dark') ? 'darkMode' : pathStr.includes('bright') ? 'brightness' : undefined,
      path: pathSegments,
    };
  }

  // 3. Connections
  if (pathStr.includes('connection') || pathStr.includes('wi-fi') || pathStr.includes('wifi') || pathStr.includes('bluetooth') || pathStr.includes('nfc') || pathStr.includes('flight mode') || pathStr.includes('hotspot')) {
    return {
      screen: 'settings/connections',
      targetNode: leafNode,
      settingKey: pathStr.includes('wi-fi') || pathStr.includes('wifi') ? 'wifi' : pathStr.includes('bluetooth') ? 'bluetooth' : pathStr.includes('nfc') ? 'nfc' : undefined,
      path: pathSegments,
    };
  }

  // 4. Sounds & Vibration
  if (pathStr.includes('sound') || pathStr.includes('vibration') || pathStr.includes('volume') || pathStr.includes('ringtone') || pathStr.includes('dolby')) {
    return {
      screen: 'settings/sound',
      targetNode: leafNode,
      settingKey: pathStr.includes('dolby') ? 'dolbyAtmos' : 'soundMode',
      path: pathSegments,
    };
  }

  // 5. Camera
  if (pathStr.includes('camera')) {
    return {
      screen: 'settings/camera',
      targetNode: leafNode,
      settingKey: pathStr.includes('scene') ? 'sceneOptimizer' : pathStr.includes('hdr') ? 'autoHdr' : undefined,
      path: pathSegments,
    };
  }

  // 6. Device Care & Storage
  if (pathStr.includes('storage') || pathStr.includes('clean now')) {
    return {
      screen: 'settings/storage',
      targetNode: leafNode,
      settingKey: 'storageCleaned',
      path: pathSegments,
    };
  }
  if (pathStr.includes('device care') || pathStr.includes('performance profile') || pathStr.includes('auto optimization')) {
    return {
      screen: 'settings/device-care',
      targetNode: leafNode,
      settingKey: pathStr.includes('profile') ? 'performanceProfile' : 'autoOptimization',
      path: pathSegments,
    };
  }

  // 7. Privacy & Security
  if (pathStr.includes('privacy') || pathStr.includes('permission') || pathStr.includes('security')) {
    return {
      screen: 'settings/privacy',
      targetNode: leafNode,
      settingKey: pathStr.includes('camera') ? 'cameraAccess' : pathStr.includes('mic') ? 'microphoneAccess' : undefined,
      path: pathSegments,
    };
  }

  // 8. Advanced Features
  if (pathStr.includes('advanced') || pathStr.includes('game booster') || pathStr.includes('thermal')) {
    return {
      screen: 'settings/advanced',
      targetNode: leafNode,
      settingKey: pathStr.includes('thermal') ? 'gameBoosterThermal' : undefined,
      path: pathSegments,
    };
  }

  // 9. Root Settings fallback
  return {
    screen: 'settings',
    targetNode: leafNode,
    path: pathSegments,
  };
}
