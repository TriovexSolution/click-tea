import React, {useCallback, useEffect, useRef, useState, useMemo} from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  StatusBar,
  TextInput,
  RefreshControl,
  Platform,
  TouchableOpacity,
  Pressable,
  Alert,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {hp, wp} from "@/src/assets/utils/responsive";
import theme from "@/src/assets/colors/theme";
import {BASE_URL} from "@/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {ParamListBase, useNavigation} from "@react-navigation/native";
import CommonStatusHeader from "@/src/Common/CommonStatusHeader";

// Redux
import {useDispatch, useSelector, shallowEqual} from "react-redux";
import {
  addToCartAsync,
  fetchCartAsync,
  selectCartItems,
  updateCartItemAsync,
} from "@/src/Redux/Slice/cartSlice";
import {selectSelectedShopId} from "@/src/Redux/Slice/selectedShopSlice";
import CartIconWithBadge from "@/src/components/CartIconBadge";
import {getUserIdFromToken} from "@/src/assets/utils/getUserIdFromToken";
import axiosClient from "@/src/api/client";
import {SafeAreaProvider} from "react-native-safe-area-context";
import CartBottomBar from "@/src/components/CartBar/CartBottomBar";

type MenuItem = {
  menuId?: number;
  menuName?: string;
  imageUrl?: string;
  price?: string | number;
  ingredients?: string;
  isAvailable?: number;
  rating?: number;
};

const ROW_HEIGHT = hp(12);
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

/* ---------------- MenuRow (memoized with custom equality) ---------------- */
const MenuRow = React.memo(function MenuRow({
  item,
  cartEntry,
  onIncrease,
  onDecrease,
  onAdd,
  localLoading,
  forceEnableAdd = false,
}: {
  item: MenuItem;
  cartEntry?: any;
  onIncrease: (m: MenuItem) => void;
  onDecrease: (m: MenuItem) => void;
  onAdd: (m: MenuItem) => void;
  localLoading: boolean;
  forceEnableAdd?: boolean;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const imgSource =
    !imgFailed && item.imageUrl
      ? {uri: `${BASE_URL}/uploads/menus/${item.imageUrl}`}
      : require("@/src/assets/images/onBoard1.png");

  const qty = cartEntry?.quantity || 0;
  const isAvailable = item.isAvailable !== 0; // treat missing as available
  const showAdd = qty === 0;
  const addEnabled = forceEnableAdd || isAvailable;

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
          {item.price !== undefined && item.price !== null
            ? `₹${item.price}`
            : "Price not available"}
        </Text>
      </View>

      <View style={styles.menuRight}>
        {item.rating && item.rating > 0 ? (
          <View style={styles.popularBadge} accessible accessibilityLabel="Popular">
            <Text style={styles.popularText}>Popular</Text>
          </View>
        ) : (
          <View style={{height: hp(2.2)}} />
        )}

        {qty > 0 ? (
          <View style={styles.qtyControl}>
            <Pressable
              onPress={() => onDecrease(item)}
              style={styles.qtyBtn}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
              accessibilityLabel={`Decrease ${item.menuName}`}
              disabled={localLoading}
            >
              <Ionicons name="remove-circle-outline" size={hp(3)} color="#6C3F24" />
            </Pressable>

            <Text style={styles.qtyText}>{qty}</Text>

            <Pressable
              onPress={() => onIncrease(item)}
              style={styles.qtyBtn}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
              accessibilityLabel={`Increase ${item.menuName}`}
              disabled={localLoading}
            >
              <Ionicons name="add-circle-outline" size={hp(3)} color="#6C3F24" />
            </Pressable>
          </View>
        ) : showAdd ? (
          addEnabled ? (
            <TouchableOpacity
              onPress={() => onAdd(item)}
              style={[styles.addButton, localLoading ? {opacity: 0.6} : null]}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Add ${item.menuName ?? "item"}`}
              disabled={localLoading}
            >
              <Text style={styles.addBtnText}>+ Add</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.addButton, {backgroundColor: "#ccc", minWidth: wp(16)}]}>
              <Text style={[styles.addBtnText, {color: "#666"}]}>Unavailable</Text>
            </View>
          )
        ) : null}
      </View>
    </View>
  );
}, areMenuRowEqual);

function areMenuRowEqual(prev: any, next: any) {
  // Only re-render when values that affect the UI change.
  const a = prev as any;
  const b = next as any;
  if (a.item?.menuId !== b.item?.menuId) return false;
  if (a.item?.menuName !== b.item?.menuName) return false;
  if ((a.cartEntry?.quantity || 0) !== (b.cartEntry?.quantity || 0)) return false;
  if (a.localLoading !== b.localLoading) return false;
  if ((a.item?.imageUrl || "") !== (b.item?.imageUrl || "")) return false;
  if (a.forceEnableAdd !== b.forceEnableAdd) return false;
  return true;
}

/* ---------------- CategoryDetailScreen ---------------- */
const CategoryDetailScreen = ({route}: any) => {
  // helper: detect axios cancel / abort errors
const isAbortError = (err: any) => {
  if (!err) return false;
  if (typeof axiosClient?.isCancel === "function" && axiosClient.isCancel(err)) return true;
  if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return true;
  const msg = String(err?.message ?? "").toLowerCase();
  return msg.includes("cancel") || msg.includes("canceled") || msg.includes("cancelled");
};

// safe abort and clear controller reference so we don't abort twice
const safeAbort = () => {
  try {
    if (cancelRef.current) {
      cancelRef.current.abort();
      cancelRef.current = null;
    }
  } catch (e) {
    // ignore
  }
};

  const rawCategoryId = route?.params?.categoryId;
  const categoryIdStr =
    rawCategoryId !== undefined && rawCategoryId !== null ? String(rawCategoryId) : "";
  const isCategoryZero = categoryIdStr === "0";

  const categoryName = route?.params?.categoryName ?? "Category";

  const navigation = useNavigation<ParamListBase>();
  const dispatch = useDispatch();

  // selectors
  const shopId = useSelector(selectSelectedShopId);
  const cartItems = useSelector(selectCartItems, shallowEqual);

  const cartMap = useMemo(() => {
    const m: Record<number, any> = {};
    (cartItems || []).forEach((it: any) => {
      if (it?.menuId != null) m[Number(it.menuId)] = it;
    });
    return m;
  }, [cartItems]);

  // state
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(DEFAULT_LIMIT);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [total, setTotal] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // per-item loading map (stateful so UI updates reliably)
  const [menuLoadingMap, setMenuLoadingMap] = useState<Record<string, boolean>>({});
  const setMenuLoading = useCallback((id: string, v = true) => {
    setMenuLoadingMap((prev) => {
      if (prev[id] === v) return prev;
      return {...prev, [id]: v};
    });
  }, []);
  const isMenuLoading = useCallback((id: string) => !!menuLoadingMap[id], [menuLoadingMap]);

  // search & debounce
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debounceRef = useRef<any>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const isSearching = query.trim().length > 0 && query.trim() !== debouncedQuery;

  const inputRef = useRef<TextInput | null>(null);
  const [focused, setFocused] = useState(false);

  // mounted guard + cancel ref
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      try {
        cancelRef.current?.abort();
      } catch {}
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const cancelRef = useRef<AbortController | null>(null);

  // helper to parse menus robustly
  const extractMenus = useCallback((res: any) => {
    const payload = res?.data?.data ?? res?.data ?? null;
    if (Array.isArray(payload)) return payload as MenuItem[];
    if (Array.isArray(res?.data?.menus)) return res.data.menus;
    return [];
  }, []);

  // fetchMenus (retry once) - now accepts an optional search override so callers can force empty search immediately
const fetchMenus = useCallback(
  async (opts?: { page?: number; replace?: boolean; search?: string }) => {
    const p = Math.max(1, opts?.page ?? 1);
    if (!categoryIdStr) return;

    if (p === 1) {
      setLoading(true);
      setErrorMsg(null);
    } else {
      setLoadingMore(true);
    }

    try {
      // abort any previous request and create new controller
      safeAbort();
      cancelRef.current = new AbortController();
      const signal = cancelRef.current.signal;

      const safeLimit = Math.min(limit, MAX_LIMIT);
      const url = `/api/category/${encodeURIComponent(categoryIdStr)}/menus`;

      // prefer explicit override if caller supplied `search`
      const hasSearchOverride = opts && Object.prototype.hasOwnProperty.call(opts, "search");
      const searchToUse = hasSearchOverride ? opts!.search : debouncedQuery;

      // build params — only include search when non-empty to avoid backend surprises
      const params: any = { page: p, limit: safeLimit };
      if (searchToUse != null && String(searchToUse).trim().length > 0) params.search = String(searchToUse).trim();


      const res = await axiosClient.get(url, { params, signal, timeout: 15000 });

      if (!mountedRef.current) return;

      const dataMenus = extractMenus(res);
      const reportedTotal =
        typeof res?.data?.total === "number"
          ? res.data.total
          : typeof res?.data?.totalCount === "number"
          ? res.data.totalCount
          : null;
      const effectiveTotal =
        reportedTotal === 0 && Array.isArray(dataMenus) && dataMenus.length > 0 ? null : reportedTotal;

      if (opts?.replace || p === 1) {
        setMenus(dataMenus);
        setPage(1);
      } else {
        setMenus((cur) => {
          if (!Array.isArray(cur)) return dataMenus;
          const map = new Map<number | string, MenuItem>();
          cur.forEach((m) => map.set(m.menuId ?? m.menuName ?? JSON.stringify(m), m));
          dataMenus.forEach((m) => map.set(m.menuId ?? m.menuName ?? JSON.stringify(m), m));
          return Array.from(map.values());
        });
        setPage(p);
      }

      setTotal(effectiveTotal);
    } catch (err: any) {
      if (isAbortError(err)) {
        console.log("[fetchMenus] request aborted");
        // do not set errorMsg for intentional aborts
        return;
      }
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to load menus";
      setErrorMsg(String(msg));
      console.warn("[CategoryDetail] fetchMenus error:", msg);
    } finally {
      if (!mountedRef.current) return;
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
      // clear controller reference so safeAbort knows there's nothing to abort
      cancelRef.current = null;
    }
  },
  [categoryIdStr, debouncedQuery, extractMenus, limit]
);

  // handleClear uses fetchMenus — include fetchMenus in deps
const handleClear = useCallback(() => {
  // stop debounce timers
  if (debounceRef.current) {
    clearTimeout(debounceRef.current);
    debounceRef.current = null;
  }

  // clear UI state immediately
  setQuery("");
  setDebouncedQuery("");
  setMenus([]);
  setTotal(null);
  setPage(1);

  // abort current request safely and fetch fresh list with explicit empty search
  safeAbort();
  fetchMenus({ page: 1, replace: true, search: "" });

  // optional: hide keyboard
  inputRef.current?.blur?.();
}, [fetchMenus]);


  // initial load & search
  useEffect(() => {
    if (!categoryIdStr) return;
    setPage(1);
    setMenus([]);
    setTotal(null);
    fetchMenus({page: 1, replace: true});
  }, [categoryIdStr, debouncedQuery, fetchMenus]);

  const onRefresh = useCallback(() => {
    if (!categoryIdStr) return;
    setRefreshing(true);
    // clear current list so refresh is visually obvious
    setMenus([]);
    setTotal(null);
    try {
      cancelRef.current?.abort();
    } catch {}
    fetchMenus({page: 1, replace: true});
  }, [categoryIdStr, fetchMenus]);

  const loadMore = useCallback(() => {
    if (loadingMore || loading) return;
    if (typeof total === "number" && menus.length >= total) return;
    fetchMenus({page: page + 1});
  }, [loadingMore, loading, total, menus.length, fetchMenus, page]);

  /* ---------------- Cart actions (per-item lock) ---------------- */
  const handleAddOrIncrease = useCallback(
    async (item: MenuItem) => {
      const menuIdKey = String(item?.menuId ?? item?.menuName ?? "unknown");

      // quick guard
      if (isMenuLoading(menuIdKey)) return;

      const existing = cartMap[Number(item.menuId)];
      // if updating existing, we will definitely call API -> set loading
      if (existing) {
        setMenuLoading(menuIdKey, true);
        try {
          await dispatch(
            updateCartItemAsync({
              cartId: existing.cartId,
              quantity: (existing.quantity || 0) + 1,
              addons: existing.addons || [],
              notes: existing.notes || "",
            })
          ).unwrap();
          if (shopId) await dispatch(fetchCartAsync({shopId})).unwrap();
        } catch (err: any) {
          console.error("Increase failed:", err?.message ?? err);
        } finally {
          setMenuLoading(menuIdKey, false);
        }
        return;
      }

      // adding new item -> need userId and shopId check
      let userId: any = null;
      try {
        userId = await getUserIdFromToken();
      } catch {}
      if (!userId) {
        const raw = await AsyncStorage.getItem("userId");
        if (raw) userId = raw;
      }
      if (!userId) {
        Alert.alert("Login required", "Please login to add items to cart.");
        return;
      }
      if (!shopId) {
        Alert.alert("Shop not selected", "Please select a shop before adding items.");
        return;
      }

      // all good -> set loading and call add
      setMenuLoading(menuIdKey, true);
      try {
        await dispatch(
          addToCartAsync({
            userId: Number(userId),
            shopId: Number(shopId),
            menuId: Number(item.menuId),
            quantity: 1,
            addons: [],
            notes: "",
          })
        ).unwrap();

        // refresh canonical cart state (server authoritative)
        await dispatch(fetchCartAsync({shopId})).unwrap();
      } catch (err: any) {
        console.error("Add failed:", err?.message ?? err);
      } finally {
        setMenuLoading(menuIdKey, false);
      }
    },
    [cartMap, dispatch, shopId, isMenuLoading, setMenuLoading]
  );

  const handleDecrease = useCallback(
    async (item: MenuItem) => {
      const menuIdKey = String(item?.menuId ?? item?.menuName ?? "unknown");
      if (isMenuLoading(menuIdKey)) return;

      const existing = cartMap[Number(item.menuId)];
      if (!existing) return;

      setMenuLoading(menuIdKey, true);
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

        if (shopId) await dispatch(fetchCartAsync({shopId})).unwrap();
      } catch (err: any) {
        console.error("Decrease failed:", err?.message ?? err);
      } finally {
        setMenuLoading(menuIdKey, false);
      }
    },
    [cartMap, dispatch, shopId, isMenuLoading, setMenuLoading]
  );

  /* ---------------- Rendering helpers ---------------- */
  const keyExtractor = useCallback(
    (item: MenuItem, index: number) => {
      const idPart =
        item?.menuId !== undefined && item?.menuId !== null ? String(item.menuId) : `${item.menuName ?? "item"}-${index}`;
      return `${categoryIdStr}-${idPart}`;
    },
    [categoryIdStr]
  );

  const renderItem = useCallback(
    ({item}: {item: MenuItem}) => {
      const menuKey = String(item?.menuId ?? item?.menuName ?? "unknown");
      const loadingFlag = isMenuLoading(menuKey);
      const cartEntry = cartMap[Number(item.menuId)];
      return (
        <MenuRow
          item={item}
          cartEntry={cartEntry}
          onAdd={handleAddOrIncrease}
          onIncrease={handleAddOrIncrease}
          onDecrease={handleDecrease}
          localLoading={loadingFlag}
          forceEnableAdd={isCategoryZero}
        />
      );
    },
    [cartMap, handleAddOrIncrease, handleDecrease, isCategoryZero, isMenuLoading]
  );

  const HeaderBar = useCallback(() => {
    return (
      <View style={{position: "relative"}}>
        <CommonStatusHeader title={categoryName ?? "Category"} bgColor="#FBCEB1" />
        <View style={styles.cartTopRight}>
          <CartIconWithBadge />
        </View>
      </View>
    );
  }, [categoryName]);

  /* ---------------- UI ---------------- */
  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <HeaderBar />

      {/* Search area (clear icon + typing spinner) */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={hp(2.2)} color="#999" />
        <TextInput
          ref={inputRef}
          style={styles.searchInput}
          placeholder={`Search ${categoryName ?? "items"}`}
          value={query}
          onChangeText={setQuery}
          placeholderTextColor="#aaa"
          returnKeyType="search"
          accessible
          accessibilityLabel="Search menus"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        {isSearching ? (
          <ActivityIndicator size="small" color={theme.PRIMARY_COLOR} style={{marginLeft: 8}} />
        ) : null}

        {/* show close/cancel button only when user typed something */}
        {query ? (
          <TouchableOpacity onPress={handleClear} style={{marginLeft: 8}} accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={hp(2.6)} color="#999" />
          </TouchableOpacity>
        ) : null}
      </View>

      {loading && menus.length === 0 ? (
        <ActivityIndicator size="large" color={theme.PRIMARY_COLOR} style={{marginTop: hp(6)}} />
      ) : (
        <>
          {errorMsg ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMsg}</Text>
              <TouchableOpacity onPress={() => fetchMenus({page: 1, replace: true})} style={styles.retryBtn}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : null}

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
            ListFooterComponent={loadingMore ? <ActivityIndicator style={{margin: 12}} /> : null}
            ListEmptyComponent={() =>
              !loading ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No items in this category</Text>
                </View>
              ) : null
            }
            getItemLayout={(_, index) => ({length: ROW_HEIGHT, offset: ROW_HEIGHT * index, index})}
            // extraData ensures list rerenders only when relevant external data changes
            extraData={{cartMap, menuLoadingMap, query, menus}}
          />
        </>
      )}

      <CartBottomBar />
    </SafeAreaProvider>
  );
};

export default CategoryDetailScreen;

/* ---------------- Styles (same as before) ---------------- */
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: "#fff"},

  cartTopRight: {
    position: "absolute",
    right: wp(3),
    top: Platform.select({ios: hp(7), android: hp(4)}),
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
  menuImage: {width: "100%", height: "100%"},

  menuCenter: {flex: 1, marginLeft: wp(3), justifyContent: "center"},
  menuTitle: {fontSize: hp(1.9), fontWeight: "600", color: "#222"},
  menuSubtitle: {fontSize: hp(1.4), color: "#777", marginTop: hp(0.3)},
  menuPrice: {fontSize: hp(1.6), fontWeight: "700", color: "#222", marginTop: hp(0.6)},

  menuRight: {width: wp(28), alignItems: "flex-end", justifyContent: "space-between", marginLeft: wp(2)},

  addButton: {
    backgroundColor: "#6C3F24",
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(0.8),
    borderRadius: wp(2),
    marginTop: hp(1),
    minWidth: wp(18),
    alignItems: "center",
  },
  addBtnText: {color: "#fff", fontSize: hp(1.5), fontWeight: "600"},

  qtyControl: {flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: wp(2)},
  qtyBtn: {padding: hp(0.2)},
  qtyText: {marginHorizontal: wp(2), fontSize: hp(1.6), color: "#222", minWidth: wp(6), textAlign: "center", fontWeight: "600"},

  popularBadge: {backgroundColor: "#EAF9F1", paddingHorizontal: wp(2), paddingVertical: hp(0.4), borderRadius: wp(2)},
  popularText: {color: "#2AA35A", fontSize: hp(1.2), fontWeight: "700"},

  separator: {height: 1, backgroundColor: "#F0F0F0"},

  emptyContainer: {alignItems: "center", marginTop: hp(6)},
  emptyText: {color: "#666", fontSize: hp(1.8)},

  errorContainer: {padding: 16, alignItems: "center"},
  errorText: {color: "red", marginBottom: 8},
  retryBtn: {paddingHorizontal: 14, paddingVertical: 8, backgroundColor: theme.PRIMARY_COLOR, borderRadius: 8},
  retryText: {color: "#fff", fontWeight: "600"},
});