import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Animated,
  StyleSheet,
  Easing,
  ViewStyle,
  LayoutChangeEvent,
} from "react-native";

type Props = {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  baseColor?: string;
  highlightColor?: string;
  highlightWidth?: number; // px (approx)
  duration?: number; // ms
  tilt?: number; // degrees for diagonal tilt
  style?: ViewStyle;
  testID?: string;
};

const ShimmerDiagonal: React.FC<Props> = ({
  width = "100%",
  height = 120,
  borderRadius = 8,
  baseColor = "#EAEAEA",
  highlightColor = "rgba(255,255,255,0.75)",
  highlightWidth = 160,
  duration = 900,
  tilt = 20,
  style,
  testID,
}) => {
  const progress = useRef(new Animated.Value(0)).current;
  const [containerW, setContainerW] = useState<number>(0);

  useEffect(() => {
    // loop animation 0 -> 1
    const anim = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    progress.setValue(0);
    anim.start();
    return () => anim.stop();
  }, [progress, duration]);

  // map progress (0..1) to translateX in pixels (-full..+full)
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-containerW - highlightWidth, containerW + highlightWidth],
  });

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w && w !== containerW) setContainerW(w);
  };

  return (
    <View
      testID={testID}
      onLayout={onLayout}
      style={[
        { width, height, borderRadius, backgroundColor: baseColor, overflow: "hidden" },
        style,
      ]}
    >
      {/** Static base is already shown as a background; moving highlight overlays it */}
      {/* highlight bar */}
      <Animated.View
        style={[
          {
            position: "absolute",
            left: -highlightWidth,
            top: -height * 0.5, // move top so rotation center looks right
            width: highlightWidth,
            height: height * 2, // make tall so diagonal covers the whole container
            transform: [
              { translateX },
              { rotate: `${tilt}deg` }, // diagonal tilt
            ],
            backgroundColor: highlightColor,
            opacity: 0.95,
            shadowColor: "#fff",
          },
        ]}
        pointerEvents="none"
      />
    </View>
  );
};

export default ShimmerDiagonal;
