'use client';
import React, { useState, useEffect } from 'react';
import { usePhone } from '../context/PhoneContext';

export default function LockScreen() {
  const { currentScreen, setScreen } = usePhone();
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
      setDate(now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleUnlock = () => {
    setUnlocking(true);
    setTimeout(() => {
      setScreen('home');
      setUnlocking(false);
    }, 500);
  };

  if (currentScreen !== 'lock') return null;

  return (
    <div className={`lock-screen ${unlocking ? 'unlocking' : ''}`} onClick={handleUnlock}>
      <div className="lock-time">{time}</div>
      <div className="lock-date">{date}</div>
      <div className="lock-hint">Tap anywhere to unlock</div>
    </div>
  );
}
