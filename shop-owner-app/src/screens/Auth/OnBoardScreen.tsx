// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   ImageBackground,
// //   Pressable,
// //   Alert,
// // } from "react-native";
// // import React from "react";
// // import { SafeAreaView } from "react-native-safe-area-context";
// // import { hp, wp } from "@/src/assets/utils/responsive";
// // import theme from "@/src/assets/colors/theme";
// // import { ParamListBase, useNavigation } from "@react-navigation/native";
// // import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// // import AsyncStorage from "@react-native-async-storage/async-storage";

// // const OnBoardScreen = () => {
// //   const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
// //   const pressMe =async() =>{
// // const token = await AsyncStorage.getItem("authToken")
// //    if (!token) {
// //       Alert.alert("Login Required", "Please login to continue.",[
// //         {text:"Ok",onPress:()=>navigation.push("signInScreen")}
// //       ]);
// //       return;
// //     }
// //         navigation.navigate('enterShopDetailScreen')
// //   }
// //   return (
// //     <SafeAreaView style={styles.container}>
// //       <ImageBackground
// //         source={{
// //           uri: "https://i.pinimg.com/736x/57/e1/14/57e114f83e455f1c6d565fa6c6839963.jpg",
// //         }}
// //         style={{ height: "100%", width: "auto" }}
// //       >
// //         <Pressable style={styles.clickTeaBtn} onPress={()=>pressMe()}>
// //           <Text style={styles.clickTeaText}>ClickTea</Text>
// //         </Pressable>
// //       </ImageBackground>
// //     </SafeAreaView>
// //   );
// // };
// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     // backgroundColor:"white"
// //   },
// //   clickTeaBtn: {
// //     backgroundColor: theme.PRIMARY_COLOR,
// //     padding: hp(2.4),
// //     bottom: hp(9),
// //     position: "absolute",
// //     alignSelf: "center",
// //     borderRadius: theme.PRIMARY_BORDER_RADIUS,
// //     paddingHorizontal: wp(15),
// //   },
// //   clickTeaText: {
// //     fontSize: hp(2.4),
// //     color: "white",
// //     fontFamily: theme.PRIMARY_FONT_FAMILY,
// //     letterSpacing: 0.5,
// //   },
// // });
// // export default OnBoardScreen;
// import {
//   View,
//   Text,
//   StyleSheet,
//   ImageBackground,
//   Pressable,
//   Alert,
//   Platform,
//   Linking,
//   AppState,
//   ActivityIndicator,
// } from "react-native";
// import React, { useEffect, useState, useRef } from "react";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { hp, wp } from "@/src/assets/utils/responsive";
// import theme from "@/src/assets/colors/theme";
// import { ParamListBase, useNavigation } from "@react-navigation/native";
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as Location from "expo-location";
// import { fetchUserProfile } from "@/src/Redux/slice/profileSlice";
// import { store } from "@/src/Redux/store";

// const OnBoardScreen = () => {
//   const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
//   const [loading, setLoading] = useState(false);
//   const appState = useRef(AppState.currentState);

//   useEffect(() => {
//     const subscription = AppState.addEventListener("change", async nextAppState => {
//       if (
//         appState.current.match(/inactive|background/) &&
//         nextAppState === "active"
//       ) {
//         await checkLocationPermissionSilently();
//       }
//       appState.current = nextAppState;
//     });

//     return () => {
//       subscription.remove();
//     };
//   }, []);

//   const checkLocationPermissionSilently = async () => {
//     try {
//       const { status } = await Location.getForegroundPermissionsAsync();
//       if (status !== "granted") return;

//       const locationServicesEnabled = await Location.hasServicesEnabledAsync();
//       if (!locationServicesEnabled) return;

//       await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
//     } catch (e) {
//       console.log("Silent check failed:", e);
//     }
//   };

// // const pressMe = async () => {
// //   setLoading(true);
// //   await Location.requestForegroundPermissionsAsync(); // this use for saftey

// //   try {
// //     const { status } = await Location.getForegroundPermissionsAsync();

// //     if (status !== "granted") {
// //       setLoading(false);
// //       Alert.alert("Permission Required", "Please enable location permission.");
// //       return;
// //     }

// //     const locationServicesEnabled = await Location.hasServicesEnabledAsync();
// //     if (!locationServicesEnabled) {
// //       setLoading(false);
// //       Alert.alert("Enable Location", "Please enable location service.");
// //       return;
// //     }

// //     const location = await Location.getCurrentPositionAsync({
// //       accuracy: Location.Accuracy.Low,
// //       timeout: 2000,
// //     });

// //     await AsyncStorage.setItem("shop_lat", location.coords.latitude.toString());
// //     await AsyncStorage.setItem("shop_lng", location.coords.longitude.toString());

// //     const token = await AsyncStorage.getItem("authToken");
// //     if (!token) {
// //       setLoading(false);
// //       return navigation.replace("signInScreen");
// //     }

// //     const owner_id = await AsyncStorage.getItem("owner_id");
// // // console.log(owner_id,"owner");
// // const setupStep = await AsyncStorage.getItem("setupStep");
// // // console.log(setupStep);

// //     setLoading(false);
// // if (!owner_id) {
// //   return navigation.navigate("enterShopDetailScreen");
// // }

// // switch (setupStep) {
// //   case "shopCreated":
// //     return navigation.navigate("addCategoryScreen");
// //   case "categoryCreated":
// //     return navigation.navigate("addMenuScreen");
// //   case "complete":
// //     return navigation.reset({
// //       index: 0,
// //       routes: [{ name: "bottamTabScreen" }],
// //     });
// //   default:
// //     return navigation.navigate("enterShopDetailScreen");
// // }
// //   } catch (err) {
// //     console.log("pressMe error:", err);
// //     setLoading(false);
// //     Alert.alert("Error", "Something went wrong.");
// //   }
// // };
// // const pressMe = async () => {
// //   setLoading(true);
// //   await Location.requestForegroundPermissionsAsync();

// //   try {
// //     const { status } = await Location.getForegroundPermissionsAsync();

// //     if (status !== "granted") {
// //       setLoading(false);
// //       Alert.alert("Permission Required", "Please enable location permission.");
// //       return;
// //     }

// //     const locationServicesEnabled = await Location.hasServicesEnabledAsync();
// //     if (!locationServicesEnabled) {
// //       setLoading(false);
// //       Alert.alert("Enable Location", "Please enable location service.");
// //       return;
// //     }

// //     const location = await Location.getCurrentPositionAsync({
// //       accuracy: Location.Accuracy.Low,
// //       timeout: 2000,
// //     });

// //     await AsyncStorage.setItem("shop_lat", location.coords.latitude.toString());
// //     await AsyncStorage.setItem("shop_lng", location.coords.longitude.toString());

// //     const token = await AsyncStorage.getItem("authToken");
// //     if (!token) {
// //       setLoading(false);
// //       return navigation.replace("signInScreen");
// //     }

// //     setLoading(false);
// //     navigation.navigate("enterShopDetailScreen"); // Always go to shop detail after location
// //   } catch (err) {
// //     console.log("pressMe error:", err);
// //     setLoading(false);
// //     Alert.alert("Error", "Something went wrong.");
// //   }
// // };
// const pressMe = async () => {
//   setLoading(true);
//   await Location.requestForegroundPermissionsAsync();

//   try {
//     const { status } = await Location.getForegroundPermissionsAsync();
//     if (status !== "granted") {
//       setLoading(false);
//       Alert.alert("Permission Required", "Please enable location permission.");
//       return;
//     }

//     const locationServicesEnabled = await Location.hasServicesEnabledAsync();
//     if (!locationServicesEnabled) {
//       setLoading(false);
//       Alert.alert("Enable Location", "Please enable location service.");
//       return;
//     }

//     const location = await Location.getCurrentPositionAsync({
//       accuracy: Location.Accuracy.Low,
//       timeout: 2000,
//     });

//     await AsyncStorage.setItem("shop_lat", location.coords.latitude.toString());
//     await AsyncStorage.setItem("shop_lng", location.coords.longitude.toString());

//     const token = await AsyncStorage.getItem("authToken");
//     const shopId = await AsyncStorage.getItem("shop_id");

//     if (!token) {
//       setLoading(false);
//       return navigation.replace("signInScreen");
//     }

//     // Fetch user profile to get role
//     const profile = await store.dispatch(fetchUserProfile()).unwrap();
//     console.log("Profile:", profile);

//     if (profile.role === "shop_owner" && !shopId) {
//       setLoading(false);
//       return navigation.navigate("enterShopDetailScreen");
//     }

//     setLoading(false);
//     return navigation.reset({
//       index: 0,
//       routes: [{ name: "bottamTabScreen" }],
//     });
//   } catch (err) {
//     console.log("pressMe error:", err);
//     setLoading(false);
//     Alert.alert("Error", "Something went wrong.");
//   }
// };


//   return (
//     <SafeAreaView style={styles.container}>
//       <ImageBackground
//         source={{
//           uri: "https://i.pinimg.com/736x/57/e1/14/57e114f83e455f1c6d565fa6c6839963.jpg",
//         }}
//         style={{ height: "100%", width: "auto" }}
//       >
//         <Pressable
//           style={[
//             styles.clickTeaBtn,
//             loading && { opacity: 0.5 }, // dim if loading
//           ]}
//           onPress={pressMe}
//           disabled={loading}
//         >
//           <Text style={styles.clickTeaText}>ClickTea</Text>
//         </Pressable>

//         {loading && (
//           <View style={styles.loadingContainer}>
//             <View style={styles.loadingBox}>
//               <ActivityIndicator size="large" color="#fff" />
//               <Text style={styles.loadingText}>Checking location...</Text>
//             </View>
//           </View>
//         )}
//       </ImageBackground>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   clickTeaBtn: {
//     backgroundColor: theme.PRIMARY_COLOR,
//     padding: hp(2.4),
//     bottom: hp(9),
//     position: "absolute",
//     alignSelf: "center",
//     borderRadius: theme.PRIMARY_BORDER_RADIUS,
//     paddingHorizontal: wp(15),
//   },
//   clickTeaText: {
//     fontSize: hp(2.4),
//     color: "white",
//     fontFamily: theme.PRIMARY_FONT_FAMILY,
//     letterSpacing: 0.5,
//   },
//   loadingContainer: {
//     ...StyleSheet.absoluteFillObject,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0,0,0,0.4)",
//     zIndex: 10,
//   },
//   loadingBox: {
//     padding: hp(2),
//     backgroundColor: "#333",
//     borderRadius: 12,
//     alignItems: "center",
//   },
//   loadingText: {
//     marginTop: hp(1),
//     color: "#fff",
//     fontSize: hp(2),
//   },
// });

// // export default OnBoardScreen;
// import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// import {
//   View,
//   Text,
//   Image,
//   Pressable,
//   FlatList,
//   Platform,
//   StyleSheet,
//   useWindowDimensions,
//   ListRenderItemInfo,
//   AccessibilityRole,
//   ImageSourcePropType,
//   AppState,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { useNavigation, ParamListBase } from '@react-navigation/native';
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   useAnimatedScrollHandler,
//   withTiming,
//   interpolate,
//   Extrapolate,
// } from 'react-native-reanimated';
// import type { SharedValue } from 'react-native-reanimated';

// import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as Location from 'expo-location';

// import theme from '@/src/assets/colors/theme';
// import { hp, wp } from '@/src/assets/utils/responsive';
// import { fetchUserProfile } from '@/src/Redux/slice/profileSlice';
// import { store } from '@/src/Redux/store';
// import SafeAreaContainer from '@/src/components/SafeAreaContainer';

// type Slide = {
//   id: string;
//   title: string;
//   description: string;
//   image: ImageSourcePropType;
// };

// const PRIMARY_COLOR = theme?.PRIMARY_COLOR ?? '#562E19';

// const slides: Slide[] = [
//   {
//     id: '1',
//     title: 'Manage Your Store',
//     description:
//       'Keep track of your inventory, menu items, and daily operations all in one place.',
//     image: require('../../assets/images/OnBoard1.png'),
//   },
//   {
//     id: '2',
//     title: 'Track Your Performance',
//     description:
//       'Get detailed insights about your sales, popular items, and business growth with comprehensive reports.',
//     image: require('../../assets/images/OnBoard1.png'),
//   },
//   {
//     id: '3',
//     title: 'Connect with Customers',
//     description:
//       'Build lasting relationships with your customers and grow your business through better service.',
//     image: require('../../assets/images/OnBoard1.png'),
//   },
// ];

// /* ------------------ SlideItem (animated) ------------------ */
// const SlideItem: React.FC<{
//   item: Slide;
//   idx: number;
//   width: number;
//   scrollX: SharedValue<number>;
// }> = ({ item, idx, width, scrollX }) => {
//   const inputRange = [(idx - 1) * width, idx * width, (idx + 1) * width];

//   const imageStyle = useAnimatedStyle(() => {
//     const scale = interpolate(scrollX.value, inputRange, [0.85, 1, 0.85], Extrapolate.CLAMP);
//     const translateY = interpolate(scrollX.value, inputRange, [40, 0, -40], Extrapolate.CLAMP);
//     return { transform: [{ translateY }, { scale }] };
//   });

//   const titleStyle = useAnimatedStyle(() => {
//     const translateX = interpolate(scrollX.value, inputRange, [40, 0, -40], Extrapolate.CLAMP);
//     const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolate.CLAMP);
//     return { transform: [{ translateX }], opacity };
//   });

//   const descStyle = useAnimatedStyle(() => {
//     const translateX = interpolate(scrollX.value, inputRange, [60, 0, -60], Extrapolate.CLAMP);
//     const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolate.CLAMP);
//     return { transform: [{ translateX }], opacity };
//   });

//   const imageSize = Math.min(width * 0.72, 520);

//   return (
//     <View style={[styles.slide, { width }]}>
//       <View style={styles.topRow} pointerEvents="none" />

//       <View style={styles.imageContainer}>
//         <Animated.View style={[imageStyle]}>
//           <Image
//             source={item.image}
//             style={[styles.image, { width: imageSize, height: imageSize }]}
//             resizeMode="contain"
//             accessible
//             accessibilityLabel={item.title}
//           />
//         </Animated.View>
//       </View>

//       <View style={styles.textContainer}>
//         <Animated.View style={[titleStyle]}>
//           <Text style={styles.title} allowFontScaling>
//             {item.title}
//           </Text>
//         </Animated.View>

//         <Animated.View style={[descStyle]}>
//           <Text style={styles.description} allowFontScaling>
//             {item.description}
//           </Text>
//         </Animated.View>
//       </View>
//     </View>
//   );
// };

// /* ------------------ Vendor OnBoard Screen (merged) ------------------ */
// const OnBoardScreen: React.FC = () => {
//   const navigation = useNavigation<NativeStackNavigationProp<ParamListBase, string>>();
//   const { width } = useWindowDimensions();

//   const [index, setIndex] = useState<number>(0);
//   const [loading, setLoading] = useState(false);

//   const flatListRef = useRef<FlatList<Slide> | null>(null);
//   const lastPressRef = useRef<number>(0);
//   const appState = useRef(AppState.currentState);

//   // reanimated shared values
//   const scrollX = useSharedValue(0);
//   const progress = useSharedValue(((0 + 1) / slides.length) * 100);

//   useEffect(() => {
//     const subscription = AppState.addEventListener('change', async nextAppState => {
//       if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
//         // silent check when app comes to foreground
//         try {
//           const { status } = await Location.getForegroundPermissionsAsync();
//           if (status !== 'granted') return;
//           const locationServicesEnabled = await Location.hasServicesEnabledAsync();
//           if (!locationServicesEnabled) return;
//           await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
//         } catch (e) {
//           console.log('Silent location check failed:', e);
//         }
//       }
//       appState.current = nextAppState;
//     });

//     return () => {
//       subscription.remove();
//     };
//   }, []);

//   const scrollHandler = useAnimatedScrollHandler({
//     onScroll: e => {
//       const x = e.contentOffset.x;
//       scrollX.value = x;
//       const pageFraction = x / width;
//       progress.value = withTiming(((pageFraction + 1) / slides.length) * 100, { duration: 60 });
//     },
//   });

//   const animatedProgressStyle = useAnimatedStyle(() => ({ width: `${progress.value}%` }));

//   const onMomentumScrollEnd = useCallback(
//     (ev: { nativeEvent: { contentOffset: { x: number } } }) => {
//       const x = ev.nativeEvent.contentOffset.x;
//       const page = Math.round(x / width);
//       setIndex(page);
//     },
//     [width],
//   );

//   // Press handler (retains vendor flow: location -> save coords -> check token/profile -> navigate)
//   const pressMe = useCallback(async () => {
//     setLoading(true);
//     await Location.requestForegroundPermissionsAsync();

//     try {
//       const { status } = await Location.getForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         setLoading(false);
//         Alert.alert('Permission Required', 'Please enable location permission.');
//         return;
//       }

//       const locationServicesEnabled = await Location.hasServicesEnabledAsync();
//       if (!locationServicesEnabled) {
//         setLoading(false);
//         Alert.alert('Enable Location', 'Please enable location service.');
//         return;
//       }

//       const location = await Location.getCurrentPositionAsync({
//         accuracy: Location.Accuracy.Low,
//         timeout: 2000,
//       });

//       await AsyncStorage.setItem('shop_lat', location.coords.latitude.toString());
//       await AsyncStorage.setItem('shop_lng', location.coords.longitude.toString());

//       const token = await AsyncStorage.getItem('authToken');
//       const shopId = await AsyncStorage.getItem('shop_id');

//       if (!token) {
//         setLoading(false);
//         return navigation.replace('signInScreen');
//       }

//       // Fetch user profile (keeps vendor's logic)
//       try {
//         const profile = await store.dispatch(fetchUserProfile()).unwrap();
//         console.log('Profile:', profile);

//         if (profile.role === 'shop_owner' && !shopId) {
//           setLoading(false);
//           return navigation.navigate('enterShopDetailScreen');
//         }

//         setLoading(false);
//         return navigation.reset({
//           index: 0,
//           routes: [{ name: 'bottamTabScreen' }],
//         });
//       } catch (err) {
//         // In case profile fetch fails, fallback to safe route
//         console.log('Profile fetch error:', err);
//         setLoading(false);
//         return navigation.replace('signInScreen');
//       }
//     } catch (err) {
//       console.log('pressMe error:', err);
//       setLoading(false);
//       Alert.alert('Error', 'Something went wrong.');
//     }
//   }, [navigation]);

//   const handleNext = useCallback(() => {
//     const now = Date.now();
//     if (now - lastPressRef.current < 350) return;
//     lastPressRef.current = now;

//     if (index < slides.length - 1) {
//       const next = index + 1;
//       flatListRef.current?.scrollToIndex({ index: next, animated: true });
//     } else {
//       // final slide -> execute vendor press flow
//       void pressMe();
//     }
//   }, [index, pressMe]);

//   const handleSkip = useCallback(() => {
//     const last = slides.length - 1;
//     flatListRef.current?.scrollToIndex({ index: last, animated: true });
//   }, []);

//   const getItemLayout = useCallback(
//     (_: Slide[] | null | undefined, i: number) => ({ length: width, offset: width * i, index: i }),
//     [width],
//   );

//   const Dots = useMemo(
//     () => (
//       <View
//         style={styles.dotsRow}
//         accessible
//         accessibilityRole="adjustable"
//         accessibilityLabel={`Slide ${index + 1} of ${slides.length}`}
//       >
//         {slides.map((s, i) => {
//           const isActive = i === index;
//           return <View key={s.id} style={[styles.dot, isActive ? styles.dotActive : undefined]} />;
//         })}
//       </View>
//     ),
//     [index],
//   );

//   return (
//     <SafeAreaContainer>
//       <Animated.FlatList
//         ref={flatListRef}
//         data={slides}
//         keyExtractor={i => i.id}
//         horizontal
//         pagingEnabled
//         snapToInterval={width}
//         decelerationRate="fast"
//         showsHorizontalScrollIndicator={false}
//         renderItem={({ item, index: idx }: ListRenderItemInfo<Slide>) => (
//           <SlideItem item={item} idx={idx} width={width} scrollX={scrollX} />
//         )}
//         onScroll={scrollHandler}
//         scrollEventThrottle={16}
//         onMomentumScrollEnd={onMomentumScrollEnd}
//         initialNumToRender={1}
//         maxToRenderPerBatch={2}
//         windowSize={3}
//         removeClippedSubviews={Platform.OS === 'android'}
//         getItemLayout={getItemLayout}
//         accessibilityRole={'adjustable' as AccessibilityRole}
//       />

//       <View style={styles.controls}>
//         <View style={styles.topControlsRow}>
//           <Pressable
//             onPress={handleSkip}
//             accessibilityRole={'button' as AccessibilityRole}
//             accessibilityLabel="Skip to last"
//             style={styles.skipContainer}
//           >
//             <Text style={styles.skipText} allowFontScaling>
//               Skip
//             </Text>
//           </Pressable>
//         </View>

//         <View style={styles.progressBarWrapper}>
//           <View style={styles.progressBarTrack}>
//             <Animated.View style={[styles.progressFill, animatedProgressStyle]} />
//           </View>
//           {Dots}
//         </View>

//         <Pressable
//           onPress={handleNext}
//           accessibilityRole={'button' as AccessibilityRole}
//           accessibilityLabel={index === slides.length - 1 ? 'Get started' : 'Next'}
//           android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
//           style={({ pressed }) => [styles.cta, pressed ? styles.ctaPressed : undefined]}
//         >
//           <Text style={styles.ctaText} allowFontScaling>
//             {index === slides.length - 1 ? 'Get Started' : 'Next'}
//           </Text>
//         </Pressable>
//       </View>

//       {/* Loading overlay (vendor logic) */}
//       {loading && (
//         <View style={styles.loadingContainer}>
//           <View style={styles.loadingBox}>
//             <ActivityIndicator size="large" color="#fff" />
//             <Text style={styles.loadingText}>Checking location...</Text>
//           </View>
//         </View>
//       )}
//     </SafeAreaContainer>
//   );
// };

// export default OnBoardScreen;

// /* ---------------- STYLES ---------------- */
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center' },
//   slide: { flex: 1, justifyContent: 'flex-start', paddingVertical: hp(2.4) },
//   topRow: { height: hp(6), justifyContent: 'center', alignItems: 'flex-end', paddingHorizontal: wp(5) },
//   topControlsRow: { position: 'absolute', right: wp(4), top: hp(2.2) },
//   skipContainer: { padding: hp(0.6), borderRadius: 8 },
//   skipText: { color: '#666', fontSize: hp(1.8) },
//   imageContainer: { flex: 0.6, justifyContent: 'center', alignItems: 'center' },
//   image: {},
//   textContainer: { flex: 0.34, paddingHorizontal: wp(6.4), justifyContent: 'center' },
//   title: { fontSize: hp(2.8), fontWeight: '700', color: PRIMARY_COLOR, marginBottom: hp(0.9) },
//   description: { fontSize: hp(1.9), color: '#444', lineHeight: hp(2.8) },
//   controls: { position: 'absolute', left: 0, right: 0, bottom: hp(2.4), paddingHorizontal: wp(5) },
//   progressBarWrapper: { marginBottom: hp(1.2) },
//   progressBarTrack: { height: 6, backgroundColor: '#eee', borderRadius: 12, overflow: 'hidden' },
//   progressFill: { height: '100%', backgroundColor: PRIMARY_COLOR, borderRadius: 12 },
//   dotsRow: { flexDirection: 'row', marginTop: hp(1), alignItems: 'center', justifyContent: 'center' },
//   dot: { width: wp(2.4), height: wp(2.4), borderRadius: wp(1.2), backgroundColor: '#ddd', marginRight: wp(2) },
//   dotActive: { backgroundColor: PRIMARY_COLOR, width: wp(4.2), height: wp(2.8), borderRadius: wp(1.4) },
//   cta: {
//     marginTop: hp(0.6),
//     backgroundColor: PRIMARY_COLOR,
//     paddingVertical: hp(1.6),
//     borderRadius: theme?.COMMON_BORDER_RADIUS ?? 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   ctaPressed: { opacity: 0.9 },
//   ctaText: { color: '#fff', fontSize: hp(2), fontWeight: '600' },

//   /* loading overlay */
//   loadingContainer: {
//     ...StyleSheet.absoluteFillObject,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.4)',
//     zIndex: 10,
//   },
//   loadingBox: {
//     padding: hp(2),
//     backgroundColor: '#333',
//     borderRadius: 12,
//     alignItems: 'center',
//   },
//   loadingText: {
//     marginTop: hp(1),
//     color: '#fff',
//     fontSize: hp(2),
//   },
// });
/* OnBoardScreen.tsx — production-ready version
   - Assumes these exist in your project:
     * AuthContext (useAuth)
     * Redux store with fetchUserProfile, setUser (authSlice), setLocation (locationSlice)
     * axiosClient helper setAuthTokens/clearAuthTokens
     * SafeAreaContainer component
*/
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  FlatList,
  Platform,
  StyleSheet,
  useWindowDimensions,
  ListRenderItemInfo,
  AccessibilityRole,
  ImageSourcePropType,
  AppState,
  ActivityIndicator,
  Alert,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation, ParamListBase } from "@react-navigation/native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withTiming,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";

import { useDispatch } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

import theme from "@/src/assets/colors/theme";
import { hp, wp } from "@/src/assets/utils/responsive";
import { fetchUserProfile } from "@/src/Redux/slice/profileSlice";
import { setUser } from "@/src/Redux/slice/authSlice"; // update path if needed
import { setLocation } from "@/src/Redux/slice/locationSlice"; // update path if needed
import { store } from "@/src/Redux/store";
import { useAuth } from "@/src/context/authContext";
import { setAuthTokens } from "@/src/assets/api/client"; // ensure path is correct
import SafeAreaContainer from "@/src/components/SafeAreaContainer";

// ---- Types ----
type Slide = {
  id: string;
  title: string;
  description: string;
  image: ImageSourcePropType;
};

const PRIMARY_COLOR = theme?.PRIMARY_COLOR ?? "#562E19";

const slides: Slide[] = [
  // swap these images & copy with vendor assets as needed
  {
    id: "1",
    title: "Manage Your Store",
    description: "Keep track of inventory, menus and daily operations in one place.",
    image: require("../../assets/images/OnBoard1.png"),
  },
  {
    id: "2",
    title: "Track Performance",
    description: "Get sales insights, most popular items and growth metrics.",
    image: require("../../assets/images/OnBoard1.png"),
  },
  {
    id: "3",
    title: "Connect with Customers",
    description: "Engage customers & grow repeat business with ease.",
    image: require("../../assets/images/OnBoard1.png"),
  },
];

/* ------------------ SlideItem (animated) ------------------ */
const SlideItem: React.FC<{
  item: Slide;
  idx: number;
  width: number;
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
          <Text style={styles.title} allowFontScaling>
            {item.title}
          </Text>
        </Animated.View>

        <Animated.View style={[descStyle]}>
          <Text style={styles.description} allowFontScaling>
            {item.description}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
};

/* ------------------ Vendor OnBoard Screen (production-ready) ------------------ */
const OnBoardScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase, string>>();
  const { width } = useWindowDimensions();

  const dispatch = useDispatch();
  const auth = useAuth(); // token, signIn, signOut, shopId etc.

  const [index, setIndex] = useState<number>(0);
  const [loadingState, setLoadingState] = useState<
    | "idle"
    | "request_permission"
    | "getting_location"
    | "persisting_location"
    | "fetching_profile"
    | "done"
    | "error"
  >("idle");

  const flatListRef = useRef<FlatList<Slide> | null>(null);
  const lastPressRef = useRef<number>(0);
  const appState = useRef(AppState.currentState);

  // reanimated shared values
  const scrollX = useSharedValue(0);
  const progress = useSharedValue(((0 + 1) / slides.length) * 100);

  // keep a ref to the dispatched profile promise so we can abort on unmount
  const profilePromiseRef = useRef<any | null>(null);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        // silent background -> foreground check for location validity
        try {
          const { status } = await Location.getForegroundPermissionsAsync();
          if (status !== "granted") return;
          const enabled = await Location.hasServicesEnabledAsync();
          if (!enabled) return;
          // quick read to warm up permissions (no heavy work)
          await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
        } catch (e) {
          console.warn("Silent location check failed:", e);
        }
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, []);

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
    [width]
  );

  // Core: request location, persist it, then validate auth/profile -> navigate
  const doLocationAndAuthFlow = useCallback(async () => {
    setLoadingState("request_permission");

    // ask permission
    await Location.requestForegroundPermissionsAsync();

    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== "granted") {
        setLoadingState("error");
        Alert.alert("Permission required", "Please enable location permission to continue.");
        return;
      }

      setLoadingState("getting_location");
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        setLoadingState("error");
        Alert.alert("Enable location", "Please enable location services on your device.");
        return;
      }

      // fetch current position (short timeout)
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low,
        timeout: 5000,
      });

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      // persist locally AND to redux location slice (atomic update)
      setLoadingState("persisting_location");
      try {
        await AsyncStorage.setItem("shop_lat", String(lat));
        await AsyncStorage.setItem("shop_lng", String(lng));
      } catch (e) {
        console.warn("Failed to persist shop coords to AsyncStorage:", e);
      }

      dispatch(setLocation({ latitude: lat, longitude: lng }));

      // Now check auth token (prefer context)
      const tokenFromContext = auth.token;
      let token = tokenFromContext;
      if (!token) {
        // fallback to AsyncStorage if context doesn't have it (rare, but safe)
        token = await AsyncStorage.getItem("authToken");
      }

      if (!token) {
        // Not signed in -> require sign-in
        setLoadingState("idle");
        return navigation.replace("signInScreen");
        // return navigation.replace("loginScreen")
      }

      // ensure axios has tokens (idempotent)
      await setAuthTokens({ accessToken: token, refreshToken: await AsyncStorage.getItem("refreshToken") });

      // fetch profile from server and handle it. Keep a reference to the returned promise for cancellation.
      setLoadingState("fetching_profile");
      const p = dispatch(fetchUserProfile() as any);
      profilePromiseRef.current = p;

      try {
        const profile = await p.unwrap(); // will throw if rejected
        // store minimal auth data in auth slice (so app components can read quickly)
        dispatch(
          setUser({
            id: profile.userId ?? null,
            role: profile.role ?? null,
            shopId: profile.shopId ?? null,
            token: token ?? null,
            user: {
              username: profile.username,
              email: profile.email,
              phone: profile.phone,
              userImage: profile.userImage,
            },
          })
        );

        // persist shop_id if returned by profile
        if (profile.shopId) {
          await AsyncStorage.setItem("shop_id", String(profile.shopId));
        }

        setLoadingState("done");

        // decide navigation:
        if (profile.role === "shop_owner" && !profile.shopId) {
          // owner but hasn't completed shop setup
          return navigation.navigate("enterShopDetailScreen");
        }

        // everything ok: reset to main flow
        return navigation.reset({ index: 0, routes: [{ name: "bottamTabScreen" }] });
      } catch (err: any) {
        // Profile fetch failed (token might be invalid). Clear auth and route to sign-in.
        console.warn("fetchUserProfile failed:", err?.message ?? err);
        // optional: call auth.signOut() if you want to clear context as well
        try {
          await auth.signOut();
        } catch (e) {
          console.warn("signOut error:", e);
        }
        setLoadingState("error");
        return navigation.replace("signInScreen");
      }
    } catch (err) {
      console.warn("doLocationAndAuthFlow error:", err);
      setLoadingState("error");
      Alert.alert("Error", "Unable to access location. Please try again.");
    }
  }, [auth, dispatch, navigation]);

  // cleanup/cancel outstanding profile fetch if component unmounts
  useEffect(() => {
    return () => {
      if (profilePromiseRef.current?.abort) {
        try {
          profilePromiseRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // UI handlers (dots/next/skip use same logic as before)
  const handleNext = useCallback(() => {
    const now = Date.now();
    if (now - lastPressRef.current < 350) return;
    lastPressRef.current = now;

    if (index < slides.length - 1) {
      const next = index + 1;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
    } else {
      // final slide -> run production flow
      void doLocationAndAuthFlow();
    }
  }, [index, doLocationAndAuthFlow]);

  const handleSkip = useCallback(() => {
    const last = slides.length - 1;
    flatListRef.current?.scrollToIndex({ index: last, animated: true });
  }, []);

  const getItemLayout = useCallback(
    (_: Slide[] | null | undefined, i: number) => ({ length: width, offset: width * i, index: i }),
    [width]
  );

  const Dots = useMemo(
    () => (
      <View style={styles.dotsRow} accessible accessibilityRole="adjustable" accessibilityLabel={`Slide ${index + 1} of ${slides.length}`}>
        {slides.map((s, i) => {
          const isActive = i === index;
          return <View key={s.id} style={[styles.dot, isActive ? styles.dotActive : undefined]} />;
        })}
      </View>
    ),
    [index]
  );

  const showLoading = loadingState !== "idle" && loadingState !== "done";

  return (
    <SafeAreaContainer>
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(i) => i.id}
        horizontal
        pagingEnabled
        snapToInterval={width}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index: idx }: ListRenderItemInfo<Slide>) => <SlideItem item={item} idx={idx} width={width} scrollX={scrollX} />}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onMomentumScrollEnd}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={3}
        removeClippedSubviews={Platform.OS === "android"}
        getItemLayout={getItemLayout}
        accessibilityRole={"adjustable" as AccessibilityRole}
      />

      <View style={styles.controls}>
        <View style={styles.topControlsRow}>
          <Pressable onPress={handleSkip} accessibilityRole={"button" as AccessibilityRole} accessibilityLabel="Skip to last" style={styles.skipContainer}>
            <Text style={styles.skipText} allowFontScaling>
              Skip
            </Text>
          </Pressable>
        </View>

        <View style={styles.progressBarWrapper}>
          <View style={styles.progressBarTrack}>
            <Animated.View style={[styles.progressFill, animatedProgressStyle]} />
          </View>
          {Dots}
        </View>

        <Pressable onPress={handleNext} accessibilityRole={"button" as AccessibilityRole} accessibilityLabel={index === slides.length - 1 ? "Get started" : "Next"} android_ripple={{ color: "rgba(255,255,255,0.08)" }} style={({ pressed }) => [styles.cta, pressed ? styles.ctaPressed : undefined]}>
          <Text style={styles.ctaText} allowFontScaling>
            {index === slides.length - 1 ? "Get Started" : "Next"}
          </Text>
        </Pressable>
      </View>

      {showLoading && (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>
              {loadingState === "request_permission" && "Requesting permission..."}
              {loadingState === "getting_location" && "Getting location..."}
              {loadingState === "persisting_location" && "Saving location..."}
              {loadingState === "fetching_profile" && "Fetching profile..."}
              {loadingState === "error" && "Something went wrong."}
            </Text>
          </View>
        </View>
      )}
    </SafeAreaContainer>
  );
};

export default OnBoardScreen;

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", justifyContent: "center" },
  slide: { flex: 1, justifyContent: "flex-start", paddingVertical: hp(2.4) },
  topRow: { height: hp(6), justifyContent: "center", alignItems: "flex-end", paddingHorizontal: wp(5) },
  topControlsRow: { position: "absolute", right: wp(4), top: hp(2.2) },
  skipContainer: { padding: hp(0.6), borderRadius: 8 },
  skipText: { color: "#666", fontSize: hp(1.8) },
  imageContainer: { flex: 0.6, justifyContent: "center", alignItems: "center" },
  image: {},
  textContainer: { flex: 0.34, paddingHorizontal: wp(6.4), justifyContent: "center" },
  title: { fontSize: hp(2.8), fontWeight: "700", color: PRIMARY_COLOR, marginBottom: hp(0.9) },
  description: { fontSize: hp(1.9), color: "#444", lineHeight: hp(2.8) },
  controls: { position: "absolute", left: 0, right: 0, bottom: hp(2.4), paddingHorizontal: wp(5) },
  progressBarWrapper: { marginBottom: hp(1.2) },
  progressBarTrack: { height: 6, backgroundColor: "#eee", borderRadius: 12, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: PRIMARY_COLOR, borderRadius: 12 },
  dotsRow: { flexDirection: "row", marginTop: hp(1), alignItems: "center", justifyContent: "center" },
  dot: { width: wp(2.4), height: wp(2.4), borderRadius: wp(1.2), backgroundColor: "#ddd", marginRight: wp(2) },
  dotActive: { backgroundColor: PRIMARY_COLOR, width: wp(4.2), height: wp(2.8), borderRadius: wp(1.4) },
  cta: { marginTop: hp(0.6), backgroundColor: PRIMARY_COLOR, paddingVertical: hp(1.6), borderRadius: theme?.COMMON_BORDER_RADIUS ?? 12, alignItems: "center", justifyContent: "center" },
  ctaPressed: { opacity: 0.9 },
  ctaText: { color: "#fff", fontSize: hp(2), fontWeight: "600" },

  /* loading overlay */
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 10,
  },
  loadingBox: {
    padding: hp(2),
    backgroundColor: "#333",
    borderRadius: 12,
    alignItems: "center",
  },
  loadingText: {
    marginTop: hp(1),
    color: "#fff",
    fontSize: hp(2),
  },
});
