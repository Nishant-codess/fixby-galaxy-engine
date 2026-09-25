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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
        <div style={{ fontSize: '16px', color: 'var(--oneui-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </div>
        {subtitle && <div style={{ fontSize: '13px', color: 'var(--oneui-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subtitle}</div>}
      </div>

      {/* Right Content */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {rightLabel && <span style={{ fontSize: '14px', color: 'var(--oneui-text-secondary)' }}>{rightLabel}</span>}
        {toggle && <OneUISwitch checked={!!toggleValue} onChange={onToggleChange} />}
        {showChevron && <div style={{ color: 'var(--oneui-text-tertiary)' }}><IChevron /></div>}
      </div>
    </div>
  );

  const wrapperStyle: React.CSSProperties = {
    padding: '0 16px',
    position: 'relative',
    background: highlight ? 'rgba(32, 117, 214, 0.15)' : 'transparent',
    boxShadow: highlight ? 'inset 0 0 0 2px var(--oneui-accent)' : 'none',
    transition: 'background 0.3s, box-shadow 0.3s',
    borderRadius: highlight ? '12px' : '0'
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
      
      {highlight && (
        <div style={{
          position: 'absolute', top: '-10px', right: '16px',
          background: 'var(--oneui-accent)', color: '#fff',
          fontSize: '11px', fontWeight: 600, padding: '2px 8px',
          borderRadius: '12px', zIndex: 10,
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          animation: 'popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}>
          Navigate here
        </div>
      )}
      
      {divider && (
        <div style={{ height: '1px', background: 'var(--oneui-separator)', marginLeft: (icon || avatar) ? '60px' : '16px', marginRight: '16px' }} />
      )}
    </div>
  );
}
