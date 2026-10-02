import { useState, useRef, useCallback } from 'react';

export type Screen = string;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useAnimatedNavigation() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [totalSteps, setTotalSteps] = useState(0);
  const cancelledRef = useRef(false);

  const startDemo = useCallback(async (
    screenSequence: Screen[],
    pushFn: (screen: Screen) => void,
    resetFn: () => void,
    delayMs: number = 600
  ) => {
    cancelledRef.current = false;
    setIsAnimating(true);
    setTotalSteps(screenSequence.length);
    setCurrentStep(-1);

    // Start from home
    resetFn();
    await sleep(delayMs);

    for (let i = 0; i < screenSequence.length; i++) {
      if (cancelledRef.current) {
        // User cancelled — jump to final screen
        pushFn(screenSequence[screenSequence.length - 1]);
        break;
      }
      setCurrentStep(i);
      pushFn(screenSequence[i]);
      await sleep(delayMs);
    }

    setIsAnimating(false);
    setCurrentStep(-1);
  }, []);

  const cancelDemo = useCallback(() => {
    cancelledRef.current = true;
  }, []);

  return { startDemo, cancelDemo, isAnimating, currentStep, totalSteps };
}
