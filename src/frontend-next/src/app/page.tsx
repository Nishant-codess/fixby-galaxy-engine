"use client";

import { useState, useEffect } from "react";
import LandingPage from "@/app/components/LandingPage";
import PhoneSimulator from "@/app/components/PhoneSimulator";
import DemoGuide from "@/app/components/DemoGuide";
import "./transition.css";

export default function Home() {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isConsoleMode, setIsConsoleMode] = useState(false);
  const [skipTransitions, setSkipTransitions] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("fixby_mode") === "console") {
      setSkipTransitions(true);
      document.body.style.overflow = "hidden";
      if ((window as any).lenis) (window as any).lenis.stop();
      setIsFadingOut(true);
      setIsConsoleMode(true);
    }
  }, []);

  const handleEnterConsole = () => {
    document.body.style.overflow = "hidden";
    if ((window as any).lenis) (window as any).lenis.stop();
    setIsFadingOut(true);
    sessionStorage.setItem("fixby_mode", "console");
    setTimeout(() => setIsConsoleMode(true), 600);
  };

  const handleExitConsole = () => {
    const restoreStyle = document.getElementById("fixby-restore-screen");
    if (restoreStyle) restoreStyle.remove();
    document.body.style.overflow = "auto";
    if ((window as any).lenis) (window as any).lenis.start();
    setIsConsoleMode(false);
    setIsFadingOut(false);
    setSkipTransitions(false);
    sessionStorage.removeItem("fixby_mode");
  };

  return (
    <div className={`master-app-wrapper ${isFadingOut ? "fading-out" : ""} ${isConsoleMode ? "in-console" : ""} ${skipTransitions ? "skip-transitions" : ""}`}>
      <div className="cinematic-viewport">
        {/* Landing Page Content */}
        <div className="landing-layer">
          <LandingPage onEnterConsole={handleEnterConsole} />
        </div>

        {/* The Diagnostic App rendered inside the phone frame */}
        <div className="phone-app-layer">
          <PhoneSimulator isActive={isConsoleMode} />
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
    </div>
  );
}
