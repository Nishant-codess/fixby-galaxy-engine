"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { GoalData } from '../../hooks/useFixbyQuery';

export interface TroubleshootHistoryItem {
  id: string;
  query: string;
  problemTitle: string;
  timestamp: string;
  isoDate: string;
  suggestedFixes: string[];
  appliedFix?: string;
  status: 'suggested' | 'applied' | 'demonstrated';
  goals: GoalData[];
  telemetry?: any;
}

interface HistoryContextType {
  history: TroubleshootHistoryItem[];
  addHistoryItem: (query: string, goals: GoalData[], telemetry?: any) => TroubleshootHistoryItem;
  updateHistoryItem: (id: string, updates: Partial<TroubleshootHistoryItem>) => void;
  recordAppliedFix: (queryOrId: string, fixTitle: string) => void;
  recordDemoViewed: (queryOrId: string, fixTitle: string) => void;
  clearHistory: () => void;
  deleteHistoryItem: (id: string) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  toggleDrawer: () => void;
}

const STORAGE_KEY = 'fixby_troubleshoot_history_v1';
const MAX_HISTORY_ITEMS = 5;

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (diffMins < 1) return `Just now • ${timeStr}`;
  if (diffMins < 60) return `${diffMins}m ago • ${timeStr}`;
  
  const isToday = now.toDateString() === date.toDateString();
  if (isToday) return `Today, ${timeStr}`;

  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`;
}

function deriveProblemTitle(query: string, goals: GoalData[]): string {
  const qLower = query.toLowerCase();
  if (qLower.includes('battery') || qLower.includes('drain')) return 'Battery Rapid Drain';
  if (qLower.includes('hot') || qLower.includes('overheat') || qLower.includes('temp')) return 'Phone Overheating';
  if (qLower.includes('wifi') || qLower.includes('wi-fi') || qLower.includes('connect')) return 'Wi-Fi Connection Issue';
  if (qLower.includes('storage') || qLower.includes('full') || qLower.includes('memory')) return 'Low Storage Space';
  if (qLower.includes('slow') || qLower.includes('lag')) return 'Device Sluggish Performance';

  if (goals.length > 0 && goals[0].title) {
    return goals[0].title;
  }

  // Capitalize query as fallback
  return query.length > 32 ? `${query.slice(0, 32)}...` : query;
}

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<TroubleshootHistoryItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setHistory(parsed.slice(0, MAX_HISTORY_ITEMS));
        }
      }
    } catch (e) {
      console.error('Failed to load Fixby history from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever history changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_HISTORY_ITEMS)));
    } catch (e) {
      console.error('Failed to save Fixby history to localStorage', e);
    }
  }, [history, isLoaded]);

  const addHistoryItem = useCallback((query: string, goals: GoalData[], telemetry?: any): TroubleshootHistoryItem => {
    const now = new Date();
    const fixTitles = goals.map(g => g.title || g.actions?.[0]?.actionName || 'Suggested Setting').filter(Boolean);
    
    const newItem: TroubleshootHistoryItem = {
      id: `fixby-hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      query: query.trim(),
      problemTitle: deriveProblemTitle(query, goals),
      timestamp: formatRelativeTime(now),
      isoDate: now.toISOString(),
      suggestedFixes: fixTitles.length > 0 ? fixTitles : ['General Settings Inspection'],
      status: 'suggested',
      goals,
      telemetry,
    };

    setHistory(prev => {
      // Deduplicate: if an entry with the exact same query exists, remove it first
      const filtered = prev.filter(item => item.query.toLowerCase() !== newItem.query.toLowerCase());
      // Prepend newest item, strictly enforce 5 items maximum
      return [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    });

    return newItem;
  }, []);

  const updateHistoryItem = useCallback((id: string, updates: Partial<TroubleshootHistoryItem>) => {
    setHistory(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  }, []);

  const recordAppliedFix = useCallback((queryOrId: string, fixTitle: string) => {
    setHistory(prev => prev.map(item => {
      if (item.id === queryOrId || item.query.toLowerCase() === queryOrId.toLowerCase()) {
        return {
          ...item,
          appliedFix: fixTitle,
          status: 'applied',
        };
      }
      return item;
    }));
  }, []);

  const recordDemoViewed = useCallback((queryOrId: string, fixTitle: string) => {
    setHistory(prev => prev.map(item => {
      if (item.id === queryOrId || item.query.toLowerCase() === queryOrId.toLowerCase()) {
        return {
          ...item,
          appliedFix: item.appliedFix || fixTitle,
          status: item.status === 'applied' ? 'applied' : 'demonstrated',
        };
      }
      return item;
    }));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }, []);

  const deleteHistoryItem = useCallback((id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen(prev => !prev);
  }, []);

  return (
    <HistoryContext.Provider
      value={{
        history,
        addHistoryItem,
        updateHistoryItem,
        recordAppliedFix,
        recordDemoViewed,
        clearHistory,
        deleteHistoryItem,
        isDrawerOpen,
        setIsDrawerOpen,
        toggleDrawer,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
}
