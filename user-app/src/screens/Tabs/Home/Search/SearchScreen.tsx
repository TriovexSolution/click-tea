// SearchScreen.tsx
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
} from "react-native";
import axios, { CancelTokenSource } from "axios";
import debounce from "lodash.debounce";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "@/api";
import CommonSearchBar from "@/src/Common/CommonSearchBar";
import CommonHeader from "@/src/Common/CommonHeader";
import { hp, wp } from "@/src/assets/utils/responsive";
import { useNavigation } from "@react-navigation/native";

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
type Suggestion = {
  id: number;
  name: string;
  type: "menu" | "shop" | "category";
};
type SearchResults = { shops: Shop[]; categories: Category[]; menus: Menu[] };
type SectionItem<T> = { title: string; data: T[]; key: string };

const RECENT_KEY = "recent_searches_v1";
const MAX_RECENT = 8;

const SUGGEST_MIN_LEN = 2;
const LIVE_MIN_LEN = 1;
const LIVE_DEBOUNCE_MS = 450;
const SUGGEST_DEBOUNCE_MS = 300;

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [query, setQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [results, setResults] = useState<SearchResults>({
    shops: [],
    categories: [],
    menus: [],
  });

  const [pageMenus, setPageMenus] = useState<number>(1);
  const limitMenus = 10;
  const [hasMoreMenus, setHasMoreMenus] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(false); // full search network loading
  const [loadingMore, setLoadingMore] = useState<boolean>(false); // pagination
  const [suggestLoading, setSuggestLoading] = useState<boolean>(false); // suggestions only
  const [livePending, setLivePending] = useState<boolean>(false); // waiting for debounce to fire
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const suggestCancelRef = useRef<CancelTokenSource | null>(null);
  const searchCancelRef = useRef<CancelTokenSource | null>(null);

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
      const updated = [t, ...recentSearches.filter((r) => r !== t)].slice(
        0,
        MAX_RECENT
      );
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
  // Suggestions
  // -------------------------
  const fetchSuggestionsRaw = useCallback(async (text: string) => {
    if (suggestCancelRef.current) suggestCancelRef.current.cancel("new-sugg");
    if (!text || text.trim().length < SUGGEST_MIN_LEN) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSuggestLoading(false);
      return;
    }

    setSuggestLoading(true);
    const source = axios.CancelToken.source();
    suggestCancelRef.current = source;

    try {
      const res = await axios.get<{ suggestions?: Suggestion[] }>(
        `${BASE_URL}/api/search/search-suggestions`,
        {
          params: { query: text.trim() },
          cancelToken: source.token,
          timeout: 5000,
        }
      );
      const payload = res.data?.suggestions ?? [];
      setSuggestions(payload);
      setShowSuggestions(payload.length > 0);
    } catch (err: any) {
      if (!axios.isCancel(err)) console.warn("Suggestion fetch error:", err.message || err);
    } finally {
      setSuggestLoading(false);
    }
  }, []);

  const fetchSuggestions = useMemo(
    () => debounce(fetchSuggestionsRaw, SUGGEST_DEBOUNCE_MS),
    [fetchSuggestionsRaw]
  );

  // -------------------------
  // Main search
  // -------------------------
  const performSearchRaw = useCallback(
    async (searchTerm: string, opts: { reset: boolean } = { reset: true }) => {
      const q = (searchTerm || "").trim();
      if (!q) return;

      // cancel previous
      if (searchCancelRef.current) searchCancelRef.current.cancel("new-search");
      const source = axios.CancelToken.source();
      searchCancelRef.current = source;

      const pageToUse = opts.reset ? 1 : pageMenus;

      if (opts.reset) {
        setLoading(true);
        setError(null);
        setHasMoreMenus(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const res = await axios.get(`${BASE_URL}/api/search/search`, {
          params: { query: q, pageMenus: pageToUse, limitMenus },
          cancelToken: source.token,
          timeout: 10000,
        });

        // server might return either { results: {...}} or { shops,categories,menus }
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
        setShowSuggestions(false);
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
        // when the debounced function runs, clear livePending since we start request
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

      // mark pending while debounce waits
      setLivePending(text.trim().length >= LIVE_MIN_LEN);

      fetchSuggestions(text); // suggestions (debounced inside)
      debouncedLiveSearch(text); // live search (debounced)
    },
    [fetchSuggestions, debouncedLiveSearch]
  );

  const onSubmit = useCallback(
    async (text?: string) => {
      const t = (text ?? query ?? "").trim();
      if (!t) return;

      // cancel debounced live search to avoid duplicate request
      (debouncedLiveSearch as any).cancel?.();

      await performSearchRaw(t, { reset: true });
      await addToRecent(t);

      setLivePending(false);
      Keyboard.dismiss();
    },
    [query, performSearchRaw, addToRecent, debouncedLiveSearch]
  );

  const onSuggestionPress = useCallback(
    async (s: Suggestion) => {
      const text = s.name;
      setQuery(text);
      setShowSuggestions(false);

      // If suggestion includes type and id you could navigate directly.
      // For safety we run a search and add to recent (keeps your existing UX).
      await performSearchRaw(text, { reset: true });
      await addToRecent(text);

      setLivePending(false);
      Keyboard.dismiss();
    },
    [performSearchRaw, addToRecent]
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
    await performSearchRaw(query, { reset: false });
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
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>
    ),
    []
  );

  // Navigation helpers (production-friendly: small prefetch + debounce protection)
  const prefetchMenuAndNavigate = useCallback(
    async (menuId: number, menuName?: string) => {
      // Basic prefetch -> optional improvement: fetch menu detail so destination loads quick
      try {
        // Fire & forget prefetch (no blocking navigation)
        axios.get(`${BASE_URL}/api/menu/${menuId}`, { timeout: 6000 }).catch(() => {});
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
    (categoryId: number, categoryName?: string) => {
      navigation.navigate("categoryDetailScreen", { categoryId, categoryName });
    },
    [navigation]
  );

  const listKeyExtractor = useCallback(
    (item: any, index: number) =>
      (
        item.menuId ||
        item.shopId ||
        item.categoryId ||
        item.id ||
        index
      ).toString(),
    []
  );

  const renderItem = useCallback(({ item }: SectionListRenderItemInfo<any>) => {
    const title = item.menuName || item.shopName || item.categoryName || item.name;
    const subtitle = item.shopName || item.categoryName || item.description || "";
    const uri = imageUriFor(item);

    const onPress = () => {
      // detect by id presence (menuId/shopId/categoryId)
      if (item.menuId) {
        prefetchMenuAndNavigate(item.menuId, item.menuName);
      } else if (item.shopId) {
        goToShop(item.shopId, item.shopName);
      } else if (item.categoryId) {
        goToCategory(item.categoryId, item.categoryName);
      } else {
        // fallback to performing a search with name
        onSubmit(item.name || title);
      }
    };

    return (
      <TouchableOpacity
        accessible
        accessibilityRole="button"
        accessibilityLabel={`Open ${title}`}
        style={styles.item}
        onPress={onPress}
      >
        {uri ? (
          <Image source={{ uri }} style={styles.itemImage} />
        ) : (
          <View style={styles.itemPlaceholder} />
        )}
        <View style={styles.itemText}>
          <Text numberOfLines={1} style={styles.itemTitle}>
            {title}
          </Text>
          {subtitle ? (
            <Text numberOfLines={1} style={styles.itemSubtitle}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  }, [imageUriFor, prefetchMenuAndNavigate, goToShop, goToCategory, onSubmit]);

  useEffect(() => {
    return () => {
      suggestCancelRef.current?.cancel();
      searchCancelRef.current?.cancel();
      (fetchSuggestions as any).cancel?.();
      (debouncedLiveSearch as any).cancel?.();
    };
  }, [fetchSuggestions, debouncedLiveSearch]);

  // -------------------------
  // Render
  // -------------------------
  return (
    <View style={styles.container}>
      <View style={{ marginLeft: -5 }}>
        <CommonHeader title="Search" />
      </View>

      <View style={{
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: wp(4),
        marginTop: hp(1.5),
      }}>
        <CommonSearchBar
          value={query}
          onChangeText={onChangeQuery}
          placeholder="Search for tea, coffee, snacks..."
          inputProps={{ clearButtonMode: "while-editing" }}
          onSubmit={() => onSubmit(query)}
          showClear
          onClear={() => {
            setQuery("");
            setResults({ shops: [], categories: [], menus: [] });
            setError(null);
            setLivePending(false);
          }}
        />
        {suggestLoading ? <ActivityIndicator style={{ marginLeft: 8 }} size="small" /> : null}
      </View>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsBox}>
          <SectionList
            sections={[{ title: "", data: suggestions }]}
            keyExtractor={(s: Suggestion, i) => `${s.type}-${s.id ?? i}`}
            renderItem={({ item }: { item: Suggestion }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => onSuggestionPress(item)}
              >
                <Text style={styles.suggestionText}>{item.name}</Text>
                <Text style={styles.suggestionType}>{item.type}</Text>
              </TouchableOpacity>
            )}
            renderSectionHeader={() => null}
          />
        </View>
      )}

      {/* Recent searches */}
      {!query.trim() && !loading && sections.length === 0 && (
        <View style={styles.recentContainer}>
          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            {recentSearches.length > 0 && (
              <TouchableOpacity onPress={clearRecent}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {recentSearches.length === 0 ? (
            <Text style={styles.emptyText}>No recent searches</Text>
          ) : (
            recentSearches.map((r, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.recentItem}
                onPress={() => onRecentPress(r)}
              >
                <Text style={styles.recentText}>{r}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* central loader */}
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
        contentContainerStyle={{ paddingBottom: Platform.OS === "android" ? 80 : 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={() =>
          !loading && !livePending && query.trim() ? (
            <Text style={styles.noResultText}>No results for "{query}"</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  suggestionsBox: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginHorizontal: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  suggestionItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  suggestionText: { fontSize: 14 },
  suggestionType: { fontSize: 12, color: "#888", textTransform: "capitalize" },
  sectionHeader: {
    paddingVertical: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#222" },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: "#eee",
    paddingHorizontal: 12,
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#ddd",
  },
  itemPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  itemText: { marginLeft: 12, flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: "600" },
  itemSubtitle: { fontSize: 12, color: "#777", marginTop: 2 },
  recentContainer: { marginTop: 12, paddingHorizontal: 12, marginHorizontal: wp(1) },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  clearText: { color: "#e53935", fontSize: 13 },
  recentItem: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderColor: "#eee",
  },
  recentText: { fontSize: 14 },
  emptyText: {
    fontSize: 13,
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
