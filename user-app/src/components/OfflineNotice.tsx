// src/components/OfflineNotice.tsx
import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Image, Animated, Easing } from "react-native";
import { useNetworkStatus } from "../assets/network/useNetworkStatus";

const OfflineNotice = () => {
  const isConnected = useNetworkStatus();
  const slideAnim = useRef(new Animated.Value(-100)).current; // start hidden above screen

  useEffect(() => {
    if (!isConnected) {
      // Slide down
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
  setTimeout(() => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 400,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, 1500); // wait 1.5s before hiding
}
  }, [isConnected]);

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.card}>
        <Image
          source={require("../assets/images/nowifi.jpg")} // 👈 replace with your wifi icon
          style={styles.icon}
        />
        <View>
          <Text style={styles.title}>You’re Offline</Text>
          <Text style={styles.subtitle}>Please check your internet connection</Text>
        </View>
      </View>
    </Animated.View>
  );
};

export default OfflineNotice;

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 100,
    width: "100%",
    alignItems: "center",
    marginTop: 12,
    zIndex: 9999,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.85)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  icon: {
    width: 28,
    height: 28,
    marginRight: 12,
    tintColor: "#fff",
  },
  title: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  subtitle: {
    color: "#ddd",
    fontSize: 12,
    marginTop: 2,
  },
});
