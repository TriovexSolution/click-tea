// // import React, { useState, useEffect } from "react";
// // import { StatusBar, ActivityIndicator, View } from "react-native";
// // import { Provider } from "react-redux";
// // import { PersistGate } from "redux-persist/integration/react";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import { store, persistor } from "./src/Redux/store";
// // import StackNavigatorScreens from "./src/screens/StackNavigatorScreens";
// // import { SafeAreaView } from "react-native-safe-area-context";
// // import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// // import { AddressProvider } from "./src/context/addressContext";
// // import axios from "axios";
// // import { useNotificationListener } from "./src/hooks/useNotificationListner.";
// // import { registerForPushToken } from "./src/assets/utils/registerForPushToken";


// // const App = () => {
// //   const [loading, setLoading] = useState(true);
// //   const [isLoggedIn, setIsLoggedIn] = useState(false);
// //   const [userId, setUserId] = useState<number | null>(null);

// //   useNotificationListener(); // ✅ now notifications are handled globally

// //   useEffect(() => {
// //     const checkAuth = async () => {
// //       try {
// //         const token = await AsyncStorage.getItem("authToken");
// //         const userIdFromStorage = await AsyncStorage.getItem("userId"); // save this at login
// //         if (token && userIdFromStorage) {
// //           setIsLoggedIn(true);
// //           setUserId(Number(userIdFromStorage));
// //         }
// //       } catch (err) {
// //         console.log("Error checking token", err);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };
// //     checkAuth();
// //   }, []);

// //   // 🔹 Register push token only if logged in
// //   useEffect(() => {
// //     (async () => {
// //       if (isLoggedIn && userId) {
// //         const expoPushToken = await registerForPushToken();
// //         if (expoPushToken) {
// //           try {
// //             await axios.post("http://YOUR_SERVER_IP:5000/api/save-token", {
// //               userId,
// //               deviceToken: expoPushToken,
// //             });
// //           } catch (err) {
// //             console.log("❌ Error saving token to backend:", err);
// //           }
// //         }
// //       }
// //     })();
// //   }, [isLoggedIn, userId]);

// //   if (loading) {
// //     return (
// //       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
// //         <ActivityIndicator size="large" />
// //       </View>
// //     );
// //   }

// //   const queryClient = new QueryClient({
// //     defaultOptions: {
// //       queries: {
// //         retry: 1,
// //         refetchOnWindowFocus: false,
// //         staleTime: 1000 * 60,
// //       },
// //     },
// //   });

// //   return (
// //     <Provider store={store}>
// //       <PersistGate loading={null} persistor={persistor}>
// //         <QueryClientProvider client={queryClient}>
// //           <AddressProvider>
// //             <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
// //               <StatusBar hidden />
// //               <StackNavigatorScreens isLoggedIn={isLoggedIn} />
// //             </SafeAreaView>
// //           </AddressProvider>
// //         </QueryClientProvider>
// //       </PersistGate>
// //     </Provider>
// //   );
// // };

// // export default App;
// // // App.tsx (root)import React, { useEffect } from "react";
// // import { Provider } from "react-redux";
// // import { PersistGate } from "redux-persist/integration/react";
// // import { store, persistor } from "./src/Redux/store";
// // import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// // import { AddressProvider } from "./src/context/addressContext";
// // import { AuthProvider } from "./src/context/authContext";
// // import { BASE_URL } from "./api";
// // import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
// // import { GestureHandlerRootView } from "react-native-gesture-handler";
// // import RootApp from "./RootApp";
// // import * as NavigationBar from "expo-navigation-bar";
// // import { useEffect } from "react";
// // import { Platform } from "react-native";
// // import { TabBarVisibilityProvider } from "./src/context/TabBarVisibilityContext";

// // const queryClient = new QueryClient({
// //   defaultOptions: {
// //     queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 1000 * 60 },
// //   },
// // });
// // const SERVER_URL = `${BASE_URL}`;

// // const App = () => {
// //   useEffect(() => {
// //     if (Platform.OS === "android") {
// //       // Hide system nav bar (Zerodha style)
// //       NavigationBar.setVisibilityAsync("hidden");
// //       NavigationBar.setBehaviorAsync("overlay-swipe");
// //       NavigationBar.setBackgroundColorAsync("transparent");
// //     }
// //   }, []);

// //   return (
// //     <GestureHandlerRootView style={{ flex: 1 }}>
// //       <Provider store={store}>
// //         <PersistGate loading={null} persistor={persistor}>
// //           <QueryClientProvider client={queryClient}>
// //             <AddressProvider>
// //               <AuthProvider>
// //                 <BottomSheetModalProvider>
// //                   <TabBarVisibilityProvider>
// //                   <RootApp />
// //                   </TabBarVisibilityProvider>
// //                 </BottomSheetModalProvider>
// //               </AuthProvider>
// //             </AddressProvider>
// //           </QueryClientProvider>
// //         </PersistGate>
// //       </Provider>
// //     </GestureHandlerRootView>
// //   );
// // };

// // export default App;
// // App.tsx
// import { Provider } from "react-redux";
// import { PersistGate } from "redux-persist/integration/react";
// import { store, persistor } from "./src/Redux/store";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { AddressProvider } from "./src/context/addressContext";
// import { AuthProvider } from "./src/context/authContext";
// import { BASE_URL } from "./api";
// import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
// import { GestureHandlerRootView } from "react-native-gesture-handler";
// import RootApp from "./RootApp";
// import * as NavigationBar from "expo-navigation-bar";
// import React, { useEffect } from "react";
// import { Platform, AppState } from "react-native";

// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 1000 * 60 },
//   },
// });
// const SERVER_URL = `${BASE_URL}`;

// const App = () => {
//   useEffect(() => {
//     if (Platform.OS !== "android") return;

//     let mounted = true;

//     // Helper that attempts to set nav bar state but swallows unsupported warnings.
//     const applyNavBarSettings = async () => {
//       try {
//         // hide/show visibility is the most broadly supported action
//         await NavigationBar.setVisibilityAsync("hidden");
//       } catch (err) {
//         // device may not support hide — safe to ignore in production
//         // optional: you can log at debug level
//         console.debug("NavigationBar.setVisibilityAsync failed (ignored).", err);
//       }

//       // Try to set behavior & background color when supported — swallow expected warnings.
//       try {
//         await NavigationBar.setBehaviorAsync("overlay-swipe");
//       } catch (err) {
//         // expected on edge-to-edge devices — ignore
//       }

//       try {
//         await NavigationBar.setBackgroundColorAsync("transparent");
//       } catch (err) {
//         // expected on some devices — ignore
//       }
//     };

//     // Apply initially
//     applyNavBarSettings();

//     // Re-apply on resume (AppState 'active') to handle process death / OS changes
//     const subscription = AppState.addEventListener("change", (next) => {
//       if (!mounted) return;
//       if (next === "active") {
//         // Re-apply in background/foreground transitions
//         applyNavBarSettings();
//       }
//     });

//     return () => {
//       mounted = false;
//       // cleanup subscription
//       subscription.remove();
//     };
//   }, []);

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <Provider store={store}>
//         <PersistGate loading={null} persistor={persistor}>
//           <QueryClientProvider client={queryClient}>
//             <AddressProvider>
//               <AuthProvider>
//                 <BottomSheetModalProvider>
//                     <RootApp />
//                 </BottomSheetModalProvider>
//               </AuthProvider>
//             </AddressProvider>
//           </QueryClientProvider>
//         </PersistGate>
//       </Provider>
//     </GestureHandlerRootView>
//   );
// };

// export default App;

import React, { useEffect } from "react";
import { Platform, AppState } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as NavigationBar from "expo-navigation-bar";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

import { store, persistor } from "./src/Redux/store";
import { AddressProvider } from "./src/context/addressContext";
import { AuthProvider } from "./src/context/authContext";
import RootApp from "./RootApp";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 60_000,
    },
  },
});

const App: React.FC = () => {
  useEffect(() => {
    if (Platform.OS !== "android") return;

    let mounted = true;
    const applyNavBarSettings = async () => {
      try {
        await NavigationBar.setVisibilityAsync("hidden");
      } catch (err) {
        // ignore unsupported devices in production
      }
      try {
        await NavigationBar.setBehaviorAsync("overlay-swipe");
      } catch (err) {}
      try {
        await NavigationBar.setBackgroundColorAsync("transparent");
      } catch (err) {}
    };

    applyNavBarSettings();
    const sub = AppState.addEventListener("change", (next) => {
      if (!mounted) return;
      if (next === "active") applyNavBarSettings();
    });

    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <QueryClientProvider client={queryClient}>
            <AddressProvider>
              <AuthProvider>
                <BottomSheetModalProvider>
                  <RootApp />
                </BottomSheetModalProvider>
              </AuthProvider>
            </AddressProvider>
          </QueryClientProvider>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default App;
