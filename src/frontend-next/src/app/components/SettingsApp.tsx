'use client';
import React, { useRef, useEffect, useState } from 'react';
import { usePhone, SettingsItem } from '../context/PhoneContext';

import { useTranslation } from '../context/TranslationContext';

export default function SettingsApp() {
  const { 
    currentScreen, 
    getCurrentSettingsItems, 
    getCurrentTitle,
    navigateToSetting,
    toggleSetting,
    toggleStates,
    highlightedSetting,
    settingsPath,
    goBackSettings
  } = usePhone();
  
  const { t, locale, setLocale } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const items = getCurrentSettingsItems();
  const rawTitle = getCurrentTitle();
  
  // Helper to translate setting IDs
  const getSettingKey = (id: string) => id.replace(/-./g, x=>x[1].toUpperCase());
  const titleKey = `settings.${getSettingKey(settingsPath[settingsPath.length-1] || 'settings')}`;
  const title = t(titleKey) !== titleKey ? t(titleKey) : rawTitle;

  // Scroll highlighted setting into view automatically
  useEffect(() => {
    if (highlightedSetting && scrollRef.current) {
      const el = scrollRef.current.querySelector('.highlighted');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightedSetting, currentScreen, settingsPath]);

  // Reset search when navigating settings
  useEffect(() => {
    setSearchQuery('');
  }, [settingsPath]);

  if (currentScreen !== 'settings') return null;

  const filteredItems = items.filter(item => {
    if (!searchQuery) return true;
    
    const itemKey = getSettingKey(item.id);
    const titleKey = `settings.${itemKey}`;
    const subtitleKey = `settings.${itemKey}Desc`;
    const translatedTitle = t(titleKey) !== titleKey ? t(titleKey) : item.title;
    const translatedSubtitle = t(subtitleKey) !== subtitleKey ? t(subtitleKey) : item.subtitle;
    
    const q = searchQuery.toLowerCase();
    return (
      translatedTitle.toLowerCase().includes(q) || 
      (translatedSubtitle && translatedSubtitle.toLowerCase().includes(q))
    );
  });

  return (
    <div className="settings-app">
      {settingsPath.length === 0 ? (
        <div className="settings-header">
          <h1 className="settings-title">{t('app.settings') !== 'app.settings' ? t('app.settings') : 'Settings'}</h1>
          <div className="settings-search-container">
            <span className="settings-search-icon">🔍</span>
            <input 
              type="text" 
              className="settings-search" 
              placeholder={t('settings.searchPlaceholder') !== 'settings.searchPlaceholder' ? t('settings.searchPlaceholder') : 'Search settings'} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      ) : (
        <div className="settings-sub-header">
          <button className="settings-back-btn" onClick={goBackSettings}>
            ←
          </button>
          <h1 className="settings-sub-title">{title}</h1>
        </div>
      )}

      <div className="settings-scroll" ref={scrollRef}>
        <div className="settings-group">
          {filteredItems.map(item => {
            const itemKey = getSettingKey(item.id);
            const titleKey = `settings.${itemKey}`;
            const subtitleKey = `settings.${itemKey}Desc`;
            let translatedTitle = t(titleKey) !== titleKey ? t(titleKey) : item.title;
            const translatedSubtitle = t(subtitleKey) !== subtitleKey ? t(subtitleKey) : item.subtitle;
            
            if (item.id === 'language') {
               translatedTitle = `${translatedTitle} (${locale.toUpperCase()})`;
            }
            
            return (
            <div 
              key={item.id} 
              className={`settings-item ${highlightedSetting === item.id ? 'highlighted' : ''}`}
              onClick={() => {
                if (item.id === 'language') {
                  const locales: ('en' | 'hi' | 'hi-en' | 'ko')[] = ['en', 'hi', 'hi-en', 'ko'];
                  const nextIndex = (locales.indexOf(locale) + 1) % locales.length;
                  setLocale(locales[nextIndex]);
                } else if (item.type === 'navigate') {
                  navigateToSetting(item.id);
                } else if (item.type === 'toggle') {
                  toggleSetting(item.id);
                }
              }}
            >
              <div className="settings-item-icon" style={{ background: item.iconBg }}>
                {item.icon}
              </div>
              <div className="settings-item-content">
                <div className="settings-item-title">{translatedTitle}</div>
                {item.subtitle && <div className="settings-item-subtitle">{translatedSubtitle}</div>}
              </div>
              
              {item.type === 'navigate' && <div className="settings-item-arrow">›</div>}
              {item.type === 'toggle' && (
                <button 
                  className={`settings-toggle ${toggleStates[item.id] ? 'on' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSetting(item.id);
                  }}
                />
              )}
            </div>
            );
          })}
          {filteredItems.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              No results found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
