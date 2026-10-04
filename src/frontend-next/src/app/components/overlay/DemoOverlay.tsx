import React from 'react';
import { IFilm, ICheckCircle, ICircleDot } from '../ui/Icons';

export interface DemoOverlayProps {
  title: string;
  pathSegments: string[];
  currentStep: number;
  totalSteps: number;
  onSkip: () => void;
}

export function DemoOverlay({ title, pathSegments, currentStep, totalSteps, onSkip }: DemoOverlayProps) {
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  return (
    <div
      data-testid="demo-overlay"
      style={{
        position: 'absolute', top: '28px', left: '12px', right: '12px', zIndex: 250,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '16px 20px',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      animation: 'demoSlideIn 0.3s ease-out',
    }}>
      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center' }}><IFilm style={{ width: '16px', height: '16px' }} /></span>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Demo: {title}</span>
        </div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
          Step {Math.min(currentStep + 1, totalSteps)}/{totalSteps}
        </div>
      </div>

      {/* Breadcrumb path */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {pathSegments.map((seg, i) => {
          const isCompleted = i <= currentStep;
          const isCurrent = i === currentStep;
          return (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{
                fontSize: '12px', fontWeight: isCurrent ? 700 : 400,
                color: isCompleted ? '#34c759' : isCurrent ? '#2075d6' : 'rgba(255,255,255,0.35)',
                transition: 'color 0.3s, font-weight 0.3s',
              }}>
                {isCompleted && !isCurrent ? <><ICheckCircle style={{ width: '12px', height: '12px', verticalAlign: 'middle' }} />{' '}</> : isCurrent ? <><ICircleDot style={{ width: '12px', height: '12px', verticalAlign: 'middle' }} />{' '}</> : ''}{seg}
              </span>
              {i < pathSegments.length - 1 && (
                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px' }}>›</span>
              )}
            </span>
          );
        })}
      </div>

      {/* Progress bar */}
      <div style={{
        height: '4px', borderRadius: '2px',
        background: 'rgba(255,255,255,0.1)',
        marginBottom: '12px', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', borderRadius: '2px',
          background: 'linear-gradient(90deg, #2075d6, #34c759)',
          width: `${progress}%`,
          transition: 'width 0.5s ease',
        }} />
      </div>

      {/* Skip button */}
      <div
        data-testid="demo-skip-btn"
        onClick={onSkip}
        style={{
          textAlign: 'center', fontSize: '12px', fontWeight: 600,
          color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
          padding: '4px 0',
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
      >
        Skip Demo →
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes demoSlideIn { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}} />
    </div>
  );
}
