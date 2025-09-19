import React, { useRef } from "react";
import { View, Image, StyleSheet, Dimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import Animated, {
  interpolate,
  useAnimatedStyle,
  Extrapolate,
  useSharedValue,
} from "react-native-reanimated";
import { hp } from "../assets/utils/responsive";

const { width } = Dimensions.get("window");

const CarouselBanner = ({ data }: { data: any[] }) => {
  // shared value from Reanimated
  const progressValue = useSharedValue(0);

  return (
    <View style={styles.container}>
      <Carousel
        loop
        width={width}
        height={hp(18)}
        autoPlay
        autoPlayInterval={2500}
        data={data}
        scrollAnimationDuration={900}
        onProgressChange={(_, absoluteProgress) => {
          // Carousel passes absolute progress (float) → save to shared value
          progressValue.value = absoluteProgress;
        }}
        renderItem={({ item }) => (
          <Image source={item.image} style={styles.bannerImage} />
        )}
      />

      {/* Smooth Interpolated Pagination */}
      <View style={styles.pagination}>
        {data.map((_, index) => {
          const animatedDotStyle = useAnimatedStyle(() => {
            const scale = interpolate(
              progressValue.value,
              [index - 1, index, index + 1],
              [0.8, 1.6, 0.8],
              Extrapolate.CLAMP
            );

            const opacity = interpolate(
              progressValue.value,
              [index - 1, index, index + 1],
              [0.4, 1, 0.4],
              Extrapolate.CLAMP
            );

            return {
              transform: [{ scale }],
              opacity,
              backgroundColor: "#333",
            };
          });

          return (
            <Animated.View
              key={index}
              style={[styles.dot, animatedDotStyle]}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  bannerImage: {
    width: width - 40,
    height: hp(18),
    borderRadius: 12,
    marginHorizontal: 20,
    resizeMode: "cover",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
});

export default CarouselBanner;
