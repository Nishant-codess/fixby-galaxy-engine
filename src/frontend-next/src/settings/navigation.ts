/**
 * src/settings/navigation.ts
 * Samsung One UI Navigation & Deep Link Resolver
 * Maps authentic One UI paths and bixby:// deep links to simulator screens and leaf targets.
 */

import { Screen } from '../hooks/usePhoneNavigation';
import { DeviceSettingKey } from './definitions';

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

  // Deepest path segment wins, and the longest phrase inside that segment wins.
  // A parent such as "Device care" cannot override a leaf such as "Storage".
  const rules: { phrase: string; screen: Screen; settingKey?: DeviceSettingKey }[] = [
    { phrase: 'battery usage', screen: 'settings/battery-usage', settingKey: 'batteryOptimized' },
    { phrase: 'deep sleeping', screen: 'settings/battery-usage', settingKey: 'deepSleepingAppsCount' },
    { phrase: 'background usage', screen: 'settings/battery-usage', settingKey: 'batteryOptimized' },
    { phrase: 'background limits', screen: 'settings/battery-usage', settingKey: 'batteryOptimized' },
    { phrase: 'power saving', screen: 'settings/battery', settingKey: 'powerSaving' },
    { phrase: 'battery protection', screen: 'settings/battery', settingKey: 'protectBattery' },
    { phrase: 'protect battery', screen: 'settings/battery', settingKey: 'protectBattery' },
    { phrase: 'charging', screen: 'settings/battery' },
    { phrase: 'wireless power', screen: 'settings/battery' },
    { phrase: 'battery', screen: 'settings/battery' },
    { phrase: 'motion smoothness', screen: 'settings/motion-smoothness', settingKey: 'motionSmoothness' },
    { phrase: 'refresh rate', screen: 'settings/motion-smoothness', settingKey: 'motionSmoothness' },
    { phrase: 'dark mode', screen: 'settings/display', settingKey: 'darkMode' },
    { phrase: 'eye comfort', screen: 'settings/display' },
    { phrase: 'brightness', screen: 'settings/display', settingKey: 'brightness' },
    { phrase: 'navigation bar', screen: 'settings/display' },
    { phrase: 'display', screen: 'settings/display' },
    { phrase: 'wi-fi', screen: 'settings/connections', settingKey: 'wifi' },
    { phrase: 'wifi', screen: 'settings/connections', settingKey: 'wifi' },
    { phrase: 'bluetooth', screen: 'settings/connections', settingKey: 'bluetooth' },
    { phrase: 'mobile data', screen: 'settings/connections' },
    { phrase: 'nfc', screen: 'settings/connections', settingKey: 'nfc' },
    { phrase: 'flight mode', screen: 'settings/connections' },
    { phrase: 'hotspot', screen: 'settings/connections' },
    { phrase: 'connection', screen: 'settings/connections' },
    { phrase: 'dolby', screen: 'settings/sound', settingKey: 'dolbyAtmos' },
    { phrase: 'ringtone', screen: 'settings/sound' },
    { phrase: 'vibration', screen: 'settings/sound', settingKey: 'soundMode' },
    { phrase: 'volume', screen: 'settings/sound' },
    { phrase: 'sound', screen: 'settings/sound', settingKey: 'soundMode' },
    { phrase: 'scene optimizer', screen: 'settings/camera', settingKey: 'sceneOptimizer' },
    { phrase: 'camera', screen: 'settings/camera', settingKey: pathStr.includes('hdr') ? 'autoHdr' : undefined },
    { phrase: 'storage', screen: 'settings/storage', settingKey: 'storageCleaned' },
    { phrase: 'performance profile', screen: 'settings/device-care', settingKey: 'performanceProfile' },
    { phrase: 'auto optimization', screen: 'settings/device-care', settingKey: 'autoOptimization' },
    { phrase: 'device care', screen: 'settings/device-care', settingKey: 'autoOptimization' },
    { phrase: 'memory', screen: 'settings/device-care' },
    { phrase: 'permission', screen: 'settings/privacy' },
    { phrase: 'fingerprint', screen: 'settings/privacy' },
    { phrase: 'privacy', screen: 'settings/privacy' },
    { phrase: 'security', screen: 'settings/privacy' },
    { phrase: 'thermal', screen: 'settings/advanced', settingKey: 'gameBoosterThermal' },
    { phrase: 'game booster', screen: 'settings/advanced', settingKey: 'gameBoosterThermal' },
    { phrase: 'notification', screen: 'settings/notifications' },
    { phrase: 'apps', screen: 'settings/apps' },
    { phrase: 'advanced', screen: 'settings/advanced' },
  ];

  let screen: Screen = 'settings';
  let settingKey: DeviceSettingKey | undefined;
  for (let i = pathSegments.length - 1; i >= 0; i--) {
    const segment = pathSegments[i].toLowerCase();
    let bestLen = 0;
    for (const rule of rules) {
      if (segment.includes(rule.phrase) && rule.phrase.length > bestLen) {
        bestLen = rule.phrase.length;
        screen = rule.screen;
        settingKey = rule.settingKey;
      }
    }
    if (bestLen > 0) break;
  }

  return {
    screen,
    targetNode: leafNode,
    settingKey,
    path: pathSegments,
  };
}
