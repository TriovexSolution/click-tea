// import { View, Text, StatusBar } from "react-native";
// import React from "react";
// import StackNavigatorScreens from "./src/screens/StackNavigatorScreens";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Provider } from "react-redux";
// import { persistor, store } from "./src/Redux/store";
// import { PersistGate } from "redux-persist/integration/react";

// const App = () => {
//   return (
//     <Provider store={store}>
//       <PersistGate loading={null} persistor={persistor}>
//         <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
//           <StatusBar hidden />
//           <StackNavigatorScreens />
//         </SafeAreaView>
//       </PersistGate>
//     </Provider>
//   );
// };

// export default App;
// import { View, Text, StatusBar } from "react-native";
// import React from "react";
// import StackNavigatorScreens from "./src/screens/StackNavigatorScreens";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Provider } from "react-redux";
// import { persistor, store } from "./src/Redux/store";
// import { PersistGate } from "redux-persist/integration/react";
// import AvailabilityGate from "./src/screens/AvailabilityService/AvailabilityGate";

// const App = () => {
//   return (
//     <Provider store={store}>
//       <PersistGate loading={null} persistor={persistor}>
//         <AvailabilityGate>
//           <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
//             <StatusBar hidden />
//             <StackNavigatorScreens />
//           </SafeAreaView>
//         </AvailabilityGate>
//       </PersistGate>
//     </Provider>
//   );
// };

// export default App;
import React, { useState, useEffect } from "react";
import { StatusBar, ActivityIndicator, View } from "react-native";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { store, persistor } from "./src/Redux/store";
import StackNavigatorScreens from "./src/screens/StackNavigatorScreens";
import { SafeAreaView } from "react-native-safe-area-context";


const App = () => {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        setIsLoggedIn(!!token);
      } catch (err) {
        console.log("Error checking token", err);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
          <StatusBar hidden />
          <StackNavigatorScreens isLoggedIn={isLoggedIn} />
        </SafeAreaView>
      </PersistGate>
    </Provider>
  );
};

export default App;
