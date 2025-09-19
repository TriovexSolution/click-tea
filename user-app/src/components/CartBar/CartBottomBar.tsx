// components/CartBottomBar.tsx
import React, { useMemo } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RootState } from "@/src/Redux/store";
import { useNavigation } from "@react-navigation/native";
import { hp, wp } from "@/src/assets/utils/responsive";
import theme from "@/src/assets/colors/theme";

const CartBottomBar = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const totalPrice = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );

  if (totalItems === 0) return null;

  return (
    <Pressable
      style={[styles.cartBar, { bottom: Math.max(insets.bottom, hp(2)) }]}
      onPress={() => navigation.navigate("cartScreen")}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={styles.cartIconWrap}>
          <Ionicons name="cart-outline" size={hp(3)} color="white" />
        </View>
        <View>
          <Text style={styles.cartText}>View Cart</Text>
          <Text style={styles.cartMeta}>
            {totalItems} item{totalItems > 1 ? "s" : ""} 
          </Text>
        </View>
      </View>
      <Ionicons
        name="chevron-forward-outline"
        size={hp(3.2)}
        color="white"
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cartBar: {
    position: "absolute",
    left: wp(4),
    right: wp(4),
    backgroundColor: "#562E19",
    borderRadius: 12,
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(4),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 8,
    shadowColor: "#562E19",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  cartIconWrap: {
   width: hp(4.4),
    height: hp(4.4),
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  cartText: {
   color: "#fff", fontWeight: "700", fontSize: hp(1.8) 
  },
  cartMeta: {
  color: "#fff", opacity: 0.9, fontSize: hp(1.1) 
  },
});

export default CartBottomBar;
