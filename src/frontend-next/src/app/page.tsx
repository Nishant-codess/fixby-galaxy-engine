"use client";

import { useState, useEffect } from "react";
import LandingPage from "@/app/components/LandingPage";
import PhoneSimulator from "@/app/components/PhoneSimulator";
import DemoGuide from "@/app/components/DemoGuide";
import "./transition.css";
import { SettingsProvider } from "@/app/context/SettingsContext";
import { HistoryProvider } from "@/app/context/HistoryContext";

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
  return (
    <div className={`master-app-wrapper ${isFadingOut ? "fading-out" : ""} ${isConsoleMode ? "in-console" : ""} ${skipTransitions ? "skip-transitions" : ""}`}>
      <div className="cinematic-viewport">
        {/* Landing Page Content */}
        <div className="landing-layer">
          <LandingPage onEnterConsole={handleEnterConsole} />
        </div>

        {/* The Diagnostic App rendered inside the phone frame */}
        <div className="phone-app-layer" data-lenis-prevent="true">
          <PhoneSimulator onExitConsole={handleExitConsole} />
        </div>
      </div>

      <DemoGuide isVisible={isConsoleMode} />
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
