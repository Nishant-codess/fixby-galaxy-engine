import React, { useState } from 'react';
import { IPhone, IMessages, IChrome, ICamera, IGallery, IYouTube, IMaps, ICalculator, ICalendar, IClock, IContacts, ISettings } from '../ui/Icons';
import { Ripple } from '../ui/Ripple';
import { Screen } from '../../../hooks/usePhoneNavigation';

const APPS = [
  { id: 'phone', icon: <IPhone />, color: 'var(--oneui-icon-green)', label: 'Phone' },
  { id: 'messages', icon: <IMessages />, color: 'var(--oneui-icon-blue)', label: 'Messages' },
  { id: 'chrome', icon: <IChrome />, color: '#fff', label: 'Chrome', customColor: '#4285F4' },
  { id: 'camera', icon: <ICamera />, color: 'var(--oneui-icon-red)', label: 'Camera' },
  
  { id: 'settings', icon: <ISettings />, color: '#8E8E93', label: 'Settings', isReal: true },
  { id: 'gallery', icon: <IGallery />, color: 'var(--oneui-icon-purple)', label: 'Gallery' },
  { id: 'youtube', icon: <IYouTube />, color: '#fff', label: 'YouTube', customColor: '#FF0000' },
  { id: 'maps', icon: <IMaps />, color: '#fff', label: 'Maps', customColor: '#34A853' },
  
  { id: 'calculator', icon: <ICalculator />, color: 'var(--oneui-icon-teal)', label: 'Calculator' },
  { id: 'calendar', icon: <ICalendar />, color: 'var(--oneui-icon-blue)', label: 'Calendar' },
  { id: 'clock', icon: <IClock />, color: 'var(--oneui-icon-orange)', label: 'Clock' },
  { id: 'contacts', icon: <IContacts />, color: 'var(--oneui-icon-orange)', label: 'Contacts' },
];

const DOCK_APPS = [
  { id: 'phone', icon: <IPhone />, color: 'var(--oneui-icon-green)', label: 'Phone' },
  { id: 'messages', icon: <IMessages />, color: 'var(--oneui-icon-blue)', label: 'Messages' },
  { id: 'fixby', icon: <span style={{fontSize: '24px', fontWeight: 800}}>F</span>, color: 'var(--oneui-accent)', label: 'Fixby', isFixby: true },
  { id: 'settings', icon: <ISettings />, color: '#8E8E93', label: 'Settings', isReal: true },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AppIcon({ app, onClick }: { app: any; onClick: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '25%' }}>
      <Ripple onClick={onClick} style={{ width: '56px', height: '56px', borderRadius: '24px', background: app.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: app.customColor || '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ transform: 'scale(1.2)' }}>
          {app.icon}
        </div>
      </Ripple>
      <div style={{ fontSize: '11px', color: '#fff', fontWeight: 500, textShadow: '0 1px 2px rgba(0,0,0,0.8)', whiteSpace: 'nowrap' }}>
        {app.label}
      </div>
    </div>
  );
}

export function HomeScreen({ onNavigate, onFixbyOrb }: { onNavigate: (s: Screen) => void; onFixbyOrb: () => void }) {
  const [toast, setToast] = useState<string | null>(null);

  const handleAppClick = (app: any) => {
    if (app.isReal) {
      onNavigate('settings');
    } else if (app.isFixby) {
      onFixbyOrb();
    } else {
      setToast(`Mock: ${app.label} would open here`);
      setTimeout(() => setToast(null), 2000);
    }
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 40, display: 'flex', flexDirection: 'column', paddingTop: '60px' }}>
      
      {/* Date & Time Widget */}
      <div style={{ padding: '24px 32px', color: '#fff', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ fontSize: '18px', fontWeight: 300, opacity: 0.9 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
        </div>
        <div style={{ fontSize: '42px', fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1 }}>
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* Main Grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px 0', padding: '0 16px', marginBottom: '32px' }}>
        {APPS.map(app => <AppIcon key={app.id} app={app} onClick={() => handleAppClick(app)} />)}
      </div>

      {/* Page dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }} />
      </div>

      {/* Dock */}
      <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', margin: '0 16px 72px', borderRadius: '32px', display: 'flex', padding: '16px 0' }}>
        {DOCK_APPS.map(app => <AppIcon key={app.id} app={app} onClick={() => handleAppClick(app)} />)}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'absolute', bottom: '160px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '12px 24px', borderRadius: '24px',
          fontSize: '14px', zIndex: 100, animation: 'popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
