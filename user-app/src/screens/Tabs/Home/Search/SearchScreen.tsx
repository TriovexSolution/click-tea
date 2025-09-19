
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  View,
  Text,
  SectionList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Keyboard,
  SectionListData,
  SectionListRenderItemInfo,
  Platform,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import axios, { CancelTokenSource } from "axios";
import debounce from "lodash.debounce";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "@/api";
import { hp, wp } from "@/src/assets/utils/responsive";
import { useNavigation } from "@react-navigation/native";
import axiosClient from "@/src/api/client";
import { Ionicons } from "@expo/vector-icons";

/* Reanimated imports */
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

/* Types */
type Shop = {
  shopId: number;
  shopName: string;
  shopImage?: string;
  shopDescription?: string;
};
type Category = {
  categoryId: number;
  categoryName: string;
  categoryImage?: string;
};
type Menu = {
  menuId: number;
  menuName: string;
  shopId: number;
  categoryId: number;
  price: number;
  imageUrl?: string;
  ingredients?: string;
  shopName?: string;
  categoryName?: string;
};
type SearchResults = { shops: Shop[]; categories: Category[]; menus: Menu[] };
type SectionItem<T> = { title: string; data: T[]; key: string };

/* Constants */
const RECENT_KEY = "recent_searches_v1";
const MAX_RECENT = 8;
const LIVE_MIN_LEN = 1;
const LIVE_DEBOUNCE_MS = 450;
const limitMenus = 10;

/* Suggestions for the ticker (same as HomeHeader style) */
const DEFAULT_SUGGESTIONS = [
  "tea",
  "coffee",
  "snacks",
  "chai",
  "cold coffee",
  "iced tea",
];

const TICKER_INTERVAL_MS = 2500; // time between transitions
const TICKER_ANIM_MS = 420; // animation duration

const TRENDING = ["Beverages", "Sanosa", "Burger"];

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();

  // Responsive sizes
  const FONT_SIZE = Math.max(13, Math.round(wp(3.6)));
  const INPUT_ITEM_HEIGHT = Math.round(hp(2.6));
  const ITEM_IMAGE_SIZE = Math.round(hp(5.2));

  const inputRef = useRef<TextInput | null>(null);
  const [query, setQuery] = useState<string>("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [results, setResults] = useState<SearchResults>({
    shops: [],
    categories: [],
    menus: [],
  });

  const [pageMenus, setPageMenus] = useState<number>(1);
  const [hasMoreMenus, setHasMoreMenus] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [livePending, setLivePending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const searchCancelRef = useRef<CancelTokenSource | null>(null);

  // Ticker: duplicate first item at end for seamless loop
  const tickerItems = useMemo(() => [...DEFAULT_SUGGESTIONS, DEFAULT_SUGGESTIONS[0]], []);
  const tickerCount = tickerItems.length;
  const tickerIndexRef = useRef<number>(0);
  const tickerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const translateY = useSharedValue(0);
  const tickerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const [focused, setFocused] = useState<boolean>(false);

  // load recent
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(RECENT_KEY);
        if (stored) setRecentSearches(JSON.parse(stored));
      } catch (err) {
        console.warn("Failed to load recent searches", err);
      }
    })();
  }, []);

  const persistRecent = useCallback(async (arr: string[]) => {
    try {
      await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(arr));
    } catch (err) {
      console.warn("Failed to persist recent searches", err);
    }
  }, []);

  const addToRecent = useCallback(
    async (term: string) => {
      const t = term.trim();
      if (!t) return;
      const updated = [t, ...recentSearches.filter((r) => r !== t)].slice(0, MAX_RECENT);
      setRecentSearches(updated);
      await persistRecent(updated);
    },
    [recentSearches, persistRecent]
  );

  const clearRecent = useCallback(async () => {
    setRecentSearches([]);
    try {
      await AsyncStorage.removeItem(RECENT_KEY);
    } catch (err) {
      console.warn("Failed to clear recent", err);
    }
  }, []);

  // -------------------------
  // Main search
  // -------------------------
  const performSearchRaw = useCallback(
    async (searchTerm: string, opts: { reset?: boolean; page?: number } = { reset: true }) => {
      const q = (searchTerm || "").trim();
      if (!q) return;

      // cancel previous
      if (searchCancelRef.current) searchCancelRef.current.cancel("new-search");
      const source = axios.CancelToken.source();
      searchCancelRef.current = source;

      const pageToUse = opts.reset ? 1 : opts.page ?? pageMenus;

      if (opts.reset) {
        setLoading(true);
        setError(null);
        setHasMoreMenus(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const res = await axiosClient.get(`${BASE_URL}/api/search/search`, {
          params: { query: q, pageMenus: pageToUse, limitMenus },
          cancelToken: source.token,
          timeout: 10000,
        });

        const resData = res.data?.results ?? res.data ?? {};
        const normalized: SearchResults = {
          shops: resData.shops ?? [],
          categories: resData.categories ?? [],
          menus: resData.menus ?? [],
        };

        if (opts.reset) {
          setResults(normalized);
          setPageMenus(1);
        } else {
          setResults((prev) => ({
            ...prev,
            menus: [...prev.menus, ...(normalized.menus ?? [])],
          }));
        }

        const receivedMenus = normalized.menus?.length ?? 0;
        setHasMoreMenus(receivedMenus >= limitMenus);
      } catch (err: any) {
        if (!axios.isCancel(err)) {
          console.warn("Search error:", err.message || err);
          setError("Something went wrong. Please try again.");
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [pageMenus]
  );

  // -------------------------
  // Debounced live search
  // -------------------------
  const debouncedLiveSearch = useMemo(
    () =>
      debounce((text: string) => {
        setLivePending(false);
        if (!text || text.trim().length < LIVE_MIN_LEN) {
          if (!text) setResults({ shops: [], categories: [], menus: [] });
          return;
        }
        performSearchRaw(text, { reset: true });
      }, LIVE_DEBOUNCE_MS),
    [performSearchRaw]
  );

  // ---------- handlers ----------
  const onChangeQuery = useCallback(
    (text: string) => {
      setQuery(text);
      setError(null);
      setLivePending(text.trim().length >= LIVE_MIN_LEN);
      debouncedLiveSearch(text);
    },
    [debouncedLiveSearch]
  );

  const onSubmit = useCallback(
    async (text?: string) => {
      const t = (text ?? query ?? "").trim();
      if (!t) return;
      (debouncedLiveSearch as any).cancel?.();
      await performSearchRaw(t, { reset: true });
      await addToRecent(t);
      setLivePending(false);
      Keyboard.dismiss();
    },
    [query, performSearchRaw, addToRecent, debouncedLiveSearch]
  );

  const onRecentPress = useCallback(
    async (term: string) => {
      setQuery(term);
      await performSearchRaw(term, { reset: true });
      await addToRecent(term);
      setLivePending(false);
      Keyboard.dismiss();
    },
    [performSearchRaw, addToRecent]
  );

  const loadMoreMenus = useCallback(async () => {
    if (loadingMore || !hasMoreMenus || loading) return;
    const nextPage = pageMenus + 1;
    setPageMenus(nextPage);
    await performSearchRaw(query, { reset: false, page: nextPage });
  }, [loadingMore, hasMoreMenus, loading, pageMenus, performSearchRaw, query]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await performSearchRaw(query, { reset: true });
    setRefreshing(false);
  }, [performSearchRaw, query]);

  const sections = useMemo((): SectionItem<any>[] => {
    const out: SectionItem<any>[] = [];
    if (results.shops?.length) out.push({ title: "Shops", data: results.shops, key: "shops" });
    if (results.categories?.length) out.push({ title: "Categories", data: results.categories, key: "categories" });
    if (results.menus?.length) out.push({ title: "Menus", data: results.menus, key: "menus" });
    return out;
  }, [results]);

  const imageUriFor = useCallback((item: any): string | null => {
    if (!item) return null;
    if (item.imageUrl) return `${BASE_URL}/uploads/menus/${item.imageUrl}`;
    if (item.shopImage) return `${BASE_URL}/uploads/shops/${item.shopImage}`;
    if (item.categoryImage) return `${BASE_URL}/uploads/categories/${item.categoryImage}`;
    return null;
  }, []);

  const renderSectionHeader = useCallback(
    ({ section }: { section: SectionListData<any> }) => (
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { fontSize: FONT_SIZE }]}>{section.title}</Text>
      </View>
    ),
    [FONT_SIZE]
  );

  // Navigation helpers
  const prefetchMenuAndNavigate = useCallback(
    async (menuId: number, menuName?: string) => {
      try {
        axiosClient.get(`${BASE_URL}/api/menu/${menuId}`, { timeout: 6000 }).catch(() => {});
      } finally {
        navigation.navigate("menuDetailScreen", { menuId, menuName });
      }
    },
    [navigation]
  );

  const goToShop = useCallback(
    (shopId: number, shopName?: string) => {
      navigation.navigate("shopDetailScreen", { shopId, shopName });
    },
    [navigation]
  );

  const goToCategory = useCallback(
    (categoryId: number | undefined, categoryName?: string) => {
      navigation.navigate("categoryDetailScreen", { categoryId, categoryName });
    },
    [navigation]
  );

  const goToCategoryByName = useCallback((name: string) => goToCategory(undefined, name), [goToCategory]);

  const listKeyExtractor = useCallback(
    (item: any, index: number) =>
      (item.menuId || item.shopId || item.categoryId || item.id || index).toString(),
    []
  );

  const renderItem = useCallback(
    ({ item }: SectionListRenderItemInfo<any>) => {
      const title = item.menuName || item.shopName || item.categoryName || item.name;
      const subtitle = item.shopName || item.categoryName || item.description || "";
      const uri = imageUriFor(item);

      const onPress = () => {
        if (item.menuId) {
          prefetchMenuAndNavigate(item.menuId, item.menuName);
        } else if (item.shopId) {
          goToShop(item.shopId, item.shopName);
        } else if (item.categoryId) {
          goToCategory(item.categoryId, item.categoryName);
        } else {
          onSubmit(item.name || title);
        }
      };

      return (
        <TouchableOpacity
          accessible
          accessibilityRole="button"
          accessibilityLabel={`Open ${title}`}
          style={[styles.item, { paddingVertical: Math.round(hp(1.2)) }]}
          onPress={onPress}
        >
          {uri ? (
            <Image source={{ uri }} style={[styles.itemImage, { width: ITEM_IMAGE_SIZE, height: ITEM_IMAGE_SIZE }]} />
          ) : (
            <View style={[styles.itemPlaceholder, { width: ITEM_IMAGE_SIZE, height: ITEM_IMAGE_SIZE }]} />
          )}
          <View style={styles.itemText}>
            <Text numberOfLines={1} style={[styles.itemTitle, { fontSize: FONT_SIZE }]}>
              {title}
            </Text>
            {subtitle ? (
              <Text numberOfLines={1} style={[styles.itemSubtitle, { fontSize: Math.max(12, Math.round(FONT_SIZE * 0.85)) }]}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </TouchableOpacity>
      );
    },
    [imageUriFor, prefetchMenuAndNavigate, goToShop, goToCategory, onSubmit, ITEM_IMAGE_SIZE, FONT_SIZE]
  );

  useEffect(() => {
    // start ticker: smooth loop using duplicated first item
    const startTicker = () => {
      if (tickerIntervalRef.current) return;

      tickerIntervalRef.current = setInterval(() => {
        if (query.trim().length > 0 || focused) return;

        const next = tickerIndexRef.current + 1;
        translateY.value = withTiming(-next * INPUT_ITEM_HEIGHT, { duration: TICKER_ANIM_MS });
        tickerIndexRef.current = next;

        // if reached duplicated end (last index), reset to 0 after animation
        if (next === tickerCount - 1) {
          setTimeout(() => {
            tickerIndexRef.current = 0;
            translateY.value = withTiming(0, { duration: 0 });
          }, TICKER_ANIM_MS + 20);
        }
      }, TICKER_INTERVAL_MS);
    };

    startTicker();
    return () => {
      if (tickerIntervalRef.current) {
        clearInterval(tickerIntervalRef.current);
        tickerIntervalRef.current = null;
      }
    };
  }, [translateY, query, focused, INPUT_ITEM_HEIGHT, tickerCount]);

  useEffect(() => {
    return () => {
      searchCancelRef.current?.cancel?.();
      (debouncedLiveSearch as any).cancel?.();
      if (tickerIntervalRef.current) {
        clearInterval(tickerIntervalRef.current);
        tickerIntervalRef.current = null;
      }
    };
  }, [debouncedLiveSearch]);

  // suggestion press -> set query only (NO NETWORK REQUEST)
  const selectSuggestionLocally = useCallback((s: string) => {
    setQuery(s);
    setLivePending(false);
    Keyboard.dismiss();
    // keep it local so user can edit before submitting
  }, []);

  // -------------------------
  // Render
  // -------------------------
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Header + Search */}
      <View style={styles.headerOuter}>
        <View style={styles.headerInner}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back-outline" size={Math.round(FONT_SIZE * 1.6)} color="#4a2770" />
          </TouchableOpacity>

          <View style={styles.searchCardWrapper}>
            <View style={styles.searchCard}>
              <TextInput
                ref={inputRef}
                style={[styles.searchInput, { fontSize: FONT_SIZE }]}
                value={query}
                onChangeText={onChangeQuery}
                returnKeyType="search"
                onSubmitEditing={() => onSubmit(query)}
                placeholderTextColor="#7f7a8b"
                underlineColorAndroid="transparent"
                accessibilityLabel="Search input"
                autoCorrect={false}
                autoCapitalize="none"
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                // ensure first tap focuses (in case something else briefly intercepts)
                onTouchStart={() => inputRef.current?.focus()}
              />

              {/* Ticker placeholder - intentionally non-interactive so taps pass to TextInput */}
              {!query.trim() && !focused && !livePending ? (
                <View pointerEvents="none" style={[styles.tickerTouch, { top: Platform.OS === "android" ? 8 : 9, bottom: Platform.OS === "android" ? 10 : 9 }]}>
                  <View style={[styles.tickerClip, { height: INPUT_ITEM_HEIGHT }]}>
                    <Animated.View style={[tickerAnimatedStyle]}>
                      {tickerItems.map((w, i) => (
                        <View key={w + i} style={{ height: INPUT_ITEM_HEIGHT, justifyContent: "center" }}>
                          <Text style={[styles.tickerText, { fontSize: FONT_SIZE }]} numberOfLines={1}>
                            {w}
                          </Text>
                        </View>
                      ))}
                    </Animated.View>
                  </View>
                </View>
              ) : null}

              {livePending || loading ? (
                <ActivityIndicator style={{ marginLeft: 8 }} size="small" />
              ) : query ? (
                <TouchableOpacity
                  onPress={() => {
                    setQuery("");
                    setResults({ shops: [], categories: [], menus: [] });
                    setError(null);
                    setLivePending(false);
                    setPageMenus(1);
                  }}
                  accessibilityRole="button"
                >
                  <Ionicons name="close-circle" size={Math.round(FONT_SIZE * 1.6)} color="#7e6b9a" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          <View style={{ width: Math.round(wp(8)) }} />
        </View>
      </View>

      {/* Trending Near You */}
      <View style={[styles.sectionSpacing, { paddingHorizontal: Math.round(wp(4)) }]}>
        <Text style={[styles.trendingTitle, { fontSize: Math.round(FONT_SIZE * 1.1) }]}>Trending Near You</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingRow}>
          {TRENDING.map((t) => (
            <TouchableOpacity key={t} style={styles.trendingChip} onPress={() => goToCategoryByName(t)} accessibilityRole="button" accessibilityLabel={`Trending ${t}`}>
              <Ionicons name="trending-up" size={Math.round(FONT_SIZE * 0.95)} color="#4a2770" style={{ marginRight: 6 }} />
              <Text style={[styles.trendingText, { fontSize: Math.round(FONT_SIZE * 0.95) }]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Recent / results / sectionlist area */}
      {!query.trim() && !loading && sections.length === 0 ? (
        <View style={styles.recentContainer}>
          <View style={styles.recentHeader}>
            <Text style={[styles.sectionTitle, { fontSize: FONT_SIZE }]}>Recent Searches</Text>
            {recentSearches.length > 0 && (
              <TouchableOpacity onPress={clearRecent}>
                <Text style={[styles.clearText, { fontSize: Math.round(FONT_SIZE * 0.9) }]}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {recentSearches.length === 0 ? (
            <Text style={[styles.emptyText, { fontSize: Math.round(FONT_SIZE * 0.95) }]}>No recent searches</Text>
          ) : (
            recentSearches.map((r, idx) => (
              <TouchableOpacity key={idx} style={styles.recentItem} onPress={() => onRecentPress(r)}>
                <Text style={[styles.recentText, { fontSize: FONT_SIZE }]}>{r}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      ) : null}

      {error ? <Text style={[styles.errorText, { fontSize: FONT_SIZE }]}>{error}</Text> : null}

      {loading || livePending ? (
        <View style={styles.centeredLoader}>
          <ActivityIndicator size="large" />
        </View>
      ) : null}

      <SectionList
        sections={sections}
        keyExtractor={listKeyExtractor}
        renderSectionHeader={renderSectionHeader}
        renderItem={renderItem}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{
          paddingBottom: Platform.OS === "android" ? 80 : 40,
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        // allow taps to reach TextInput on first touch
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={() =>
          !loading && !livePending && query.trim() ? (
            <Text style={[styles.noResultText, { fontSize: FONT_SIZE }]}>No results for "{query}"</Text>
          ) : null
        }
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={11}
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          if (results.menus?.length) loadMoreMenus();
        }}
        ListFooterComponent={() => (loadingMore ? <ActivityIndicator style={{ marginVertical: 12 }} /> : null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  /* header */
  headerOuter: {
    backgroundColor: "#efe7ff",
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    paddingBottom: hp(2),
    paddingTop: Platform.OS === "android" ? hp(7) : 0,
  },
  headerInner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: wp(3),
    marginTop: hp(0.6),
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    backgroundColor: "transparent",
  },
  searchCardWrapper: { flex: 1 },
  searchCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: hp(1),
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "android" ? 12 : 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 0,
    color: "#222",
  },
  /* ticker placeholder */
  tickerTouch: {
    position: "absolute",
    left: 20,
    right: 14,
    justifyContent: "center",
  },
  tickerClip: {
    overflow: "hidden",
    justifyContent: "flex-start",
  },
  tickerText: {
    color: "#7f7a8b",
  },

  /* trending */
  sectionSpacing: { marginTop: hp(2) },
  trendingTitle: {
    fontWeight: "700",
    color: "#222",
    marginBottom: hp(1),
  },
  trendingRow: { paddingVertical: 4 },
  trendingChip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e6e0f2",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: "#fff",
  },
  trendingText: { color: "#4a2770", fontWeight: "600" },

  /* rest of original styles */
  sectionHeader: {
    paddingVertical: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
  },
  sectionTitle: { fontWeight: "700", color: "#222" },
  item: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderColor: "#eee",
    paddingHorizontal: 12,
  },
  itemImage: {
    borderRadius: 8,
    backgroundColor: "#ddd",
  },
  itemPlaceholder: {
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  itemText: { marginLeft: 12, flex: 1 },
  itemTitle: { fontWeight: "600" },
  itemSubtitle: { color: "#777", marginTop: 2 },
  recentContainer: {
    marginTop: 12,
    paddingHorizontal: 12,
    marginHorizontal: wp(1),
  },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  clearText: { color: "#e53935" },
  recentItem: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderColor: "#eee",
  },
  recentText: {},
  emptyText: {
    color: "#888",
    textAlign: "center",
    marginTop: 12,
  },
  errorText: { color: "red", textAlign: "center", marginVertical: 8 },
  noResultText: { textAlign: "center", color: "#666", marginTop: 24 },
  centeredLoader: {
    height: 180,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default SearchScreen;
