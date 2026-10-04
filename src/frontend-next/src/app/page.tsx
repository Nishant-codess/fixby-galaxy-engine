"use client";

import { useState, useEffect } from "react";
import LandingPage from "@/app/components/LandingPage";
import PhoneSimulator from "@/app/components/PhoneSimulator";
import DemoGuide from "@/app/components/DemoGuide";
import "./transition.css";
import { SettingsProvider } from "@/app/context/SettingsContext";
import { HistoryProvider, useHistory } from "@/app/context/HistoryContext";
import { FixbyTopNav } from "@/app/components/navigation/FixbyTopNav";
import { DeviceCapabilitiesModal } from "@/app/components/navigation/DeviceCapabilitiesModal";

function ConsoleExperience({
  isFadingOut,
  isConsoleMode,
  skipTransitions,
  handleEnterConsole,
  handleExitConsole,
}: {
  isFadingOut: boolean;
  isConsoleMode: boolean;
  skipTransitions: boolean;
  handleEnterConsole: () => void;
  handleExitConsole: () => void;
}) {
  const { setIsDrawerOpen } = useHistory();
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);

  return (
    <div className={`master-app-wrapper ${isFadingOut ? "fading-out" : ""} ${isConsoleMode ? "in-console" : ""} ${skipTransitions ? "skip-transitions" : ""}`}>
      {/* Top Navigation Bar in Console Mode */}
      {isConsoleMode && (
        <FixbyTopNav
          onOpenHistory={() => setIsDrawerOpen(true)}
          onOpenDeviceModal={() => setIsDeviceModalOpen(true)}
          onExitConsole={handleExitConsole}
        />
      )}

      <div className="cinematic-viewport">
        {/* Landing Page Content */}
        <div className="landing-layer">
          <LandingPage onEnterConsole={handleEnterConsole} />
        </div>

        {/* The Diagnostic App rendered inside the phone frame */}
        <div className="phone-app-layer" data-lenis-prevent="true">
          <PhoneSimulator />
        </div>
      </div>

      {/* Demo testing guide floats in beside the phone */}
      <DemoGuide isVisible={isConsoleMode} />
      
      {/* Back button floats in on the left side */}
      <button 
        className="back-to-landing-btn"
        onClick={handleExitConsole}
      >
        ← Back to Landing
      </button>

      {/* Device Capabilities Modal */}
      <DeviceCapabilitiesModal
        isOpen={isDeviceModalOpen}
        onClose={() => setIsDeviceModalOpen(false)}
      />
    </div>
  );
}

export default function Home() {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isConsoleMode, setIsConsoleMode] = useState(false);
  const [skipTransitions, setSkipTransitions] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("fixby_mode") === "console") {
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        setSkipTransitions(true);
        setIsFadingOut(true);
        setIsConsoleMode(true);
      }, 0);
    }
  }, []);

  const handleEnterConsole = () => {
    document.body.style.overflow = "hidden";
    setIsFadingOut(true);
    sessionStorage.setItem("fixby_mode", "console");
    setTimeout(() => setIsConsoleMode(true), 600);
  };

  const handleExitConsole = () => {
    const restoreStyle = document.getElementById("fixby-restore-screen");
    if (restoreStyle) restoreStyle.remove();
    document.body.style.overflow = "auto";
    setIsConsoleMode(false);
    setIsFadingOut(false);
    setSkipTransitions(false);
    sessionStorage.removeItem("fixby_mode");
  };

  return (
    <SettingsProvider>
      <HistoryProvider>
        <ConsoleExperience
          isFadingOut={isFadingOut}
          isConsoleMode={isConsoleMode}
          skipTransitions={skipTransitions}
          handleEnterConsole={handleEnterConsole}
          handleExitConsole={handleExitConsole}
        />
      </HistoryProvider>
    </SettingsProvider>
  );
}
