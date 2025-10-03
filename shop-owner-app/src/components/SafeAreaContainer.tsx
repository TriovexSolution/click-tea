import React, { useMemo, ReactNode } from "react";
import { StatusBar, View, StyleSheet, StatusBarStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SafeAreaContainerProps = {
  children: ReactNode;
  backgroundColor?: string;   // Color for SafeArea + StatusBar
  barStyle?: StatusBarStyle;  // "dark-content" | "light-content"
  contentBackground?: string; // Background for inner content
};

const SafeAreaContainer = ({
  children,
  backgroundColor = "#fff",
  barStyle = "dark-content",
  contentBackground = "#fff",
}: SafeAreaContainerProps) => {
  const safeAreaBackground = useMemo(() => ({ backgroundColor }), [backgroundColor]);

  return (
    <View style={styles.container}>
      {/* Top safe area (notch padding) */}
      <SafeAreaView style={[styles.topSafeArea, safeAreaBackground]} edges={["top"]} />

      {/* Status bar setup */}
      <StatusBar
        translucent
        backgroundColor={backgroundColor}
        barStyle={barStyle}
      />

      {/* Content area */}
      <View style={[styles.content, { backgroundColor: contentBackground }]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSafeArea: {
    // You can add custom height if needed, but SafeAreaView handles it
  },
  content: {
    flex: 1,
  },
});

export default SafeAreaContainer;
