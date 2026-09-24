'use client';
import React from 'react';
import { usePhone } from '../context/PhoneContext';

export default function FixbyFAB() {
  const { setFixbyOpen, currentScreen } = usePhone();

  // Only show on Settings screen
  if (currentScreen !== 'settings') return null;

  return (
    <button 
      className="fixby-fab" 
      onClick={() => setFixbyOpen(true)}
      aria-label="Open Fixby Support"
    >
      <div className="fixby-fab-ring" />
      <span className="fixby-fab-icon">✨</span>
    </button>
  );
}
