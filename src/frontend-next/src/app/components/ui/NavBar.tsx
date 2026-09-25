import React from 'react';
import { Ripple } from './Ripple';
import { Screen } from '../../hooks/usePhoneNavigation';

export function NavBar({ currentScreen, onBack, onHome, onRecents }: {
  currentScreen: Screen;
  onBack: () => void;
  onHome: () => void;
  onRecents: () => void;
}) {
  const isHome = currentScreen === 'home' || currentScreen === 'lock';
  
  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0,
      height: "48px", display: "flex", alignItems: "center", justifyContent: "space-around",
      background: "transparent", zIndex: 100,
      padding: "0 20px"
    }}>
      <Ripple 
        onClick={isHome ? undefined : onBack} 
        style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isHome ? 0.3 : 1, cursor: isHome ? 'default' : 'pointer' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </Ripple>

      <Ripple 
        onClick={currentScreen === 'lock' ? undefined : onHome} 
        style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: currentScreen === 'lock' ? 0.3 : 1, cursor: currentScreen === 'lock' ? 'default' : 'pointer' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <rect x="4" y="4" width="16" height="16" rx="6" />
        </svg>
      </Ripple>

      <Ripple 
        onClick={currentScreen === 'lock' ? undefined : onRecents} 
        style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: currentScreen === 'lock' ? 0.3 : 1, cursor: currentScreen === 'lock' ? 'default' : 'pointer' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      </Ripple>
    </div>
  );
}
