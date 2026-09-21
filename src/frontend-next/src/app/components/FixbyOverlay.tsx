'use client';
import React, { useState, useRef, useEffect } from 'react';
import { usePhone } from '../context/PhoneContext';
import { queryFixby, TroubleshootResponse, TroubleshootGoal, getNavigationPath, getConfidenceLevel } from '../lib/api';

import { useTranslation } from '../context/TranslationContext';

function ResolutionCard({ goal, onExecute }: { goal: TroubleshootGoal, onExecute: (path: string[], toggleId?: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const confidence = getConfidenceLevel(goal.score);
  const { t } = useTranslation();
  
  const handleExecute = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Extract deepest path and toggle ID from actions
    const firstAction = goal.actions[0];
    if (!firstAction || firstAction.stepGroups.length === 0) return;
    
    // Simplistic extraction for demo: just use the deeplink path
    const deeplink = firstAction.stepGroups[firstAction.stepGroups.length - 1].actionableDeeplink;
    const pathStr = deeplink?.classes?.path || '';
    const pathParts = pathStr.split('>').map(p => p.trim()).filter(Boolean);
    
    // Map Settings string path to IDs based on our dummy data structure
    // This is a naive mapping for the demo
    const pathMap: Record<string, string> = {
      'Settings': '',
      'Battery': 'battery',
      'Device care': 'device-care',
      'Optimize now': 'optimize-now',
      'Background usage limits': 'bg-usage-limits',
      'Charging': 'charging-settings',
      'Connections': 'connections',
      'Wi-Fi': 'wifi',
      'Bluetooth': 'bluetooth',
      'General management': 'general-management',
      'Reset': 'reset',
      'Reset network settings': 'reset-network',
      'Display': 'display',
      'Motion smoothness': 'motion-smoothness',
      'Touch sensitivity': 'touch-sensitivity',
      'Apps': 'apps',
      'Storage': 'storage',
      'Camera': 'camera-app',
      'Location': 'location',
      'Privacy': 'security-privacy',
      'Sounds': 'sounds',
      'Notifications': 'notifications',
      'Software update': 'software-update',
      'Dark mode': 'dark-mode'
    };
    
    const ids = pathParts.map(p => pathMap[p]).filter(Boolean);
    
    // Check if the last item is typically a toggle (for demo execution)
    const toggleIds = ['wifi', 'bluetooth', 'airplane', 'dark-mode', 'power-saving', 'location', 'nfc'];
    const lastId = ids[ids.length - 1];
    const isToggle = toggleIds.includes(lastId);
    
    if (isToggle) {
      onExecute(ids.slice(0, -1), lastId);
    } else {
      onExecute(ids);
    }
  };
  
  return (
    <div className={`resolution-card ${confidence === 'high' ? 'recommended' : ''}`}>
      <div className="resolution-card-header" onClick={() => setExpanded(!expanded)}>
        <span className="resolution-badge">
          {confidence === 'high' ? '✨' : confidence === 'medium' ? '💡' : '🔍'}
        </span>
        <div className="resolution-card-title">{goal.title}</div>
        <div className={`resolution-confidence ${confidence}`}>
          {Math.round(goal.score * 100)}%
        </div>
        <span className={`resolution-expand ${expanded ? 'open' : ''}`}>▼</span>
      </div>
      
      {expanded && (
        <div className="resolution-card-body">
          <ul className="resolution-steps">
            {goal.actions.flatMap(action => action.stepGroups.flatMap(sg => sg.steps)).map((step, i) => (
              <li key={i} className="resolution-step">
                <div className="resolution-step-num">{i + 1}</div>
                <div>{step}</div>
              </li>
            ))}
          </ul>
          
          <div className="resolution-actions">
            <button className="resolution-action-btn demo" onClick={handleExecute}>
              {t('fixby.executeDemo') !== 'fixby.executeDemo' ? t('fixby.executeDemo') : '▶ Execute Demo'}
            </button>
            <button className="resolution-action-btn secondary">
              {t('fixby.cancel') !== 'fixby.cancel' ? t('fixby.cancel') : 'Cancel'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FixbyOverlay() {
  const { isFixbyOpen, setFixbyOpen, autoNavigateTo, toggleSetting } = usePhone();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<TroubleshootResponse | null>(null);
  const { t } = useTranslation();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (response) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [response]);

  if (!isFixbyOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setResponse(null);
    try {
      const result = await queryFixby(query);
      setResponse(result);
    } catch (error) {
      console.error(error);
      // Mock error response
    } finally {
      setLoading(false);
    }
  };
  
  const handleClarification = (domain: string) => {
    setQuery(domain);
    setTimeout(() => {
      // Small timeout to let state update before fetching
      const form = document.getElementById('fixby-form') as HTMLFormElement;
      form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }, 100);
  };

  const handleExecute = async (path: string[], toggleId?: string) => {
    setFixbyOpen(false); // Close overlay to show demo
    await autoNavigateTo(path);
    if (toggleId) {
      setTimeout(() => toggleSetting(toggleId), 800);
    }
  };

  return (
    <>
      <div className="fixby-overlay-backdrop" onClick={() => setFixbyOpen(false)} />
      <div className="fixby-overlay">
        <div className="fixby-overlay-handle">
          <div className="fixby-overlay-handle-bar" />
        </div>
        
        <div className="fixby-overlay-header">
          <div className="fixby-overlay-logo">✨</div>
          <div className="fixby-overlay-title">{t('fixby.title') !== 'fixby.title' ? t('fixby.title') : 'Fixby Support'}</div>
          <button className="fixby-overlay-close" onClick={() => setFixbyOpen(false)}>✕</button>
        </div>
        
        <div className="fixby-overlay-body">
          {!response && !loading && (
            <div className="p-16 text-center" style={{ color: 'var(--text-secondary)', marginTop: '20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👋</div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                {t('fixby.greeting') !== 'fixby.greeting' ? t('fixby.greeting') : 'How can I help you today?'}
              </h3>
              <p style={{ fontSize: '14px', lineHeight: 1.5 }}>
                {t('fixby.greetingDesc') !== 'fixby.greetingDesc' ? t('fixby.greetingDesc') : "Describe your phone issue, and I'll find the exact settings to fix it."}
              </p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '24px' }}>
                <button 
                  onClick={() => setQuery("battery draining fast")}
                  style={{ padding: '8px 12px', background: '#F0F0F2', border: 'none', borderRadius: '100px', fontSize: '13px', cursor: 'pointer' }}
                >
                  {t('fixby.btnBattery') !== 'fixby.btnBattery' ? t('fixby.btnBattery') : '🔋 Battery draining'}
                </button>
                <button 
                  onClick={() => setQuery("mera phone slow hai")}
                  style={{ padding: '8px 12px', background: '#F0F0F2', border: 'none', borderRadius: '100px', fontSize: '13px', cursor: 'pointer' }}
                >
                  {t('fixby.btnSlow') !== 'fixby.btnSlow' ? t('fixby.btnSlow') : '🚀 Phone is slow'}
                </button>
                <button 
                  onClick={() => setQuery("bluetooth connect nahi ho raha")}
                  style={{ padding: '8px 12px', background: '#F0F0F2', border: 'none', borderRadius: '100px', fontSize: '13px', cursor: 'pointer' }}
                >
                  {t('fixby.btnBluetooth') !== 'fixby.btnBluetooth' ? t('fixby.btnBluetooth') : '🔵 Bluetooth issue'}
                </button>
              </div>
            </div>
          )}
          
          {loading && (
            <div className="resolution-loading">
              <div className="resolution-loading-dot" />
              <div className="resolution-loading-dot" />
              <div className="resolution-loading-dot" />
            </div>
          )}
          
          {response && (
            <div style={{ padding: '10px 0 20px' }}>
              <div className="resolution-issue">
                <span className="resolution-issue-icon">👤</span>
                <span className="resolution-issue-text">"{response.query}"</span>
              </div>
              
              {response.clarification_needed ? (
                <div className="clarification-container">
                  <div className="clarification-title">
                    {t('fixby.clarificationTitle') !== 'fixby.clarificationTitle' ? t('fixby.clarificationTitle') : 'Can you be more specific? Are you having trouble with:'}
                  </div>
                  {response.clarification_options.map((opt, i) => (
                    <div key={i} className="clarification-option" onClick={() => handleClarification(opt.suggestion)}>
                      <span className="clarification-option-icon">
                        {opt.category === 'battery' ? '🔋' : opt.category === 'performance' ? '🚀' : '📱'}
                      </span>
                      <span className="clarification-option-text">{opt.suggestion}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    {t('fixby.resolutionsFound') !== 'fixby.resolutionsFound' 
                      ? t('fixby.resolutionsFound').replace('{count}', response.response.contexts.length.toString())
                      : `Found ${response.response.contexts.length} potential resolutions`}
                  </div>
                  {response.response.contexts.map((goal, i) => (
                    <ResolutionCard key={i} goal={goal} onExecute={handleExecute} />
                  ))}
                </>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        <form id="fixby-form" className="fixby-input-area" onSubmit={handleSubmit}>
          <input 
            type="text" 
            className="fixby-input" 
            placeholder={t('fixby.placeholder') !== 'fixby.placeholder' ? t('fixby.placeholder') : "Type your issue..."} 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            autoFocus
          />
          <button type="submit" className="fixby-send-btn" disabled={!query.trim() || loading}>
            ↑
          </button>
        </form>
      </div>
    </>
  );
}
