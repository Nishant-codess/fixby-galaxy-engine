'use client';
import React from 'react';
import { usePhone, HOME_APPS, DOCK_APPS } from '../context/PhoneContext';

import { useTranslation } from '../context/TranslationContext';

function AppIcon({ app, onClick }: { app: { id: string; name: string; icon: string; iconBg: string }; onClick?: () => void }) {
  const { t } = useTranslation();
  
  // Try to find a translation for the app name, fallback to original
  const appKey = `app.${app.id.replace(/-./g, x=>x[1].toUpperCase())}`;
  const translatedName = t(appKey) !== appKey ? t(appKey) : app.name;
  
  return (
    <div className="app-icon-wrapper" onClick={onClick}>
      <div className="app-icon" style={{ background: app.iconBg }}>
        {app.icon}
      </div>
      <span className="app-icon-label">{translatedName}</span>
    </div>
  );
}

export default function HomeScreen() {
  const { currentScreen, setScreen, setDrawerOpen } = usePhone();

  if (currentScreen !== 'home') return null;

  const handleAppClick = (appId: string) => {
    if (appId === 'settings') {
      setScreen('settings');
    }
  };

  return (
    <div className="home-screen">
      <div className="home-wallpaper" />
      
      <div className="home-app-grid">
        {HOME_APPS.map(app => (
          <AppIcon key={app.id} app={app} onClick={() => handleAppClick(app.id)} />
        ))}
      </div>

      <div className="app-drawer-handle" onClick={() => setDrawerOpen(true)}>
        <div className="app-drawer-handle-bar" />
      </div>

      <div className="home-dock">
        {DOCK_APPS.map(app => (
          <AppIcon key={app.id} app={app} onClick={() => handleAppClick(app.id)} />
        ))}
      </div>
    </div>
  );
}

export { AppIcon };
