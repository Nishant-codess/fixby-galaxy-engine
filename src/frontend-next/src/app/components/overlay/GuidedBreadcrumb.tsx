import React from 'react';

export interface GuidedBreadcrumbProps {
  pathSegments: string[];
  currentScreen: string;
  targetScreens: string[];
  onDismiss: () => void;
}

/**
 * Maps a phone simulator screen name to a human-readable settings label for matching.
 */
function screenToLabel(screen: string): string {
  const map: Record<string, string> = {
    'settings': 'Settings',
    'settings/display': 'Display',
    'settings/connections': 'Connections',
    'settings/battery': 'Battery',
    'settings/device-care': 'Device care',
    'settings/sound': 'Sound',
    'settings/camera': 'Camera',
    'settings/advanced': 'Advanced features',
    'settings/privacy': 'Privacy',
    'settings/accessibility': 'Accessibility',
    'settings/notifications': 'Notifications',
    'settings/wellbeing': 'Digital Wellbeing',
    'settings/general': 'General management',
    'settings/lock-screen': 'Lock screen',
    'settings/about': 'About phone',
    'settings/security': 'Security',
    'settings/apps': 'Apps',
    'settings/samsung-account': 'Samsung account',
    'settings/storage': 'Storage',
    'settings/battery-usage': 'Battery usage',
    'settings/motion-smoothness': 'Motion smoothness',
  };
  return map[screen] || screen;
}

export function GuidedBreadcrumb({ pathSegments, currentScreen, targetScreens, onDismiss }: GuidedBreadcrumbProps) {
  const currentLabel = screenToLabel(currentScreen).toLowerCase();

  // Determine which path segments have been reached
  const reachedIndex = pathSegments.findIndex((seg, i) => {
    // Check if current screen matches this segment or any beyond
    return seg.toLowerCase() === currentLabel ||
           currentLabel.includes(seg.toLowerCase());
  });

  // Find the next target
  const nextIndex = Math.max(0, reachedIndex + 1);
  const isComplete = reachedIndex >= pathSegments.length - 1;

  return (
    <div style={{
      position: 'absolute', bottom: '52px', left: '8px', right: '8px', zIndex: 190,
      background: isComplete ? 'rgba(52, 199, 89, 0.95)' : 'rgba(0, 0, 0, 0.88)',
      backdropFilter: 'blur(16px)',
      borderRadius: '18px',
      padding: '14px 18px',
      border: isComplete
        ? '1px solid rgba(52, 199, 89, 0.3)'
        : '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 6px 24px rgba(0,0,0,0.3)',
      animation: 'breadcrumbSlideUp 0.3s ease-out',
      transition: 'background 0.3s, border 0.3s',
    }}>
      {isComplete ? (
        /* Success state */
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>✅</span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
              Destination reached! Apply the setting.
            </span>
          </div>
          <div
            onClick={onDismiss}
            style={{
              fontSize: '12px', color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer', padding: '4px 8px',
            }}
          >✕</div>
        </div>
      ) : (
        /* Navigation state */
        <>
          {/* Path breadcrumb with progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', marginRight: '2px' }}>📍</span>
            {pathSegments.map((seg, i) => {
              const isReached = i <= reachedIndex;
              const isNext = i === nextIndex;
              return (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: isNext ? 700 : 400,
                    color: isReached ? '#34c759' : isNext ? '#2075d6' : 'rgba(255,255,255,0.35)',
                  }}>
                    {isReached ? '✅' : isNext ? '⬤' : '⬜'} {seg}
                  </span>
                  {i < pathSegments.length - 1 && (
                    <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '10px' }}>›</span>
                  )}
                </span>
              );
            })}
          </div>

          {/* Instruction */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
              Navigate to: <span style={{ color: '#2075d6', fontWeight: 600 }}>
                {nextIndex < pathSegments.length ? pathSegments[nextIndex] : pathSegments[pathSegments.length - 1]}
              </span>
            </div>
            <div
              onClick={onDismiss}
              style={{
                fontSize: '11px', color: 'rgba(255,255,255,0.4)',
                cursor: 'pointer', padding: '2px 6px',
              }}
            >✕</div>
          </div>
        </>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes breadcrumbSlideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}} />
    </div>
  );
}
