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
  Platform,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { hp, wp } from "@/src/assets/utils/responsive";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { selectSelectedShopId } from "@/src/Redux/Slice/selectedShopSlice";
import type { cartDataType } from "@/src/assets/types/userDataType";
import axios, { AxiosResponse } from "axios";
import theme from "@/src/assets/colors/theme";
import {
  removeFromCartAsync,
  updateCartItemAsync,
  fetchCartAsync,
  resetCart,
  fetchCartAllAsync,
} from "@/src/Redux/Slice/cartSlice";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withSequence,
  withRepeat,
  cancelAnimation,
  runOnJS,
} from "react-native-reanimated";
import CommonHeader from "@/src/Common/CommonHeader";
import { useAddress } from "@/src/context/addressContext";
import { RootState } from "@/src/Redux/store";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import axiosClient from "@/src/api/client";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { GST_PERCENT_DISPLAY, GST_RATE } from "@/src/config/tax";

const api = axiosClient;

const ITEM_ROW_MIN_HEIGHT = hp(12);
const ITEM_VERTICAL_SPACING = hp(1.5) * 2 + 1;
const APPROX_ITEM_HEIGHT = ITEM_ROW_MIN_HEIGHT + ITEM_VERTICAL_SPACING;
const messages = [
  "Your cart feels lonely… maybe it needs a date with some cool products 😉",
  "Cart’s lonely… wanna keep it company? 😉",
  "I promise your cart looks hotter when it’s full 🔥",
  "An empty cart is like a missed text… don’t leave it hanging 🥺",
  "Don’t ghost your cart… it misses you 😏💌",
  "Oops! Your cart’s on a diet 🥗",
  "Your cart is emptier than my fridge at midnight 🍫",
  "This cart is emptier than my wallet at month-end 💸",
  "Looks like your cart went on vacation 🌴",
];

type CartItemRowProps = {
  item: cartDataType;
  isUpdating?: boolean;
  onQtyChange: (item: cartDataType, increment: boolean) => void;
  onRemoveRequested: (cartId: number) => void;
};

const CartItemRow = React.memo(function CartItemRow({
  item,
  isUpdating = false,
  onQtyChange,
  onRemoveRequested,
}: CartItemRowProps) {
  if (!item || typeof item !== "object") return null;

  const unitPrice = useMemo(() => {
    if (item.snapshotPrice != null) return Number(item.snapshotPrice);
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
    qtyScale.value = withTiming(1, {
      duration: 260,
      easing: Easing.out(Easing.quad),
    });
    priceScale.value = 1.15;
    priceScale.value = withTiming(1, {
      duration: 260,
      easing: Easing.out(Easing.quad),
    });
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

  const title = String(item.snapshotName ?? item.menuName ?? "");

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
          {title}
        </Text>
        <Text style={styles.itemPriceEach}>₹{unitPrice.toFixed(2)} each</Text>
      </View>

      <Animated.View style={[styles.qtyContainer, qtyStyle]}>
        <Pressable
          accessibilityLabel="Decrease quantity"
          hitSlop={8}
          style={[styles.qtyButton, isUpdating && { opacity: 0.6 }]}
          onPress={() => {
            if ((item.quantity ?? 0) <= 1) {
              if (item.cartId) triggerShakeThenRemove(item.cartId);
            } else {
              if (!isUpdating) {
                triggerBounce();
                onQtyChange(item, false);
              }
            }
          }}
          disabled={isUpdating}
        >
          <Ionicons name="remove-outline" size={hp(2.2)} />
        </Pressable>

        <View style={styles.qtyValueBox}>
          {isUpdating ? (
            <ActivityIndicator size="small" color={theme.PRIMARY_COLOR} />
          ) : (
            <Text style={styles.qtyText}>{String(item.quantity ?? 0)}</Text>
          )}
        </View>

        <Pressable
          accessibilityLabel="Increase quantity"
          hitSlop={8}
          style={[styles.qtyButton, isUpdating && { opacity: 0.6 }]}
          onPress={() => {
            if (!isUpdating) {
              triggerBounce();
              onQtyChange(item, true);
              triggerCoinDrop();
            }
          }}
          disabled={isUpdating}
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

const showToast = (msg: string) => {
  if (Platform.OS === "android") ToastAndroid.show(msg, ToastAndroid.SHORT);
  else Alert.alert("", msg);
};
// group cart items by shopId -> { [shopId]: { shopId, items: [...] } }
const groupByShop = (items: cartDataType[]) => {
  return items.reduce<Record<number, { shopId: number; items: cartDataType[] }>>((acc, it) => {
    const sid = Number((it as any).shopId ?? 0);
    if (!acc[sid]) acc[sid] = { shopId: sid, items: [] };
    acc[sid].items.push(it);
    return acc;
  }, {});
};

const CartScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();
  const shopId = useSelector(selectSelectedShopId);
  const coinBalance = useSelector(
    (s: RootState) => s.profile.data?.coinBalance ?? 0,
    shallowEqual
  );

  const [cartData, setCartData] = useState<cartDataType[]>([]);
  const cartDataRef = useRef<cartDataType[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingMap, setUpdatingMap] = useState<Record<number, boolean>>({});
  const [useCoins, setUseCoins] = useState(false);
  const [showFooterUI, setShowFooterUI] = useState(false);
  const [modalType, setModalType] = useState<
    "toPay" | "proceed" | "deliveryInstruction" | null
  >(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  const [deliveryNoteLocal, setDeliveryNoteLocal] = useState<string>("");

  const { selectedAddress } = useAddress();
  const mountedRef = useRef(true);
  const fetchAbortRef = useRef<AbortController | null>(null);
  const bottomSheetRef = useRef<BottomSheetModal | null>(null);
  const snapPoints = useMemo(() => [hp(45)], []);

  const [randomMsg, setRandomMsg] = useState("");
  const tapTimeoutsRef = useRef<Record<number, number | null>>({});
  const queuedDeltasRef = useRef<Record<number, number>>({});

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      fetchAbortRef.current?.abort();
      Object.values(tapTimeoutsRef.current).forEach(
        (t) => t && clearTimeout(t as number)
      );
      tapTimeoutsRef.current = {};
      queuedDeltasRef.current = {};
    };
  }, []);

  // keep ref in sync to avoid stale closures inside timers
  useEffect(() => {
    cartDataRef.current = cartData;
  }, [cartData]);

  const setItemUpdating = useCallback((cartId: number, val: boolean) => {
    setUpdatingMap((prev) => {
      const copy = { ...prev };
      if (val) copy[cartId] = true;
      else delete copy[cartId];
      return copy;
    });
  }, []);

  // fetch ALL shops cart and flatten
  const fetchLocalCart = useCallback(async () => {
    setLoading(true);
    fetchAbortRef.current?.abort();
    const controller = new AbortController();
    fetchAbortRef.current = controller;

    try {
      // server: GET /api/cart -> grouped [{ shopId, shopname, items: [...] }, ...]
      const res: AxiosResponse = await api.get(`/api/cart`, {
        signal: controller.signal as any,
      });

      const payload = Array.isArray(res.data) ? res.data : [];

      InteractionManager.runAfterInteractions(() => {
        if (!mountedRef.current) return;
        // flatten grouped response into same shape your UI expects (array of cart items)
        const flattened: cartDataType[] = [];
        payload.forEach((grp: any) => {
          const items = Array.isArray(grp.items) ? grp.items : [];
          items.forEach((it: any) => {
            flattened.push({ ...(it || {}), shopId: grp.shopId, shopname: grp.shopname } as any);
          });
        });

        // Also handle case server returned already flattened array
        if (flattened.length === 0 && Array.isArray(res.data) && res.data.length && res.data[0]?.cartId) {
          setCartData(res.data as cartDataType[]);
        } else {
          setCartData(flattened);
        }
      });
    } catch (err: any) {
      if (!(err?.name === "CanceledError" || err?.message === "canceled")) {
        console.error("Cart fetch error:", err);
        if (mountedRef.current) showToast("Failed to load cart");
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchLocalCart();
    }, [fetchLocalCart])
  );

  const handleRemoveRequested = useCallback(
    async (cartId: number) => {
      if (tapTimeoutsRef.current[cartId]) {
        clearTimeout(tapTimeoutsRef.current[cartId] as number);
        delete tapTimeoutsRef.current[cartId];
      }
      if (queuedDeltasRef.current[cartId]) delete queuedDeltasRef.current[cartId];

      setItemUpdating(cartId, true);
      const prev = cartDataRef.current.find((c) => c.cartId === cartId);

      try {
        setCartData((prevItems) => prevItems.filter((i) => i.cartId !== cartId));
        await dispatch(removeFromCartAsync(cartId)).unwrap();
        // re-sync global cart so badge & totals are consistent across shops
        dispatch(fetchCartAllAsync()).catch(() => {});
        showToast("Item removed");
      } catch (err) {
        console.error("Remove failed:", err);
        if (prev && mountedRef.current) setCartData((p) => [prev, ...p]);
        showToast("Failed to remove item");
      } finally {
        if (mountedRef.current) setItemUpdating(cartId, false);
      }
    },
    [dispatch, setItemUpdating]
  );

  const totalAmount = useMemo(
    () =>
      cartData.reduce((sum, it) => {
        const unit =
          it.snapshotPrice != null ? Number(it.snapshotPrice) : Number(it.price ?? 0);
        return sum + unit * (it.quantity || 0);
      }, 0),
    [cartData]
  );

  const totalItems = useMemo(
    () => cartData.reduce((s, it) => s + (it.quantity || 0), 0),
    [cartData]
  );

  const updateLocalQty = useCallback((cartId: number, newQty: number) => {
    setCartData((prev) =>
      prev.map((i) => (i.cartId === cartId ? { ...i, quantity: newQty } : i))
    );
  }, []);

  const revertLocalQty = useCallback((cartId: number, oldQty: number) => {
    setCartData((prev) =>
      prev.map((i) => (i.cartId === cartId ? { ...i, quantity: oldQty } : i))
    );
  }, []);

  const BATCH_DELAY = 450; // ms

  const handleQtyChange = useCallback(
    (item: cartDataType, increment: boolean) => {
      if (!item || !item.cartId) return;
      const cartId = item.cartId;
      const oldQty = item.quantity ?? 0;
      const delta = increment ? 1 : -1;
      const newQty = oldQty + delta;

      if (newQty <= 0) {
        Alert.alert("Remove item", "Do you want to remove this item?", [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => handleRemoveRequested(cartId),
          },
        ]);
        return;
      }

      // optimistic update
      updateLocalQty(cartId, newQty);

      queuedDeltasRef.current[cartId] =
        (queuedDeltasRef.current[cartId] || 0) + delta;
      setItemUpdating(cartId, true);

      const existing = tapTimeoutsRef.current[cartId];
      if (existing) clearTimeout(existing);

      tapTimeoutsRef.current[cartId] = setTimeout(async () => {
        const totalDelta = queuedDeltasRef.current[cartId] ?? 0;
        delete queuedDeltasRef.current[cartId];
        delete tapTimeoutsRef.current[cartId];

        // use latest UI state from ref (avoid stale closure)
        const currentItem = cartDataRef.current.find((c) => c.cartId === cartId);
        const desiredQty = currentItem
          ? currentItem.quantity ?? Math.max(0, oldQty + totalDelta)
          : Math.max(0, oldQty + totalDelta);

        try {
          await dispatch(updateCartItemAsync({ cartId, quantity: desiredQty })).unwrap();
          // refresh global cart (keeps badge/totals consistent across shops)
          dispatch(fetchCartAllAsync()).catch(() => {});
        } catch (err) {
          console.error("Batched update failed", err);
          if (mountedRef.current) {
            revertLocalQty(cartId, oldQty);
            showToast("Failed to update quantity");
          }
        } finally {
          if (mountedRef.current) setItemUpdating(cartId, false);
        }
      }, BATCH_DELAY) as unknown as number;
    },
    [dispatch, revertLocalQty, setItemUpdating, updateLocalQty, handleRemoveRequested]
  );

  const paymentAbortRef = useRef<AbortController | null>(null);

const handleCoinPayment = useCallback(async () => {
  if (processingPayment) return;
  if (!cartData.length) return showToast("Cart is empty");

  // grand total computed already as totalAmount
  // ensure user has enough coins BEFORE attempting to pay per-shop (prevent partial payments)
  if (useCoins && (coinBalance ?? 0) < totalAmount) {
    Alert.alert("Insufficient Coins", `You have ₹${coinBalance}, needed ₹${totalAmount}`);
    return;
  }

  setProcessingPayment(true);
  paymentAbortRef.current?.abort();
  const controller = new AbortController();
  paymentAbortRef.current = controller;

  try {
    const groups = groupByShop(cartData);

    // If your server supports a single endpoint to pay entire cart across shops with coins,
    // you can call that here (preferred). If not, we do sequential per-shop coin payments.
    // I use per-shop sequential calls to match "/api/coin/pay" behavior.
    for (const sidStr of Object.keys(groups)) {
      const g = groups[Number(sidStr)];
      const shopIdForReq = g.shopId;

      const shopPayload = {
        totalAmount: Number(
          g.items.reduce((s, it) => {
            const price = typeof it.snapshotPrice === "number" ? it.snapshotPrice : Number(it.price ?? 0);
            return s + price * (it.quantity || 0);
          }, 0).toFixed(2)
        ),
        shopId: shopIdForReq,
        delivery_note: deliveryNoteLocal || "",
        cartItems: g.items.map((it) => ({
          menuId: it.menuId,
          variantId: it.variantId ?? null,
          quantity: it.quantity,
          price: typeof it.snapshotPrice === "number" ? it.snapshotPrice : Number(it.price ?? 0),
          addons: it.addons || [],
        })),
      };

      // server endpoint used earlier for single-shop coin payment
      await api.post("/api/coin/pay", shopPayload, { signal: controller.signal as any });
    }

    // success for all shops
    setCartData([]);
    dispatch(resetCart());
    dispatch(fetchCartAllAsync()).catch(() => {});
    showToast("Order(s) placed using coins!");
    bottomSheetRef.current?.dismiss?.();
    navigation.navigate("orderScreen");
  } catch (err: any) {
    if (!(err?.name === "CanceledError" || err?.message === "canceled")) {
      console.error("Coin pay (multi-shop) error:", err);
      Alert.alert("Payment failed", err?.response?.data?.message || "Try again");
    }
  } finally {
    if (mountedRef.current) setProcessingPayment(false);
  }
}, [cartData, totalAmount, coinBalance, useCoins, dispatch, navigation, deliveryNoteLocal, processingPayment]);

const handlePayLater = useCallback(async () => {
  if (processingPayment) return;
  if (!cartData.length) return showToast("Cart is empty");
  setProcessingPayment(true);

  try {
    // You already have server route /api/orders/pay-later that groups by shopId when you pass cartItems with shopId.
    // So the simplest safe call is to send ALL items (each item must include shopId).
    const cartItems = cartData.map((it) => {
      const price = typeof it.snapshotPrice === "number" ? it.snapshotPrice : Number(it.price ?? 0);
      return {
        menuId: it.menuId,
        variantId: it.variantId ?? null,
        quantity: it.quantity,
        price,
        addons: it.addons || [],
        subtotal: Number((price * it.quantity).toFixed(2)),
        shopId: (it as any).shopId,
      };
    });

    const res = await api.post("/api/orders/pay-later", { cartItems, delivery_note: deliveryNoteLocal || "" });

    // success -> clear client-side, re-sync
    setCartData([]);
    dispatch(resetCart());
    dispatch(fetchCartAllAsync()).catch(() => {});
    Alert.alert("Success", `Pay Later order placed.\nTotal: ₹${res.data.totalAmount}`);
    bottomSheetRef.current?.dismiss?.();
    navigation.navigate("orderScreen");
  } catch (err: any) {
    console.error("PayLater error", err);
    Alert.alert("Error", err?.response?.data?.message || "Something went wrong");
  } finally {
    if (mountedRef.current) setProcessingPayment(false);
  }
}, [cartData, dispatch, deliveryNoteLocal, navigation, processingPayment]);

  const keyExtractor = useCallback(
    (it: cartDataType) => `${it.cartId ?? it.menuId}`,
    []
  );

  const renderItem = useCallback(
    ({ item }: { item: cartDataType | null }) => {
      if (!item || typeof item !== "object") return null;
      const isUpdating = !!(item.cartId && updatingMap[item.cartId]);
      return (
        <CartItemRow
          item={item}
          isUpdating={isUpdating}
          onQtyChange={handleQtyChange}
          onRemoveRequested={handleRemoveRequested}
        />
      );
    },
    [handleQtyChange, handleRemoveRequested, updatingMap]
  );

  const getItemLayout = useCallback(
    (_data: any, index: number) => ({
      length: APPROX_ITEM_HEIGHT,
      offset: APPROX_ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  useEffect(() => {
    const msg = messages[Math.floor(Math.random() * messages.length)];
    setRandomMsg(msg);
  }, []);

  const FLOAT_AMPLITUDE = hp(1.2);
  const floatY = useSharedValue(0);
  const stopFloatTimer = useRef<number | null>(null);

  const startFloat = useCallback(() => {
    if (stopFloatTimer.current) {
      clearTimeout(stopFloatTimer.current);
      stopFloatTimer.current = null;
    }

    floatY.value = withRepeat(
      withSequence(
        withTiming(-FLOAT_AMPLITUDE, {
          duration: 800,
          easing: Easing.inOut(Easing.quad),
        }),
        withTiming(0, { duration: 800, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );

    stopFloatTimer.current = setTimeout(() => {
      try {
        cancelAnimation(floatY);
      } catch (e) {}
      floatY.value = 0;
      stopFloatTimer.current = null;
    }, 5000) as unknown as number;
  }, [floatY]);

  const stopFloat = useCallback(() => {
    try {
      cancelAnimation(floatY);
    } catch (e) {}
    floatY.value = 0;
    if (stopFloatTimer.current) {
      clearTimeout(stopFloatTimer.current);
      stopFloatTimer.current = null;
    }
  }, [floatY]);

  useEffect(() => {
    if (cartData.length > 0) startFloat();
    else stopFloat();
  }, [cartData.length, startFloat, stopFloat]);
  useEffect(() => {
    if (showFooterUI) stopFloat();
  }, [showFooterUI, stopFloat]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  const openPaymentModal = useCallback(
    (type: "toPay" | "proceed" | "deliveryInstruction") => {
      setModalType(type);
      bottomSheetRef.current?.present?.();
      stopFloat();
    },
    [stopFloat]
  );

  const onPressFloating = useCallback(() => {
    setShowFooterUI(true);
    startFloat();
  }, [startFloat]);

  const gradientColors = useMemo(() => ["#562E19", "#943400", "#D97706"], []);
  const insets = useSafeAreaInsets();

  const coinsToUse = useMemo(
    () => (useCoins ? Math.min(totalAmount, coinBalance ?? 0) : 0),
    [useCoins, totalAmount, coinBalance]
  );
  const amountAfterCoins = useMemo(() => totalAmount - coinsToUse, [totalAmount, coinsToUse]);
  const gstAmount = useMemo(() => {
    return Number((amountAfterCoins * GST_RATE).toFixed(2));
  }, [amountAfterCoins]);

  const finalAmount = useMemo(
    () => Number((amountAfterCoins + gstAmount).toFixed(2)),
    [amountAfterCoins, gstAmount]
  );
  const handleSaveDeliveryNote = useCallback(() => {
    showToast("Delivery note saved");
    bottomSheetRef.current?.dismiss?.();  
  }, []);

const handlePlaceOrder = useCallback(
  async (paymentType: "COD" | "ONLINE" | "coin" = "COD") => {
    if (processingPayment) return;
    if (!cartData.length) {
      showToast("Cart is empty");
      return;
    }
    setProcessingPayment(true);

    try {
      const groups = groupByShop(cartData);
      const results: any[] = [];

      // iterate shops sequentially to avoid race/partial state
      for (const sidStr of Object.keys(groups)) {
        const g = groups[Number(sidStr)];
        const shopIdForReq = g.shopId;

        const cartItemsPayload = g.items.map((it) => {
          const price = typeof it.snapshotPrice === "number" ? it.snapshotPrice : Number(it.price ?? 0);
          return {
            menuId: it.menuId,
            variantId: it.variantId ?? null,
            quantity: it.quantity,
            price,
            addons: it.addons || [],
          };
        });

        const payload = {
          cartItems: cartItemsPayload,
          shopId: shopIdForReq,
          totalAmount: Number(
            cartItemsPayload.reduce((s, x) => s + (x.price || 0) * (x.quantity || 0), 0).toFixed(2)
          ),
          payment_type: paymentType === "ONLINE" ? "online" : paymentType === "coin" ? "coin" : "COD",
          delivery_note: deliveryNoteLocal || "",
        };

        // POST to your existing single-shop order endpoint (server creates one order per request)
        const res = await api.post("/api/orders", payload);
        results.push(res.data);
      }

      // If we reached here, all shops succeeded
      setCartData([]);
      dispatch(resetCart());
      dispatch(fetchCartAllAsync()).catch(() => {});
      showToast("Order(s) placed successfully");
      bottomSheetRef.current?.dismiss?.();
      navigation.navigate("orderScreen");
    } catch (err: any) {
      console.error("Place order (multi-shop) error:", err);
      Alert.alert("Error", err?.response?.data?.message || "Order placement failed");
    } finally {
      if (mountedRef.current) setProcessingPayment(false);
    }
  },
  [cartData, navigation, deliveryNoteLocal, dispatch, processingPayment]
);


  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
      <CommonHeader title="Cart" />

      {loading ? (
        <View style={styles.emptyCart}>
          <ActivityIndicator size="large" color={theme.PRIMARY_COLOR} />
        </View>
      ) : cartData.length === 0 ? (
        <View style={styles.emptyCart}>
          <View style={styles.emptyTextWrapper}>
            <Text style={styles.emptyTitle}>{randomMsg}</Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate("Home")}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.button,
              pressed && { opacity: 0.92 },
            ]}
          >
            <Text style={styles.buttonText}>Go to Shop</Text>
          </Pressable>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={styles.addressRow}>
            <Pressable
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
              onPress={() => navigation.navigate("changeAddressScreen")}
            >
              <Ionicons name="location-outline" size={hp(3.5)} />
              <View style={{ marginLeft: wp(2), flex: 1 }}>
                {selectedAddress ? (
                  <View>
                    <Text style={{ fontWeight: "600" }}>
                      {String(selectedAddress.addressType ?? "")}
                    </Text>
                    <Text style={styles.addressSub}>
                      {String(selectedAddress.houseNumber ?? "")}
                      {selectedAddress.houseNumber ? ", " : ""}
                      {String(selectedAddress.roadArea ?? "")}
                    </Text>
                  </View>
                ) : (
                  <View>
                    <Text style={{ fontWeight: "600" }}>
                      Select Delivery Address
                    </Text>
                    <Text style={styles.addressSub}>
                      Tap to choose or add an address
                    </Text>
                  </View>
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
            <Text>{`Items (${totalItems})`}</Text>
            <View style={styles.deliveryInfo}>
              <Ionicons name="time-outline" size={hp(3)} />
              <Text style={styles.deliveryText}>Delivery in 10 mins</Text>
            </View>
          </View>

          <FlatList
            data={cartData}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={{
              paddingBottom: showFooterUI
                ? hp(40) + insets.bottom
                : hp(24) + insets.bottom,
            }}
            initialNumToRender={6}
            maxToRenderPerBatch={8}
            windowSize={9}
            removeClippedSubviews
            getItemLayout={getItemLayout}
          />
        </View>
      )}

      {cartData.length > 0 && !showFooterUI && (
        <Animated.View style={[styles.floatingWrapper, floatStyle]}>
          <Pressable
            onPress={onPressFloating}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.floatingPayBtn,
              pressed && { transform: [{ scale: 0.96 }] },
            ]}
          >
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.floatingInner}
            >
              <Ionicons
                name="arrow-up-circle"
                size={hp(3.2)}
                color="#fff"
                style={{ marginRight: wp(2) }}
              />
              <Text style={styles.floatingPayText}>Pay</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      )}

      {cartData.length > 0 && showFooterUI && (
        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, hp(2)) },
          ]}
        >
          <Pressable
            style={{ alignSelf: "flex-end", marginBottom: hp(0.5) }}
            onPress={() => setShowFooterUI(false)}
          >
            <Ionicons name="chevron-down-outline" size={hp(2.4)} />
          </Pressable>

          <View style={styles.footerRow}>
            <View>
              <Text style={styles.deliveryInformationText}>Use Coins</Text>
              <Text style={styles.deliveryPartnerText}>
                Available: {String(coinBalance)}
              </Text>
            </View>
            <Switch
              value={useCoins}
              onValueChange={setUseCoins}
              trackColor={{ false: "#ccc", true: theme.PRIMARY_COLOR }}
              thumbColor="#fff"
            />
          </View>

          <Pressable
            style={styles.footerRow}
            onPress={() => openPaymentModal("deliveryInstruction")}
          >
            <View style={{ flexDirection: "column" }}>
              <Text style={styles.deliveryInformationText}>
                Delivery Instruction
              </Text>
              <Text style={styles.deliveryPartnerText}>
                Tap to add or edit delivery note
              </Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={hp(2.5)} />
          </Pressable>

          <View>
            <>
              <Pressable
                style={styles.footerRow}
                onPress={() => openPaymentModal("toPay")}
              >
                <View>
                  <Text style={styles.deliveryInformationText}>To Pay</Text>
                  <Text style={styles.deliveryPartnerText}>
                    Incl. all taxes and charges
                  </Text>
                </View>
                <Text style={styles.toPayAmount}>₹{finalAmount.toFixed(2)}</Text>
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
          </View>
        </View>
      )}

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
        <BottomSheetView style={styles.bottomSheetView}>
          {modalType === "toPay" ? (
            <View>
              <Text style={styles.modalTitle}>Bill Summary</Text>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginVertical: 6,
                }}
              >
                <Text>Item Total</Text>
                <Text>₹{totalAmount.toFixed(2)}</Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginVertical: 6,
                }}
              >
                <Text>Coins Used</Text>
                <Text>₹{coinsToUse.toFixed(2)}</Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginVertical: 6,
                }}
              >
                <Text>Delivery Fee</Text>
                <Text>₹0.00</Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginVertical: 6,
                }}
              >
                <Text>{`GST (${GST_PERCENT_DISPLAY}%)`}</Text>
                <Text>₹{gstAmount.toFixed(2)}</Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginVertical: 8,
                  borderTopWidth: 1,
                  borderColor: "#eee",
                  paddingTop: 8,
                }}
              >
                <Text style={{ fontWeight: "700" }}>Total</Text>
                <Text style={{ fontWeight: "700" }}>
                  ₹{finalAmount.toFixed(2)}
                </Text>
              </View>

              <Pressable
                style={[styles.proceedBtn, { marginTop: hp(2) }]}
                onPress={() => {
                  setModalType("proceed");
                }}
              >
                <Text style={styles.proceedBtnText}>
                  Proceed • ₹{finalAmount.toFixed(2)}
                </Text>
              </Pressable>

              <Pressable onPress={() => bottomSheetRef.current?.dismiss?.()}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </View>
          ) : modalType === "deliveryInstruction" ? (
            <View>
              <Text style={styles.modalTitle}>Delivery Instruction</Text>
              <Text style={{ marginBottom: hp(1) }}>
                Add details for the delivery partner (house hint, gate code,
                preferred drop spot).
              </Text>
              <TextInput
                placeholder="e.g. Leave at the door, call on arrival..."
                value={deliveryNoteLocal}
                onChangeText={setDeliveryNoteLocal}
                multiline
                style={{
                  borderWidth: 1,
                  borderColor: "#ddd",
                  borderRadius: 8,
                  minHeight: hp(16),
                  padding: wp(3),
                  textAlignVertical: "top",
                }}
              />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  gap: wp(3),
                  marginTop: hp(2),
                } as any}
              >
                <Pressable
                  style={[styles.modalBtn, { backgroundColor: "#ccc" }]}
                  onPress={() => bottomSheetRef.current?.dismiss?.()}
                >
                  <Text>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalBtn, { backgroundColor: "#562E19" }]}
                  onPress={handleSaveDeliveryNote}
                >
                  <Text style={{ color: "#fff" }}>Save</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View>
              <Text style={styles.modalTitle}>Choose Payment Method</Text>
                <Pressable style={styles.paymentOption} onPress={() => handlePlaceOrder("COD")}>
    <Ionicons name="cash-outline" size={24} color={theme.PRIMARY_COLOR} />
    <Text style={styles.paymentText}>Cash on Delivery</Text>
  </Pressable>
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
              <Pressable style={styles.paymentOption} onPress={handlePayLater}>
                <Ionicons
                  name="time-outline"
                  size={24}
                  color={theme.PRIMARY_COLOR}
                />
                <Text style={styles.paymentText}>Pay Later</Text>
              </Pressable>
              <Pressable onPress={() => bottomSheetRef.current?.dismiss?.()}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </View>
          )}
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  );
};

export default CartScreen;

// styles (unchanged except reused modalBtn used above)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  emptyCart: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(6),
    paddingVertical: hp(4),
  },
  emptyTextWrapper: {
    maxWidth: wp(80),
    alignItems: "center",
    marginBottom: hp(2),
    flexWrap: "wrap",
  },
  emptyTitle: {
    fontSize: hp(2.2),
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    lineHeight: hp(3),
  },
  button: {
    backgroundColor: theme.PRIMARY_COLOR,
    paddingVertical: hp(2),
    paddingHorizontal: hp(5.1),
    borderRadius: 10,
    elevation: 3,
    marginTop: hp(2),
  },
  buttonText: { color: "#fff", fontSize: hp(1.9), fontWeight: "700" },
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
    marginBottom:hp(7)
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
  floatingWrapper: {
    position: "absolute",
    bottom: hp(3.5),
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  floatingPayBtn: {
    borderRadius: 999,
    overflow: "visible",
    paddingBottom: hp(7),
  },
  floatingInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wp(7),
    paddingVertical: hp(2),
    borderRadius: 10,
    shadowColor: theme.SECONDARY_COLOR,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  floatingPayText: { color: "#fff", fontWeight: "700", fontSize: hp(1.8) },
  bottomSheetView: {
    paddingHorizontal: wp(4),
    paddingTop: hp(1.2),
    paddingBottom: hp(7),
  },

  // small modal button used inside delivery instruction
  modalBtn: {
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(3),
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
});