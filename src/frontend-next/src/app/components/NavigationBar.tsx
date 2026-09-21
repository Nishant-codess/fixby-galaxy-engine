'use client';
import React from 'react';
import { usePhone } from '../context/PhoneContext';

export default function NavigationBar() {
  const { currentScreen, setScreen, goBackSettings, settingsPath, isDrawerOpen, setDrawerOpen } = usePhone();

  const handleBack = () => {
    if (isDrawerOpen) {
      setDrawerOpen(false);
    } else if (currentScreen === 'settings') {
      if (settingsPath.length > 0) {
        goBackSettings();
      } else {
        setScreen('home');
      }
    }
  };

  const handleHome = () => {
    setDrawerOpen(false);
    setScreen('home');
  };

  const handleRecent = () => {
    // No-op in simulator
  };

  return (
    <div className="nav-bar">
      <div className="nav-buttons">
        <button className="nav-btn" onClick={handleRecent} aria-label="Recent apps">
          ▭
        </button>
        <button className="nav-btn" onClick={handleHome} aria-label="Home">
          ●
        </button>
        <button className="nav-btn" onClick={handleBack} aria-label="Back">
          ◁
        </button>
      </div>
    </div>
  );
}
