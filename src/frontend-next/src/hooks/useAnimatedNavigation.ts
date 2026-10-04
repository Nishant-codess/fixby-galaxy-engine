import { useState, useRef, useCallback } from 'react';
import { DemoStep } from '../settings/actions';
import { Screen } from './usePhoneNavigation';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface DemoControllerCallbacks {
  push: (screen: Screen) => void;
  reset: () => void;
  setHighlight: (target: string) => void;
  executeDemoToggle?: (targetKey: string, value: any) => void;
  onMessage?: (msg: string) => void;
}

export function useAnimatedNavigation() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [totalSteps, setTotalSteps] = useState(0);
  const [highlightedTarget, setHighlightedTarget] = useState<string | null>(null);
  const [stepMessage, setStepMessage] = useState<string | null>(null);
  const cancelledRef = useRef(false);

  const startDemoSteps = useCallback(async (
    steps: DemoStep[],
    callbacks: DemoControllerCallbacks
  ) => {
    cancelledRef.current = false;
    setIsAnimating(true);
    setTotalSteps(steps.length);
    setCurrentStep(-1);
    setHighlightedTarget(null);
    setStepMessage(null);

    // Initial reset to settings root
    callbacks.reset();
    callbacks.push('settings');
    await sleep(400);

    for (let i = 0; i < steps.length; i++) {
      if (cancelledRef.current) break;

      const step = steps[i];
      setCurrentStep(i);

      if (step.message) {
        setStepMessage(step.message);
        callbacks.onMessage?.(step.message);
      }

      switch (step.type) {
        case 'NAVIGATE':
          if (step.screen) {
            callbacks.push(step.screen);
          }
          break;

        case 'HIGHLIGHT':
          if (step.target) {
            const targetStr = String(step.target);
            setHighlightedTarget(targetStr);
            callbacks.setHighlight(targetStr);
          }
          break;

        case 'TOGGLE':
        case 'CONFIG_CHANGE':
          if (step.target && callbacks.executeDemoToggle) {
            callbacks.executeDemoToggle(String(step.target), step.value);
          }
          break;

        case 'WAIT':
          break;

        case 'COMPLETE':
          setStepMessage(step.message || 'Demo complete');
          break;
      }

      await sleep(step.durationMs || 600);
    }

    setIsAnimating(false);
    setCurrentStep(-1);
    setHighlightedTarget(null);
  }, []);

  // Backward compatible signature
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

    resetFn();
    await sleep(delayMs);

    for (let i = 0; i < screenSequence.length; i++) {
      if (cancelledRef.current) {
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
    setIsAnimating(false);
    setCurrentStep(-1);
    setHighlightedTarget(null);
  }, []);

  return {
    startDemo,
    startDemoSteps,
    cancelDemo,
    isAnimating,
    currentStep,
    totalSteps,
    highlightedTarget,
    stepMessage,
  };
}
