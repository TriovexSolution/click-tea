
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
  Platform,
  TextInput,
  Keyboard,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { hp, wp } from "@/src/assets/utils/responsive";
import theme from "@/src/assets/colors/theme";
import { BASE_URL } from "@/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import axios from "axios";
import axiosClient from "@/src/api/client";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import CommonStatusHeader from "@/src/Common/CommonStatusHeader";
import { useDebounce } from "use-debounce";

/* ---------------- Types ---------------- */
export type MenuItem = {
  menuId: number;
  menuName?: string;
  imageUrl?: string;
  price?: string;
  isAvailable?: number;
};

export type CategoryType = {
  categoryId: number;
  categoryName: string;
  categoryImage?: string | null;
  menus?: MenuItem[];
  is_global?: number;
  shop_id?: number;
};

/* ---------------- Constants ---------------- */
const CARD_SPACING = wp(4);
const CARD_WIDTH = Math.round((wp(100) - CARD_SPACING * 3) / 2); // two columns
const PLACEHOLDER_IMAGE = require("@/src/assets/images/onBoard1.png");

const DEFAULT_SUGGESTIONS = ["tea", "coffee", "snacks", "chai", "cold coffee", "iced tea"];
const INPUT_ITEM_HEIGHT = Math.round(hp(2.6));
const TICKER_INTERVAL = 2500;
const TICKER_ANIM_DURATION = 420;

/* ---------------- CategoryCard (memoized + animated) ---------------- */
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const CategoryCard: React.FC<{
  item: CategoryType;
  selected?: boolean;
  onPress: (c: CategoryType) => void;
}> = React.memo(
  ({ item, selected = false, onPress }) => {
    const scale = useSharedValue(1);
    const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }), []);

    const handlePressIn = () => (scale.value = withTiming(0.96));
    const handlePressOut = () => (scale.value = withTiming(1));
    const handlePress = () => {
      scale.value = withTiming(0.98);
      setTimeout(() => (scale.value = withTiming(1)), 140);
      onPress(item);
    };

    return (
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[styles.categoryCard, selected && styles.categoryCardSelected]}
        accessibilityRole="button"
        accessibilityLabel={`Category ${item.categoryName}`}
      >
        <Animated.View style={[aStyle, { width: CARD_WIDTH, alignItems: "center" }]}>
          <LinearGradient
            colors={["rgba(255,255,255,0.98)", "rgba(250,245,240,0.98)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardInner}
          >
            <Image
              source={
                item.categoryImage ? { uri: `${BASE_URL}/uploads/categories/${item.categoryImage}` } : PLACEHOLDER_IMAGE
              }
              style={styles.categoryImage}
              resizeMode="cover"
              accessible
              accessibilityLabel={`${item.categoryName} image`}
            />

            <Text style={styles.categoryTitle} numberOfLines={1}>
              {item.categoryName}
            </Text>

            <Text style={styles.categoryCount}>{(item.menus?.length ?? 0) + " items"}</Text>
          </LinearGradient>
        </Animated.View>
      </AnimatedPressable>
    );
  },
  (a, b) =>
    a.item.categoryId === b.item.categoryId &&
    (a.item.menus?.length ?? 0) === (b.item.menus?.length ?? 0) &&
    a.selected === b.selected
);
CategoryCard.displayName = "CategoryCard";

/* ---------------- Screen ---------------- */
const ViewAllCategoryScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const FONT_SIZE = Math.max(13, Math.round(wp(3.6)));

  /* state */
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  /* search */
  const [query, setQuery] = useState<string>("");
  const [debouncedQuery] = useDebounce(query, 300); // use-debounce for stable behaviour
  const isSearching = query.trim().length > 0 && query !== debouncedQuery;

  /* cancellation refs */
  const cancelRef = useRef(axiosClient.CancelToken.source());
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        tokenRef.current = await AsyncStorage.getItem("authToken");
      } catch {
        tokenRef.current = null;
      }
    })();
  }, []);

  /* fetch categories (cancellable) */
  const fetchCategories = useCallback(
    async (opts: { refresh?: boolean } = {}) => {
      if (!opts.refresh) setLoading(true);
      try {
        // cancel previous
        cancelRef.current?.cancel?.("new-request");
        cancelRef.current = axiosClient.CancelToken.source();

        const res = await axiosClient.get("/api/category/categories-with-menus", {
          cancelToken: cancelRef.current.token,
          timeout: 15000,
        });

        const payload = Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : [];
        setCategories(payload);
      } catch (err: any) {
        if (!axios.isCancel(err)) {
          console.warn("fetchCategories error:", err?.message ?? err);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchCategories();
    return () => {
      // cancel on unmount
      try {
        cancelRef.current?.cancel?.("component-unmount");
      } catch {}
    };
  }, [fetchCategories]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    try {
      cancelRef.current?.cancel?.("user-refresh");
      cancelRef.current = axiosClient.CancelToken.source();
    } catch {}
    fetchCategories({ refresh: true });
  }, [fetchCategories]);

  /* filtered categories (memoized) */
  const filtered = useMemo(() => {
    const q = debouncedQuery.toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => (c.categoryName ?? "").toLowerCase().includes(q));
  }, [categories, debouncedQuery]);

  /* category press */
  const onPressCategory = useCallback(
    (cat: CategoryType) => {
      setSelectedCategoryId(cat.categoryId);
      navigation.navigate("categoryDetailScreen" as never, {
        categoryId: cat.categoryId,
        categoryName: cat.categoryName,
      } as never);
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: { item: CategoryType }) => (
      <CategoryCard item={item} selected={selectedCategoryId === item.categoryId} onPress={onPressCategory} />
    ),
    [onPressCategory, selectedCategoryId]
  );

  const keyExtractor = useCallback((it: CategoryType) => String(it.categoryId), []);

  /* ------------ ticker (same animation as your other screen) ------------ */
  // stable ticker items: append first item for seamless loop
  const tickerItems = useMemo(() => {
    if (!Array.isArray(DEFAULT_SUGGESTIONS) || DEFAULT_SUGGESTIONS.length === 0) return [];
    return [...DEFAULT_SUGGESTIONS, DEFAULT_SUGGESTIONS[0]];
  }, []);

  const tickerCount = tickerItems.length;
  const tickerIndexRef = useRef<number>(0);
  const tickerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const translateY = useSharedValue(0);
  const tickerAnimStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }), []);

  useEffect(() => {
    // start ticker only when there is something to show
    const start = () => {
      if (tickerIntervalRef.current) return;
      tickerIntervalRef.current = setInterval(() => {
        // pause when user is typing / searching
        if (isSearching) return;
        const next = tickerIndexRef.current + 1;
        translateY.value = withTiming(-next * INPUT_ITEM_HEIGHT, { duration: TICKER_ANIM_DURATION });
        tickerIndexRef.current = next;
        if (next === tickerCount - 1) {
          // seamless reset
          setTimeout(() => {
            tickerIndexRef.current = 0;
            translateY.value = withTiming(0, { duration: 0 });
          }, TICKER_ANIM_DURATION + 20);
        }
      }, TICKER_INTERVAL);
    };
    start();
    return () => {
      if (tickerIntervalRef.current) {
        clearInterval(tickerIntervalRef.current);
        tickerIntervalRef.current = null;
      }
    };
  }, [translateY, isSearching, tickerCount]);

  /* defensive cleanup on unmount */
  useEffect(() => {
    return () => {
      if (tickerIntervalRef.current) {
        clearInterval(tickerIntervalRef.current);
      }
      try {
        cancelRef.current?.cancel?.("unmount");
      } catch {}
    };
  }, []);

  /* input refs + focus handling - to ensure first tap focuses on some devices */
  const inputRef = useRef<TextInput | null>(null);
  const [focused, setFocused] = useState(false);
  const handleInputTouch = useCallback(() => inputRef.current?.focus(), []);

  /* cancel search (clear query + cancel inflight) */
  const handleClearSearch = useCallback(() => {
    setQuery("");
    try {
      cancelRef.current?.cancel?.("search-cancel");
    } catch {}
    // when clearing we might show full list -> refetch to ensure fresh state
    fetchCategories();
  }, [fetchCategories]);

  return (
    <SafeAreaView style={styles.container}>
      <CommonStatusHeader title="All Categories" bgColor="#F5DEB3" />

      {/* Search area */}
      <View style={{ paddingHorizontal: wp(5), marginTop: hp(2) }}>
        <View style={styles.searchCard}>
          <Ionicons name="search" size={Math.round(FONT_SIZE * 1.05)} color="#7e6b9a" style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <TextInput
              ref={inputRef}
              value={query}
              onChangeText={setQuery}
              // placeholder="Search categories, snacks, tea..."
              placeholderTextColor="#7f7a8b"
              style={[styles.searchInput, { fontSize: FONT_SIZE }]}
              returnKeyType="search"
              onSubmitEditing={() => Keyboard.dismiss()}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onTouchStart={handleInputTouch}
              underlineColorAndroid="transparent"
              autoCorrect={false}
              autoCapitalize="none"
              accessible
              accessibilityLabel="Search categories"
            />

            {/* ticker overlay (non-interactive) */}
            {!query.trim() && !focused ? (
              <View
                pointerEvents="none"
                style={[
                  styles.tickerTouch,
                  {
                    top: Platform.OS === "android" ? 8 : 9,
                    bottom: Platform.OS === "android" ? 10 : 9,
                  },
                ]}
              >
                <View style={[styles.tickerClip, { height: INPUT_ITEM_HEIGHT }]}>
                  <Animated.View style={[tickerAnimStyle]}>
                    {tickerItems.map((w, i) => (
                      <View key={String(w) + i} style={{ height: INPUT_ITEM_HEIGHT, justifyContent: "center" }}>
                        <Text style={[styles.tickerText, { fontSize: FONT_SIZE }]} numberOfLines={1}>
                          {w}
                        </Text>
                      </View>
                    ))}
                  </Animated.View>
                </View>
              </View>
            ) : null}
          </View>

          {/* show spinner while user is typing (debounce pending) */}
          {isSearching ? (
            <ActivityIndicator size="small" color={theme.PRIMARY_COLOR} style={{ marginLeft: 8 }} />
          ) : null}

          {/* clear / cancel icon */}
          {query ? (
            <Pressable onPress={handleClearSearch} accessibilityRole="button" style={{ marginLeft: 8 }}>
              <Ionicons name="close-circle" size={Math.round(FONT_SIZE * 1.1)} color="#7e6b9a" />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* content */}
      {loading && categories.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.PRIMARY_COLOR} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={6}
          maxToRenderPerBatch={8}
          windowSize={9}
          removeClippedSubviews={Platform.OS === "android"}
          updateCellsBatchingPeriod={50}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.PRIMARY_COLOR} />}
          ListEmptyComponent={() =>
            !loading ? (
              <View style={styles.emptyContainer}>
                <Image source={PLACEHOLDER_IMAGE} style={styles.emptyIllustration} resizeMode="contain" />
                <Text style={styles.emptyText}>No categories found</Text>
                <Text style={styles.emptySub}>Try a different search or check back later</Text>
              </View>
            ) : null
          }
          keyboardShouldPersistTaps="handled"
        />
      )}
    </SafeAreaView>
  );
};

export default ViewAllCategoryScreen;

/* ---------------- Styles ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  centered: { flex: 1, alignItems: "center", justifyContent: "center" },

  listContent: {
    paddingHorizontal: CARD_SPACING,
    paddingTop: hp(2),
    paddingBottom: hp(6),
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: hp(1.6),
  },

  categoryCard: {
    width: CARD_WIDTH,
    borderRadius: wp(3),
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  categoryCardSelected: {
    borderWidth: 2,
    borderColor: theme.PRIMARY_COLOR,
    shadowColor: theme.PRIMARY_COLOR,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  cardInner: {
    width: "100%",
    paddingVertical: hp(2),
    alignItems: "center",
    justifyContent: "flex-start",
  },

  categoryImage: {
    width: CARD_WIDTH * 0.66,
    height: CARD_WIDTH * 0.66,
    borderRadius: wp(3),
    marginBottom: hp(1),
    backgroundColor: "#f6f6f6",
  },
  categoryTitle: {
    fontSize: hp(2.0),
    fontWeight: "700",
    color: "#222",
    textAlign: "center",
  },
  categoryCount: {
    fontSize: hp(1.5),
    color: theme.PRIMARY_COLOR,
    marginTop: hp(0.6),
    fontWeight: "700",
  },

  emptyContainer: {
    paddingTop: hp(10),
    alignItems: "center",
  },
  emptyIllustration: {
    width: wp(40),
    height: wp(34),
    marginBottom: hp(2),
    tintColor: "#ccc",
  },
  emptyText: {
    fontSize: hp(2.0),
    color: "#444",
    fontWeight: "700",
  },
  emptySub: {
    marginTop: hp(1),
    fontSize: hp(1.6),
    color: "#777",
  },

  /* search card */
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

  /* ticker overlay */
  tickerTouch: {
    position: "absolute",
    left: 0,
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

  /* leftover */
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
});

