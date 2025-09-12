// // TeaAndCoffeeScreen.tsx
// import React, { useCallback, useMemo } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   Image,
//   RefreshControl,
//   SafeAreaView,
//   StatusBar,
//   Platform,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import apiClient from "@/src/api/client";
// import theme from "@/src/assets/colors/theme";
// import { hp, wp } from "@/src/assets/utils/responsive";
// import { useSelector, shallowEqual } from "react-redux";
// import { useNavigation } from "@react-navigation/native";

// /* ---------------- types ---------------- */
// type RootState = any;
// type Menu = {
//   menuId: number;
//   menuName: string;
//   menuImage?: string | null;
//   price?: number | null;
//   qty?: string | null;
// };
// type ShopWithMenus = {
//   shopId: number;
//   shopName: string;
//   shopImage?: string | null;
//   distanceKm?: number | null;
//   distanceMeters?: number | null;
//   menus: Menu[];
// };

// /* ---------------- helpers ---------------- */
// const RUPEE = "₹";
// const formatPrice = (p?: number | string | null) => {
//   const num = Number(p);
//   return Number.isFinite(num) ? `${RUPEE}${Math.round(num)}` : "—";
// };
// const toMeters = (km?: number | null) =>
//   typeof km === "number" && Number.isFinite(km)
//     ? `${Math.round(km * 1000)}m`
//     : "—";

// /* ---------------- Menu Card ---------------- */
// const MenuCard: React.FC<{ item: Menu; onPressMenu: (id: number) => void }> =
//   React.memo(({ item, onPressMenu }) => {
//     const base = apiClient?.defaults?.baseURL ?? "";
//     const menuImage =
//       item.menuImage &&
//       (item.menuImage.startsWith("http") || item.menuImage.startsWith("data:"))
//         ? item.menuImage
//         : item.menuImage
//         ? `${base.replace(/\/$/, "")}/uploads/menus/${item.menuImage}`
//         : null;

//     return (
//       <TouchableOpacity
//         activeOpacity={0.9}
//         onPress={() => onPressMenu(item.menuId)}
//         style={styles.menuCard}
//       >
//         <Image
//           source={
//             menuImage
//               ? { uri: menuImage }
//               : require("@/src/assets/images/onBoard1.png")
//           }
//           style={styles.menuImage}
//           resizeMode="cover"
//         />
//         <View style={styles.menuContent}>
//           <Text style={styles.menuName} numberOfLines={1}>
//             {item.menuName}
//           </Text>
//           <Text style={styles.menuPrice}>{formatPrice(item.price)}</Text>
//         </View>
//       </TouchableOpacity>
//     );
//   });
// MenuCard.displayName = "MenuCard";

// /* ---------------- Shop Card ---------------- */
// const ShopCard: React.FC<{
//   shop: ShopWithMenus;
//   onPressShop: (shopId: number) => void;
//   onPressMenu: (id: number) => void;
// }> = ({ shop, onPressShop, onPressMenu }) => {
//   return (
//     <View style={styles.shopCard}>
//       <TouchableOpacity
//         style={styles.shopHeader}
//         activeOpacity={0.9}
//         onPress={() => onPressShop(shop.shopId)}
//       >
//         <Image
//           source={
//             shop.shopImage
//               ? { uri: shop.shopImage }
//               : require("@/src/assets/images/onBoard1.png")
//           }
//           style={styles.shopImage}
//         />
//         <View style={{ flex: 1, marginLeft: wp(3) }}>
//           <Text style={styles.shopName}>{shop.shopName}</Text>
//           {typeof shop.distanceKm === "number" && (
//             <Text style={styles.shopDistance}>{toMeters(shop.distanceKm)}</Text>
//           )}
//         </View>
//         <Ionicons name="chevron-forward" size={18} color="#666" />
//       </TouchableOpacity>

//       {/* Menus */}
//       <FlatList
//         data={shop.menus}
//         keyExtractor={(m) => String(m.menuId)}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={{ paddingHorizontal: wp(3) }}
//         renderItem={({ item }) => (
//           <MenuCard item={item} onPressMenu={onPressMenu} />
//         )}
//       />
//     </View>
//   );
// };

// /* ---------------- Screen ---------------- */
// const TeaAndCoffeeScreen: React.FC = () => {
//   const insets = useSafeAreaInsets();
//   const navigation = useNavigation<any>();
//   const queryClient = useQueryClient();

//   const location = useSelector((s: RootState) => s.location, shallowEqual);
//   const lat = location?.latitude;
//   const lng = location?.longitude;

//   const {
//     data: shops = [],
//     isLoading,
//     isFetching,
//     isError,
//     refetch,
//   } = useQuery<ShopWithMenus[]>({
//     queryKey: ["nearbyTeaCoffeeShops", lat, lng],
//     queryFn: async () => {
//       if (!lat || !lng) return [];
//       const res = await apiClient.get("/api/menu/nearby/tea-coffee", {
//         params: { lat, lng },
//       });
//       const payload = res?.data;
//       return Array.isArray(payload?.data) ? payload.data : [];
//     },
//     enabled: !!lat && !!lng,
//     staleTime: 30_000,
//     cacheTime: 120_000,
//     refetchOnWindowFocus: false,
//     retry: 1,
//   });

//   const onRefresh = useCallback(async () => {
//     try {
//       await queryClient.invalidateQueries({
//         queryKey: ["nearbyTeaCoffeeShops", lat, lng],
//       });
//       await refetch();
//     } catch (err) {
//       console.warn("refresh error", err);
//     }
//   }, [queryClient, refetch, lat, lng]);

//   const openMenu = useCallback(
//     (menuId: number) => {
//       navigation.navigate("menuDetailScreen", { menuId });
//     },
//     [navigation]
//   );

//   const openShop = useCallback(
//     (shopId: number) => {
//       navigation.navigate("shopDetailScreen", { shopId });
//     },
//     [navigation]
//   );

//   const renderShop = useCallback(
//     ({ item }: { item: ShopWithMenus }) => (
//       <ShopCard shop={item} onPressShop={openShop} onPressMenu={openMenu} />
//     ),
//     [openShop, openMenu]
//   );

//   const showNoLocation = !lat || !lng;
//   const isEmpty = !isLoading && Array.isArray(shops) && shops.length === 0;

//   return (
//     <SafeAreaView style={[styles.safe,]}>
//       <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

//       {/* <LinearGradient colors={["#fff", "#fff"]} style={styles.header}> */}
//       <View style={styles.header}>
//         <Text style={styles.title}>Tea & Coffee near you</Text>
//         <Text style={styles.subtitle}>
//           Only items within 1 km · Fresh & local
//         </Text>
//       </View>
//       {/* </LinearGradient> */}

//       {showNoLocation ? (
//         <View style={styles.center}>
//           <Ionicons
//             name="location-outline"
//             size={72}
//             color={theme.PRIMARY_COLOR}
//           />
//           <Text style={styles.centerText}>Location not set</Text>
//           <Text style={styles.centerSub}>
//             Allow location or set it to see nearby shops.
//           </Text>
//         </View>
//       ) : isLoading ? (
//         <View style={styles.center}>
//           <Text>Loading...</Text>
//         </View>
//       ) : isError ? (
//         <View style={styles.center}>
//           <Text style={{ color: "red" }}>Failed to load shops.</Text>
//         </View>
//       ) : (
//         <FlatList
//           data={shops}
//           renderItem={renderShop}
//           keyExtractor={(it) => String(it.shopId)}
//           refreshControl={
//             <RefreshControl
//               refreshing={isFetching}
//               onRefresh={onRefresh}
//               tintColor={theme.PRIMARY_COLOR}
//             />
//           }
//           ListEmptyComponent={
//             isEmpty ? (
//               <View style={styles.center}>
//                 <Ionicons name="cafe-outline" size={48} color="#999" />
//                 <Text style={styles.centerText}>
//                   No tea/coffee shops nearby
//                 </Text>
//               </View>
//             ) : null
//           }
//           contentContainerStyle={{ paddingBottom: hp(12), paddingTop: hp(1) }}
//         />
//       )}
//     </SafeAreaView>
//   );
// };

// export default TeaAndCoffeeScreen;

// /* ---------------- styles ---------------- */
// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: "#fff" },
//   header: {
//     // backgroundColor: "#efe7ff",
//     backgroundColor: "#EADDCA",
//     // backgroundColor: "#F2D2BD",
//     // backgroundColor: "#F5DEB3",
//     // backgroundColor: "#F2D2BD",
//     paddingHorizontal: wp(4),
//     paddingVertical: hp(2),
//     paddingTop: Platform.OS === "android" ? hp(7) : 0,
//   },
//   title: { fontSize: hp(2.6), fontWeight: "800", color: "#222" },
//   subtitle: { color: "#666", marginTop: hp(0.4), fontSize: hp(1.6) },

//   center: { marginTop: hp(8), alignItems: "center" },
//   centerText: { fontSize: hp(2), fontWeight: "700", marginTop: hp(1) },
//   centerSub: {
//     color: "#777",
//     marginTop: hp(0.6),
//     textAlign: "center",
//     paddingHorizontal: wp(6),
//   },

//   shopCard: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     marginVertical: hp(1),
//     marginHorizontal: wp(3),
//     shadowColor: "#000",
//     shadowOpacity: 0.05,
//     shadowRadius: 6,
//     shadowOffset: { width: 0, height: 2 },
//     elevation: 2,
//   },
//   shopHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: wp(3),
//   },
//   shopImage: {
//     width: wp(14),
//     height: wp(14),
//     borderRadius: wp(7),
//     backgroundColor: "#eee",
//   },
//   shopName: { fontSize: hp(2), fontWeight: "700", color: "#222" },
//   shopDistance: { color: "#666", fontSize: hp(1.4), marginTop: 2 },

//   menuCard: {
//     width: wp(32),
//     marginRight: wp(3),
//     backgroundColor: "#fafafa",
//     borderRadius: 10,
//     overflow: "hidden",
//   },
//   menuImage: { width: "100%", height: wp(24), backgroundColor: "#eee" },
//   menuContent: { padding: wp(2) },
//   menuName: { fontSize: hp(1.6), fontWeight: "600", color: "#222" },
//   menuPrice: { fontSize: hp(1.5), color: theme.PRIMARY_COLOR, marginTop: 2 },
// });
// TeaAndCoffeeScreen.tsx
// TeaAndCoffeeScreen.tsx
// TeaAndCoffeeScreen.tsx
// TeaAndCoffeeScreen.tsx
// TeaAndCoffeeScreen.tsx
// TeaAndCoffeeScreen.js
import React, { useCallback, useMemo, useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions,
  Animated,
  ActivityIndicator,
  Alert,
  ToastAndroid,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import apiClient from "@/src/api/client";
import theme from "@/src/assets/colors/theme";
import { hp, wp } from "@/src/assets/utils/responsive";
import { useDispatch } from "react-redux";
import { addToCartAsync, fetchCartAsync } from "@/src/Redux/Slice/cartSlice";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { BestSellerRow, ShopGrouped } from "@/src/assets/types/userDataType";

const SCREEN_WIDTH = Dimensions.get("window").width;
const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);
const MAX_PER_SHOP = 2; // change as needed
const GRID_BREAKPOINT = 5; // show compact grid when shop count >= this
const RUPEE = "₹";
const formatPrice = (p?: number | string | null) => {
  const num = Number(p);
  return Number.isFinite(num) ? `${RUPEE}${Math.round(num)}` : "—";
};

/* ---------------- shimmer hook ---------------- */
const useShimmer = (width = SCREEN_WIDTH) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 1100,
        useNativeDriver: true,
      })
    );
    anim.setValue(0);
    loop.start();
    return () => loop.stop();
  }, [anim]);
  const translateFor = (shimmerWidth: number) =>
    anim.interpolate({
      inputRange: [0, 1],
      outputRange: [-shimmerWidth, width + shimmerWidth],
    });
  return { anim, translateFor };
};

/* ---------------- field helpers ---------------- */
const isBestSellerRow = (row: BestSellerRow | any): boolean => {
  if (!row || typeof row !== "object") return false;
  const candidates = ["is_bestseller", "is_bestsellers", "isBestSeller", "is_best", "best", "is_bestseleers"];
  for (const k of candidates) {
    if (Object.prototype.hasOwnProperty.call(row, k)) {
      const v = row[k];
      if (v === 1 || v === "1" || v === true) return true;
      return false;
    }
  }
  // fallback: endpoint may already return only best sellers
  return Boolean(row.menuId || row.menuName);
};

const extractShopId = (row: any): number => Number(row?.shopId ?? row?.shopid ?? row?.shop_id ?? row?.id ?? 0) || 0;
const extractShopName = (row: any): string => row?.shopname ?? row?.shopName ?? row?.shop_name ?? row?.name ?? "Unknown";
const extractShopImage = (row: any): string | null => row?.shopImage ?? row?.shop_image ?? row?.shopImg ?? null;

/* ---------------- MenuThumb ---------------- */
const MenuThumb: React.FC<{ menu?: BestSellerRow; style?: any }> = ({ menu, style }) => {
  const base = apiClient?.defaults?.baseURL ?? "";
  const uri =
    menu?.imageUrl && (String(menu.imageUrl).startsWith("http") || String(menu.imageUrl).startsWith("data:"))
      ? menu.imageUrl
      : menu?.imageUrl
      ? `${base.replace(/\/$/, "")}/uploads/menus/${menu.imageUrl}`
      : null;

  return (
    <Image
      source={uri ? { uri } : require("@/src/assets/images/onBoard1.png")}
      style={[styles.thumb, style]}
      resizeMode="cover"
    />
  );
};

/* ---------------- BestSellerBox ---------------- */
const BestSellerBox: React.FC<{
  menu?: BestSellerRow;
  onAdd: (m: BestSellerRow) => void;
  adding?: boolean;
  compact?: boolean;
}> = React.memo(({ menu, onAdd, adding = false, compact = false }) => {
  return (
    <View style={[styles.bestSellerBox, compact && styles.bestSellerBoxCompact]}>
      <Text style={[styles.bestSellerTitle, compact && styles.bestSellerTitleCompact]} numberOfLines={1}>
        {menu?.menuName ?? "Item"}
      </Text>

      <MenuThumb menu={menu} style={compact ? styles.thumbCompact : undefined} />

      <Text style={[styles.bestSellerPrice, compact && styles.bestSellerPriceCompact]}>{formatPrice(menu?.price)}</Text>

      <Pressable
        onPress={() => menu && onAdd(menu)}
        disabled={adding}
        style={({ pressed }) => [
          styles.addBtnMini,
          pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
          adding && { opacity: 0.7 },
          compact && styles.addBtnMiniCompact,
        ]}
        accessibilityLabel={`Add ${menu?.menuName ?? "item"} to cart`}
      >
        {adding ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.addBtnMiniText}>+ Add</Text>}
      </Pressable>
    </View>
  );
});
BestSellerBox.displayName = "BestSellerBox";

/* ---------------- ShopCard ---------------- */
const ShopCard: React.FC<{ shop: ShopGrouped; onAddToCart: (m: BestSellerRow) => void; addingIds: Set<number> }> = React.memo(
  ({ shop, onAddToCart, addingIds }) => {
    const shopImageUri =
      shop?.shopImage && (String(shop.shopImage).startsWith("http") || String(shop.shopImage).startsWith("data:"))
        ? shop.shopImage
        : shop?.shopImage
        ? `${apiClient.defaults.baseURL?.replace(/\/$/, "")}/uploads/shops/${shop.shopImage}`
        : null;

    const moreThanTwo = (shop.bestMenus?.length || 0) > 2;

    return (
      <View style={styles.shopCard}>
        <View style={styles.shopTop}>
          <Image source={shopImageUri ? { uri: shopImageUri } : require("@/src/assets/images/onBoard1.png")} style={styles.shopAvatar} />
          <Text style={styles.shopNameHeader} numberOfLines={1}>
            {shop.shopName}
          </Text>
        </View>

        <View style={styles.divider} />

        {shop.bestMenus && shop.bestMenus.length > 0 ? (
          moreThanTwo ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: wp(3) }}>
              {shop.bestMenus.map((menu, idx) => (
                <View key={menu.menuId ?? idx} style={{ width: wp(40), marginRight: wp(3) }}>
                  <BestSellerBox menu={menu} onAdd={onAddToCart} adding={addingIds.has(menu.menuId)} compact />
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.bestRow}>
              {shop.bestMenus.map((menu) => (
                <View key={menu.menuId} style={{ flex: 1 }}>
                  <BestSellerBox menu={menu} onAdd={onAddToCart} adding={addingIds.has(menu.menuId)} />
                </View>
              ))}
              {shop.bestMenus.length === 1 && <View style={{ flex: 1 }} />}
            </View>
          )
        ) : (
          <View style={{ padding: hp(2), alignItems: "center" }}>
            <Text style={styles.noMenuTextSmall}>No best sellers</Text>
          </View>
        )}
      </View>
    );
  }
);
ShopCard.displayName = "ShopCard";

/* ---------------- Compact card for grid ---------------- */
const ShopCardCompact: React.FC<{ shop: ShopGrouped; onAddToCart: (m: BestSellerRow) => void; addingIds: Set<number> }> = React.memo(
  ({ shop, onAddToCart, addingIds }) => {
    const shopImageUri =
      shop?.shopImage && (String(shop.shopImage).startsWith("http") || String(shop.shopImage).startsWith("data:"))
        ? shop.shopImage
        : shop?.shopImage
        ? `${apiClient.defaults.baseURL?.replace(/\/$/, "")}/uploads/shops/${shop.shopImage}`
        : null;

    return (
      <View style={styles.compactCard}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image source={shopImageUri ? { uri: shopImageUri } : require("@/src/assets/images/onBoard1.png")} style={styles.shopAvatarSmall} />
          <Text style={styles.shopNameCompact} numberOfLines={1}>
            {shop.shopName}
          </Text>
        </View>

        <View style={{ marginTop: hp(1) }}>
          {shop.bestMenus && shop.bestMenus.length > 0 ? (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {shop.bestMenus.slice(0, 2).map((m) => (
                <View key={m.menuId} style={{ flex: 1, marginRight: wp(2) }}>
                  <BestSellerBox menu={m} onAdd={onAddToCart} adding={addingIds.has(m.menuId)} compact />
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noMenuTextSmall}>No best sellers</Text>
          )}
        </View>
      </View>
    );
  }
);
ShopCardCompact.displayName = "ShopCardCompact";

/* ---------------- Skeleton ---------------- */
const SkeletonList = () => {
  const { translateFor } = useShimmer();
  const shimmerWidth = Math.round(SCREEN_WIDTH * 0.6);
  const translate = translateFor(shimmerWidth);
  const gradientColors = ["rgba(255,255,255,0)", "rgba(255,255,255,0.55)", "rgba(255,255,255,0)"];
  return (
    <View style={{ padding: wp(3) }}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.shopCardSkeleton}>
          <View style={styles.shopTopSkeleton}>
            <View style={styles.shopAvatarSkeleton} />
            <View style={{ flex: 1, paddingLeft: wp(2) }}>
              <View style={styles.skelLineShort} />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.bestRowSkeleton}>
            <View style={styles.bestBoxSkeleton}>
              <View style={styles.skelThumb} />
              <View style={[styles.skelLine, { width: wp(26), marginTop: hp(0.6) }]} />
              <View style={[styles.skelLine, { width: wp(14), marginTop: hp(0.5) }]} />
            </View>

            <View style={styles.bestBoxSkeleton}>
              <View style={styles.skelThumb} />
              <View style={[styles.skelLine, { width: wp(26), marginTop: hp(0.6) }]} />
              <View style={[styles.skelLine, { width: wp(14), marginTop: hp(0.5) }]} />
            </View>
          </View>

          <AnimatedGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.shimmerOverlay, { width: shimmerWidth, transform: [{ translateX: translate }] }]}
          />
        </View>
      ))}
    </View>
  );
};

/* ---------------- Main screen ---------------- */
const TeaAndCoffeeBestSellersScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const dispatch = useDispatch<any>();
  const navigation = useNavigation();
  const [addingIds, setAddingIds] = useState<Set<number>>(new Set());

  const { data: rawMenus = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ["bestSellersAll"],
    queryFn: async () => {
      const res = await apiClient.get("/api/best-sellers/all");
      // console.log(res.data);
      
      if (Array.isArray(res?.data?.data)) return res.data.data;
      if (Array.isArray(res?.data?.items)) return res.data.items;
      if (Array.isArray(res?.data)) return res.data;
      return [];
    },
    staleTime: 30_000,
    cacheTime: 120_000,
    refetchOnWindowFocus: false,
  });

  // group or flat fallback
  const { shops, flatBestMenus } = useMemo(() => {
    const filtered = (rawMenus || []).filter((r: any) => isBestSellerRow(r));
    const hasShopId = filtered.some((r: any) => Boolean(extractShopId(r)));
    if (!hasShopId) return { shops: [] as ShopGrouped[], flatBestMenus: filtered as BestSellerRow[] };
    const map = new Map<number, ShopGrouped>();
    filtered.forEach((m: any) => {
      const sid = extractShopId(m);
      if (!map.has(sid)) {
        map.set(sid, { shopId: sid, shopName: extractShopName(m), shopImage: extractShopImage(m), bestMenus: [] });
      }
      map.get(sid)!.bestMenus.push(m);
    });
    const result = Array.from(map.values()).map((s) => ({ ...s, bestMenus: s.bestMenus.slice(0, MAX_PER_SHOP * 2) }));
    return { shops: result, flatBestMenus: [] as BestSellerRow[] };
  }, [rawMenus]);

  const onRefresh = useCallback(async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: ["bestSellersAll"] });
      await refetch();
    } catch (e) {
      console.warn("refresh failed", e);
    }
  }, [queryClient, refetch]);

  const onAddToCart = useCallback(
    async (menu: BestSellerRow) => {
      if (!menu || !menu.menuId || !menu.shopId) {
        Alert.alert("Cannot add", "This item is not available for ordering.");
        return;
      }
      const menuId = menu.menuId;
      try {
        setAddingIds((s) => new Set(s).add(menuId));
        const payload: CartPayload = { shopId: menu.shopId, menuId: menu.menuId, quantity: 1 };
        await dispatch(addToCartAsync(payload)).unwrap();
        if (Platform.OS === "android") ToastAndroid.show("Added to cart", ToastAndroid.SHORT);
        else Alert.alert("Added", "Item added to cart");
        dispatch(fetchCartAsync({ shopId: menu.shopId }));
      } catch (err) {
        console.warn("Add to cart error:", err);
        Alert.alert("Add failed", typeof err === "string" ? err : err?.message ?? "Failed to add to cart");
      } finally {
        setAddingIds((s) => {
          const next = new Set(s);
          next.delete(menuId);
          return next;
        });
      }
    },
    [dispatch]
  );

  const shopCount = shops.length;
  const useGrid = shopCount >= GRID_BREAKPOINT;

  const renderShop = useCallback(
    ({ item }: { item: ShopGrouped }) => <ShopCard shop={item} onAddToCart={onAddToCart} addingIds={addingIds} />,
    [onAddToCart, addingIds]
  );

  const renderCompactShop = useCallback(
    ({ item }: { item: ShopGrouped }) => <ShopCardCompact shop={item} onAddToCart={onAddToCart} addingIds={addingIds} />,
    [onAddToCart, addingIds]
  );

  const renderFlatMenu = useCallback(
    ({ item }: { item: BestSellerRow }) => (
      <View style={{ paddingHorizontal: wp(5), paddingVertical: hp(1) }}>
        <BestSellerBox menu={item} onAdd={onAddToCart} adding={addingIds.has(item.menuId)} />
      </View>
    ),
    [onAddToCart, addingIds]
  );

  return (
    <SafeAreaView style={[styles.safe,]}
    // { paddingTop: Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0 }]}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={{ padding: 6 }}>
          <Ionicons name="chevron-back-outline" size={hp(4)} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Tea & Coffee — Best Sellers</Text>
          <Text style={styles.subtitle}>Discover popular items near you</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={{ paddingHorizontal: wp(3), paddingTop: hp(2) }}>
          <SkeletonList />
        </View>
      ) : useGrid ? (
        <FlatList
          data={shops}
          renderItem={renderCompactShop}
          keyExtractor={(s) => String(s.shopId)}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: wp(3) }}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={onRefresh} tintColor={theme.PRIMARY_COLOR} />}
          contentContainerStyle={{ paddingBottom: hp(12), paddingTop: hp(1) }}
          removeClippedSubviews
          initialNumToRender={8}
        />
      ) : shops.length > 0 ? (
        <FlatList
          data={shops}
          renderItem={renderShop}
          keyExtractor={(s) => String(s.shopId)}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={onRefresh} tintColor={theme.PRIMARY_COLOR} />}
          contentContainerStyle={{ paddingBottom: hp(12), paddingTop: hp(1) }}
          removeClippedSubviews
          initialNumToRender={6}
        />
      ) : flatBestMenus.length > 0 ? (
        <FlatList
          data={flatBestMenus}
          renderItem={renderFlatMenu}
          keyExtractor={(m) => String(m.menuId)}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={onRefresh} tintColor={theme.PRIMARY_COLOR} />}
          contentContainerStyle={{ paddingBottom: hp(12), paddingTop: hp(1) }}
        />
      ) : (
        <View style={styles.center}>
          <Ionicons name="cafe-outline" size={56} color="#999" />
          <Text style={styles.centerText}>No Best Sellers Right Now</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

/* ---------------- styles ---------------- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: {
     paddingTop: Platform.OS === "android" ? hp(7) : 0,
    backgroundColor: "#EADDCA",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.2),
    flexDirection: "row",
    alignItems: "center",
  },
  title: { fontSize: hp(2.2), fontWeight: "800", color: "#222" },
  subtitle: { color: "#666", marginTop: hp(0.2), fontSize: hp(1.4) },
  center: { marginTop: hp(8), alignItems: "center" },
  centerText: { fontSize: hp(2), fontWeight: "700", marginTop: hp(1) },

  shopCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginVertical: hp(1),
    marginHorizontal: wp(5),
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    overflow: "hidden",
    paddingBottom: hp(1.2),
  },
  shopTop: {
    alignItems: "center",
    paddingTop: hp(1.4),
    paddingBottom: hp(0.6),
    paddingHorizontal: wp(3),
    flexDirection: "row",
  },
  shopAvatar: { width: wp(11), height: wp(11), borderRadius: wp(11), backgroundColor: "#eee", marginRight: wp(3) },
  shopNameHeader: { fontSize: hp(2), fontWeight: "700", color: "#222", flex: 1 },

  compactCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: wp(3),
    marginVertical: hp(1),
    width: (SCREEN_WIDTH - wp(6)) / 2 - wp(2),
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  shopAvatarSmall: { width: wp(10), height: wp(10), borderRadius: wp(10), backgroundColor: "#eee" },
  shopNameCompact: { marginLeft: wp(2), fontWeight: "700", fontSize: hp(1.6), flex: 1 },

  divider: { height: 1, backgroundColor: "#eee", marginVertical: hp(0.6), marginHorizontal: wp(3) },

  bestRow: { flexDirection: "row", paddingVertical: hp(0.8), paddingHorizontal: wp(3), alignItems: "center" },

  bestSellerBox: { flex: 1, alignItems: "center", paddingVertical: hp(0.8), paddingHorizontal: wp(1), backgroundColor: "#fafafa", borderRadius: 8 },
  bestSellerBoxCompact: { paddingVertical: hp(0.6), paddingHorizontal: wp(1), borderRadius: 8 },
  bestSellerTitle: { fontSize: hp(1.4), fontWeight: "700", color: "#444", marginBottom: hp(0.4), textAlign: "center" },
  bestSellerTitleCompact: { fontSize: hp(1.1) },
  thumb: { width: wp(26), height: wp(26), borderRadius: 10, backgroundColor: "#eee", marginBottom: hp(0.6) },
  thumbCompact: { width: wp(18), height: wp(18), borderRadius: 8 },
  bestSellerPrice: { fontSize: hp(1.4), color: theme.PRIMARY_COLOR, marginBottom: hp(0.6) },
  bestSellerPriceCompact: { fontSize: hp(1.1) },

  addBtnMini: { backgroundColor: theme.PRIMARY_COLOR, paddingVertical: hp(0.6), paddingHorizontal: wp(3.5), borderRadius: 8 },
  addBtnMiniCompact: { paddingVertical: hp(0.45), paddingHorizontal: wp(2.2) },
  addBtnMiniText: { color: "#fff", fontWeight: "700", fontSize: hp(1.4) },

  noMenuTextSmall: { color: "#999", fontSize: hp(1.2) },

  shopCardSkeleton: { backgroundColor: "#fff", borderRadius: 12, marginVertical: hp(1), marginHorizontal: wp(3), paddingBottom: hp(1), overflow: "hidden" },
  shopTopSkeleton: { alignItems: "center", paddingTop: hp(2), paddingBottom: hp(1), paddingHorizontal: wp(3), flexDirection: "row" },
  shopAvatarSkeleton: { width: wp(20), height: wp(20), borderRadius: wp(10), backgroundColor: "#eee", marginRight: wp(3) },
  bestRowSkeleton: { flexDirection: "row", paddingVertical: hp(1.2), paddingHorizontal: wp(3) },
  bestBoxSkeleton: { flex: 1, alignItems: "center", paddingVertical: hp(1), paddingHorizontal: wp(2) },
  skelThumb: { width: wp(26), height: wp(26), borderRadius: 8, backgroundColor: "#eee" },
  skelLine: { height: hp(1.6), backgroundColor: "#eee", borderRadius: 6 },
  skelLineShort: { height: hp(2.4), width: wp(40), borderRadius: 6, backgroundColor: "#eee" },
  shimmerOverlay: { position: "absolute", top: 0, left: 0, bottom: 0, opacity: 0.7 },
});

export default TeaAndCoffeeBestSellersScreen;