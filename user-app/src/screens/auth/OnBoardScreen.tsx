
// import React, { useCallback, useEffect, useRef, useState } from 'react';
// import {
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   FlatList,
//   Platform,
//   StyleSheet,
//   useWindowDimensions,
//   SafeAreaView,
//   ListRenderItemInfo,
// } from 'react-native';
// import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
// import Animated, {
//   useSharedValue,
//   useAnimatedScrollHandler,
//   useAnimatedStyle,
//   withTiming,
// } from 'react-native-reanimated';
// import theme from '@/src/assets/colors/theme';
// import { hp, wp } from '@/src/assets/utils/responsive';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// // ---------------------- constants ----------------------
// const PRIMARY_COLOR = '#562E19';


// type Slide = {
//   id: string;
//   title: string;
//   description: string;
//   image: any;
// };

// const slides: Slide[] = [
//   {
//     id: '1',
//     title: 'Nearby Vendors',
//     description:
//       'View Menus from vendors within 1KM around your location. Discover new flavors nearby.',
//     image: require('../../assets/images/onBoard1.png'),
//   },
//   {
//     id: '2',
//     title: 'No More Calls!',
//     description:
//       'Order Tea/Coffee Seamlessly without any phone calls. Browse, select, and order with just a few taps.',
//     image: require('../../assets/images/onBoard2.png'),
//   },
//   {
//     id: '3',
//     title: 'Track Your Order',
//     description:
//       'Real-Time Delivery Tracking so you know exactly when your order will arrive.',
//     image: require('../../assets/images/onBoard3.png'),
//   },
// ];

// // ---------------------- component ----------------------
// const OnBoardScreen = () => {
//   const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
//   const { width, height } = useWindowDimensions();

//   const [currentIndex, setCurrentIndex] = useState<number>(0);
//   const flatListRef = useRef<FlatList<Slide> | null>(null);
//   const lastPressRef = useRef<number>(0);

//   // Reanimated shared values
//   const scrollX = useSharedValue(0);
//   const progress = useSharedValue(((0 + 1) / slides.length) * 100);

//   const scrollHandler = useAnimatedScrollHandler({
//     onScroll: (event) => {
//       const x = event.contentOffset.x;
//       scrollX.value = x;
//       const pageFraction = x / width;
//       const percent = ((pageFraction + 1) / slides.length) * 100;
//       progress.value = withTiming(percent, { duration: 80 });
//     },
//   });

//   const animatedProgressStyle = useAnimatedStyle(() => ({
//     width: `${progress.value}%`,
//   }));

//   const onViewRef = useRef(
//     ({ viewableItems }: { viewableItems: Array<{ index?: number }> }) => {
//       if (viewableItems && viewableItems.length > 0) {
//         const idx = viewableItems[0].index ?? 0;
//         setCurrentIndex(idx);
//       }
//     },
//   );
//   const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

//   const handleNext = useCallback(() => {
//     const now = Date.now();
//     if (now - lastPressRef.current < 400) return;
//     lastPressRef.current = now;

//     if (currentIndex < slides.length - 1) {
//       const nextIndex = currentIndex + 1;
//       flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
//       setCurrentIndex(nextIndex);
//     } else {
//       navigation.navigate('signInScreen');
//     }
//   }, [currentIndex, navigation]);

//   useEffect(() => {
//     const percent = ((currentIndex + 1) / slides.length) * 100;
//     progress.value = withTiming(percent, { duration: 200 });
//   }, [currentIndex, progress]);

//   const getItemLayout = useCallback(
//     (_: Slide[] | null | undefined, index: number) => ({
//       length: width,
//       offset: width * index,
//       index,
//     }),
//     [width],
//   );

//   const styles = makeStyles(width, height);

//   const renderItem = useCallback(
//     ({ item }: ListRenderItemInfo<Slide>) => {
//       const imageSize = Math.min(width * 0.72, 420);
//       return (
//         <View style={[styles.slide, { width }]}>
//           <View style={styles.imageContainer}>
//             <Image
//               source={item.image}
//               style={[styles.image, { width: imageSize, height: imageSize }]}
//               resizeMode="contain"
//             />
//           </View>

//           <View style={styles.textContainer}>
//             <Text style={styles.title}>{item.title}</Text>
//             <Text style={styles.description}>{item.description}</Text>
//           </View>
//         </View>
//       );
//     },
//     [styles, width],
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <Animated.FlatList
//         data={slides} 
//         keyExtractor={(item: Slide) => item.id}
//         horizontal
//         pagingEnabled
//         showsHorizontalScrollIndicator={false}
//         ref={flatListRef}
//         renderItem={renderItem}
//         onScroll={scrollHandler}
//         scrollEventThrottle={16}
//         // onViewableItemsChanged={onViewRef.current}
//         viewabilityConfig={viewConfigRef.current}
//         initialNumToRender={1}
//         maxToRenderPerBatch={2}
//         windowSize={3}
//         removeClippedSubviews={Platform.OS === 'android'}
//         // getItemLayout={getItemLayout}
//       />

//       <View style={[styles.progressBar, { width: Math.min(width * 0.72, 100) }]}>
//         <Animated.View style={[styles.progressFill, animatedProgressStyle]} />
//       </View>

//       <View style={styles.buttonWrapper}>
//         <TouchableOpacity
//           accessibilityRole="button"
//           accessibilityLabel={
//             currentIndex === slides.length - 1 ? 'Get Started' : 'Next'
//           }
//           activeOpacity={0.8}
//           style={styles.button}
//           onPress={handleNext}
//         >
//           <Text style={styles.buttonText}>
//             {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default OnBoardScreen;

// // ---------------------- styles ----------------------
// function makeStyles(screenWidth: number, screenHeight: number) {
//   return StyleSheet.create({
//     container: {
//       flex: 1,
//       backgroundColor: '#fff',
//       justifyContent: 'center',
//     },
//     slide: {
//       flex: 1,
//       justifyContent: 'space-between',
//       paddingVertical: hp(3),
//     },
//     imageContainer: {
//       flex: 0.62,
//       justifyContent: 'center',
//       alignItems: 'center',
//     },
//     image: {},
//     textContainer: {
//       flex: 0.3,
//       paddingHorizontal: wp(6.8),
//     },
//     title: {
//       fontSize: hp(2.6),
//       fontWeight: '700',
//       color: PRIMARY_COLOR,
//       marginBottom: hp(1),
//     },
//     description: {
//       fontSize: hp(1.9),
//       color: '#444',
//       lineHeight: hp(2.6),
//     },
//     progressBar: {
//       height: 6,
//       backgroundColor: '#eee',
//       borderRadius: 12,
//       overflow: 'hidden',
//       alignSelf: 'flex-start',
//       marginVertical: hp(1.8),
//       marginLeft:wp(6)
//     },
//     progressFill: {
//       height: '100%',
//       backgroundColor: PRIMARY_COLOR,
//       borderRadius: 12,
//     },
//     buttonWrapper: {
//       paddingHorizontal: wp(5),
//       marginBottom: hp(2.6),
//     },
//     button: {
//       backgroundColor: PRIMARY_COLOR,
//       paddingVertical: hp(1.6),
//       borderRadius: theme?.COMMON_BORDER_RADIUS ?? 12,
//     },
//     buttonText: {
//       color: '#fff',
//       textAlign: 'center',
//       fontWeight: '600',
//       fontSize: hp(2),
//     },
//   });
// }


// // OnBoardScreen.tsx
// // import React, { useState, useRef, useEffect } from "react";
// // import {
// //   View,
// //   Text,
// //   FlatList,
// //   TouchableOpacity,
// //   StyleSheet,
// //   Image,
// // } from "react-native";
// // import { useNavigation } from "@react-navigation/native";
// // import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";

// // const slides = [
// //   { id: "1", title: "Welcome", description: "Intro 1", image: require('../../assets/images/onBoard1.png') },
// //   { id: "2", title: "Discover", description: "Intro 2", image: require('../../assets/images/onBoard1.png') },
// //   { id: "3", title: "Start", description: "Intro 3", image: require('../../assets/images/onBoard1.png') },
// // ];

// // const OnBoardScreen = () => {
// //   const [currentIndex, setCurrentIndex] = useState(0);
// //   const flatListRef = useRef<FlatList>(null);
// //   const progress = useSharedValue(0);
// //   const navigation = useNavigation();

// //   const handleNext = () => {
// //     if (currentIndex < slides.length - 1) {
// //       const nextIndex = currentIndex + 1;
// //       flatListRef.current?.scrollToIndex({ index: nextIndex });
// //       setCurrentIndex(nextIndex);
// //     } else {
// //       navigation.navigate("locationScreen"); // Navigate to Location
// //     }
// //   };

// //   useEffect(() => {
// //     const progressPercent = ((currentIndex + 1) / slides.length) * 100;
// //     progress.value = withTiming(progressPercent, { duration: 300 });
// //   }, [currentIndex]);

// //   const animatedProgress = useAnimatedStyle(() => ({
// //     width: `${progress.value}%`,
// //   }));

// //   const renderItem = ({ item }: any) => (
// //     <View style={styles.slide}>
// //       <View style={styles.imageContainer}>
// //         <Image source={item.image} style={styles.image} resizeMode="contain" />
// //       </View>
// //       <View style={styles.textContainer}>
// //         <Text style={styles.title}>{item.title}</Text>
// //         <Text style={styles.description}>{item.description}</Text>
// //       </View>
// //     </View>
// //   );

// //   return (
// //     <View style={styles.container}>
// //       <FlatList
// //         data={slides}
// //         renderItem={renderItem}
// //         keyExtractor={(item) => item.id}
// //         horizontal
// //         pagingEnabled
// //         showsHorizontalScrollIndicator={false}
// //         scrollEnabled={false}
// //         ref={flatListRef}
// //       />
// //       <View style={styles.progressBar}>
// //         <Animated.View style={[styles.progressFill, animatedProgress]} />
// //       </View>
// //       <TouchableOpacity style={styles.button} onPress={handleNext}>
// //         <Text style={styles.buttonText}>
// //           {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
// //         </Text>
// //       </TouchableOpacity>
// //     </View>
// //   );
// // };

// // export default OnBoardScreen;

// // const styles = StyleSheet.create({
// //   container: { flex: 1, backgroundColor: "#fff", padding: 20 },
// //   slide: { flex: 1, alignItems: "center", justifyContent: "center" },
// //   imageContainer: { flex: 3, justifyContent: "center" },
// //   image: { width: 300, height: 300 },
// //   textContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
// //   title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
// //   description: { fontSize: 16, textAlign: "center", color: "#555" },
// //   progressBar: { height: 5, backgroundColor: "#ddd", borderRadius: 2.5, marginVertical: 20 },
// //   progressFill: { height: 5, backgroundColor: "#007AFF", borderRadius: 2.5 },
// //   button: { backgroundColor: "#007AFF", padding: 15, borderRadius: 10, alignItems: "center" },
// //   buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
// // });

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  FlatList,
  Platform,
  StyleSheet,
  useWindowDimensions,
  SafeAreaView,
  ListRenderItemInfo,
  AccessibilityRole,
  ImageSourcePropType,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, ParamListBase } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

// IMPORTANT: import the SharedValue type separately (fixes your TS error)
import type { SharedValue } from 'react-native-reanimated';

import theme from '@/src/assets/colors/theme';
import { hp, wp } from '@/src/assets/utils/responsive';

type Slide = {
  id: string;
  title: string;
  description: string;
  image: ImageSourcePropType;
};

const PRIMARY_COLOR = '#562E19';

const slides: Slide[] = [
  {
    id: '1',
    title: 'Nearby Vendors',
    description:
      'View Menus from vendors within 1KM around your location. Discover new flavors nearby.',
    image: require('../../assets/images/onBoard1.png'),
  },
  {
    id: '2',
    title: 'No More Calls!',
    description:
      'Order Tea/Coffee Seamlessly without any phone calls. Browse, select, and order with just a few taps.',
    image: require('../../assets/images/onBoard2.png'),
  },
  {
    id: '3',
    title: 'Track Your Order',
    description:
      'Real-Time Delivery Tracking so you know exactly when your order will arrive.',
    image: require('../../assets/images/onBoard3.png'),
  },
];

/* ------------------ SlideItem (animated) ------------------ */
const SlideItem: React.FC<{
  item: Slide;
  idx: number;
  width: number;
  // use the imported SharedValue type here (NOT Animated.SharedValue)
  scrollX: SharedValue<number>;
}> = ({ item, idx, width, scrollX }) => {
  const inputRange = [(idx - 1) * width, idx * width, (idx + 1) * width];

  const imageStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollX.value, inputRange, [0.85, 1, 0.85], Extrapolate.CLAMP);
    const translateY = interpolate(scrollX.value, inputRange, [40, 0, -40], Extrapolate.CLAMP);
    return { transform: [{ translateY }, { scale }] };
  });

  const titleStyle = useAnimatedStyle(() => {
    const translateX = interpolate(scrollX.value, inputRange, [40, 0, -40], Extrapolate.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolate.CLAMP);
    return { transform: [{ translateX }], opacity };
  });

  const descStyle = useAnimatedStyle(() => {
    const translateX = interpolate(scrollX.value, inputRange, [60, 0, -60], Extrapolate.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolate.CLAMP);
    return { transform: [{ translateX }], opacity };
  });

  const imageSize = Math.min(width * 0.72, 520);

  return (
    <View style={[styles.slide, { width }]}>
      <View style={styles.topRow} pointerEvents="none" />

      <View style={styles.imageContainer}>
        <Animated.View style={[imageStyle]}>
          <Image
            source={item.image}
            style={[styles.image, { width: imageSize, height: imageSize }]}
            resizeMode="contain"
            accessible
            accessibilityLabel={item.title}
          />
        </Animated.View>
      </View>

      <View style={styles.textContainer}>
        <Animated.View style={[titleStyle]}>
          <Text style={styles.title} allowFontScaling>{item.title}</Text>
        </Animated.View>

        <Animated.View style={[descStyle]}>
          <Text style={styles.description} allowFontScaling>{item.description}</Text>
        </Animated.View>
      </View>
    </View>
  );
};

/* ------------------ Main Screen ------------------ */
const OnBoardScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase, string>>();
  const { width } = useWindowDimensions();

  const [index, setIndex] = useState<number>(0);
  const flatListRef = useRef<FlatList<Slide> | null>(null);
  const lastPressRef = useRef<number>(0);

  // reanimated shared values
  const scrollX = useSharedValue(0);
  const progress = useSharedValue(((0 + 1) / slides.length) * 100);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      const x = e.contentOffset.x;
      scrollX.value = x;
      const pageFraction = x / width;
      progress.value = withTiming(((pageFraction + 1) / slides.length) * 100, { duration: 60 });
    },
  });

  const animatedProgressStyle = useAnimatedStyle(() => ({ width: `${progress.value}%` }));

  const onMomentumScrollEnd = useCallback(
    (ev: { nativeEvent: { contentOffset: { x: number } } }) => {
      const x = ev.nativeEvent.contentOffset.x;
      const page = Math.round(x / width);
      setIndex(page);
    },
    [width],
  );

  const finishOnboarding = useCallback(() => {
    // TODO: persist "hasSeenOnboard" in AsyncStorage or your state store
    navigation.navigate('signInScreen');
  }, [navigation]);

  const handleNext = useCallback(() => {
    const now = Date.now();
    if (now - lastPressRef.current < 350) return;
    lastPressRef.current = now;

    if (index < slides.length - 1) {
      const next = index + 1;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
    } else {
      finishOnboarding();
    }
  }, [index, finishOnboarding]);

  const handleSkip = useCallback(() => {
    const last = slides.length - 1;
    flatListRef.current?.scrollToIndex({ index: last, animated: true });
  }, []);

  const getItemLayout = useCallback(
    (_: Slide[] | null | undefined, i: number) => ({ length: width, offset: width * i, index: i }),
    [width],
  );

  const Dots = useMemo(() => (
    <View
      style={styles.dotsRow}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={`Slide ${index + 1} of ${slides.length}`}
    >
      {slides.map((s, i) => {
        const isActive = i === index;
        return <View key={s.id} style={[styles.dot, isActive ? styles.dotActive : undefined]} />;
      })}
    </View>
  ), [index]);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(i) => i.id}
        horizontal
        pagingEnabled
        snapToInterval={width}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index: idx }: ListRenderItemInfo<Slide>) => (
          <SlideItem item={item} idx={idx} width={width} scrollX={scrollX} />
        )}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onMomentumScrollEnd}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={3}
        removeClippedSubviews={Platform.OS === 'android'}
        getItemLayout={getItemLayout}
        accessibilityRole={'adjustable' as AccessibilityRole}
      />

      <View style={styles.controls}>
        <View style={styles.topControlsRow}>
          <Pressable
            onPress={handleSkip}
            accessibilityRole={'button' as AccessibilityRole}
            accessibilityLabel="Skip to last"
            style={styles.skipContainer}
          >
            <Text style={styles.skipText} allowFontScaling>Skip</Text>
          </Pressable>
        </View>

        <View style={styles.progressBarWrapper}>
          <View style={styles.progressBarTrack}>
            <Animated.View style={[styles.progressFill, animatedProgressStyle]} />
          </View>
          {Dots}
        </View>

        <Pressable
          onPress={handleNext}
          accessibilityRole={'button' as AccessibilityRole}
          accessibilityLabel={index === slides.length - 1 ? 'Get started' : 'Next'}
          android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
          style={({ pressed }) => [styles.cta, pressed ? styles.ctaPressed : undefined]}
        >
          <Text style={styles.ctaText} allowFontScaling>{index === slides.length - 1 ? 'Get Started' : 'Next'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default OnBoardScreen;

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center' },
  slide: { flex: 1, justifyContent: 'flex-start', paddingVertical: hp(2.4) },
  topRow: { height: hp(6), justifyContent: 'center', alignItems: 'flex-end', paddingHorizontal: wp(5) },
  topControlsRow: { position: 'absolute', right: wp(4), top: hp(2.2) },
  skipContainer: { padding: hp(0.6), borderRadius: 8, },
  skipText: { color: '#666', fontSize: hp(1.8) ,},
  imageContainer: { flex: 0.6, justifyContent: 'center', alignItems: 'center' },
  image: {},
  textContainer: { flex: 0.34, paddingHorizontal: wp(6.4), justifyContent: 'center' },
  title: { fontSize: hp(2.8), fontWeight: '700', color: PRIMARY_COLOR, marginBottom: hp(0.9) },
  description: { fontSize: hp(1.9), color: '#444', lineHeight: hp(2.8) },
  controls: { position: 'absolute', left: 0, right: 0, bottom: hp(2.4), paddingHorizontal: wp(5) },
  progressBarWrapper: { marginBottom: hp(1.2) },
  progressBarTrack: { height: 6, backgroundColor: '#eee', borderRadius: 12, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: PRIMARY_COLOR, borderRadius: 12 },
  dotsRow: { flexDirection: 'row', marginTop: hp(1), alignItems: 'center', justifyContent: 'center' },
  dot: { width: wp(2.4), height: wp(2.4), borderRadius: wp(1.2), backgroundColor: '#ddd', marginRight: wp(2) },
  dotActive: { backgroundColor: PRIMARY_COLOR, width: wp(4.2), height: wp(2.8), borderRadius: wp(1.4) },
  cta: { marginTop: hp(0.6), backgroundColor: PRIMARY_COLOR, paddingVertical: hp(1.6), borderRadius: theme?.COMMON_BORDER_RADIUS ?? 12, alignItems: 'center', justifyContent: 'center' },
  ctaPressed: { opacity: 0.9 },
  ctaText: { color: '#fff', fontSize: hp(2), fontWeight: '600' },
});
