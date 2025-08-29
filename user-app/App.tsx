// import React, { useState, useEffect } from "react";
// import { StatusBar, ActivityIndicator, View } from "react-native";
// import { Provider } from "react-redux";
// import { PersistGate } from "redux-persist/integration/react";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { store, persistor } from "./src/Redux/store";
// import StackNavigatorScreens from "./src/screens/StackNavigatorScreens";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { AddressProvider } from "./src/context/addressContext";
// import axios from "axios";
// import { useNotificationListener } from "./src/hooks/useNotificationListner.";
// import { registerForPushToken } from "./src/assets/utils/registerForPushToken";


// const App = () => {
//   const [loading, setLoading] = useState(true);
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [userId, setUserId] = useState<number | null>(null);

//   useNotificationListener(); // ✅ now notifications are handled globally

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const token = await AsyncStorage.getItem("authToken");
//         const userIdFromStorage = await AsyncStorage.getItem("userId"); // save this at login
//         if (token && userIdFromStorage) {
//           setIsLoggedIn(true);
//           setUserId(Number(userIdFromStorage));
//         }
//       } catch (err) {
//         console.log("Error checking token", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     checkAuth();
//   }, []);

//   // 🔹 Register push token only if logged in
//   useEffect(() => {
//     (async () => {
//       if (isLoggedIn && userId) {
//         const expoPushToken = await registerForPushToken();
//         if (expoPushToken) {
//           try {
//             await axios.post("http://YOUR_SERVER_IP:5000/api/save-token", {
//               userId,
//               deviceToken: expoPushToken,
//             });
//           } catch (err) {
//             console.log("❌ Error saving token to backend:", err);
//           }
//         }
//       }
//     })();
//   }, [isLoggedIn, userId]);

//   if (loading) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <ActivityIndicator size="large" />
//       </View>
//     );
//   }

//   const queryClient = new QueryClient({
//     defaultOptions: {
//       queries: {
//         retry: 1,
//         refetchOnWindowFocus: false,
//         staleTime: 1000 * 60,
//       },
//     },
//   });

//   return (
//     <Provider store={store}>
//       <PersistGate loading={null} persistor={persistor}>
//         <QueryClientProvider client={queryClient}>
//           <AddressProvider>
//             <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
//               <StatusBar hidden />
//               <StackNavigatorScreens isLoggedIn={isLoggedIn} />
//             </SafeAreaView>
//           </AddressProvider>
//         </QueryClientProvider>
//       </PersistGate>
//     </Provider>
//   );
// };

// export default App;
// App.tsx (root)
import React from "react";
import { View, ActivityIndicator, StatusBar } from "react-native";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./src/Redux/store";
import { SafeAreaView } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AddressProvider } from "./src/context/addressContext";
import { AuthProvider } from "./src/context/authContext";
import StackNavigatorScreens from "./src/screens/StackNavigatorScreens";
import { BASE_URL } from "./api";
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AppServices from "./src/services/AppServices";
import RootApp from "./RootApp";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 1000 * 60 },
  },
});
const SERVER_URL = `${BASE_URL}`; 
const App = () => {
  return (
 <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <QueryClientProvider client={queryClient}>
            <AddressProvider>
              <AuthProvider>
                <BottomSheetModalProvider>
                    <AppServices>
                  {/* <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
                    <StatusBar hidden />
                    <StackNavigatorScreens />
                  </SafeAreaView> */}
                  <RootApp/>
                  </AppServices>
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
