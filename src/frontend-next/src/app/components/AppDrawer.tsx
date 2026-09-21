'use client';
import React, { useState } from 'react';
import { usePhone, ALL_APPS } from '../context/PhoneContext';
import { AppIcon } from './HomeScreen';

export default function AppDrawer() {
  const { isDrawerOpen, setDrawerOpen, setScreen } = usePhone();
  const [search, setSearch] = useState('');

  const handleAppClick = (appId: string) => {
    if (appId === 'settings') {
      setScreen('settings');
      setDrawerOpen(false);
    }
  };

  const filteredApps = ALL_APPS.filter(app => 
    app.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`app-drawer ${isDrawerOpen ? 'open' : ''}`}>
      <div className="app-drawer-header">
        <input 
          type="text" 
          className="app-drawer-search" 
          placeholder="Search apps..." 
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
