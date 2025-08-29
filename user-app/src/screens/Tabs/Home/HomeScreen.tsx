// HomeScreen.optimized.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Pressable,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ParamListBase } from "@react-navigation/native";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useDebounce } from "use-debounce";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/src/api/client";
import theme from "@/src/assets/colors/theme";
import { hp, wp } from "@/src/assets/utils/responsive";
import { setSelectedShopId } from "@/src/Redux/Slice/selectedShopSlice";
import SideMenuModal from "@/src/Common/SlideMenuModal";
import ShopSkeleton from "@/src/components/skeltons/ShopSkeleton";
import PopularSkeleton from "@/src/components/skeltons/PopularSkeleton";
import CategorySkeleton from "@/src/components/skeltons/CategorySkeleton";
import CarouselBanner from "@/src/components/CarouselBanner";

// ---------- Types ----------
type RootState = any;
type CategoryType = {
  categoryId: number;
  categoryName: string;
  categoryImage?: string | null;
};
type ItemType = {
  menuName?: string;
  menuId?: number;
  name?: string;
  price?: number;
  imageUrl?: string | null;
};
type ShopType = {
  id: number;
  shopname: string;
  shopImage?: string | null;
  isOpen?: boolean;
  etaMinutes?: number | null;
  distanceKm?: number | null;
};

const PAGE_SIZE = 10;
const ICON = { small: hp(1.8), medium: hp(2.4), large: hp(3.0) };

// ---------- Helpers ----------
const getToken = async () => {
  try {
    return await AsyncStorage.getItem("authToken");
  } catch {
    return null;
  }
};

// API wrappers (same logic as yours)
const fetchCategories = async (): Promise<CategoryType[]> => {
  const token = await getToken();
  const res = await apiClient.get("/api/category/categories-with-menus", {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : [];
};

const fetchPopular = async (lat?: number, lng?: number): Promise<ItemType[]> => {
  if (!lat || !lng) return [];
  const token = await getToken();
  const res = await apiClient.get("/api/orders/popular-items", {
    params: { lat, lng },
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  const payload = Array.isArray(res?.data) ? res.data : res?.data?.popularItems ?? res?.data?.items ?? res?.data ?? [];
  return Array.isArray(payload) ? payload : [];
};

const fetchShopsPage = async ({ pageParam = 0, queryKey }: any) => {
  const [_key, lat, lng, search] = queryKey;
  const offset = pageParam;
  const token = await getToken();
  const res = await apiClient.get("/api/shops/nearby", {
    params: { lat, lng, onlyOpen: true, limit: PAGE_SIZE, offset, search: search || undefined },
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  const data = Array.isArray(res?.data) ? res.data : res?.data?.items ?? [];
  const total = Number(res?.data?.total ?? (Array.isArray(res?.data) ? res.data.length : 0)) || 0;
  return { data, nextOffset: data.length === 0 ? null : offset + PAGE_SIZE, total };
};
  const bannerData = [
    { image: require("@/src/assets/images/Cappaciuno Latte.jpg") },
    { image: require("@/src/assets/images/Cold Coffee.jpg") },
    { image: require("@/src/assets/images/Green Tea.jpg") },
    { image: require("@/src/assets/images/Iced tea.jpg") },
  ];

// ---------- Skeletons and small UI pieces (unchanged but memoized) ----------
/* Keep your Shimmer, CategorySkeleton, PopularSkeleton, ShopSkeleton from the original code.
   For brevity they are not repeated here — paste them in unchanged. */

// ---------- ShopCard (memoized) ----------
const ShopCard: React.FC<{ item: ShopType; onOpen: (id: number) => void }> = React.memo(({ item, onOpen }) => {
  const open = typeof item.isOpen === "boolean" ? item.isOpen : true;
  const eta = item.etaMinutes ?? null;
  const distance = item.distanceKm ?? null;

  // use cached base URL once
  const baseURL = apiClient.defaults.baseURL;

  return (
    <Pressable
      style={styles.shopCard}
      onPress={() => onOpen(item.id)}
      android_ripple={{ color: "#f2f2f2" }}
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.shopname} detail`}
    >
      <Image
        style={styles.shopImage}
        source={
          item.shopImage
            ? { uri: `${baseURL}/uploads/shops/${item.shopImage}` }
            : require("@/src/assets/images/onBoard1.png")
        }
        resizeMode="cover"
      />

      <View style={styles.shopDetails}>
        <View style={styles.shopTitleRow}>
          <Text style={styles.shopName}>{item.shopname}</Text>
          <View style={[styles.statusBadge, open ? styles.openBadge : styles.closedBadge]}>
            <Text style={styles.statusText}>{open ? "Open" : "Closed"}</Text>
          </View>
        </View>

        <View style={styles.shopMeta}>
          <Ionicons name="star" size={12} color="#FFC107" />
          <Text style={styles.metaText}>4.5</Text>
          <Text style={styles.metaText}> • {eta ? `${eta} min` : "—"}</Text>
          <Text style={styles.metaText}>{distance ? ` • ${distance} km` : ""}</Text>
        </View>

        <View style={styles.tagRow}>
          <Text style={styles.tag}>Masala Chai</Text>
          <Text style={styles.tag}>Filter Coffee</Text>
        </View>

        <TouchableOpacity style={styles.viewMenuBtn} accessibilityRole="button">
          <Text style={styles.viewMenuText}>View Menu</Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  );
});
ShopCard.displayName = "ShopCard";

// ---------- HomeScreen (optimized) ----------
const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const dispatch = useDispatch();

  // useSelector: pick only what we need; shallowEqual avoids unnecessary re-renders
  const location = useSelector((s: RootState) => s.location, shallowEqual);
  const lat = location?.latitude;
  const lng = location?.longitude;

  const [searchText, setSearchText] = useState("");
  const [sideMenuVisible, setSideMenuVisible] = useState(false);
  const [debouncedSearch] = useDebounce(searchText, 500);

  const queryClient = useQueryClient();

  // Categories
  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  // Popular items
  const { data: popularItems = [], isLoading: loadingPopular } = useQuery({
    queryKey: ["popular", lat, lng],
    queryFn: () => fetchPopular(lat, lng),
    enabled: !!lat && !!lng,
    staleTime: 1000 * 60,
    retry: 1,
  });

  // Shops infinite query
  const {
    data: shopPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchShops,
    isLoading: loadingShops,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ["shops", lat, lng, debouncedSearch],
    queryFn: fetchShopsPage,
    getNextPageParam: (last) => last.nextOffset,
    enabled: !!lat && !!lng,
    staleTime: 1000 * 30,
    cacheTime: 1000 * 60 * 5,
    retry: 1,
  });

  // flatten pages (memoized)
  const shops: ShopType[] = useMemo(() => (shopPages ? shopPages.pages.flatMap((p: any) => p.data) : []), [shopPages]);
  const totalShops = useMemo(() => (shopPages ? shopPages.pages[0]?.total ?? null : null), [shopPages]);

  // Refresh handler: invalidate selectively and wait for promise
  const onRefresh = useCallback(async () => {
    await Promise.allSettled([
      queryClient.invalidateQueries({ queryKey: ["shops"] }),
      queryClient.invalidateQueries({ queryKey: ["categories"] }),
      queryClient.invalidateQueries({ queryKey: ["popular"] }),
    ]);
  }, [queryClient]);

  const handleLoadMore = useCallback(() => {
    if (isFetchingNextPage || !hasNextPage) return;
    fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleOpenShop = useCallback(
    (shopId: number) => {
      dispatch(setSelectedShopId(shopId));
      navigation.navigate("shopDetailScreen" as never);
    },
    [dispatch, navigation]
  );

  useEffect(() => {
    if (!lat || !lng) {
      navigation.replace("locationScreen");
    }
  }, [lat, lng, navigation]);

  // List header separated & memoized
  const ListHeader = useMemo(() => {
    const limitedCategories = Array.isArray(categories) ? categories.slice(0, 7) : [];

    return (
      <View>
        <View style={styles.headerRow}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Pressable onPress={() => setSideMenuVisible(true)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="menu-outline" size={ICON.large} />
            </Pressable>

            <TouchableOpacity style={styles.locationRow} onPress={() => navigation.navigate("locationScreen" as never)}>
              <Text style={styles.subLocation} numberOfLines={1}>
                {location ? `${location.latitude}, ${location.longitude}` : "Select Location"}
              </Text>
              <Ionicons name="chevron-down" size={18} color={theme.PRIMARY_COLOR} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>

          <Ionicons name="notifications-outline" size={ICON.large} color={theme.PRIMARY_COLOR} />
        </View>

        <View style={styles.searchRow}>
           {searchText ? (
            <TouchableOpacity onPress={() => setSearchText("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={ICON.small} />
            </TouchableOpacity>
          ) : (
            <Ionicons name="search" size={ICON.small} color="#999" style={styles.searchIcon} />
          )}
          <TouchableOpacity style={styles.searchInput} activeOpacity={1} onPress={() => navigation.navigate("searchScreen")}>
            <TextInput
              editable={false}
              pointerEvents="none"
              placeholder="Search for tea, Coffee, Snacks..."
              style={styles.searchInput}
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
              returnKeyType="search"
            />
          </TouchableOpacity>
         
        </View>
        <View style={styles.categorySectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity onPress={() => navigation.navigate("viewAllCategoryScreen")}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {loadingCategories ? (
          /* CategorySkeleton component (unchanged) */
          <CategorySkeleton />
        ) : (
          <FlatList
            data={limitedCategories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(it: CategoryType) => String(it.categoryId)}
            renderItem={({ item }) => (
              <View style={styles.popularItem}>
                <View style={styles.popularCircle}>
                  {item.categoryImage ? (
                    <Image
                      source={{ uri: `${apiClient.defaults.baseURL}/uploads/categories/${item.categoryImage}` }}
                      style={styles.popularImg}
                      resizeMode="cover"
                    />
                  ) : (
                    <Image source={require("@/src/assets/images/onBoard1.png")} style={styles.popularImg} />
                  )}
                </View>
                <Text style={styles.popularName} numberOfLines={1}>
                  {item.categoryName}
                </Text>
              </View>
            )}
            contentContainerStyle={styles.categoryList}
          />
        )}

        <Text style={styles.sectionTitle}>Popular Items</Text>

        {loadingPopular ? (
          <PopularSkeleton />
        ) : popularItems.length > 0 ? (
          <FlatList
            data={popularItems}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(it: any) => String(it.menuId ?? it.id)}
            renderItem={({ item }) => (
              <View style={styles.popularItem}>
                <View style={styles.popularCircle}>
                  {item.imageUrl ? (
                    <Image source={{ uri: `${apiClient.defaults.baseURL}/uploads/menus/${item.imageUrl}` }} style={styles.popularImg} resizeMode="cover" />
                  ) : null}
                </View>
                <Text style={styles.popularName} numberOfLines={1}>
                  {item.name ?? item.menuName}
                </Text>
                <Text style={styles.popularPrice}>₹{item.price ?? "—"}</Text>
              </View>
            )}
            contentContainerStyle={{ paddingLeft: wp(4), paddingVertical: hp(1) }}
          />
        ) : (
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text style={{ fontSize: 16, color: "#888" }}>No popular items available right now.</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Nearby Vendors (within 1KM)</Text>
        
      </View>
    );
  }, [categories, loadingCategories, popularItems, loadingPopular, navigation, location, searchText]);

  // Shop card height optimization (if consistent height)
  const SHOP_CARD_HEIGHT = hp(20) + 16;
  const getItemLayout = useCallback((_data: any, index: number) => ({ length: SHOP_CARD_HEIGHT, offset: SHOP_CARD_HEIGHT * index, index }), []);

  return (
    <View style={styles.container}>
      <FlatList
        data={shops}
        keyExtractor={(item) => `${item.id}`}
        renderItem={({ item }) => <ShopCard item={item} onOpen={handleOpenShop} />}
        ListHeaderComponent={shops.length > 0 ? ListHeader : null}
        ListFooterComponent={(
          <>
{/* <CarouselBanner data={bannerData} /> */}
          
          </>
        )}
        ListEmptyComponent={
          !loadingShops ? (
            <View style={styles.noShop}>
              <Ionicons name="location-outline" size={48} color={theme.PRIMARY_COLOR} />
              <Text style={styles.emptyText}>Sorry, service is not available in your area yet.</Text>
              <TouchableOpacity style={styles.changeLocationBtn} onPress={() => navigation.navigate("locationScreen" as never)}>
                <Text style={styles.changeLocationText}>Change Location</Text>
              </TouchableOpacity>
              <Text style={styles.comingSoonText}>🚀 Coming soon ClickTea at your nearby location</Text>
            </View>
          ) : (
            <View style={{ padding: hp(6) }}>
              <ShopSkeleton />
              <ShopSkeleton />
            </View>
          )
        }
        onEndReachedThreshold={0.5}
        onEndReached={handleLoadMore}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={onRefresh} tintColor={theme.PRIMARY_COLOR} />}
        contentContainerStyle={{ paddingBottom: hp(10) }}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews={Platform.OS === "android"}
        getItemLayout={getItemLayout}
      />

      <SideMenuModal visible={sideMenuVisible} onClose={() => setSideMenuVisible(false)} />

    </View>
  );
};

export default HomeScreen;

// ---------- styles ----------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  locationRow: { flexDirection: "row", alignItems: "center", maxWidth: wp(60) },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
  },
  subLocation: { fontSize: hp(1.5), color: "#666" },
  noShop: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  emptyText: { fontSize: 16, color: "gray", marginVertical: 10, textAlign: "center" },
  changeLocationBtn: { marginTop: 15, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: theme.PRIMARY_COLOR, borderRadius: 8 },
  changeLocationText: { color: "white", fontSize: 16, fontWeight: "bold" },
  comingSoonText: { marginTop: 20, fontSize: 14, color: "#888", textAlign: "center" },

  searchRow: { marginTop: hp(1.5), marginHorizontal: wp(4), backgroundColor: "#f2f2f2", borderRadius: hp(1), flexDirection: "row", alignItems: "center", paddingHorizontal: wp(3) },
  searchInput: { flex: 1, height: hp(5), fontSize: hp(1.7), color: "#333" },
  searchIcon: { marginLeft: wp(2) },

  categoryList: { paddingHorizontal: wp(4), paddingVertical: hp(1.2) },

  popularItem: { width: wp(20), alignItems: "center", marginRight: wp(3) },
  popularCircle: { width: wp(16), height: wp(16), borderRadius: wp(8), backgroundColor: "#eaeaea", justifyContent: "center", alignItems: "center" },
  popularImg: { width: "100%", height: "100%", borderRadius: wp(8) },
  popularName: { fontSize: hp(1.5), color: "#333", textAlign: "center" },
  popularPrice: { fontSize: hp(1.3), color: "#666" },

  shopCard: { flexDirection: "row", borderBottomWidth: 1, marginHorizontal: wp(4), borderColor: "#eee", paddingVertical: hp(1.2) },
  shopImage: { width: wp(20), height: wp(20), borderRadius: 6, backgroundColor: "#f2f2f2", alignSelf: "flex-start", marginTop: hp(0.5) },
  shopDetails: { flex: 1, padding: wp(3) },
  shopTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  shopName: { fontSize: hp(1.9), fontWeight: "600", color: theme.PRIMARY_COLOR },
  shopMeta: { flexDirection: "row", alignItems: "center", marginTop: hp(0.5) },
  metaText: { fontSize: hp(1.4), color: "#666", marginLeft: 4 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", marginTop: hp(0.6) },
  tag: { backgroundColor: "#f2f2f2", paddingHorizontal: wp(2), paddingVertical: hp(0.4), borderRadius: 8, marginRight: wp(2), fontSize: hp(1.3), color: "#666" },
  viewMenuBtn: { backgroundColor: theme.PRIMARY_COLOR, paddingVertical: hp(0.8), paddingHorizontal: wp(3), borderRadius: 8, marginTop: hp(0.8), alignSelf: "flex-start" },
  viewMenuText: { color: "#fff", fontSize: hp(1.4), fontWeight: "600" },

  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  openBadge: { backgroundColor: "#e6f9ed" },
  closedBadge: { backgroundColor: "#f0f0f0" },
  statusText: { fontSize: 12, color: "#333", fontWeight: "600" },

  categorySectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: hp(1), marginRight: wp(4) },
  sectionTitle: { fontSize: hp(2), fontWeight: "600", color: "#333", marginTop: hp(1), paddingHorizontal: wp(4) },
  viewAllText: { color: theme.PRIMARY_COLOR, fontWeight: "600", fontSize: hp(1.6) },
});
