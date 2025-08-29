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
import {
  removeFromCartAsync,
  updateCartItemAsync,
  fetchCartAsync,
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
import { Address, useAddress } from "@/src/context/addressContext";

// gorhom bottom sheet imports
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";

const api = axios.create({ baseURL: BASE_URL, timeout: 15000 });

/* ---------- CartItemRow (unchanged behaviour) ---------- */
const CartItemRow = React.memo(function CartItemRow({
  item,
  updatingId,
  onQtyChange,
  onRemoveRequested,
}: any) {
  const unitPrice = useMemo(() => {
    if (item.snapshotPrice != null) {
      return Number(item.snapshotPrice);
    }
    return Number(item.price ?? 0);
  }, [item.snapshotPrice, item.price]);
  const subtotal = useMemo(
    () => Number((unitPrice * (item.quantity || 0)).toFixed(2)),
    [unitPrice, item.quantity]
  );

  const qtyScale = useSharedValue(1);
  const priceScale = useSharedValue(1);
  const coinY = useSharedValue(-20);
  const coinOpacity = useSharedValue(0);
  const shakeX = useSharedValue(0);

  const qtyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: qtyScale.value }],
  }));
  const priceStyle = useAnimatedStyle(() => ({
    transform: [{ scale: priceScale.value }],
  }));
  const coinStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: coinY.value }],
    opacity: coinOpacity.value,
  }));
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const triggerBounce = () => {
    qtyScale.value = 1.2;
    qtyScale.value = withSpring(1, { damping: 6, stiffness: 150 });
    priceScale.value = 1.15;
    priceScale.value = withSpring(1, { damping: 6, stiffness: 120 });
  };

  const triggerCoinDrop = () => {
    coinY.value = -20;
    coinOpacity.value = 1;
    coinY.value = withTiming(0, {
      duration: 420,
      easing: Easing.out(Easing.quad),
    });
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
        source={
          item.imageUrl
            ? { uri: `${api.defaults.baseURL}/uploads/menus/${item.imageUrl}` }
            : require("@/src/assets/images/onBoard1.png")
        }
        style={styles.itemImage}
        resizeMode="cover"
      />
      <View style={styles.itemBody}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.snapshotName ?? item.menuName}
        </Text>
        <Text style={styles.itemPriceEach}>₹{unitPrice.toFixed(2)} each</Text>
      </View>

      <Animated.View style={[styles.qtyContainer, qtyStyle]}>
        <Pressable
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

      <Animated.Text style={[styles.itemTotal, priceStyle]}>
        ₹{subtotal.toFixed(2)}
      </Animated.Text>
      <Animated.View style={[styles.coinIcon, coinStyle]} pointerEvents="none">
        <Ionicons name="logo-bitcoin" size={20} color="gold" />
      </Animated.View>
    </Animated.View>
  );
});

/* ---------- CartScreen (final merged) ---------- */
const CartScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const shopId = useSelector(selectSelectedShopId);

  const [cartData, setCartData] = useState<cartDataType[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [useCoins, setUseCoins] = useState(false);
  const [availableCoins] = useState(50);
  const [showFooterUI, setShowFooterUI] = useState(false); // <-- toggle footer visibility
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"toPay" | "proceed">("proceed");

  const { selectedAddress } = useAddress();
  const mountedRef = useRef(true);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => [hp(45)], []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchLocalCart = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      const res = await api.get(`/api/cart/${shopId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      // robust payload extraction (handles different response shapes)
      const payload = Array.isArray(res.data)
        ? res.data
        : res.data?.items ?? res.data?.data ?? res.data?.cartItems ?? [];

      InteractionManager.runAfterInteractions(() => {
        if (!mountedRef.current) return;
        setCartData(payload);
      });
    } catch (err) {
      console.error("Cart fetch error:", err);
      ToastAndroid.show("Failed to load cart", ToastAndroid.SHORT);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [shopId]);

  useFocusEffect(
    useCallback(() => {
      fetchLocalCart();
    }, [fetchLocalCart])
  );

  const totalAmount = useMemo(
    () =>
      cartData.reduce((sum, it) => {
        const unit =
          it.snapshotPrice != null
            ? Number(it.snapshotPrice)
            : Number(it.price ?? 0);
        return sum + unit * (it.quantity || 0);
      }, 0),
    [cartData]
  );
  const totalItems = useMemo(
    () => cartData.reduce((s, it) => s + (it.quantity || 0), 0),
    [cartData]
  );

  // optimistic update + dispatch
  const handleQtyChange = useCallback(
    (item: cartDataType, increment: boolean) => {
      const newQty = increment ? item.quantity + 1 : item.quantity - 1;
      setUpdatingId(item.cartId ?? null);
      if (newQty <= 0) return;
      setCartData((prev) =>
        prev.map((i) =>
          i.cartId === item.cartId ? { ...i, quantity: newQty } : i
        )
      );

      setTimeout(async () => {
        try {
          await dispatch(
            updateCartItemAsync({
              cartId: item.cartId!,
              quantity: newQty,
            }) as any
          );
        } catch (err) {
          console.error("Update failed", err);
          if (mountedRef.current)
            setCartData((prev) =>
              prev.map((i) =>
                i.cartId === item.cartId ? { ...i, quantity: item.quantity } : i
              )
            );
          ToastAndroid.show("Failed to update quantity", ToastAndroid.SHORT);
        } finally {
          if (mountedRef.current) setUpdatingId(null);
        }
      }, 350);
    },
    [dispatch]
  );

  const handleRemoveRequested = useCallback(
    async (cartId: number) => {
      setUpdatingId(cartId);
      try {
        await dispatch(removeFromCartAsync(cartId) as any);
        if (!mountedRef.current) return;
        setCartData((prev) => prev.filter((i) => i.cartId !== cartId));
        ToastAndroid.show("Item removed", ToastAndroid.SHORT);
      } catch (err) {
        console.error("Remove failed:", err);
        ToastAndroid.show("Failed to remove item", ToastAndroid.SHORT);
      } finally {
        if (mountedRef.current) setUpdatingId(null);
      }
    },
    [dispatch]
  );

  const handleCoinPayment = useCallback(async () => {
    
    const payload = {
      totalAmount,
      shopId,
      delivery_note: "",
      cartItems: cartData.map((it) => ({
        menuId: it.menuId,
        variantId: it.variantId ?? null,
        quantity: it.quantity,
        price:
          typeof it.snapshotPrice === "number"
            ? it.snapshotPrice
            : Number(it.price ?? 0),
        addons: it.addons || [],
      })),
    };
    try {
      const token = await AsyncStorage.getItem("authToken");
      const res = await api.post("/api/coin/pay", payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.status === 200) {
        setCartData([]);
        ToastAndroid.show("Order placed using coins!", ToastAndroid.SHORT);
        navigation.navigate("orderScreen");
      } else {
        Alert.alert("Payment failed", res.data?.message || "Try again");
      }
    } catch (err: any) {
      console.error("Coin pay error:", err);
      Alert.alert(
        "Payment failed",
        err?.response?.data?.message || "Try again"
      );
    }
  }, [cartData, totalAmount, shopId, navigation]);

  const handlePayLater = useCallback(async () => {
    const cartItems = cartData.map((it) => {
      const price =
        typeof it.snapshotPrice === "number"
          ? it.snapshotPrice
          : Number(it.price ?? 0);
      return {
        menuId: it.menuId,
        variantId: it.variantId ?? null,
        quantity: it.quantity,
        price,
        addons: it.addons || [],
        subtotal: Number((price * it.quantity).toFixed(2)),
        shopId,
      };
    });
    try {
      const token = await AsyncStorage.getItem("authToken");
      const res = await api.post(
        "/api/orders/pay-later",
        { cartItems, delivery_note: "" },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      setCartData([]);
      Alert.alert(
        "Success",
        `Pay Later order placed.\nTotal: ₹${res.data.totalAmount}`
      );
      navigation.navigate("orderScreen");
    } catch (err: any) {
      console.error("PayLater error", err);
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Something went wrong"
      );
    }
  }, [cartData, navigation]);

  const openPaymentModal = (type: "toPay" | "proceed") => {
    setModalType(type);
    setPaymentModalVisible(true);
    bottomSheetRef.current?.present?.();
  };

  return (
    <View style={styles.container}>
      <CommonHeader title="Cart" />

      {loading ? (
        <View style={styles.emptyCart}>
          <ActivityIndicator size="large" color={theme.PRIMARY_COLOR} />
        </View>
      ) : cartData.length === 0 ? (
        <View style={styles.emptyCart}>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
        </View>
      ) : (
        <>
          <View style={styles.addressRow}>
            <Pressable
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
              onPress={() => navigation.navigate("changeAddressScreen")}
            >
              <Ionicons name="location-outline" size={hp(3.5)} />
              <View style={{ marginLeft: wp(2), flex: 1 }}>
                {selectedAddress ? (
                  <>
                    <Text style={{ fontWeight: "600" }}>
                      {selectedAddress.addressType}
                    </Text>
                    <Text style={styles.addressSub}>
                      {selectedAddress.houseNumber}, {selectedAddress.roadArea}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={{ fontWeight: "600" }}>
                      Select Delivery Address
                    </Text>
                    <Text style={styles.addressSub}>
                      Tap to choose or add an address
                    </Text>
                  </>
                )}
              </View>
            </Pressable>
            <Pressable
              style={styles.changeBtn}
              onPress={() => navigation.navigate("changeAddressScreen")}
            >
              <Text style={styles.changeBtnText}>Change</Text>
            </Pressable>
          </View>

          <View style={styles.itemsHeader}>
            <Text>Items ({totalItems})</Text>
            <View style={styles.deliveryInfo}>
              <Ionicons name="time-outline" size={hp(3)} />
              <Text style={styles.deliveryText}>Delivery in 10 mins</Text>
            </View>
          </View>

          <FlatList
            data={cartData}
            renderItem={({ item }) => (
              <CartItemRow
                item={item}
                updatingId={updatingId}
                onQtyChange={(i: any, inc: boolean) => handleQtyChange(i, inc)}
                onRemoveRequested={(id: number) => handleRemoveRequested(id)}
              />
            )}
            keyExtractor={(it) => `${it.cartId ?? it.id ?? Math.random()}`}
            contentContainerStyle={{ paddingBottom: showFooterUI ? hp(30) : hp(24) }}
            initialNumToRender={6}
            maxToRenderPerBatch={8}
            windowSize={9}
          />
        </>
      )}

      {/* If cartData exists -> either show floating Pay button OR the original footer */}
      {cartData.length > 0 && !showFooterUI && (
        <Pressable
          style={styles.floatingPayBtn}
          onPress={() => setShowFooterUI(true)}
        >
          <Ionicons
            name="arrow-up-circle"
            size={hp(4)}
            color="#fff"
            style={{ marginBottom: 2 }}
          />
          <Text style={styles.floatingPayText}>Pay</Text>
        </Pressable>
      )}

      {cartData.length > 0 && showFooterUI && (
        <View style={styles.footer}>
          {/* small hide button so user can go back to floating pay button */}
          <Pressable style={{ alignSelf: "flex-end", marginBottom: hp(0.5) }} onPress={() => setShowFooterUI(false)}>
            <Ionicons name="chevron-down-outline" size={hp(2.4)} />
          </Pressable>

          <View style={styles.footerRow}>
            <View>
              <Text style={styles.deliveryInformationText}>Use Coins</Text>
              <Text style={styles.deliveryPartnerText}>
                Available: {availableCoins} coins
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
                {" "}
                Delivery Instruction{" "}
              </Text>
              <Text style={styles.deliveryPartnerText}>
                {" "}
                Delivery partner will be notified{" "}
              </Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={hp(2.5)} />
          </Pressable>

          {(() => {
            const coinsToUse = useCoins
              ? Math.min(totalAmount, availableCoins)
              : 0;
            const amountAfterCoins = totalAmount - coinsToUse;
            const gstAmount = amountAfterCoins * 0.05;
            const finalAmount = amountAfterCoins + gstAmount;
            return (
              <>
                <Pressable
                  style={styles.footerRow}
                  onPress={() => openPaymentModal("toPay")}
                >
                  <View>
                    <Text style={styles.deliveryInformationText}>To Pay</Text>
                    <Text style={styles.deliveryPartnerText}>
                      {" "}
                      Incl. all taxes and charges{" "}
                    </Text>
                  </View>
                  <Text style={styles.toPayAmount}>
                    ₹{finalAmount.toFixed(2)}
                  </Text>
                </Pressable>
                <Pressable
                  style={styles.proceedBtn}
                  onPress={() => openPaymentModal("proceed")}
                >
                  <Text style={styles.proceedBtnText}>
                    Proceed to Payment • ₹{finalAmount.toFixed(2)}
                  </Text>
                </Pressable>
              </>
            );
          })()}
        </View>
      )}

      {/* Bottom Sheet (same as before) */}
      <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            pressBehavior="close"
          />
        )}
        enablePanDownToClose
        handleIndicatorStyle={{ backgroundColor: "#ddd" }}
      >
        <BottomSheetView
          style={{
            paddingHorizontal: wp(4),
            paddingTop: hp(1.2),
            paddingBottom: hp(7),
          }}
        >
          {modalType === "toPay" ? (
            <>
              <Text style={styles.modalTitle}>Bill Summary</Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginVertical: 4,
                }}
              >
                <Text>Item Total</Text>
                <Text>₹{totalAmount.toFixed(2)}</Text>
              </View>
              <Pressable onPress={() => bottomSheetRef.current?.dismiss()}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.modalTitle}>Choose Payment Method</Text>
              <Pressable
                style={styles.paymentOption}
                onPress={handleCoinPayment}
              >
                <Ionicons
                  name="wallet-outline"
                  size={24}
                  color={theme.PRIMARY_COLOR}
                />
                <Text style={styles.paymentText}>Pay with ClickTea Coin</Text>
              </Pressable>
              <Pressable
                style={styles.paymentOption}
                onPress={() =>
                  Alert.alert(
                    "Info",
                    "Online payment integration not implemented yet."
                  )
                }
              >
                <Ionicons
                  name="card-outline"
                  size={24}
                  color={theme.PRIMARY_COLOR}
                />
                <Text style={styles.paymentText}>Pay Online</Text>
              </Pressable>
              <Pressable
                style={[styles.paymentOption]}
                onPress={handlePayLater}
              >
                <Ionicons
                  name="time-outline"
                  size={24}
                  color={theme.PRIMARY_COLOR}
                />
                <Text style={styles.paymentText}>Pay Later</Text>
              </Pressable>
              <Pressable onPress={() => bottomSheetRef.current?.dismiss()}>
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

/* ---------- Styles (same as your original) ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  addressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: wp(4),
    marginTop: hp(2),
  },
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
  itemImage: { height: hp(10), width: wp(20), borderRadius: 8 },
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
  coinIcon: { position: "absolute", right: wp(2), bottom: hp(1) },
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
  floatingPayBtn: {
    position: "absolute",
    bottom: hp(2.5),
    alignSelf: "center",
    backgroundColor: theme.PRIMARY_COLOR,
    borderRadius: 50,
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.2),
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },
  floatingPayText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: hp(1.6),
  },
});
