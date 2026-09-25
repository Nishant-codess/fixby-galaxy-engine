import { useState, useCallback } from 'react';

export type Screen = 
  | 'lock' | 'home' | 'recents' | 'drawer'
  | 'settings' | 'settings/display' | 'settings/samsung-account'
  | 'settings/connections' | 'settings/battery' | 'settings/notifications'
  | 'settings/lock-screen' | 'settings/security' | 'settings/general'
  | 'settings/about' | 'settings/wellbeing' | 'settings/apps'
  | 'settings/phone' | 'settings/generic'
  | 'settings/sound' | 'settings/camera' | 'settings/advanced'
  | 'settings/device-care' | 'settings/privacy' | 'settings/accessibility'
  | 'app/mock';

export function usePhoneNavigation(initialScreen: Screen = 'lock') {
  const [stack, setStack] = useState<Screen[]>([initialScreen]);

  const currentScreen = stack[stack.length - 1];

  const push = useCallback((screen: Screen) => {
    setStack(prev => [...prev, screen]);
  }, []);

  const pop = useCallback(() => {
    setStack(prev => {
      if (prev.length <= 1) return prev;
      return prev.slice(0, -1);
    });
  }, []);

  const reset = useCallback(() => {
    setStack(['home']);
  }, []);

  const replace = useCallback((screen: Screen) => {
    setStack(prev => {
      const newStack = [...prev];
      newStack[newStack.length - 1] = screen;
      return newStack;
    });
  }, []);

  // Push multiple screens atomically — avoids race conditions
  const pushMany = useCallback((screens: Screen[]) => {
    setStack(prev => {
      const base = prev[0]; // always keep root
      return [base, ...screens];
    });
  }, []);

  return {
    stack,
    currentScreen,
    push,
    pop,
    reset,
    replace,
    pushMany
  };
}
