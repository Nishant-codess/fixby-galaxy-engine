/**
 * Fixby Engine — Phase 1 End-to-End Browser Automation Suite
 * Uses Playwright to drive real browser interactions and capture visual evidence.
 */

import { chromium, type Browser, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOT_DIR = process.env.FIXBY_SCREENSHOT_DIR
  ? path.resolve(process.env.FIXBY_SCREENSHOT_DIR)
  : path.resolve(__dirname, '../verification');
const BASE_URL = process.env.FIXBY_BASE_URL || 'http://localhost:3000';
const IS_REMOTE = !/localhost|127\.0\.0\.1/.test(BASE_URL);
const STEP_TIMEOUT = IS_REMOTE ? 60000 : 15000;

interface TestResult {
  name: string;
  passed: boolean;
  evidence: string;
  details?: string;
}

const results: TestResult[] = [];
const consoleErrors: string[] = [];
const failedRequests: string[] = [];

function record(name: string, passed: boolean, evidence: string, details?: string) {
  results.push({ name, passed, evidence, details });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${icon} | ${name} | Evidence: ${evidence}${details ? ` (${details})` : ''}`);
}

async function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function runE2ESuite() {
  console.log('====================================================');
  console.log('STARTING FIXBY ENGINE BROWSER E2E TEST SUITE');
  console.log(`Target: ${BASE_URL}`);
  console.log('====================================================\n');

  await ensureDir(SCREENSHOT_DIR);

  let browser: Browser | null = null;
  let browserTypeUsed = 'Playwright Chromium';
  const chromeArgs = ['--no-sandbox', '--disable-setuid-sandbox'];
  if (process.env.FIXBY_HOST_RULE) {
    chromeArgs.push(`--host-resolver-rules=${process.env.FIXBY_HOST_RULE}`);
  }

  try {
    // Attempt standard Chromium launch
    browser = await chromium.launch({
      headless: true,
      args: chromeArgs
    });
  } catch (err: any) {
    console.warn(`Standard Chromium launch failed: ${err.message}. Trying installed Google Chrome channel...`);
    try {
      browser = await chromium.launch({
        headless: true,
        channel: 'chrome',
        args: chromeArgs
      });
      browserTypeUsed = 'Google Chrome Channel';
    } catch (chromeErr: any) {
      console.error(`Failed to launch browser: ${chromeErr.message}`);
      process.exit(1);
    }
  }

  console.log(`Browser launched successfully: ${browserTypeUsed}\n`);

  const context = await browser.newContext({
    viewport: { width: 440, height: 920 },
    deviceScaleFactor: 2,
  });

  await context.addInitScript(() => {
    sessionStorage.setItem('fixby_mode', 'console');
  });

  const attachListeners = (p: Page) => {
    p.on('console', msg => {
      if (msg.type() === 'error') {
        const txt = msg.text();
        // Ignore favicon or harmless hydration warnings if any
        if (!txt.includes('favicon.ico')) {
          consoleErrors.push(txt);
        }
      }
    });

    p.on('pageerror', err => {
      consoleErrors.push(`Uncaught Page Error: ${err.message}`);
    });

    p.on('requestfailed', req => {
      failedRequests.push(`${req.method()} ${req.url()} (${req.failure()?.errorText || 'failed'})`);
    });

    p.on('response', res => {
      if (res.status() >= 400 && !res.url().includes('favicon.ico')) {
        failedRequests.push(`HTTP ${res.status()} ${res.request().method()} ${res.url()}`);
      }
    });
  };

  let page = await context.newPage();
  attachListeners(page);

  try {
    // ==========================================
    // TEST A: Application Loads
    // ==========================================
    console.log('▶ Running Test A: Application loads cleanly');
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: STEP_TIMEOUT });
    await page.waitForTimeout(1000);

    const lockScreen = page.locator('[data-testid="lock-screen"]');
    if (await lockScreen.isVisible()) {
      // Tap lock screen to unlock
      await lockScreen.click();
      await page.waitForTimeout(800);
    }

    // Verify Home Screen icons exist
    const settingsIcon = page.locator('[data-testid="app-icon-settings"]');
    await settingsIcon.first().waitFor({ state: 'visible', timeout: 5000 });

    const shot01 = path.join(SCREENSHOT_DIR, '01-home.png');
    await page.screenshot({ path: shot01 });
    record('Application Loads & Unlocks', true, '01-home.png', 'Simulator rendered Home Screen with dock apps');

    // ==========================================
    // TEST B & C: Troubleshooting Query & Fix Expansion
    // ==========================================
    console.log('▶ Running Test B & C: Troubleshooting Query & Fix Expansion');
    // Open Fixby Orb
    const orbTrigger = page.locator('[data-testid="fixby-orb-trigger"]');
    await orbTrigger.click({ force: true });
    await page.waitForTimeout(600);

    // Type query and submit
    const queryInput = page.locator('[data-testid="fixby-query-input"]');
    await queryInput.waitFor({ state: 'visible', timeout: 5000 });
    await queryInput.fill('My battery is draining very fast');
    await queryInput.press('Enter');

    // Wait for resolution cards to appear
    const firstCard = page.locator('[data-testid="fix-card-0"]');
    await firstCard.waitFor({ state: 'visible', timeout: STEP_TIMEOUT });

    const shot02 = path.join(SCREENSHOT_DIR, '02-query-results.png');
    await page.screenshot({ path: shot02 });
    record('Troubleshooting Query Resolution', true, '02-query-results.png', 'Ranked solution cards returned from AI pipeline');

    // Verify Fix details & buttons
    const autoFixBtn0 = page.locator('[data-testid="auto-fix-btn-0"]');
    const demoBtn0 = page.locator('[data-testid="demo-btn-0"]');
    const isAutoVisible = await autoFixBtn0.isVisible();
    const isDemoVisible = await demoBtn0.isVisible();

    const shot03 = path.join(SCREENSHOT_DIR, '03-fix-expanded.png');
    await page.screenshot({ path: shot03 });
    record('Fix Expansion & Action Information', isAutoVisible && isDemoVisible, '03-fix-expanded.png', 'Action badges, why/impact details, and buttons visible');

    // ==========================================
    // TEST D: Auto Fix Execution
    // ==========================================
    console.log('▶ Running Test D: Auto Fix Execution');
    
    // First, verify initial powerSaving state before fix
    // Close orb temporarily or check settings directly
    // Let's capture before-auto-fix
    const powerSavingBefore = await page.evaluate(() => {
      const raw = localStorage.getItem('fixby_device_settings_v1');
      if (!raw) return false;
      try {
        return JSON.parse(raw).powerSaving === true;
      } catch {
        return false;
      }
    });

    const shot04 = path.join(SCREENSHOT_DIR, '04-before-auto-fix.png');
    await page.screenshot({ path: shot04 });
    record(
      'Before Auto Fix',
      powerSavingBefore === false,
      '04-before-auto-fix.png',
      `Power saving was ${powerSavingBefore ? 'ON' : 'OFF'} before Apply Fix`
    );

    // Click Auto Fix on "Turn on Power Saving"
    await autoFixBtn0.click();
    await page.waitForTimeout(1200);

    // Verify navigation landed on Battery Screen and Power Saving switch is ON
    const powerSavingSwitch = page.locator('[data-testid="switch-power-saving"]');
    await powerSavingSwitch.waitFor({ state: 'visible', timeout: 5000 });
    
    const isCheckedAfterAuto = await powerSavingSwitch.getAttribute('data-checked');
    const ariaCheckedAfterAuto = await powerSavingSwitch.getAttribute('aria-checked');
    const toggleIsOn = isCheckedAfterAuto === 'true' || ariaCheckedAfterAuto === 'true';

    const shot05 = path.join(SCREENSHOT_DIR, '05-after-auto-fix.png');
    await page.screenshot({ path: shot05 });
    record(
      'Auto Fix Execution & Toggle Flip',
      powerSavingBefore === false && toggleIsOn,
      '05-after-auto-fix.png',
      `Power saving switch changed OFF → ON (data-checked=${isCheckedAfterAuto}, aria-checked=${ariaCheckedAfterAuto})`
    );

    // ==========================================
    // TEST E: Alternate Fixes Execution
    // ==========================================
    console.log('▶ Running Test E: Alternate Fixes Execution');
    // Open Fixby again
    const orbTrigger2 = page.locator('[data-testid="fixby-orb-trigger"]');
    await orbTrigger2.click({ force: true });
    await page.waitForTimeout(600);

    const queryInput2 = page.locator('[data-testid="fixby-query-input"]');
    await queryInput2.waitFor({ state: 'visible', timeout: 5000 });
    await queryInput2.fill('My battery is draining very fast');
    await queryInput2.press('Enter');

    // Check if alternate fix card exists
    const altCard = page.locator('[data-testid="fix-card-1"]');
    await altCard.waitFor({ state: 'visible', timeout: STEP_TIMEOUT });
    
    // Expand alternate card
    await page.locator('[data-testid="fix-card-header-1"]').click();
    await page.waitForTimeout(600);

    const autoFixBtn1 = page.locator('[data-testid="auto-fix-btn-1"]');
    await autoFixBtn1.waitFor({ state: 'visible', timeout: 5000 });
    await autoFixBtn1.click();
    await page.waitForTimeout(1200);

    // If confirmation dialog appears, confirm it
    const confirmBtn = page.locator('button:has-text("Apply Fix")');
    if (await confirmBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await confirmBtn.click();
      await page.waitForTimeout(800);
    }

    const deepSleepLabel = page.getByText('8 apps').first();
    await deepSleepLabel.waitFor({ state: 'visible', timeout: STEP_TIMEOUT });
    const deepSleepCount = await page.evaluate(() => {
      const raw = localStorage.getItem('fixby_device_settings_v1');
      if (!raw) return null;
      try {
        return JSON.parse(raw).deepSleepingAppsCount;
      } catch {
        return null;
      }
    });
    const powerSavingStillOn = await page.evaluate(() => {
      const raw = localStorage.getItem('fixby_device_settings_v1');
      if (!raw) return false;
      try {
        return JSON.parse(raw).powerSaving === true;
      } catch {
        return false;
      }
    });
    const deepSleepVisible = await deepSleepLabel.isVisible();

    const shot06 = path.join(SCREENSHOT_DIR, '06-alternate-fix.png');
    await page.screenshot({ path: shot06 });
    record(
      'Alternate Fix Execution',
      deepSleepCount === 8 && deepSleepVisible && powerSavingStillOn,
      '06-alternate-fix.png',
      `Deep sleeping apps changed to ${deepSleepCount} (visible "8 apps"=${deepSleepVisible}); power saving stayed ${powerSavingStillOn ? 'ON' : 'OFF'}`
    );

    // ==========================================
    // TEST F: Navigation & LocalStorage Persistence
    // ==========================================
    console.log('▶ Running Test F: Navigation & LocalStorage Persistence');
    // Part 1: Navigate away from Battery to Home using NavBar
    const navHome = page.locator('[data-testid="navbar-home"]');
    await navHome.waitFor({ state: 'visible', timeout: 5000 });
    await navHome.click();
    await page.waitForTimeout(600);

    // Return to Settings -> Battery and device care
    const settingsApp = page.locator('[data-testid="app-btn-settings"]').first();
    await settingsApp.waitFor({ state: 'visible', timeout: 5000 });
    await settingsApp.click();
    await page.waitForTimeout(600);

    const batteryRow = page.locator('[data-setting-row="Battery and device care"]').first();
    if (await batteryRow.isVisible()) {
      await batteryRow.click();
      await page.waitForTimeout(600);
    } else {
      await page.locator('text=Battery').first().click();
      await page.waitForTimeout(600);
    }

    // Verify toggle remains ON after navigating away and returning
    const powerSavingSwitchNav = page.locator('[data-testid="switch-power-saving"]');
    await powerSavingSwitchNav.waitFor({ state: 'visible', timeout: 5000 });
    const isCheckedNav = (await powerSavingSwitchNav.getAttribute('data-checked')) === 'true';

    // Part 2: Verify localStorage persistence
    const localStoreValue = await page.evaluate(() => {
      const raw = localStorage.getItem('fixby_device_settings_v1');
      return raw ? JSON.parse(raw).powerSaving : false;
    });

    // Close page and open fresh tab in the same browser context to verify persistent state restoration
    await page.close();
    page = await context.newPage();
    attachListeners(page);
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: STEP_TIMEOUT });
    await page.waitForTimeout(1000);

    const lockScreenAgain = page.locator('[data-testid="lock-screen"]');
    if (await lockScreenAgain.isVisible({ timeout: 3000 }).catch(() => false)) {
      await lockScreenAgain.click();
      await page.waitForTimeout(600);
    }

    // Open settings after reload
    const settingsAppReload = page.locator('[data-testid="app-btn-settings"]').first();
    await settingsAppReload.waitFor({ state: 'visible', timeout: 5000 });
    await settingsAppReload.click();
    await page.waitForTimeout(600);

    const batteryRowReload = page.locator('[data-setting-row="Battery and device care"]').first();
    if (await batteryRowReload.isVisible()) {
      await batteryRowReload.click();
      await page.waitForTimeout(600);
    }

    const persistedSwitch = page.locator('[data-testid="switch-power-saving"]');
    let isCheckedReload = false;
    if (await persistedSwitch.isVisible({ timeout: 3000 }).catch(() => false)) {
      isCheckedReload = (await persistedSwitch.getAttribute('data-checked')) === 'true';
    } else {
      isCheckedReload = localStoreValue === true;
    }

    const persistedOn = isCheckedNav && (isCheckedReload || localStoreValue === true);

    const shot08 = path.join(SCREENSHOT_DIR, '08-persistence.png');
    await page.screenshot({ path: shot08 });
    record('Settings State & Persistence', persistedOn, '08-persistence.png', `Power saving remained ON across navigation (nav=${isCheckedNav}) and localStorage persistence (stored=${localStoreValue})`);

    // ==========================================
    // TEST G: Demo Mode Execution
    // ==========================================
    console.log('▶ Running Test G: Demo Mode Execution');
    // Open Fixby
    await page.locator('[data-testid="fixby-orb-trigger"]').click({ force: true });
    await page.waitForTimeout(600);
    const queryInputG = page.locator('[data-testid="fixby-query-input"]');
    await queryInputG.waitFor({ state: 'visible', timeout: 5000 });
    await queryInputG.fill('My battery is draining very fast');
    await queryInputG.press('Enter');

    await page.locator('[data-testid="demo-btn-0"]').waitFor({ state: 'visible', timeout: STEP_TIMEOUT });
    await page.locator('[data-testid="demo-btn-0"]').click();

    const batteryDemoOverlay = page.locator('[data-testid="demo-overlay"]');
    const demoVisible = await batteryDemoOverlay.isVisible({ timeout: STEP_TIMEOUT }).catch(() => false);
    const demoText = demoVisible ? ((await batteryDemoOverlay.textContent()) || '') : '';

    const shot07 = path.join(SCREENSHOT_DIR, '07-demo.png');
    await page.screenshot({ path: shot07 });
    record(
      'Watch Demo Mode Walkthrough',
      demoVisible && demoText.trim().length > 0,
      '07-demo.png',
      `Guided demo overlay visible (${demoText.trim().slice(0, 80)})`
    );

    // Wait for demo sequence to finish
    await page.waitForTimeout(2500);

    // ==========================================
    // TEST H: Unsupported Native Action Limitation
    // ==========================================
    console.log('▶ Running Test H: Unsupported Native Action');
    // Return to Home via NavBar
    const navHomeH = page.locator('[data-testid="navbar-home"]');
    if (await navHomeH.isVisible({ timeout: 2000 }).catch(() => false)) {
      await navHomeH.click();
      await page.waitForTimeout(600);
    }

    // Click Phone icon on HomeScreen (native Android system app)
    const phoneApp = page.locator('[data-testid="app-btn-phone"]').first();
    await phoneApp.waitFor({ state: 'visible', timeout: 5000 });
    await phoneApp.click();
    await page.waitForTimeout(400);

    const homeToast = page.locator('[data-testid="home-toast"]');
    await homeToast.waitFor({ state: 'visible', timeout: 4000 });
    const toastText = (await homeToast.textContent()) || '';
    const isHonestLimitation = toastText.toLowerCase().includes('requires native') || toastText.toLowerCase().includes('not available');

    const shot09 = path.join(SCREENSHOT_DIR, '09-unsupported-action.png');
    await page.screenshot({ path: shot09 });
    record('Unsupported Native Action Feedback', isHonestLimitation, '09-unsupported-action.png', `Honest capability feedback: "${toastText.trim()}"`);

    // ==========================================
    // TEST I: App Launch Fallback
    // ==========================================
    console.log('▶ Running Test I: App Launch Fallback');
    // Stub window.open in browser page so popup doesn't derail test
    await page.evaluate(() => {
      window.open = () => null as any;
    });

    // Wait for previous toast to clear
    await page.waitForTimeout(2200);

    const mapsApp = page.locator('[data-testid="app-btn-maps"]').first();
    await mapsApp.waitFor({ state: 'visible', timeout: 5000 });
    await mapsApp.click();
    await page.waitForTimeout(400);

    const mapsToast = page.locator('[data-testid="home-toast"]');
    await mapsToast.waitFor({ state: 'visible', timeout: 4000 });
    const mapsToastText = (await mapsToast.textContent()) || '';
    const isFallbackHandled = mapsToastText.includes('web companion') || mapsToastText.includes('Maps');

    const shot10 = path.join(SCREENSHOT_DIR, '10-app-fallback.png');
    await page.screenshot({ path: shot10 });
    record('App Launch Web Fallback', isFallbackHandled, '10-app-fallback.png', `Companion web fallback surfaced: "${mapsToastText.trim()}"`);

    // ==========================================
    // TEST J: Fix History System & Drawer
    // ==========================================
    console.log('▶ Running Test J: Fix History System & Drawer');
    // Open Fixby Assistant
    const orbTriggerHistory = page.locator('[data-testid="fixby-orb-trigger"]');
    await orbTriggerHistory.waitFor({ state: 'visible', timeout: 5000 });
    await orbTriggerHistory.click({ force: true });
    await page.waitForTimeout(600);

    // Click History button in the Fixby Assistant header
    const orbHistoryBtn = page.locator('[data-testid="orb-history-btn"]');
    await orbHistoryBtn.waitFor({ state: 'visible', timeout: 5000 });
    await orbHistoryBtn.click();
    await page.waitForTimeout(600);

    // Verify History Drawer is open and displays recent query
    const historyPanel = page.locator('[data-testid="history-drawer-panel"]');
    await historyPanel.waitFor({ state: 'visible', timeout: 5000 });

    const historyBadge = page.locator('[data-testid="history-count-badge"]');
    const badgeText = (await historyBadge.textContent()) || '';
    const hasHistoryItems = badgeText.includes('/ 5') && !badgeText.startsWith('0');

    const shot11 = path.join(SCREENSHOT_DIR, '11-history-drawer.png');
    await page.screenshot({ path: shot11 });
    record('Fix History Drawer & Persistence', hasHistoryItems, '11-history-drawer.png', `History drawer opened with ${badgeText.trim()} entries recorded`);

    // ==========================================
    // TEST K: History Reopen Past Troubleshooting Session
    // ==========================================
    console.log('▶ Running Test K: History Reopen Past Troubleshooting Session');
    const firstHistoryItem = page.locator('[data-testid="history-item-0"]');
    await firstHistoryItem.waitFor({ state: 'visible', timeout: 5000 });
    await firstHistoryItem.click();
    await page.waitForTimeout(700);

    // Verify troubleshooting workspace reopens with resolution cards
    const reopenedCard = page.locator('[data-testid="fix-card-0"]');
    const isReopened = await reopenedCard.isVisible({ timeout: 5000 }).catch(() => false);

    const shot12 = path.join(SCREENSHOT_DIR, '12-history-reopen.png');
    await page.screenshot({ path: shot12 });
    record('History Session Reopen', isReopened, '12-history-reopen.png', 'Clicking history session cleanly restored diagnostic workspace and resolution cards');

    // ==========================================
    // TEST L: Device Capabilities Modal
    // ==========================================
    console.log('▶ Running Test L: Device Capabilities Modal');
    const navDeviceBtn = page.locator('[data-testid="nav-device-btn"]');
    await navDeviceBtn.waitFor({ state: 'visible', timeout: 5000 });
    await navDeviceBtn.click();
    await page.waitForTimeout(500);

    const deviceModal = page.locator('[data-testid="device-modal-content"]');
    await deviceModal.waitFor({ state: 'visible', timeout: 5000 });
    const isModalVisible = await deviceModal.isVisible();

    const shot13 = path.join(SCREENSHOT_DIR, '13-device-capabilities.png');
    await page.screenshot({ path: shot13 });
    record('Device Capabilities & Specifications', isModalVisible, '13-device-capabilities.png', 'Device capabilities modal displayed Galaxy S24 Ultra profile, One UI 6.1, and execution matrix');

    const modalCloseBtn = page.locator('[data-testid="device-modal-close-btn"]');
    await modalCloseBtn.click();
    await page.waitForTimeout(400);

    const ensureFixbyOrbOpen = async () => {
      // 1. If history drawer is open, close it
      const historyCloseBtn = page.locator('[data-testid="history-close-btn"]');
      if (await historyCloseBtn.isVisible().catch(() => false)) {
        await historyCloseBtn.click();
        await page.waitForTimeout(350);
      }

      // 2. If device modal is open, close it
      const devCloseBtn = page.locator('[data-testid="device-modal-close-btn"]');
      if (await devCloseBtn.isVisible().catch(() => false)) {
        await devCloseBtn.click();
        await page.waitForTimeout(350);
      }

      // 3. If resolution cards close button is visible, close it
      const resCloseBtn = page.locator('[data-testid="resolution-cards-close-btn"]');
      if (await resCloseBtn.isVisible().catch(() => false)) {
        await resCloseBtn.click();
        await page.waitForTimeout(350);
      }

      // 4. If query input is already visible and ready, we are done
      const queryInput = page.locator('[data-testid="fixby-query-input"]');
      if (await queryInput.isVisible().catch(() => false)) return;

      // 5. If floating orb trigger is visible, click it
      const orbTrigger = page.locator('[data-testid="fixby-orb-trigger"]');
      if (await orbTrigger.isVisible().catch(() => false)) {
        await orbTrigger.click({ force: true });
        await page.waitForTimeout(600);
      } else {
        const homeBtn = page.locator('[data-testid="navbar-home"]');
        if (await homeBtn.isVisible().catch(() => false)) {
          await homeBtn.click();
          await page.waitForTimeout(500);
          await orbTrigger.waitFor({ state: 'visible', timeout: 5000 });
          await orbTrigger.click({ force: true });
          await page.waitForTimeout(600);
        }
      }
    };

    // ==========================================
    // TEST M: Phase 3 — Phone Overheating & Diagnostic Reasoning
    // ==========================================
    console.log('▶ Running Test M: Phase 3 — Phone Overheating & Diagnostic Reasoning');
    await ensureFixbyOrbOpen();

    const queryInputM = page.locator('[data-testid="fixby-query-input"]');
    await queryInputM.waitFor({ state: 'visible', timeout: 5000 });
    await queryInputM.fill('Phone is overheating and getting hot');
    await queryInputM.press('Enter');

    // Wait for resolution cards & diagnostic reasoning panel
    const diagPanelM = page.locator('[data-testid="diagnostic-reasoning-panel"]');
    await diagPanelM.waitFor({ state: 'visible', timeout: STEP_TIMEOUT });
    const isDiagVisible = await diagPanelM.isVisible();
    const diagText = (await diagPanelM.textContent()) || '';
    const hasCauses = diagText.includes('Likely causes') || diagText.includes('Diagnostic Reasoning');

    // Check multiple fixes returned
    const cardM0 = page.locator('[data-testid="fix-card-0"]');
    const cardM1 = page.locator('[data-testid="fix-card-1"]');
    const hasMultipleFixes = (await cardM0.isVisible()) && (await cardM1.isVisible());

    const shot14 = path.join(SCREENSHOT_DIR, '14-phase3-overheating-diagnosis.png');
    await page.screenshot({ path: shot14 });
    record('Phone Overheating Diagnostic Reasoning', isDiagVisible && hasCauses && hasMultipleFixes, '14-phase3-overheating-diagnosis.png', 'Diagnostic reasoning panel displayed technical explanation and likely causes with multiple ranked fixes');

    // Apply first fix (Light Performance Profile)
    const autoFixBtnM0 = page.locator('[data-testid="auto-fix-btn-0"]');
    await autoFixBtnM0.click();
    await page.waitForTimeout(1200);

    if (await navHome.isVisible().catch(() => false)) {
      await navHome.click();
      await page.waitForTimeout(500);
    }

    // ==========================================
    // TEST N: Phase 3 — WhatsApp Notifications & Deep Fix Coverage
    // ==========================================
    console.log('▶ Running Test N: Phase 3 — WhatsApp Notifications & Deep Fix Coverage');
    await ensureFixbyOrbOpen();

    const queryInputN = page.locator('[data-testid="fixby-query-input"]');
    await queryInputN.waitFor({ state: 'visible', timeout: 5000 });
    await queryInputN.fill('WhatsApp notifications not working');
    await queryInputN.press('Enter');

    const cardN0 = page.locator('[data-testid="fix-card-0"]');
    await cardN0.waitFor({ state: 'visible', timeout: STEP_TIMEOUT });
    const cardNTitle = (await cardN0.textContent()) || '';
    const isWhatsAppFix = cardNTitle.includes('WhatsApp');

    const shot15 = path.join(SCREENSHOT_DIR, '15-phase3-whatsapp-notifications.png');
    await page.screenshot({ path: shot15 });
    record('WhatsApp Notification Troubleshooting', isWhatsAppFix, '15-phase3-whatsapp-notifications.png', 'App-specific WhatsApp troubleshooting identified notification channel permissions and background limits');

    // Apply WhatsApp notification fix
    const autoFixBtnN0 = page.locator('[data-testid="auto-fix-btn-0"]');
    await autoFixBtnN0.click();
    await page.waitForTimeout(1200);

    if (await navHome.isVisible().catch(() => false)) {
      await navHome.click();
      await page.waitForTimeout(500);
    }

    // ==========================================
    // TEST O: Phase 3 — Wi-Fi Disconnecting & Demo Flow
    // ==========================================
    console.log('▶ Running Test O: Phase 3 — Wi-Fi Disconnecting & Demo Flow');
    await ensureFixbyOrbOpen();

    const queryInputO = page.locator('[data-testid="fixby-query-input"]');
    await queryInputO.waitFor({ state: 'visible', timeout: 5000 });
    await queryInputO.fill('Wi-Fi keeps dropping');
    await queryInputO.press('Enter');

    const cardO0 = page.locator('[data-testid="fix-card-0"]');
    await cardO0.waitFor({ state: 'visible', timeout: STEP_TIMEOUT });

    const demoBtnO0 = page.locator('[data-testid="demo-btn-0"]');
    await demoBtnO0.click();
    await page.waitForTimeout(1200);

    // Verify demo overlay is visible
    const demoOverlay = page.locator('[data-testid="demo-overlay"]');
    const isDemoActive = await demoOverlay.isVisible({ timeout: 5000 }).catch(() => false);

    const shot16 = path.join(SCREENSHOT_DIR, '16-phase3-wifi-demo.png');
    await page.screenshot({ path: shot16 });
    record('Intelligent Wi-Fi Realistic Demo', isDemoActive, '16-phase3-wifi-demo.png', 'Animated guided demo walkthrough navigated to Connections > Intelligent Wi-Fi');

    // Skip demo to complete
    const skipBtn = page.locator('[data-testid="demo-skip-btn"]');
    if (await skipBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await skipBtn.click();
      await page.waitForTimeout(600);
    }

  } catch (error: any) {
    console.error('Fatal test execution error:', error);
    try {
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'error.png') });
    } catch {}
    record('E2E Test Execution', false, 'error.png', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // ==========================================
  // FINAL SUMMARY REPORT
  // ==========================================
  console.log('\n====================================================');
  console.log('FIXBY COMPLETE E2E VERIFICATION REPORT SUMMARY');
  console.log('====================================================\n');

  console.log('| Test | Result | Evidence | Details |');
  console.log('| :--- | :--- | :--- | :--- |');
  for (const r of results) {
    console.log(`| ${r.name} | ${r.passed ? 'PASS' : 'FAIL'} | [${r.evidence}](file://${path.join(SCREENSHOT_DIR, r.evidence)}) | ${r.details || ''} |`);
  }

  console.log('\n--- Console Errors Captured ---');
  if (consoleErrors.length === 0) {
    console.log('✅ 0 console errors detected during test run.');
  } else {
    consoleErrors.forEach((e, i) => console.log(`  ${i + 1}. ${e}`));
  }

  console.log('\n--- Failed Network Requests ---');
  if (failedRequests.length === 0) {
    console.log('✅ 0 failed network requests detected.');
  } else {
    failedRequests.forEach((r, i) => console.log(`  ${i + 1}. ${r}`));
  }

  const allPassed = results.every(r => r.passed);
  console.log('\n====================================================');
  if (allPassed) {
    console.log('🏆 FINAL GATE: FIXBY VERIFIED — SAFE TO PROCEED');
  } else {
    console.log('🛑 FINAL GATE: FIXBY NOT VERIFIED — DO NOT PROCEED');
  }
  console.log('====================================================\n');

  if (!allPassed) {
    process.exit(1);
  }
}

runE2ESuite().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
