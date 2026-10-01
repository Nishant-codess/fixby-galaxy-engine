import React, { useState } from 'react';

interface Props {
  onBack: () => void;
  targetPath?: string[];
}

export function StorageScreen({ onBack, targetPath = [] }: Props) {
  const [trashEmptied, setTrashEmptied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isHighlighted = targetPath.join(' ').toLowerCase().includes('storage') ||
                        targetPath.join(' ').toLowerCase().includes('junk') ||
                        targetPath.join(' ').toLowerCase().includes('trash');

  const handleEmptyTrash = () => {
    setTrashEmptied(true);
    setToastMessage("Trash emptied! Freed 1.2 GB");
    setTimeout(() => setToastMessage(null), 2500);
  };

  const currentUsed = trashEmptied ? "31.2" : "32.4";

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 35, background: 'var(--oneui-bg-primary)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Scrollable Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '56px 16px 72px' }}>
        
        {/* Back navigation */}
        <div 
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '12px', width: 'fit-content', color: 'var(--oneui-accent)', userSelect: 'none' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span style={{ fontSize: '15px', fontWeight: 500 }}>Device care</span>
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: 300, color: 'var(--oneui-text-primary)', margin: '0 0 20px', letterSpacing: '-0.02em' }}>
          Storage
        </h1>

        {/* Storage Summary Card */}
        <div style={{
          background: 'var(--oneui-bg-card)', borderRadius: '24px', padding: '20px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
            <div style={{ fontSize: '28px', fontWeight: 300, color: '#fff' }}>
              {currentUsed} <span style={{ fontSize: '16px', color: 'var(--oneui-text-secondary)' }}>GB / 256 GB</span>
            </div>
            <div style={{ fontSize: '14px', color: 'var(--oneui-accent)', fontWeight: 600 }}>12% used</div>
          </div>

          {/* Storage Bar */}
          <div style={{ height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: '5%', background: '#2075d6' }} />
            <div style={{ width: '4%', background: '#8e5ef5' }} />
            <div style={{ width: '3%', background: '#34c759' }} />
            {!trashEmptied && <div style={{ width: '1%', background: '#ff3b30' }} />}
          </div>
        </div>

        {/* Categories */}
        <div style={{ background: 'var(--oneui-bg-card)', borderRadius: '24px', overflow: 'hidden', marginBottom: '20px' }}>
          {[
            { label: "Images", size: "12.1 GB", color: "#2075d6" },
            { label: "Videos", size: "8.4 GB", color: "#8e5ef5" },
            { label: "Audio", size: "1.5 GB", color: "#f09000" },
            { label: "Documents", size: "850 MB", color: "#34c759" },
            { label: "Apps", size: "6.2 GB", color: "#00c7be" },
            { label: "System", size: "4.5 GB", color: "#8E8E93" }
          ].map((cat, i, arr) => (
            <div key={cat.label} style={{
              padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: i < arr.length - 1 ? '1px solid var(--oneui-separator)' : 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: cat.color }} />
                <span style={{ fontSize: '15px', color: 'var(--oneui-text-primary)' }}>{cat.label}</span>
              </div>
              <span style={{ fontSize: '14px', color: 'var(--oneui-text-secondary)' }}>{cat.size}</span>
            </div>
          ))}
        </div>

        {/* Trash & Junk Files Card */}
        <div style={{
          background: 'var(--oneui-bg-card)', borderRadius: '24px', padding: '18px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          border: isHighlighted && !trashEmptied ? '2px solid var(--oneui-accent)' : 'none',
          boxShadow: isHighlighted && !trashEmptied ? '0 0 16px rgba(32, 117, 214, 0.3)' : 'none'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--oneui-text-primary)' }}>
                Trash (Junk files)
              </span>
              {isHighlighted && !trashEmptied && (
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
            <div style={{ fontSize: '13px', color: trashEmptied ? 'var(--oneui-success)' : 'var(--oneui-text-secondary)' }}>
              {trashEmptied ? 'Trash is empty (0 B)' : '1.2 GB can be freed up'}
            </div>
          </div>

          <button
            onClick={handleEmptyTrash}
            disabled={trashEmptied}
            style={{
              background: trashEmptied ? 'rgba(255,255,255,0.06)' : 'var(--oneui-accent)',
              color: trashEmptied ? 'var(--oneui-text-tertiary)' : '#fff',
              border: 'none', borderRadius: '18px', padding: '10px 18px',
              fontSize: '13px', fontWeight: 600, cursor: trashEmptied ? 'default' : 'pointer',
              flexShrink: 0
            }}
          >
            {trashEmptied ? 'Cleaned' : 'Empty'}
          </button>
        </div>

      </div>

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
