/**
 * src/app/context/SettingsContext.tsx
 * Centralized, Reactive Device Settings Store & Action Executor for Fixby
 * Single source of truth across all Samsung One UI settings screens and automated troubleshooting fixes.
 */

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
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
  // Master reactive settings state
  settings: DeviceSettingsState;
  setSetting: <K extends DeviceSettingKey>(key: K, value: DeviceSettingsState[K]) => void;
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
  const [lastActionResult, setLastActionResult] = useState<ActionResult | null>(null);

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
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }, []);

  // Centralized Action Execution Engine
  const executeAction = useCallback(async (action: FixAction): Promise<ActionResult> => {
    const capability = checkCapability(action);

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
      const def = SETTING_DEFINITIONS[key];
      const settingTitle = def?.title || key;

      let newValue: any;

      if (action.type === "TOGGLE_ON") {
        newValue = true;
      } else if (action.type === "TOGGLE_OFF") {
        newValue = false;
      } else if (action.type === "TOGGLE") {
        newValue = !(settings as any)[key];
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
        message: `${settingTitle} ${typeof newValue === "boolean" ? (newValue ? "turned ON" : "turned OFF") : `set to ${newValue}`}`,
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
  }, [settings, setSetting]);

  const clearLastActionResult = useCallback(() => {
    setLastActionResult(null);
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        setSetting,
        resetAllSettings,
        executeAction,
        lastActionResult,
        clearLastActionResult,

        // Backward compatibility getters & setters
        darkMode: settings.darkMode,
        setDarkMode: (val: boolean) => setSetting("darkMode", val),
        brightness: settings.brightness,
        setBrightness: (val: number) => setSetting("brightness", val),
        motionSmoothness: settings.motionSmoothness,
        setMotionSmoothness: (val: MotionSmoothnessMode) => setSetting("motionSmoothness", val),
        extraBrightness: settings.extraBrightness,
        setExtraBrightness: (val: boolean) => setSetting("extraBrightness", val),
        easyMode: settings.easyMode,
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
