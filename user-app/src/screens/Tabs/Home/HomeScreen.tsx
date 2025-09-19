// src/screens/Home/HomeScreen.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Pressable,
  Image,
  TextInput,
  RefreshControl,
  Platform,
  StatusBar,
  ListRenderItemInfo,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ParamListBase } from "@react-navigation/native";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useDebounce } from "use-debounce";
import { Ionicons } from "@expo/vector-icons";
import {
  useQuery,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";

import apiClient from "@/src/api/client";
import theme from "@/src/assets/colors/theme";
import { hp, wp } from "@/src/assets/utils/responsive";
import { setSelectedShopId } from "@/src/Redux/Slice/selectedShopSlice";
import SideMenuModal from "@/src/Common/SlideMenuModal";
import ShopSkeleton from "@/src/components/skeltons/ShopSkeleton";
import CategorySkeleton from "@/src/components/skeltons/CategorySkeleton";
import CarouselBanner from "@/src/components/CarouselBanner";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useAnimatedScrollHandler,
  useAnimatedReaction,
  useDerivedValue,
  interpolateColor,
  runOnJS,
} from "react-native-reanimated";

import PopularSkeleton from "@/src/components/skeltons/PopularSkeleton";
import FloatingCoffeeButton from "@/src/components/Button/FloatingCoffeeButton";
import { SHADOW } from "@/src/assets/utils/shadow";

/* ---------------- Types ---------------- */
type RootState = any;
type CategoryType = {
  categoryId: number;
  categoryName: string;
  categoryImage?: string | null;
};
type ItemType = {
  shopname?: ReactNode;
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

/* ---------------- Constants / Sizes ---------------- */
const TYPE = {
  h1: hp(2.8),
  h2: hp(2.4),
  body: hp(1.8),
  small: hp(1.4),
  micro: hp(1.1),
  hero: hp(5.2),
};

const PAGE_SIZE = 10;
const ICON = { small: hp(1.8), medium: hp(2.4), large: hp(3.0) };

const DAILY_MESSAGES = [
  "Are you chai? Because you spice up my mornings",
  "Are you sugar? Because you make my coffee sweet",
  "Like foam on cappuccino, you’re the highlight of my day",
  "Snacks in 3 clicks? Faster than falling for you",
  "Snacks delivered faster than my pickup lines",
  "I’ll bring the tea, you bring the gossip",
  "Your smile + my snacks = the real combo meal",
];

const DEFAULT_SUGGESTIONS = [
  "tea",
  "coffee",
  "snacks",
  "chai",
  "cold coffee",
  "iced tea",
];

const bannerData = [
  { image: require("@/src/assets/images/Cappaciuno Latte.jpg") },
  { image: require("@/src/assets/images/Cold Coffee.jpg") },
  { image: require("@/src/assets/images/Green Tea.jpg") },
  { image: require("@/src/assets/images/Iced tea.jpg") },
];

const INPUT_ITEM_HEIGHT = Math.round(hp(2.2));
const PAGE_TICKER_INTERVAL = 2500;

/* ---------------- API helpers ---------------- */
const fetchCategories = async (): Promise<CategoryType[]> => {
  try {
    const res = await apiClient.get("/api/category/categories-with-menus");
    const payload = Array.isArray(res?.data?.data)
      ? res.data.data
      : Array.isArray(res?.data)
      ? res.data
      : [];
    return payload;
  } catch (err) {
    console.error("fetchCategories error", err);
    return [];
  }
};

const fetchPopular = async (
  lat?: number,
  lng?: number
): Promise<ItemType[]> => {
  if (!lat || !lng) return [];
  try {
    const res = await apiClient.get("/api/orders/popular-items", {
      params: { lat, lng },
    });
    const payload = Array.isArray(res?.data)
      ? res.data
      : res?.data?.popularItems ?? res?.data?.items ?? res?.data ?? [];
    return Array.isArray(payload) ? payload : [];
  } catch (err) {
    console.error("fetchPopular error", err);
    return [];
  }
};

const fetchShopsPage = async ({ pageParam = 0, queryKey }: any) => {
  const [_key, lat, lng, search] = queryKey;
  try {
    const res = await apiClient.get("/api/shops/nearby", {
      params: {
        lat,
        lng,
        onlyOpen: true,
        limit: PAGE_SIZE,
        offset: pageParam,
        search: search || undefined,
      },
    });
    const data = Array.isArray(res?.data) ? res.data : res?.data?.items ?? [];
    const total =
      Number(
        res?.data?.total ?? (Array.isArray(res?.data) ? res.data.length : 0)
      ) || 0;
    return {
      data,
      nextOffset: data.length === 0 ? null : pageParam + PAGE_SIZE,
      total,
    };
  } catch (err) {
    console.error("fetchShopsPage error", err);
    return { data: [], nextOffset: null, total: 0 };
  }
};

const fetchAllBestSellers = async (): Promise<ItemType[]> => {
  try {
    const res = await apiClient.get("/api/best-sellers/all");
    return Array.isArray(res?.data) ? res.data : [];
  } catch (err) {
    console.error("fetchAllBestSellers error", err);
    return [];
  }
};

/* ---------------- UI primitives ---------------- */
const ShopCard: React.FC<{ item: ShopType; onOpen: (id: number) => void }> =
  React.memo(({ item, onOpen }) => {
    const open = typeof item.isOpen === "boolean" ? item.isOpen : true;
    const eta = item.etaMinutes ?? null;
    const distance = item.distanceKm ?? null;
    const baseURL = apiClient.defaults.baseURL;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.shopCard,
          { transform: [{ scale: pressed ? 0.98 : 1 }] },
        ]}
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
            <Text style={styles.shopName} numberOfLines={1}>
              {item.shopname}
            </Text>
            <View style={styles.viewMenuView}>
              <View
                style={[
                  styles.statusBadge,
                  open ? styles.openBadge : styles.closedBadge,
                ]}
              >
                <Text style={styles.statusText}>
                  {open ? "Open" : "Closed"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.shopMeta}>
            <Ionicons name="star" size={12} color="#FFC107" />
            <Text style={styles.metaText}>4.5</Text>
            <Text style={styles.metaText}> • {eta ? `${eta} min` : "—"}</Text>
            <Text style={styles.metaText}>
              {distance ? ` • ${distance} km` : ""}
            </Text>
          </View>

          <View style={styles.tagRow}>
            <Text style={styles.tag}>Masala Chai</Text>
            <Text style={styles.tag}>Filter Coffee</Text>
          </View>
        </View>
      </Pressable>
    );
  });
ShopCard.displayName = "ShopCard";

const CategoryItem = React.memo(function CategoryItem({
  item,
  onPress,
}: {
  item: CategoryType;
  onPress: (c: CategoryType) => void;
}) {
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withTiming(0.94, { duration: 120 });
    setTimeout(() => {
      scale.value = withTiming(1, { duration: 240 });
    }, 120);
    onPress(item);
  };

  return (
    <Pressable onPress={handlePress} style={{ marginRight: wp(3) }}>
      <Animated.View style={[aStyle]}>
        <View style={styles.popularItem}>
          <View style={styles.popularCircle}>
            {item.categoryImage ? (
              <Image
                source={{
                  uri: `${apiClient.defaults.baseURL}/uploads/categories/${item.categoryImage}`,
                }}
                style={styles.popularImg}
                resizeMode="cover"
              />
            ) : (
              <Image
                source={require("@/src/assets/images/onBoard1.png")}
                style={styles.popularImg}
              />
            )}
          </View>
          <Text style={styles.popularName} numberOfLines={1}>
            {item.categoryName}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
});

/* ---------------- HomeHeader (memoized) ---------------- */
const HomeHeader = React.memo(function HomeHeader({
  insets,
  location,
  navigation,
  searchText,
  setSearchText,
  greeting,
  dailyMessage,
  categories,
  loadingCategories,
  onOpenCategory,
  onMenuPress,
  onNotificationsPress,
}: any) {
  const limitedCategories = Array.isArray(categories)
    ? categories.slice(0, 7)
    : [];

  const FONT_SIZE = Math.max(13, Math.round(wp(3.6)));
  const ITEM_HEIGHT = Math.round(hp(2.2));
  const tickerItems = useMemo(() => {
    if (!Array.isArray(DEFAULT_SUGGESTIONS) || DEFAULT_SUGGESTIONS.length === 0)
      return [];
    return [...DEFAULT_SUGGESTIONS, DEFAULT_SUGGESTIONS[0]];
  }, []);
  const tickerCount = tickerItems.length;
  const tickerIndexRef = useRef<number>(0);
  const tickerIntervalRef = useRef<number | null>(null);
  const translateY = useSharedValue(0);
  const tickerAnimStyle = useAnimatedStyle(
    () => ({ transform: [{ translateY: translateY.value }] }),
    []
  );

  useEffect(() => {
    const start = () => {
      if (tickerIntervalRef.current) return;
      // using window.setInterval to get a number id (work in RN)
      tickerIntervalRef.current = (global as any).setInterval(() => {
        if (searchText?.trim().length > 0) return;
        const next = tickerIndexRef.current + 1;
        translateY.value = withTiming(-next * ITEM_HEIGHT, { duration: 420 });
        tickerIndexRef.current = next;
        if (next === tickerCount - 1) {
          setTimeout(() => {
            tickerIndexRef.current = 0;
            translateY.value = withTiming(0, { duration: 0 });
          }, 420 + 20);
        }
      }, PAGE_TICKER_INTERVAL);
    };
    start();
    return () => {
      if (tickerIntervalRef.current) {
        clearInterval(tickerIntervalRef.current);
        tickerIntervalRef.current = null;
      }
    };
  }, [translateY, searchText, ITEM_HEIGHT, tickerCount]);

  return (
    <View>
      <LinearGradient
        colors={["#5C2C18", "#A65A3A", "#F5E0C3"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.topHeaderBackground,
          {
            paddingTop:
              (insets.top ||
                (Platform.OS === "android"
                  ? StatusBar.currentHeight ?? 24
                  : 0)) + hp(2),
          },
        ]}
      >
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />

        <View style={styles.topHeaderInner}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Pressable
              onPress={onMenuPress}
              hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
            >
              <Ionicons name="menu-outline" size={ICON.large} color="#fff" />
            </Pressable>

            <TouchableOpacity
              style={styles.locationRow}
              onPress={() => navigation.navigate("locationScreen" as never)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Open location selector"
            >
              <View style={styles.locationBadge}>
                <Ionicons
                  name="location-outline"
                  size={hp(2)}
                  color={theme.PRIMARY_COLOR}
                />
              </View>

              <View style={{ marginLeft: 10, maxWidth: wp(56) }}>
                <Text style={styles.locationTitle} numberOfLines={1}>
                  {location
                    ? "Iskon Junction, Iskcon Ambli..."
                    : "Select Location"}
                </Text>
                <Text style={styles.locationSubtitle} numberOfLines={1}>
                  {location
                    ? `${location.latitude}, ${location.longitude}`
                    : "Tap to choose"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={onNotificationsPress}
            hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
            accessibilityRole="button"
          >
            <Ionicons
              name="notifications-outline"
              size={ICON.large}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>{greeting}, Aarin</Text>

          <View style={styles.dailyMessageWrapper}>
            <Text
              style={styles.dailyMessage}
              numberOfLines={2}
              ellipsizeMode="tail"
              accessibilityLabel={`Daily message: ${dailyMessage}`}
            >
              {dailyMessage}
            </Text>
          </View>
        </View>

        <View style={styles.searchRow}>
          {searchText ? (
            <TouchableOpacity
              onPress={() => setSearchText("")}
              hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
            >
              <Ionicons name="close-circle" size={ICON.small} />
            </TouchableOpacity>
          ) : (
            <Ionicons
              name="search"
              size={ICON.small}
              color="#999"
              style={styles.searchIcon}
            />
          )}

          <TouchableOpacity
            style={styles.searchInput}
            activeOpacity={1}
            onPress={() => navigation.navigate("searchScreen" as never)}
            accessibilityRole="button"
            accessibilityLabel="Open search"
          >
            <TextInput
              editable={false}
              pointerEvents="none"
              style={styles.searchInputText}
              value={searchText}
              onChangeText={setSearchText}
              returnKeyType="search"
            />

            {!searchText && tickerItems.length > 0 ? (
              <View
                pointerEvents="none"
                style={[styles.tickerContainer, { height: ITEM_HEIGHT }]}
              >
                <View style={[styles.tickerClip, { height: ITEM_HEIGHT }]}>
                  <Animated.View style={[tickerAnimStyle]}>
                    {tickerItems.map((w, i) => (
                      <View
                        key={String(w) + i}
                        style={{
                          height: ITEM_HEIGHT,
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={[
                            styles.placeholderText,
                            { fontSize: FONT_SIZE },
                          ]}
                          numberOfLines={1}
                        >
                          {"Search for " + w}
                        </Text>
                      </View>
                    ))}
                  </Animated.View>
                </View>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.categoryHeaderRow}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("viewAllCategoryScreen" as never)}
          accessibilityRole="button"
        >
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {loadingCategories ? (
        <CategorySkeleton />
      ) : (
        <FlatList
          data={limitedCategories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(it: CategoryType) => `cat-${it.categoryId}`}
          renderItem={({ item }) => (
            <CategoryItem item={item} onPress={onOpenCategory} />
          )}
          contentContainerStyle={styles.categoryList}
        />
      )}

      <Text style={styles.sectionTitleCompact}>
        Nearby Vendors (within 1KM)
      </Text>
    </View>
  );
});

/* ---------------- HomeScreen (main) ---------------- */
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const location = useSelector((s: RootState) => s.location, shallowEqual);
  const lat = location?.latitude;
  const lng = location?.longitude;

  const [searchText, setSearchText] = useState("");
  const [sideMenuVisible, setSideMenuVisible] = useState(false);
  const [debouncedSearch] = useDebounce(searchText, 500);

  const [index, setIndex] = useState(0);

  const getGreeting = useCallback(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return "Good Morning ";
    if (currentHour < 18) return "Good Afternoon ";
    return "Good Evening ";
  }, []);

  const [greeting, setGreeting] = useState(getGreeting());
  useEffect(() => {
    const interval = setInterval(
      () => setGreeting(getGreeting()),
      15 * 60 * 1000
    );
    return () => clearInterval(interval);
  }, [getGreeting]);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((p) => (p + 1) % DAILY_MESSAGES.length),
      7000
    );
    return () => clearInterval(id);
  }, []);

  /* ---------------- queries ---------------- */
  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5,
    retry: 1,
    select: (data) => data.slice(0, 10),
  });

  const { data: popularItems = [], isLoading: loadingPopular } = useQuery({
    queryKey: ["popular", lat, lng],
    queryFn: () => fetchPopular(lat, lng),
    enabled: !!lat && !!lng,
    staleTime: 1000 * 60,
    retry: 1,
  });

  const { data: bestSellers = [], isLoading: loadingBestSellers } = useQuery({
    queryKey: ["allBestSellers"],
    queryFn: fetchAllBestSellers,
    staleTime: 1000 * 60,
    retry: 1,
  });

  const {
    data: shopPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
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

  const shops: ShopType[] = useMemo(
    () => (shopPages ? shopPages.pages.flatMap((p: any) => p.data) : []),
    [shopPages]
  );

  const nearbyShopsWithin1KM = useMemo(() => {
    if (!Array.isArray(shops) || shops.length === 0) return [];
    const withDistance = shops.filter(
      (s) => typeof s.distanceKm === "number" && !isNaN(s.distanceKm)
    );
    if (withDistance.length === 0) return shops;
    return withDistance.filter((s) => s.distanceKm! <= 1);
  }, [shops]);

  const showNoService =
    !loadingShops &&
    !isFetching &&
    !!lat &&
    !!lng &&
    nearbyShopsWithin1KM.length === 0;

  const onRefresh = useCallback(async () => {
    try {
      await Promise.allSettled([
        queryClient.invalidateQueries({ queryKey: ["shops"] }),
        queryClient.invalidateQueries({ queryKey: ["categories"] }),
        queryClient.invalidateQueries({ queryKey: ["popular"] }),
        queryClient.invalidateQueries({ queryKey: ["allBestSellers"] }),
      ]);
    } catch (err) {
      console.error("refresh error", err);
    }
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

  const handleOpenCategory = useCallback(
    (c: CategoryType) => {
      navigation.navigate(
        "categoryDetailScreen" as never,
        { categoryId: c.categoryId, categoryName: c.categoryName } as never
      );
    },
    [navigation]
  );

  useEffect(() => {
    if (!lat || !lng) navigation.replace("locationScreen");
  }, [lat, lng, navigation]);

  /* ---------------- Header element ---------------- */
  const HeaderElement = useMemo(
    () => (
      <HomeHeader
        insets={insets}
        location={location}
        navigation={navigation}
        searchText={searchText}
        setSearchText={setSearchText}
        greeting={greeting}
        dailyMessage={DAILY_MESSAGES[index]}
        categories={categories}
        loadingCategories={loadingCategories}
        onOpenCategory={handleOpenCategory}
        onMenuPress={() => setSideMenuVisible(true)}
        onNotificationsPress={() =>
          navigation.navigate("notificationsScreen" as never)
        }
      />
    ),
    [
      insets,
      location,
      navigation,
      searchText,
      greeting,
      index,
      categories,
      loadingCategories,
      handleOpenCategory,
    ]
  );

  /* ---------------- hide-tab hook ---------------- */

  /* ---------------- statusbar overlay animation ---------------- */
  const scrollY = useSharedValue(0);
  const SCROLL_THRESHOLD = Math.round(hp(6));
  const RANGE = Math.round(hp(4));
  const START = Math.max(0, SCROLL_THRESHOLD - RANGE);
  const END = SCROLL_THRESHOLD + RANGE;

  const overlayProgress = useDerivedValue(() => {
    const raw = scrollY.value;
    const t = Math.max(0, Math.min(1, (raw - START) / (END - START)));
    return withTiming(t, { duration: 220 });
  }, []);

  const statusBarAnimatedStyle = useAnimatedStyle(() => {
    const bg = interpolateColor(
      overlayProgress.value,
      [0, 1],
      ["transparent", "#ffffff"]
    );
    return { backgroundColor: bg, opacity: overlayProgress.value };
  }, []);

  const setBarStyle = (style: "light-content" | "dark-content") => {
    try {
      StatusBar.setBarStyle(style, true);
    } catch {
      /* noop */
    }
  };

  const HYST_ENTER = 0.6;
  const HYST_EXIT = 0.4;

  useAnimatedReaction(
    () => overlayProgress.value,
    (curr: number, prev: number | undefined) => {
      if (prev === undefined) return;
      if (curr > HYST_ENTER && prev <= HYST_ENTER)
        runOnJS(setBarStyle)("dark-content");
      else if (curr < HYST_EXIT && prev >= HYST_EXIT)
        runOnJS(setBarStyle)("light-content");
    },
    []
  );


  /* ---------------- list helpers ---------------- */
  const renderShop = useCallback(
    ({ item }: ListRenderItemInfo<ShopType>) => (
      <ShopCard item={item} onOpen={handleOpenShop} />
    ),
    [handleOpenShop]
  );
  const SHOP_CARD_HEIGHT = hp(20) + 16;
  const getItemLayout = useCallback(
    (_data: any, index: number) => ({
      length: SHOP_CARD_HEIGHT,
      offset: SHOP_CARD_HEIGHT * index,
      index,
    }),
    []
  );

  /* ---------------- footer ---------------- */
  const FooterComponent = useMemo(
    () => (
      <View style={{ flex: 0.8 }}>
        <CarouselBanner data={bannerData} />
        <Text
          style={[
            styles.sectionTitle,
            { paddingHorizontal: wp(5), paddingTop: hp(1) },
          ]}
        >
          Best Sellers
        </Text>
        {loadingBestSellers ? (
          <PopularSkeleton />
        ) : bestSellers.length > 0 ? (
          <FlatList
            data={bestSellers}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(it) => String(it.menuId)}
            renderItem={({ item }) => (
              <View style={[styles.popularItem, styles.bestSellerCard]}>
                <View style={styles.popularCircle}>
                  {item.imageUrl ? (
                    <Image
                      source={{
                        uri: `${apiClient.defaults.baseURL}/uploads/menus/${item.imageUrl}`,
                      }}
                      style={styles.popularImg}
                      resizeMode="cover"
                    />
                  ) : null}
                </View>
                <Text style={styles.popularName} numberOfLines={1}>
                  {item.menuName}
                </Text>
                <Text style={{ fontSize: TYPE.small, color: "#666" }}>
                  {item.shopname}
                </Text>
                <Text style={styles.popularPrice}>₹{item.price ?? "—"}</Text>

                <TouchableOpacity
                  style={styles.addToCartBtn}
                  accessibilityRole="button"
                >
                  <Text style={styles.addToCartText}>+ Add</Text>
                </TouchableOpacity>
              </View>
            )}
            contentContainerStyle={{
              paddingLeft: wp(4),
              paddingVertical: hp(1),
            }}
          />
        ) : (
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text style={{ fontSize: 16, color: "#888" }}>
              No best sellers yet.
            </Text>
          </View>
        )}

        <View style={styles.footerHero}>
          <Text style={styles.footerHeroTitle}>Sip, Snack, Smile</Text>
          <Text style={styles.footerHeroSubtitle}>
            Brewing Happiness, One Cup at a Time.
          </Text>
        </View>
      </View>
    ),
    [loadingBestSellers, bestSellers]
  );

  useEffect(() => {
    StatusBar.setTranslucent(true);
    StatusBar.setBarStyle("light-content", true);
  }, []);

  /* ---------------- no-service view ---------------- */
  if (showNoService) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.noShop}>
            <Ionicons
              name="location-outline"
              size={48}
              color={theme.PRIMARY_COLOR}
            />
            <Text style={styles.emptyText}>
              Sorry, service is not available in your area yet.
            </Text>
            <TouchableOpacity
              style={styles.changeLocationBtn}
              onPress={() => navigation.navigate("locationScreen" as never)}
              accessibilityRole="button"
            >
              <Text style={styles.changeLocationText}>Change Location</Text>
            </TouchableOpacity>
            <Text style={styles.comingSoonText}>
              Coming soon ClickTea at your nearby location
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  /* ---------------- normal render ---------------- */
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height:
              insets.top ??
              (Platform.OS === "android" ? StatusBar.currentHeight ?? 24 : 0),
            zIndex: 9999,
          },
          statusBarAnimatedStyle,
        ]}
      />

      <View style={styles.container}>
        <AnimatedFlatList
          data={shops}
          keyExtractor={(item: ShopType) => `shop-${item.id}`}
          renderItem={renderShop}
          ListHeaderComponent={shops.length > 0 ? HeaderElement : null}
          ListFooterComponent={FooterComponent}
          ListEmptyComponent={
            !loadingShops ? (
              <View style={styles.noShop}>
                <Ionicons
                  name="location-outline"
                  size={48}
                  color={theme.PRIMARY_COLOR}
                />
                <Text style={styles.emptyText}>
                  Sorry, service is not available in your area yet.
                </Text>
                <TouchableOpacity
                  style={styles.changeLocationBtn}
                  onPress={() => navigation.navigate("locationScreen" as never)}
                  accessibilityRole="button"
                >
                  <Text style={styles.changeLocationText}>Change Location</Text>
                </TouchableOpacity>
                <Text style={styles.comingSoonText}>
                  Coming soon ClickTea at your nearby location
                </Text>
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
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={onRefresh}
              tintColor={theme.PRIMARY_COLOR}
            />
          }
          contentContainerStyle={{ paddingBottom: hp(15) }}
          initialNumToRender={6}
          maxToRenderPerBatch={8}
          windowSize={7}
          removeClippedSubviews={Platform.OS === "android"}
          getItemLayout={getItemLayout}
          scrollEventThrottle={16}
        />

        <SideMenuModal
          visible={sideMenuVisible}
          onClose={() => setSideMenuVisible(false)}
        />
      </View>

      <FloatingCoffeeButton
        animationSource={require("@/src/assets/animation/Coffee love.json")}
        size={78}
        offsetRight={18}
        offsetBottom={20}
        onPress={() => navigation.navigate("teaAndCoffeeScreen" as never)}
        bob={true}
        entranceDelay={120}
        loop={true}
        containerStyle={{
          opacity: 0.6,
          bottom: hp(15),
          padding: 1,
          backgroundColor: "white",
          borderRadius: 50,
          alignItems: "center",
          justifyContent: "center",
        }}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;

/* ---------------- Styles (same as your original) ---------------- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, backgroundColor: "#fff" },

  topHeaderBackground: { paddingBottom: hp(2), overflow: "hidden" },
  topHeaderInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp(4),
  },

  greetingContainer: { marginTop: hp(2), alignItems: "center" },
  greetingText: {
    fontSize: TYPE.h1,
    fontWeight: "800",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.18)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  dailyMessageWrapper: {
    marginTop: hp(1),
    paddingHorizontal: wp(6),
    width: "100%",
    alignItems: "center",
  },

  dailyMessage: {
    fontSize: TYPE.small,
    color: "rgba(255,255,255,0.95)",
    textAlign: "center",
    lineHeight: Math.round(TYPE.small * 1.35),
    maxWidth: wp(86),
    includeFontPadding: false,
    fontStyle: "italic",
    fontWeight: "500",
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: wp(2),
  },
  locationBadge: {
    width: wp(11),
    height: wp(11),
    borderRadius: wp(5.5),
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  locationTitle: { fontSize: TYPE.h2, fontWeight: "700", color: "#ffffff" },
  locationSubtitle: {
    fontSize: TYPE.small,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },

  searchRow: {
    marginTop: hp(2),
    marginHorizontal: wp(4),
    backgroundColor: "white",
    borderRadius: hp(1.5),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(3),
    height: hp(6),
    ...SHADOW,
  },
  searchIcon: { marginRight: wp(2) },
  searchInput: { flex: 1, height: "100%", justifyContent: "center" },
  searchInputText: { fontSize: TYPE.body, color: "#333", paddingVertical: 0 },

  tickerContainer: {
    position: "absolute",
    left: wp(3),
    right: wp(3),
    overflow: "hidden",
    justifyContent: "flex-start",
  },
  tickerClip: { overflow: "hidden", justifyContent: "flex-start" },
  placeholderText: { color: "#999", fontSize: TYPE.body },

  categoryHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: hp(1.2),
    paddingHorizontal: wp(5),
  },
  sectionTitle: { fontSize: hp(2), fontWeight: "600", color: "#222" },
  sectionTitleCompact: {
    fontSize: hp(2.4),
    fontWeight: "700",
    color: "#222",
    marginTop: hp(1.2),
    paddingHorizontal: wp(5),
  },
  viewAllText: {
    color: theme.PRIMARY_COLOR,
    fontWeight: "700",
    fontSize: TYPE.small,
  },

  categoryList: { paddingHorizontal: wp(4), paddingVertical: hp(1.2) },
  popularItem: { width: wp(22), alignItems: "center" },
  popularCircle: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(9),
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    ...SHADOW,
  },
  popularImg: { width: "100%", height: "100%", borderRadius: wp(9) },
  popularName: {
    fontSize: TYPE.small,
    color: "#333",
    textAlign: "center",
    marginTop: hp(0.6),
    maxWidth: wp(22),
  },

  shopCard: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    marginHorizontal: wp(5),
    borderColor: "#eee",
  },
  shopImage: {
    width: wp(20),
    height: wp(20),
    borderRadius: 8,
    backgroundColor: "#f2f2f2",
    marginTop: hp(0.5),
  },
  shopDetails: { flex: 1, padding: wp(3) },
  shopTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  shopName: {
    fontSize: TYPE.body,
    fontWeight: "700",
    color: theme.PRIMARY_COLOR,
    maxWidth: wp(55),
  },
  shopMeta: { flexDirection: "row", alignItems: "center", marginTop: hp(0.5) },
  metaText: { fontSize: TYPE.small, color: "#666", marginLeft: 6 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", marginTop: hp(0.6) },
  tag: {
    backgroundColor: "#f2f2f2",
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.4),
    borderRadius: 8,
    marginRight: wp(2),
    fontSize: TYPE.small,
    color: "#666",
  },

  viewMenuView: { flexDirection: "row", alignItems: "center", gap: wp(2) },
  statusBadge: {
    paddingHorizontal: wp(3.0),
    paddingVertical: hp(0.5),
    borderRadius: 12,
  },
  openBadge: { backgroundColor: "#e6f9ed" },
  closedBadge: { backgroundColor: "#f0f0f0" },
  statusText: { fontSize: TYPE.small, color: "#333", fontWeight: "700" },

  footerHero: {
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
    alignItems: "center",
    backgroundColor: "#fff",
  },
  footerHeroTitle: {
    fontSize: TYPE.hero,
    fontWeight: "900",
    color: "#EDEDED",
    lineHeight: TYPE.hero * 1.05,
    textAlign: "center",
  },
  footerHeroSubtitle: {
    fontSize: TYPE.body,
    color: "#777",
    marginTop: hp(0.8),
    textAlign: "center",
  },

  noShop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: TYPE.body,
    color: "gray",
    marginVertical: 10,
    textAlign: "center",
  },
  changeLocationBtn: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: theme.PRIMARY_COLOR,
    borderRadius: 8,
  },
  changeLocationText: {
    color: "white",
    fontSize: TYPE.small,
    fontWeight: "700",
  },
  comingSoonText: {
    marginTop: 20,
    fontSize: TYPE.small,
    color: "#888",
    textAlign: "center",
  },

  bestSellerCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: wp(3),
    marginRight: wp(3),
    alignItems: "center",
    width: wp(34),
    ...SHADOW,
  },
  addToCartBtn: {
    marginTop: hp(0.8),
    paddingVertical: hp(0.6),
    paddingHorizontal: wp(3),
    borderRadius: 8,
    backgroundColor: theme.PRIMARY_COLOR,
  },
  addToCartText: { color: "#fff", fontSize: TYPE.small, fontWeight: "700" },
});
