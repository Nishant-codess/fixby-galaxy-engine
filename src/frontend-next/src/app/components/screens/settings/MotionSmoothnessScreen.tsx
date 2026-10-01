import React, { useState } from 'react';
import { Ripple } from '../../ui/Ripple';

interface Props {
  onBack: () => void;
  targetPath?: string[];
  currentMode?: 'adaptive' | 'standard';
  onModeChange?: (mode: 'adaptive' | 'standard') => void;
}

export function MotionSmoothnessScreen({ 
  onBack, 
  targetPath = [], 
  currentMode = 'adaptive', 
  onModeChange 
}: Props) {
  const [selected, setSelected] = useState<'adaptive' | 'standard'>(currentMode);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isHighlighted = targetPath.join(' ').toLowerCase().includes('motion') || 
                        targetPath.join(' ').toLowerCase().includes('120') ||
                        targetPath.join(' ').toLowerCase().includes('smoothness');

  const handleApply = () => {
    onModeChange?.(selected);
    const msg = selected === 'adaptive' ? 'Applied: Adaptive (120 Hz)' : 'Applied: Standard (60 Hz)';
    setToastMessage(msg);
    setTimeout(() => {
      onBack();
    }, 700);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 35, background: 'var(--oneui-bg-primary)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Scrollable Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '56px 16px 24px' }}>
        
        {/* Back navigation */}
        <div 
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '12px', width: 'fit-content', color: 'var(--oneui-accent)', userSelect: 'none' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span style={{ fontSize: '15px', fontWeight: 500 }}>Display</span>
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: 300, color: 'var(--oneui-text-primary)', margin: '0 0 20px', letterSpacing: '-0.02em' }}>
          Motion smoothness
        </h1>

        {/* Visual Comparison Card */}
        <div style={{
          background: 'var(--oneui-bg-card)', borderRadius: '24px', padding: '20px',
          marginBottom: '20px', display: 'flex', gap: '12px'
        }}>
          {/* 120Hz Demo */}
          <div style={{
            flex: 1, padding: '16px', borderRadius: '16px',
            background: selected === 'adaptive' ? 'rgba(32, 117, 214, 0.12)' : 'rgba(255,255,255,0.03)',
            border: selected === 'adaptive' ? '2px solid var(--oneui-accent)' : '1px solid rgba(255,255,255,0.06)',
            textAlign: 'center', transition: 'all 0.25s ease'
          }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: selected === 'adaptive' ? 'var(--oneui-accent)' : 'var(--oneui-text-secondary)', fontWeight: 700, marginBottom: '6px' }}>
              120 Hz
            </div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
              Adaptive
            </div>
            <div style={{ height: '36px', display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' }}>
              <div style={{ height: '4px', background: 'var(--oneui-accent)', borderRadius: '2px', width: '80%', margin: '0 auto', animation: 'shimmer 1.2s infinite ease-in-out' }} />
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px', width: '60%', margin: '0 auto' }} />
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', width: '70%', margin: '0 auto' }} />
            </div>
            <div style={{ fontSize: '11px', color: 'var(--oneui-success)', marginTop: '8px', fontWeight: 600 }}>
              Ultra smooth
            </div>
          </div>

          {/* 60Hz Demo */}
          <div style={{
            flex: 1, padding: '16px', borderRadius: '16px',
            background: selected === 'standard' ? 'rgba(32, 117, 214, 0.12)' : 'rgba(255,255,255,0.03)',
            border: selected === 'standard' ? '2px solid var(--oneui-accent)' : '1px solid rgba(255,255,255,0.06)',
            textAlign: 'center', transition: 'all 0.25s ease'
          }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: selected === 'standard' ? 'var(--oneui-accent)' : 'var(--oneui-text-secondary)', fontWeight: 700, marginBottom: '6px' }}>
              60 Hz
            </div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
              Standard
            </div>
            <div style={{ height: '36px', display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' }}>
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.4)', borderRadius: '2px', width: '80%', margin: '0 auto' }} />
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', width: '60%', margin: '0 auto' }} />
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px', width: '70%', margin: '0 auto' }} />
            </div>
            <div style={{ fontSize: '11px', color: 'var(--oneui-text-secondary)', marginTop: '8px' }}>
              Saves battery
            </div>
          </div>
        </div>

        {/* Radio Options List */}
        <div style={{ background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden', marginBottom: '20px' }}>
          
          {/* Adaptive Option */}
          <Ripple 
            onClick={() => setSelected('adaptive')}
            style={{
              padding: '16px 20px', display: 'flex', gap: '14px', alignItems: 'flex-start',
              borderBottom: '1px solid var(--oneui-separator)', cursor: 'pointer',
              background: isHighlighted && selected === 'adaptive' ? 'rgba(32, 117, 214, 0.08)' : 'transparent',
              position: 'relative'
            }}
          >
            {/* Custom Radio Button */}
            <div style={{
              width: '22px', height: '22px', borderRadius: '50%',
              border: `2px solid ${selected === 'adaptive' ? 'var(--oneui-accent)' : 'rgba(255,255,255,0.3)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px', flexShrink: 0
            }}>
              {selected === 'adaptive' && (
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--oneui-accent)' }} />
              )}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '17px', fontWeight: 600, color: 'var(--oneui-text-primary)' }}>
                  Adaptive
                </span>
                {isHighlighted && (
                  <div style={{
                    background: 'linear-gradient(135deg, #2075d6, #6c47ff)',
                    color: '#fff', fontSize: '10px', fontWeight: 700,
                    padding: '2px 8px', borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(32,117,214,0.5)',
                    animation: 'popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}>
                    Tap here
                  </div>
                )}
              </div>
              <p style={{ fontSize: '13px', color: 'var(--oneui-text-secondary)', margin: 0, lineHeight: 1.45 }}>
                Get smoother animations and screen scrolling by automatically adjusting your screen refresh rate up to 120 Hz.
              </p>
            </div>
          </Ripple>

          {/* Standard Option */}
          <Ripple 
            onClick={() => setSelected('standard')}
            style={{
              padding: '16px 20px', display: 'flex', gap: '14px', alignItems: 'flex-start',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '22px', height: '22px', borderRadius: '50%',
              border: `2px solid ${selected === 'standard' ? 'var(--oneui-accent)' : 'rgba(255,255,255,0.3)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px', flexShrink: 0
            }}>
              {selected === 'standard' && (
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--oneui-accent)' }} />
              )}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '17px', fontWeight: 600, color: 'var(--oneui-text-primary)', marginBottom: '4px' }}>
                Standard
              </div>
              <p style={{ fontSize: '13px', color: 'var(--oneui-text-secondary)', margin: 0, lineHeight: 1.45 }}>
                Get longer battery life by setting your screen refresh rate to 60 Hz.
              </p>
            </div>
          </Ripple>

        </div>

      </div>

      {/* Bottom Sticky Action Bar */}
      <div style={{
        padding: '16px 20px 24px', background: 'var(--oneui-bg-primary)',
        borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '12px'
      }}>
        <button
          onClick={onBack}
          style={{
            flex: 1, padding: '14px', borderRadius: '24px', border: 'none',
            background: 'var(--oneui-bg-card)', color: 'var(--oneui-text-primary)',
            fontSize: '15px', fontWeight: 600, cursor: 'pointer'
          }}
        >
          Cancel
        </button>

        <button
          onClick={handleApply}
          style={{
            flex: 1, padding: '14px', borderRadius: '24px', border: 'none',
            background: 'var(--oneui-accent)', color: '#fff',
            fontSize: '15px', fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(32, 117, 214, 0.4)'
          }}
        >
          Apply
        </button>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div style={{
          position: 'absolute', bottom: '88px', left: '20px', right: '20px',
          background: 'rgba(20, 20, 20, 0.95)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px', padding: '12px 18px', textAlign: 'center',
          color: '#fff', fontSize: '13px', fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          animation: 'popIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          zIndex: 100
        }}>
          ✓ {toastMessage}
        </div>
      )}

    </div>
  );
}
