// // OnBoardScreen.tsx
// import { useNavigation } from "@react-navigation/native";
// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   Pressable,
//   Alert,
//   ImageBackground,
//   StyleSheet,
//   ActivityIndicator,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as Location from "expo-location";
// import theme from "@/src/assets/colors/theme";
// import { hp, wp } from "@/src/assets/utils/responsive";
// const OnBoardScreen = () => {
//   const navigation = useNavigation();
//   const [loading, setLoading] = useState(false);

// const handlePress = async () => {
//   setLoading(true);
//   try {
//     const token = await AsyncStorage.getItem("authToken");
//     // console.log(token);
    

//     if (!token) {
//       setLoading(false);
//       Alert.alert("Authentication Required", "Please login to continue.", [
//         { 
//           text: "OK",
//           onPress: () => navigation.navigate("signInScreen"),
//         },
//       ]);
//       return;
//     }

//     const { status } = await Location.requestForegroundPermissionsAsync();
//     if (status !== "granted") {
//       Alert.alert("Permission Required", "Enable location permission.");
//       setLoading(false);
//       return;
//     }

//     const services = await Location.hasServicesEnabledAsync();
//     if (!services) {
//       Alert.alert("Enable Location", "Turn on location services.");
//       setLoading(false);
//       return;
//     }

//     const location = await Location.getCurrentPositionAsync({
//       accuracy: Location.Accuracy.Low,
//       timeout: 2000,
//     });

//     await AsyncStorage.setItem("user_lat", location.coords.latitude.toString());
//     await AsyncStorage.setItem("user_lng", location.coords.longitude.toString());

//     setLoading(false);

//     navigation.reset({
//       index: 0,
//       routes: [{ name: "bottomTabScreen" }],
//     });
//   } catch (err) {
//     console.log("Location error:", err);
//     Alert.alert("Error", "Unable to fetch location.");
//     setLoading(false);
//   }
// };


//   return (
//     <View style={{ flex: 1 }}>
//       <ImageBackground
//         source={{
//           uri: "https://i.pinimg.com/736x/57/e1/14/57e114f83e455f1c6d565fa6c6839963.jpg",
//         }}
//         style={{ flex: 1 }}
//       >
//         <Pressable
//           style={[styles.button, loading && { opacity: 0.5 }]}
//           onPress={handlePress}
//           disabled={loading}
//         >
//           <Text style={styles.buttonText}>ClickTea</Text>
//         </Pressable>

//         {loading && (
//           <View style={styles.loading}>
//             <ActivityIndicator size="large" color="#fff" />
//             <Text style={styles.loadingText}>Getting location...</Text>
//           </View>
//         )}
//       </ImageBackground>
//     </View>
//   );
// };

// export default OnBoardScreen;

// const styles = StyleSheet.create({
//   button: {
//     backgroundColor: theme.PRIMARY_COLOR,
//     padding: hp(2.4),
//     bottom: hp(9),
//     position: "absolute",
//     alignSelf: "center",
//     borderRadius: theme.PRIMARY_BORDER_RADIUS,
//     paddingHorizontal: wp(15),
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: hp(2.2),
//     textAlign: "center",
//   },
//   loading: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(0,0,0,0.3)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   loadingText: {
//     color: "#fff",
//     marginTop: 10,
//     fontSize: hp(2),
//   },
// });
import theme from '@/src/assets/colors/theme';
import { hp, wp } from '@/src/assets/utils/responsive';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const PRIMARY_COLOR = '#562E19';

const slides = [
  {
    id: '1',
    title: 'Nearby Vendors',
    description: 'View Menus from vendors within 1KM around your location. Discover new flavors nearby.',
    image: require('../../assets/images/onBoard1.png'),
  },
  {
    id: '2',
    title: 'No More Calls!',
    description: 'Order Tea/Coffee Seamlessly without any phone calls. Browse, select, and order with just a few taps.',
       image: require('../../assets/images/onBoard2.png'),

  },
  {
    id: '3',
    title: 'Track Your Order',
    description: 'Real-Time Delivery Tracking so you know exactly when your order will arrive.',
       image: require('../../assets/images/onBoard3.png'),

  },
];

const OnBoardScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const progress = useSharedValue(0);
  const navigation = useNavigation();

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex });
      setCurrentIndex(nextIndex);
    } else {
      navigation.navigate('signInScreen');
    }
  };

  // Animate progress bar whenever index changes
  useEffect(() => {
    const progressPercent = ((currentIndex + 1) / slides.length) * 100;
    progress.value = withTiming(progressPercent, { duration: 300 });
  }, [currentIndex]);

  const animatedProgress = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

const renderItem = ({ item }: any) => (
  <View style={styles.slide}>
    {/* Image */}
    <View style={styles.imageContainer}>
      <Image 
        source={item.image} 
        style={styles.image} 
        resizeMode="contain" 
      />
    </View>

    {/* Text */}
    <View style={styles.textContainer}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  </View>
);


  return (
    <View style={styles.container}>
      <FlatList
        data={slides}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        ref={flatListRef}
      />

      {/* Progress Indicator */}
      <View style={styles.progressBar}>
        <Animated.View style={[styles.progressFill, animatedProgress]} />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleNext}
        activeOpacity={0.7}
        
      >
        <Text style={styles.buttonText}>
          {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default OnBoardScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'space-between',
    marginVertical: hp(5),
  },
  imageContainer: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: wp(70),
    height: wp(70),
  },
  textContainer: {
    flex: 0.3,
    paddingHorizontal: wp(6.8),
  },
  title: {
    fontSize: hp(2.5),
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    marginBottom: hp(1),
  },
  description: {
    fontSize: hp(1.8),
    color: '#444',
  },
  progressBar: {
    height: 4,
    width: wp(30),
    backgroundColor: '#eee',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: hp(2),
    alignSelf: 'flex-start',
    marginLeft: wp(6),
  },
  progressFill: {
    height: '100%',
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 10,
  },
  button: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: hp(1.8),
    marginHorizontal: wp(5),
    borderRadius: theme.COMMON_BORDER_RADIUS,
    marginBottom: hp(3),
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: hp(2),
  },
});

// OnBoardScreen.tsx
// import React, { useState, useRef, useEffect } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";

// const slides = [
//   { id: "1", title: "Welcome", description: "Intro 1", image: require('../../assets/images/onBoard1.png') },
//   { id: "2", title: "Discover", description: "Intro 2", image: require('../../assets/images/onBoard1.png') },
//   { id: "3", title: "Start", description: "Intro 3", image: require('../../assets/images/onBoard1.png') },
// ];

// const OnBoardScreen = () => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const flatListRef = useRef<FlatList>(null);
//   const progress = useSharedValue(0);
//   const navigation = useNavigation();

//   const handleNext = () => {
//     if (currentIndex < slides.length - 1) {
//       const nextIndex = currentIndex + 1;
//       flatListRef.current?.scrollToIndex({ index: nextIndex });
//       setCurrentIndex(nextIndex);
//     } else {
//       navigation.navigate("locationScreen"); // Navigate to Location
//     }
//   };

//   useEffect(() => {
//     const progressPercent = ((currentIndex + 1) / slides.length) * 100;
//     progress.value = withTiming(progressPercent, { duration: 300 });
//   }, [currentIndex]);

//   const animatedProgress = useAnimatedStyle(() => ({
//     width: `${progress.value}%`,
//   }));

//   const renderItem = ({ item }: any) => (
//     <View style={styles.slide}>
//       <View style={styles.imageContainer}>
//         <Image source={item.image} style={styles.image} resizeMode="contain" />
//       </View>
//       <View style={styles.textContainer}>
//         <Text style={styles.title}>{item.title}</Text>
//         <Text style={styles.description}>{item.description}</Text>
//       </View>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <FlatList
//         data={slides}
//         renderItem={renderItem}
//         keyExtractor={(item) => item.id}
//         horizontal
//         pagingEnabled
//         showsHorizontalScrollIndicator={false}
//         scrollEnabled={false}
//         ref={flatListRef}
//       />
//       <View style={styles.progressBar}>
//         <Animated.View style={[styles.progressFill, animatedProgress]} />
//       </View>
//       <TouchableOpacity style={styles.button} onPress={handleNext}>
//         <Text style={styles.buttonText}>
//           {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// export default OnBoardScreen;

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff", padding: 20 },
//   slide: { flex: 1, alignItems: "center", justifyContent: "center" },
//   imageContainer: { flex: 3, justifyContent: "center" },
//   image: { width: 300, height: 300 },
//   textContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
//   title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
//   description: { fontSize: 16, textAlign: "center", color: "#555" },
//   progressBar: { height: 5, backgroundColor: "#ddd", borderRadius: 2.5, marginVertical: 20 },
//   progressFill: { height: 5, backgroundColor: "#007AFF", borderRadius: 2.5 },
//   button: { backgroundColor: "#007AFF", padding: 15, borderRadius: 10, alignItems: "center" },
//   buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
// });
