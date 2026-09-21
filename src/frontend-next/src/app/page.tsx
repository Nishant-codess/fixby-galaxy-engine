'use client';
import React from 'react';
import { PhoneProvider } from './context/PhoneContext';
import StatusBar from './components/StatusBar';
import NavigationBar from './components/NavigationBar';
import LockScreen from './components/LockScreen';
import HomeScreen from './components/HomeScreen';
import AppDrawer from './components/AppDrawer';
import SettingsApp from './components/SettingsApp';
import FixbyFAB from './components/FixbyFAB';
import FixbyOverlay from './components/FixbyOverlay';

function PhoneApp() {
  return (
    <div className="phone-container">
      <div className="phone-frame">
        <div className="phone-notch" />
        
        <StatusBar />
        
        <div className="phone-content">
          <LockScreen />
          <HomeScreen />
          <SettingsApp />
          <AppDrawer />
          <FixbyOverlay />
          <FixbyFAB />
        </div>
        
        <NavigationBar />
      </div>
    </div>
  );
}

import { TranslationProvider } from './context/TranslationContext';

export default function Page() {
  return (
    <TranslationProvider>
      <PhoneProvider>
        <PhoneApp />
      </PhoneProvider>
    </TranslationProvider>
  );
}
