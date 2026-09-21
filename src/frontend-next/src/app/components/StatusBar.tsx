'use client';
import React, { useState, useEffect } from 'react';

export default function StatusBar() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="status-bar">
      <span className="status-time">{time}</span>
      <div className="status-icons">
        <span className="status-icon">📶</span>
        <span className="status-icon">📡</span>
        <span className="status-icon" style={{fontSize: '12px'}}>5G</span>
        <span className="status-icon">🔋</span>
        <span style={{fontSize: '12px', fontWeight: 500, color: '#333'}}>88%</span>
      </div>
    </div>
  );
}
