import React, { ReactNode } from 'react';
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

export function SettingsRow({
  icon, iconBg, title, subtitle, rightLabel,
  toggle, toggleValue, onToggleChange,
  onPress, showChevron, highlight, avatar, divider
}: SettingsRowProps) {
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
        {highlight && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(32,117,214,0.95), rgba(108,71,255,0.95))',
            color: '#fff', fontSize: '11px', fontWeight: 700,
            padding: '4px 10px', borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(32,117,214,0.4), inset 0 1px 2px rgba(255,255,255,0.4)',
            border: '1px solid rgba(255,255,255,0.2)',
            whiteSpace: 'nowrap', flexShrink: 0,
            animation: 'popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            {toggle ? 'Toggle this' : 'Tap here'}
          </div>
        )}
        {rightLabel && <span style={{ fontSize: '14px', color: 'var(--oneui-text-secondary)', flexShrink: 0, whiteSpace: 'nowrap' }}>{rightLabel}</span>}
        {toggle && <OneUISwitch checked={!!toggleValue} onChange={onToggleChange} />}
        {showChevron && <div style={{ color: 'var(--oneui-text-tertiary)', flexShrink: 0, display: 'flex', alignItems: 'center' }}><IChevron /></div>}
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
      
      {divider && (
        <div style={{ height: '1px', background: 'var(--oneui-separator)', marginLeft: (icon || avatar) ? '60px' : '16px', marginRight: '16px' }} />
      )}
    </div>
  );
}
