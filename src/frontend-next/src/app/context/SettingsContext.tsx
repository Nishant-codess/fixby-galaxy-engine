/**
 * src/app/context/SettingsContext.tsx
 * Centralized, Reactive Device Settings Store & Action Executor for Fixby
 * Single source of truth across all Samsung One UI settings screens and automated troubleshooting fixes.
 */

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, ReactNode } from "react";
import {
  DeviceSettingsState,
  DeviceSettingKey,
  INITIAL_SETTINGS_STATE,
  SETTING_DEFINITIONS,
  MotionSmoothnessMode,
} from "../../settings/definitions";
import {
  FixAction,
  ActionResult,
  checkCapability,
  openApp,
} from "../../settings/actions";

interface SettingsContextType {
  // Visible settings. During a Watch Demo this includes a temporary preview
  // that is never written to localStorage.
  settings: DeviceSettingsState;
  setSetting: <K extends DeviceSettingKey>(key: K, value: DeviceSettingsState[K]) => void;
  setDemoPreview: <K extends DeviceSettingKey>(key: K, value: DeviceSettingsState[K]) => void;
  clearDemoPreview: () => void;
  resetAllSettings: () => void;

  // Central Action Engine Executor
  executeAction: (action: FixAction) => Promise<ActionResult>;
  lastActionResult: ActionResult | null;
  clearLastActionResult: () => void;

  // Legacy direct accessors for backward compatibility
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  brightness: number;
  setBrightness: (value: number) => void;
  motionSmoothness: MotionSmoothnessMode;
  setMotionSmoothness: (value: MotionSmoothnessMode) => void;
  extraBrightness: boolean;
  setExtraBrightness: (value: boolean) => void;
  easyMode: boolean;
  setEasyMode: (value: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY = "fixby_device_settings_v1";

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<DeviceSettingsState>(INITIAL_SETTINGS_STATE);
  const [demoPreview, setDemoPreviewState] = useState<Partial<DeviceSettingsState> | null>(null);
  const [lastActionResult, setLastActionResult] = useState<ActionResult | null>(null);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // Hydrate from localStorage once mounted on client
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettingsState(prev => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.warn("Failed to load saved Fixby settings:", e);
    }
  }, []);

  // Update a single setting with persistence
  const setSetting = useCallback(<K extends DeviceSettingKey>(key: K, value: DeviceSettingsState[K]) => {
    setSettingsState(prev => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        // ignore quota errors
      }
      return next;
    });
  }, []);

  const resetAllSettings = useCallback(() => {
    setSettingsState(INITIAL_SETTINGS_STATE);
    setDemoPreviewState(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }, []);

  const setDemoPreview = useCallback(<K extends DeviceSettingKey>(key: K, value: DeviceSettingsState[K]) => {
    setDemoPreviewState(prev => ({ ...(prev || {}), [key]: value }));
  }, []);

  const clearDemoPreview = useCallback(() => {
    setDemoPreviewState(null);
  }, []);

  const visibleSettings = useMemo(
    () => (demoPreview ? { ...settings, ...demoPreview } : settings),
    [settings, demoPreview]
  );

  // Centralized Action Execution Engine
  const executeAction = useCallback(async (action: FixAction): Promise<ActionResult> => {
    const capability = checkCapability(action);

    if (!capability.supported) {
      const res: ActionResult = {
        success: false,
        actionId: action.id,
        message: capability.reason || `${action.title} requires native Samsung Android One UI integration.`,
        mode: "SIMULATED",
        requiresNativeAndroid: true,
      };
      setLastActionResult(res);
      return res;
    }

    // 1. App Launching Action
    if (action.type === "OPEN_APP") {
      if (!action.appPackage) {
        const res: ActionResult = {
          success: false,
          actionId: action.id,
          message: "No application package specified.",
          mode: "SIMULATED",
        };
        setLastActionResult(res);
        return res;
      }
      const res = await openApp({ packageName: action.appPackage, appName: action.appName });
      setLastActionResult(res);
      return res;
    }

    // 2. Setting Modification Actions
    if (action.settingKey) {
      const key = action.settingKey;
      const committed = settingsRef.current;
      const def = SETTING_DEFINITIONS[key];
      const settingTitle = def?.title || key;

      let newValue: any;

      if (action.type === "TOGGLE_ON") {
        newValue = true;
      } else if (action.type === "TOGGLE_OFF") {
        newValue = false;
      } else if (action.type === "TOGGLE") {
        newValue = !(committed as any)[key];
      } else if (action.type === "CONFIG_CHANGE" && action.targetValue !== undefined) {
        newValue = action.targetValue;
      } else {
        newValue = action.targetValue !== undefined ? action.targetValue : true;
      }

      // Mutate state in central store
      setSetting(key, newValue);

      const res: ActionResult = {
        success: true,
        actionId: action.id,
        settingKey: key,
        newValue,
        message: `${settingTitle} ${typeof newValue === "boolean" ? (newValue ? "enabled" : "disabled") : `set to ${newValue}`} in the Fixby simulator`,
        mode: capability.mode === "NATIVE" ? "NATIVE" : "SIMULATED",
      };
      setLastActionResult(res);
      return res;
    }

    // 3. Multi-Step or Navigation Action
    if (action.type === "NAVIGATE" || action.type === "MULTI_STEP") {
      const res: ActionResult = {
        success: true,
        actionId: action.id,
        message: `Navigated to ${action.title}`,
        mode: "SIMULATED",
      };
      setLastActionResult(res);
      return res;
    }

    // Fallback
    const res: ActionResult = {
      success: true,
      actionId: action.id,
      message: `Executed ${action.title}`,
      mode: "SIMULATED",
    };
    setLastActionResult(res);
    return res;
  }, [setSetting]);

  const clearLastActionResult = useCallback(() => {
    setLastActionResult(null);
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings: visibleSettings,
        setSetting,
        setDemoPreview,
        clearDemoPreview,
        resetAllSettings,
        executeAction,
        lastActionResult,
        clearLastActionResult,

        // Backward compatibility getters & setters
        darkMode: visibleSettings.darkMode,
        setDarkMode: (val: boolean) => setSetting("darkMode", val),
        brightness: visibleSettings.brightness,
        setBrightness: (val: number) => setSetting("brightness", val),
        motionSmoothness: visibleSettings.motionSmoothness,
        setMotionSmoothness: (val: MotionSmoothnessMode) => setSetting("motionSmoothness", val),
        extraBrightness: visibleSettings.extraBrightness,
        setExtraBrightness: (val: boolean) => setSetting("extraBrightness", val),
        easyMode: visibleSettings.easyMode,
        setEasyMode: (val: boolean) => setSetting("easyMode", val),
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
