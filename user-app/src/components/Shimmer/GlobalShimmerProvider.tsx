// src/components/GlobalShimmerProvider.tsx
import React, { useEffect, useRef } from "react";
import { AccessibilityInfo } from "react-native";
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  runOnUI,
} from "react-native-reanimated";
import type { SharedValue } from 'react-native-reanimated';

type ContextValue = {
  progress: Animated.SharedValue<number>;
  disabled: boolean;
};

const ShimmerContext = React.createContext<ContextValue | null>(null);

export const GlobalShimmerProvider: React.FC<{
  duration?: number;
  children: React.ReactNode;
  disabled?: boolean;
}> = ({ duration = 1100, children, disabled = false }) => {
  const progress = useSharedValue(0);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    // check reduce motion
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      reducedMotionRef.current = v;
    });
  }, []);

  useEffect(() => {
    if (disabled || reducedMotionRef.current) {
      // keep progress static
      progress.value = 0;
      return;
    }

    // start shared loop on UI thread
    runOnUI(() => {
      "worklet";
      progress.value = withRepeat(
        withTiming(1, { duration, easing: Easing.linear }),
        -1,
        false
      );
    })();
    // cleanup: withRepeat automatically stops when the shared value is garbage-collected/unmounted
  }, [duration, disabled, progress]);

  return (
    <ShimmerContext.Provider value={{ progress, disabled: disabled || reducedMotionRef.current }}>
      {children}
    </ShimmerContext.Provider>
  );
};

export const useGlobalShimmer = () => {
  const ctx = React.useContext(ShimmerContext);
  if (!ctx) {
    throw new Error("useGlobalShimmer must be used inside GlobalShimmerProvider");
  }
  return ctx;
};


// Notes

// This creates one progress shared value looped on the UI thread.

// AccessibilityInfo.isReduceMotionEnabled() disables animation if user prefers reduced motion.