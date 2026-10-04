/**
 * src/settings/capabilities.ts
 * Centralized Samsung Galaxy S24 Ultra / One UI 6.1 Capability Matrix for Fixby.
 * 
 * Provides an authoritative source of truth for:
 * - Simulator capability support
 * - Web browser execution support
 * - Native Android requirement
 * - Honest user-facing messaging (zero fake native claims)
 */

export type SimulatorSupportTier = 'FULL' | 'SIMULATED' | 'WEB_FALLBACK' | 'GUARDED' | 'NOT_SUPPORTED';

export interface DeviceCapability {
  id: string;
  name: string;
  category: 'Battery' | 'Connections' | 'Display' | 'Sound' | 'Device Care' | 'Notifications' | 'Apps' | 'Security';
  simulatorSupport: SimulatorSupportTier;
  browserSupport: boolean;
  nativeAndroidRequired: boolean;
  leafScreen: string;
  samsungPath: string[];
  honestStatusMessage: string;
  description: string;
}

export const CAPABILITY_MATRIX: Record<string, DeviceCapability> = {
  // Battery & Power
  'power_saving': {
    id: 'power_saving',
    name: 'Power Saving Mode',
    category: 'Battery',
    simulatorSupport: 'FULL',
    browserSupport: true,
    nativeAndroidRequired: false,
    leafScreen: 'settings/battery',
    samsungPath: ['Settings', 'Battery', 'Power saving'],
    honestStatusMessage: 'Power saving mode enabled in the Fixby simulator.',
    description: 'Throttles CPU to 70%, limits background data, and disables Always On Display.',
  },
  'protect_battery': {
    id: 'protect_battery',
    name: 'Battery Protection',
    category: 'Battery',
    simulatorSupport: 'FULL',
    browserSupport: true,
    nativeAndroidRequired: false,
    leafScreen: 'settings/battery',
    samsungPath: ['Settings', 'Battery', 'Protect battery'],
    honestStatusMessage: 'Battery protection enabled in the Fixby simulator (capped at 85%).',
    description: 'Caps charging at 85% to protect lithium chemistry from degradation.',
  },
  'deep_sleeping_apps': {
    id: 'deep_sleeping_apps',
    name: 'Background Usage Limits (Deep Sleep)',
    category: 'Battery',
    simulatorSupport: 'FULL',
    browserSupport: true,
    nativeAndroidRequired: false,
    leafScreen: 'settings/battery-usage',
    samsungPath: ['Settings', 'Battery', 'Background usage limits', 'Deep sleeping apps'],
    honestStatusMessage: 'High-consumption apps moved to Deep Sleep in the Fixby simulator.',
    description: 'Completely stops rogue apps from running or waking in background.',
  },
  'adaptive_battery': {
    id: 'adaptive_battery',
    name: 'Adaptive Battery',
    category: 'Battery',
    simulatorSupport: 'FULL',
    browserSupport: true,
    nativeAndroidRequired: false,
    leafScreen: 'settings/battery',
    samsungPath: ['Settings', 'Battery', 'More battery settings', 'Adaptive battery'],
    honestStatusMessage: 'Adaptive battery toggled in the Fixby simulator.',
    description: 'Uses on-device AI to predict app usage patterns and optimize battery allocation.',
  },

  // Connectivity
  'wifi_toggle': {
    id: 'wifi_toggle',
    name: 'Wi-Fi Connection',
    category: 'Connections',
    simulatorSupport: 'FULL',
    browserSupport: true,
    nativeAndroidRequired: false,
    leafScreen: 'settings/connections',
    samsungPath: ['Settings', 'Connections', 'Wi-Fi'],
    honestStatusMessage: 'Wi-Fi state toggled in the Fixby simulator.',
    description: 'Primary 802.11be/ax/ac wireless interface control.',
  },
  'intelligent_wifi': {
    id: 'intelligent_wifi',
    name: 'Intelligent Wi-Fi',
    category: 'Connections',
    simulatorSupport: 'FULL',
    browserSupport: true,
    nativeAndroidRequired: false,
    leafScreen: 'settings/connections',
    samsungPath: ['Settings', 'Connections', 'Wi-Fi', 'Intelligent Wi-Fi'],
    honestStatusMessage: 'Intelligent Wi-Fi enabled in the Fixby simulator.',
    description: 'Automatically switches to mobile data when Wi-Fi signal becomes unstable.',
  },
  'bluetooth_toggle': {
    id: 'bluetooth_toggle',
    name: 'Bluetooth',
    category: 'Connections',
    simulatorSupport: 'FULL',
    browserSupport: true,
    nativeAndroidRequired: false,
    leafScreen: 'settings/connections',
    samsungPath: ['Settings', 'Connections', 'Bluetooth'],
    honestStatusMessage: 'Bluetooth toggled in the Fixby simulator.',
    description: 'Bluetooth 5.3 radio for accessories, Galaxy Buds, and Watch.',
  },
  'nfc_toggle': {
    id: 'nfc_toggle',
    name: 'NFC and Contactless Payments',
    category: 'Connections',
    simulatorSupport: 'FULL',
    browserSupport: true,
    nativeAndroidRequired: false,
    leafScreen: 'settings/connections',
    samsungPath: ['Settings', 'Connections', 'NFC and contactless payments'],
    honestStatusMessage: 'NFC toggled in the Fixby simulator.',
    description: 'Near Field Communication for Samsung Wallet and Google Pay.',
  },
  'mobile_data': {
    id: 'mobile_data',
    name: 'Mobile Data',
    category: 'Connections',
    simulatorSupport: 'FULL',
    browserSupport: true,
    nativeAndroidRequired: false,
    leafScreen: 'settings/connections',
    samsungPath: ['Settings', 'Connections', 'Data usage', 'Mobile data'],
    honestStatusMessage: 'Mobile data state updated in the Fixby simulator.',
    description: '5G/LTE cellular data connection control.',
  },
  'flight_mode': {
    id: 'flight_mode',
    name: 'Flight Mode',
    category: 'Connections',
    simulatorSupport: 'FULL',
    browserSupport: true,
    nativeAndroidRequired: false,
    leafScreen: 'settings/connections',
    samsungPath: ['Settings', 'Connections', 'Flight mode'],
    honestStatusMessage: 'Flight mode toggled in the Fixby simulator.',
    description: 'Disables all wireless radios (cellular, Wi-Fi, and Bluetooth).',
  },
  'network_reset': {
    id: 'network_reset',
    name: 'Reset Network Settings',
    category: 'Connections',
    simulatorSupport: 'GUARDED',
    browserSupport: true,
    nativeAndroidRequired: true,
    leafScreen: 'settings/general',
    samsungPath: ['Settings', 'General management', 'Reset', 'Reset network settings'],
    honestStatusMessage: 'Resetting live network radios requires native Samsung Android integration.',
    description: 'Clears all saved Wi-Fi networks, Bluetooth pairings, and APN profiles.',
  },

  // Display & UI
  'dark_mode': {
    id: 'dark_mode',
    name: 'Dark Mode',
    category: 'Display',
    simulatorSupport: 'FULL',
    browserSupport: true,
    nativeAndroidRequired: false,
    leafScreen: 'settings/display',
    samsungPath: ['Settings', 'Display', 'Dark mode'],
    honestStatusMessage: 'Dark mode enabled in the Fixby simulator.',
    description: 'Powers off black subpixels on Dynamic AMOLED 2X displays to save battery.',
  },
  'motion_smoothness': {
    id: 'motion_smoothness',
    name: 'Motion Smoothness (Refresh Rate)',
    category: 'Display',
    simulatorSupport: 'FULL',
    browserSupport: true,
    nativeAndroidRequired: false,
    leafScreen: 'settings/motion-smoothness',
    samsungPath: ['Settings', 'Display', 'Motion smoothness'],
    honestStatusMessage: 'Motion smoothness mode updated in the Fixby simulator.',
    description: 'Toggles between Adaptive 120Hz (maximum fluidity) and Standard 60Hz (battery saver).',
  },
  'auto_brightness': {
    id: 'auto_brightness',
    name: 'Adaptive Brightness',
    category: 'Display',
    simulatorSupport: 'FULL',
    browserSupport: true,
    nativeAndroidRequired: false,
    leafScreen: 'settings/display',
    samsungPath: ['Settings', 'Display', 'Adaptive brightness'],
    honestStatusMessage: 'Adaptive brightness toggled in the Fixby simulator.',
    description: 'Uses ambient light sensor to continuously calibrate screen lumen output.',
  },
  'eye_comfort_shield': {
    id: 'eye_comfort_shield',
    name: 'Eye Comfort Shield',
    category: 'Display',
    simulatorSupport: 'FULL',
    browserSupport: true,
    nativeAndroidRequired: false,
    leafScreen: 'settings/display',
    samsungPath: ['Settings', 'Display', 'Eye comfort shield'],
    honestStatusMessage: 'Eye Comfort Shield enabled in the Fixby simulator.',
    description: 'Filters blue light wavelengths to reduce circadian sleep disruption.',
  },
  'accidental_touch': {
    id: 'accidental_touch',
    name: 'Accidental Touch Protection',
    category: 'Display',
    simulatorSupport: 'FULL',
    browserSupport: true,
    nativeAndroidRequired: false,
    leafScreen: 'settings/display',
    samsungPath: ['Settings', 'Display', 'Accidental touch protection'],
    honestStatusMessage: 'Accidental touch protection enabled in the Fixby simulator.',
    description: 'Prevents phantom touches and pocket dialing using proximity sensors.',
  },
  'screen_timeout': {
    id: 'screen_timeout',
    name: 'Screen Timeout',
    category: 'Display',
    simulatorSupport: 'FULL',
    browserSupport: true,
    nativeAndroidRequired: false,
    leafScreen: 'settings/display',
    samsungPath: ['Settings', 'Display', 'Screen timeout'],
    honestStatusMessage: 'Screen timeout duration updated in the Fixby simulator.',
    description: 'Configures inactivity timer before display goes to sleep.',
  },
  'always_on_display': {
    id: 'always_on_display',
    name: 'Always On Display',
    category: 'Display',
    simulatorSupport: 'FULL',
    browserSupport: true,
    nativeAndroidRequired: false,
    leafScreen: 'settings/lock-screen',
    samsungPath: ['Settings', 'Lock screen', 'Always On Display'],
    honestStatusMessage: 'Always On Display toggled in the Fixby simulator.',
    description: 'Shows time and notification icons while the screen is locked.',
  },

  // Device Care & Performance
  'performance_profile': {
    id: 'performance_profile',
    name: 'Performance Profile (Light Mode)',
    category: 'Device Care',
    simulatorSupport: 'FULL',
    browserSupport: true,
    nativeAndroidRequired: false,
    leafScreen: 'settings/device-care',
    samsungPath: ['Settings', 'Device care', 'Performance profile'],
    honestStatusMessage: 'Performance profile switched to Light mode in the Fixby simulator.',
    description: 'Lowers peak CPU clock speeds to reduce thermal buildup without compromising game performance.',
  },
  'storage_cleaner': {
    id: 'storage_cleaner',
    name: 'Storage Junk & Cache Purge',
    category: 'Device Care',
    simulatorSupport: 'FULL',
    browserSupport: true,
    nativeAndroidRequired: false,
    leafScreen: 'settings/storage',
    samsungPath: ['Settings', 'Device care', 'Storage'],
    honestStatusMessage: 'Storage cleaned: cached junk files purged in the Fixby simulator.',
    description: 'Deletes cached application temp files and clears trash folders.',
  },
  'auto_optimization': {
    id: 'auto_optimization',
    name: 'Auto Optimization & Restart',
    category: 'Device Care',
    simulatorSupport: 'FULL',
    browserSupport: true,
    nativeAndroidRequired: false,
    leafScreen: 'settings/device-care',
    samsungPath: ['Settings', 'Device care', 'Auto optimization'],
    honestStatusMessage: 'Auto optimization enabled in the Fixby simulator.',
    description: 'Automatically cleans RAM and restarts phone during idle night hours.',
  },
  'game_booster_thermal': {
    id: 'game_booster_thermal',
    name: 'Game Booster Thermal Throttling',
    category: 'Device Care',
    simulatorSupport: 'FULL',
    browserSupport: true,
    nativeAndroidRequired: false,
    leafScreen: 'settings/advanced',
    samsungPath: ['Settings', 'Advanced features', 'Game Booster', 'Thermal management'],
    honestStatusMessage: 'Thermal management enabled in the Fixby simulator.',
    description: 'Controls GPU clock scaling to cap chassis temperature under heavy 3D rendering.',
  },

  // Notifications
  'do_not_disturb': {
    id: 'do_not_disturb',
    name: 'Do Not Disturb',
    category: 'Notifications',
    simulatorSupport: 'FULL',
    browserSupport: true,
    nativeAndroidRequired: false,
    leafScreen: 'settings/generic/Notifications',
    samsungPath: ['Settings', 'Notifications', 'Do not disturb'],
    honestStatusMessage: 'Do Not Disturb state updated in the Fixby simulator.',
    description: 'Mutes all incoming audio notifications, vibrations, and visual heads-up banners.',
  },
  'app_notifications': {
    id: 'app_notifications',
    name: 'App Notification Access',
    category: 'Notifications',
    simulatorSupport: 'FULL',
    browserSupport: true,
    nativeAndroidRequired: false,
    leafScreen: 'settings/apps',
    samsungPath: ['Settings', 'Apps', 'Notifications'],
    honestStatusMessage: 'App notification permissions configured in the Fixby simulator.',
    description: 'Controls per-application push notification authorization.',
  },

  // Apps
  'app_launch_whatsapp': {
    id: 'app_launch_whatsapp',
    name: 'Launch WhatsApp',
    category: 'Apps',
    simulatorSupport: 'WEB_FALLBACK',
    browserSupport: true,
    nativeAndroidRequired: true,
    leafScreen: 'home',
    samsungPath: ['Home', 'WhatsApp'],
    honestStatusMessage: 'WhatsApp opened via web fallback. Native app launch requires Samsung Android.',
    description: 'Instant messaging app communication.',
  },
  'app_launch_instagram': {
    id: 'app_launch_instagram',
    name: 'Launch Instagram',
    category: 'Apps',
    simulatorSupport: 'WEB_FALLBACK',
    browserSupport: true,
    nativeAndroidRequired: true,
    leafScreen: 'home',
    samsungPath: ['Home', 'Instagram'],
    honestStatusMessage: 'Instagram opened via web fallback. Native app launch requires Samsung Android.',
    description: 'Photo and social media platform.',
  },
  'app_launch_youtube': {
    id: 'app_launch_youtube',
    name: 'Launch YouTube',
    category: 'Apps',
    simulatorSupport: 'WEB_FALLBACK',
    browserSupport: true,
    nativeAndroidRequired: true,
    leafScreen: 'home',
    samsungPath: ['Home', 'YouTube'],
    honestStatusMessage: 'YouTube opened via web fallback. Native app launch requires Samsung Android.',
    description: 'Streaming video platform.',
  },
  'app_launch_maps': {
    id: 'app_launch_maps',
    name: 'Launch Google Maps',
    category: 'Apps',
    simulatorSupport: 'WEB_FALLBACK',
    browserSupport: true,
    nativeAndroidRequired: true,
    leafScreen: 'home',
    samsungPath: ['Home', 'Google Maps'],
    honestStatusMessage: 'Google Maps opened via web fallback. Native app launch requires Samsung Android.',
    description: 'GPS turn-by-turn navigation service.',
  },
  'app_launch_gmail': {
    id: 'app_launch_gmail',
    name: 'Launch Gmail',
    category: 'Apps',
    simulatorSupport: 'WEB_FALLBACK',
    browserSupport: true,
    nativeAndroidRequired: true,
    leafScreen: 'home',
    samsungPath: ['Home', 'Gmail'],
    honestStatusMessage: 'Gmail opened via web fallback. Native app launch requires Samsung Android.',
    description: 'Email client and message inbox.',
  },
  'native_camera_reset': {
    id: 'native_camera_reset',
    name: 'Reset Camera Settings',
    category: 'Security',
    simulatorSupport: 'GUARDED',
    browserSupport: true,
    nativeAndroidRequired: false,
    leafScreen: 'settings/camera',
    samsungPath: ['Settings', 'Camera settings', 'Reset settings'],
    honestStatusMessage: 'Camera settings reset to factory defaults in the Fixby simulator.',
    description: 'Restores all camera sensor modes, exposure profiles, and watermark flags.',
  },
};

/**
 * Returns formatted honest status description for display in the UI
 */
export function getHonestCapabilityLabel(capabilityId?: string): {
  badgeText: string;
  badgeColor: string;
  isSimulated: boolean;
  requiresNative: boolean;
} {
  if (!capabilityId || !CAPABILITY_MATRIX[capabilityId]) {
    return {
      badgeText: 'Fixby Simulator',
      badgeColor: '#2075d6',
      isSimulated: true,
      requiresNative: false,
    };
  }

  const cap = CAPABILITY_MATRIX[capabilityId];
  if (cap.simulatorSupport === 'WEB_FALLBACK') {
    return {
      badgeText: 'Web Fallback',
      badgeColor: '#a855f7',
      isSimulated: false,
      requiresNative: true,
    };
  }

  if (cap.nativeAndroidRequired && cap.simulatorSupport === 'GUARDED') {
    return {
      badgeText: 'Native Android Required',
      badgeColor: '#ff9500',
      isSimulated: false,
      requiresNative: true,
    };
  }

  return {
    badgeText: 'Fixby Simulator',
    badgeColor: '#2075d6',
    isSimulated: true,
    requiresNative: false,
  };
}
