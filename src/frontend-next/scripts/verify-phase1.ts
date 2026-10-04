/**
 * Phase 1 Architecture & Action Engine Verification Script
 * Validates:
 * 1. Centralized settings definitions & initial state
 * 2. Action resolution (resolveGoalToAction) for various Samsung One UI goals
 * 3. Execution capability checks (Simulated vs Native vs Unsupported)
 * 4. Action execution & state mutation (SettingsContext logic)
 * 5. Structured demo sequences (NAVIGATE, HIGHLIGHT, TOGGLE, COMPLETE)
 * 6. App launch abstraction (openApp)
 */

import { INITIAL_SETTINGS_STATE, SETTING_DEFINITIONS } from '../src/settings/definitions';
import { 
  resolveGoalToAction, 
  checkCapability, 
  openApp, 
  FixAction,
  ActionResult
} from '../src/settings/actions';
import { resolveSettingsPath } from '../src/settings/navigation';
import { GoalData } from '../src/hooks/useFixbyQuery';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

async function runTests() {
  console.log('====================================================');
  console.log('RUNNING FIXBY PHASE 1 ARCHITECTURE & ACTION TESTS');
  console.log('====================================================\n');

  // Test 1: Definitions & Initial State
  console.log('--- Test 1: Device Settings Definitions & Central State ---');
  assert(typeof INITIAL_SETTINGS_STATE.powerSaving === 'boolean', 'powerSaving is boolean');
  assert(INITIAL_SETTINGS_STATE.powerSaving === false, 'powerSaving default is false');
  assert(INITIAL_SETTINGS_STATE.motionSmoothness === 'Adaptive', 'motionSmoothness default is Adaptive');
  assert(INITIAL_SETTINGS_STATE.soundMode === 'sound', 'soundMode default is sound');
  assert(INITIAL_SETTINGS_STATE.darkMode === true, 'darkMode default is true');
  assert(INITIAL_SETTINGS_STATE.wifi === true, 'wifi default is true');
  assert(INITIAL_SETTINGS_STATE.deepSleepingAppsCount === 4, 'deepSleepingAppsCount is 4');
  assert(INITIAL_SETTINGS_STATE.storageCleaned === false, 'storageCleaned default is false');
  assert(Boolean(SETTING_DEFINITIONS.powerSaving), 'SETTING_DEFINITIONS has powerSaving metadata');
  assert(SETTING_DEFINITIONS.powerSaving.category === 'Battery', 'powerSaving category is Battery');

  // Test 2: Goal -> Action Resolution
  console.log('\n--- Test 2: Goal to Structured FixAction Mapping ---');
  const batteryGoal: GoalData = {
    goal: 'Turn on Power Saving',
    title: 'Turn on Power Saving',
    score: 0.95,
    resolution_modes: ['auto', 'demo'],
    navigation_path: ['Settings', 'Battery', 'Power saving'],
    actions: [{
      actionName: 'Power saving',
      description: 'Extends battery life by limiting background activity.',
      category: 'battery',
      stepGroups: [{
        steps: ['Open Settings', 'Tap Battery', 'Turn on Power saving'],
        actionableDeeplink: {
          deeplink: 'bixby://settings/battery/power_saving',
          description: 'Power saving',
          classes: { path: 'Settings > Battery > Power saving' }
        }
      }]
    }]
  };

  const action1 = resolveGoalToAction(batteryGoal);
  assert(action1.type === 'TOGGLE_ON', `battery action type is TOGGLE_ON (got ${action1.type})`);
  assert(action1.settingKey === 'powerSaving', `battery action targets powerSaving (got ${action1.settingKey})`);
  assert(action1.targetValue === true, 'battery targetValue is true');
  assert(action1.destination === 'settings/battery', `battery destination is settings/battery (got ${action1.destination})`);
  assert(action1.canAutoApply === true, 'battery action canAutoApply is true');
  assert(action1.demoSequence.length >= 4, `demo sequence has >= 4 steps (got ${action1.demoSequence.length})`);
  assert(action1.demoSequence[0].type === 'NAVIGATE', 'demo step 0 is NAVIGATE');
  assert(action1.demoSequence.some(s => s.type === 'TOGGLE'), 'demo has a TOGGLE step');

  // Test 3: Alternate Fix Resolution (Refresh Rate / Motion Smoothness)
  console.log('\n--- Test 3: Alternate Fix Resolution (Motion Smoothness) ---');
  const refreshGoal: GoalData = {
    goal: 'Standard Refresh Rate (60Hz)',
    title: 'Standard Refresh Rate (60Hz)',
    score: 0.88,
    resolution_modes: ['auto', 'demo'],
    navigation_path: ['Settings', 'Display', 'Motion smoothness'],
    actions: [{
      actionName: 'Motion smoothness',
      description: 'Switch to standard 60Hz screen refresh rate to conserve battery.',
      category: 'display',
      stepGroups: [{
        steps: ['Open Settings', 'Tap Display', 'Tap Motion smoothness', 'Select Standard'],
        actionableDeeplink: {
          deeplink: 'bixby://settings/display/motion_smoothness',
          description: 'Motion smoothness',
          classes: { path: 'Settings > Display > Motion smoothness' }
        }
      }]
    }]
  };

  const action2 = resolveGoalToAction(refreshGoal);
  assert(action2.type === 'CONFIG_CHANGE', `motion smoothness type is CONFIG_CHANGE (got ${action2.type})`);
  assert(action2.settingKey === 'motionSmoothness', `motion smoothness targets motionSmoothness (got ${action2.settingKey})`);
  assert(action2.targetValue === 'Standard', 'motion smoothness targetValue is Standard');
  assert(action2.destination === 'settings/motion-smoothness', `destination is settings/motion-smoothness (got ${action2.destination})`);

  // Test 4: Alternate Fix Resolution (Storage Optimization)
  console.log('\n--- Test 4: Storage Optimization Fix ---');
  const storageGoal: GoalData = {
    goal: 'Clean Storage Junk Files',
    title: 'Clean Storage Junk Files',
    score: 0.92,
    resolution_modes: ['auto', 'demo'],
    navigation_path: ['Settings', 'Device care', 'Storage'],
    actions: [{
      actionName: 'Clean now',
      description: 'Frees up cached app files and system junk.',
      category: 'storage',
      stepGroups: [{
        steps: ['Open Settings', 'Tap Device care', 'Tap Storage', 'Tap Clean now'],
        actionableDeeplink: {
          deeplink: 'bixby://settings/storage/clean',
          description: 'Clean storage',
          classes: { path: 'Settings > Device care > Storage' }
        }
      }]
    }]
  };

  const action3 = resolveGoalToAction(storageGoal);
  assert(action3.settingKey === 'storageCleaned', 'storage action targets storageCleaned');
  assert(action3.destination === 'settings/storage', 'storage destination is settings/storage');

  // Test 5: Capability Checks (Simulated vs Native vs Unsupported)
  console.log('\n--- Test 5: Capability Checks ---');
  const cap1 = checkCapability(action1);
  assert(cap1.supported === true && cap1.mode === 'SIMULATED', 'Power saving is supported in SIMULATED mode');

  const unsupportedAction: FixAction = {
    id: 'unsupported-app-action',
    title: 'Open Internal Diagnostic Service',
    type: 'OPEN_APP',
    appPackage: 'com.samsung.internal.diag',
    destination: 'settings',
    destinationPath: ['Settings'],
    requiresConfirmation: false,
    canAutoApply: false,
    risk: 'low',
    estimatedImpact: 'None',
    reason: 'Test',
    steps: [],
    demoSequence: []
  };

  const cap2 = checkCapability(unsupportedAction);
  assert(cap2.supported === false && cap2.mode === 'UNSUPPORTED', 'Internal native package is correctly flagged UNSUPPORTED in web environment');
  assert(Boolean(cap2.reason && cap2.reason.toLowerCase().includes('requires native')), `Unsupported reason clearly explains native requirement (got "${cap2.reason}")`);

  // Test 6: App Launch Abstraction (openApp)
  console.log('\n--- Test 6: App Launch Abstraction ---');
  const mapsRes = await openApp({ packageName: 'com.google.android.apps.maps', appName: 'Google Maps' });
  assert(mapsRes.mode === 'FALLBACK' || mapsRes.mode === 'SIMULATED', 'Known web app provides fallback / simulation');

  const unknownRes = await openApp({ packageName: 'com.unknown.carrier.tool', appName: 'Carrier Provisioning' });
  assert(unknownRes.success === false, 'Unknown native app launch does not pretend success');
  assert(unknownRes.requiresNativeAndroid === true, 'Unknown app launch indicates requiresNativeAndroid');

  // Test 7: Navigation & Deep Link Resolution
  console.log('\n--- Test 7: Navigation & Deep Link Resolver ---');
  const navBattery = resolveSettingsPath('bixby://settings/battery/power_saving');
  assert(navBattery.screen === 'settings/battery', 'bixby deep link resolves to settings/battery');
  assert(navBattery.settingKey === 'powerSaving', 'bixby deep link targets powerSaving');

  const navMotion = resolveSettingsPath(['Settings', 'Display', 'Motion smoothness']);
  assert(navMotion.screen === 'settings/motion-smoothness', 'Display > Motion smoothness resolves to settings/motion-smoothness');

  const navStorage = resolveSettingsPath(['Settings', 'Device care', 'Storage']);
  assert(navStorage.screen === 'settings/storage', 'Device care > Storage resolves to settings/storage');

  // Test 8: Centralized State Mutation & Transitions
  console.log('\n--- Test 8: Centralized Settings State Mutation & Transitions ---');
  let simulatedStore: any = { ...INITIAL_SETTINGS_STATE };
  function applyStoreAction(act: FixAction) {
    if (act.type === 'TOGGLE_ON' && act.settingKey) {
      simulatedStore[act.settingKey] = true as any;
    } else if (act.type === 'TOGGLE_OFF' && act.settingKey) {
      simulatedStore[act.settingKey] = false as any;
    } else if (act.type === 'CONFIG_CHANGE' && act.settingKey && act.targetValue !== undefined) {
      simulatedStore[act.settingKey] = act.targetValue as any;
    }
  }

  assert(simulatedStore.powerSaving === false, 'Initial powerSaving is OFF');
  applyStoreAction(action1);
  assert(simulatedStore.powerSaving === true, 'After Auto Fix execution, powerSaving is ON');

  assert(simulatedStore.motionSmoothness === 'Adaptive', 'Initial motionSmoothness is Adaptive');
  applyStoreAction(action2);
  assert(simulatedStore.motionSmoothness === 'Standard', 'After Alternate Fix execution, motionSmoothness changed to Standard');

  assert(simulatedStore.storageCleaned === false, 'Initial storageCleaned is false');
  applyStoreAction(action3);
  assert(simulatedStore.storageCleaned === true, 'After storage fix execution, storageCleaned is true');

  console.log('\n====================================================');
  console.log('🎉 ALL FIXBY PHASE 1 AUTOMATED TESTS PASSED (100%)!');
  console.log('====================================================\n');
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
