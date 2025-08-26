// src/screens/Tabs/Cart/CartScreen.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Pressable,
  InteractionManager,
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
import { removeFromCartAsync, updateCartItemAsync } from "@/src/Redux/Slice/cartSlice";
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
import { Address, useAddress } from "@/src/context/addressContext";

// gorhom imports
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

// -------------------------
// axios instance (centralized)
// -------------------------
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("authToken");
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err)
);

// -------------------------
// CartItem component (unchanged, kept for brevity)
// -------------------------
type CartItemProps = {
  item: cartDataType;
  updatingId: number | null;
  onQtyChange: (item: cartDataType, increment: boolean) => void;
  onRemoveRequested: (cartId: number) => void;
};

const CartItem = React.memo(
  function CartItem({ item, updatingId, onQtyChange, onRemoveRequested }: CartItemProps) {
    const subtotal = useMemo(() => item.price * item.quantity, [item.price, item.quantity]);

    // Shared values
    const qtyScale = useSharedValue(1);
    const priceScale = useSharedValue(1);
    const coinY = useSharedValue(-20);
    const coinOpacity = useSharedValue(0);
    const shakeX = useSharedValue(0);

    const qtyStyle = useAnimatedStyle(() => ({ transform: [{ scale: qtyScale.value }] }));
    const priceStyle = useAnimatedStyle(() => ({ transform: [{ scale: priceScale.value }] }));
    const coinStyle = useAnimatedStyle(() => ({ transform: [{ translateY: coinY.value }], opacity: coinOpacity.value }));
    const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.value }] }));

    const triggerBounce = () => {
      qtyScale.value = 1.2;
      qtyScale.value = withSpring(1, { damping: 6, stiffness: 150 });
      priceScale.value = 1.15;
      priceScale.value = withSpring(1, { damping: 6, stiffness: 120 });
    };

    const triggerCoinDrop = () => {
      coinY.value = -20;
      coinOpacity.value = 1;
      coinY.value = withTiming(0, { duration: 420, easing: Easing.out(Easing.quad) });
      coinOpacity.value = withTiming(0, { duration: 520 });
    };

    const triggerShakeThenRemove = (cartId: number) => {
      shakeX.value = withSequence(
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 50 }),
        withTiming(-4, { duration: 50 }),
        withTiming(0, { duration: 50 }, () => {
          runOnJS(onRemoveRequested)(cartId);
        })
      );
    };

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

        <Animated.View style={[styles.qtyContainer, qtyStyle]}>
          <Pressable
            accessible
            accessibilityLabel={`Decrease quantity of ${item.menuName}`}
            style={styles.qtyButton}
            onPress={() => {
              if (item.quantity <= 1) {
                triggerShakeThenRemove(item.cartId);
              } else {
                triggerBounce();
                onQtyChange(item, false);
              }
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

        <Animated.Text style={[styles.itemTotal, priceStyle]}>₹{subtotal}</Animated.Text>

        <Animated.View style={[styles.coinIcon, coinStyle]} pointerEvents="none">
          <Ionicons name="logo-bitcoin" size={20} color="gold" />
        </Animated.View>
      </Animated.View>
    );
  },
  (prev, next) =>
    prev.updatingId === next.updatingId &&
    prev.item.quantity === next.item.quantity &&
    prev.item.price === next.item.price &&
    prev.item.imageUrl === next.item.imageUrl &&
    prev.item.menuName === next.item.menuName &&
    prev.item.cartId === next.item.cartId
);

// -------------------------
// CartScreen with BottomSheetModal integration
// -------------------------
const CartScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const shopId = useSelector(selectSelectedShopId);

  const [cartData, setCartData] = useState<cartDataType[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [useCoins, setUseCoins] = useState(false);
  const [availableCoins, setAvailableCoins] = useState(50);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false); // toggles sheet present/dismiss
  const [modalType, setModalType] = useState<"toPay" | "proceed">("proceed");
  const [isSubscription, setIsSubscription] = useState(false);

  const { selectedAddress } = useAddress();
  const formatAddressLine = (addr: Partial<Address> | null) => {
    if (!addr) return "";
    const a = addr as any;
    const parts = [];
    if (a.houseNumber) parts.push(a.houseNumber);
    if (a.roadArea) parts.push(a.roadArea);
    if (a.city) parts.push(a.city);
    if (a.state) parts.push(a.state);
    if (a.pincode) parts.push(a.pincode);
    return parts.filter(Boolean).join(", ");
  };

  // refs
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  // bottom sheet ref & snap points
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => [hp(45)], []); // sheet height ~45% of screen

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // open/dismiss sheet when paymentModalVisible toggles
  useEffect(() => {
    if (paymentModalVisible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [paymentModalVisible]);

  // Fetch cart
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      await AsyncStorage.getItem("authToken");
      const res = await api.get(`/api/cart/${shopId}`);
      InteractionManager.runAfterInteractions(() => {
        if (!mountedRef.current) return;
        setCartData(res.data || []);
      });
    } catch (err) {
      console.error("Cart fetch error:", err);
      ToastAndroid.show("Failed to load cart", ToastAndroid.SHORT);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [shopId]);

  // Check subscription
  const checkSubscription = useCallback(async () => {
    try {
      const res = await api.get("/api/profile");
      if (!mountedRef.current) return;
      setIsSubscription(res.data?.is_subscription === 1);
    } catch (err) {
      console.error("Subscription check failed:", err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
      checkSubscription();
    }, [fetchData, checkSubscription])
  );

  const totalAmount = useMemo(() => cartData.reduce((sum, it) => sum + it.quantity * it.price, 0), [cartData]);
  const totalItems = useMemo(() => cartData.reduce((sum, it) => sum + it.quantity, 0), [cartData]);

  // helper to extract commonly named fields from server responses
  const extractOrderInfo = (resData: any) => {
    if (!resData) return { orderId: null, vendorIds: [], adminIds: [], notifiedByServer: false };
    const orderId =
      resData.order?.id ||
      resData.orderId ||
      resData.order_id ||
      resData.data?.orderId ||
      resData.data?.order?.id ||
      null;

    const vendorIds = resData.vendorIds || resData.vendor_ids || resData.data?.vendorIds || [];
    const adminIds = resData.adminIds || resData.admin_ids || resData.data?.adminIds || [];

    const notifiedByServer = !!resData.notifiedByServer || !!resData.data?.notifiedByServer;

    return { orderId, vendorIds, adminIds, notifiedByServer };
  };

  // Qty change with optimistic update + debounce
  const handleQtyChange = useCallback(
    (item: cartDataType, increment: boolean) => {
      const newQty = increment ? item.quantity + 1 : item.quantity - 1;
      setUpdatingId(item.cartId ?? null);

      if (newQty <= 0) {
        return;
      }

      if (debounceRef.current) clearTimeout(debounceRef.current);

      // optimistic UI
      setCartData((prev) => prev.map((i) => (i.cartId === item.cartId ? { ...i, quantity: newQty } : i)));

      debounceRef.current = setTimeout(async () => {
        try {
          await dispatch(updateCartItemAsync({ cartId: item.cartId!, quantity: newQty }));
        } catch (err) {
          console.error("Failed to update qty:", err);
          if (mountedRef.current) {
            setCartData((prev) =>
              prev.map((i) => (i.cartId === item.cartId ? { ...i, quantity: item.quantity } : i))
            );
            ToastAndroid.show("Failed to update quantity", ToastAndroid.SHORT);
          }
        } finally {
          if (mountedRef.current) setUpdatingId(null);
        }
      }, 350);
    },
    [dispatch]
  );

  // handle remove (called from child after shake animation)
  const handleRemoveRequested = useCallback(
    async (cartId: number) => {
      setUpdatingId(cartId);
      try {
        await dispatch(removeFromCartAsync(cartId));
        if (!mountedRef.current) return;
        setCartData((prev) => prev.filter((i) => i.cartId !== cartId));
        ToastAndroid.show("Item removed", ToastAndroid.SHORT);
      } catch (err) {
        console.error("Failed to remove cart item:", err);
        ToastAndroid.show("Failed to remove item", ToastAndroid.SHORT);
      } finally {
        if (mountedRef.current) setUpdatingId(null);
      }
    },
    [dispatch]
  );

  // Payment handlers (safe: disables buttons, uses InteractionManager)
  const [paymentLoading, setPaymentLoading] = useState(false);

  const handleCoinPayment = useCallback(async () => {
    if (paymentLoading) return;
    setPaymentLoading(true);

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
        const { orderId, vendorIds, adminIds, notifiedByServer } = extractOrderInfo(res.data || res);

        // close sheet + clear UI
        setPaymentModalVisible(false);
        setCartData([]);

        ToastAndroid.show("Order placed using coins!", ToastAndroid.SHORT);

      
try {
  const orderRes = await api.post("/api/orders/place", payload);
  console.log("orderRes:", orderRes.data);
} catch (err: any) {
  // helpful Axios debug
  if (err.isAxiosError) {
    console.error("Order create axios error ->", {
      message: err.message,
      code: err.code,
      config: err.config && { url: err.config.url, method: err.config.method, timeout: err.config.timeout },
      request: !!err.request, // whether request was sent
      response: err.response ? { status: err.response.status, data: err.response.data } : null,
      toJSON: err.toJSON ? err.toJSON() : null,
    });
  } else {
    console.error("Order create error (non-axios):", err);
  }
}
        InteractionManager.runAfterInteractions(() => {
          navigation.navigate("orderScreen");
        });
      } else {
        throw new Error(res?.data?.message || "Coin payment failed");
      }
    } catch (err: any) {
      console.error("Coin payment error:", err?.response?.data || err.message || err);
      Alert.alert("Payment failed", err?.response?.data?.message || "Try again");
    } finally {
      if (mountedRef.current) setPaymentLoading(false);
    }
  }, [paymentLoading, cartData, totalAmount, shopId, navigation]);

  const handlePayLater = useCallback(async () => {
    if (paymentLoading) return;
    setPaymentLoading(true);

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

      setPaymentModalVisible(false);
      setCartData([]);

      Alert.alert("Success 🎉", `Pay Later order placed.\nTotal: ₹${data.totalAmount}`, [
        {
          text: "OK",
          onPress: () => InteractionManager.runAfterInteractions(() => navigation.navigate("orderScreen")),
        },
      ]);
    } catch (err: any) {
      console.error("PayLater error:", err?.response?.data || err);
      const msg = err?.response?.data?.message || "Something went wrong placing the order.";
      Alert.alert("Error", msg);
    } finally {
      if (mountedRef.current) setPaymentLoading(false);
    }
  }, [paymentLoading, cartData, shopId, navigation]);

  // FlatList optimizations
  const ITEM_HEIGHT = Math.round(hp(10) + hp(3));
  const getItemLayout = useCallback((_data: any, index: number) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }), []);

  const renderItem = useCallback(
    ({ item }: { item: cartDataType }) => (
      <CartItem item={item} updatingId={updatingId} onQtyChange={handleQtyChange} onRemoveRequested={handleRemoveRequested} />
    ),
    [updatingId, handleQtyChange, handleRemoveRequested]
  );

  // helper to open sheet with correct type
  const openPaymentModal = (type: "toPay" | "proceed") => {
    setModalType(type);
    // set visible -> effect will present
    setPaymentModalVisible(true);
  };

  // onDismiss callback from sheet
  const handleSheetDismiss = () => {
    // sync state
    setPaymentModalVisible(false);
    setPaymentLoading(false);
  };

  return (
    <View style={styles.container}>
      <CommonHeader title={"Cart"} />

      {/* Cart Content */}
      {loading ? (
        <View style={styles.emptyCart}>
          <ActivityIndicator size="large" color={theme.PRIMARY_COLOR} />
        </View>
      ) : cartData.length === 0 ? (
        <View style={styles.emptyCart}>
          <Image
            source={{ uri: "https://i.pinimg.com/1200x/c6/0f/ea/c60fea3ac3aab2e82c2f7ea901ef55f6.jpg" }}
            style={{ width: wp(50), height: wp(50), resizeMode: "contain", marginBottom: hp(2) }}
          />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>Looks like you haven’t added anything yet.</Text>
          <Pressable style={styles.shopNowBtn} onPress={() => navigation.navigate("bottomTabScreen")}>
            <Text style={styles.shopNowBtnText}>Add Items</Text>
          </Pressable>
        </View>
      ) : (
        <>
          {/* Address row */}
          <View style={styles.addressRow}>
            <Pressable style={{ flexDirection: "row", alignItems: "center", flex: 1 }} onPress={() => navigation.navigate("changeAddressScreen" as never)}>
              <Ionicons name="location-outline" size={hp(3.5)} />
              <View style={{ marginLeft: wp(2), flex: 1 }}>
                {selectedAddress ? (
                  <>
                    <Text style={{ fontWeight: "600" }}>{selectedAddress.addressType}</Text>
                    <Text style={styles.addressSub}>{formatAddressLine(selectedAddress)}</Text>
                    {selectedAddress.fullName ? <Text style={[styles.addressSub, { marginTop: 4 }]}>{selectedAddress.fullName} • {selectedAddress.phoneNumber}</Text> : null}
                  </>
                ) : (
                  <>
                    <Text style={{ fontWeight: "600", color: "#333" }}>Select Delivery Address</Text>
                    <Text style={[styles.addressSub, { marginTop: 2 }]}>Tap to choose or add an address</Text>
                  </>
                )}
              </View>
            </Pressable>

            <Pressable style={styles.changeBtn} onPress={() => navigation.navigate("changeAddressScreen" as never)}>
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
        </>
      )}

      {/* Footer */}
      {cartData.length > 0 && (
        <View style={styles.footer}>
          {/* Footer Row: Use Coins */}
          <View style={styles.footerRow}>
            <View>
              <Text style={styles.deliveryInformationText}>Use Coins</Text>
              <Text style={styles.deliveryPartnerText}>Available: {availableCoins} coins (₹{availableCoins})</Text>
            </View>
            <Switch value={useCoins} onValueChange={setUseCoins} trackColor={{ false: "#ccc", true: theme.PRIMARY_COLOR }} thumbColor="#fff" />
          </View>

          {/* Footer Row: Delivery Instruction */}
          <Pressable style={styles.footerRow}>
            <View style={{ flexDirection: "column" }}>
              <Text style={styles.deliveryInformationText}> Delivery Instruction </Text>
              <Text style={styles.deliveryPartnerText}> Delivery partner will be notified </Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={hp(2.5)} />
          </Pressable>

          {(() => {
            const coinsToUse = useCoins ? Math.min(totalAmount, availableCoins) : 0;
            const amountAfterCoins = totalAmount - coinsToUse;
            const gstAmount = amountAfterCoins * 0.05;
            const finalAmount = amountAfterCoins + gstAmount;
            return (
              <>
                {/* Footer Row: To Pay */}
                <Pressable style={styles.footerRow} onPress={() => openPaymentModal("toPay")}>
                  <View>
                    <Text style={styles.deliveryInformationText}>To Pay</Text>
                    <Text style={styles.deliveryPartnerText}> Incl. all taxes and charges </Text>
                  </View>
                  <Text style={styles.toPayAmount}>₹{finalAmount.toFixed(2)}</Text>
                </Pressable>

                {/* Proceed Button with Coins Info */}
                <Pressable style={styles.proceedBtn} onPress={() => openPaymentModal("proceed")}>
                  <Text style={styles.proceedBtnText}>
                    Proceed to Payment • ₹{finalAmount.toFixed(2)}
                    {coinsToUse > 0 ? ` (Coins used: ₹${coinsToUse.toFixed(2)})` : ""}
                  </Text>
                </Pressable>
              </>
            );
          })()}
        </View>
      )}

      {/* -------------------------
          gorhom BottomSheetModal
         ------------------------- */}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={(props) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} pressBehavior="close" />}
        enablePanDownToClose
        handleIndicatorStyle={{ backgroundColor: "#ddd" }}
        onDismiss={handleSheetDismiss}
      >
        <BottomSheetView style={{ paddingHorizontal: wp(4), paddingTop: hp(1.2),paddingBottom:hp(7) }}>
          {modalType === "toPay" ? (
            (() => {
              const coinsToUse = useCoins ? Math.min(totalAmount, availableCoins) : 0;
              const amountAfterCoins = totalAmount - coinsToUse;
              const gstAmount = amountAfterCoins * 0.05;
              const finalAmount = amountAfterCoins + gstAmount;
              return (
                <>
                  <Text style={styles.modalTitle}>Bill Summary</Text>

                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 4 }}>
                    <Text>Item Total</Text>
                    <Text>₹{totalAmount.toFixed(2)}</Text>
                  </View>

                  {coinsToUse > 0 && (
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 4 }}>
                      <Text>Coins Applied</Text>
                      <Text>- ₹{coinsToUse.toFixed(2)}</Text>
                    </View>
                  )}

                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 4 }}>
                    <Text>Amount after Coins</Text>
                    <Text>₹{amountAfterCoins.toFixed(2)}</Text>
                  </View>

                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 4 }}>
                    <Text>GST (5%)</Text>
                    <Text>₹{gstAmount.toFixed(2)}</Text>
                  </View>

                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 4 }}>
                    <Text>Delivery Fee</Text>
                    <Text>₹0</Text>
                  </View>

                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 8 }}>
                    <Text style={{ fontWeight: "bold" }}>Total Payable</Text>
                    <Text style={{ fontWeight: "bold" }}>
                      ₹{finalAmount.toFixed(2)}
                      {coinsToUse > 0 ? ` (Coins used: ₹${coinsToUse.toFixed(2)})` : ""}
                    </Text>
                  </View>

                  {/* <Pressable style={[styles.proceedBtn, { marginTop: hp(2) }]} onPress={handleCoinPayment} disabled={paymentLoading}>
                    {paymentLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.proceedBtnText}>Pay with Coins • ₹{finalAmount.toFixed(2)}</Text>}
                  </Pressable> */}
                  <Pressable onPress={() => bottomSheetModalRef.current?.dismiss()}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </Pressable>
                </>
              );
            })()
          ) : (
            <>
              <Text style={styles.modalTitle}>Choose Payment Method</Text>

              <Pressable style={styles.paymentOption} onPress={handleCoinPayment} disabled={paymentLoading}>
                <Ionicons name="wallet-outline" size={24} color={theme.PRIMARY_COLOR} />
                <Text style={styles.paymentText}>Pay with ClickTea Coin</Text>
              </Pressable>

              <Pressable
                style={styles.paymentOption}
                onPress={() => {
                  if (paymentLoading) return;
                  Alert.alert("Info", "Online payment integration not implemented yet.");
                }}
                disabled={paymentLoading}
              >
                <Ionicons name="card-outline" size={24} color={theme.PRIMARY_COLOR} />
                <Text style={styles.paymentText}>Pay Online</Text>
              </Pressable>

              <Pressable style={[styles.paymentOption, !isSubscription && { opacity: 0.5 }]} disabled={!isSubscription || paymentLoading} onPress={handlePayLater}>
                <Ionicons name="time-outline" size={24} color={theme.PRIMARY_COLOR} />
                <Text style={styles.paymentText}>Pay Later</Text>
              </Pressable>

              <Pressable onPress={() => bottomSheetModalRef.current?.dismiss()}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </>
          )}
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
};

export default CartScreen;

// -------------------------
// Styles (unchanged)
// -------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
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
  },
  qtyText: { marginHorizontal: wp(2) },
  itemTotal: {
    fontWeight: "bold",
    minWidth: wp(12),
    textAlign: "right",
    marginLeft: wp(2),
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
  proceedBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: hp(1.8),
    textAlign: "center",
  },
  toPayAmount: { fontWeight: "bold" },

  modalTitle: { fontSize: hp(2.2), fontWeight: "bold", marginBottom: hp(1) },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderColor: "#E8E8E8",
    gap: wp(3),
  },
  paymentText: { fontSize: hp(1.8), marginLeft: wp(3) },
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
  emptyTitle: {
    fontSize: hp(2.4),
    fontWeight: "600",
    marginBottom: hp(0.5),
    color: "#333",
  },
  emptySub: {
    fontSize: hp(1.8),
    color: "#777",
    textAlign: "center",
    marginBottom: hp(2),
  },
  shopNowBtn: {
    backgroundColor: theme.PRIMARY_COLOR,
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.5),
    borderRadius: hp(1),
  },
  shopNowBtnText: {
    color: "#fff",
    fontSize: hp(2),
    fontWeight: "600",
  },
});
