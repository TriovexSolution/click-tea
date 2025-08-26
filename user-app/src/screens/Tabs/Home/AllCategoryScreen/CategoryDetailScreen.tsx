// CategoryDetailScreen.tsx
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

/**
 * CategoryDetailScreen
 *
 * Responsibilities:
 * - Fetch menus for selected category (handles multiple API shapes)
 * - Show search, pull-to-refresh, infinite scroll
 * - Render menu rows matching Figma design:
 *    [square image]  [title / subtitle / price]   [Popular badge / Add button]
 */

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
  CategoryDetail: { categoryId: number; categoryName?: string };
};

type Props = NativeStackScreenProps<RootStackParamList, "CategoryDetail">;

// --------------------- MenuRow (presentational) ---------------------
const MenuRow = React.memo(
  ({ item, onAdd }: { item: MenuItem; onAdd: (m: MenuItem) => void }) => {
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
            // keep space for visual balance
            <View style={{ height: hp(2.2) }} />
          )}

          <TouchableOpacity
            onPress={() => onAdd(item)}
            style={styles.addButton}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Add ${item.menuName ?? "item"}`}
          >
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  },
  // Only re-render row if menuId changed (or reference changes)
  (prev, next) => prev.item.menuId === next.item.menuId && prev.item?.rating === next.item?.rating
);

// --------------------- Screen ---------------------
const CategoryDetailScreen: React.FC<Props> = ({ route }) => {
  const { categoryId, categoryName } = route.params ?? {};
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
  const cancelRef = useRef(axios.CancelToken.source());

  useEffect(() => {
    (async () => {
      tokenRef.current = await AsyncStorage.getItem("authToken");
    })();
    return () => {
      cancelRef.current?.cancel("unmount");
    };
  }, []);

  // Helper: parse menus out of multiple API shapes:
  // 1) res.data.data === [ {categoryId, menus:[...]}, ... ]
  // 2) res.data.data === [ {menuId, menuName, ...}, ... ]  (direct menus array)
  const extractMenus = (resData: any, categoryIdLocal?: number): MenuItem[] => {
    if (!resData) return [];
    const payload = resData.data ?? resData;
    if (!Array.isArray(payload)) return [];

    // Case A: payload is array of categories with .menus
    const maybeCategory = payload.find((c: any) => c?.categoryId === categoryIdLocal);
    if (maybeCategory && Array.isArray(maybeCategory.menus)) {
      return maybeCategory.menus;
    }

    // Case B: payload is array of menu items directly (menu objects have menuId)
    const looksLikeMenus = payload.every((p: any) => p?.menuId !== undefined || p?.menuName !== undefined);
    if (looksLikeMenus) {
      return payload as MenuItem[];
    }

    // Fallback: find first element that has menus
    const firstWithMenus = payload.find((c: any) => Array.isArray(c?.menus));
    if (firstWithMenus) return firstWithMenus.menus;

    return [];
  };

  const fetchMenus = useCallback(
    async (opts?: { page?: number; replace?: boolean }) => {
      const p = opts?.page ?? 1;
      if (p === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        cancelRef.current?.cancel("new request");
        cancelRef.current = axios.CancelToken.source();

        const res = await axios.get(`${BASE_URL}/api/category/${categoryId}/menus`, {
          params: { page: p, limit, search: debouncedQuery },
          headers: tokenRef.current ? { Authorization: `Bearer ${tokenRef.current}` } : undefined,
          cancelToken: cancelRef.current.token,
          timeout: 15000,
        });

        // Debug log (uncomment if needed)
        // console.log("Category menus response:", JSON.stringify(res.data, null, 2));

        const dataMenus = extractMenus(res.data, categoryId);
        // If backend provides top-level total/totalCount use it
        const totalCount = typeof res?.data?.total === "number" ? res.data.total : typeof res?.data?.totalCount === "number" ? res.data.totalCount : null;

        if (opts?.replace) setMenus(dataMenus);
        else setMenus((cur) => (p === 1 ? dataMenus : [...cur, ...dataMenus]));

        setTotal(totalCount);
        setPage(p);
      } catch (err: any) {
        if (!axios.isCancel(err)) {
          console.warn("fetchMenus error:", err?.response?.data ?? err?.message ?? err);
          // show small alert for developers if wanted (optional)
          // Alert.alert("Error", err?.message ?? "Failed to load menus");
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [categoryId, debouncedQuery]
  );

  // fetch on mount / when categoryId or debouncedQuery changes
  useEffect(() => {
    fetchMenus({ page: 1, replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, debouncedQuery]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMenus({ page: 1, replace: true });
  }, [fetchMenus]);

  const loadMore = useCallback(() => {
    if (loadingMore || loading) return;
    if (typeof total === "number" && menus.length >= total) return;
    const next = page + 1;
    fetchMenus({ page: next });
  }, [menus, page, total, fetchMenus, loadingMore, loading]);

  const onAdd = useCallback((item: MenuItem) => {
    // TODO: add to cart logic
    console.log("Add pressed:", item?.menuId ?? item?.menuName);
    // Example: navigation.navigate('Cart', { add: item })
  }, []);

  const keyExtractor = useCallback((item: MenuItem, index: number) => {
    // fallback to index if menuId missing
    if (item?.menuId !== undefined && item?.menuId !== null) return String(item.menuId);
    // if menuName exists, use its hash-ish fallback
    if (item?.menuName) return `${item.menuName}-${index}`;
    return String(index);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: MenuItem }) => <MenuRow item={item} onAdd={onAdd} />,
    [onAdd]
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* Header */}
     <CommonHeader title={categoryName ?? "Category"}/>
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
    marginHorizontal: wp(3),
    borderRadius: wp(2),
    paddingHorizontal: wp(3),
    marginTop: hp(1),
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
