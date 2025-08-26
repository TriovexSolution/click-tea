// MenuDetailScreen.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert,
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { hp, wp } from "@/src/assets/utils/responsive";
import theme from "@/src/assets/colors/theme";
import { BASE_URL } from "@/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { addToCartAsync, selectCartItems, updateCartItemAsync } from "@/src/Redux/Slice/cartSlice";
import CartIconWithBadge from "@/src/components/CartIconBadge";

/**
 * Optional: For production, consider using `react-native-fast-image`
 * for better caching/performance:
 * import FastImage from "react-native-fast-image";
 *
 * Then use <FastImage source={{ uri }} style={...} />
 */

// Enable LayoutAnimation on Android (safe guard)
// if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

/** --- Types --- **/
// type RouteParams = {
//   MenuDetail: { menuId: number; menuName?: string } | undefined;
// };

// type Props = NativeStackScreenProps<RouteParams, "MenuDetail">;

type MenuItem = {
  menuId?: number;
  menuName?: string;
  imageUrl?: string;
  price?: string | number | null;
  ingredients?: string | null;
  isAvailable?: number;
  rating?: number;
  status?: string;
  category?: { categoryId?: number; categoryName?: string } | null;
  shop?: { shopId?: number; shopName?: string; shopAddress?: string } | null;
};

const fallbackImage = require("@/src/assets/images/onBoard1.png");

/** --- Helpers --- **/
const safeNumber = (v: any, fallback = 0) => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(/[^0-9.-]+/g, ""));
  return Number.isFinite(n) ? n : fallback;
};

const formatPrice = (v: any) => {
  const n = safeNumber(v, 0);
  // keep two decimals
  return `₹${n.toFixed(2)}`;
};

const parseIngredients = (raw?: string | null) => {
  if (!raw) return [];
  // split on line breaks, bullets, semicolons or commas; trim; remove empties
  const parts = raw
    .split(/\r?\n|•|•|;|,|·/)
    .map((s) => s.trim())
    .filter(Boolean);
  // keep unique small set (but preserve order)
  const seen = new Set<string>();
  return parts.filter((p) => {
    if (p.length < 2) return false;
    if (seen.has(p.toLowerCase())) return false;
    seen.add(p.toLowerCase());
    return true;
  });
};

/** --- Component --- **/
const MenuDetailScreen = ({ route }:any) => {
  const menuId = route?.params?.menuId;
  const initialMenuName = route?.params?.menuName;

  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const [menu, setMenu] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<{ [k: string]: boolean }>({
    ingredients: true,
    nutritional: false,
    info: false,
  });
  const [qty, setQty] = useState<number>(1);

  const cancelRef = useRef(axios.CancelToken.source());
  const isMountedRef = useRef(true);
  const tokenRef = useRef<string | null>(null);
const cartItems = useSelector(selectCartItems);
const dispatch = useDispatch();
const [cartMap, setCartMap] = useState({});
const [cartLoaded, setCartLoaded] = useState(false);

useEffect(() => {
  const map = {};
  cartItems.forEach((item) => {
    map[item.menuId] = { ...item.menu, quantity: item.quantity, cartId: item.cartId, addons: item.addons, notes: item.notes };
  });
  setCartMap(map);
}, [cartItems]);
  useEffect(() => {
    isMountedRef.current = true;
    (async () => {
      try {
        tokenRef.current = await AsyncStorage.getItem("authToken");
      } catch {
        tokenRef.current = null;
      }
      await fetchMenu(); // initial fetch
    })();

    return () => {
      isMountedRef.current = false;
      cancelRef.current?.cancel("unmount");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuId]);

  const fetchMenu = useCallback(async () => {
    if (!menuId) {
      if (isMountedRef.current) {
        setError("Missing menu id");
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      cancelRef.current?.cancel("new request");
      cancelRef.current = axios.CancelToken.source();

      const res = await axios.get(`${BASE_URL}/api/menu/${menuId}`, {
        headers: tokenRef.current ? { Authorization: `Bearer ${tokenRef.current}` } : undefined,
        cancelToken: cancelRef.current.token,
        timeout: 15000,
      });

      // backend returns { data: menuObject } from your server
      const m: MenuItem | null = res?.data?.data ?? null;

      if (!m) {
        if (isMountedRef.current) {
          setError("Menu not found");
          setMenu(null);
        }
      } else {
        if (isMountedRef.current) {
          setMenu(m);
          setError(null);
        }
      }
    } catch (err: any) {
      if (!axios.isCancel(err)) {
        const message = err?.response?.data?.message ?? err.message ?? "Failed to load menu";
        console.warn("fetchMenu error:", message, err?.response?.data ?? err);
        if (isMountedRef.current) setError(message);
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [menuId]);

  const toggleSection = useCallback((key: string) => {
    // smooth animation
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    } catch {
      // fall back if not supported
    }
    setExpanded((s) => ({ ...s, [key]: !s[key] }));
  }, []);

  const increase = useCallback(() => setQty((q) => q + 1), []);
  const decrease = useCallback(() => setQty((q) => Math.max(1, q - 1)), []);

const handleAddQty = async () => {
  if (!menu?.menuId) return;
  const existing = cartMap[menu.menuId];
  const quantity = existing ? existing.quantity + qty : qty; // qty from footer
  const cartId = existing?.cartId;

  if (!existing) {
    try {
      const userId = await AsyncStorage.getItem("userId");
      const res = await dispatch(addToCartAsync({
        userId,
        shopId: menu?.shop?.shopId,
        menuId: menu.menuId,
        quantity: qty,
        addons: [],
        notes: "",
      })).unwrap();

      setCartMap((prev) => ({
        ...prev,
        [menu.menuId]: { ...menu, quantity: qty, cartId: res.cartId },
      }));
    } catch (err) {
      console.error("Add to cart failed:", err);
    }
  } else {
    dispatch(updateCartItemAsync({
      cartId,
      quantity,
      addons: existing.addons || [],
      notes: existing.notes || "",
    }));
    setCartMap((prev) => ({
      ...prev,
      [menu.menuId]: { ...menu, quantity, cartId },
    }));
  }
};
  // Derived values memoized to avoid recalculating each render
  const ingredientLines = useMemo(() => parseIngredients(menu?.ingredients ?? null), [menu?.ingredients]);
  const unitPrice = useMemo(() => safeNumber(menu?.price, 0), [menu?.price]);
  const totalPriceText = useMemo(() => formatPrice(unitPrice * qty), [unitPrice, qty]);

  // Render loading / error states
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ActivityIndicator size="large" color={theme.PRIMARY_COLOR} style={{ marginTop: hp(10) }} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back-outline" size={hp(3)} color={theme.PRIMARY_COLOR} />
          </Pressable>
          <Text style={styles.headerTitle}>{initialMenuName ?? "Product Details"}</Text>
          <View style={{ width: wp(8) }} />
        </View>

        <View style={styles.centerError}>
          <Text style={{ color: "#333", fontSize: hp(2) }}>{error}</Text>
          <Pressable onPress={fetchMenu} style={styles.retryBtn}>
            <Text style={{ color: "#fff", fontWeight: "600" }}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Main UI
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Back">
          <Ionicons name="chevron-back-outline" size={hp(3)} color={theme.PRIMARY_COLOR} />
        </Pressable>
        <Text style={styles.headerTitle}>{menu?.menuName ?? "Product Details"}</Text>
        <View style={{ width: wp(8) }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Image */}
        <View style={styles.imageWrapper}>
          <Image
            source={menu?.imageUrl ? { uri: `${BASE_URL}/uploads/menus/${menu.imageUrl}` } : fallbackImage}
            style={styles.mainImage}
            resizeMode="cover"
            defaultSource={fallbackImage}
          />
        </View>

        {/* Info */}
        <View style={styles.infoBlock}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.titleText} numberOfLines={2}>
                {menu?.menuName ?? "Unnamed Item"}
              </Text>
              <Text style={styles.subText} numberOfLines={2}>
                {menu?.ingredients ? menu.ingredients.split(".")[0] : "Traditional and herbal item"}
              </Text>
            </View>

            {menu?.rating && menu.rating > 0 ? (
              <View style={styles.popularSmall}>
                <Text style={styles.popularSmallText}>Popular</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={hp(1.6)} color="#f1c40f" />
              <Text style={styles.metaText}>{menu?.rating ?? "—"}</Text>
            </View>

            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={hp(1.6)} color="#666" />
              <Text style={styles.metaText}>15-20 min</Text>
            </View>

            <View style={styles.metaItem}>
              <Text style={[styles.metaText, { fontWeight: "700" }]}>30ML</Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceText}>{formatPrice(menu?.price ?? 0)}</Text>
          </View>
        </View>

        {/* Two feature cards */}
        <View style={styles.featureRow}>
          <View style={styles.featureCard}>
            <Ionicons name="cube-outline" size={hp(3.2)} color="#666" />
            <Text style={styles.featureText}>No return</Text>
          </View>
          <View style={styles.featureCard}>
            <Ionicons name="rocket-outline" size={hp(3.2)} color="#666" />
            <Text style={styles.featureText}>Fast delivery</Text>
          </View>
        </View>

        {/* Accordions */}
        <View style={styles.card}>
          {/* Ingredients */}
          <Pressable onPress={() => toggleSection("ingredients")} style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Ingredients</Text>
            <Ionicons name={expanded.ingredients ? "chevron-up-outline" : "chevron-down-outline"} size={hp(2)} color="#666" />
          </Pressable>
          {expanded.ingredients && (
            <View style={styles.cardBody}>
              {ingredientLines.length ? (
                ingredientLines.map((line, i) => (
                  <View key={i} style={styles.ingredientRow}>
                    <Text style={styles.ingredientText}>{line}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.ingredientTextSmall}>No detailed ingredients available.</Text>
              )}
            </View>
          )}

          {/* Nutritional */}
          <Pressable onPress={() => toggleSection("nutritional")} style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Nutritional</Text>
            <Ionicons name={expanded.nutritional ? "chevron-up-outline" : "chevron-down-outline"} size={hp(2)} color="#666" />
          </Pressable>
          {expanded.nutritional && (
            <View style={styles.cardBody}>
              <Text style={styles.ingredientTextSmall}>Nutritional info not available.</Text>
            </View>
          )}

          {/* Info */}
          <Pressable onPress={() => toggleSection("info")} style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Info</Text>
            <Ionicons name={expanded.info ? "chevron-up-outline" : "chevron-down-outline"} size={hp(2)} color="#666" />
          </Pressable>
          {expanded.info && (
            <View style={styles.cardBody}>
              <Text style={styles.ingredientTextSmall}>No extra information.</Text>
            </View>
          )}
        </View>

        <View style={{ height: hp(12) }} />
      </ScrollView>

{/* --- Footer --- */}
<View style={styles.footer}>
  {!cartMap[menu?.menuId ?? ""] ? (
    // First time: Add to cart button
    <Pressable style={styles.addToCartBtn} onPress={handleAddQty}>
      <Text style={styles.addToCartText}>Add To Cart</Text>
    </Pressable>
  ) : (
    <View style={styles.footerRow}>
      {/* Left: View Cart Button */}
      <Pressable
        style={styles.viewCartBtn}
        onPress={() => navigation.navigate("Cart")}
      >
        <CartIconWithBadge />
        <Text style={styles.viewCartText}>View Cart</Text>
      </Pressable>

      {/* Right: Qty Control */}
      <View style={styles.qtyControlBox}>
        <Pressable
          onPress={async () => {
            const existing = cartMap[menu?.menuId];
            if (!existing) return;
            const newQty = existing.quantity - 1;

            if (newQty <= 0) {
              await dispatch(updateCartItemAsync({
                cartId: existing.cartId,
                quantity: 0,
                addons: [],
                notes: "",
              }));
              setCartMap((prev) => {
                const copy = { ...prev };
                delete copy[menu?.menuId];
                return copy;
              });
            } else {
              dispatch(updateCartItemAsync({
                cartId: existing.cartId,
                quantity: newQty,
                addons: existing.addons || [],
                notes: existing.notes || "",
              }));
              setCartMap((prev) => ({
                ...prev,
                [menu?.menuId]: { ...existing, quantity: newQty },
              }));
            }
          }}
          style={styles.qtyBtn}
        >
          <Text style={styles.qtyBtnText}>−</Text>
        </Pressable>

        <Text style={styles.qtyText}>{cartMap[menu?.menuId]?.quantity}</Text>

        <Pressable
          onPress={() => {
            const existing = cartMap[menu?.menuId];
            if (!existing) return;
            const newQty = existing.quantity + 1;

            dispatch(updateCartItemAsync({
              cartId: existing.cartId,
              quantity: newQty,
              addons: existing.addons || [],
              notes: existing.notes || "",
            }));
            setCartMap((prev) => ({
              ...prev,
              [menu?.menuId]: { ...existing, quantity: newQty },
            }));
          }}
          style={styles.qtyBtn}
        >
          <Text style={styles.qtyBtnText}>+</Text>
        </Pressable>
      </View>
    </View>
  )}
</View>


    </SafeAreaView>
  );
};

export default MenuDetailScreen;

/** --- Styles --- **/
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { paddingBottom: hp(20) },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.2),
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: hp(2.1),
    fontWeight: "600",
    color: theme.PRIMARY_COLOR,
    textAlign: "center",
    flex: 1,
  },

  imageWrapper: {
    paddingHorizontal: wp(4),
    paddingTop: hp(1.5),
  },
  mainImage: {
    width: "100%",
    height: hp(28),
    borderRadius: wp(3),
    backgroundColor: "#eee",
  },

  infoBlock: {
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
  },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  titleText: { fontSize: hp(2.0), fontWeight: "700", color: "#222" },
  subText: { fontSize: hp(1.4), color: "#777", marginTop: hp(0.4) },

  popularSmall: {
    backgroundColor: "#eafaf1",
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.4),
    borderRadius: wp(2),
    marginLeft: wp(3),
  },
  popularSmallText: { color: "#2aa35a", fontWeight: "700", fontSize: hp(1.0) },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(1.1),
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: wp(5),
  },
  metaText: { color: "#666", marginLeft: wp(1), fontSize: hp(1.4) },

  priceRow: { paddingHorizontal: wp(4), marginTop: hp(1.2) },
  priceText: { fontSize: hp(2), fontWeight: "800", color: "#222" },
  originalPrice: { fontSize: hp(1.5), color: "#999", textDecorationLine: "line-through", marginLeft: wp(2) },

  featureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    marginTop: hp(2),
  },
  featureCard: {
    width: wp(44),
    backgroundColor: "#fafafa",
    borderRadius: wp(2),
    paddingVertical: hp(2),
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  featureText: { marginTop: hp(1), color: "#666", fontSize: hp(1.4) },

  card: {
    marginTop: hp(2),
    marginHorizontal: wp(4),
    borderRadius: wp(2),
    backgroundColor: "#fff",
    paddingVertical: hp(1),
    paddingHorizontal: wp(3),
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: hp(1.1),
  },
  cardTitle: { fontSize: hp(1.6), fontWeight: "700", color: "#222" },
  cardBody: { paddingBottom: hp(1) },

  ingredientRow: {
    paddingVertical: hp(0.6),
    borderBottomColor: "#f5f5f5",
    borderBottomWidth: 1,
  },
  ingredientText: { fontSize: hp(1.4), color: "#333" },
  ingredientTextSmall: { fontSize: hp(1.3), color: "#777" },

footer: {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  flexDirection: "row",
  paddingHorizontal: wp(3),
  paddingVertical: hp(1.2),
  backgroundColor: "#fff",
  borderTopWidth: 1,
  borderTopColor: "#eee",
  alignItems: "center",
  justifyContent: "space-between",
  paddingBottom: Platform.OS === "ios" ? hp(2.5) : hp(1.2), // SafeArea
},

footerRow: {
  flexDirection: "row",
  width: "100%",
  alignItems: "center",
},

addToCartBtn: {
  flex: 1,
  backgroundColor: theme.PRIMARY_COLOR,
  paddingVertical: hp(1.6),
  borderRadius: wp(2),
  alignItems: "center",
  justifyContent: "center",
},

addToCartText: {
  color: "#fff",
  fontSize: hp(1.9),
  fontWeight: "700",
},

viewCartBtn: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#fff",
  borderColor: "#ccc",
  borderWidth: 1,
  paddingHorizontal: wp(4),
  paddingVertical: hp(1.4),
  borderRadius: wp(2),
  flex: 1,
  marginRight: wp(3),
  justifyContent: "center",
},

viewCartText: {
  marginLeft: wp(2),
  fontSize: hp(1.7),
  fontWeight: "600",
  color: "#333",
},

qtyControlBox: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: theme.PRIMARY_COLOR,
  paddingHorizontal: wp(3),
  borderRadius: wp(2),
  minWidth: wp(28),
  justifyContent: "space-between",
},

qtyBtn: {
  paddingHorizontal: wp(2),
  paddingVertical: hp(0.6),
},

qtyBtnText: {
  fontSize: hp(2.4),
  color: "#fff",
  fontWeight: "700",
},

qtyText: {
  fontSize: hp(1.9),
  fontWeight: "700",
  color: "#fff",
},

  centerError: { flex: 1, justifyContent: "center", alignItems: "center" },
  retryBtn: {
    marginTop: hp(2),
    backgroundColor: theme.PRIMARY_COLOR,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: wp(2),
  },
});
