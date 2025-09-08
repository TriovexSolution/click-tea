// // App.tsx
// import React, { useCallback, useEffect, useState } from "react";
// import { StatusBar } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import StackNavigationScreens from "./src/screens/StackNavigationScreens";
// import * as Font from "expo-font";
// import * as SplashScreen from "expo-splash-screen";
// import { LogBox } from "react-native";
// import { Provider, useSelector } from "react-redux";
// import { store, RootState } from "./src/Redux/store";
// import useRegisterPushAndSocket from "./src/hooks/useRegisterPushAndSocket";
// import useVendorNotifications from "./src/hooks/useVendorNotifications";

// LogBox.ignoreLogs([
//   "Codegen didn't run for", // suppress those warnings
// ]);
// SplashScreen.preventAutoHideAsync();

// // ✅ Move Redux logic into a child component
// const AppContent = () => {
//   const user = useSelector((state: RootState) => state.auth.user);
//   const userId = user?.id;
//   const role = user?.role; // "shop_owner" or "user"

//   useRegisterPushAndSocket(userId, role);
//   useVendorNotifications(role === "shop_owner" ? userId : null);

//   return <StackNavigationScreens />;
// };

// const App = () => {
//   const [fontsLoaded, setFontsLoaded] = useState(false);

//   useEffect(() => {
//     const loadFonts = async () => {
//       try {
//         await Font.loadAsync({
//           "InriaSerif-Regular": require("./src/assets/fonts/InriaSerif-Regular.ttf"),
//         });
//       } catch (e) {
//         console.warn(e);
//       } finally {
//         setFontsLoaded(true);
//       }
//     };
//     loadFonts();
//   }, []);

//   const onLayoutRootView = useCallback(async () => {
//     if (fontsLoaded) {
//       await SplashScreen.hideAsync();
//     }
//   }, [fontsLoaded]);

//   if (!fontsLoaded) {
//     return null; // stay on splash screen
//   }

//   return (
//     <Provider store={store}>
//       <SafeAreaView style={{ flex: 1, backgroundColor: "white" }} onLayout={onLayoutRootView}>
//         <StatusBar hidden />
//         <AppContent />
//       </SafeAreaView>
//     </Provider>
//   );
// };

// export default App;
// App.tsx
import React, { useCallback, useEffect, useState } from "react";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import StackNavigationScreens from "./src/screens/StackNavigationScreens";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { LogBox } from "react-native";
import { Provider, useSelector, useDispatch } from "react-redux";
import { store, RootState } from "./src/Redux/store";
import useRegisterPushAndSocket from "./src/hooks/useRegisterPushAndSocket";
import useVendorNotifications from "./src/hooks/useVendorNotifications";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAuthTokens } from "@/src/assets/api/client"; // your axiosClient helper
import { fetchUserProfile } from "./src/Redux/slice/profileSlice";
import { AuthProvider } from "./src/context/authContext";

LogBox.ignoreLogs([
  "Codegen didn't run for",
]);

SplashScreen.preventAutoHideAsync();

// ✅ App content inside store provider. This component accesses redux.
const AppContent = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.id;
  const role = user?.role; // "shop_owner" or "user"

  // register push/socket (keeps using redux auth slice)
  useRegisterPushAndSocket(userId, role);
  useVendorNotifications(role === "shop_owner" ? userId : null);

  // restore tokens once on mount so axiosClient has Authorization header
  useEffect(() => {
    (async () => {
      try {
        const accessToken = await AsyncStorage.getItem("authToken");
        const refreshToken = await AsyncStorage.getItem("refreshToken");

        if (accessToken || refreshToken) {
          // set tokens into axiosClient memory & default header
          await setAuthTokens({ accessToken, refreshToken });
          // populate profile in redux (fire & forget)
          dispatch(fetchUserProfile() as any);
        }
      } catch (e) {
        console.warn("AppContent: failed to restore tokens", e);
      }
    })();
  }, [dispatch]);

  return <StackNavigationScreens />;
};

const App = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          "InriaSerif-Regular": require("./src/assets/fonts/InriaSerif-Regular.ttf"),
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setFontsLoaded(true);
      }
    };
    loadFonts();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      {/* AuthProvider should wrap whatever needs signIn/signOut and token state */}
      <AuthProvider>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: "white" }}
          onLayout={onLayoutRootView}
        >
          <StatusBar hidden />
          <AppContent />
        </SafeAreaView>
      </AuthProvider>
    </Provider>
  );
};

export default App;
