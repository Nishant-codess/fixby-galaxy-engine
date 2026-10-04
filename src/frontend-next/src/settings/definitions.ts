/**
 * src/settings/definitions.ts
 * Centralized Samsung Galaxy One UI Device Settings Catalog & Schema
 * Defines the single source of truth for all reactive device settings in Fixby.
 */

import { Screen } from '../hooks/usePhoneNavigation';

export type MotionSmoothnessMode = 'Adaptive' | 'Standard';
export type PerformanceProfileMode = 'Standard' | 'Light';
export type SoundMode = 'sound' | 'vibrate' | 'mute';
export type ScreenTimeoutSeconds = 15 | 30 | 60 | 120 | 300 | 600;

export interface DeviceSettingsState {
  // Battery & Power
  powerSaving: boolean;
  protectBattery: boolean;
  adaptiveBattery: boolean;
  deepSleepingAppsCount: number;
  batteryOptimized: boolean;
  batteryPercentage: number;
  wirelessPowerSharing: boolean;

  // Connectivity
  wifi: boolean;
  intelligentWifi: boolean;
  wifiCalling: boolean;
  bluetooth: boolean;
  nfc: boolean;
  flightMode: boolean;
  mobileData: boolean;
  hotspot: boolean;

  // Display & UI
  darkMode: boolean;
  brightness: number;
  autoBrightness: boolean;
  extraBrightness: boolean;
  motionSmoothness: MotionSmoothnessMode;
  eyeComfortShield: boolean;
  screenTimeout: ScreenTimeoutSeconds;
  alwaysOnDisplay: boolean;
  accidentalTouchProtection: boolean;
  easyMode: boolean;

  // Sounds & Vibration
  soundMode: SoundMode;
  vibrateWhileRinging: boolean;
  dolbyAtmos: boolean;
  mediaVolume: number;
  ringtoneVolume: number;

  // Notifications
  appNotifications: boolean;
  lockScreenNotifications: boolean;
  doNotDisturb: boolean;
  appIconBadges: boolean;

  // Performance & Device Care
  performanceProfile: PerformanceProfileMode;
  autoOptimization: boolean;
  ramPlusGB: number;
  storageCleaned: boolean;
  storageUsedGB: number;
  storageTotalGB: number;

  // Camera & Advanced
  sceneOptimizer: boolean;
  autoHdr: boolean;
  scanQrCodes: boolean;
  gameBoosterThermal: boolean;

  // Security & Privacy
  cameraAccess: boolean;
  microphoneAccess: boolean;
  locationAccess: boolean;
  sendDiagnosticData: boolean;
}

export type DeviceSettingKey = keyof DeviceSettingsState;

export const INITIAL_SETTINGS_STATE: DeviceSettingsState = {
  // Battery
  powerSaving: false,
  protectBattery: false,
  adaptiveBattery: true,
  deepSleepingAppsCount: 4,
  batteryOptimized: false,
  batteryPercentage: 78,
  wirelessPowerSharing: false,

  // Connectivity
  wifi: true,
  intelligentWifi: true,
  wifiCalling: true,
  bluetooth: true,
  nfc: true,
  flightMode: false,
  mobileData: true,
  hotspot: false,

  // Display
  darkMode: true,
  brightness: 65,
  autoBrightness: true,
  extraBrightness: false,
  motionSmoothness: 'Adaptive',
  eyeComfortShield: false,
  screenTimeout: 30,
  alwaysOnDisplay: false,
  accidentalTouchProtection: true,
  easyMode: false,

  // Sounds
  soundMode: 'sound',
  vibrateWhileRinging: true,
  dolbyAtmos: true,
  mediaVolume: 70,
  ringtoneVolume: 80,

  // Notifications
  appNotifications: true,
  lockScreenNotifications: true,
  doNotDisturb: false,
  appIconBadges: true,

  // Performance
  performanceProfile: 'Standard',
  autoOptimization: true,
  ramPlusGB: 8,
  storageCleaned: false,
  storageUsedGB: 68.4,
  storageTotalGB: 256,

  // Camera
  sceneOptimizer: true,
  autoHdr: true,
  scanQrCodes: true,
  gameBoosterThermal: false,

  // Privacy
  cameraAccess: true,
  microphoneAccess: true,
  locationAccess: true,
  sendDiagnosticData: false,
};

export interface SettingMetadata {
  key: DeviceSettingKey;
  title: string;
  category: 'Battery' | 'Connections' | 'Display' | 'Sound' | 'Notifications' | 'Device care' | 'Camera' | 'Privacy';
  screen: Screen;
  destinationPath: string[];
  description: string;
  actionType: 'TOGGLE' | 'CONFIG_CHANGE';
}

export const SETTING_DEFINITIONS: Record<DeviceSettingKey, SettingMetadata> = {
  powerSaving: {
    key: 'powerSaving',
    title: 'Power saving',
    category: 'Battery',
    screen: 'settings/battery',
    destinationPath: ['Settings', 'Battery', 'Power saving'],
    description: 'Restricts background network usage, syncing, and reduces CPU limit to 70% to extend battery runtime.',
    actionType: 'TOGGLE',
  },
  protectBattery: {
    key: 'protectBattery',
    title: 'Protect battery',
    category: 'Battery',
    screen: 'settings/battery',
    destinationPath: ['Settings', 'Battery', 'Protect battery'],
    description: 'Limits maximum charging to 85% to preserve battery health over long term.',
    actionType: 'TOGGLE',
  },
  adaptiveBattery: {
    key: 'adaptiveBattery',
    title: 'Adaptive battery',
    category: 'Battery',
    screen: 'settings/battery',
    destinationPath: ['Settings', 'Battery', 'Adaptive battery'],
    description: 'Limits battery power for apps that you do not use often.',
    actionType: 'TOGGLE',
  },
  deepSleepingAppsCount: {
    key: 'deepSleepingAppsCount',
    title: 'Deep sleeping apps',
    category: 'Battery',
    screen: 'settings/battery-usage',
    destinationPath: ['Settings', 'Battery', 'Background usage limits', 'Deep sleeping apps'],
    description: 'Puts high battery drain background apps into deep sleep so they never run in background.',
    actionType: 'CONFIG_CHANGE',
  },
  batteryOptimized: {
    key: 'batteryOptimized',
    title: 'Optimize battery',
    category: 'Battery',
    screen: 'settings/battery-usage',
    destinationPath: ['Settings', 'Battery', 'Battery usage'],
    description: 'Audits and closes unnecessary background drain instances.',
    actionType: 'TOGGLE',
  },
  batteryPercentage: {
    key: 'batteryPercentage',
    title: 'Battery level',
    category: 'Battery',
    screen: 'settings/battery',
    destinationPath: ['Settings', 'Battery'],
    description: 'Current battery charge percentage.',
    actionType: 'CONFIG_CHANGE',
  },
  wirelessPowerSharing: {
    key: 'wirelessPowerSharing',
    title: 'Wireless power sharing',
    category: 'Battery',
    screen: 'settings/battery',
    destinationPath: ['Settings', 'Battery', 'Wireless power sharing'],
    description: 'Wirelessly charges another phone or wearable on back of device.',
    actionType: 'TOGGLE',
  },
  wifi: {
    key: 'wifi',
    title: 'Wi-Fi',
    category: 'Connections',
    screen: 'settings/connections',
    destinationPath: ['Settings', 'Connections', 'Wi-Fi'],
    description: 'Connects to wireless internet networks.',
    actionType: 'TOGGLE',
  },
  intelligentWifi: {
    key: 'intelligentWifi',
    title: 'Intelligent Wi-Fi',
    category: 'Connections',
    screen: 'settings/connections',
    destinationPath: ['Settings', 'Connections', 'Wi-Fi', 'Intelligent Wi-Fi'],
    description: 'Automatically switches to mobile data when Wi-Fi connection is unstable.',
    actionType: 'TOGGLE',
  },
  wifiCalling: {
    key: 'wifiCalling',
    title: 'Wi-Fi calling',
    category: 'Connections',
    screen: 'settings/connections',
    destinationPath: ['Settings', 'Connections', 'Wi-Fi calling'],
    description: 'Makes voice calls over Wi-Fi when cellular network coverage is poor.',
    actionType: 'TOGGLE',
  },
  bluetooth: {
    key: 'bluetooth',
    title: 'Bluetooth',
    category: 'Connections',
    screen: 'settings/connections',
    destinationPath: ['Settings', 'Connections', 'Bluetooth'],
    description: 'Connects to wireless headphones, watches, and accessories.',
    actionType: 'TOGGLE',
  },
  nfc: {
    key: 'nfc',
    title: 'NFC and contactless payments',
    category: 'Connections',
    screen: 'settings/connections',
    destinationPath: ['Settings', 'Connections', 'NFC and contactless payments'],
    description: 'Enables Samsung Pay and contactless card tapping.',
    actionType: 'TOGGLE',
  },
  flightMode: {
    key: 'flightMode',
    title: 'Flight mode',
    category: 'Connections',
    screen: 'settings/connections',
    destinationPath: ['Settings', 'Connections', 'Flight mode'],
    description: 'Disables all wireless transmissions (cellular, Wi-Fi, and Bluetooth).',
    actionType: 'TOGGLE',
  },
  mobileData: {
    key: 'mobileData',
    title: 'Mobile data',
    category: 'Connections',
    screen: 'settings/connections',
    destinationPath: ['Settings', 'Connections', 'Mobile networks'],
    description: 'Connects to cellular internet.',
    actionType: 'TOGGLE',
  },
  hotspot: {
    key: 'hotspot',
    title: 'Mobile Hotspot',
    category: 'Connections',
    screen: 'settings/connections',
    destinationPath: ['Settings', 'Connections', 'Mobile Hotspot and Tethering'],
    description: 'Shares internet connection with other devices over Wi-Fi.',
    actionType: 'TOGGLE',
  },
  darkMode: {
    key: 'darkMode',
    title: 'Dark mode',
    category: 'Display',
    screen: 'settings/display',
    destinationPath: ['Settings', 'Display', 'Dark mode'],
    description: 'Applies dark theme across system menus to save AMOLED battery and reduce eye strain.',
    actionType: 'TOGGLE',
  },
  brightness: {
    key: 'brightness',
    title: 'Brightness',
    category: 'Display',
    screen: 'settings/display',
    destinationPath: ['Settings', 'Display', 'Brightness'],
    description: 'Adjusts display luminance level.',
    actionType: 'CONFIG_CHANGE',
  },
  autoBrightness: {
    key: 'autoBrightness',
    title: 'Adaptive brightness',
    category: 'Display',
    screen: 'settings/display',
    destinationPath: ['Settings', 'Display', 'Adaptive brightness'],
    description: 'Automatically adjusts screen brightness based on ambient lighting conditions.',
    actionType: 'TOGGLE',
  },
  extraBrightness: {
    key: 'extraBrightness',
    title: 'Extra brightness',
    category: 'Display',
    screen: 'settings/display',
    destinationPath: ['Settings', 'Display', 'Extra brightness'],
    description: 'Boosts maximum screen brightness for direct outdoor sunlight viewing.',
    actionType: 'TOGGLE',
  },
  motionSmoothness: {
    key: 'motionSmoothness',
    title: 'Motion smoothness',
    category: 'Display',
    screen: 'settings/display/motion-smoothness',
    destinationPath: ['Settings', 'Display', 'Motion smoothness'],
    description: 'Switches display refresh rate between 120Hz Adaptive and 60Hz Standard.',
    actionType: 'CONFIG_CHANGE',
  },
  eyeComfortShield: {
    key: 'eyeComfortShield',
    title: 'Eye comfort shield',
    category: 'Display',
    screen: 'settings/display',
    destinationPath: ['Settings', 'Display', 'Eye comfort shield'],
    description: 'Filters out blue light to reduce eye fatigue before sleep.',
    actionType: 'TOGGLE',
  },
  screenTimeout: {
    key: 'screenTimeout',
    title: 'Screen timeout',
    category: 'Display',
    screen: 'settings/display',
    destinationPath: ['Settings', 'Display', 'Screen timeout'],
    description: 'Duration before inactive display turns off automatically.',
    actionType: 'CONFIG_CHANGE',
  },
  alwaysOnDisplay: {
    key: 'alwaysOnDisplay',
    title: 'Always On Display',
    category: 'Display',
    screen: 'settings/generic/Lock screen and AOD',
    destinationPath: ['Settings', 'Lock screen and AOD', 'Always On Display'],
    description: 'Shows clock and notifications when phone screen is turned off.',
    actionType: 'TOGGLE',
  },
  accidentalTouchProtection: {
    key: 'accidentalTouchProtection',
    title: 'Accidental touch protection',
    category: 'Display',
    screen: 'settings/display',
    destinationPath: ['Settings', 'Display', 'Accidental touch protection'],
    description: 'Prevents unintentional screen activation when phone is inside pocket or bag.',
    actionType: 'TOGGLE',
  },
  easyMode: {
    key: 'easyMode',
    title: 'Easy mode',
    category: 'Display',
    screen: 'settings/display',
    destinationPath: ['Settings', 'Display', 'Easy mode'],
    description: 'Enlarges screen elements and simplifies Home screen layout.',
    actionType: 'TOGGLE',
  },
  soundMode: {
    key: 'soundMode',
    title: 'Sound mode',
    category: 'Sound',
    screen: 'settings/sound',
    destinationPath: ['Settings', 'Sounds and vibration', 'Sound mode'],
    description: 'Controls incoming call and alert profile (Sound, Vibrate, or Mute).',
    actionType: 'CONFIG_CHANGE',
  },
  vibrateWhileRinging: {
    key: 'vibrateWhileRinging',
    title: 'Vibrate while ringing',
    category: 'Sound',
    screen: 'settings/sound',
    destinationPath: ['Settings', 'Sounds and vibration', 'Vibrate while ringing'],
    description: 'Activates haptic motor simultaneously with audio ringtones.',
    actionType: 'TOGGLE',
  },
  dolbyAtmos: {
    key: 'dolbyAtmos',
    title: 'Dolby Atmos',
    category: 'Sound',
    screen: 'settings/sound',
    destinationPath: ['Settings', 'Sounds and vibration', 'Sound quality and effects', 'Dolby Atmos'],
    description: 'Enhances stereo spatial audio clarity and surround sound.',
    actionType: 'TOGGLE',
  },
  mediaVolume: {
    key: 'mediaVolume',
    title: 'Media volume',
    category: 'Sound',
    screen: 'settings/sound',
    destinationPath: ['Settings', 'Sounds and vibration', 'Volume', 'Media'],
    description: 'Volume level for music, games, and videos.',
    actionType: 'CONFIG_CHANGE',
  },
  ringtoneVolume: {
    key: 'ringtoneVolume',
    title: 'Ringtone volume',
    category: 'Sound',
    screen: 'settings/sound',
    destinationPath: ['Settings', 'Sounds and vibration', 'Volume', 'Ringtone'],
    description: 'Loudness level for incoming phone calls.',
    actionType: 'CONFIG_CHANGE',
  },
  appNotifications: {
    key: 'appNotifications',
    title: 'App notifications',
    category: 'Notifications',
    screen: 'settings/generic/Notifications',
    destinationPath: ['Settings', 'Notifications', 'App notifications'],
    description: 'Manages per-app notification permissions and alert delivery.',
    actionType: 'TOGGLE',
  },
  lockScreenNotifications: {
    key: 'lockScreenNotifications',
    title: 'Lock screen notifications',
    category: 'Notifications',
    screen: 'settings/generic/Notifications',
    destinationPath: ['Settings', 'Notifications', 'Lock screen notifications'],
    description: 'Shows or hides sensitive preview content on lock screen.',
    actionType: 'TOGGLE',
  },
  doNotDisturb: {
    key: 'doNotDisturb',
    title: 'Do not disturb',
    category: 'Notifications',
    screen: 'settings/generic/Notifications',
    destinationPath: ['Settings', 'Notifications', 'Do not disturb'],
    description: 'Silences all notifications, calls, and alerts with exception rules.',
    actionType: 'TOGGLE',
  },
  appIconBadges: {
    key: 'appIconBadges',
    title: 'App icon badges',
    category: 'Notifications',
    screen: 'settings/generic/Notifications',
    destinationPath: ['Settings', 'Notifications', 'Advanced settings', 'App icon badges'],
    description: 'Shows number of unread alerts on app icons.',
    actionType: 'TOGGLE',
  },
  performanceProfile: {
    key: 'performanceProfile',
    title: 'Performance profile',
    category: 'Device care',
    screen: 'settings/device-care',
    destinationPath: ['Settings', 'Device care', 'Performance profile'],
    description: 'Light profile prioritizes battery life and cooling over maximum clock speeds without affecting games.',
    actionType: 'CONFIG_CHANGE',
  },
  autoOptimization: {
    key: 'autoOptimization',
    title: 'Auto optimization',
    category: 'Device care',
    screen: 'settings/device-care',
    destinationPath: ['Settings', 'Device care', 'Auto optimization'],
    description: 'Restarts device automatically when not in use to clear memory cache.',
    actionType: 'TOGGLE',
  },
  ramPlusGB: {
    key: 'ramPlusGB',
    title: 'RAM Plus',
    category: 'Device care',
    screen: 'settings/device-care',
    destinationPath: ['Settings', 'Device care', 'Memory', 'RAM Plus'],
    description: 'Allocates virtual paging storage as additional working RAM.',
    actionType: 'CONFIG_CHANGE',
  },
  storageCleaned: {
    key: 'storageCleaned',
    title: 'Clean storage cache',
    category: 'Device care',
    screen: 'settings/storage',
    destinationPath: ['Settings', 'Device care', 'Storage'],
    description: 'Purges cached app junk files and system logs to free up gigabytes.',
    actionType: 'TOGGLE',
  },
  storageUsedGB: {
    key: 'storageUsedGB',
    title: 'Storage used',
    category: 'Device care',
    screen: 'settings/storage',
    destinationPath: ['Settings', 'Device care', 'Storage'],
    description: 'Currently occupied storage space.',
    actionType: 'CONFIG_CHANGE',
  },
  storageTotalGB: {
    key: 'storageTotalGB',
    title: 'Storage capacity',
    category: 'Device care',
    screen: 'settings/storage',
    destinationPath: ['Settings', 'Device care', 'Storage'],
    description: 'Total internal flash storage capacity.',
    actionType: 'CONFIG_CHANGE',
  },
  sceneOptimizer: {
    key: 'sceneOptimizer',
    title: 'Scene optimizer',
    category: 'Camera',
    screen: 'settings/camera',
    destinationPath: ['Settings', 'Camera settings', 'Scene optimizer'],
    description: 'Uses AI neural processing to automatically enhance exposure and colors for detected subjects.',
    actionType: 'TOGGLE',
  },
  autoHdr: {
    key: 'autoHdr',
    title: 'Auto HDR',
    category: 'Camera',
    screen: 'settings/camera',
    destinationPath: ['Settings', 'Camera settings', 'Auto HDR'],
    description: 'Captures details in bright and dark areas of photo scenes.',
    actionType: 'TOGGLE',
  },
  scanQrCodes: {
    key: 'scanQrCodes',
    title: 'Scan QR codes',
    category: 'Camera',
    screen: 'settings/camera',
    destinationPath: ['Settings', 'Camera settings', 'Scan QR codes'],
    description: 'Automatically detects and launches links from QR codes viewed in camera viewfinder.',
    actionType: 'TOGGLE',
  },
  gameBoosterThermal: {
    key: 'gameBoosterThermal',
    title: 'Thermal management',
    category: 'Device care',
    screen: 'settings/advanced',
    destinationPath: ['Settings', 'Advanced features', 'Game Booster', 'Thermal management'],
    description: 'Actively throttles excessive heat during sustained gaming and heavy computing workloads.',
    actionType: 'TOGGLE',
  },
  cameraAccess: {
    key: 'cameraAccess',
    title: 'Camera access',
    category: 'Privacy',
    screen: 'settings/privacy',
    destinationPath: ['Settings', 'Security and privacy', 'Privacy', 'Camera access'],
    description: 'Master hardware kill switch for camera sensor across all applications.',
    actionType: 'TOGGLE',
  },
  microphoneAccess: {
    key: 'microphoneAccess',
    title: 'Microphone access',
    category: 'Privacy',
    screen: 'settings/privacy',
    destinationPath: ['Settings', 'Security and privacy', 'Privacy', 'Microphone access'],
    description: 'Master hardware kill switch for microphone sensors across all applications.',
    actionType: 'TOGGLE',
  },
  locationAccess: {
    key: 'locationAccess',
    title: 'Location access',
    category: 'Privacy',
    screen: 'settings/privacy',
    destinationPath: ['Settings', 'Security and privacy', 'Privacy', 'Location'],
    description: 'Provides GPS and cellular triangulation coordinates to apps with permission.',
    actionType: 'TOGGLE',
  },
  sendDiagnosticData: {
    key: 'sendDiagnosticData',
    title: 'Send diagnostic data',
    category: 'Privacy',
    screen: 'settings/privacy',
    destinationPath: ['Settings', 'Security and privacy', 'Send diagnostic data'],
    description: 'Transmits anonymous usage and error diagnostics to Samsung servers.',
    actionType: 'TOGGLE',
  },
};
