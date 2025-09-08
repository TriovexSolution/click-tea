// import { View, Text, StatusBar } from 'react-native'
// import React, { useEffect } from 'react'
// import { SafeAreaView } from 'react-native-safe-area-context'
// import StackNavigatorScreens from './src/screens/StackNavigatorScreens'
// import { useDispatch, useSelector } from 'react-redux'
// import { fetchUserProfile } from './src/Redux/Slice/profileSlice'
// import { RootState } from './src/Redux/store'

// const RootApp = () => {
//      const dispatch = useDispatch();
//   const profile = useSelector((state: RootState) => state.profile.data);
//   useEffect(() => {
//     dispatch(fetchUserProfile()); // ✅ safe, now inside Provider
//   }, [dispatch]);
//   return (
//    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
//       <StatusBar hidden />
//       <StackNavigatorScreens />
//     </SafeAreaView>
//   )
// }

// export default RootApp// RootApp.tsx
import React, { useEffect } from "react";
import {  ActivityIndicator, StatusBar, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import StackNavigatorScreens from "./src/screens/StackNavigatorScreens";
import { fetchUserProfile } from "./src/Redux/Slice/profileSlice";
import { RootState } from "./src/Redux/store";
import { useAuth } from "./src/context/authContext"; // ensure path is correct
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { useFonts } from "expo-font";
const RootApp = () => {
  const dispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.profile.data);
  const { isLoading: authRestoring, isLoggedIn } = useAuth();
  const [fontsLoaded] = useFonts({
    "Oswald-Bold": require("./src/assets/fonts/Oswald-Bold.ttf"),
    "Oswald-ExtraLight": require("./src/assets/fonts/Oswald-ExtraLight.ttf"),
    "Oswald-Light": require("./src/assets/fonts/Oswald-Light.ttf"),
    "Oswald-Medium": require("./src/assets/fonts/Oswald-Medium.ttf"),
    "Oswald-Regular": require("./src/assets/fonts/Oswald-Regular.ttf"),
    "Oswald-SemiBold": require("./src/assets/fonts/Oswald-SemiBold.ttf"),
  });

  // useEffect(() => {
  //   // Only fetch profile after AuthProvider finished restoring tokens AND user is logged in
  //   if (!authRestoring && isLoggedIn && !profile) {
  //     dispatch(fetchUserProfile() as any);
  //   }
  // }, [authRestoring, isLoggedIn, profile, dispatch]);
    React.useEffect(() => {
    if (!authRestoring && isLoggedIn && !profile) {
      dispatch(fetchUserProfile() as any);
    }
  }, [authRestoring, isLoggedIn, profile, dispatch]);
  if (!fontsLoaded) {
    // Show a simple loader while fonts are loading
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#562E19" />
      </View>
    );
  }
  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: "white" }}>
      {/* <StatusBar hidden /> */}
     
      {/* <StatusBar
        translucent
        backgroundColor="transparent" // transparent always
        barStyle="light-content" // white icons (good for gradient)
      /> */}
      <StackNavigatorScreens />
    </SafeAreaProvider>
  );
};

export default RootApp;
