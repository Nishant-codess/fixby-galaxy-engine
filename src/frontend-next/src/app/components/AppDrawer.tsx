'use client';
import React, { useState } from 'react';
import { usePhone, ALL_APPS } from '../context/PhoneContext';
import { AppIcon } from './HomeScreen';
import { useTranslation } from '../context/TranslationContext';

export default function AppDrawer() {
  const { isDrawerOpen, setDrawerOpen, setScreen } = usePhone();
  const [search, setSearch] = useState('');
  const { t } = useTranslation();

  const handleAppClick = (appId: string) => {
    if (appId === 'settings') {
      setScreen('settings');
      setDrawerOpen(false);
    }
  };

  const getTranslatedAppName = (app: {id: string, name: string}) => {
    const key = `app.${app.id.replace(/-./g, x=>x[1].toUpperCase())}`;
    return t(key) !== key ? t(key) : app.name;
  };

  const filteredApps = ALL_APPS.filter(app => {
    const translatedName = getTranslatedAppName(app);
    return translatedName.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className={`app-drawer ${isDrawerOpen ? 'open' : ''}`}>
      <div className="app-drawer-header">
        <input 
          type="text" 
          className="app-drawer-search" 
          placeholder={t('app.searchApps') !== 'app.searchApps' ? t('app.searchApps') : 'Search apps...'} 
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="app-drawer-grid">
        {filteredApps.map(app => (
          <AppIcon key={app.id} app={app} onClick={() => handleAppClick(app.id)} />
        ))}
      </div>
    </div>
  );
}
