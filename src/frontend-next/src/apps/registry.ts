/**
 * Home-screen app router.
 * Simulator apps open inside the phone. External packages keep the existing
 * native/web capability path and are never pretended to be installed apps.
 */

export type AppLaunch =
  | { type: 'screen'; screen: string }
  | { type: 'assistant' }
  | { type: 'settings' }
  | { type: 'external'; packageName: string; appName: string };

const LAUNCH: Record<string, AppLaunch> = {
  phone: { type: 'screen', screen: 'app/phone' },
  messages: { type: 'screen', screen: 'app/messages' },
  settings: { type: 'settings' },
  fixby: { type: 'assistant' },
  chrome: { type: 'external', packageName: 'com.android.chrome', appName: 'Chrome' },
  camera: { type: 'external', packageName: 'com.sec.android.app.camera', appName: 'Camera' },
  gallery: { type: 'external', packageName: 'com.sec.android.gallery3d', appName: 'Gallery' },
  youtube: { type: 'external', packageName: 'com.google.android.youtube', appName: 'YouTube' },
  maps: { type: 'external', packageName: 'com.google.android.apps.maps', appName: 'Maps' },
  calculator: { type: 'external', packageName: 'com.sec.android.app.popupcalculator', appName: 'Calculator' },
  calendar: { type: 'external', packageName: 'com.samsung.android.calendar', appName: 'Calendar' },
  clock: { type: 'external', packageName: 'com.sec.android.app.clockpackage', appName: 'Clock' },
  contacts: { type: 'external', packageName: 'com.samsung.android.app.contacts', appName: 'Contacts' },
};

export function launchForApp(appId: string, fallbackName?: string): AppLaunch {
  return LAUNCH[appId] || {
    type: 'external',
    packageName: `unknown.${appId}`,
    appName: fallbackName || appId,
  };
}
