import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/src/Redux/store";
import { useNavigation } from "@react-navigation/native";
import { hp, wp } from "@/src/assets/utils/responsive";

const NearestShopScreen = () => {
  const navigation = useNavigation<any>();
  const { nearestShop } = useSelector((state: RootState) => state.service);

  if (!nearestShop) {
    return null; // fallback
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Service Available!</Text>
      <Text style={styles.shopName}>{nearestShop.shopname}</Text>
      <Text style={styles.distance}>
        {nearestShop.distance.toFixed(2)} km away
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.replace("bottomTabScreen")}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

export default NearestShopScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: wp(5),
  },
  title: {
    fontSize: hp(3),
    fontWeight: "bold",
    marginBottom: hp(2),
  },
  shopName: {
    fontSize: hp(2.5),
    fontWeight: "600",
    marginBottom: hp(1),
  },
  distance: {
    fontSize: hp(2),
    color: "#555",
    marginBottom: hp(3),
  },
  button: {
    backgroundColor: "#ff6600",
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(10),
    borderRadius: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: hp(2),
    fontWeight: "600",
  },
});
