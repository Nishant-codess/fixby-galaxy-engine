"use client";

import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { IXClose, ICheck, IZap, IAlertTriangle, ISettings } from '../ui/Icons';

interface DeviceCapabilitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeviceCapabilitiesModal({ isOpen, onClose }: DeviceCapabilitiesModalProps) {
  const { darkMode, settings } = useSettings();

  if (!isOpen) return null;

  return (
    <div
      data-testid="device-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 550,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(10px)',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        data-testid="device-modal-content"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          background: darkMode ? 'rgba(24, 26, 32, 0.95)' : 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(30px) saturate(1.8)',
          borderRadius: '28px',
          border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px 28px 18px',
          borderBottom: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '8px',
                background: 'rgba(32, 117, 214, 0.15)',
                color: 'var(--oneui-accent-light)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}>
                Environment & Architecture
              </span>
            </div>
            <h3 style={{
              margin: '6px 0 0',
              fontSize: '19px',
              fontWeight: 700,
              color: 'var(--oneui-text-primary)',
            }}>
              Samsung Device & Capabilities
            </h3>
          </div>

          <button
            data-testid="device-modal-close-btn"
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
              border: 'none',
              color: 'var(--oneui-text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <IXClose style={{ width: '16px', height: '16px' }} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{
          padding: '24px 28px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}>
          {/* Device Profile Card */}
          <div style={{
            padding: '16px 20px',
            borderRadius: '20px',
            background: darkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
            border: darkMode ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
          }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--oneui-text-secondary)', textTransform: 'uppercase' }}>Target Device</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--oneui-text-primary)', marginTop: '2px' }}>Galaxy S24 Ultra (SM-S928B)</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--oneui-text-secondary)', textTransform: 'uppercase' }}>Software Version</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--oneui-text-primary)', marginTop: '2px' }}>One UI 6.1 • Android 14</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--oneui-text-secondary)', textTransform: 'uppercase' }}>AI Troubleshooting Engine</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--oneui-accent-light)', marginTop: '2px' }}>Fixby Autonomous Agent v1.1</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--oneui-text-secondary)', textTransform: 'uppercase' }}>Current Power State</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: settings.powerSaving ? 'var(--oneui-success)' : 'var(--oneui-warning)', marginTop: '2px' }}>
                {settings.powerSaving ? 'Power Saving ON' : 'Standard Mode'}
              </div>
            </div>
          </div>

          {/* Capabilities Grid */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--oneui-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
              Execution Matrix
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Feature 1 */}
              <div style={{
                padding: '12px 16px',
                borderRadius: '16px',
                background: darkMode ? 'rgba(52, 199, 89, 0.08)' : 'rgba(52, 199, 89, 0.06)',
                border: '1px solid rgba(52, 199, 89, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <div style={{ color: 'var(--oneui-success)' }}>
                  <ICheck style={{ width: '18px', height: '18px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--oneui-text-primary)' }}>
                    Simulated Central Settings Engine (Full Execution)
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--oneui-text-secondary)', marginTop: '1px' }}>
                    Reactive controls for Power saving, Motion smoothness (120Hz/60Hz), Sound modes, Wi-Fi, Dark mode, Storage cleanup, and Deep sleeping apps.
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div style={{
                padding: '12px 16px',
                borderRadius: '16px',
                background: darkMode ? 'rgba(32, 117, 214, 0.08)' : 'rgba(32, 117, 214, 0.06)',
                border: '1px solid rgba(32, 117, 214, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <div style={{ color: 'var(--oneui-accent-light)' }}>
                  <IZap style={{ width: '18px', height: '18px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--oneui-text-primary)' }}>
                    Web Companion Fallbacks
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--oneui-text-secondary)', marginTop: '1px' }}>
                    Supported Google / web companion apps (Google Maps, Chrome, YouTube) resolve gracefully with dedicated web companion URLs.
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div style={{
                padding: '12px 16px',
                borderRadius: '16px',
                background: darkMode ? 'rgba(255, 159, 10, 0.08)' : 'rgba(255, 159, 10, 0.06)',
                border: '1px solid rgba(255, 159, 10, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <div style={{ color: 'var(--oneui-warning)' }}>
                  <IAlertTriangle style={{ width: '18px', height: '18px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--oneui-text-primary)' }}>
                    Native Android One UI Guard (Honest Isolation)
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--oneui-text-secondary)', marginTop: '1px' }}>
                    System dialer, Camera driver, and KNOX partition operations honestly inform the user that native Samsung Android integration is required.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 28px',
          borderTop: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #2075D6 0%, #6C47FF 100%)',
              border: 'none',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(32, 117, 214, 0.3)',
            }}
          >
            Got it
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}} />
    </div>
  );
}
