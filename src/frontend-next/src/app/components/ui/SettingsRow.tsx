'use client';
import React, { ReactNode, useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Ripple } from './Ripple';
import { IChevron } from './Icons';
import { OneUISwitch } from './OneUISwitch';

export interface SettingsRowProps {
  icon?: ReactNode;
  iconBg?: string;
  title: string;
  subtitle?: string;
  rightLabel?: string;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggleChange?: (v: boolean) => void;
  onPress?: () => void;
  showChevron?: boolean;
  highlight?: boolean;
  avatar?: ReactNode;
  divider?: boolean;
}

// Tooltip rendered via portal so it escapes overflow:hidden cards
function HighlightTooltip({ anchorRef, label }: { anchorRef: React.RefObject<HTMLDivElement | null>, label: string }) {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    const update = () => {
      if (!anchorRef.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top - 8,   // 8px gap above the anchor
        left: rect.left + rect.width / 2,
      });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [anchorRef]);

  if (!coords) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: coords.top,
        left: coords.left,
        transform: 'translate(-50%, -100%)',
        zIndex: 9999,
        pointerEvents: 'none',
        animation: 'popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <div style={{
        background: 'linear-gradient(135deg, #2075d6, #6c47ff)',
        color: '#fff',
        fontSize: '11px',
        fontWeight: 700,
        padding: '5px 11px',
        borderRadius: '8px',
        boxShadow: '0 6px 20px rgba(108,71,255,0.5)',
        border: '1px solid rgba(255,255,255,0.25)',
        whiteSpace: 'nowrap',
        position: 'relative',
        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
      }}>
        {label}
        {/* Arrow pointing down */}
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderTop: '6px solid #6c47ff',
        }} />
      </div>
    </div>,
    document.body
  );
}

export function SettingsRow({
  icon, iconBg, title, subtitle, rightLabel,
  toggle, toggleValue, onToggleChange,
  onPress, showChevron, highlight, avatar, divider
}: SettingsRowProps) {
  const anchorRef = useRef<HTMLDivElement>(null);

  const content = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%', padding: '12px 0' }}>

      {/* Icon Area */}
      {avatar && <div style={{ flexShrink: 0 }}>{avatar}</div>}
      {!avatar && icon && (
        <div style={{
          width: '30px', height: '30px', borderRadius: '8px',
          background: iconBg || 'transparent', color: iconBg ? '#fff' : 'var(--oneui-text-secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <div style={{ transform: iconBg ? 'scale(0.72)' : 'scale(1)' }}>{icon}</div>
        </div>
      )}

      {/* Text Area */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
        <div style={{ fontSize: '16px', color: 'var(--oneui-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </div>
        {subtitle && <div style={{ fontSize: '13px', color: 'var(--oneui-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subtitle}</div>}
      </div>

      {/* Right Content */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: 'auto' }}>
        {rightLabel && <span style={{ fontSize: '14px', color: 'var(--oneui-text-secondary)', flexShrink: 0, whiteSpace: 'nowrap' }}>{rightLabel}</span>}
        {/* Anchor div for tooltip positioning */}
        <div ref={anchorRef} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {toggle && <OneUISwitch checked={!!toggleValue} onChange={onToggleChange} />}
          {showChevron && <div style={{ color: 'var(--oneui-text-tertiary)', flexShrink: 0, display: 'flex', alignItems: 'center' }}><IChevron /></div>}
        </div>
      </div>
    </div>
  );

  const wrapperStyle: React.CSSProperties = {
    padding: '0 16px',
    position: 'relative',
    background: highlight ? 'linear-gradient(90deg, rgba(32, 117, 214, 0.15) 0%, rgba(108, 71, 255, 0.05) 100%)' : 'transparent',
    boxShadow: highlight ? 'inset 0 0 0 1px rgba(32, 117, 214, 0.4), inset 0 1px 1px rgba(255,255,255,0.1)' : 'none',
    transition: 'background 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
    borderRadius: highlight ? '16px' : '0'
  };

  return (
    <div style={{ position: 'relative' }}>
      {onPress && !toggle ? (
        <Ripple onClick={onPress} style={wrapperStyle}>
          {content}
        </Ripple>
      ) : (
        <div style={wrapperStyle}>{content}</div>
      )}

      {/* Portal tooltip — escapes overflow:hidden */}
      {highlight && <HighlightTooltip anchorRef={anchorRef} label={toggle ? 'Toggle here' : 'Tap here'} />}

      {divider && (
        <div style={{ height: '1px', background: 'var(--oneui-separator)', marginLeft: (icon || avatar) ? '60px' : '16px', marginRight: '16px' }} />
      )}
    </div>
  );
}
