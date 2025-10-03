// CommonNewSearchBar.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Platform,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  StyleProp,
  AccessibilityProps,
} from "react-native";
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { hp, wp } from "../assets/utils/responsive";
import theme from "../assets/colors/theme";

type Mode = "navigate" | "inline";

export interface CommonSearchBarProps extends Omit<Partial<TextInputProps>, "style">, AccessibilityProps {
  mode?: Mode;
  value?: string;
  onChangeText?: (t: string) => void;
  onSubmit?: (t: string) => void;
  onNavigate?: () => void;
  placeholder?: string;
  suggestions?: string[];
  /** Height (in px) used for the visible single-line input area (text line height + padding). */
  inputItemHeight?: number;
  intervalMs?: number;
  animDuration?: number;
  showSpinner?: boolean;
  style?: StyleProp<ViewStyle>;
  withoutWrapperSpacing?: boolean;
  allowFontScaling?: boolean;
  testID?: string;
  /** Optional override to force card height exactly (used when you want to match an external style) */
  cardHeightOverride?: number;
}

const CommonNewSearchBar: React.FC<CommonSearchBarProps> = ({
  mode = "navigate",
  value = "",
  onChangeText,
  onSubmit,
  onNavigate,
  placeholder = "Search",
  suggestions = ["tea", "coffee", "snacks", "chai", "cold coffee", "iced tea"],
  inputItemHeight = Math.round(hp(2.6)),
  intervalMs = 2500,
  animDuration = 420,
  showSpinner = false,
  style,
  withoutWrapperSpacing = false,
  allowFontScaling = true,
  testID = "common-search-bar",
  accessibilityLabel,
  editable,
  cardHeightOverride,
  ...rest
}) => {
  const [focused, setFocused] = useState(false);

  // a small UI state: when inline and focused & value length > 0 we treat as searching
  const isSearching = (value?.trim()?.length ?? 0) > 0 && focused;

  const tickerItems = useMemo(() => (Array.isArray(suggestions) && suggestions.length ? [...suggestions, suggestions[0]] : []), [suggestions]);
  const tickerCount = tickerItems.length;

  const tickerIndexRef = useRef<number>(0);
  const tickerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const translateY = useSharedValue(0);
  const tickerAnimStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }), []);

  const inputRef = useRef<TextInput | null>(null);

  // Start / stop ticker. Pause when user is actively typing (isSearching)
  useEffect(() => {
    const start = () => {
      if (tickerIntervalRef.current) return;
      tickerIntervalRef.current = setInterval(() => {
        if (isSearching) return;
        const next = tickerIndexRef.current + 1;
        translateY.value = withTiming(-next * inputItemHeight, { duration: animDuration });
        tickerIndexRef.current = next;
        if (next === tickerCount - 1) {
          setTimeout(() => {
            tickerIndexRef.current = 0;
            translateY.value = withTiming(0, { duration: 0 });
          }, animDuration + 20);
        }
      }, intervalMs);
    };
    start();
    return () => {
      if (tickerIntervalRef.current) {
        clearInterval(tickerIntervalRef.current);
        tickerIntervalRef.current = null;
      }
    };
  }, [translateY, isSearching, tickerCount, inputItemHeight, intervalMs, animDuration]);

  const handlePressNavigate = useCallback(() => {
    if (mode === "navigate") {
      onNavigate?.();
    } else {
      inputRef.current?.focus();
    }
  }, [mode, onNavigate]);

  const clear = useCallback(() => {
    onChangeText?.("");
    if (mode === "inline") inputRef.current?.focus();
  }, [onChangeText, mode]);

  // Icon geometry used to compute ticker left offset (ensures ticker text doesn't overlap icon)
  const ICON_SIZE = Math.round(wp(3.5));
  const ICON_MARGIN_RIGHT = wp(2);
  const leftOffsetForTicker = Math.round(wp(3) + ICON_SIZE + ICON_MARGIN_RIGHT + 2);

  const accLabel = accessibilityLabel ?? (mode === "navigate" ? "Open search" : "Search input");

  // Card height: prefer explicit override (so you can pass styles.searchCard height), else use inputItemHeight + some vertical padding
  // This makes the component adapt to your external `searchCard` which in your app was ~hp(5.4)
  const computedCardHeight = cardHeightOverride ?? Math.max(inputItemHeight + Math.round(hp(0.8)), Math.round(hp(5.4)));

  return (
    <View style={[withoutWrapperSpacing ? undefined : styles.wrapper, style]}>
      <View style={[styles.card, { height: computedCardHeight }]} testID={testID}>
        <Ionicons name="search" size={ICON_SIZE} color={theme.PRIMARY_COLOR} style={{ marginRight: ICON_MARGIN_RIGHT }} />

        {mode === "navigate" ? (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handlePressNavigate}
            style={styles.flex}
            accessibilityRole="button"
            accessibilityLabel={accLabel}
            accessible
            testID={`${testID}-navigate`}
          >
            <View pointerEvents="none" style={{ justifyContent: "center", height: computedCardHeight, width: "100%" }}>
              {value?.trim() ? (
                <Text numberOfLines={1} style={[styles.inputText, { includeFontPadding: false }]} allowFontScaling={allowFontScaling}>
                  {value}
                </Text>
              ) : (
                <View style={[styles.tickerClip, { height: inputItemHeight }]}>
                  <Animated.View style={[tickerAnimStyle]}>
                    {tickerItems.map((w, i) => (
                      <View key={`${w}-${i}`} style={{ height: inputItemHeight, justifyContent: "center" }}>
                        <Text style={[styles.tickerText, { includeFontPadding: false }]} numberOfLines={1} allowFontScaling={allowFontScaling}>
                          {`${placeholder} ${w}`}
                        </Text>
                      </View>
                    ))}
                  </Animated.View>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.flex}>
            <TextInput
              ref={inputRef}
              value={value}
              onChangeText={onChangeText}
              placeholder={placeholder}
              placeholderTextColor="#7f7a8b"
              style={[
                styles.input,
                {
                  height: "100%",
                  lineHeight: Math.round(Math.max(13, Math.round(wp(3.6))) * 1.2),
                  paddingVertical: 0,
                  textAlignVertical: "center",
                },
              ]}
              returnKeyType="search"
              onSubmitEditing={() => onSubmit?.(value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              underlineColorAndroid="transparent"
              autoCorrect={false}
              autoCapitalize="none"
              editable={editable ?? true}
              allowFontScaling={allowFontScaling}
              accessibilityLabel={accLabel}
              accessible
              testID={`${testID}-inline`}
              {...(rest as TextInputProps)}
            />

            {/* ticker overlay sits absolutely inside the card; left offset calculated to avoid overlapping icon */}
            {!value?.trim() && !focused ? (
              <View pointerEvents="none" style={[styles.tickerOverlay, { height: inputItemHeight, left: leftOffsetForTicker, right: wp(3) }]}>
                <Animated.View style={[tickerAnimStyle]}>
                  {tickerItems.map((w, i) => (
                    <View key={`${w}-${i}`} style={{ height: inputItemHeight, justifyContent: "center" }}>
                      <Text style={styles.tickerText} numberOfLines={1} allowFontScaling={allowFontScaling}>
                        {w}
                      </Text>
                    </View>
                  ))}
                </Animated.View>
              </View>
            ) : null}
          </View>
        )}

        {showSpinner ? (
          <ActivityIndicator size="small" color={theme.PRIMARY_COLOR} style={{ marginLeft: wp(2) }} />
        ) : value ? (
          <Pressable onPress={clear} style={{ marginLeft: wp(2) }} accessibilityRole="button" accessibilityLabel="Clear search" testID={`${testID}-clear`}>
            <Ionicons name="close-circle" size={Math.round(wp(4))} color="#7e6b9a" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

export default React.memo(CommonNewSearchBar);

const styles = StyleSheet.create({
  wrapper: { marginHorizontal: wp(5), marginTop: hp(2) },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: hp(1.2),
    paddingHorizontal: wp(3),
    // height is applied inline from computedCardHeight
    ...Platform.select({
      android: { elevation: 2 },
      ios: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
    }),
    paddingVertical: Platform.OS === "android" ? 12 : 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  flex: { flex: 1 },
  input: {
    flex: 1,
    fontSize: Math.max(13, Math.round(wp(3.6))),
    color: "#333",
    paddingHorizontal: 0,
  },
  inputText: {
    color: "#333",
    fontSize: Math.max(13, Math.round(wp(3.6))),
  },
  tickerClip: { overflow: "hidden", justifyContent: "flex-start" },
  tickerOverlay: { position: "absolute", justifyContent: "center" },
  tickerText: { color: "#999", fontSize: Math.max(13, Math.round(wp(3.6))) },
});
