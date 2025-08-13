import { View, Text, StatusBar } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import StackNavigationScreens from './src/screens/StackNavigationScreens'
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { LogBox } from "react-native";
LogBox.ignoreLogs([
  "Codegen didn't run for", // suppress those warnings
]);
SplashScreen.preventAutoHideAsync();
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
    return null; // app will stay on splash screen
  }
  return (
    <SafeAreaView style={{flex:1,backgroundColor:"white"}} onLayout={onLayoutRootView}>
         <StatusBar hidden />
      <StackNavigationScreens />
    </SafeAreaView>
  )
}

export default App