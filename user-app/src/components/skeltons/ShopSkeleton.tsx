// src/components/skeletons/ShopSkeleton.tsx
import React from "react";
import { View, StyleSheet } from "react-native";

const ShopSkeleton = () => {
  return (
    <View style={styles.container}>
      <View style={styles.image} />
      <View style={styles.text} />
      <View style={styles.textSmall} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#f2f2f2",
  },
  image: {
    height: 100,
    borderRadius: 8,
    backgroundColor: "#e0e0e0",
    marginBottom: 10,
  },
  text: {
    height: 20,
    borderRadius: 5,
    backgroundColor: "#e0e0e0",
    marginBottom: 5,
  },
  textSmall: {
    height: 15,
    borderRadius: 5,
    backgroundColor: "#e0e0e0",
    width: "60%",
  },
});

export default ShopSkeleton;
