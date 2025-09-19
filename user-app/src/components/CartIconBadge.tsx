// // src/components/CartIconWithBadge.tsx
// import React, { useEffect, useState } from 'react';
// import { View, Text, TouchableOpacity } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { ParamListBase, useNavigation } from '@react-navigation/native';
// import { useDispatch, useSelector } from 'react-redux';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { selectSelectedShopId } from '../Redux/Slice/selectedShopSlice';
// import { fetchCartAsync, selectCartCount } from '../Redux/Slice/cartSlice';
// import theme from '../assets/colors/theme';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// type Props = {
//   shopId: number;
// };
// const CartIconWithBadge = () => {
//   // console.log(shopId,"carticon");
//       const shopId = useSelector(selectSelectedShopId);
//   const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
//   const cartCount = useSelector(selectCartCount);
// const [cartLoaded, setCartLoaded] = useState(false);
// const dispatch = useDispatch();
// useEffect(() => {
//   (async () => {
//     const id = await AsyncStorage.getItem("userId");
//     // console.log(id);
    
//     if (id) {
//       await dispatch(fetchCartAsync(id));
//     }
//     setCartLoaded(true);
//   })();
// }, []);

// if (!cartLoaded) return null; // or show empty icon without badge
//   return (
//     // console.log("Cart count from selector:", cartCount),
//     <TouchableOpacity onPress={() => navigation.navigate('cartScreen')}>
//     <View style={{ position: 'relative', padding: 4 }}>
//       <Ionicons name="cart-outline" size={24} color={theme.PRIMARY_COLOR} />
//       {cartCount > 0 && (
//         <View style={{
//           position: 'absolute',
//           top: -4,
//           right: -4,
//           backgroundColor: 'red',
//           borderRadius: 10,
//           width: 18,
//           height: 18,
//           justifyContent: 'center',
//           alignItems: 'center',
//         }}>
//           <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
//             {cartCount}
//           </Text>
//         </View>
//       )}
//     </View>
//   </TouchableOpacity>
//   );
// };

// export default CartIconWithBadge;
// src/components/CartIconWithBadge.tsx
// CartIconWithBadge.tsx// CartIconWithBadge.tsx — fetches whole-cart so badge is total across all shops
// import React, { useEffect, useCallback, useMemo } from "react";
// import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { ParamListBase, useNavigation } from "@react-navigation/native";
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import { useDispatch, useSelector } from "react-redux";
// import { selectSelectedShopId } from "@/src/Redux/Slice/selectedShopSlice";
// import { fetchCartAllAsync, selectCartCount, selectCartTotalWithGst } from "@/src/Redux/Slice/cartSlice";
// import theme from "@/src/assets/colors/theme";

// const BADGE_MAX = 99;

// const CartIconWithBadge: React.FC = () => {
//   const dispatch = useDispatch();
//   const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
//   const shopId = useSelector(selectSelectedShopId);
//   const cartCount = useSelector(selectCartCount);
//   // console.log(cartCount);
  
//   const cartTotalWithGst = useSelector(selectCartTotalWithGst);

//   // fetch ALL cart items once on mount and refresh when shopId changes
//   useEffect(() => {
//     // keep store-global totals accurate by fetching the full cart
//     dispatch(fetchCartAllAsync()).catch(() => {});
//   }, [dispatch, shopId]); // re-run when shopId changes to keep totals fresh

//   const onPress = useCallback(() => {
//     navigation.navigate("cartScreen" as never);
//   }, [navigation]);

//   const displayCount = useMemo(() => {
//     if (!cartCount || cartCount <= 0) return null;
//     return cartCount > BADGE_MAX ? `${BADGE_MAX}+` : String(cartCount);
//   }, [cartCount]);

//   const accessibilityLabel = useMemo(() => {
//     const itemsLabel = displayCount ? `${displayCount} items` : "empty";
//     const totalLabel =
//       typeof cartTotalWithGst === "number" && cartTotalWithGst > 0
//         ? `• ₹${cartTotalWithGst.toFixed(2)}`
//         : "";
//     return `Cart, ${itemsLabel} ${totalLabel}`;
//   }, [displayCount, cartTotalWithGst]);

//   return (
//     <TouchableOpacity
//       onPress={onPress}
//       accessibilityLabel={accessibilityLabel}
//       accessibilityRole="button"
//       style={styles.touchable}
//     >
//       <View style={styles.iconWrap}>
//         <Ionicons name="cart-outline" size={24} color={theme.PRIMARY_COLOR} />
//         {displayCount ? (
//           <View style={styles.badge} accessible accessibilityLabel={`${displayCount} items in cart`}>
//             <Text style={styles.badgeText}>{displayCount}</Text>
//           </View>
//         ) : null}
//       </View>
//     </TouchableOpacity>
//   );
// };

// const styles = StyleSheet.create({
//   touchable: { padding: 6 },
//   iconWrap: { position: "relative", padding: 4 },
//   badge: {
//     position: "absolute",
//     top: -6,
//     right: -8,
//     backgroundColor: "red",
//     borderRadius: 10,
//     minWidth: 18,
//     height: 18,
//     paddingHorizontal: 4,
//     justifyContent: "center",
//     alignItems: "center",
//     elevation: 2,
//   },
//   badgeText: { color: "#fff", fontSize: 10, fontWeight: "700", textAlign: "center" },
// });

// export default CartIconWithBadge;
// src/components/CartIconBadge.tsx (or wherever you keep it)
import React, { useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { fetchCartAllAsync } from "@/src/Redux/Slice/cartSlice";
import { selectCartCount, selectCartTotalWithGst } from "@/src/Redux/Slice/cartSlice";
import theme from "@/src/assets/colors/theme";

const BADGE_MAX = 99;

const CartIconWithBadge: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const cartCount = useSelector(selectCartCount);
  const cartTotalWithGst = useSelector(selectCartTotalWithGst);

  useEffect(() => {
    // keep global store up-to-date for badge/totals
    dispatch(fetchCartAllAsync()).catch(() => {});
  }, [dispatch]);

  const displayCount = useMemo(() => {
    if (!cartCount || cartCount <= 0) return null;
    return cartCount > BADGE_MAX ? `${BADGE_MAX}+` : String(cartCount);
  }, [cartCount]);

  const accessibilityLabel = useMemo(() => {
    const itemsLabel = displayCount ? `${displayCount} items` : "empty";
    const totalLabel = typeof cartTotalWithGst === "number" && cartTotalWithGst > 0 ? `• ₹${cartTotalWithGst.toFixed(2)}` : "";
    return `Cart, ${itemsLabel} ${totalLabel}`;
  }, [displayCount, cartTotalWithGst]);

  return (
    <TouchableOpacity onPress={() => navigation.navigate("cartScreen" as never)} accessibilityLabel={accessibilityLabel} accessibilityRole="button" style={{ padding: 6 }}>
      <View style={{ position: "relative", padding: 4 }}>
        <Ionicons name="cart-outline" size={24} color={theme.PRIMARY_COLOR} />
        {displayCount ? (
          <View style={{
            position: "absolute",
            top: -6,
            right: -8,
            backgroundColor: "red",
            borderRadius: 10,
            minWidth: 18,
            height: 18,
            paddingHorizontal: 4,
            justifyContent: "center",
            alignItems: "center",
            elevation: 2,
          }} accessible accessibilityLabel={`${displayCount} items in cart`}>
            <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700", textAlign: "center" }}>{displayCount}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

export default CartIconWithBadge;
