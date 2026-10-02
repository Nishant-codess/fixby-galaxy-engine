import React, { useEffect, useState } from 'react';
import { ICheckCircle, IXClose } from '../ui/Icons';

export interface SuccessToastProps {
  message: string;
  onDismiss: () => void;
  durationMs?: number;
}

export function SuccessToast({ message, onDismiss, durationMs = 3000 }: SuccessToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => setIsVisible(true));

    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onDismiss, 300); // Wait for exit animation
    }, durationMs);

    return () => clearTimeout(exitTimer);
  }, [durationMs, onDismiss]);

  return (
    <div style={{
      position: 'absolute', bottom: '56px', left: '16px', right: '16px', zIndex: 195,
      background: 'rgba(52, 199, 89, 0.95)',
      backdropFilter: 'blur(16px)',
      borderRadius: '16px',
      padding: '14px 18px',
      display: 'flex', alignItems: 'center', gap: '10px',
      boxShadow: '0 8px 24px rgba(52, 199, 89, 0.25)',
      border: '1px solid rgba(255,255,255,0.15)',
      transform: isVisible && !isExiting ? 'translateY(0)' : 'translateY(20px)',
      opacity: isVisible && !isExiting ? 1 : 0,
      transition: 'transform 0.3s ease, opacity 0.3s ease',
    }}>
      <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center' }}><ICheckCircle style={{ width: '18px', height: '18px' }} /></span>
      <span style={{ fontSize: '14px', fontWeight: 500, color: '#fff', flex: 1, lineHeight: 1.4 }}>
        {message}
      </span>
      <div
        onClick={onDismiss}
        style={{
          fontSize: '12px', color: 'rgba(255,255,255,0.7)',
          cursor: 'pointer', padding: '4px',
        }}
      ><IXClose style={{ width: '12px', height: '12px' }} /></div>
    </div>
  );
}
