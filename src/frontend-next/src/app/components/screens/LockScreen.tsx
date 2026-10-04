import React, { useState, useEffect, useRef } from 'react';
import { ICamera, IMessageCircle, IMail, IPhone } from '../ui/Icons';
import { Screen } from '../../../hooks/usePhoneNavigation';

export function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [time, setTime] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTime(`${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`);
      setDateStr(d.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    const startY = e.clientY;
    
    const onMove = (moveEvent: PointerEvent) => {
      const dy = startY - moveEvent.clientY;
      if (dy > 100 && !isUnlocking) {
        setIsUnlocking(true);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        setTimeout(onUnlock, 400); // Wait for unlock animation
      }
    };
    
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const handleUnlockClick = () => {
    if (!isUnlocking) {
      setIsUnlocking(true);
      setTimeout(onUnlock, 300);
    }
  };

  return (
    <div 
      ref={containerRef}
      data-testid="lock-screen"
      onPointerDown={handlePointerDown}
      onClick={handleUnlockClick}
      style={{
        position: 'absolute', inset: 0, zIndex: 50,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingTop: '80px', color: '#fff',
        transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease',
        transform: isUnlocking ? 'translateY(-100%)' : 'translateY(0)',
        opacity: isUnlocking ? 0 : 1,
        userSelect: 'none', touchAction: 'none'
      }}
    >
      <div style={{ fontSize: '18px', fontWeight: 300, marginBottom: '8px', opacity: 0.9 }}>
        {dateStr}
      </div>
      <div style={{ fontSize: '72px', fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1 }}>
        {time}
      </div>
      
      {/* Notifications mockup */}
      <div style={{ marginTop: '32px', display: 'flex', gap: '8px', opacity: 0.7 }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IMessageCircle style={{ width: '16px', height: '16px' }} /></div>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IMail style={{ width: '16px', height: '16px' }} /></div>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0 32px 48px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IPhone style={{ width: '20px', height: '20px' }} />
        </div>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ICamera />
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.6 }}>
        <div style={{ fontSize: '14px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Swipe to unlock
        </div>
      </div>
    </div>
  );
}
