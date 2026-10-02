"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface SettingsContextType {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  brightness: number;
  setBrightness: (value: number) => void;
  motionSmoothness: "Adaptive" | "Standard";
  setMotionSmoothness: (value: "Adaptive" | "Standard") => void;
  extraBrightness: boolean;
  setExtraBrightness: (value: boolean) => void;
  easyMode: boolean;
  setEasyMode: (value: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(true);
  const [brightness, setBrightness] = useState(65);
  const [motionSmoothness, setMotionSmoothness] = useState<"Adaptive" | "Standard">("Adaptive");
  const [extraBrightness, setExtraBrightness] = useState(false);
  const [easyMode, setEasyMode] = useState(false);

  return (
    <SettingsContext.Provider
      value={{
        darkMode,
        setDarkMode,
        brightness,
        setBrightness,
        motionSmoothness,
        setMotionSmoothness,
        extraBrightness,
        setExtraBrightness,
        easyMode,
        setEasyMode,
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
