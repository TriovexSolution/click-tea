// import React from "react";
// import {
//   View,
//   Text,
//   Pressable,
//   StyleSheet,
//   Platform,
//   StatusBar,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { useNavigation } from "@react-navigation/native";
// import { hp, wp } from "../assets/utils/responsive";

// type HeaderProps = {
//   title: string;
//   bgColor?: string;
// };

// const CommonStatusHeader = ({ title, bgColor = "#F5DEB3" }: HeaderProps) => {
//   const navigation = useNavigation();

//   const topInset =
//     Platform.OS === "android"
//       ? StatusBar.currentHeight || hp(3.8) + hp(1)  // Android notch/statusbar height
//       : hp(5); // iOS safe default (≈20–44px depending on device)

//   return (
//     <View style={[styles.header, { backgroundColor: bgColor, paddingTop: topInset }]}>
//       <StatusBar
//         translucent
//         backgroundColor={bgColor} // Android color match
//         barStyle="dark-content" // "light-content" if bgColor is dark
//       />

//       <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
//         <Ionicons name="chevron-back-outline" size={hp(3.5)} />
//       </Pressable>

//       <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
//         {title}
//       </Text>

//       <View style={styles.rightSpace} />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   header: {
//     paddingHorizontal: wp(4),
//     paddingBottom: hp(2),
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   backBtn: {
//     width: wp(10),
//     justifyContent: "center",
//     alignItems: "flex-start",
//   },
//   headerTitle: {
//     fontSize: hp(2.2),
//     fontWeight: "bold",
//     textAlign: "center",
//     flex: 1,
//   },
//   rightSpace: {
//     width: wp(10),
//   },
// });

// export default CommonStatusHeader;
import React from "react";
import { View, Text, Pressable, StyleSheet, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { hp, wp } from "../assets/utils/responsive";

type HeaderProps = {
  title: string;
  bgColor?: string;
};

const CommonStatusHeader = ({ title, bgColor = "#F5DEB3" }: HeaderProps) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // insets.top is precise for iOS notch / Android cutout
  const paddingTop = insets.top + hp(1.0); // add extra breathing room

  return (
    <View style={[styles.wrapper, { backgroundColor: bgColor }]}>
      {/* Draw behind status bar; we use insets for padding */}
      <StatusBar
        translucent={true}
        backgroundColor={bgColor}
        barStyle={getBarStyle(bgColor)}
      />

      <View style={[styles.header, { paddingTop }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back-outline" size={hp(3.5)} color={getTextColor(bgColor)} />
        </Pressable>

        <Text style={[styles.headerTitle, { color: getTextColor(bgColor) }]} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>

        <View style={styles.rightSpace} />
      </View>
    </View>
  );
};

const isColorDark = (hex: string) => {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
};

const getBarStyle = (bg: string) => (isColorDark(bg) ? "light-content" : "dark-content");
const getTextColor = (bg: string) => (isColorDark(bg) ? "#fff" : "#000");

const styles = StyleSheet.create({
  wrapper: { width: "100%" }, // header background
  header: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: { width: wp(10), justifyContent: "center", alignItems: "flex-start" },
  headerTitle: { fontSize: hp(2.2), fontWeight: "bold", textAlign: "center", flex: 1 },
  rightSpace: { width: wp(10) },
});

export default CommonStatusHeader;
