
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Platform,
} from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector, shallowEqual } from "react-redux";

// Adjust these paths for your project
import { addToCartAsync, updateCartItemAsync, fetchCartAsync, selectCartItems } from "@/src/Redux/Slice/cartSlice";
import { selectSelectedShopId } from "@/src/Redux/Slice/selectedShopSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserIdFromToken } from "@/src/assets/utils/getUserIdFromToken";
import theme from "@/src/assets/colors/theme";
import { hp, wp } from "@/src/assets/utils/responsive";

/**
 * Production-hardened AddToCartControl (toasts removed)
 *
 * Props:
 *  - item: required menu/item object (expects menuId and optional shopId)
 *  - style?: optional style
 *  - disabled?: parent can disable interactions (useful when parent has per-item loading)
 *  - onSuccess?: callback(newQty:number) — called after a successful change (add/increase/decrease)
 *  - variant?: "mini" | "default" — adjusts minWidth / padding for integration into compact UIs
 *  - minLoadingMs?: number — minimum center spinner visibility (defaults to 1000ms)
 */

type Props = {
  item: any;
  style?: any;
  disabled?: boolean;
  onSuccess?: (newQty: number) => void;
  variant?: "mini" | "default";
  minLoadingMs?: number;
};

const DEFAULT_MIN_LOADING_MS = 1000;

const AddToCartControl: React.FC<Props> = ({
  item,
  style,
  disabled = false,
  onSuccess,
  variant = "default",
  minLoadingMs = DEFAULT_MIN_LOADING_MS,
}) => {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems, shallowEqual) || [];
  const selectedShopId = useSelector(selectSelectedShopId);

  // stable map of cart items -> quick lookup by menuId
  const cartMap = useMemo(() => {
    const m: Record<number, any> = {};
    (cartItems || []).forEach((it: any) => {
      if (it?.menuId != null) m[Number(it.menuId)] = it;
    });
    return m;
  }, [cartItems]);

  const menuId = Number(item?.menuId ?? item?.id ?? -1);
  const serverQty = cartMap[menuId]?.quantity ?? 0;

  // optimistic local quantity — starts synced with server qty
  const [optimisticQty, setOptimisticQty] = useState<number>(serverQty);

  // localLoading blocks multiple presses; centerLoading controls whether we show a full centered spinner
  const [localLoading, setLocalLoading] = useState<boolean>(false);
  const [centerLoading, setCenterLoading] = useState<boolean>(false);

  // animated spinner opacity
  const spinnerOpacity = useSharedValue(0);
  const spinnerStyle = useAnimatedStyle(() => ({ opacity: spinnerOpacity.value }), []);

  // keep optimistic qty synced when server updates (but don't stomp during center transitions)
  useEffect(() => {
    if (!centerLoading && !localLoading) setOptimisticQty(serverQty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverQty]); // localLoading/centerLoading read inside effect to avoid frequent re-runs

  useEffect(() => {
    spinnerOpacity.value = withTiming(centerLoading ? 1 : 0, { duration: 220 });
  }, [centerLoading, spinnerOpacity]);

  // avoid state updates after unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

  // resolve user id robustly
  const resolveUserId = useCallback(async () => {
    let userId: any = null;
    try {
      userId = await getUserIdFromToken();
    } catch (err) {}
    if (!userId) {
      try {
        const raw = await AsyncStorage.getItem("userId");
        if (raw) userId = raw;
      } catch (err) {}
    }
    return userId;
  }, []);

  /* ------------------ Add (0 -> 1) : show center loader ------------------ */
  const handleAdd = useCallback(
    async (opts?: { suppressToast?: boolean }) => {
      if (localLoading || disabled) return;
      if (menuId <= 0) {
        console.warn("AddToCartControl: invalid menuId", menuId, item);
        Alert.alert("Error", "Invalid item — cannot add to cart.");
        return;
      }

      const userId = await resolveUserId();
      if (!userId) {
        Alert.alert("Login required", "Please login to add items to cart.");
        return;
      }

      const targetShopId = item?.shopId ?? selectedShopId;
      if (!targetShopId) {
        Alert.alert("Shop not selected", "Please select a shop before adding items.");
        return;
      }

      setLocalLoading(true);
      setCenterLoading(true);
      const start = Date.now();

      try {
        await dispatch(
          addToCartAsync({
            userId: Number(userId),
            shopId: Number(targetShopId),
            menuId: Number(menuId),
            quantity: 1,
            addons: [],
            notes: "",
          })
        ).unwrap();

        // refresh authoritative server cart
        await dispatch(fetchCartAsync({ shopId: targetShopId })).unwrap();

        // optimistic reflect
        if (mountedRef.current) setOptimisticQty((p) => (p || 0) + 1);
        onSuccess?.(1);
      } catch (err: any) {
        console.error("AddToCartControl.add failed:", err);
        Alert.alert("Error", err?.message ?? "Could not add item to cart. Try again.");
      } finally {
        const elapsed = Date.now() - start;
        if (elapsed < (minLoadingMs ?? DEFAULT_MIN_LOADING_MS)) await wait((minLoadingMs ?? DEFAULT_MIN_LOADING_MS) - elapsed);
        if (mountedRef.current) {
          setCenterLoading(false);
          setLocalLoading(false);
        }
      }
    },
    [localLoading, dispatch, item, menuId, resolveUserId, selectedShopId, disabled, onSuccess, minLoadingMs]
  );

  /* ------------------ Increase (qty stays > 0) : optimistic immediate ------------------ */
  const handleIncrease = useCallback(
    async (opts?: { suppressToast?: boolean }) => {
      if (localLoading || disabled) return;

      const existing = cartMap[menuId];
      if (!existing) {
        // fallback to full add (center loader) if server has no entry
        return handleAdd(opts);
      }

      // optimistic increment
      const prev = serverQty;
      setOptimisticQty((p) => (p || 0) + 1);
      setLocalLoading(true);

      try {
        await dispatch(
          updateCartItemAsync({
            cartId: existing.cartId,
            quantity: (existing.quantity || 0) + 1,
            addons: existing.addons || [],
            notes: existing.notes || "",
          })
        ).unwrap();

        if (selectedShopId) await dispatch(fetchCartAsync({ shopId: selectedShopId })).unwrap();
        onSuccess?.(prev + 1);
      } catch (err: any) {
        console.error("AddToCartControl.increase failed:", err);
        // rollback optimistic
        if (mountedRef.current) setOptimisticQty(prev);
        Alert.alert("Error", err?.message ?? "Could not update cart. Try again.");
      } finally {
        if (mountedRef.current) setLocalLoading(false);
      }
    },
    [localLoading, cartMap, dispatch, menuId, serverQty, selectedShopId, handleAdd, disabled, onSuccess]
  );

  /* ------------------ Decrease ------------------ */
  const handleDecrease = useCallback(
    async (opts?: { suppressToast?: boolean }) => {
      if (localLoading || disabled) return;

      const existing = cartMap[menuId];
      if (!existing) return; // nothing to do

      // if quantity > 1 => optimistic decrement
      if ((existing.quantity || 0) > 1) {
        const prev = serverQty;
        setOptimisticQty((p) => Math.max(0, (p || 0) - 1));
        setLocalLoading(true);
        try {
          const newQty = (existing.quantity || 0) - 1;
          await dispatch(
            updateCartItemAsync({
              cartId: existing.cartId,
              quantity: newQty,
              addons: existing.addons || [],
              notes: newQty > 0 ? existing.notes || "" : "",
            })
          ).unwrap();

          if (selectedShopId) await dispatch(fetchCartAsync({ shopId: selectedShopId })).unwrap();
          onSuccess?.(Math.max(0, prev - 1));
        } catch (err: any) {
          console.error("AddToCartControl.decrease failed:", err);
          if (mountedRef.current) setOptimisticQty(prev);
          Alert.alert("Error", err?.message ?? "Could not update cart. Try again.");
        } finally {
          if (mountedRef.current) setLocalLoading(false);
        }
        return;
      }

      // existing.quantity === 1 => show center loader and remove
      setLocalLoading(true);
      setCenterLoading(true);
      const start = Date.now();

      try {
        await dispatch(
          updateCartItemAsync({
            cartId: existing.cartId,
            quantity: 0,
            addons: existing.addons || [],
            notes: "",
          })
        ).unwrap();

        if (selectedShopId) await dispatch(fetchCartAsync({ shopId: selectedShopId })).unwrap();
        if (mountedRef.current) setOptimisticQty(0);
        onSuccess?.(0);
      } catch (err: any) {
        console.error("AddToCartControl.decrease->remove failed:", err);
        Alert.alert("Error", err?.message ?? "Could not remove item. Try again.");
      } finally {
        const elapsed = Date.now() - start;
        if (elapsed < (minLoadingMs ?? DEFAULT_MIN_LOADING_MS)) await wait((minLoadingMs ?? DEFAULT_MIN_LOADING_MS) - elapsed);
        if (mountedRef.current) {
          setCenterLoading(false);
          setLocalLoading(false);
        }
      }
    },
    [localLoading, cartMap, dispatch, menuId, serverQty, selectedShopId, disabled, onSuccess, minLoadingMs]
  );

  const displayQty = optimisticQty ?? 0;

  // small UI choices for a 'mini' variant
  const minWidth = variant === "mini" ? wp(18) : wp(20);
  const addBtnStyle = [styles.addBtn, { minWidth }, variant === "mini" && styles.addBtnMini];

  return (
    <View style={[styles.container, style]}>
      {centerLoading ? (
        <Animated.View style={[styles.centerSpinnerWrap, spinnerStyle]}>
          <ActivityIndicator size="small" color={theme.PRIMARY_COLOR} />
        </Animated.View>
      ) : displayQty === 0 ? (
        <TouchableOpacity
          style={addBtnStyle}
          onPress={() => handleAdd({ suppressToast: true })}
          accessibilityRole="button"
          accessibilityLabel={`Add ${String(item?.menuName ?? "item")}`}
          disabled={localLoading || disabled}
        >
          {localLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.addBtnText}>+ Add</Text>}
        </TouchableOpacity>
      ) : (
        <View style={styles.qtyRow}>
          <Pressable
            onPress={() => handleDecrease({ suppressToast: true })}
            disabled={localLoading || disabled}
            style={({ pressed }) => [{ padding: 6, transform: [{ scale: pressed ? 0.96 : 1 }] }]}
            accessibilityLabel={`Decrease ${String(item?.menuName ?? "item")}`}
          >
            <Ionicons name="remove-circle-outline" size={hp(3)} color={localLoading ? "#c7bdb7" : "#6C3F24"} />
          </Pressable>

          <View style={styles.qtyBox}>
            <Text style={styles.qtyText}>{displayQty}</Text>
          </View>

          <Pressable
            onPress={() => handleIncrease({ suppressToast: true })}
            disabled={localLoading || disabled}
            style={({ pressed }) => [{ padding: 6, transform: [{ scale: pressed ? 0.96 : 1 }] }]}
            accessibilityLabel={`Increase ${String(item?.menuName ?? "item")}`}
          >
            <Ionicons name="add-circle-outline" size={hp(3)} color={localLoading ? "#c7bdb7" : "#6C3F24"} />
          </Pressable>
        </View>
      )}
    </View>
  );
};

export default React.memo(AddToCartControl);

/* ------------------ Styles ------------------ */
const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
  addBtn: {
    marginTop: hp(0.8),
    paddingVertical: hp(0.6),
    paddingHorizontal: wp(3),
    borderRadius: 8,
    backgroundColor: theme.PRIMARY_COLOR,
    minWidth: wp(20),
    alignItems: "center",
  },
  addBtnMini: {
    paddingVertical: hp(0.45),
    paddingHorizontal: wp(2),
    minWidth: wp(18),
  },
  addBtnText: { color: "#fff", fontSize: Math.max(12, Math.round(wp(3.2))), fontWeight: "700" },
  qtyRow: { flexDirection: "row", alignItems: "center" },
  qtyBox: { minWidth: wp(8), alignItems: "center" },
  qtyText: { fontWeight: "700", fontSize: Math.max(13, Math.round(wp(3.4))) },
  centerSpinnerWrap: { width: wp(20), height: hp(3.6), alignItems: "center", justifyContent: "center" },
});
