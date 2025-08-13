// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   FlatList,
//   Pressable,
//   ActivityIndicator,
//   Modal,
//   ToastAndroid,
//   Alert,
// } from "react-native";
// import React, { useCallback, useState } from "react";
// import { useFocusEffect } from "@react-navigation/native";
// import { useNavigation } from "expo-router";
// import { useSelector, useDispatch } from "react-redux";
// import { Ionicons } from "@expo/vector-icons";
// import axios from "axios";
// import { Image } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { hp, wp } from "@/src/assets/utils/responsive";
// import theme from "@/src/assets/colors/theme";
// import { BASE_URL } from "@/api";
// import { cartDataType } from "@/src/assets/types/userDataType";
// import { selectSelectedShopId } from "@/src/Redux/Slice/selectedShopSlice";
// import {
//   updateCartItemAsync,
//   removeFromCartAsync,
// } from "@/src/Redux/Slice/cartSlice";

// let debounceTimeout: any = null;

// const CartScreen = () => {
//   const shopId = useSelector(selectSelectedShopId);
//   const navigation = useNavigation();
//   const dispatch = useDispatch();

//   const [cartData, setCartData] = useState<cartDataType[]>([]);
//   const [totalAmount, setTotalAmount] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [updatingId, setUpdatingId] = useState<number | null>(null);
// const [paymentModalVisible, setPaymentModalVisible] = useState(false);
// const [isSubscription, setIsSubscription] = useState(false);
//   useFocusEffect(
//     useCallback(() => {
//       fetchData();
//     }, [shopId])
//   );
// useFocusEffect(
//   useCallback(() => {
//     const checkSubscription = async () => {
//       const token = await AsyncStorage.getItem("authToken");
//       const res = await axios.get(`${BASE_URL}/api/profile`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       setIsSubscription(res.data.is_subscription == 1);
//     };
//     // console.log(isSubscription);

//     checkSubscription();
//   }, [])
// );
//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const token = await AsyncStorage.getItem("authToken");
//       const res = await axios.get(`${BASE_URL}/api/cart/${shopId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setCartData(res.data);
//     } catch (err) {
//       console.error("Cart fetch error", err);
//     } finally {
//       setLoading(false);
//     }
//   };
// const handlePayLater = async () => {
//   try {
//     const token = await AsyncStorage.getItem("authToken");
//     if (!token) {
//       Alert.alert("Unauthorized", "Please log in first.");
//       return;
//     }
// const cartItems = cartData.map((item) => ({
//   menuId: item.menuId,
//   quantity: item.quantity,
//   addons: item.addons || [],
//   price: item.price,
//   subtotal: item.price * item.quantity,
//   shopId: shopId, // this must be present
// }));
// console.log("🛒 Sending cartItems:", cartItems);

//     const payload = {
//       cartItems,
//       delivery_note: "", // Optional: if you want to support note input later
//     };

//     const { data } = await axios.post(
//       `${BASE_URL}/api/orders/pay-later`,
//       payload,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     Alert.alert(
//       "Success 🎉",
//       `Pay Later order placed.\nTotal: ₹${data.totalAmount}`,
//       [
//         {
//           text: "OK",
//           onPress: () => {
//             setPaymentModalVisible(false);
//             setCartData([]);
//             navigation.navigate("orderScreen");
//           },
//         },
//       ]
//     );
//   } catch (err) {
//     console.error("❌ PayLater Error:", err?.response?.data || err);
//     const msg =
//       err?.response?.data?.message || "Something went wrong placing the order.";
//     Alert.alert("Error", msg);
//   }
// };

//   const getTotal = useCallback(() => {
//     const total = cartData.reduce(
//       (sum, item) => sum + item.quantity * item.price,
//       0
//     );
//     setTotalAmount(total);
//   }, [cartData]);

//   useFocusEffect(
//     useCallback(() => {
//       getTotal();
//     }, [getTotal])
//   );

//   const handleQtyChange = async (
//     item: cartDataType,
//     increment: boolean
//   ) => {
//     const newQty = increment ? item.quantity + 1 : item.quantity - 1;
//     setUpdatingId(item.cartId!);

//     if (newQty <= 0) {
//       try {
//         await dispatch(removeFromCartAsync(item.cartId!)).unwrap();
//         setCartData((prev) =>
//           prev.filter((i) => i.cartId !== item.cartId)
//         );
//       } catch (err) {
//         console.error("❌ Failed to remove from backend:", err);
//       } finally {
//         setUpdatingId(null);
//       }
//     } else {
//       clearTimeout(debounceTimeout);
//       debounceTimeout = setTimeout(async () => {
//         try {
//           await dispatch(
//             updateCartItemAsync({
//               cartId: item.cartId!,
//               quantity: newQty,
//               addons: item.addons || [],
//               notes: item.notes || "",
//             })
//           );
//           setCartData((prev) =>
//             prev.map((i) =>
//               i.cartId === item.cartId ? { ...i, quantity: newQty } : i
//             )
//           );
//         } catch (err) {
//           console.error("❌ Failed to update qty", err);
//         } finally {
//           setUpdatingId(null);
//         }
//       }, 400);
//     }
//   };
// const handleCoinPayment = async () => {
//   try {
//     const token = await AsyncStorage.getItem("authToken");
//     const payload = {
//       totalAmount,
//       shopId,
//       delivery_note: "", // optional, or replace with note from input
//       cartItems: cartData.map((item) => ({
//         menuId: item.menuId,
//         quantity: item.quantity,
//         price: item.price,
//         addons: item.addons || [],
//       })),
//     };

//     const res = await axios.post(`${BASE_URL}/api/coin/pay`, payload, {
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     if (res.status === 200) {
//       // ✅ Order successful
//       setPaymentModalVisible(false);
//       ToastAndroid.show("Order placed using coins!", ToastAndroid.SHORT);

//       setCartData([]); // Clear cart UI
//       navigation.navigate("bottomTabScreen"); // or your bottom tab name
//     } else {
//       alert("Something went wrong. Try again.");
//     }
//   } catch (err) {
//     console.error("💥 Coin payment failed:", err.response?.data || err.message);
//     alert("Payment failed. Please try again.");
//   }
// };

//   const renderItem = ({ item }: { item: cartDataType }) => (
//     <View style={styles.cartItemContainer}>
//       <View style={styles.cartItem}>
//         <View style={{ alignItems: "center", gap: 5 }}>
//           <Image
//             style={styles.itemImage}
// source={{
//   uri: `${BASE_URL}/uploads/menus/${item.imageUrl}`,
// }}
//           />
//           <View style={styles.qtyContainer}>
//             <Pressable onPress={() => handleQtyChange(item, false)}>
//               <Ionicons
//                 name="remove-outline"
//                 size={20}
//                 color={theme.SECONDARY_COLOR}
//               />
//             </Pressable>
//             <Text style={styles.qtyText}>
//               {updatingId === item.cartId ? (
//                 <ActivityIndicator size="small" color={theme.PRIMARY_COLOR} />
//               ) : (
//                 item.quantity
//               )}
//             </Text>
//             <Pressable onPress={() => handleQtyChange(item, true)}>
//               <Ionicons
//                 name="add-outline"
//                 size={20}
//                 color={theme.SECONDARY_COLOR}
//               />
//             </Pressable>
//           </View>
//         </View>
//         <View style={{ flex: 1, marginLeft: 10 }}>
//           <Text style={styles.itemTitle}>{item.menuName}</Text>
//           <Text numberOfLines={2} style={styles.itemDesc}>
//             {item.ingredients || "Custom ingredients"}
//           </Text>
//           <Text style={styles.itemPrice}>
//             ₹{(Number(item.price) * item.quantity).toFixed(2)}
//           </Text>
//           <View style={styles.extraTopping}>
//             <Ionicons name="square-outline" size={16} />
//             <Text style={styles.toppingText}>Add Ons</Text>
//           </View>
//         </View>
//       </View>
//     </View>
//   );

//   return (

//     <View style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Ionicons
//             name="chevron-back-outline"
//             size={24}
//             color={theme.PRIMARY_COLOR}
//           />
//         </TouchableOpacity>
//         <TouchableOpacity>
//           <Ionicons
//             name="share-social-outline"
//             size={24}
//             color={theme.PRIMARY_COLOR}
//           />
//         </TouchableOpacity>
//       </View>

//       {loading ? (
//         <View style={styles.emptyCart}>
//           <ActivityIndicator size="large" color={theme.PRIMARY_COLOR} />
//         </View>
//       ) : cartData.length === 0 ? (
//         <View style={styles.emptyCart}>
//           <Text>No Cart Items Available</Text>
//         </View>
//       ) : (
//         <>
//           <FlatList
//             data={cartData}
//             renderItem={renderItem}
//             keyExtractor={(item) => item.cartId.toString()}
//             contentContainerStyle={{ paddingBottom: 100, marginTop: hp(1) }}
//           />

//           {/* Footer */}
//           <View style={styles.footer}>
//             <View>
//               <Text style={styles.totalLabel}>Total Pay</Text>
//               <Text style={styles.totalAmount}>₹{totalAmount.toFixed(2)}</Text>
//             </View>
//             <Pressable style={styles.placeOrderButton} onPress={() => setPaymentModalVisible(true)}>
//   <Text style={styles.placeOrderText}>Place Order</Text>
//   <Ionicons name="chevron-forward-outline" size={hp(3)} />
// </Pressable>

//           </View>
//         </>
//       )}
//       <Modal
//   transparent
//   visible={paymentModalVisible}
//   animationType="slide"
//   onRequestClose={() => setPaymentModalVisible(false)}
// >
//   <View style={styles.modalOverlay}>
//     <View style={styles.modalContainer}>
//       <Text style={styles.modalTitle}>Choose Payment Method</Text>

//       <TouchableOpacity style={styles.paymentOption} onPress={()=>handleCoinPayment()}>
//         <Ionicons name="wallet-outline" size={24} color={theme.PRIMARY_COLOR} />
//         <Text style={styles.paymentText}>Pay with ClickTea Coin</Text>
//       </TouchableOpacity>

//       <TouchableOpacity style={styles.paymentOption}>
//         <Ionicons name="card-outline" size={24} color={theme.PRIMARY_COLOR} />
//         <Text style={styles.paymentText}>Pay Online</Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={[styles.paymentOption, !isSubscription && { opacity: 0.5 }]}
//         disabled={!isSubscription}
//         onPress={handlePayLater}

//       >
//         <Ionicons name="time-outline" size={24} color={theme.PRIMARY_COLOR} />
//         <Text style={styles.paymentText}>Pay Later</Text>
//       </TouchableOpacity>

//       <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
//         <Text style={styles.cancelText}>Cancel</Text>
//       </TouchableOpacity>
//     </View>
//   </View>
// </Modal>

//     </View>
//   );
// };

// export default CartScreen;

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "white" },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     padding: 16,
//   },
//   emptyCart: { flex: 1, justifyContent: "center", alignItems: "center" },
//   cartItemContainer: {
//     backgroundColor: "white",
//     marginHorizontal: 12,
//     marginBottom: 12,
//     borderRadius: 16,
//     overflow: "hidden",
//     elevation: 2,
//   },
//   cartItem: {
//     flexDirection: "row",
//     padding: 12,
//     backgroundColor: "#fff",
//     borderRadius: 16,
//   },
//   itemImage: {
//     height: hp(10),
//     width: wp(20),
//     borderRadius: 10,
//   },
//   itemTitle: {
//     fontWeight: "bold",
//     fontSize: 17,
//     fontFamily: theme.PRIMARY_FONT_FAMILY,
//     color: theme.PRIMARY_COLOR,
//   },
//   itemDesc: {
//     color: theme.PRIMARY_COLOR,
//     fontSize: 13,
//     fontFamily: theme.PRIMARY_FONT_FAMILY,
//   },
//   itemPrice: {
//     color: theme.SECONDARY_COLOR,
//     marginVertical: 4,
//     fontWeight: "600",
//     fontFamily: theme.PRIMARY_FONT_FAMILY,
//     fontSize: 15,
//   },
//   qtyContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#f2f2f2",
//     borderRadius: 16,
//     paddingHorizontal: 10,
//     paddingVertical: 7,
//     marginTop: 5,
//   },
//   qtyText: {
//     marginHorizontal: 10,
//     fontWeight: "600",
//     fontFamily: theme.PRIMARY_FONT_FAMILY,
//     color: theme.PRIMARY_COLOR,
//   },
//   extraTopping: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 6,
//   },
//   toppingText: {
//     fontSize: 12,
//     marginLeft: 5,
//     fontFamily: theme.PRIMARY_FONT_FAMILY,
//   },
//   footer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     backgroundColor: theme.PRIMARY_COLOR,
//     paddingVertical: hp(2.5),
//     paddingHorizontal: 15,
//     borderTopLeftRadius: 16,
//     borderTopRightRadius: 16,
//     elevation: 4,
//   },
//   totalLabel: {
//     color: "#FFFFFF",
//     opacity: 0.8,
//     fontFamily: theme.PRIMARY_FONT_FAMILY,
//     fontSize: hp(1.5),
//   },
//   totalAmount: {
//     color: "white",
//     fontFamily: theme.PRIMARY_FONT_FAMILY,
//     fontSize: hp(2.8),
//   },
//   placeOrderButton: {
//     backgroundColor: "white",
//     flexDirection: "row",
//     alignItems: "center",
//     borderRadius: 16,
//     paddingHorizontal: 15,
//     paddingVertical: 8,
//   },
//   placeOrderText: {
//     fontSize: hp(2),
//     marginRight: 5,
//   },
//   modalOverlay: {
//   flex: 1,
//   justifyContent: "flex-end",
//   backgroundColor: "rgba(0,0,0,0.5)",
// },
// modalContainer: {
//   backgroundColor: "white",
//   padding: 20,
//   borderTopLeftRadius: 20,
//   borderTopRightRadius: 20,
// },
// modalTitle: {
//   fontSize: hp(2.2),
//   fontWeight: "bold",
//   color: theme.PRIMARY_COLOR,
//   marginBottom: 15,
// },
// paymentOption: {
//   flexDirection: "row",
//   alignItems: "center",
//   paddingVertical: 12,
//   borderBottomWidth: 1,
//   borderBottomColor: "#eee",
// },
// paymentText: {
//   marginLeft: 12,
//   fontSize: hp(1.9),
//   fontFamily: theme.PRIMARY_FONT_FAMILY,
// },
// cancelText: {
//   textAlign: "center",
//   color: "red",
//   marginTop: 20,
//   fontSize: hp(2),
//   fontWeight: "600",
// }

// });
//12-08-2025
// import React, { useCallback, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Pressable,
//   ActivityIndicator,
//   FlatList,
//   Image,
//   Switch,
//   Alert,
//   ToastAndroid,
//   Modal,
//   TouchableOpacity,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { useFocusEffect, useNavigation } from "@react-navigation/native";
// import { hp, wp } from "@/src/assets/utils/responsive";
// import { useSelector, useDispatch } from "react-redux";
// import { selectSelectedShopId } from "@/src/Redux/Slice/selectedShopSlice";
// import { cartDataType } from "@/src/assets/types/userDataType";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";
// import { BASE_URL } from "@/api";
// import theme from "@/src/assets/colors/theme";
// import { removeFromCartAsync, updateCartItemAsync } from "@/src/Redux/Slice/cartSlice";
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withSpring,
//   withTiming,
//   Easing,
//   withSequence,
//   runOnJS,
// } from "react-native-reanimated";
// let debounceTimeout: any = null;

// const CartScreen = () => {
//   const navigation = useNavigation();
//   const dispatch = useDispatch();
//   const shopId = useSelector(selectSelectedShopId);

//   const [cartData, setCartData] = useState<cartDataType[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [updatingId, setUpdatingId] = useState<number | null>(null);
//   const [totalAmount, setTotalAmount] = useState(0);
//   const [useCoins, setUseCoins] = useState(false);
//   const [availableCoins, setAvailableCoins] = useState(50); // demo value
//   const [paymentModalVisible, setPaymentModalVisible] = useState(false);
//   const [isSubscription, setIsSubscription] = useState(false);

//   // Fetch cart + subscription status
//   useFocusEffect(
//     useCallback(() => {
//       fetchData();
//       checkSubscription();
//     }, [shopId])
//   );

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const token = await AsyncStorage.getItem("authToken");
//       const res = await axios.get(`${BASE_URL}/api/cart/${shopId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setCartData(res.data);
//     } catch (err) {
//       console.error("Cart fetch error", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const checkSubscription = async () => {
//     const token = await AsyncStorage.getItem("authToken");
//     const res = await axios.get(`${BASE_URL}/api/profile`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     setIsSubscription(res.data.is_subscription == 1);
//   };

//   // Calculate total
//   const getTotal = useCallback(() => {
//     const total = cartData.reduce(
//       (sum, item) => sum + item.quantity * item.price,
//       0
//     );
//     setTotalAmount(total);
//   }, [cartData]);

//   useFocusEffect(
//     useCallback(() => {
//       getTotal();
//     }, [getTotal])
//   );

//   // // Qty change handler
//   // const handleQtyChange = async (item: cartDataType, increment: boolean) => {
//   //     triggerBounce();
//   //   const newQty = increment ? item.quantity + 1 : item.quantity - 1;
//   //   setUpdatingId(item.cartId!);
//   // // Coin drop animation if using coins
//   // if (useCoins) {
//   //   triggerCoinDrop();
//   // }
//   //   if (newQty <= 0) {
//   // triggerShake(async () => {
//   //     try {
//   //       await dispatch(removeFromCartAsync(item.cartId!)).unwrap();
//   //       setCartData((prev) => prev.filter((i) => i.cartId !== item.cartId));
//   //     } catch (err) {
//   //       console.error("❌ Failed to remove from backend:", err);
//   //     } finally {
//   //       setUpdatingId(null);
//   //     }
//   //   });
//   // } else {
//   //   clearTimeout(debounceTimeout);
//   //   debounceTimeout = setTimeout(async () => {
//   //     try {
//   //       await dispatch(
//   //         updateCartItemAsync({
//   //           cartId: item.cartId!,
//   //           quantity: newQty,
//   //           addons: item.addons || [],
//   //           notes: item.notes || "",
//   //         })
//   //       );
//   //       setCartData((prev) =>
//   //         prev.map((i) =>
//   //           i.cartId === item.cartId ? { ...i, quantity: newQty } : i
//   //         )
//   //       );
//   //     } catch (err) {
//   //       console.error("❌ Failed to update qty", err);
//   //     } finally {
//   //       setUpdatingId(null);
//   //     }
//   //   }, 400);
//   // }
//   // };
// const handleQtyChange = (item, increment) => {
//   const newQty = increment ? item.quantity + 1 : item.quantity - 1;
//   setUpdatingId(item.cartId);

//   // Trigger coin drop only if using coins
//   if (useCoins) {
//     triggerCoinDrop();
//   }

//   if (newQty <= 0) {
//     triggerShake(async () => {
//       await dispatch(removeFromCartAsync(item.cartId));
//       setCartData((prev) => prev.filter(i => i.cartId !== item.cartId));
//       setUpdatingId(null);
//     });
//   } else {
//     clearTimeout(debounceTimeout);
//     debounceTimeout = setTimeout(async () => {
//       await dispatch(updateCartItemAsync({ cartId: item.cartId, quantity: newQty }));
//       setCartData((prev) =>
//         prev.map(i => i.cartId === item.cartId ? { ...i, quantity: newQty } : i)
//       );
//       setUpdatingId(null);
//     }, 400);
//   }
// };

//   // Payment handlers
//   const handleCoinPayment = async () => {
//     try {
//       const token = await AsyncStorage.getItem("authToken");
//       const payload = {
//         totalAmount,
//         shopId,
//         delivery_note: "",
//         cartItems: cartData.map((item) => ({
//           menuId: item.menuId,
//           quantity: item.quantity,
//           price: item.price,
//           addons: item.addons || [],
//         })),
//       };
//       const res = await axios.post(`${BASE_URL}/api/coin/pay`, payload, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (res.status === 200) {
//         setPaymentModalVisible(false);
//         ToastAndroid.show("Order placed using coins!", ToastAndroid.SHORT);
//         setCartData([]);
//         navigation.navigate("bottomTabScreen");
//       }
//     } catch (err) {
//       console.error("💥 Coin payment failed:", err.response?.data || err.message);
//       alert("Payment failed. Please try again.");
//     }
//   };

//   const handlePayLater = async () => {
//     try {
//       const token = await AsyncStorage.getItem("authToken");
//       const cartItems = cartData.map((item) => ({
//         menuId: item.menuId,
//         quantity: item.quantity,
//         addons: item.addons || [],
//         price: item.price,
//         subtotal: item.price * item.quantity,
//         shopId: shopId,
//       }));

//       const payload = { cartItems, delivery_note: "" };

//       const { data } = await axios.post(
//         `${BASE_URL}/api/orders/pay-later`,
//         payload,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       Alert.alert(
//         "Success 🎉",
//         `Pay Later order placed.\nTotal: ₹${data.totalAmount}`,
//         [
//           {
//             text: "OK",
//             onPress: () => {
//               setPaymentModalVisible(false);
//               setCartData([]);
//               navigation.navigate("orderScreen");
//             },
//           },
//         ]
//       );
//     } catch (err) {
//       console.error("❌ PayLater Error:", err?.response?.data || err);
//       const msg =
//         err?.response?.data?.message || "Something went wrong placing the order.";
//       Alert.alert("Error", msg);
//     }
//   };
// // Animation shared values
// const qtyScale = useSharedValue(1);
// const priceScale = useSharedValue(1);
// const rippleOpacity = useSharedValue(0);

// // Bounce style for qty
// const qtyAnimatedStyle = useAnimatedStyle(() => {
//   return { transform: [{ scale: qtyScale.value }] };
// });

// // Bounce style for price
// const priceAnimatedStyle = useAnimatedStyle(() => {
//   return { transform: [{ scale: priceScale.value }] };
// });

// // Ripple style
// const rippleStyle = useAnimatedStyle(() => {
//   return { opacity: rippleOpacity.value };
// });
// // Shared animation values
// const coinY = useSharedValue(-20);
// const coinOpacity = useSharedValue(0);
// const shakeX = useSharedValue(0);

// // Coin animation style
// const coinAnimatedStyle = useAnimatedStyle(() => ({
//   transform: [{ translateY: coinY.value }],
//   opacity: coinOpacity.value,
// }));

// // Shake animation style
// const shakeAnimatedStyle = useAnimatedStyle(() => ({
//   transform: [{ translateX: shakeX.value }],
// }));

// const triggerBounce = () => {
//   qtyScale.value = 1.2;
//   qtyScale.value = withSpring(1, { damping: 5, stiffness: 150 });

//   priceScale.value = 1.2;
//   priceScale.value = withSpring(1, { damping: 5, stiffness: 150 });

//   rippleOpacity.value = 0.4;
//   rippleOpacity.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) });
// };
// const triggerCoinDrop = () => {
//   coinY.value = -20;
//   coinOpacity.value = 1;
//   coinY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) });
//   coinOpacity.value = withTiming(0, { duration: 600 });
// };

// const triggerShake = (onComplete: () => void) => {
//   shakeX.value = withSequence(
//     withTiming(-5, { duration: 50 }),
//     withTiming(5, { duration: 50 }),
//     withTiming(-5, { duration: 50 }),
//     withTiming(0, { duration: 50 }, () => runOnJS(onComplete)())
//   );
// };

//   // Render item
//   const renderItem = ({ item }: { item: cartDataType }) => {
//     return(

//     // <View style={styles.itemRow}>
//     <Animated.View style={[styles.itemRow, shakeAnimatedStyle]}>
//       <Image
//         source={{ uri: `${BASE_URL}/uploads/menus/${item.imageUrl}` }}
//         style={styles.itemImage}
//       />
//       <View style={{ flex: 1, marginLeft: wp(3) }}>
//         <Text style={styles.itemName}>{item.menuName}</Text>
//         <Text style={styles.itemPriceEach}>₹{item.price} each</Text>
//       </View>
// {/*
//       <View style={styles.qtyContainer}>
//         <Pressable
//           style={styles.qtyButton}
//           onPress={() => handleQtyChange(item, false)}
//         >
//           <Ionicons name="remove-outline" size={hp(2.2)} />
//         </Pressable>
//         <Text style={styles.qtyText}>
//           {updatingId === item.cartId ? (
//             <ActivityIndicator size="small" color={theme.PRIMARY_COLOR} />
//           ) : (
//             item.quantity
//           )}
//         </Text>
//         <Pressable
//           style={styles.qtyButton}
//           onPress={() => handleQtyChange(item, true)}
//         >
//           <Ionicons name="add-outline" size={hp(2.2)} />
//         </Pressable>
//       </View> */}
// <Animated.View style={[styles.qtyContainer, qtyAnimatedStyle]}>
//   <Pressable style={styles.qtyButton} onPress={() => handleQtyChange(item, false)}>
//     <Ionicons name="remove-outline" size={hp(2.2)} />
//   </Pressable>

//   <Text style={styles.qtyText}>
//     {updatingId === item.cartId ? (
//       <ActivityIndicator size="small" color={theme.PRIMARY_COLOR} />
//     ) : (
//       item.quantity
//     )}
//   </Text>

//   <Pressable style={styles.qtyButton} onPress={() => handleQtyChange(item, true)}>
//     <Ionicons name="add-outline" size={hp(2.2)} />
//   </Pressable>
// </Animated.View>

// <Animated.Text style={[styles.itemTotal, priceAnimatedStyle]}>
//   ₹{item.price * item.quantity}
// </Animated.Text>

// {/* Ripple Layer */}
// <Animated.View style={[styles.ripple, rippleStyle]} />

//       {/* <Text style={styles.itemTotal}>₹{item.price * item.quantity}</Text> */}
//         {/* Coin Drop Animation */}
//   <Animated.View style={[styles.coinIcon, coinAnimatedStyle]}>
//     <Ionicons name="logo-bitcoin" size={20} color="gold" />
//   </Animated.View>
//  </Animated.View>
//   );}
// const totalItems = cartData.reduce((sum, item) => sum + item.quantity, 0);

//   return (

//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Pressable onPress={() => navigation.goBack()} style={{ paddingRight: wp(3) }}>
//           <Ionicons name="chevron-back-outline" size={hp(3.5)} />
//         </Pressable>
//         <Text style={styles.headerTitle}>Cart</Text>
//       </View>

//       {/* Address */}
//       <View style={styles.addressRow}>
//         <View style={{ flexDirection: "row", alignItems: "center" }}>
//           <Ionicons name="location-outline" size={hp(3.5)} />
//           <View style={{ marginLeft: wp(2) }}>
//             <Text>Home</Text>
//             <Text style={styles.addressSub}>HRS Layout, Bangalore</Text>
//           </View>
//         </View>
//         <Pressable style={styles.changeBtn}>
//           <Text style={styles.changeBtnText}>Change</Text>
//         </Pressable>
//       </View>

//       {/* Items header */}
//       <View style={styles.itemsHeader}>
//         <Text>Items ({totalItems})</Text>
//         <View style={{ flexDirection: "row", alignItems: "center" }}>
//           <Ionicons name="time-outline" size={hp(3)} />
//           <Text style={{ color: theme.PRIMARY_COLOR, marginLeft: 5 }}>
//             Delivery in 10 mins
//           </Text>
//         </View>
//       </View>

//       {/* Cart items */}
//       {loading ? (
//         <View style={styles.emptyCart}>
//           <ActivityIndicator size="large" color={theme.PRIMARY_COLOR} />
//         </View>
//       ) : cartData.length === 0 ? (
//         <View style={styles.emptyCart}>
//           <Text>No Cart Items Available</Text>
//         </View>
//       ) : (
//         <FlatList
//           data={cartData}
//           renderItem={renderItem}
//           keyExtractor={(item) => item.cartId.toString()}
//         />
//       )}

//       {/* Footer */}
//       {cartData.length > 0 && (
//         <View style={styles.footer}>
//           {/* Use Coins */}
//           <View style={styles.footerRow}>
//             <View>
//               <Text>Use Coins</Text>
//               <Text style={styles.footerSub}>
//                 Available: {availableCoins} coins (₹{availableCoins})
//               </Text>
//             </View>
//             <Switch
//               value={useCoins}
//               onValueChange={() => setUseCoins(!useCoins)}
//               trackColor={{ false: "#ccc", true: theme.PRIMARY_COLOR }}
//               thumbColor={"#fff"}
//             />
//           </View>

//           {/* Delivery Instruction */}
//           <TouchableOpacity style={styles.footerRow}>
//             <Text>Delivery Instruction</Text>
//             <Ionicons name="chevron-forward-outline" size={hp(2.5)} />
//           </TouchableOpacity>

//           {/* To Pay */}
//           <View style={styles.footerRow}>
//             <View>
//               <Text>To Pay</Text>
//               <Text style={{ color: "green" }}>Saving ₹50</Text>
//             </View>
//             <Text style={{ fontWeight: "bold" }}>
//               ₹
//               {useCoins
//                 ? (totalAmount - availableCoins).toFixed(2)
//                 : totalAmount.toFixed(2)}
//             </Text>
//           </View>

//           {/* Proceed to Payment */}
//           <Pressable
//             style={styles.proceedBtn}
//             onPress={() => setPaymentModalVisible(true)}
//           >
//             <Text style={styles.proceedBtnText}>
//               Proceed to Payment • ₹
//               {useCoins
//                 ? (totalAmount - availableCoins).toFixed(2)
//                 : totalAmount.toFixed(2)}
//             </Text>
//           </Pressable>
//         </View>
//       )}

//       {/* Payment Modal */}
//       <Modal
//         transparent
//         visible={paymentModalVisible}
//         animationType="slide"
//         onRequestClose={() => setPaymentModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <Text style={styles.modalTitle}>Choose Payment Method</Text>

//             <TouchableOpacity
//               style={styles.paymentOption}
//               onPress={handleCoinPayment}
//             >
//               <Ionicons name="wallet-outline" size={24} color={theme.PRIMARY_COLOR} />
//               <Text style={styles.paymentText}>Pay with ClickTea Coin</Text>
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.paymentOption}>
//               <Ionicons name="card-outline" size={24} color={theme.PRIMARY_COLOR} />
//               <Text style={styles.paymentText}>Pay Online</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[styles.paymentOption, !isSubscription && { opacity: 0.5 }]}
//               disabled={!isSubscription}
//               onPress={handlePayLater}
//             >
//               <Ionicons name="time-outline" size={24} color={theme.PRIMARY_COLOR} />
//               <Text style={styles.paymentText}>Pay Later</Text>
//             </TouchableOpacity>

//             <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
//               <Text style={styles.cancelText}>Cancel</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff" },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginHorizontal: wp(4),
//     marginTop: hp(2),
//   },
//   headerTitle: { fontSize: hp(2.2), fontWeight: "bold" },
//   addressRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginHorizontal: wp(4),
//     marginTop: hp(2),
//   },
//   addressSub: { fontSize: hp(1.4), color: "#5B5B5B" },
//   changeBtn: {
//     borderWidth: 1,
//     borderColor: "#ECECEC",
//     borderRadius: 6,
//     paddingHorizontal: wp(3),
//     justifyContent: "center",
//   },
//   changeBtnText: { fontSize: hp(1.4), color: "#5B5B5B" },
//   itemsHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginHorizontal: wp(4),
//     marginTop: hp(2),
//   },
//   emptyCart: { flex: 1, justifyContent: "center", alignItems: "center" },
//   itemRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: hp(1.5),
//     borderBottomWidth: 1,
//     borderColor: "#E8E8E8",
//     marginHorizontal: wp(4),
//   },
//   itemImage: {
//     height: hp(10),
//     width: wp(20),
//     borderRadius: 8,
//   },
//   itemName: { fontSize: hp(1.8), fontWeight: "500" },
//   itemPriceEach: { fontSize: hp(1.4), color: "#5B5B5B" },
//   qtyContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginHorizontal: wp(3),
//   },
//   qtyButton: {
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//     paddingVertical: hp(0.5),
//     paddingHorizontal: wp(1.5),
//     borderRadius: 4,
//   },
//   qtyText: { marginHorizontal: wp(2) },
//   itemTotal: { fontWeight: "bold", minWidth: wp(10), textAlign: "right" },
//   footer: {
//     borderTopWidth: 1,
//     borderColor: "#E8E8E8",
//     padding: wp(4),
//     backgroundColor: "#fff",
//   },
//   footerRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: hp(2),
//   },
//   footerSub: { fontSize: hp(1.4), color: "#5B5B5B" },
//   proceedBtn: {
//     backgroundColor: theme.PRIMARY_COLOR,
//     paddingVertical: hp(1.5),
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   proceedBtnText: { color: "#fff", fontWeight: "bold", fontSize: hp(2) },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "flex-end",
//   },
//   modalContainer: {
//     backgroundColor: "#fff",
//     padding: wp(5),
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//   },
//   modalTitle: { fontSize: hp(2.2), fontWeight: "bold", marginBottom: hp(2) },
//   paymentOption: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: hp(1.5),
//     borderBottomWidth: 1,
//     borderColor: "#E8E8E8",
//     gap: wp(3),
//   },
//   paymentText: { fontSize: hp(1.8) },
//   cancelText: {
//     color: "red",
//     textAlign: "center",
//     marginTop: hp(2),
//     fontWeight: "500",
//   },
//   coinIcon: {
//   position: "absolute",
//   right: wp(2),
//   bottom: hp(1),
// }
// });

// export default CartScreen;
// CartScreen.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
  Switch,
  Alert,
  ToastAndroid,
  Modal,
  TouchableOpacity,
  Pressable,
  InteractionManager,
  ListRenderItemInfo,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { hp, wp } from "@/src/assets/utils/responsive";
import { useSelector, useDispatch } from "react-redux";
import { selectSelectedShopId } from "@/src/Redux/Slice/selectedShopSlice";
import type { cartDataType } from "@/src/assets/types/userDataType";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BASE_URL } from "@/api";
import theme from "@/src/assets/colors/theme";
import {
  removeFromCartAsync,
  updateCartItemAsync,
} from "@/src/Redux/Slice/cartSlice";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
  withSequence,
  runOnJS,
} from "react-native-reanimated";
import CommonHeader from "@/src/Common/CommonHeader";

// -------------------------
// API helper (centralize axios config + interceptors if needed)
// -------------------------
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// Example interceptor placeholder (optional)
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("authToken");
    if (token && config.headers)
      config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err)
);

// -------------------------
// Memoized Cart Item Component
// -------------------------
type CartItemProps = {
  item: cartDataType;
  updatingId: number | null;
  onQtyChange: (item: cartDataType, increment: boolean) => void;
  triggerBounce: () => void;
  triggerCoinDrop: () => void;
  qtyScaleStyle: any;
  priceScaleStyle: any;
  rippleStyle: any;
  coinStyle: any;
  shakeStyle: any;
};

const CartItem = React.memo(
  function CartItem({
    item,
    updatingId,
    onQtyChange,
    triggerBounce,
    triggerCoinDrop,
    qtyScaleStyle,
    priceScaleStyle,
    rippleStyle,
    coinStyle,
    shakeStyle,
  }: CartItemProps) {
    const subtotal = useMemo(
      () => item.price * item.quantity,
      [item.price, item.quantity]
    );

    return (
      <Animated.View style={[styles.itemRow, shakeStyle]}>
        <Image
          source={{
            uri: `${api.defaults.baseURL}/uploads/menus/${item.imageUrl}`,
          }}
          style={styles.itemImage}
          resizeMode="cover"
        />
        <View style={styles.itemBody}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.menuName}
          </Text>
          <Text style={styles.itemPriceEach}>₹{item.price} each</Text>
        </View>

        <Animated.View style={[styles.qtyContainer, qtyScaleStyle]}>
          <Pressable
            accessible
            accessibilityLabel={`Decrease quantity of ${item.menuName}`}
            style={styles.qtyButton}
            onPress={() => {
              triggerBounce();
              onQtyChange(item, false);
            }}
          >
            <Ionicons name="remove-outline" size={hp(2.2)} />
          </Pressable>

          <View style={styles.qtyValueBox}>
            {updatingId === item.cartId ? (
              <ActivityIndicator size="small" color={theme.PRIMARY_COLOR} />
            ) : (
              <Text style={styles.qtyText}>{item.quantity}</Text>
            )}
          </View>

          <Pressable
            accessible
            accessibilityLabel={`Increase quantity of ${item.menuName}`}
            style={styles.qtyButton}
            onPress={() => {
              triggerBounce();
              onQtyChange(item, true);
              triggerCoinDrop();
            }}
          >
            <Ionicons name="add-outline" size={hp(2.2)} />
          </Pressable>
        </Animated.View>

        <Animated.Text style={[styles.itemTotal, priceScaleStyle]}>
          ₹{subtotal}
        </Animated.Text>

        <Animated.View
          style={[styles.coinIcon, coinStyle]}
          pointerEvents="none"
        >
          <Ionicons name="logo-bitcoin" size={20} color="gold" />
        </Animated.View>
      </Animated.View>
    );
  },
  // Re-render optimization: only re-render if these props change
  (prev, next) =>
    prev.updatingId === next.updatingId &&
    prev.item.quantity === next.item.quantity &&
    prev.item.price === next.item.price &&
    prev.item.imageUrl === next.item.imageUrl &&
    prev.item.menuName === next.item.menuName
);

// -------------------------
// Main Screen
// -------------------------
// const CartScreen: React.FC = () => {
//   const navigation: any = useNavigation();
//   const dispatch = useDispatch();
//   const shopId = useSelector(selectSelectedShopId);

//   const [cartData, setCartData] = useState<cartDataType[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [updatingId, setUpdatingId] = useState<number | null>(null);
//   const [useCoins, setUseCoins] = useState<boolean>(false);
//   const [availableCoins, setAvailableCoins] = useState<number>(50); // demo
//   const [paymentModalVisible, setPaymentModalVisible] = useState<boolean>(false);
//   const [isSubscription, setIsSubscription] = useState<boolean>(false);

//   // Refs
//   const debounceRef = useRef<number | null>(null);
//   const mountedRef = useRef(true);

//   // Reanimated shared values (kept local to avoid causing component re-renders)
//   const qtyScale = useSharedValue(1);
//   const priceScale = useSharedValue(1);
//   const rippleOpacity = useSharedValue(0);
//   const coinY = useSharedValue(-20);
//   const coinOpacity = useSharedValue(0);
//   const shakeX = useSharedValue(0);

//   // Animated styles
//   const qtyAnimatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: qtyScale.value }] }));
//   const priceAnimatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: priceScale.value }] }));
//   const rippleStyle = useAnimatedStyle(() => ({ opacity: rippleOpacity.value }));
//   const coinAnimatedStyle = useAnimatedStyle(() => ({
//     transform: [{ translateY: coinY.value }],
//     opacity: coinOpacity.value,
//   }));
//   const shakeAnimatedStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.value }] }));

//   // Life-cycle: mounted guard
//   useEffect(() => {
//     mountedRef.current = true;
//     return () => {
//       mountedRef.current = false;
//       if (debounceRef.current) {
//         clearTimeout(debounceRef.current);
//       }
//     };
//   }, []);

//   // Fetch data (kept as stable callback)
//   const fetchData = useCallback(async () => {
//     setLoading(true);
//     try {
//       const token = await AsyncStorage.getItem("authToken");
//       // using api helper will attach token via interceptor
//       const res = await api.get(`/api/cart/${shopId}`);
//       // Defer heavy setState to after interactions for smooth UX
//       InteractionManager.runAfterInteractions(() => {
//         if (!mountedRef.current) return;
//         setCartData(res.data || []);
//       });
//     } catch (err) {
//       console.error("Cart fetch error:", err);
//     } finally {
//       if (mountedRef.current) setLoading(false);
//     }
//   }, [shopId]);

//   const checkSubscription = useCallback(async () => {
//     try {
//       const res = await api.get("/api/profile");
//       if (!mountedRef.current) return;
//       setIsSubscription(res.data?.is_subscription === 1);
//     } catch (err) {
//       console.error("Subscription check failed:", err);
//     }
//   }, []);

//   // Fetch on focus (keeps behavior consistent)
//   useFocusEffect(
//     useCallback(() => {
//       fetchData();
//       checkSubscription();
//     }, [fetchData, checkSubscription])
//   );

//   // Total & items computed via useMemo — avoids recalculation on every render
//   const totalAmount = useMemo(
//     () => cartData.reduce((s, it) => s + it.quantity * it.price, 0),
//     [cartData]
//   );
//   const totalItems = useMemo(() => cartData.reduce((s, it) => s + it.quantity, 0), [cartData]);

//   // Animations triggers
//   const triggerBounce = useCallback(() => {
//     qtyScale.value = 1.2;
//     qtyScale.value = withSpring(1, { damping: 6, stiffness: 150 });
//     priceScale.value = 1.15;
//     priceScale.value = withSpring(1, { damping: 6, stiffness: 120 });
//     rippleOpacity.value = 0.35;
//     rippleOpacity.value = withTiming(0, { duration: 350, easing: Easing.out(Easing.ease) });
//   }, [priceScale, qtyScale, rippleOpacity]);

//   const triggerCoinDrop = useCallback(() => {
//     coinY.value = -20;
//     coinOpacity.value = 1;
//     coinY.value = withTiming(0, { duration: 420, easing: Easing.out(Easing.quad) });
//     coinOpacity.value = withTiming(0, { duration: 520 });
//   }, [coinY, coinOpacity]);

//   const triggerShake = useCallback(
//     (onComplete: () => void) => {
//       shakeX.value = withSequence(
//         withTiming(-6, { duration: 50 }),
//         withTiming(6, { duration: 50 }),
//         withTiming(-4, { duration: 50 }),
//         withTiming(0, { duration: 50 }, () => runOnJS(onComplete)())
//       );
//     },
//     [shakeX]
//   );

//   // Qty change (debounced via ref)
//   const handleQtyChange = useCallback(
//     async (item: cartDataType, increment: boolean) => {
//       const newQty = increment ? item.quantity + 1 : item.quantity - 1;
//       setUpdatingId(item.cartId ?? null);

//       // If decreasing to zero -> remove with shake and call to remove
//       if (newQty <= 0) {
//         triggerShake(async () => {
//           try {
//             dispatch(removeFromCartAsync(item.cartId!));
//             if (!mountedRef.current) return;
//             // update local state
//             setCartData((prev) => prev.filter((i) => i.cartId !== item.cartId));
//           } catch (err) {
//             console.error("Failed to remove cart item:", err);
//             ToastAndroid.show("Failed to remove item", ToastAndroid.SHORT);
//           } finally {
//             if (mountedRef.current) setUpdatingId(null);
//           }
//         });
//         return;
//       }

//       // otherwise do debounced update
//       if (debounceRef.current) {
//         clearTimeout(debounceRef.current);
//       }
//       // small optimistic update to improve perceived speed
//       setCartData((prev) => prev.map((i) => (i.cartId === item.cartId ? { ...i, quantity: newQty } : i)));

//       debounceRef.current = setTimeout(async () => {
//         try {
//           dispatch( // remove await 12/08/2025
//             updateCartItemAsync({
//               cartId: item.cartId!,
//               quantity: newQty,
//               // keep payload minimal here; backend expects only changed fields
//             })
//           );
//         } catch (err) {
//           console.error("Failed to update qty:", err);
//           // revert optimistic update if failure
//           if (mountedRef.current) {
//             setCartData((prev) => prev.map((i) => (i.cartId === item.cartId ? { ...i, quantity: item.quantity } : i)));
//             ToastAndroid.show("Failed to update quantity", ToastAndroid.SHORT);
//           }
//         } finally {
//           if (mountedRef.current) setUpdatingId(null);
//         }
//       }, 350) as unknown as number;
//     },
//     [dispatch, triggerShake]
//   );

//   // Payment handlers (use api helper)
//   const handleCoinPayment = useCallback(async () => {
//     try {
//       const payload = {
//         totalAmount,
//         shopId,
//         delivery_note: "",
//         cartItems: cartData.map((it) => ({
//           menuId: it.menuId,
//           quantity: it.quantity,
//           price: it.price,
//           addons: it.addons || [],
//         })),
//       };
//       const res = await api.post("/api/coin/pay", payload);
//       if (res.status === 200) {
//         setPaymentModalVisible(false);
//         ToastAndroid.show("Order placed using coins!", ToastAndroid.SHORT);
//         setCartData([]);
//         navigation.navigate("bottomTabScreen");
//       } else {
//         throw new Error("Coin payment failed");
//       }
//     } catch (err: any) {
//       console.error("Coin payment error:", err?.response?.data || err.message);
//       Alert.alert("Payment failed", err?.response?.data?.message || "Try again");
//     }
//   }, [cartData, navigation, shopId, totalAmount]);

//   const handlePayLater = useCallback(async () => {
//     try {
//       const cartItems = cartData.map((item) => ({
//         menuId: item.menuId,
//         quantity: item.quantity,
//         price: item.price,
//         addons: item.addons || [],
//         subtotal: item.price * item.quantity,
//         shopId,
//       }));
//       const payload = { cartItems, delivery_note: "" };
//       const { data } = await api.post("/api/orders/pay-later", payload);
//       Alert.alert("Success 🎉", `Pay Later order placed.\nTotal: ₹${data.totalAmount}`, [
//         {
//           text: "OK",
//           onPress: () => {
//             setPaymentModalVisible(false);
//             setCartData([]);
//             navigation.navigate("orderScreen");
//           },
//         },
//       ]);
//     } catch (err: any) {
//       console.error("PayLater error:", err?.response?.data || err);
//       const msg = err?.response?.data?.message || "Something went wrong placing the order.";
//       Alert.alert("Error", msg);
//     }
//   }, [cartData, navigation, shopId]);

//   // FlatList getItemLayout — helps performance if item height predictable.
//   // Estimate item height (image height + paddings) — adjust if you change styles.
//   const ITEM_HEIGHT = Math.round(hp(10) + hp(3)); // image height + paddings
//   const getItemLayout = useCallback((_data: any, index: number) => {
//     return { length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index };
//   }, []);

//   // renderItem stable callback
//   const renderItem = useCallback(
//     ({ item }: ListRenderItemInfo<cartDataType>) => {
//       return (
//         <CartItem
//           item={item}
//           updatingId={updatingId}
//           onQtyChange={handleQtyChange}
//           triggerBounce={triggerBounce}
//           triggerCoinDrop={triggerCoinDrop}
//           qtyScaleStyle={qtyAnimatedStyle}
//           priceScaleStyle={priceAnimatedStyle}
//           rippleStyle={rippleStyle}
//           coinStyle={coinAnimatedStyle}
//           shakeStyle={shakeAnimatedStyle}
//         />
//       );
//     },
//     [
//       handleQtyChange,
//       updatingId,
//       triggerBounce,
//       triggerCoinDrop,
//       qtyAnimatedStyle,
//       priceAnimatedStyle,
//       rippleStyle,
//       coinAnimatedStyle,
//       shakeAnimatedStyle,
//     ]
//   );

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
//           <Ionicons name="chevron-back-outline" size={hp(3.5)} />
//         </Pressable>
//         <Text style={styles.headerTitle}>Cart</Text>
//       </View>

//       {/* Address row */}
//       <View style={styles.addressRow}>
//         <View style={styles.addressLeft}>
//           <Ionicons name="location-outline" size={hp(3.5)} />
//           <View style={{ marginLeft: wp(2) }}>
//             <Text>Home</Text>
//             <Text style={styles.addressSub}>HRS Layout, Bangalore</Text>
//           </View>
//         </View>
//         <Pressable style={styles.changeBtn}>
//           <Text style={styles.changeBtnText}>Change</Text>
//         </Pressable>
//       </View>

//       {/* Items header */}
//       <View style={styles.itemsHeader}>
//         <Text>Items ({totalItems})</Text>
//         <View style={styles.deliveryInfo}>
//           <Ionicons name="time-outline" size={hp(3)} />
//           <Text style={styles.deliveryText}>Delivery in 10 mins</Text>
//         </View>
//       </View>

//       {/* Content */}
//       {loading ? (
//         <View style={styles.emptyCart}>
//           <ActivityIndicator size="large" color={theme.PRIMARY_COLOR} />
//         </View>
//       ) : cartData.length === 0 ? (
//         <View style={styles.emptyCart}>
//           <Text>No Cart Items Available</Text>
//         </View>
//       ) : (
//         <FlatList
//           data={cartData}
//           renderItem={renderItem}
//           keyExtractor={(it) => `${it.cartId}`}
//           contentContainerStyle={{ paddingBottom: hp(24) }}
//           initialNumToRender={6}
//           maxToRenderPerBatch={8}
//           windowSize={9}
//           removeClippedSubviews
//           getItemLayout={getItemLayout}
//         />
//       )}

//       {/* Footer */}
//       {cartData.length > 0 && (
//         <View style={styles.footer}>
//           <View style={styles.footerRow}>
//             <View>
//               <Text style={styles.deliveryInformationText}>Use Coins</Text>
//               <Text style={styles.deliveryPartnerText}>
//                 Available: {availableCoins} coins (₹{availableCoins})
//               </Text>
//             </View>
//             <Switch
//               value={useCoins}
//               onValueChange={(v) => setUseCoins(v)}
//               trackColor={{ false: "#ccc", true: theme.PRIMARY_COLOR }}
//               thumbColor={"#fff"}
//             />
//           </View>

//           <TouchableOpacity style={styles.footerRow}>
//             <View style={{flexDirection:"column"}}>
//             <Text style={styles.deliveryInformationText}>Delivery Instruction</Text>
// <Text style={styles.deliveryPartnerText}>Delivery partner will be notified</Text>
//             </View>
//             <Ionicons name="chevron-forward-outline" size={hp(2.5)} />
//           </TouchableOpacity>

//           <View style={styles.footerRow}>
//             <View>
//               <Text style={styles.deliveryInformationText}>To Pay</Text>
//               <Text style={styles.deliveryPartnerText}>Incl. all taxes and charges</Text>
//             </View>
//             <Text style={styles.toPayAmount}>
//               ₹{useCoins ? Math.max(0, totalAmount - availableCoins).toFixed(2) : totalAmount.toFixed(2)}
//             </Text>
//           </View>

//           <Pressable style={styles.proceedBtn} onPress={() => setPaymentModalVisible(true)}>
//             <Text style={styles.proceedBtnText}>
//               Proceed to Payment • ₹{useCoins ? Math.max(0, totalAmount - availableCoins).toFixed(2) : totalAmount.toFixed(2)}
//             </Text>
//           </Pressable>
//         </View>
//       )}

//       {/* Payment Modal */}
//       <Modal transparent visible={paymentModalVisible} animationType="slide" onRequestClose={() => setPaymentModalVisible(false)}>
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <Text style={styles.modalTitle}>Choose Payment Method</Text>

//             <TouchableOpacity style={styles.paymentOption} onPress={handleCoinPayment}>
//               <Ionicons name="wallet-outline" size={24} color={theme.PRIMARY_COLOR} />
//               <Text style={styles.paymentText}>Pay with ClickTea Coin</Text>
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.paymentOption}>
//               <Ionicons name="card-outline" size={24} color={theme.PRIMARY_COLOR} />
//               <Text style={styles.paymentText}>Pay Online</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[styles.paymentOption, !isSubscription && { opacity: 0.5 }]}
//               disabled={!isSubscription}
//               onPress={handlePayLater}
//             >
//               <Ionicons name="time-outline" size={24} color={theme.PRIMARY_COLOR} />
//               <Text style={styles.paymentText}>Pay Later</Text>
//             </TouchableOpacity>

//             <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
//               <Text style={styles.cancelText}>Cancel</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };
const CartScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const shopId = useSelector(selectSelectedShopId);

  const [cartData, setCartData] = useState<cartDataType[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [useCoins, setUseCoins] = useState(false);
  const [availableCoins, setAvailableCoins] = useState(50);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [isSubscription, setIsSubscription] = useState(false);

  // Refs
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Reanimated shared values for animations
  const qtyScale = useSharedValue(1);
  const priceScale = useSharedValue(1);
  const rippleOpacity = useSharedValue(0);
  const coinY = useSharedValue(-20);
  const coinOpacity = useSharedValue(0);
  const shakeX = useSharedValue(0);

  // Animated styles
  const qtyAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: qtyScale.value }],
  }));
  const priceAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: priceScale.value }],
  }));
  const rippleStyle = useAnimatedStyle(() => ({
    opacity: rippleOpacity.value,
  }));
  const coinAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: coinY.value }],
    opacity: coinOpacity.value,
  }));
  const shakeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Fetch cart data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      await AsyncStorage.getItem("authToken"); // token used via api helper interceptor
      const res = await api.get(`/api/cart/${shopId}`);
      InteractionManager.runAfterInteractions(() => {
        if (!mountedRef.current) return;
        setCartData(res.data || []);
      });
    } catch (err) {
      console.error("Cart fetch error:", err);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [shopId]);

  // Check subscription status
  const checkSubscription = useCallback(async () => {
    try {
      const res = await api.get("/api/profile");
      if (!mountedRef.current) return;
      setIsSubscription(res.data?.is_subscription === 1);
    } catch (err) {
      console.error("Subscription check failed:", err);
    }
  }, []);

  // Refresh data on screen focus
  useFocusEffect(
    useCallback(() => {
      fetchData();
      checkSubscription();
    }, [fetchData, checkSubscription])
  );

  // Calculate totals
  const totalAmount = useMemo(
    () => cartData.reduce((sum, it) => sum + it.quantity * it.price, 0),
    [cartData]
  );
  const totalItems = useMemo(
    () => cartData.reduce((sum, it) => sum + it.quantity, 0),
    [cartData]
  );

  // Animation triggers
  const triggerBounce = useCallback(() => {
    qtyScale.value = 1.2;
    qtyScale.value = withSpring(1, { damping: 6, stiffness: 150 });
    priceScale.value = 1.15;
    priceScale.value = withSpring(1, { damping: 6, stiffness: 120 });
    rippleOpacity.value = 0.35;
    rippleOpacity.value = withTiming(0, {
      duration: 350,
      easing: Easing.out(Easing.ease),
    });
  }, []);

  const triggerCoinDrop = useCallback(() => {
    coinY.value = -20;
    coinOpacity.value = 1;
    coinY.value = withTiming(0, {
      duration: 420,
      easing: Easing.out(Easing.quad),
    });
    coinOpacity.value = withTiming(0, { duration: 520 });
  }, []);

  const triggerShake = useCallback((onComplete: () => void) => {
    shakeX.value = withSequence(
      withTiming(-6, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(-4, { duration: 50 }),
      withTiming(0, { duration: 50 }, () => runOnJS(onComplete)())
    );
  }, []);

  // Qty change handler (with debounce)
  const handleQtyChange = useCallback(
    (item: cartDataType, increment: boolean) => {
      const newQty = increment ? item.quantity + 1 : item.quantity - 1;
      setUpdatingId(item.cartId ?? null);

      if (newQty <= 0) {
        triggerShake(async () => {
          try {
            await dispatch(removeFromCartAsync(item.cartId!));
            if (!mountedRef.current) return;
            setCartData((prev) => prev.filter((i) => i.cartId !== item.cartId));
          } catch (err) {
            console.error("Failed to remove cart item:", err);
            ToastAndroid.show("Failed to remove item", ToastAndroid.SHORT);
          } finally {
            if (mountedRef.current) setUpdatingId(null);
          }
        });
        return;
      }

      if (debounceRef.current) clearTimeout(debounceRef.current);

      // Optimistic UI update
      setCartData((prev) =>
        prev.map((i) =>
          i.cartId === item.cartId ? { ...i, quantity: newQty } : i
        )
      );

      debounceRef.current = setTimeout(async () => {
        try {
          await dispatch(
            updateCartItemAsync({
              cartId: item.cartId!,
              quantity: newQty,
            })
          );
        } catch (err) {
          console.error("Failed to update qty:", err);
          if (mountedRef.current) {
            setCartData((prev) =>
              prev.map((i) =>
                i.cartId === item.cartId ? { ...i, quantity: item.quantity } : i
              )
            );
            ToastAndroid.show("Failed to update quantity", ToastAndroid.SHORT);
          }
        } finally {
          if (mountedRef.current) setUpdatingId(null);
        }
      }, 350);
    },
    [dispatch, triggerShake]
  );

  // Payment handlers
  const handleCoinPayment = useCallback(async () => {
    try {
      const payload = {
        totalAmount,
        shopId,
        delivery_note: "",
        cartItems: cartData.map((it) => ({
          menuId: it.menuId,
          quantity: it.quantity,
          price: it.price,
          addons: it.addons || [],
        })),
      };
      const res = await api.post("/api/coin/pay", payload);
      if (res.status === 200) {
        setPaymentModalVisible(false);
        ToastAndroid.show("Order placed using coins!", ToastAndroid.SHORT);
        setCartData([]);
        navigation.navigate("bottomTabScreen");
      } else {
        throw new Error("Coin payment failed");
      }
    } catch (err: any) {
      console.error("Coin payment error:", err?.response?.data || err.message);
      Alert.alert(
        "Payment failed",
        err?.response?.data?.message || "Try again"
      );
    }
  }, [cartData, navigation, shopId, totalAmount]);

  const handlePayLater = useCallback(async () => {
    try {
      const cartItems = cartData.map((item) => ({
        menuId: item.menuId,
        quantity: item.quantity,
        price: item.price,
        addons: item.addons || [],
        subtotal: item.price * item.quantity,
        shopId,
      }));
      const payload = { cartItems, delivery_note: "" };
      const { data } = await api.post("/api/orders/pay-later", payload);
      Alert.alert(
        "Success 🎉",
        `Pay Later order placed.\nTotal: ₹${data.totalAmount}`,
        [
          {
            text: "OK",
            onPress: () => {
              setPaymentModalVisible(false);
              setCartData([]);
              navigation.navigate("orderScreen");
            },
          },
        ]
      );
    } catch (err: any) {
      console.error("PayLater error:", err?.response?.data || err);
      const msg =
        err?.response?.data?.message ||
        "Something went wrong placing the order.";
      Alert.alert("Error", msg);
    }
  }, [cartData, navigation, shopId]);

  // FlatList optimization
  const ITEM_HEIGHT = Math.round(hp(10) + hp(3));
  const getItemLayout = useCallback(
    (_data: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  const renderItem = useCallback(
    ({ item }: { item: cartDataType }) => (
      <CartItem
        item={item}
        updatingId={updatingId}
        onQtyChange={handleQtyChange}
        triggerBounce={triggerBounce}
        triggerCoinDrop={triggerCoinDrop}
        qtyScaleStyle={qtyAnimatedStyle}
        priceScaleStyle={priceAnimatedStyle}
        rippleStyle={rippleStyle}
        coinStyle={coinAnimatedStyle}
        shakeStyle={shakeAnimatedStyle}
      />
    ),
    [
      updatingId,
      handleQtyChange,
      triggerBounce,
      triggerCoinDrop,
      qtyAnimatedStyle,
      priceAnimatedStyle,
      rippleStyle,
      coinAnimatedStyle,
      shakeAnimatedStyle,
    ]
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <CommonHeader title={"Cart"} />
      {/* Address row */}
      <View style={styles.addressRow}>
        <View style={styles.addressLeft}>
          <Ionicons name="location-outline" size={hp(3.5)} />
          <View style={{ marginLeft: wp(2) }}>
            <Text>Home</Text>
            <Text style={styles.addressSub}>HRS Layout, Bangalore</Text>
          </View>
        </View>
        <Pressable
          style={styles.changeBtn}
          onPress={() => {
            navigation.navigate("changeAddressScreen");
          }}
        >
          <Text style={styles.changeBtnText}>Change</Text>
        </Pressable>
      </View>

      {/* Items header */}
      <View style={styles.itemsHeader}>
        <Text>Items ({totalItems})</Text>
        <View style={styles.deliveryInfo}>
          <Ionicons name="time-outline" size={hp(3)} />
          <Text style={styles.deliveryText}>Delivery in 10 mins</Text>
        </View>
      </View>

      {/* Cart Content */}
      {loading ? (
        <View style={styles.emptyCart}>
          <ActivityIndicator size="large" color={theme.PRIMARY_COLOR} />
        </View>
      ) : cartData.length === 0 ? (
        <View style={styles.emptyCart}>
          <Text>No Cart Items Available</Text>
        </View>
      ) : (
        <FlatList
          data={cartData}
          renderItem={renderItem}
          keyExtractor={(it) => `${it.cartId}`}
          contentContainerStyle={{ paddingBottom: hp(24) }}
          initialNumToRender={6}
          maxToRenderPerBatch={8}
          windowSize={9}
          removeClippedSubviews
          getItemLayout={getItemLayout}
        />
      )}

      {/* Footer */}
      {cartData.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <View>
              <Text style={styles.deliveryInformationText}>Use Coins</Text>
              <Text style={styles.deliveryPartnerText}>
                Available: {availableCoins} coins (₹{availableCoins})
              </Text>
            </View>
            <Switch
              value={useCoins}
              onValueChange={setUseCoins}
              trackColor={{ false: "#ccc", true: theme.PRIMARY_COLOR }}
              thumbColor="#fff"
            />
          </View>

          <Pressable style={styles.footerRow}>
            <View style={{ flexDirection: "column" }}>
              <Text style={styles.deliveryInformationText}>
                Delivery Instruction
              </Text>
              <Text style={styles.deliveryPartnerText}>
                Delivery partner will be notified
              </Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={hp(2.5)} />
          </Pressable>

          <View style={styles.footerRow}>
            <View>
              <Text style={styles.deliveryInformationText}>To Pay</Text>
              <Text style={styles.deliveryPartnerText}>
                Incl. all taxes and charges
              </Text>
            </View>
            <Text style={styles.toPayAmount}>
              ₹
              {useCoins
                ? Math.max(0, totalAmount - availableCoins).toFixed(2)
                : totalAmount.toFixed(2)}
            </Text>
          </View>

          <Pressable
            style={styles.proceedBtn}
            onPress={() => setPaymentModalVisible(true)}
          >
            <Text style={styles.proceedBtnText}>
              Proceed to Payment • ₹
              {useCoins
                ? Math.max(0, totalAmount - availableCoins).toFixed(2)
                : totalAmount.toFixed(2)}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Payment Modal */}
      <Modal
        transparent
        visible={paymentModalVisible}
        animationType="slide"
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Choose Payment Method</Text>

            <Pressable style={styles.paymentOption} onPress={handleCoinPayment}>
              <Ionicons
                name="wallet-outline"
                size={24}
                color={theme.PRIMARY_COLOR}
              />
              <Text style={styles.paymentText}>Pay with ClickTea Coin</Text>
            </Pressable>

            <Pressable style={styles.paymentOption}>
              <Ionicons
                name="card-outline"
                size={24}
                color={theme.PRIMARY_COLOR}
              />
              <Text style={styles.paymentText}>Pay Online</Text>
            </Pressable>

            <Pressable
              style={[
                styles.paymentOption,
                !isSubscription && { opacity: 0.5 },
              ]}
              disabled={!isSubscription}
              onPress={handlePayLater}
            >
              <Ionicons
                name="time-outline"
                size={24}
                color={theme.PRIMARY_COLOR}
              />
              <Text style={styles.paymentText}>Pay Later</Text>
            </Pressable>

            <Pressable onPress={() => setPaymentModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CartScreen;

// -------------------------
// Styles
// -------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  // header: {
  //   flexDirection: "row",
  //   alignItems: "center",
  //   marginHorizontal: wp(4),
  //   marginTop: hp(2),
  // },
  // backBtn: { paddingRight: wp(3) },
  // headerTitle: { fontSize: hp(2.2), fontWeight: "bold" },
  addressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: wp(4),
    marginTop: hp(2),
  },
  addressLeft: { flexDirection: "row", alignItems: "center" },
  addressSub: { fontSize: hp(1.4), color: "#5B5B5B" },
  changeBtn: {
    borderWidth: 1,
    borderColor: "#ECECEC",
    borderRadius: 6,
    paddingHorizontal: wp(3),
    justifyContent: "center",
  },
  changeBtnText: { fontSize: hp(1.4), color: "#5B5B5B" },
  itemsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: wp(4),
    marginTop: hp(2),
  },
  deliveryInfo: { flexDirection: "row", alignItems: "center" },
  deliveryText: { color: theme.PRIMARY_COLOR, marginLeft: 5 },
  emptyCart: { flex: 1, justifyContent: "center", alignItems: "center" },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderColor: "#E8E8E8",
    marginHorizontal: wp(4),
    minHeight: hp(12),
  },
  itemImage: {
    height: hp(10),
    width: wp(20),
    borderRadius: 8,
  },
  itemBody: { flex: 1, marginLeft: wp(3) },
  itemName: { fontSize: hp(1.8), fontWeight: "500" },
  itemPriceEach: { fontSize: hp(1.4), color: "#5B5B5B" },

  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: wp(1),
    justifyContent: "center",
  },
  qtyButton: {
    borderWidth: 1,
    borderColor: "#E8E8E8",
    paddingVertical: hp(0.5),
    paddingHorizontal: wp(1.5),
    borderRadius: 4,
  },
  qtyValueBox: {
    minWidth: wp(10),
    alignItems: "center",
    justifyContent: "center",
    // marginHorizontal: wp(2),
  },
  qtyText: { marginHorizontal: wp(2) },
  itemTotal: {
    fontWeight: "bold",
    minWidth: wp(12),
    textAlign: "right",
    marginLeft: wp(2),
  },

  ripple: {
    position: "absolute",
    left: wp(26),
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: theme.PRIMARY_COLOR,
    opacity: 0.0,
  },
  coinIcon: {
    position: "absolute",
    right: wp(2),
    bottom: hp(1),
  },

  footer: {
    borderTopWidth: 1,
    borderColor: "#E8E8E8",
    padding: wp(4),
    backgroundColor: "#fff",
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(2),
  },
  footerSub: { fontSize: hp(1.4), color: "#5B5B5B" },
  proceedBtn: {
    backgroundColor: theme.PRIMARY_COLOR,
    paddingVertical: hp(1.5),
    borderRadius: 8,
    alignItems: "center",
  },
  proceedBtnText: { color: "#fff", fontWeight: "bold", fontSize: hp(2) },
  toPayAmount: { fontWeight: "bold" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: wp(5),
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: { fontSize: hp(2.2), fontWeight: "bold", marginBottom: hp(2) },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderColor: "#E8E8E8",
    gap: wp(3),
  },
  paymentText: { fontSize: hp(1.8) },
  cancelText: {
    color: "red",
    textAlign: "center",
    marginTop: hp(2),
    fontWeight: "500",
  },
  deliveryPartnerText: {
    color: "#AAAAAA",
    fontSize: hp(1),
    paddingLeft: wp(0.2),
  },
  deliveryInformationText: {
    color: "black",
    fontSize: hp(1.6),
    fontWeight: "500",
  },
});
