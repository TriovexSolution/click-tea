// // import { View, Text, StatusBar } from 'react-native'
// // import React, { useEffect } from 'react'
// // import { SafeAreaView } from 'react-native-safe-area-context'
// // import StackNavigatorScreens from './src/screens/StackNavigatorScreens'
// // import { useDispatch, useSelector } from 'react-redux'
// // import { fetchUserProfile } from './src/Redux/Slice/profileSlice'
// // import { RootState } from './src/Redux/store'

// // const RootApp = () => {
// //      const dispatch = useDispatch();
// //   const profile = useSelector((state: RootState) => state.profile.data);
// //   useEffect(() => {
// //     dispatch(fetchUserProfile()); // ✅ safe, now inside Provider
// //   }, [dispatch]);
// //   return (
// //    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
// //       <StatusBar hidden />
// //       <StackNavigatorScreens />
// //     </SafeAreaView>
// //   )
// // }

// // export default RootApp// RootApp.tsx
// import React, { useEffect } from "react";
// import {  ActivityIndicator, StatusBar, View } from "react-native";
// import { useDispatch, useSelector } from "react-redux";
// import StackNavigatorScreens from "./src/screens/StackNavigatorScreens";
// import { fetchUserProfile } from "./src/Redux/Slice/profileSlice";
// import { RootState } from "./src/Redux/store";
// import { useAuth } from "./src/context/authContext"; // ensure path is correct
// import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

// import { useFonts } from "expo-font";
// import { selectSelectedShopId } from "./src/Redux/Slice/selectedShopSlice";
// import { fetchCartAllAsync, fetchCartAsync } from "./src/Redux/Slice/cartSlice";
// const RootApp = () => {
//   const dispatch = useDispatch();
//   const profile = useSelector((state: RootState) => state.profile.data);
//   // console.log(profile,"RootApp");
//   const shopId = useSelector(selectSelectedShopId);
//   const { isLoading: authRestoring, isLoggedIn } = useAuth();
//   const [fontsLoaded] = useFonts({
//     "Oswald-Bold": require("./src/assets/fonts/Oswald-Bold.ttf"),
//     "Oswald-ExtraLight": require("./src/assets/fonts/Oswald-ExtraLight.ttf"),
//     "Oswald-Light": require("./src/assets/fonts/Oswald-Light.ttf"),
//     "Oswald-Medium": require("./src/assets/fonts/Oswald-Medium.ttf"),
//     "Oswald-Regular": require("./src/assets/fonts/Oswald-Regular.ttf"),
//     "Oswald-SemiBold": require("./src/assets/fonts/Oswald-SemiBold.ttf"),
//   });

//   // useEffect(() => {
//   //   // Only fetch profile after AuthProvider finished restoring tokens AND user is logged in
//   //   if (!authRestoring && isLoggedIn && !profile) {
//   //     dispatch(fetchUserProfile() as any);
//   //   }
//   // }, [authRestoring, isLoggedIn, profile, dispatch]);
//     useEffect(() => {
//     if (!authRestoring && isLoggedIn && !profile) {
//       dispatch(fetchUserProfile() as any);
//     }
//   }, [authRestoring, isLoggedIn, profile, dispatch]);

//   // ✅ Fetch cart when user logged in + shopId available
//   useEffect(() => {
//     if (!authRestoring && isLoggedIn && shopId) {
//      // dispatch(fetchCartAsync({ shopId, force: true }) as any);
//      dispatch(fetchCartAllAsync());
//     }
//   }, [authRestoring, isLoggedIn, shopId, dispatch]);
//   return (
//     <SafeAreaProvider style={{ flex: 1, backgroundColor: "white" }}>
//       {/* <StatusBar hidden /> */}
     
//       {/* <StatusBar
//         translucent
//         backgroundColor="transparent" // transparent always
//         barStyle="light-content" // white icons (good for gradient)
//       /> */}
//       <StackNavigatorScreens />
//     </SafeAreaProvider>
//   );
// };

// export default RootApp;

import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { RootState } from "./src/Redux/store";
import { selectSelectedShopId } from "./src/Redux/Slice/selectedShopSlice";
import { useAuth } from "./src/context/authContext";
import { fetchUserProfile } from "./src/Redux/Slice/profileSlice";
import { fetchCartAllAsync } from "./src/Redux/Slice/cartSlice";
import StackNavigatorScreens from "./src/screens/StackNavigatorScreens";


const RootApp: React.FC = () => {
  const dispatch = useDispatch();
  const profile = useSelector((s: RootState) => s.profile.data);
  const shopId = useSelector(selectSelectedShopId);
  const { isLoading: authRestoring, isLoggedIn } = useAuth();

  const [fontsLoaded] = useFonts({
    "Oswald-Bold": require("./src/assets/fonts/Oswald-Bold.ttf"),
    "Oswald-ExtraLight": require("./src/assets/fonts/Oswald-ExtraLight.ttf"),
    "Oswald-Light": require("./src/assets/fonts/Oswald-Light.ttf"),
    "Oswald-Medium": require("./src/assets/fonts/Oswald-Medium.ttf"),
    "Oswald-Regular": require("./src/assets/fonts/Oswald-Regular.ttf"),
    "Oswald-SemiBold": require("./src/assets/fonts/Oswald-SemiBold.ttf"),
  });

  useEffect(() => {
    if (!authRestoring && isLoggedIn && !profile) {
      dispatch(fetchUserProfile() as any);
    }
  }, [authRestoring, isLoggedIn, profile, dispatch]);

  useEffect(() => {
    if (!authRestoring && isLoggedIn && shopId) {
      dispatch(fetchCartAllAsync() as any);
    }
  }, [authRestoring, isLoggedIn, shopId, dispatch]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: "#fff" }}>
      <StackNavigatorScreens />
    </SafeAreaProvider>
  );
};

export default RootApp;

// Notes:

// We wait for fonts to load to avoid layout shifts.

// We only fetch profile & cart when auth restore completes and user is logged in.