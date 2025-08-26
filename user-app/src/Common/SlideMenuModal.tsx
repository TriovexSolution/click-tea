import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { hp, wp } from "@/src/assets/utils/responsive";
import theme from "@/src/assets/colors/theme";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing, 
  runOnJS 
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const SideMenuModal = ({ visible, onClose }: { visible: boolean, onClose: () => void }) => {
  const [showModal, setShowModal] = useState(visible);
  const translateX = useSharedValue(-width);
  const navigation = useNavigation();

  useEffect(() => {
    if (visible) {
      setShowModal(true); // show modal first
      translateX.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
    } else {
      translateX.value = withTiming(-width, { duration: 300, easing: Easing.in(Easing.cubic) }, () => {
        // animation finished
        runOnJS(setShowModal)(false);
      });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }]
  }));

  const menuItems = [
    { label: "Home", icon: "home-outline" },
    { label: "Cart", icon: "cart-outline" ,screen: "cartScreen"},
    { label: "Order History", icon: "receipt-outline",screen: "orderScreen" },
    { label: "Offer & Coupons", icon: "pricetag-outline" },
    { label: "Notification", icon: "notifications-outline" },
    { label: "Subscription", icon: "card-outline" },
  ];

  if (!showModal) return null; // hide completely when animation ends

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />

      <Animated.View style={[styles.menuContainer, animatedStyle]}>
        <View style={styles.menuHeader}>
          <Text style={styles.menuTitle}>Menu</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close-outline" size={28} color="#000" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={menuItems}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.menuItem}  onPress={() => {
      navigation.navigate(item.screen as never);
      onClose(); // close menu after navigation
      
    }}>
              <LinearGradient colors={["#fff", "#f0f0f0"]} style={styles.iconWrapper}>
                <Ionicons name={item.icon as any} size={hp(3)} color={theme.PRIMARY_COLOR} />
              </LinearGradient>
              <Text style={styles.menuText}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </Animated.View> 
    </View>
  );
};

export default SideMenuModal;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0)",
  },
  menuContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: wp(95),
    backgroundColor: "#fff",
    paddingTop: hp(5),
    paddingHorizontal: wp(5),
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(4),
  },
  menuTitle: {
    fontSize: hp(3),
    fontWeight: "bold",
    color: theme.PRIMARY_COLOR,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(3),
  },
  iconWrapper: {
    borderRadius: 12,
    padding: 8,
    marginRight: wp(3),
  },
  menuText: {
    fontSize: hp(2.2),
    color: theme.PRIMARY_COLOR,
    fontWeight: "500",
  },
});
