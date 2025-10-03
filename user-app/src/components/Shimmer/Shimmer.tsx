// src/components/Shimmer.tsx
import React, { useMemo } from "react";
import { View, ViewStyle, StyleProp } from "react-native";
import Animated, { useAnimatedStyle, interpolate } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useGlobalShimmer } from "./GlobalShimmerProvider";
import type { SharedValue } from 'react-native-reanimated';

type ShimmerProps = {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  shimmerWidth?: number; // px of highlight band
  baseColor?: string;
  highlightColor?: string;
  animate?: boolean;
  sharedProgress?: Animated.SharedValue<number>;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const AnimatedLinear = Animated.createAnimatedComponent(LinearGradient);

const Shimmer: React.FC<ShimmerProps> & { Box?: any } = ({
  width = "100%",
  height = 12,
  borderRadius = 6,
  shimmerWidth = 120,
  baseColor = "#EAEAEA",
  highlightColor = "#F6F6F6",
  animate = true,
  sharedProgress,
  style,
  testID,
}) => {
  // try to use global progress if available, else fallback to prop->undefined (no animation)
  let ctxProgress;
  try {
    ctxProgress = useGlobalShimmer().progress;
  } catch {
    ctxProgress = undefined;
  }

  const progress = sharedProgress ?? ctxProgress;

  const animatedStyle = useAnimatedStyle(() => {
    if (!progress || !animate) {
      return { opacity: 1 };
    }
    // progress.value moves 0..1; map it to translateX -1..+1 factor to move gradient
    const t = progress.value;
    // create interpolation point for gradient translate
    const translate = (t * 2 - 1) * 1; // normalized -1..1
    return {
      // we use 'translate' by percent mapping inside gradient style
      // We'll drive gradient start/end using transform scale/translate via Reanimated
      // For simplicity animate opacity slightly to give soft effect too
      opacity: 1,
      transform: [{ translateX: (t - 0.5) * 200 }], // coarse move, container clip will hide overflow
    };
  }, [progress, animate]);

  // gradient style wrapper
  const containerStyle: ViewStyle = {
    width,
    height,
    borderRadius,
    backgroundColor: baseColor,
    overflow: "hidden",
  };

  return (
    <View style={[containerStyle, style]} testID={testID}>
      {progress && animate ? (
        <AnimatedLinear
          colors={[baseColor, highlightColor, baseColor]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[{ flex: 1, width: shimmerWidth * 3 }, animatedStyle as any]}
          locations={[0.15, 0.5, 0.85]}
        />
      ) : (
        // static fill (no gradient) for reduced motion or animate=false
        <View style={{ flex: 1, backgroundColor: baseColor }} />
      )}
    </View>
  );
};

Shimmer.Box = (props: any) => <Shimmer {...props} />;

export default Shimmer;


// Notes / Implementation details

// Shimmer uses useGlobalShimmer() if available; otherwise it still supports sharedProgress prop.

// The gradient width is larger than container and moved using an animated style. This is simple and performant because the animation uses a single shared progress and Reanimated on UI thread.

// If animate false or no progress provided, it renders a static base color (cheap).