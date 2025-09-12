// // FloatingCoffeeButton.tsx
// import React, { memo, useCallback, useEffect } from "react";
// import { Pressable, Image, StyleSheet, Platform, ViewStyle, View } from "react-native";
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   withSpring,
//   withRepeat,
//   withSequence,
//   cancelAnimation,
//   Easing,
//   runOnJS,
//   withDelay,
// } from "react-native-reanimated";
// import { useSafeAreaInsets } from "react-native-safe-area-context";

// type Props = {
//   imageSource?: any; // require(...) or { uri: '...' }
//   onPress?: () => void;
//   size?: number;
//   offsetRight?: number;
//   offsetBottom?: number;
//   bob?: boolean;
//   containerStyle?: ViewStyle;
//   entranceDelay?: number;
// };

// const FloatingCoffeeButton: React.FC<Props> = memo(({
//   imageSource = require("@/src/assets/images/coffee-cup.png"),
//   onPress,
//   size = 72,
//   offsetRight = 16,
//   offsetBottom = 18,
//   bob = true,
//   containerStyle,
//   entranceDelay = 120, // small delay before entrance animation
// }) => {
//   const insets = useSafeAreaInsets();

//   // Shared values - **do not** write to them during render
//   const translateY = useSharedValue(0); // for bob
//   const rotation = useSharedValue(0); // degrees
//   const entranceScale = useSharedValue(0.76); // entrance pop
//   const pressScale = useSharedValue(1); // press feedback
//   const glowScale = useSharedValue(0.8);
//   const glowOpacity = useSharedValue(0.15);

//   // Combined animated style for main button (scale = entranceScale * pressScale)
//   const animatedButtonStyle = useAnimatedStyle(() => {
//     const combinedScale = entranceScale.value * pressScale.value;
//     const rotateDeg = `${rotation.value}deg`;
//     return {
//       transform: [
//         { translateY: translateY.value },
//         { scale: combinedScale },
//         { rotate: rotateDeg },
//       ],
//     };
//   });

//   // Glow behind the button
//   const animatedGlowStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: glowScale.value }],
//     opacity: glowOpacity.value,
//   }));

//   // Start animations on mount (safe: useEffect)
//   useEffect(() => {
//     // Entrance pop
//     entranceScale.value = withDelay(
//       entranceDelay,
//       withSpring(1, { stiffness: 200, damping: 18 })
//     );

//     // bob + rotation + glow loop
//     if (bob) {
//       // bob: vertical small movement
//       translateY.value = withRepeat(
//         withSequence(
//           withTiming(-6, { duration: 900, easing: Easing.inOut(Easing.quad) }),
//           withTiming(0, { duration: 900, easing: Easing.inOut(Easing.quad) })
//         ),
//         -1,
//         false
//       );

//       // rotation: slight, slow rocking
//       rotation.value = withRepeat(
//         withSequence(
//           withTiming(-3, { duration: 1600, easing: Easing.inOut(Easing.quad) }),
//           withTiming(3, { duration: 1600, easing: Easing.inOut(Easing.quad) })
//         ),
//         -1,
//         false
//       );

//       // glow pulse
//       glowScale.value = withRepeat(
//         withSequence(
//           withTiming(1.08, { duration: 1100, easing: Easing.inOut(Easing.quad) }),
//           withTiming(0.98, { duration: 1100, easing: Easing.inOut(Easing.quad) })
//         ),
//         -1,
//         false
//       );
//       glowOpacity.value = withRepeat(
//         withSequence(
//           withTiming(0.22, { duration: 1100 }),
//           withTiming(0.12, { duration: 1100 })
//         ),
//         -1,
//         false
//       );
//     }

//     // cleanup on unmount - stop animations
//     return () => {
//       cancelAnimation(translateY);
//       cancelAnimation(rotation);
//       cancelAnimation(entranceScale);
//       cancelAnimation(pressScale);
//       cancelAnimation(glowScale);
//       cancelAnimation(glowOpacity);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [bob, entranceDelay]);

//   // Press interactions (writes within handlers - safe)
//   const handlePressIn = useCallback(() => {
//     pressScale.value = withSpring(0.92, { stiffness: 400, damping: 26 });
//   }, [pressScale]);

//   const handlePressOut = useCallback(() => {
//     pressScale.value = withSpring(1, { stiffness: 350, damping: 20 });
//   }, [pressScale]);

//   const handlePress = useCallback(() => {
//     // quick pop animation while preserving entranceScale
//     entranceScale.value = withSequence(
//       withTiming(1.06, { duration: 100 }),
//       withSpring(1, { stiffness: 500, damping: 18 })
//     );

//     // optionally run haptics here via runOnJS if you add expo-haptics

//     if (onPress) {
//       // call JS handler safely from UI thread
//       runOnJS(onPress)();
//     }
//   }, [onPress, entranceScale]);

//   // Container absolute position computed per safe area + offsets
//   const computedStyle: ViewStyle = {
//     position: "absolute",
//     right: offsetRight,
//     bottom: (insets.bottom ?? 0) + offsetBottom,
//     width: size,
//     height: size,
//     zIndex: 9999,
//     elevation: 14,
//   };

//   // Glow element size (slightly larger than button)
//   const glowSize = Math.round(size * 1.32);

//   return (
//     <View pointerEvents="box-none" style={[computedStyle, containerStyle]}>
//       {/* Glow layer behind the cup */}
//       <Animated.View
//         pointerEvents="none"
//         style={[
//           {
//             position: "absolute",
//             // left: (size - glowSize) / 2,
//             // top: (size - glowSize) / 2,
//             // width: glowSize,
//             // height: glowSize,
//             // borderRadius: glowSize / 2,
//             // backgroundColor: "#EDE0C8",
//             // blur-like look: lower opacity + large radius
//           },
//         //   animatedGlowStyle,
//         //   styles.glowShadow,
//         ]}
//       />

//       <Pressable
//         accessibilityRole="button"
//         accessibilityLabel="Open quick action"
//         onPressIn={handlePressIn}
//         onPressOut={handlePressOut}
//         onPress={handlePress}
//         style={{ width: size, height: size }}
//       >
//         <Animated.View style={[styles.buttonShadow, animatedButtonStyle]}>
//           <Image
//             source={imageSource}
//             style={{ width: size, height: size, borderRadius: size / 2 }}
//             resizeMode="cover"
//           />
//         </Animated.View>
//       </Pressable>
//     </View>
//   );
// });

// FloatingCoffeeButton.displayName = "FloatingCoffeeButton";

// const styles = StyleSheet.create({
//   buttonShadow: {
//     // cross-platform shadow
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.16,
//     shadowRadius: 14,
//     bottom:45,
//     // elevation left off so Android shadow follows elevation applied on container
//     borderRadius: 999,
//     overflow: Platform.OS === "android" ? "hidden" : "visible",
//   },
//   glowShadow: {
//     // subtle extra shadow for glow (iOS only; Android will ignore)
//     // shadowColor: "#E6C58E",
//     // shadowOffset: { width: 0, height: 6 },
//     // shadowOpacity: 0.14,
//     // shadowRadius: 20,
//     // elevation: 1,
//   },
// });

// export default FloatingCoffeeButton;
// src/components/FloatingCoffeeButton.tsx
// FloatingCoffeeButton.tsx
import React, { memo, useCallback, useEffect, useRef } from "react";
import { Pressable, StyleSheet, Platform, View, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  cancelAnimation,
  runOnJS,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";
import { hp } from "@/src/assets/utils/responsive";

type Props = {
  animationSource?: any; // require(...) or { uri: '...' }
  onPress?: () => void;
  size?: number;
  offsetRight?: number;
  offsetBottom?: number;
  loop?: boolean;
  containerStyle?: ViewStyle;
};

const FloatingCoffeeButton: React.FC<Props> = memo(({
  animationSource = require("@/src/assets/animation/Coffee love.json"),
  onPress,
  size =75,
  offsetRight = 16,
  offsetBottom = 18,
  loop = true,
  containerStyle,
}) => {
  const insets = useSafeAreaInsets();
  const lottieRef = useRef<LottieView | null>(null);

  // Shared value for press feedback. We do NOT write .value during render.
  const pressScale = useSharedValue(1);

  // Animated style reads the shared value
  const aStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  // Press handlers update the shared value on event (safe)
  const handlePressIn = useCallback(() => {
    pressScale.value = withSpring(0.92, { stiffness: 400, damping: 26 });
  }, [pressScale]);

  const handlePressOut = useCallback(() => {
    pressScale.value = withSpring(1, { stiffness: 350, damping: 20 });
  }, [pressScale]);

  const handlePress = useCallback(() => {
    // optionally restart Lottie to emphasise feedback (safe)
    try {
      lottieRef.current?.reset?.();
      lottieRef.current?.play?.();
    } catch {
      // ignore
    }

    if (onPress) runOnJS(onPress)();
  }, [onPress]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimation(pressScale);
    };
  }, [pressScale]);

  // computed absolute container to sit above tab bar (safe area aware)
  const containerStyleComputed: ViewStyle = {
    position: "absolute",
    right: offsetRight,
    bottom: (insets.bottom ?? 0) + offsetBottom,
    width: size,
    height: size,
    zIndex: 9999,
  };

  return (
    <View pointerEvents="box-none" style={[containerStyleComputed, containerStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open quick action"
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={{ width: size, height: size }}
      >
        <Animated.View style={[styles.buttonShadow, aStyle]}>
          <LottieView
            ref={(r) => (lottieRef.current = r)}
            source={animationSource}
            autoPlay
            loop={loop}
            style={{ width: size, height: size }}
            resizeMode="cover"
          />
        </Animated.View>
      </Pressable>
    </View>
  );
});

FloatingCoffeeButton.displayName = "FloatingCoffeeButton";

const styles = StyleSheet.create({
  buttonShadow: {
    borderRadius: 999,
    overflow: Platform.OS === "android" ? "hidden" : "visible",
    // subtle shadow (iOS)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
   
    // elevation intentionally left on container to control Android z-order
  },
});

export default FloatingCoffeeButton;
