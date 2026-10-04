import React from 'react';
import { IAlertTriangle } from './Icons';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 300,
      background: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: 'var(--oneui-bg-card)',
        borderRadius: '28px',
        padding: '24px 22px 18px',
        maxWidth: '320px',
        width: '100%',
        boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.08)',
        animation: 'popIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        display: 'flex', flexDirection: 'column', gap: '14px'
      }}>
        {/* Header Icon & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: isDestructive ? 'rgba(255, 59, 48, 0.15)' : 'rgba(255, 149, 0, 0.15)',
            color: isDestructive ? '#ff3b30' : '#ff9500',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            <IAlertTriangle style={{ width: '18px', height: '18px' }} />
          </div>
          <div style={{ fontSize: '17px', fontWeight: 600, color: 'var(--oneui-text-primary)', lineHeight: 1.2 }}>
            {title}
          </div>
        </div>

        {/* Message */}
        <div style={{ fontSize: '13px', color: 'var(--oneui-text-secondary)', lineHeight: 1.5 }}>
          {message}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '12px 16px', borderRadius: '16px',
              border: '1px solid var(--oneui-separator)',
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--oneui-text-primary)',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer'
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '12px 16px', borderRadius: '16px',
              border: 'none',
              background: isDestructive ? '#ff3b30' : 'var(--oneui-accent)',
              color: '#fff',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              boxShadow: isDestructive ? '0 4px 12px rgba(255,59,48,0.3)' : '0 4px 12px rgba(32,117,214,0.3)'
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
