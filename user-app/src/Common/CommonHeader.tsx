import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { hp, wp } from "../assets/utils/responsive";

const CommonHeader = ({ title }:any) => {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="chevron-back-outline" size={hp(3.5)} />
      </Pressable>
      <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
        {title}
      </Text>
      {/* An empty View to balance the back button and center the title */}
      <View style={styles.rightSpace} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: wp(4),
    marginTop: hp(2),
    justifyContent: "space-between",
  },
  backBtn: {
    // paddingRight: wp(3),
    width: wp(10), // fixed width to help center title
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: hp(2.2),
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  rightSpace: {
    width: wp(10), // same width as backBtn to balance the layout
  },
});

export default CommonHeader;
