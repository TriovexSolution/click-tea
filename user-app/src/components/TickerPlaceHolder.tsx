// src/components/TickerPlaceHolder.tsx
import React, { useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  AccessibilityInfo,
  AppState,
  TextStyle,
  ViewStyle,
} from "react-native";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from "react-native-reanimated";
import { hp } from "@/src/assets/utils/responsive";

type Props = {
  words: string[]; // required list of words
  prefix?: string; // "Try" / "Search for"
  itemHeight?: number; // px for each row (defaults to approx 2.2% screen height)
  interval?: number; // ms between switches
  duration?: number; // animation duration ms
  paused?: boolean; // externally pause rotation
  textStyle?: TextStyle; // optional overrides
  containerStyle?: ViewStyle; // optional overrides
  onChange?: (word: string, index: number) => void; // emits when visible word changes
};

/**
 * Production-ready TickerPlaceHolder
 * - responsive by default (uses hp)
 * - respects reduce-motion accessibility
 * - pauses when app is backgrounded or paused prop is true
 * - minimal re-renders (memoized)
 * - pointerEvents none (visual only)
 */
const TickerPlaceHolder: React.FC<Props> = React.memo(
  ({
    words,
    prefix = "Search for",
    itemHeight = Math.round(hp(2.2)), // default responsive row height
    interval = 2500,
    duration = 420,
    paused = false,
    textStyle,
    containerStyle,
    onChange,
  }: Props) => {
    const translateY = useSharedValue(0);
    const idxRef = useRef(0);
    const intervalRef = useRef<number | null>(null);
    const isReduceMotionRef = useRef(false);
    const appStateRef = useRef(AppState.currentState);

    const wordsLength = Array.isArray(words) ? words.length : 0;

    // compute sensible fontSize from itemHeight (keeps text vertically centered)
    const fontSize = Math.round(itemHeight * 0.78);

    const emitCurrent = useCallback(() => {
      if (onChange && wordsLength > 0) {
        const i = idxRef.current % wordsLength;
        onChange(words[i], i);
      }
    }, [onChange, words, wordsLength]);

    useEffect(() => {
      // reduce-motion preference
      AccessibilityInfo.isReduceMotionEnabled().then((v) => {
        isReduceMotionRef.current = !!v;
      });

      const sub = AppState.addEventListener?.("change", (next) => {
        appStateRef.current = next;
        // when backgrounded clear interval (we'll re-create on resume via effect)
        if (next !== "active" && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      });

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        sub?.remove?.();
      };
    }, []);

    // reset when words length changes (avoid out of bounds)
    useEffect(() => {
      idxRef.current = 0;
      translateY.value = withTiming(0, { duration: 120 });
      emitCurrent();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wordsLength]);

    useEffect(() => {
      // do not start if no words, paused, reduce-motion or app backgrounded
      if (
        wordsLength === 0 ||
        paused ||
        isReduceMotionRef.current ||
        appStateRef.current !== "active"
      ) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }

      // safe min interval
      const safeInterval = Math.max(500, interval);

      if (intervalRef.current == null) {
        intervalRef.current = (setInterval(() => {
          idxRef.current = (idxRef.current + 1) % wordsLength;
          translateY.value = withTiming(-idxRef.current * itemHeight, {
            duration,
          });
          // emit visible word
          emitCurrent();
        }, safeInterval) as unknown) as number;
      }

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }, [paused, wordsLength, interval, duration, itemHeight, translateY, emitCurrent]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
    }));

    if (!words || wordsLength === 0) return null;

    return (
      <View
        style={[styles.outer, { height: itemHeight }, containerStyle]}
        pointerEvents="none"
        accessibilityElementsHidden
      >
        <Animated.View style={[animatedStyle]}>
          {words.map((w, i) => (
            <View
              key={i}
              style={{ height: itemHeight, justifyContent: "center" }}
            >
              <Text
                numberOfLines={1}
                style={[
                  { fontSize, color: "#7f7a8b", lineHeight: Math.round(itemHeight * 0.92) },
                  textStyle,
                ]}
              >
                {prefix ? `${prefix} ${w}` : w}
              </Text>
            </View>
          ))}
        </Animated.View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  outer: {
    overflow: "hidden",
    justifyContent: "center",
  },
  text: {
    fontSize: 14,
    color: "#7f7a8b",
  },
});

export default TickerPlaceHolder;
