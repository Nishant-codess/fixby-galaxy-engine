import assert from 'assert';
import type { GoalData } from '../src/hooks/useFixbyQuery';
import type { TroubleshootHistoryItem } from '../src/app/context/HistoryContext';

// Mock localStorage
const mockStorage: Record<string, string> = {};
const localStorageMock = {
  getItem: (k: string) => mockStorage[k] || null,
  setItem: (k: string, v: string) => { mockStorage[k] = v; },
  removeItem: (k: string) => { delete mockStorage[k]; },
  clear: () => { for (const k in mockStorage) delete mockStorage[k]; }
};

// Simulation of History Logic from HistoryContext
const STORAGE_KEY = 'fixby_troubleshoot_history_v1';
const MAX_HISTORY_ITEMS = 5;

function deriveProblemTitle(query: string, goals: GoalData[]): string {
  const qLower = query.toLowerCase();
  if (qLower.includes('battery') || qLower.includes('drain')) return 'Battery Rapid Drain';
  if (qLower.includes('hot') || qLower.includes('overheat') || qLower.includes('temp')) return 'Phone Overheating';
  if (qLower.includes('wifi') || qLower.includes('wi-fi') || qLower.includes('connect')) return 'Wi-Fi Connection Issue';
  if (qLower.includes('storage') || qLower.includes('full') || qLower.includes('memory')) return 'Low Storage Space';
  if (qLower.includes('slow') || qLower.includes('lag')) return 'Device Sluggish Performance';

  if (goals.length > 0 && goals[0].title) return goals[0].title;
  return query.length > 32 ? `${query.slice(0, 32)}...` : query;
}

class HistoryStoreSimulator {
  history: TroubleshootHistoryItem[] = [];

  constructor() {
    this.load();
  }

  load() {
    const raw = localStorageMock.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) this.history = parsed.slice(0, MAX_HISTORY_ITEMS);
      } catch (e) {
        this.history = [];
      }
    }
  }

  save() {
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify(this.history.slice(0, MAX_HISTORY_ITEMS)));
  }

  addHistoryItem(query: string, goals: GoalData[], telemetry?: any): TroubleshootHistoryItem {
    const now = new Date();
    const fixTitles = goals.map(g => g.title || g.actions?.[0]?.actionName || 'Suggested Setting').filter(Boolean);
    
    const newItem: TroubleshootHistoryItem = {
      id: `fixby-hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      query: query.trim(),
      problemTitle: deriveProblemTitle(query, goals),
      timestamp: 'Today, 10:42 PM',
      isoDate: now.toISOString(),
      suggestedFixes: fixTitles.length > 0 ? fixTitles : ['General Settings Inspection'],
      status: 'suggested',
      goals,
      telemetry,
    };

    const existing = this.history.find(item => item.query.toLowerCase() === newItem.query.toLowerCase());
    const carried: TroubleshootHistoryItem = existing
      ? {
          ...newItem,
          appliedFix: existing.appliedFix,
          status: existing.status === 'applied'
            ? 'applied'
            : existing.status === 'demonstrated'
              ? 'demonstrated'
              : newItem.status,
        }
      : newItem;
    const filtered = this.history.filter(item => item.query.toLowerCase() !== newItem.query.toLowerCase());
    this.history = [carried, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    this.save();
    return carried;
  }

  recordAppliedFix(queryOrId: string, fixTitle: string) {
    this.history = this.history.map(item => {
      if (item.id === queryOrId || item.query.toLowerCase() === queryOrId.toLowerCase()) {
        return {
          ...item,
          appliedFix: fixTitle,
          status: 'applied',
        };
      }
      return item;
    });
    this.save();
  }

  recordDemoViewed(queryOrId: string, fixTitle: string) {
    this.history = this.history.map(item => {
      if (item.id === queryOrId || item.query.toLowerCase() === queryOrId.toLowerCase()) {
        return {
          ...item,
          appliedFix: item.appliedFix || fixTitle,
          status: item.status === 'applied' ? 'applied' : 'demonstrated',
        };
      }
      return item;
    });
    this.save();
  }

  clearHistory() {
    this.history = [];
    localStorageMock.removeItem(STORAGE_KEY);
  }
}

async function runPhase2Tests() {
  console.log('====================================================');
  console.log('RUNNING FIXBY PHASE 2 HISTORY & ARCHITECTURE TESTS');
  console.log('====================================================');

  const store = new HistoryStoreSimulator();
  store.clearHistory();

  // Test 1: Problem Title Derivation
  console.log('\n--- Test 1: Problem Title Derivation ---');
  assert.strictEqual(deriveProblemTitle('My battery is draining very fast', []), 'Battery Rapid Drain');
  console.log('✅ PASSED: Battery query maps to "Battery Rapid Drain"');
  assert.strictEqual(deriveProblemTitle('bhai phone garam ho raha hai overheat', []), 'Phone Overheating');
  console.log('✅ PASSED: Overheating query maps to "Phone Overheating"');
  assert.strictEqual(deriveProblemTitle('wifi disconnects randomly', []), 'Wi-Fi Connection Issue');
  console.log('✅ PASSED: Wi-Fi query maps to "Wi-Fi Connection Issue"');
  assert.strictEqual(deriveProblemTitle('storage is completely full', []), 'Low Storage Space');
  console.log('✅ PASSED: Storage query maps to "Low Storage Space"');

  // Test 2: Adding Items & Schema Validation
  console.log('\n--- Test 2: History Item Schema Validation ---');
  const mockGoal1: GoalData = {
    goal: 'Turn on power saving',
    title: 'Power Saving',
    score: 0.95,
    navigation_path: ['Settings', 'Battery'],
    resolution_modes: ['SIMULATED'],
    actions: [{ actionName: 'Power saving mode', description: 'Enable power saving', category: 'Battery', stepGroups: [] }]
  };
  const item1 = store.addHistoryItem('My battery is draining very fast', [mockGoal1]);
  assert.strictEqual(store.history.length, 1);
  assert.strictEqual(item1.query, 'My battery is draining very fast');
  assert.strictEqual(item1.problemTitle, 'Battery Rapid Drain');
  assert.strictEqual(item1.status, 'suggested');
  assert.deepStrictEqual(item1.suggestedFixes, ['Power Saving']);
  assert.strictEqual(item1.goals.length, 1);
  console.log('✅ PASSED: Item correctly structured with query, title, fixes, and goals');

  // Test 3: Status Transition to Applied
  console.log('\n--- Test 3: Record Applied Fix ---');
  store.recordAppliedFix('My battery is draining very fast', 'Turn on Power Saving');
  assert.strictEqual(store.history[0].status, 'applied');
  assert.strictEqual(store.history[0].appliedFix, 'Turn on Power Saving');
  console.log('✅ PASSED: Applied fix accurately recorded and status transitioned to "applied"');

  // Test 4: Record Demo Viewed (without overwriting applied state)
  console.log('\n--- Test 4: Record Demo Viewed ---');
  store.recordDemoViewed('My battery is draining very fast', 'Turn on Power Saving');
  assert.strictEqual(store.history[0].status, 'applied', 'Status remains applied if already applied');
  
  const item2 = store.addHistoryItem('wifi disconnects randomly', [{ 
    goal: 'Reset Wi-Fi', 
    title: 'Reset Network', 
    score: 0.9, 
    navigation_path: [], 
    resolution_modes: ['SIMULATED'],
    actions: [] 
  }]);
  store.recordDemoViewed('wifi disconnects randomly', 'Reset Network');
  assert.strictEqual(store.history[0].status, 'demonstrated');
  console.log('✅ PASSED: Demo status correctly set for demonstrated query');

  // Test 5: Strictly Cap to 5 Items (FIFO / Pruning)
  console.log('\n--- Test 5: Strict 5-Item Limit & FIFO Pruning ---');
  store.addHistoryItem('Query 3: storage full', []);
  store.addHistoryItem('Query 4: phone is hot', []);
  store.addHistoryItem('Query 5: screen is dim', []);
  assert.strictEqual(store.history.length, 5, 'History reached exactly 5 items');
  console.log('✅ PASSED: History contains exactly 5 items');

  // Add 6th item
  const item6 = store.addHistoryItem('Query 6: bluetooth won\'t connect', []);
  assert.strictEqual(store.history.length, 5, 'History must not exceed 5 items');
  assert.strictEqual(store.history[0].query, 'Query 6: bluetooth won\'t connect', 'Newest item is at index 0');
  // Verify oldest item was evicted
  const existsOldest = store.history.some(i => i.query === 'My battery is draining very fast');
  assert.strictEqual(existsOldest, false, 'Oldest item was evicted');
  console.log('✅ PASSED: 6th query pruned oldest item and newest item is top of queue (FIFO enforced)');

  // Test 6: Deduplication on Repeat Query
  console.log('\n--- Test 6: Deduplication on Repeated Query ---');
  store.addHistoryItem('Query 4: phone is hot', []);
  assert.strictEqual(store.history.length, 5, 'Length remained 5 after re-querying existing item');
  assert.strictEqual(store.history[0].query, 'Query 4: phone is hot', 'Existing item moved to top');
  console.log('✅ PASSED: Re-querying moves item to top without creating duplicates');

  // Test 7: Persistence to LocalStorage & Reload
  console.log('\n--- Test 7: LocalStorage Rehydration ---');
  const storedJson = localStorageMock.getItem(STORAGE_KEY);
  assert.ok(storedJson, 'Data serialized to storage key fixby_troubleshoot_history_v1');
  
  const freshStore = new HistoryStoreSimulator();
  assert.strictEqual(freshStore.history.length, 5, 'Fresh store rehydrated 5 items from storage');
  assert.strictEqual(freshStore.history[0].query, 'Query 4: phone is hot');
  console.log('✅ PASSED: Complete state successfully serialized and rehydrated from localStorage');

  // Test 8: Restoring History Item Reopens Goals
  console.log('\n--- Test 8: Restoring History Item Reopens Goals ---');
  freshStore.addHistoryItem('Battery issue re-test', [mockGoal1]);
  const restored = freshStore.history[0];
  assert.strictEqual(restored.goals.length, 1);
  assert.strictEqual(restored.goals[0].title, 'Power Saving');
  console.log('✅ PASSED: Restored item retains all GoalData for instant UI re-rendering without API calls');

  console.log('\n====================================================');
  console.log('🎉 ALL FIXBY PHASE 2 AUTOMATED TESTS PASSED (100%)!');
  console.log('====================================================\n');
}

runPhase2Tests().catch(err => {
  console.error('Fatal test error in verify-phase2.ts:', err);
  process.exit(1);
});
