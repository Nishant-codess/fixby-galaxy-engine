'use client';
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

// ──────────────────────────────────────────────────────────────
// Settings Data Structure
// ──────────────────────────────────────────────────────────────

export interface SettingsItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  iconBg: string;
  type: 'navigate' | 'toggle';
  toggled?: boolean;
  children?: SettingsItem[];
}

export interface SettingsCategory {
  id: string;
  items: SettingsItem[];
}

export const SETTINGS_DATA: SettingsCategory[] = [
  {
    id: 'connectivity',
    items: [
      { id: 'connections', title: 'Connections', subtitle: 'Wi-Fi, Bluetooth, Airplane mode', icon: '📡', iconBg: '#3B82F6', type: 'navigate', children: [
        { id: 'wifi', title: 'Wi-Fi', icon: '📶', iconBg: '#3B82F6', type: 'toggle', toggled: true },
        { id: 'bluetooth', title: 'Bluetooth', icon: '🔵', iconBg: '#6366F1', type: 'toggle', toggled: false },
        { id: 'mobile-networks', title: 'Mobile networks', icon: '📱', iconBg: '#8B5CF6', type: 'navigate' },
        { id: 'hotspot', title: 'Mobile hotspot and tethering', icon: '🔗', iconBg: '#06B6D4', type: 'navigate' },
        { id: 'airplane', title: 'Airplane mode', icon: '✈️', iconBg: '#F59E0B', type: 'toggle', toggled: false },
        { id: 'nfc', title: 'NFC and contactless payments', icon: '💳', iconBg: '#10B981', type: 'toggle', toggled: true },
      ]},
    ]
  },
  {
    id: 'device',
    items: [
      { id: 'sounds', title: 'Sounds and vibration', subtitle: 'Sound mode, Ringtone, Volume', icon: '🔊', iconBg: '#EF4444', type: 'navigate', children: [
        { id: 'sound-mode', title: 'Sound mode', icon: '🔔', iconBg: '#EF4444', type: 'navigate' },
        { id: 'vibrate-while-ringing', title: 'Vibrate while ringing', icon: '📳', iconBg: '#F97316', type: 'toggle', toggled: true },
        { id: 'volume', title: 'Volume', icon: '🔊', iconBg: '#EF4444', type: 'navigate' },
        { id: 'ringtone', title: 'Ringtone', icon: '🎵', iconBg: '#EC4899', type: 'navigate' },
        { id: 'dolby-atmos', title: 'Dolby Atmos', icon: '🎧', iconBg: '#8B5CF6', type: 'toggle', toggled: false },
      ]},
      { id: 'notifications', title: 'Notifications', subtitle: 'Status bar, Do not disturb', icon: '🔔', iconBg: '#F59E0B', type: 'navigate', children: [
        { id: 'app-notifications', title: 'App notifications', icon: '📱', iconBg: '#F59E0B', type: 'navigate' },
        { id: 'notification-style', title: 'Notification style', icon: '🎨', iconBg: '#EC4899', type: 'navigate' },
        { id: 'dnd', title: 'Do not disturb', icon: '🔕', iconBg: '#6366F1', type: 'toggle', toggled: false },
      ]},
      { id: 'display', title: 'Display', subtitle: 'Brightness, Dark mode, Font', icon: '☀️', iconBg: '#06B6D4', type: 'navigate', children: [
        { id: 'brightness', title: 'Brightness', icon: '🔆', iconBg: '#F59E0B', type: 'navigate' },
        { id: 'dark-mode', title: 'Dark mode', icon: '🌙', iconBg: '#1E293B', type: 'toggle', toggled: false },
        { id: 'motion-smoothness', title: 'Motion smoothness', icon: '🏃', iconBg: '#3B82F6', type: 'navigate' },
        { id: 'touch-sensitivity', title: 'Touch sensitivity', icon: '👆', iconBg: '#10B981', type: 'toggle', toggled: false },
        { id: 'navigation-bar', title: 'Navigation bar', icon: '📐', iconBg: '#8B5CF6', type: 'navigate' },
        { id: 'font-size', title: 'Font size and style', icon: '🔤', iconBg: '#EC4899', type: 'navigate' },
      ]},
    ]
  },
  {
    id: 'battery_perf',
    items: [
      { id: 'battery', title: 'Battery', subtitle: '88%', icon: '🔋', iconBg: '#10B981', type: 'navigate', children: [
        { id: 'bg-usage-limits', title: 'Background usage limits', icon: '📊', iconBg: '#3B82F6', type: 'navigate' },
        { id: 'battery-protection', title: 'Battery protection', icon: '🛡️', iconBg: '#10B981', type: 'navigate' },
        { id: 'charging-settings', title: 'Charging settings', icon: '⚡', iconBg: '#F59E0B', type: 'navigate' },
        { id: 'power-saving', title: 'Power saving', icon: '🔋', iconBg: '#10B981', type: 'toggle', toggled: false },
      ]},
      { id: 'device-care', title: 'Device care', subtitle: 'Battery, Storage, Memory', icon: '🛡️', iconBg: '#3B82F6', type: 'navigate', children: [
        { id: 'optimize-now', title: 'Optimize now', icon: '✨', iconBg: '#10B981', type: 'navigate' },
        { id: 'storage', title: 'Storage', icon: '💾', iconBg: '#F59E0B', type: 'navigate' },
        { id: 'memory', title: 'Memory', icon: '🧠', iconBg: '#8B5CF6', type: 'navigate' },
      ]},
    ]
  },
  {
    id: 'apps',
    items: [
      { id: 'apps', title: 'Apps', subtitle: 'Default apps, App permissions', icon: '📦', iconBg: '#8B5CF6', type: 'navigate', children: [
        { id: 'camera-app', title: 'Camera', subtitle: 'Version 14.0.2', icon: '📷', iconBg: '#F59E0B', type: 'navigate' },
        { id: 'samsung-internet', title: 'Samsung Internet', subtitle: 'Version 26.0.1', icon: '🌐', iconBg: '#6366F1', type: 'navigate' },
        { id: 'messages', title: 'Messages', subtitle: 'Version 15.2.0', icon: '💬', iconBg: '#10B981', type: 'navigate' },
      ]},
    ]
  },
  {
    id: 'security',
    items: [
      { id: 'location', title: 'Location', subtitle: 'On', icon: '📍', iconBg: '#EF4444', type: 'toggle', toggled: true },
      { id: 'security-privacy', title: 'Security and privacy', subtitle: 'Lock screen, Permissions', icon: '🔒', iconBg: '#10B981', type: 'navigate', children: [
        { id: 'permission-manager', title: 'Permission manager', icon: '🔐', iconBg: '#10B981', type: 'navigate' },
        { id: 'biometrics', title: 'Biometrics', icon: '👁️', iconBg: '#3B82F6', type: 'navigate' },
      ]},
    ]
  },
  {
    id: 'general',
    items: [
      { id: 'accounts', title: 'Accounts and backup', subtitle: 'Samsung, Google', icon: '👤', iconBg: '#06B6D4', type: 'navigate' },
      { id: 'general-management', title: 'General management', subtitle: 'Language, Reset, Date and time', icon: '⚙️', iconBg: '#6B7280', type: 'navigate', children: [
        { id: 'language', title: 'Language', icon: '🌐', iconBg: '#3B82F6', type: 'navigate' },
        { id: 'date-time', title: 'Date and time', icon: '🕐', iconBg: '#F59E0B', type: 'navigate' },
        { id: 'reset', title: 'Reset', icon: '🔄', iconBg: '#EF4444', type: 'navigate', children: [
          { id: 'reset-network', title: 'Reset network settings', icon: '📡', iconBg: '#3B82F6', type: 'navigate' },
          { id: 'factory-reset', title: 'Factory data reset', icon: '⚠️', iconBg: '#EF4444', type: 'navigate' },
        ]},
      ]},
      { id: 'software-update', title: 'Software update', subtitle: 'One UI 7.0 · Up to date', icon: '⬇️', iconBg: '#3B82F6', type: 'navigate' },
      { id: 'about-phone', title: 'About phone', subtitle: 'Galaxy S24 Ultra', icon: 'ℹ️', iconBg: '#6B7280', type: 'navigate' },
    ]
  },
];

// ──────────────────────────────────────────────────────────────
// App List for Home Screen & App Drawer
// ──────────────────────────────────────────────────────────────

export interface AppInfo {
  id: string;
  name: string;
  icon: string;
  iconBg: string;
  action?: 'settings' | 'none';
}

export const ALL_APPS: AppInfo[] = [
  { id: 'settings', name: 'Settings', icon: '⚙️', iconBg: '#6B7280', action: 'settings' },
  { id: 'camera', name: 'Camera', icon: '📷', iconBg: '#F59E0B', action: 'none' },
  { id: 'gallery', name: 'Gallery', icon: '🖼️', iconBg: '#F97316', action: 'none' },
  { id: 'phone', name: 'Phone', icon: '📞', iconBg: '#10B981', action: 'none' },
  { id: 'messages', name: 'Messages', icon: '💬', iconBg: '#3B82F6', action: 'none' },
  { id: 'chrome', name: 'Samsung Internet', icon: '🌐', iconBg: '#6366F1', action: 'none' },
  { id: 'clock', name: 'Clock', icon: '⏰', iconBg: '#EF4444', action: 'none' },
  { id: 'calculator', name: 'Calculator', icon: '🧮', iconBg: '#8B5CF6', action: 'none' },
  { id: 'calendar', name: 'Calendar', icon: '📅', iconBg: '#06B6D4', action: 'none' },
  { id: 'files', name: 'Files', icon: '📁', iconBg: '#F59E0B', action: 'none' },
  { id: 'notes', name: 'Samsung Notes', icon: '📝', iconBg: '#EC4899', action: 'none' },
  { id: 'play-store', name: 'Play Store', icon: '🛒', iconBg: '#10B981', action: 'none' },
  { id: 'youtube', name: 'YouTube', icon: '▶️', iconBg: '#EF4444', action: 'none' },
  { id: 'maps', name: 'Maps', icon: '🗺️', iconBg: '#10B981', action: 'none' },
  { id: 'samsung-health', name: 'Samsung Health', icon: '❤️', iconBg: '#EF4444', action: 'none' },
  { id: 'smartthings', name: 'SmartThings', icon: '🏠', iconBg: '#3B82F6', action: 'none' },
];

export const DOCK_APPS: AppInfo[] = [
  { id: 'phone', name: 'Phone', icon: '📞', iconBg: '#10B981', action: 'none' },
  { id: 'messages', name: 'Messages', icon: '💬', iconBg: '#3B82F6', action: 'none' },
  { id: 'chrome', name: 'Samsung Internet', icon: '🌐', iconBg: '#6366F1', action: 'none' },
  { id: 'camera', name: 'Camera', icon: '📷', iconBg: '#F59E0B', action: 'none' },
];

export const HOME_APPS: AppInfo[] = ALL_APPS.slice(0, 8);

// ──────────────────────────────────────────────────────────────
// Phone Screen State
// ──────────────────────────────────────────────────────────────

type PhoneScreen = 'lock' | 'home' | 'settings' | 'app-drawer';

interface NavigationStep {
  screen: PhoneScreen;
  settingsPath: string[];
  label: string;
}

interface PhoneContextType {
  // Screen management
  currentScreen: PhoneScreen;
  setScreen: (screen: PhoneScreen) => void;
  
  // Settings navigation
  settingsPath: string[];
  navigateToSetting: (itemId: string) => void;
  goBackSettings: () => void;
  getCurrentSettingsItems: () => SettingsItem[];
  getCurrentTitle: () => string;
  
  // Toggle states
  toggleStates: Record<string, boolean>;
  toggleSetting: (itemId: string) => void;
  
  // Highlighted setting (for auto-navigation)
  highlightedSetting: string | null;
  setHighlightedSetting: (id: string | null) => void;
  
  // Auto-navigation animation
  isAutoNavigating: boolean;
  autoNavigateTo: (path: string[]) => Promise<void>;
  
  // Fixby overlay
  isFixbyOpen: boolean;
  setFixbyOpen: (open: boolean) => void;
  
  // App drawer
  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  
  // Manual Guidance
  manualGuidancePath: string[];
  setManualGuidancePath: (path: string[]) => void;
}

const PhoneContext = createContext<PhoneContextType | null>(null);

export function usePhone() {
  const ctx = useContext(PhoneContext);
  if (!ctx) throw new Error('usePhone must be used within PhoneProvider');
  return ctx;
}

// Helper to find a settings item by ID
function findSettingsItem(items: SettingsCategory[], path: string[]): SettingsItem[] {
  if (path.length === 0) {
    return items.flatMap(cat => cat.items);
  }
  
  let currentItems: SettingsItem[] = items.flatMap(cat => cat.items);
  for (const segment of path) {
    const found = currentItems.find(item => item.id === segment);
    if (found?.children) {
      currentItems = found.children;
    } else {
      return currentItems;
    }
  }
  return currentItems;
}

function findSettingTitle(items: SettingsCategory[], path: string[]): string {
  if (path.length === 0) return 'Settings';
  let currentItems: SettingsItem[] = items.flatMap(cat => cat.items);
  let title = 'Settings';
  for (const segment of path) {
    const found = currentItems.find(item => item.id === segment);
    if (found) {
      title = found.title;
      if (found.children) currentItems = found.children;
    }
  }
  return title;
}

export function PhoneProvider({ children }: { children: React.ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState<PhoneScreen>('lock');
  const [settingsPath, setSettingsPath] = useState<string[]>([]);
  const [manualGuidancePath, setManualGuidancePath] = useState<string[]>([]);
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    const collect = (items: SettingsItem[]) => {
      items.forEach(item => {
        if (item.type === 'toggle' && item.toggled !== undefined) {
          initial[item.id] = item.toggled;
        }
        if (item.children) collect(item.children);
      });
    };
    SETTINGS_DATA.forEach(cat => collect(cat.items));
    return initial;
  });
  const [highlightedSetting, setHighlightedSetting] = useState<string | null>(null);
  const [isAutoNavigating, setIsAutoNavigating] = useState(false);
  const [isFixbyOpen, setFixbyOpen] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const autoNavRef = useRef(false);

  const setScreen = useCallback((screen: PhoneScreen) => {
    if (screen === 'settings') {
      setSettingsPath([]);
    }
    setDrawerOpen(false);
    setCurrentScreen(screen);
  }, []);

  const navigateToSetting = useCallback((itemId: string) => {
    setSettingsPath(prev => [...prev, itemId]);
  }, []);

  const goBackSettings = useCallback(() => {
    setSettingsPath(prev => {
      if (prev.length <= 1) {
        return [];
      }
      return prev.slice(0, -1);
    });
    setHighlightedSetting(null);
  }, []);

  const getCurrentSettingsItems = useCallback(() => {
    return findSettingsItem(SETTINGS_DATA, settingsPath);
  }, [settingsPath]);

  const getCurrentTitle = useCallback(() => {
    return findSettingTitle(SETTINGS_DATA, settingsPath);
  }, [settingsPath]);

  const toggleSetting = useCallback((itemId: string) => {
    setToggleStates(prev => ({...prev, [itemId]: !prev[itemId]}));
  }, []);

  const autoNavigateTo = useCallback(async (path: string[]) => {
    if (autoNavRef.current) return;
    autoNavRef.current = true;
    setIsAutoNavigating(true);
    setCurrentScreen('settings');
    setSettingsPath([]);
    setDrawerOpen(false);
    
    await new Promise(r => setTimeout(r, 500));
    
    for (let i = 0; i < path.length; i++) {
      setSettingsPath(path.slice(0, i + 1));
      await new Promise(r => setTimeout(r, 500));
    }
    
    // Highlight the final item
    if (path.length > 0) {
      setHighlightedSetting(path[path.length - 1]);
    }
    
    setIsAutoNavigating(false);
    autoNavRef.current = false;
  }, []);

  return (
    <PhoneContext.Provider value={{
      currentScreen, setScreen,
      settingsPath, navigateToSetting, goBackSettings,
      getCurrentSettingsItems, getCurrentTitle,
      toggleStates, toggleSetting,
      highlightedSetting, setHighlightedSetting,
      isAutoNavigating, autoNavigateTo,
      isFixbyOpen, setFixbyOpen,
      isDrawerOpen, setDrawerOpen,
      manualGuidancePath, setManualGuidancePath
    }}>
      {children}
    </PhoneContext.Provider>
  );
}
