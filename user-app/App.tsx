import { View, Text, StatusBar } from "react-native";
import React from "react";
import StackNavigatorScreens from "./src/screens/StackNavigatorScreens";
import { SafeAreaView } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { persistor, store } from "./src/Redux/store";
import { PersistGate } from "redux-persist/integration/react";

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
          <StatusBar hidden />
          <StackNavigatorScreens />
        </SafeAreaView>
      </PersistGate>
    </Provider>
  );
};

export default App;
