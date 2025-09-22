import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StyleSheet,
  SectionList,
  Keyboard,
  Platform,
  AccessibilityProps,
  Pressable,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
} from "react-native-reanimated";

/*
  CommonUIComponents.tsx (production-ready, TypeScript-friendly)

  Changes compared to earlier draft:
  - This file is written in .tsx style (JSX with prop typing hints) and designed for production
  - `CommonSearchBar` no longer shows any global/default suggestions by default. Ticker animation is opt-in via `suggestions` prop.
  - Ticker animation implemented with react-native-reanimated for smooth, low-jank transitions.
  - Stronger memoization and stable callbacks to reduce re-renders.
  - Accessibility, testIDs and clear prop surface for integration.

  How to use: import the component you need from this file on canvas (Common Uicomponents) and wire your networking logic from screens.
*/

/* ----------------- Types ----------------- */
type CommonSearchBarProps = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (v?: string) => void;
  onClear?: () => void;
  placeholder?: string;
  loading?: boolean;
  suggestions?: string[]; // optional; if absent or empty, no ticker shown
  showTicker?: boolean; // defaults to true when suggestions provided
  testID?: string;
  editable?: boolean;
   onPress?: () => void; // callback when preview pressed
};

const RECENT_KEY = "common_recent_searches_v1";
const TICKER_INTERVAL = 2600;
const TICKER_ANIM_MS = 420;

/* ----------------- Hook: recent searches (persisted) ----------------- */
export function useRecentSearches(initial: string[] = [], max = 8) {
  const [recent, setRecent] = useState<string[]>(initial);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(RECENT_KEY);
        if (!mounted) return;
        if (raw) setRecent(JSON.parse(raw));
      } catch (e) {
        // intentionally silent in production; optional Sentry capture here
        console.warn("useRecentSearches: load failed", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const persist = useCallback(async (arr: string[]) => {
    try {
      await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(arr));
    } catch (e) {
      // ignore write failures
    }
  }, []);

  const add = useCallback((term: string) => {
    const t = (term || "").trim();
    if (!t) return;
    setRecent((cur) => {
      const updated = [t, ...cur.filter((c) => c !== t)].slice(0, max);
      persist(updated);
      return updated;
    });
  }, [max, persist]);

  const clear = useCallback(async () => {
    setRecent([]);
    try {
      await AsyncStorage.removeItem(RECENT_KEY);
    } catch {}
  }, []);

  return {recent, addRecent: add, clearRecent: clear, setRecent};
}

/* ----------------- Ticker (reanimated) ----------------- */
function useTicker(suggestions: string[] | undefined, enabled: boolean) {
  const items = useMemo(() => (suggestions && suggestions.length ? [...suggestions, suggestions[0]] : []), [suggestions]);
  const indexRef = useRef(0);
  const translateY = useSharedValue(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || items.length <= 1) return;

    // run interval on JS thread to update index, but animation on UI thread
    intervalRef.current = setInterval(() => {
      const next = indexRef.current + 1;
      translateY.value = withTiming(-next * 20, {duration: TICKER_ANIM_MS});
      indexRef.current = next;

      if (next === items.length - 1) {
        // reset after a short delay to make loop seamless
        setTimeout(() => {
          indexRef.current = 0;
          translateY.value = withTiming(0, {duration: 0});
        }, TICKER_ANIM_MS + 20);
      }
    }, TICKER_INTERVAL) as unknown as number;

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current as unknown as number);
        intervalRef.current = null;
      }
    };
  }, [enabled, items, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  return {items, animatedStyle};
}

/* ----------------- CommonSearchBar (production ready) ----------------- */
export const NewCommonSearchBar = React.memo(function CommonSearchBar({
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder = "",
  loading = false,
  suggestions,
  showTicker = true,
  testID,
  editable= true,
  onPress,

}: CommonSearchBarProps) {
  const inputRef = useRef<TextInput | null>(null);

  // ticker: only active when suggestions provided and showTicker true and input is empty
  const [focused, setFocused] = useState(false);
  const enabledTicker = !!(showTicker && suggestions && suggestions.length > 0 && !value.trim() && !focused && !loading);
  const {items: tickerItems, animatedStyle: tickerAnimatedStyle} = useTicker(suggestions, enabledTicker);

  const handleClear = useCallback(() => {
    onChange("");
    onClear?.();
    Keyboard.dismiss();
    // keep focus behaviour predictable: blur
    inputRef.current?.blur?.();
  }, [onChange, onClear]);

  const handleSubmit = useCallback(() => {
    onSubmit(value);
  }, [onSubmit, value]);

  return (
    <View style={styles.searchCard} accessibilityRole="search" testID={testID}>
      <Ionicons name="search-outline" size={18} color="#999" />

      <TextInput
        ref={inputRef}
        style={styles.searchInput}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#8f8f9b"
        returnKeyType="search"
        onSubmitEditing={handleSubmit}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        accessible
        accessibilityLabel={placeholder}
        editable={editable}
      />

      {/* Ticker - only when enabled and suggestions exist */}
      {enabledTicker && tickerItems.length > 0 ? (
        <View pointerEvents="none" style={styles.tickerContainer}>
          <Animated.View style={[{overflow: 'hidden'}, tickerAnimatedStyle]}>
            {tickerItems.map((t, i) => (
              <View key={`t-${i}`} style={styles.tickerRow}>
                <Text numberOfLines={1} style={styles.tickerText}>{t}</Text>
              </View>
            ))}
          </Animated.View>
        </View>
      ) : null}
  {!editable && (
        <Pressable
          style={styles.previewOverlay}
          onPress={() => {
            if (onPress) return onPress();
            inputRef.current?.focus?.();
          }}
          accessibilityRole="button"
          accessibilityLabel={placeholder || "Open search"}
        />
      )}
      {/* Right-side icon(s) */}
      {loading ? (
        <ActivityIndicator style={{marginLeft: 8}} size="small" />
      ) : value ? (
        <TouchableOpacity onPress={handleClear} accessibilityLabel="Clear search">
          <Ionicons name="close-circle" size={18} color="#7e6b9a" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
});

NewCommonSearchBar.displayName = 'NewCommonSearchBar';

/* ----------------- Small helpers / wrappers ----------------- */
export const CenteredLoader = React.memo(({size = 'large'}: {size?: 'small' | 'large'}) => (
  <View style={styles.centeredLoader}><ActivityIndicator size={size} /></View>
));

export const InlineSpinner = React.memo(({style}: {style?: any}) => <ActivityIndicator size="small" style={style} />);

export const ErrorView = React.memo(({message = 'Something went wrong', onRetry}: {message?: string; onRetry?: () => void}) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorText}>{message}</Text>
    {onRetry ? (
      <TouchableOpacity onPress={onRetry} style={styles.retryBtn} accessibilityRole="button">
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    ) : null}
  </View>
));

/* ----------------- Export default object for convenience ----------------- */
const CommonUI = {
  NewCommonSearchBar,
  useRecentSearches,
  CenteredLoader,
  InlineSpinner,
  ErrorView,
};

export default CommonUI;

/* ----------------- Styles ----------------- */
const styles = StyleSheet.create({
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'android' ? 8 : 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  searchInput: {flex: 1, paddingVertical: 0, marginLeft: 8, color: '#222', minHeight: 28},
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
    borderRadius: 12,
  },
  tickerContainer: {
    position: 'absolute',
    left: 44,
    right: 44,
    height: 20,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tickerRow: {height: 20, justifyContent: 'center'},
  tickerText: {color: '#7f7a8b'},

  centeredLoader: {height: 160, alignItems: 'center', justifyContent: 'center'},
  errorContainer: {padding: 16, alignItems: 'center'},
  errorText: {color: 'red', marginBottom: 8},
  retryBtn: {paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#6C3F24', borderRadius: 8},
  retryText: {color: '#fff', fontWeight: '600'},
});
