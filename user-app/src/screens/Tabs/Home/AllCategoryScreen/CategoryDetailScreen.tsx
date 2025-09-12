// CategoryDetailScreen.fixed.tsx
// Patched version with improved extractMenus, stable keys, safer pagination handling,
// better debug logs, and simplified MenuRow memoization to avoid stale rows when
// switching categories.

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  TextInput,
  RefreshControl,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { hp, wp } from "@/src/assets/utils/responsive";
import theme from "@/src/assets/colors/theme";
import { BASE_URL } from "@/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import CommonHeader from "@/src/Common/CommonHeader";
import axiosClient from "@/src/api/client";
import CommonStatusHeader from "@/src/Common/CommonStatusHeader";

// --------------------- Types ---------------------
type MenuItem = {
  menuId?: number;
  menuName?: string;
  imageUrl?: string;
  price?: string | number;
  ingredients?: string;
  isAvailable?: number;
  rating?: number;
};

type RootStackParamList = {
  CategoryDetail: { categoryId: number | string; categoryName?: string };
};

type Props = NativeStackScreenProps<RootStackParamList, "CategoryDetail">;

// --------------------- MenuRow (presentational) ---------------------
// NOTE: removed fragile custom comparator so rows won't accidentally skip renders
// when the list switches category or when backend returns equivalent menuIds across categories.
const MenuRow = React.memo(({ item, onAdd }: { item: MenuItem; onAdd: (m: MenuItem) => void }) => {
  const [imgFailed, setImgFailed] = useState(false);

  const imgSource =
    !imgFailed && item.imageUrl
      ? { uri: `${BASE_URL}/uploads/menus/${item.imageUrl}` }
      : require("@/src/assets/images/onBoard1.png"); // fallback local image

  return (
    <View style={styles.menuRow} accessible accessibilityRole="button">
      <View style={styles.menuLeft}>
        <Image
          source={imgSource}
          style={styles.menuImage}
          resizeMode="cover"
          onError={() => setImgFailed(true)}
          accessibilityLabel={item.menuName ?? "menu image"}
        />
      </View>

      <View style={styles.menuCenter}>
        <Text style={styles.menuTitle} numberOfLines={1}>
          {item.menuName ?? "Unnamed Dish"}
        </Text>

        <Text style={styles.menuSubtitle} numberOfLines={2}>
          {item.ingredients ?? "No description available"}
        </Text>

        <Text style={styles.menuPrice}>
          {item.price !== undefined && item.price !== null ? `₹${item.price}` : "Price not available"}
        </Text>
      </View>

      <View style={styles.menuRight}>
        {item.rating && item.rating > 0 ? (
          <View style={styles.popularBadge} accessible accessibilityLabel="Popular">
            <Text style={styles.popularText}>Popular</Text>
          </View>
        ) : (
          <View style={{ height: hp(2.2) }} />
        )}

        <TouchableOpacity
          onPress={() => onAdd(item)}
          style={styles.addButton}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Add ${item.menuName ?? "item"}`}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

// --------------------- Screen ---------------------
const CategoryDetailScreen = ({ route }:any) => {
  // Normalize categoryId to string internally to avoid strict === mismatches
  const rawCategoryId = route?.params?.categoryId;
  const categoryIdStr = rawCategoryId !== undefined && rawCategoryId !== null ? String(rawCategoryId) : "";
  const categoryName = route?.params?.categoryName;

  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [total, setTotal] = useState<number | null>(null);

  // search (debounced)
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  // token + cancel
  const tokenRef = useRef<string | null>(null);
  const cancelRef = useRef(axiosClient.CancelToken.source());

  useEffect(() => {
    (async () => {
      try {
        tokenRef.current = await AsyncStorage.getItem("authToken");
      } catch (e) {
        console.warn("Failed to read token from AsyncStorage", e);
        tokenRef.current = null;
      }
    })();
    return () => {
      cancelRef.current?.cancel("unmount");
    };
  }, []);

// --- REPLACE extractMenus with this ---
const extractMenus = (resData: any, categoryIdLocal?: string): MenuItem[] => {
  if (!resData) return [];
  const payload = resData.data ?? resData;
  if (!Array.isArray(payload)) return [];

  // If payload is an array of menu objects (direct menus), return it
  const looksLikeMenus = payload.every((p: any) => p && (p.menuId !== undefined || p.menuName !== undefined));
  if (looksLikeMenus) return payload as MenuItem[];

  // If payload is an array of categories with .menus, only return menus for the matching category
  if (categoryIdLocal) {
    // filter categories that match the requested categoryId
    const matched = payload.find((c: any) => {
      try {
        return String(c?.categoryId) === String(categoryIdLocal);
      } catch {
        return false;
      }
    });
    if (matched && Array.isArray(matched.menus)) return matched.menus;
    // If the page doesn't include the requested category, return empty array (do NOT flatten other categories)
    return [];
  }

  // No categoryId provided — fallback: flatten all menus (rare)
  const allMenus = payload.reduce((acc: MenuItem[], cur: any) => {
    if (Array.isArray(cur?.menus)) acc.push(...cur.menus);
    return acc;
  }, [] as MenuItem[]);
  return allMenus;
};


  const fetchMenus = useCallback(
    async (opts?: { page?: number; replace?: boolean }) => {
      const p = opts?.page ?? 1;
      if (p === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        // cancel previous
        cancelRef.current?.cancel("new request");
        cancelRef.current = axiosClient.CancelToken.source();

        // Debug: log what we're fetching
        // console.log(`fetchMenus: categoryId=${categoryIdStr} page=${p} q=${debouncedQuery}`);

        const res = await axiosClient.get(`/api/category/${categoryIdStr}/menus`, {
          params: { page: p, limit, search: debouncedQuery },
          // headers: tokenRef.current ? { Authorization: `Bearer ${tokenRef.current}` } : undefined,
          cancelToken: cancelRef.current.token,
          timeout: 15000,
        });

        // console.log("raw response (debug):", { page: res.data?.page, limit: res.data?.limit, totalCount: res.data?.totalCount, total: res.data?.total });

        const dataMenus = extractMenus(res.data, categoryIdStr);

        // Determine totalCount robustly. If server reports 0 but returned menus, treat total as unknown (null)
        const reportedTotal = typeof res?.data?.total === "number" ? res.data.total : typeof res?.data?.totalCount === "number" ? res.data.totalCount : null;
        const effectiveTotal = reportedTotal === 0 && Array.isArray(dataMenus) && dataMenus.length > 0 ? null : reportedTotal;

        if (opts?.replace || p === 1) setMenus(dataMenus);
        else setMenus((cur) => [...cur, ...dataMenus]);

        setTotal(effectiveTotal);
        setPage(p);

        // Extra debug to help spot mismatches
        // console.log(`parsed menus count=${dataMenus.length} total=${effectiveTotal}`);
      } catch (err: any) {
        if (!axiosClient.isCancel(err)) {
          console.warn("fetchMenus error:", err?.response?.data ?? err?.message ?? err);
          // optionally show UI alert in dev
          // Alert.alert('Error', err?.message ?? 'Failed to load menus');
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [categoryIdStr, debouncedQuery]
  );

  // fetch on mount / when categoryId or debouncedQuery changes
  useEffect(() => {
    // reset page and menus when category changes
    setPage(1);
    setMenus([]);
    setTotal(null);
    fetchMenus({ page: 1, replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryIdStr, debouncedQuery]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMenus({ page: 1, replace: true });
  }, [fetchMenus]);

  const loadMore = useCallback(() => {
    if (loadingMore || loading) return;
    // if we have a reliable total and we've already loaded it, don't load more
    if (typeof total === "number" && menus.length >= total) return;
    const next = page + 1;
    fetchMenus({ page: next });
  }, [menus, page, total, fetchMenus, loadingMore, loading]);

  const onAdd = useCallback((item: MenuItem) => {
    // console.log("Add pressed:", item?.menuId ?? item?.menuName);
    // navigation.navigate('Cart', { add: item })
  }, []);

  // include categoryId in key so RN can't accidentally reuse views between categories
  const keyExtractor = useCallback(
    (item: MenuItem, index: number) => {
      const idPart = item?.menuId !== undefined && item?.menuId !== null ? String(item.menuId) : item?.menuName ? `${item.menuName}-${index}` : String(index);
      return `${categoryIdStr}-${idPart}`;
    },
    [categoryIdStr]
  );

  const renderItem = useCallback(
    ({ item }: { item: MenuItem }) => <MenuRow item={item} onAdd={onAdd} />,
    [onAdd]
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* <StatusBar barStyle="dark-content" backgroundColor="#fff" /> */}
      {/* Header */}
      {/* <CommonHeader title={categoryName ?? "Category"}  /> */}
      <CommonStatusHeader title={categoryName ?? "Category"} bgColor="#FBCEB1"/>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={hp(2.2)} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${categoryName ?? "items"}`}
          value={query}
          onChangeText={setQuery}
          placeholderTextColor="#aaa"
          returnKeyType="search"
          accessible
          accessibilityLabel="Search menus"
        />
      </View>

      {/* Content */}
      {loading && menus.length === 0 ? (
        <ActivityIndicator size="large" color={theme.PRIMARY_COLOR} style={{ marginTop: hp(6) }} />
      ) : (
        <FlatList
          data={menus}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          initialNumToRender={6}
          maxToRenderPerBatch={8}
          windowSize={7}
          removeClippedSubviews={Platform.OS === "android"}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListFooterComponent={loadingMore ? <ActivityIndicator style={{ margin: 12 }} /> : null}
          ListEmptyComponent={() =>
            !loading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No items in this category</Text>
              </View>
            ) : null
          }
          getItemLayout={(_, index) => ({ length: ROW_HEIGHT, offset: ROW_HEIGHT * index, index })}
        />
      )}
    </SafeAreaView>
  );
};

export default CategoryDetailScreen;

// --------------------- Styles ---------------------
const ROW_HEIGHT = hp(12);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.3),
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: hp(2.2),
    fontWeight: "600",
    marginLeft: wp(3),
    color: theme.PRIMARY_COLOR,
    textAlign: "center",
    flex: 1,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6F6F6",
    marginHorizontal: wp(5),
    borderRadius: wp(2),
    paddingHorizontal: wp(3),
    marginTop: hp(2),
    height: hp(5.4),
  },
  searchInput: {
    flex: 1,
    marginLeft: wp(2),
    fontSize: hp(1.8),
    color: "#333",
    paddingVertical: 0,
  },

  listContent: {
    paddingHorizontal: wp(3),
    paddingBottom: hp(6),
    paddingTop: hp(2),
  },

  // Menu row layout
  menuRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(1),
  },
  menuLeft: {
    width: wp(18),
    height: wp(18),
    borderRadius: wp(2),
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  menuImage: {
    width: "100%",
    height: "100%",
  },

  menuCenter: {
    flex: 1,
    marginLeft: wp(3),
    justifyContent: "center",
  },
  menuTitle: {
    fontSize: hp(1.9),
    fontWeight: "600",
    color: "#222",
  },
  menuSubtitle: {
    fontSize: hp(1.4),
    color: "#777",
    marginTop: hp(0.3),
  },
  menuPrice: {
    fontSize: hp(1.6),
    fontWeight: "700",
    color: "#222",
    marginTop: hp(0.6),
  },

  menuRight: {
    width: wp(22),
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginLeft: wp(2),
  },

  addButton: {
    backgroundColor: "#6C3F24",
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(0.8),
    borderRadius: wp(2),
    marginTop: hp(1),
  },
  addBtnText: {
    color: "#fff",
    fontSize: hp(1.5),
    fontWeight: "600",
  },

  popularBadge: {
    backgroundColor: "#EAF9F1",
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.4),
    borderRadius: wp(2),
  },
  popularText: {
    color: "#2AA35A",
    fontSize: hp(1.2),
    fontWeight: "700",
  },

  separator: {
    height: 1,
    backgroundColor: "#F0F0F0",
  },

  emptyContainer: {
    alignItems: "center",
    marginTop: hp(6),
  },
  emptyText: {
    color: "#666",
    fontSize: hp(1.8),
  },
});
