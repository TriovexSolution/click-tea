// App.tsx
import React, { useCallback, useEffect, useState } from "react";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import StackNavigationScreens from "./src/screens/StackNavigationScreens";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { LogBox } from "react-native";
import { Provider, useSelector } from "react-redux";
import { store, RootState } from "./src/Redux/store";
import useRegisterPushAndSocket from "./src/hooks/useRegisterPushAndSocket";
import useVendorNotifications from "./src/hooks/useVendorNotifications";

LogBox.ignoreLogs([
  "Codegen didn't run for", // suppress those warnings
]);
SplashScreen.preventAutoHideAsync();

// ✅ Move Redux logic into a child component
const AppContent = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.id;
  const role = user?.role; // "shop_owner" or "user"

  useRegisterPushAndSocket(userId, role);
  useVendorNotifications(role === "shop_owner" ? userId : null);

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
    return null; // stay on splash screen
  }

  return (
    <Provider store={store}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }} onLayout={onLayoutRootView}>
        <StatusBar hidden />
        <AppContent />
      </SafeAreaView>
    </Provider>
  );
};

export default App;
