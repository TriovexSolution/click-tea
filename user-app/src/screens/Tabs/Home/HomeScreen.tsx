// // import React, {
// //   useCallback,
// //   useEffect,
// //   useMemo,
// //   useState,
// //   ReactNode,
// // } from "react";
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   FlatList,
// //   TouchableOpacity,
// //   Pressable,
// //   Image,
// //   TextInput,
// //   RefreshControl,
// //   Platform,
// //   // SafeAreaView,
// //   StatusBar,
// //   ListRenderItemInfo,
// // } from "react-native";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import { useNavigation } from "@react-navigation/native";
// // import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
// // import type { ParamListBase } from "@react-navigation/native";
// // import { useDispatch, useSelector, shallowEqual } from "react-redux";
// // import { useDebounce } from "use-debounce";
// // import { Ionicons } from "@expo/vector-icons";
// // import {
// //   useQuery,
// //   useInfiniteQuery,
// //   useQueryClient,
// // } from "@tanstack/react-query";
// // import { LinearGradient } from "expo-linear-gradient";

// // import apiClient from "@/src/api/client";
// // import theme from "@/src/assets/colors/theme";
// // import { hp, wp } from "@/src/assets/utils/responsive";
// // import { setSelectedShopId } from "@/src/Redux/Slice/selectedShopSlice";
// // import SideMenuModal from "@/src/Common/SlideMenuModal";
// // import ShopSkeleton from "@/src/components/skeltons/ShopSkeleton";
// // import CategorySkeleton from "@/src/components/skeltons/CategorySkeleton";
// // import CarouselBanner from "@/src/components/CarouselBanner";
// // import {
// //   SafeAreaProvider,
// //   SafeAreaView,
// //   useSafeAreaInsets,
// // } from "react-native-safe-area-context";

// // import Animated, {
// //   useSharedValue,
// //   useAnimatedStyle,
// //   withTiming,
// //   withSpring,
// // } from "react-native-reanimated";
// // import PopularSkeleton from "@/src/components/skeltons/PopularSkeleton";
// // import TickerPlaceHolder from "@/src/components/TickerPlaceHolder";
// // import FloatingCoffeeButton from "@/src/components/Button/FloatingCoffeeButton";

// // /* ---------------- Types ---------------- */
// // type RootState = any;
// // type CategoryType = {
// //   categoryId: number;
// //   categoryName: string;
// //   categoryImage?: string | null;
// // };
// // type ItemType = {
// //   shopname?: ReactNode;
// //   menuName?: string;
// //   menuId?: number;
// //   name?: string;
// //   price?: number;
// //   imageUrl?: string | null;
// // };
// // type ShopType = {
// //   id: number;
// //   shopname: string;
// //   shopImage?: string | null;
// //   isOpen?: boolean;
// //   etaMinutes?: number | null;
// //   distanceKm?: number | null;
// // };

// // /* ---------------- Constants / Sizes ---------------- */
// // const TYPE = {
// //   h1: hp(2.8),
// //   h2: hp(2.4),
// //   body: hp(1.8),
// //   small: hp(1.4),
// //   micro: hp(1.1),
// //   hero: hp(5.2),
// // };

// // const PAGE_SIZE = 10;
// // const ICON = { small: hp(1.8), medium: hp(2.4), large: hp(3.0) };

// // const DAILY_MESSAGES = [
// //   "Are you chai? Because you spice up my mornings 🌶️☕",
// //   "Are you sugar? Because you make my coffee sweet ☕🍬",
// //   "Like foam on cappuccino, you’re the highlight of my day ✨",
// //   "Snacks in 3 clicks? Faster than falling for you 😍",
// //   "Snacks delivered faster than my pickup lines 😏🍩",
// //   "I’ll bring the tea, you bring the gossip 😉",
// //   "Your smile + my snacks = the real combo meal 😍",
// // ];

// // const DEFAULT_SUGGESTIONS = useMemo(() => [
// //   ...["tea", "coffee", "snacks", "chai", "cold coffee", "iced tea"],
// // ],[]);

// // /* ---------------- Banner ---------------- */
// // const bannerData = [
// //   { image: require("@/src/assets/images/Cappaciuno Latte.jpg") },
// //   { image: require("@/src/assets/images/Cold Coffee.jpg") },
// //   { image: require("@/src/assets/images/Green Tea.jpg") },
// //   { image: require("@/src/assets/images/Iced tea.jpg") },
// // ];
// // const INPUT_ITEM_HEIGHT = Math.round(hp(2.2)); // same place as your HomeScreen usage
// // // overlay padding / left/right offsets so ticker doesn't overlap icons
// // const TICKER_LEFT = wp(3) + 18 + 8; // outer padding + icon size + gap
// // const TICKER_RIGHT = 40;
// // /* ---------------- API helpers with error handling ---------------- */
// // const getToken = async () => {
// //   try {
// //     return await AsyncStorage.getItem("authToken");
// //   } catch (err) {
// //     console.error("getToken error", err);
// //     return null;
// //   }
// // };

// // const fetchCategories = async (): Promise<CategoryType[]> => {
// //   try {
// //     const res = await apiClient.get("/api/category/categories-with-menus");
// //     const payload = Array.isArray(res?.data?.data)
// //       ? res.data.data
// //       : Array.isArray(res?.data)
// //       ? res.data
// //       : [];
// //     return payload;
// //   } catch (err) {
// //     console.error("fetchCategories error", err);
// //     return [];
// //   }
// // };

// // const fetchPopular = async (
// //   lat?: number,
// //   lng?: number
// // ): Promise<ItemType[]> => {
// //   if (!lat || !lng) return [];
// //   try {
// //     const res = await apiClient.get("/api/orders/popular-items", {
// //       params: { lat, lng },
// //     });
// //     const payload = Array.isArray(res?.data)
// //       ? res.data
// //       : res?.data?.popularItems ?? res?.data?.items ?? res?.data ?? [];
// //     return Array.isArray(payload) ? payload : [];
// //   } catch (err) {
// //     console.error("fetchPopular error", err);
// //     return [];
// //   }
// // };

// // const fetchShopsPage = async ({ pageParam = 0, queryKey }: any) => {
// //   const [_key, lat, lng, search] = queryKey;
// //   try {
// //     const res = await apiClient.get("/api/shops/nearby", {
// //       params: {
// //         lat,
// //         lng,
// //         onlyOpen: true,
// //         limit: PAGE_SIZE,
// //         offset: pageParam,
// //         search: search || undefined,
// //       },
// //     });
// //     const data = Array.isArray(res?.data) ? res.data : res?.data?.items ?? [];
// //     const total =
// //       Number(
// //         res?.data?.total ?? (Array.isArray(res?.data) ? res.data.length : 0)
// //       ) || 0;
// //     return {
// //       data,
// //       nextOffset: data.length === 0 ? null : pageParam + PAGE_SIZE,
// //       total,
// //     };
// //   } catch (err) {
// //     console.error("fetchShopsPage error", err);
// //     return { data: [], nextOffset: null, total: 0 };
// //   }
// // };

// // const fetchAllBestSellers = async (): Promise<ItemType[]> => {
// //   try {
// //     const res = await apiClient.get("/api/best-sellers/all");
// //     return Array.isArray(res?.data) ? res.data : [];
// //   } catch (err) {
// //     console.error("fetchAllBestSellers error", err);
// //     return [];
// //   }
// // };

// // /* ---------------- ShopCard (memoized) ---------------- */
// // const ShopCard: React.FC<{ item: ShopType; onOpen: (id: number) => void }> =
// //   React.memo(({ item, onOpen }) => {
// //     const open = typeof item.isOpen === "boolean" ? item.isOpen : true;
// //     const eta = item.etaMinutes ?? null;
// //     const distance = item.distanceKm ?? null;
// //     const baseURL = apiClient.defaults.baseURL;

// //     return (
// //       <Pressable
// //         style={({ pressed }) => [
// //           styles.shopCard,
// //           { transform: [{ scale: pressed ? 0.98 : 1 }] },
// //         ]}
// //         onPress={() => onOpen(item.id)}
// //         android_ripple={{ color: "#f2f2f2" }}
// //         accessibilityRole="button"
// //         accessibilityLabel={`Open ${item.shopname} detail`}
// //       >
// //         <Image
// //           style={styles.shopImage}
// //           source={
// //             item.shopImage
// //               ? { uri: `${baseURL}/uploads/shops/${item.shopImage}` }
// //               : require("@/src/assets/images/onBoard1.png")
// //           }
// //           resizeMode="cover"
// //         />

// //         <View style={styles.shopDetails}>
// //           <View style={styles.shopTitleRow}>
// //             <Text style={styles.shopName} numberOfLines={1}>
// //               {item.shopname}
// //             </Text>
// //             <View
// //               style={[
// //                 styles.statusBadge,
// //                 open ? styles.openBadge : styles.closedBadge,
// //               ]}
// //             >
// //               <Text style={styles.statusText}>{open ? "Open" : "Closed"}</Text>
// //             </View>
// //           </View>

// //           <View style={styles.shopMeta}>
// //             <Ionicons name="star" size={12} color="#FFC107" />
// //             <Text style={styles.metaText}>4.5</Text>
// //             <Text style={styles.metaText}> • {eta ? `${eta} min` : "—"}</Text>
// //             <Text style={styles.metaText}>
// //               {distance ? ` • ${distance} km` : ""}
// //             </Text>
// //           </View>

// //           <View style={styles.tagRow}>
// //             <Text style={styles.tag}>Masala Chai</Text>
// //             <Text style={styles.tag}>Filter Coffee</Text>
// //           </View>

// //           <TouchableOpacity
// //             style={styles.viewMenuBtn}
// //             accessibilityRole="button"
// //           >
// //             <Text style={styles.viewMenuText}>View Menu</Text>
// //           </TouchableOpacity>
// //         </View>
// //       </Pressable>
// //     );
// //   });

// // ShopCard.displayName = "ShopCard";

// // /* ---------------- Category item with spring tap ---------------- */
// // const CategoryItem = React.memo(function CategoryItem({
// //   item,
// //   onPress,
// // }: {
// //   item: CategoryType;
// //   onPress: (c: CategoryType) => void;
// // }) {
// //   const scale = useSharedValue(1);
// //   const aStyle = useAnimatedStyle(() => ({
// //     transform: [{ scale: scale.value }],
// //   }));

// //   const handlePress = () => {
// //     scale.value = withTiming(0.94, { duration: 120 });
// //     setTimeout(() => {
// //       scale.value = withSpring(1, { stiffness: 200, damping: 15 });
// //     }, 120);
// //     onPress(item);
// //   };

// //   return (
// //     <Pressable onPress={handlePress} style={{ marginRight: wp(3) }}>
// //       <Animated.View style={[aStyle]}>
// //         <View style={styles.popularItem}>
// //           <View style={styles.popularCircle}>
// //             {item.categoryImage ? (
// //               <Image
// //                 source={{
// //                   uri: `${apiClient.defaults.baseURL}/uploads/categories/${item.categoryImage}`,
// //                 }}
// //                 style={styles.popularImg}
// //                 resizeMode="cover"
// //               />
// //             ) : (
// //               <Image
// //                 source={require("@/src/assets/images/onBoard1.png")}
// //                 style={styles.popularImg}
// //               />
// //             )}
// //           </View>
// //           <Text style={styles.popularName} numberOfLines={1}>
// //             {item.categoryName}
// //           </Text>
// //         </View>
// //       </Animated.View>
// //     </Pressable>
// //   );
// // });

// // /* ---------------- HomeHeader (memoized) ---------------- */
// // /* Consider moving to Header.tsx for separation */
// // const HomeHeader = React.memo(function HomeHeader({
// //   insets,
// //   location,
// //   navigation,
// //   searchText,
// //   setSearchText,
// //   greeting,
// //   dailyMessage,
// //   categories,
// //   loadingCategories,
// //   onOpenCategory,
// //   INPUT_ITEM_HEIGHT,
// //   animatedStyle,
// //   onMenuPress,
// //   onNotificationsPress,
// // }: any) {
// //   const limitedCategories = Array.isArray(categories)
// //     ? categories.slice(0, 7)
// //     : [];

// //   return (
// //     <View>
// //       <LinearGradient
// //         colors={["#562E19", "#943400", "#DE8C26"]}
// //         start={{ x: 0, y: 0 }}
// //         end={{ x: 1, y: 1 }}
// //         style={[
// //           styles.topHeaderBackground,
// //           {
// //             paddingTop:
// //               (insets.top ||
// //                 (Platform.OS === "android"
// //                   ? StatusBar.currentHeight ?? 24
// //                   : 0)) + hp(2),
// //           },
// //         ]}
// //       >
// //         <StatusBar
// //           translucent
// //           backgroundColor="transparent"
// //           barStyle="light-content"
// //         />

// //         <View style={styles.topHeaderInner}>
// //           <View style={{ flexDirection: "row", alignItems: "center" }}>
// //             <Pressable
// //               onPress={onMenuPress}
// //               hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
// //             >
// //               <Ionicons name="menu-outline" size={ICON.large} color="#fff" />
// //             </Pressable>

// //             <TouchableOpacity
// //               style={styles.locationRow}
// //               onPress={() => navigation.navigate("locationScreen" as never)}
// //               activeOpacity={0.8}
// //               accessibilityRole="button"
// //               accessibilityLabel="Open location selector"
// //             >
// //               <View style={styles.locationBadge}>
// //                 <Ionicons
// //                   name="location-outline"
// //                   size={hp(2)}
// //                   color={theme.PRIMARY_COLOR}
// //                 />
// //               </View>

// //               <View style={{ marginLeft: 10, maxWidth: wp(56) }}>
// //                 <Text style={styles.locationTitle} numberOfLines={1}>
// //                   {location
// //                     ? "Iskon Junction, Iskcon Ambli..."
// //                     : "Select Location"}
// //                 </Text>
// //                 <Text style={styles.locationSubtitle} numberOfLines={1}>
// //                   {location
// //                     ? `${location.latitude}, ${location.longitude}`
// //                     : "Tap to choose"}
// //                 </Text>
// //               </View>
// //             </TouchableOpacity>
// //           </View>

// //           <TouchableOpacity
// //             onPress={onNotificationsPress}
// //             hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
// //             accessibilityRole="button"
// //           >
// //             <Ionicons
// //               name="notifications-outline"
// //               size={ICON.large}
// //               color="#fff"
// //             />
// //           </TouchableOpacity>
// //         </View>

// //         <View style={styles.greetingContainer}>
// //           <Text style={styles.greetingText}>{greeting}, Aarin</Text>

// //           <View style={styles.dailyMessageWrapper}>
// //             <Text
// //               style={styles.dailyMessage}
// //               numberOfLines={2}
// //               ellipsizeMode="tail"
// //               accessibilityLabel={`Daily message: ${dailyMessage}`}
// //             >
// //               {dailyMessage}
// //             </Text>
// //           </View>
// //         </View>

// //         {/* Search row */}
// //         <View style={styles.searchRow}>
// //           {searchText ? (
// //             <TouchableOpacity
// //               onPress={() => setSearchText("")}
// //               hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
// //             >
// //               <Ionicons name="close-circle" size={ICON.small} />
// //             </TouchableOpacity>
// //           ) : (
// //             <Ionicons
// //               name="search"
// //               size={ICON.small}
// //               color="#999"
// //               style={styles.searchIcon}
// //             />
// //           )}

// //           <TouchableOpacity
// //             style={styles.searchInput}
// //             activeOpacity={1}
// //             onPress={() => navigation.navigate("searchScreen")}
// //             accessibilityRole="button"
// //             accessibilityLabel="Open search"
// //           >
// //             <TextInput
// //               editable={false}
// //               pointerEvents="none"
// //               style={styles.searchInputText}
// //               value={searchText}
// //               onChangeText={setSearchText}
// //               returnKeyType="search"
// //             />

// //             {!searchText && (
// //               <TickerPlaceHolder
// //                 words={DEFAULT_SUGGESTIONS}
// //                 prefix="Search for"
// //                 itemHeight={INPUT_ITEM_HEIGHT}
// //                 interval={2500}
// //                 duration={420}
// //                 paused={false} // here it's not paused because input is not focused and no text
// //                 textStyle={styles.placeholderText}
// //                 containerStyle={styles.tickerContainer}
// //               />
// //             )}
// //           </TouchableOpacity>
// //         </View>
// //       </LinearGradient>

// //       {/* categories */}
// //       <View style={styles.categoryHeaderRow}>
// //         <Text style={styles.sectionTitle}>Categories</Text>
// //         <TouchableOpacity
// //           onPress={() => navigation.navigate("viewAllCategoryScreen" as never)}
// //           accessibilityRole="button"
// //         >
// //           <Text style={styles.viewAllText}>View All</Text>
// //         </TouchableOpacity>
// //       </View>

// //       {loadingCategories ? (
// //         <CategorySkeleton />
// //       ) : (
// //         <FlatList
// //           data={limitedCategories}
// //           horizontal
// //           showsHorizontalScrollIndicator={false}
// //           keyExtractor={(it: CategoryType) => `cat-${it.categoryId}`}
// //           renderItem={({ item }) => (
// //             <CategoryItem item={item} onPress={onOpenCategory} />
// //           )}
// //           contentContainerStyle={styles.categoryList}
// //         />
// //       )}

// //       <Text style={styles.sectionTitleCompact}>
// //         Nearby Vendors (within 1KM)
// //       </Text>
// //     </View>
// //   );
// // });

// // /* ---------------- HomeScreen ---------------- */
// // const HomeScreen: React.FC = () => {
// //   const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
// //   const dispatch = useDispatch();
// //   const queryClient = useQueryClient();
// //   const insets = useSafeAreaInsets();
// //   const location = useSelector((s: RootState) => s.location, shallowEqual);
// //   const lat = location?.latitude;
// //   const lng = location?.longitude;

// //   const [searchText, setSearchText] = useState("");
// //   const [sideMenuVisible, setSideMenuVisible] = useState(false);
// //   const [debouncedSearch] = useDebounce(searchText, 500);

// //   const [index, setIndex] = useState(0);

// //   const getGreeting = () => {
// //     const currentHour = new Date().getHours();
// //     if (currentHour < 12) return "Good Morning 🌞";
// //     if (currentHour < 18) return "Good Afternoon ☀️";
// //     return "Good Evening 🌙";
// //   };
// //   const [greeting, setGreeting] = useState(getGreeting());
// //   useEffect(() => {
// //     const interval = setInterval(() => {
// //       setGreeting(getGreeting());
// //     }, 15 * 60 * 1000);
// //     return () => clearInterval(interval);
// //   }, []);

// //   // rotating daily message index
// //   useEffect(() => {
// //     const id = setInterval(() => {
// //       setIndex((p) => (p + 1) % DAILY_MESSAGES.length);
// //     }, 7000);
// //     return () => clearInterval(id);
// //   }, []);

// //   // ticker for placeholder words
// //   const ITEM_HEIGHT = Math.round(hp(2.2));
// //   const translateY = useSharedValue(0);
// //   const animatedStyle = useAnimatedStyle(() => ({
// //     transform: [{ translateY: translateY.value }],
// //   }));

// //   useEffect(() => {
// //     let i = 0;
// //     const id = setInterval(() => {
// //       i = (i + 1) % DEFAULT_SUGGESTIONS.length;
// //       translateY.value = withTiming(-i * ITEM_HEIGHT, { duration: 420 });
// //     }, 2500);
// //     return () => clearInterval(id);
// //   }, [translateY, ITEM_HEIGHT]);

// //   // queries
// //   const { data: categories = [], isLoading: loadingCategories } = useQuery({
// //     queryKey: ["categories"],
// //     queryFn: fetchCategories,
// //     staleTime: 1000 * 60 * 5,
// //     retry: 1,
// //   });

// //   const { data: popularItems = [], isLoading: loadingPopular } = useQuery({
// //     queryKey: ["popular", lat, lng],
// //     queryFn: () => fetchPopular(lat, lng),
// //     enabled: !!lat && !!lng,
// //     staleTime: 1000 * 60,
// //     retry: 1,
// //   });

// //   const { data: bestSellers = [], isLoading: loadingBestSellers } = useQuery({
// //     queryKey: ["allBestSellers"],
// //     queryFn: fetchAllBestSellers,
// //     staleTime: 1000 * 60,
// //     retry: 1,
// //   });

// //   const {
// //     data: shopPages,
// //     fetchNextPage,
// //     hasNextPage,
// //     isFetchingNextPage,
// //     isLoading: loadingShops,
// //     isFetching,
// //   } = useInfiniteQuery({
// //     queryKey: ["shops", lat, lng, debouncedSearch],
// //     queryFn: fetchShopsPage,
// //     getNextPageParam: (last) => last.nextOffset,
// //     enabled: !!lat && !!lng,
// //     staleTime: 1000 * 30,
// //     cacheTime: 1000 * 60 * 5,
// //     retry: 1,
// //   });

// //   const shops: ShopType[] = useMemo(
// //     () => (shopPages ? shopPages.pages.flatMap((p: any) => p.data) : []),
// //     [shopPages]
// //   );

// //   // improved onRefresh: invalidate queries (no toast)
// //   const onRefresh = useCallback(async () => {
// //     try {
// //       await Promise.allSettled([
// //         queryClient.invalidateQueries({ queryKey: ["shops"] }),
// //         queryClient.invalidateQueries({ queryKey: ["categories"] }),
// //         queryClient.invalidateQueries({ queryKey: ["popular"] }),
// //         queryClient.invalidateQueries({ queryKey: ["allBestSellers"] }),
// //       ]);
// //       // no toast as requested
// //     } catch (err) {
// //       console.error("refresh error", err);
// //     }
// //   }, [queryClient]);

// //   const handleLoadMore = useCallback(() => {
// //     if (isFetchingNextPage || !hasNextPage) return;
// //     fetchNextPage();
// //   }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

// //   const handleOpenShop = useCallback(
// //     (shopId: number) => {
// //       dispatch(setSelectedShopId(shopId));
// //       navigation.navigate("shopDetailScreen" as never);
// //     },
// //     [dispatch, navigation]
// //   );

// //   const handleOpenCategory = useCallback(
// //     (c: CategoryType) => {
// //       navigation.navigate(
// //         "categoryDetailScreen" as never,
// //         { categoryId: c.categoryId, categoryName: c.categoryName } as never
// //       );
// //     },
// //     [navigation]
// //   );

// //   useEffect(() => {
// //     if (!lat || !lng) {
// //       navigation.replace("locationScreen");
// //     }
// //   }, [lat, lng, navigation]);

// //   /* ---------------- Header memoized element ---------------- */
// //   const HeaderElement = useMemo(() => {
// //     return (
// //       <HomeHeader
// //         insets={insets}
// //         location={location}
// //         navigation={navigation}
// //         searchText={searchText}
// //         setSearchText={setSearchText}
// //         greeting={greeting}
// //         dailyMessage={DAILY_MESSAGES[index]}
// //         categories={categories}
// //         loadingCategories={loadingCategories}
// //         onOpenCategory={handleOpenCategory}
// //         ITEM_HEIGHT={ITEM_HEIGHT}
// //         animatedStyle={animatedStyle}
// //         onMenuPress={() => setSideMenuVisible(true)}
// //         onNotificationsPress={() =>
// //           navigation.navigate("notificationsScreen" as never)
// //         }
// //       />
// //     );
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [
// //     insets,
// //     location,
// //     navigation,
// //     searchText,
// //     setSearchText,
// //     greeting,
// //     index,
// //     categories,
// //     loadingCategories,
// //     handleOpenCategory,
// //     ITEM_HEIGHT,
// //     animatedStyle,
// //   ]);

// //   /* ---------------- list helpers ---------------- */
// //   const renderShop = useCallback(
// //     ({ item }: ListRenderItemInfo<ShopType>) => (
// //       <ShopCard item={item} onOpen={handleOpenShop} />
// //     ),
// //     [handleOpenShop]
// //   );
// //   const keyExtractor = useCallback((item: ShopType) => `shop-${item.id}`, []);
// //   const SHOP_CARD_HEIGHT = hp(20) + 16;
// //   const getItemLayout = useCallback(
// //     (_data: any, index: number) => ({
// //       length: SHOP_CARD_HEIGHT,
// //       offset: SHOP_CARD_HEIGHT * index,
// //       index,
// //     }),
// //     []
// //   );

// //   return (
// //     <SafeAreaProvider style={styles.safe}>
// //       <StatusBar
// //         translucent
// //         backgroundColor="transparent"
// //         barStyle="light-content"
// //       />
// //       {/* <SafeAreaView
// //         edges={['top', 'left', 'right']}   // include the top for notch
// //         style={{ flex: 1, backgroundColor: '#FF5733' }} // same as header
// //       ></SafeAreaView> */}
// //       <View style={styles.container}>
// //         <FlatList
// //           data={shops}
// //           keyExtractor={keyExtractor}
// //           renderItem={renderShop}
// //           ListHeaderComponent={shops.length > 0 ? HeaderElement : null}
// //           ListFooterComponent={
// //             <View style={{ flex: 0.8 }}>
// //               <CarouselBanner data={bannerData} />
// //               <Text
// //                 style={[
// //                   styles.sectionTitle,
// //                   { paddingHorizontal: wp(5), paddingTop: hp(1) },
// //                 ]}
// //               >
// //                 Best Sellers
// //               </Text>
// //               {loadingBestSellers ? (
// //                 <PopularSkeleton />
// //               ) : bestSellers.length > 0 ? (
// //                 <FlatList
// //                   data={bestSellers}
// //                   horizontal
// //                   showsHorizontalScrollIndicator={false}
// //                   keyExtractor={(it) => String(it.menuId)}
// //                   renderItem={({ item }) => (
// //                     <View style={styles.popularItem}>
// //                       <View style={styles.popularCircle}>
// //                         {item.imageUrl ? (
// //                           <Image
// //                             source={{
// //                               uri: `${apiClient.defaults.baseURL}/uploads/menus/${item.imageUrl}`,
// //                             }}
// //                             style={styles.popularImg}
// //                             resizeMode="cover"
// //                           />
// //                         ) : null}
// //                       </View>
// //                       <Text style={styles.popularName} numberOfLines={1}>
// //                         {item.menuName}
// //                       </Text>
// //                       <Text>{item.shopname}</Text>
// //                       <Text style={styles.popularPrice}>
// //                         ₹{item.price ?? "—"}
// //                       </Text>
// //                     </View>
// //                   )}
// //                   contentContainerStyle={{
// //                     paddingLeft: wp(4),
// //                     paddingVertical: hp(1),
// //                   }}
// //                 />
// //               ) : (
// //                 <View style={{ padding: 20, alignItems: "center" }}>
// //                   <Text style={{ fontSize: 16, color: "#888" }}>
// //                     No best sellers yet.
// //                   </Text>
// //                 </View>
// //               )}
// //               <View style={styles.footerHero}>
// //                 <Text style={styles.footerHeroTitle}>Sip, Snack, Smile</Text>
// //                 <Text style={styles.footerHeroSubtitle}>
// //                   Brewing Happiness, One Cup at a Time.
// //                 </Text>
// //               </View>
// //             </View>
// //           }
// //           ListEmptyComponent={
// //             !loadingShops ? (
// //               <View style={styles.noShop}>
// //                 <Ionicons
// //                   name="location-outline"
// //                   size={48}
// //                   color={theme.PRIMARY_COLOR}
// //                 />
// //                 <Text style={styles.emptyText}>
// //                   Sorry, service is not available in your area yet.
// //                 </Text>
// //                 <TouchableOpacity
// //                   style={styles.changeLocationBtn}
// //                   onPress={() => navigation.navigate("locationScreen" as never)}
// //                   accessibilityRole="button"
// //                 >
// //                   <Text style={styles.changeLocationText}>Change Location</Text>
// //                 </TouchableOpacity>
// //                 <Text style={styles.comingSoonText}>
// //                   Coming soon ClickTea at your nearby location
// //                 </Text>
// //               </View>
// //             ) : (
// //               <View style={{ padding: hp(6) }}>
// //                 <ShopSkeleton />
// //                 <ShopSkeleton />
// //               </View>
// //             )
// //           }
// //           onEndReachedThreshold={0.5}
// //           onEndReached={handleLoadMore}
// //           refreshControl={
// //             <RefreshControl
// //               refreshing={isFetching}
// //               onRefresh={onRefresh}
// //               tintColor={theme.PRIMARY_COLOR}
// //             />
// //           }
// //           contentContainerStyle={{ paddingBottom: hp(10) }}
// //           initialNumToRender={6}
// //           maxToRenderPerBatch={8}
// //           windowSize={7}
// //           removeClippedSubviews={Platform.OS === "android"}
// //           getItemLayout={getItemLayout}
// //         />

// //         <SideMenuModal
// //           visible={sideMenuVisible}
// //           onClose={() => setSideMenuVisible(false)}
// //         />
// //       </View>

// //       <FloatingCoffeeButton
// //         animationSource={require("@/src/assets/animation/Coffee love.json")}
// //         size={78}
// //         offsetRight={18}
// //         offsetBottom={20}
// //         onPress={() => navigation.navigate("teaAndCoffeeScreen" as never)}
// //         bob={true}
// //         entranceDelay={120}
// //         loop={true}
// //         containerStyle={{
// //           opacity: 0.6,
// //           bottom: hp(15),
// //           padding: 1,
// //           backgroundColor: "white",
// //           borderRadius: 50,
// //           alignItems: "center",
// //           justifyContent: "center",
// //         }}
// //       />
// //     </SafeAreaProvider>
// //   );
// // };

// // export default HomeScreen;

// // /* ---------------- Styles ---------------- */
// // const styles = StyleSheet.create({
// //   safe: { flex: 1, backgroundColor: "#fff" },
// //   container: { flex: 1, backgroundColor: "#fff" },

// //   topHeaderBackground: {
// //     paddingBottom: hp(4),
// //     borderBottomLeftRadius: 15,
// //     borderBottomRightRadius: 15,
// //     overflow: "hidden",
// //   },
// //   topHeaderInner: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //     paddingHorizontal: wp(4),
// //   },

// //   greetingContainer: {
// //     marginTop: hp(2),
// //     alignItems: "center",
// //   },
// //   greetingText: {
// //     fontSize: 24,
// //     fontWeight: "700",
// //     color: "#fff",
// //   },
// //   dailyMessageWrapper: {
// //     marginTop: hp(1),
// //     paddingHorizontal: wp(6), // breathing room left/right
// //     width: "100%",
// //     alignItems: "center",
// //   },

// //   dailyMessage: {
// //     fontSize: TYPE.small, // responsive base from your TYPE map
// //     color: "#fff",
// //     textAlign: "center",
// //     lineHeight: Math.round(TYPE.small * 1.35),
// //     maxWidth: wp(86), // prevents overflow on small devices
// //     includeFontPadding: false,
// //   },

// //   locationRow: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     marginLeft: wp(2),
// //   },
// //   locationBadge: {
// //     width: wp(11),
// //     height: wp(11),
// //     borderRadius: wp(5.5),
// //     backgroundColor: "#fff",
// //     alignItems: "center",
// //     justifyContent: "center",
// //   },
// //   locationTitle: { fontSize: TYPE.h2, fontWeight: "700", color: "#ffffff" },
// //   locationSubtitle: {
// //     fontSize: TYPE.small,
// //     color: "rgba(255,255,255,0.85)",
// //     marginTop: 2,
// //   },

// //   searchRow: {
// //     marginTop: hp(2),
// //     marginHorizontal: wp(4),
// //     backgroundColor: "white",
// //     borderRadius: hp(1),
// //     flexDirection: "row",
// //     alignItems: "center",
// //     paddingHorizontal: wp(3),
// //     height: hp(6),
// //   },
// //   searchIcon: { marginRight: wp(2) },
// //   searchInput: { flex: 1, height: "100%", justifyContent: "center" },
// //   searchInputText: { fontSize: TYPE.body, color: "#333", paddingVertical: 0 },

// //   // ticker wrapper (clips the vertical stack)
// //   tickerContainer: {
// //     position: "absolute",
// //     left: wp(3),
// //     right: wp(3),
// //     overflow: "hidden",
// //     justifyContent: "flex-start",
// //   },

// //   placeholderText: {
// //     color: "#999",
// //     fontSize: TYPE.body,
// //   },

// //   categoryHeaderRow: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //     marginTop: hp(1.2),
// //     paddingHorizontal: wp(5),
// //   },
// //   sectionTitle: { fontSize: hp(2.4), fontWeight: "700", color: "#222" },
// //   sectionTitleCompact: {
// //     fontSize: hp(2.4),
// //     fontWeight: "700",
// //     color: "#222",
// //     marginTop: hp(1.2),
// //     paddingHorizontal: wp(5),
// //   },
// //   viewAllText: {
// //     color: theme.PRIMARY_COLOR,
// //     fontWeight: "700",
// //     fontSize: TYPE.small,
// //   },

// //   categoryList: { paddingHorizontal: wp(4), paddingVertical: hp(1.2) },
// //   popularItem: { width: wp(22), alignItems: "center" },
// //   popularCircle: {
// //     width: wp(20),
// //     height: wp(20),
// //     borderRadius: wp(4),
// //     backgroundColor: "#eaeaea",
// //     justifyContent: "center",
// //     alignItems: "center",
// //     overflow: "hidden",
// //   },
// //   popularImg: { width: "100%", height: "100%" },
// //   popularName: {
// //     fontSize: TYPE.small,
// //     color: "#333",
// //     textAlign: "center",
// //     marginTop: hp(0.6),
// //   },

// //   shopCard: {
// //     flexDirection: "row",
// //     borderBottomWidth: 1,
// //     marginHorizontal: wp(5),
// //     borderColor: "#eee",
// //     paddingVertical: hp(1.2),
// //   },
// //   shopImage: {
// //     width: wp(20),
// //     height: wp(20),
// //     borderRadius: 8,
// //     backgroundColor: "#f2f2f2",
// //     marginTop: hp(0.5),
// //   },
// //   shopDetails: { flex: 1, padding: wp(3) },
// //   shopTitleRow: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //   },
// //   shopName: {
// //     fontSize: TYPE.body,
// //     fontWeight: "700",
// //     color: theme.PRIMARY_COLOR,
// //     maxWidth: wp(55),
// //   },
// //   shopMeta: { flexDirection: "row", alignItems: "center", marginTop: hp(0.5) },
// //   metaText: { fontSize: TYPE.small, color: "#666", marginLeft: 6 },
// //   tagRow: { flexDirection: "row", flexWrap: "wrap", marginTop: hp(0.6) },
// //   tag: {
// //     backgroundColor: "#f2f2f2",
// //     paddingHorizontal: wp(2),
// //     paddingVertical: hp(0.4),
// //     borderRadius: 8,
// //     marginRight: wp(2),
// //     fontSize: TYPE.small,
// //     color: "#666",
// //   },
// //   viewMenuBtn: {
// //     backgroundColor: theme.PRIMARY_COLOR,
// //     paddingVertical: hp(0.8),
// //     paddingHorizontal: wp(3.5),
// //     borderRadius: 8,
// //     marginTop: hp(0.8),
// //     alignSelf: "flex-start",
// //   },
// //   viewMenuText: { color: "#fff", fontSize: TYPE.small, fontWeight: "700" },

// //   statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
// //   openBadge: { backgroundColor: "#e6f9ed" },
// //   closedBadge: { backgroundColor: "#f0f0f0" },
// //   statusText: { fontSize: TYPE.micro, color: "#333", fontWeight: "700" },

// //   footerHero: {
// //     paddingHorizontal: wp(4),
// //     paddingTop: hp(2),
// //     alignItems: "flex-start",
// //     backgroundColor: "#fff",
// //   },
// //   footerHeroTitle: {
// //     fontSize: TYPE.hero,
// //     fontWeight: "900",
// //     color: "#E0E0E0",
// //     lineHeight: TYPE.hero * 1.05,
// //   },
// //   footerHeroSubtitle: {
// //     fontSize: TYPE.body,
// //     color: "#777",
// //     marginTop: hp(0.8),
// //   },

// //   noShop: {
// //     flex: 1,
// //     justifyContent: "center",
// //     alignItems: "center",
// //     padding: 20,
// //   },
// //   emptyText: {
// //     fontSize: TYPE.body,
// //     color: "gray",
// //     marginVertical: 10,
// //     textAlign: "center",
// //   },
// //   changeLocationBtn: {
// //     marginTop: 15,
// //     paddingVertical: 10,
// //     paddingHorizontal: 20,
// //     backgroundColor: theme.PRIMARY_COLOR,
// //     borderRadius: 8,
// //   },
// //   changeLocationText: {
// //     color: "white",
// //     fontSize: TYPE.small,
// //     fontWeight: "700",
// //   },
// //   comingSoonText: {
// //     marginTop: 20,
// //     fontSize: TYPE.small,
// //     color: "#888",
// //     textAlign: "center",
// //   },
// // });
// import React, {
//   useCallback,
//   useEffect,
//   useMemo,
//   useState,
//   ReactNode,
// } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   Pressable,
//   Image,
//   TextInput,
//   RefreshControl,
//   Platform,
//   StatusBar,
//   ListRenderItemInfo,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useNavigation } from "@react-navigation/native";
// import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import type { ParamListBase } from "@react-navigation/native";
// import { useDispatch, useSelector, shallowEqual } from "react-redux";
// import { useDebounce } from "use-debounce";
// import { Ionicons } from "@expo/vector-icons";
// import { useQuery, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
// import { LinearGradient } from "expo-linear-gradient";

// import apiClient from "@/src/api/client";
// import theme from "@/src/assets/colors/theme";
// import { hp, wp } from "@/src/assets/utils/responsive";
// import { setSelectedShopId } from "@/src/Redux/Slice/selectedShopSlice";
// import SideMenuModal from "@/src/Common/SlideMenuModal";
// import ShopSkeleton from "@/src/components/skeltons/ShopSkeleton";
// import CategorySkeleton from "@/src/components/skeltons/CategorySkeleton";
// import CarouselBanner from "@/src/components/CarouselBanner";
// import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   withSpring,
// } from "react-native-reanimated";
// import PopularSkeleton from "@/src/components/skeltons/PopularSkeleton";
// import TickerPlaceHolder from "@/src/components/TickerPlaceHolder";
// import FloatingCoffeeButton from "@/src/components/Button/FloatingCoffeeButton";

// /* ---------------- Types ---------------- */
// type RootState = any;
// type CategoryType = {
//   categoryId: number;
//   categoryName: string;
//   categoryImage?: string | null;
// };
// type ItemType = {
//   shopname?: ReactNode;
//   menuName?: string;
//   menuId?: number;
//   name?: string;
//   price?: number;
//   imageUrl?: string | null;
// };
// type ShopType = {
//   id: number;
//   shopname: string;
//   shopImage?: string | null;
//   isOpen?: boolean;
//   etaMinutes?: number | null;
//   distanceKm?: number | null;
// };

// /* ---------------- Constants / Sizes ---------------- */
// const TYPE = {
//   h1: hp(2.8),
//   h2: hp(2.4),
//   body: hp(1.8),
//   small: hp(1.4),
//   micro: hp(1.1),
//   hero: hp(5.2),
// };

// const PAGE_SIZE = 10;
// const ICON = { small: hp(1.8), medium: hp(2.4), large: hp(3.0) };

// const DAILY_MESSAGES = [
//   "Are you chai? Because you spice up my mornings 🌶️☕",
//   "Are you sugar? Because you make my coffee sweet ☕🍬",
//   "Like foam on cappuccino, you’re the highlight of my day ✨",
//   "Snacks in 3 clicks? Faster than falling for you 😍",
//   "Snacks delivered faster than my pickup lines 😏🍩",
//   "I’ll bring the tea, you bring the gossip 😉",
//   "Your smile + my snacks = the real combo meal 😍",
// ];

// // stable default suggestions - DON'T use hooks at top level
// const DEFAULT_SUGGESTIONS = ["tea", "coffee", "snacks", "chai", "cold coffee", "iced tea"];

// const bannerData = [
//   { image: require("@/src/assets/images/Cappaciuno Latte.jpg") },
//   { image: require("@/src/assets/images/Cold Coffee.jpg") },
//   { image: require("@/src/assets/images/Green Tea.jpg") },
//   { image: require("@/src/assets/images/Iced tea.jpg") },
// ];

// const INPUT_ITEM_HEIGHT = Math.round(hp(2.2));
// const PAGE_TICKER_INTERVAL = 2500;

// /* ---------------- API helpers with error handling ---------------- */
// const getToken = async () => {
//   try {
//     return await AsyncStorage.getItem("authToken");
//   } catch (err) {
//     console.error("getToken error", err);
//     return null;
//   }
// };

// const fetchCategories = async (): Promise<CategoryType[]> => {
//   try {
//     const res = await apiClient.get("/api/category/categories-with-menus");
//     const payload = Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : [];
//     return payload;
//   } catch (err) {
//     console.error("fetchCategories error", err);
//     return [];
//   }
// };

// const fetchPopular = async (lat?: number, lng?: number): Promise<ItemType[]> => {
//   if (!lat || !lng) return [];
//   try {
//     const res = await apiClient.get("/api/orders/popular-items", { params: { lat, lng } });
//     const payload = Array.isArray(res?.data) ? res.data : res?.data?.popularItems ?? res?.data?.items ?? res?.data ?? [];
//     return Array.isArray(payload) ? payload : [];
//   } catch (err) {
//     console.error("fetchPopular error", err);
//     return [];
//   }
// };

// const fetchShopsPage = async ({ pageParam = 0, queryKey }: any) => {
//   const [_key, lat, lng, search] = queryKey;
//   try {
//     const res = await apiClient.get("/api/shops/nearby", {
//       params: { lat, lng, onlyOpen: true, limit: PAGE_SIZE, offset: pageParam, search: search || undefined },
//     });
//     const data = Array.isArray(res?.data) ? res.data : res?.data?.items ?? [];
//     const total = Number(res?.data?.total ?? (Array.isArray(res?.data) ? res.data.length : 0)) || 0;
//     return { data, nextOffset: data.length === 0 ? null : pageParam + PAGE_SIZE, total };
//   } catch (err) {
//     console.error("fetchShopsPage error", err);
//     return { data: [], nextOffset: null, total: 0 };
//   }
// };

// const fetchAllBestSellers = async (): Promise<ItemType[]> => {
//   try {
//     const res = await apiClient.get("/api/best-sellers/all");
//     return Array.isArray(res?.data) ? res.data : [];
//   } catch (err) {
//     console.error("fetchAllBestSellers error", err);
//     return [];
//   }
// };

// /* ---------------- ShopCard (memoized) ---------------- */
// const ShopCard: React.FC<{ item: ShopType; onOpen: (id: number) => void }> = React.memo(({ item, onOpen }) => {
//   const open = typeof item.isOpen === "boolean" ? item.isOpen : true;
//   const eta = item.etaMinutes ?? null;
//   const distance = item.distanceKm ?? null;
//   const baseURL = apiClient.defaults.baseURL;

//   return (
//     <Pressable
//       style={({ pressed }) => [styles.shopCard, { transform: [{ scale: pressed ? 0.98 : 1 }] }]}
//       onPress={() => onOpen(item.id)}
//       android_ripple={{ color: "#f2f2f2" }}
//       accessibilityRole="button"
//       accessibilityLabel={`Open ${item.shopname} detail`}
//     >
//       <Image
//         style={styles.shopImage}
//         source={item.shopImage ? { uri: `${baseURL}/uploads/shops/${item.shopImage}` } : require("@/src/assets/images/onBoard1.png")}
//         resizeMode="cover"
//       />

//       <View style={styles.shopDetails}>
//         <View style={styles.shopTitleRow}>
//           <Text style={styles.shopName} numberOfLines={1}>
//             {item.shopname}
//           </Text>
//           <View style={[styles.statusBadge, open ? styles.openBadge : styles.closedBadge]}>
//             <Text style={styles.statusText}>{open ? "Open" : "Closed"}</Text>
//           </View>
//         </View>

//         <View style={styles.shopMeta}>
//           <Ionicons name="star" size={12} color="#FFC107" />
//           <Text style={styles.metaText}>4.5</Text>
//           <Text style={styles.metaText}> • {eta ? `${eta} min` : "—"}</Text>
//           <Text style={styles.metaText}>{distance ? ` • ${distance} km` : ""}</Text>
//         </View>

//         <View style={styles.tagRow}>
//           <Text style={styles.tag}>Masala Chai</Text>
//           <Text style={styles.tag}>Filter Coffee</Text>
//         </View>

//         <TouchableOpacity style={styles.viewMenuBtn} accessibilityRole="button">
//           <Text style={styles.viewMenuText}>View Menu</Text>
//         </TouchableOpacity>
//       </View>
//     </Pressable>
//   );
// });
// ShopCard.displayName = "ShopCard";

// /* ---------------- Category item with spring tap ---------------- */
// const CategoryItem = React.memo(function CategoryItem({ item, onPress }: { item: CategoryType; onPress: (c: CategoryType) => void }) {
//   const scale = useSharedValue(1);
//   const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

//   const handlePress = () => {
//     scale.value = withTiming(0.94, { duration: 120 });
//     setTimeout(() => {
//       scale.value = withSpring(1, { stiffness: 200, damping: 15 });
//     }, 120);
//     onPress(item);
//   };

//   return (
//     <Pressable onPress={handlePress} style={{ marginRight: wp(3) }}>
//       <Animated.View style={[aStyle]}>
//         <View style={styles.popularItem}>
//           <View style={styles.popularCircle}>
//             {item.categoryImage ? (
//               <Image source={{ uri: `${apiClient.defaults.baseURL}/uploads/categories/${item.categoryImage}` }} style={styles.popularImg} resizeMode="cover" />
//             ) : (
//               <Image source={require("@/src/assets/images/onBoard1.png")} style={styles.popularImg} />
//             )}
//           </View>
//           <Text style={styles.popularName} numberOfLines={1}>
//             {item.categoryName}
//           </Text>
//         </View>
//       </Animated.View>
//     </Pressable>
//   );
// });

// /* ---------------- HomeHeader (memoized) ---------------- */
// const HomeHeader = React.memo(function HomeHeader({
//   insets,
//   location,
//   navigation,
//   searchText,
//   setSearchText,
//   greeting,
//   dailyMessage,
//   categories,
//   loadingCategories,
//   onOpenCategory,
//   INPUT_ITEM_HEIGHT,
//   onMenuPress,
//   onNotificationsPress,
// }: any) {
//   const limitedCategories = Array.isArray(categories) ? categories.slice(0, 7) : [];

//   return (
//     <View>
//       <LinearGradient
//         colors={["#562E19", "#943400", "#DE8C26"]}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//         style={[
//           styles.topHeaderBackground,
//           {
//             paddingTop:
//               (insets.top || (Platform.OS === "android" ? StatusBar.currentHeight ?? 24 : 0)) + hp(2),
//           },
//         ]}
//       >
//         <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

//         <View style={styles.topHeaderInner}>
//           <View style={{ flexDirection: "row", alignItems: "center" }}>
//             <Pressable onPress={onMenuPress} hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}>
//               <Ionicons name="menu-outline" size={ICON.large} color="#fff" />
//             </Pressable>

//             <TouchableOpacity style={styles.locationRow} onPress={() => navigation.navigate("locationScreen" as never)} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Open location selector">
//               <View style={styles.locationBadge}>
//                 <Ionicons name="location-outline" size={hp(2)} color={theme.PRIMARY_COLOR} />
//               </View>

//               <View style={{ marginLeft: 10, maxWidth: wp(56) }}>
//                 <Text style={styles.locationTitle} numberOfLines={1}>
//                   {location ? "Iskon Junction, Iskcon Ambli..." : "Select Location"}
//                 </Text>
//                 <Text style={styles.locationSubtitle} numberOfLines={1}>
//                   {location ? `${location.latitude}, ${location.longitude}` : "Tap to choose"}
//                 </Text>
//               </View>
//             </TouchableOpacity>
//           </View>

//           <TouchableOpacity onPress={onNotificationsPress} hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }} accessibilityRole="button">
//             <Ionicons name="notifications-outline" size={ICON.large} color="#fff" />
//           </TouchableOpacity>
//         </View>

//         <View style={styles.greetingContainer}>
//           <Text style={styles.greetingText}>{greeting}, Aarin</Text>

//           <View style={styles.dailyMessageWrapper}>
//             <Text style={styles.dailyMessage} numberOfLines={2} ellipsizeMode="tail" accessibilityLabel={`Daily message: ${dailyMessage}`}>
//               {dailyMessage}
//             </Text>
//           </View>
//         </View>

//         {/* Search row */}
//         <View style={styles.searchRow}>
//           {searchText ? (
//             <TouchableOpacity onPress={() => setSearchText("")} hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}>
//               <Ionicons name="close-circle" size={ICON.small} />
//             </TouchableOpacity>
//           ) : (
//             <Ionicons name="search" size={ICON.small} color="#999" style={styles.searchIcon} />
//           )}

//           <TouchableOpacity style={styles.searchInput} activeOpacity={1} onPress={() => navigation.navigate("searchScreen")} accessibilityRole="button" accessibilityLabel="Open search">
//             <TextInput editable={false} pointerEvents="none" style={styles.searchInputText} value={searchText} onChangeText={setSearchText} returnKeyType="search" />

//             {!searchText && (
//               <TickerPlaceHolder
//                 words={DEFAULT_SUGGESTIONS}
//                 prefix="Search for"
//                 itemHeight={INPUT_ITEM_HEIGHT}
//                 interval={PAGE_TICKER_INTERVAL}
//                 duration={420}
//                 paused={false}
//                 textStyle={styles.placeholderText}
//                 containerStyle={styles.tickerContainer}
//               />
//             )}
//           </TouchableOpacity>
//         </View>
//       </LinearGradient>

//       {/* categories */}
//       <View style={styles.categoryHeaderRow}>
//         <Text style={styles.sectionTitle}>Categories</Text>
//         <TouchableOpacity onPress={() => navigation.navigate("viewAllCategoryScreen" as never)} accessibilityRole="button">
//           <Text style={styles.viewAllText}>View All</Text>
//         </TouchableOpacity>
//       </View>

//       {loadingCategories ? (
//         <CategorySkeleton />
//       ) : (
//         <FlatList
//           data={limitedCategories}
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           keyExtractor={(it: CategoryType) => `cat-${it.categoryId}`}
//           renderItem={({ item }) => <CategoryItem item={item} onPress={onOpenCategory} />}
//           contentContainerStyle={styles.categoryList}
//         />
//       )}

//       <Text style={styles.sectionTitleCompact}>Nearby Vendors (within 1KM)</Text>
//     </View>
//   );
// });

// /* ---------------- HomeScreen ---------------- */
// const HomeScreen: React.FC = () => {
//   const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
//   const dispatch = useDispatch();
//   const queryClient = useQueryClient();
//   const insets = useSafeAreaInsets();
//   const location = useSelector((s: RootState) => s.location, shallowEqual);
//   const lat = location?.latitude;
//   const lng = location?.longitude;

//   const [searchText, setSearchText] = useState("");
//   const [sideMenuVisible, setSideMenuVisible] = useState(false);
//   const [debouncedSearch] = useDebounce(searchText, 500);

//   const [index, setIndex] = useState(0);

//   const getGreeting = useCallback(() => {
//     const currentHour = new Date().getHours();
//     if (currentHour < 12) return "Good Morning 🌞";
//     if (currentHour < 18) return "Good Afternoon ☀️";
//     return "Good Evening 🌙";
//   }, []);

//   const [greeting, setGreeting] = useState(getGreeting());
//   useEffect(() => {
//     const interval = setInterval(() => setGreeting(getGreeting()), 15 * 60 * 1000);
//     return () => clearInterval(interval);
//   }, [getGreeting]);

//   // rotating daily message index
//   useEffect(() => {
//     const id = setInterval(() => setIndex((p) => (p + 1) % DAILY_MESSAGES.length), 7000);
//     return () => clearInterval(id);
//   }, []);

//   // queries
//   const { data: categories = [], isLoading: loadingCategories } = useQuery({
//     queryKey: ["categories"],
//     queryFn: fetchCategories,
//     staleTime: 1000 * 60 * 5,
//     retry: 1,
//   });

//   const { data: popularItems = [], isLoading: loadingPopular } = useQuery({
//     queryKey: ["popular", lat, lng],
//     queryFn: () => fetchPopular(lat, lng),
//     enabled: !!lat && !!lng,
//     staleTime: 1000 * 60,
//     retry: 1,
//   });

//   const { data: bestSellers = [], isLoading: loadingBestSellers } = useQuery({
//     queryKey: ["allBestSellers"],
//     queryFn: fetchAllBestSellers,
//     staleTime: 1000 * 60,
//     retry: 1,
//   });

//   const {
//     data: shopPages,
//     fetchNextPage,
//     hasNextPage,
//     isFetchingNextPage,
//     isLoading: loadingShops,
//     isFetching,
//   } = useInfiniteQuery({
//     queryKey: ["shops", lat, lng, debouncedSearch],
//     queryFn: fetchShopsPage,
//     getNextPageParam: (last) => last.nextOffset,
//     enabled: !!lat && !!lng,
//     staleTime: 1000 * 30,
//     cacheTime: 1000 * 60 * 5,
//     retry: 1,
//   });

//   const shops: ShopType[] = useMemo(() => (shopPages ? shopPages.pages.flatMap((p: any) => p.data) : []), [shopPages]);

//   const onRefresh = useCallback(async () => {
//     try {
//       await Promise.allSettled([
//         queryClient.invalidateQueries({ queryKey: ["shops"] }),
//         queryClient.invalidateQueries({ queryKey: ["categories"] }),
//         queryClient.invalidateQueries({ queryKey: ["popular"] }),
//         queryClient.invalidateQueries({ queryKey: ["allBestSellers"] }),
//       ]);
//     } catch (err) {
//       console.error("refresh error", err);
//     }
//   }, [queryClient]);

//   const handleLoadMore = useCallback(() => {
//     if (isFetchingNextPage || !hasNextPage) return;
//     fetchNextPage();
//   }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

//   const handleOpenShop = useCallback(
//     (shopId: number) => {
//       dispatch(setSelectedShopId(shopId));
//       navigation.navigate("shopDetailScreen" as never);
//     },
//     [dispatch, navigation]
//   );

//   const handleOpenCategory = useCallback(
//     (c: CategoryType) => {
//       navigation.navigate("categoryDetailScreen" as never, { categoryId: c.categoryId, categoryName: c.categoryName } as never);
//     },
//     [navigation]
//   );

//   useEffect(() => {
//     if (!lat || !lng) {
//       navigation.replace("locationScreen");
//     }
//   }, [lat, lng, navigation]);

//   /* ---------------- Header memoized element ---------------- */
//   const HeaderElement = useMemo(() => {
//     return (
//       <HomeHeader
//         insets={insets}
//         location={location}
//         navigation={navigation}
//         searchText={searchText}
//         setSearchText={setSearchText}
//         greeting={greeting}
//         dailyMessage={DAILY_MESSAGES[index]}
//         categories={categories}
//         loadingCategories={loadingCategories}
//         onOpenCategory={handleOpenCategory}
//         INPUT_ITEM_HEIGHT={INPUT_ITEM_HEIGHT}
//         onMenuPress={() => setSideMenuVisible(true)}
//         onNotificationsPress={() => navigation.navigate("notificationsScreen" as never)}
//       />
//     );
//     // only update header when these relevant values change
//   }, [insets, location, navigation, searchText, greeting, index, categories, loadingCategories, handleOpenCategory]);

//   /* ---------------- list helpers ---------------- */
//   const renderShop = useCallback(({ item }: ListRenderItemInfo<ShopType>) => <ShopCard item={item} onOpen={handleOpenShop} />, [handleOpenShop]);
//   const keyExtractor = useCallback((item: ShopType) => `shop-${item.id}`, []);
//   const SHOP_CARD_HEIGHT = hp(20) + 16;
//   const getItemLayout = useCallback((_data: any, index: number) => ({ length: SHOP_CARD_HEIGHT, offset: SHOP_CARD_HEIGHT * index, index }), []);

//   /* ---------------- Footer (memoized) ---------------- */
//   const FooterComponent = useMemo(
//     () => (
//       <View style={{ flex: 0.8 }}>
//         <CarouselBanner data={bannerData} />
//         <Text style={[styles.sectionTitle, { paddingHorizontal: wp(5), paddingTop: hp(1) }]}>Best Sellers</Text>
//         {loadingBestSellers ? (
//           <PopularSkeleton />
//         ) : bestSellers.length > 0 ? (
//           <FlatList
//             data={bestSellers}
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             keyExtractor={(it) => String(it.menuId)}
//             renderItem={({ item }) => (
//               <View style={styles.popularItem}>
//                 <View style={styles.popularCircle}>{item.imageUrl ? <Image source={{ uri: `${apiClient.defaults.baseURL}/uploads/menus/${item.imageUrl}` }} style={styles.popularImg} resizeMode="cover" /> : null}</View>
//                 <Text style={styles.popularName} numberOfLines={1}>
//                   {item.menuName}
//                 </Text>
//                 <Text>{item.shopname}</Text>
//                 <Text style={styles.popularPrice}>₹{item.price ?? "—"}</Text>
//               </View>
//             )}
//             contentContainerStyle={{ paddingLeft: wp(4), paddingVertical: hp(1) }}
//           />
//         ) : (
//           <View style={{ padding: 20, alignItems: "center" }}>
//             <Text style={{ fontSize: 16, color: "#888" }}>No best sellers yet.</Text>
//           </View>
//         )}

//         <View style={styles.footerHero}>
//           <Text style={styles.footerHeroTitle}>Sip, Snack, Smile</Text>
//           <Text style={styles.footerHeroSubtitle}>Brewing Happiness, One Cup at a Time.</Text>
//         </View>
//       </View>
//     ),
//     [bannerData, loadingBestSellers, bestSellers]
//   );

//   return (
//     <SafeAreaProvider style={styles.safe}>
//       <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
//       <View style={styles.container}>
//         <FlatList
//           data={shops}
//           keyExtractor={keyExtractor}
//           renderItem={renderShop}
//           ListHeaderComponent={shops.length > 0 ? HeaderElement : null}
//           ListFooterComponent={FooterComponent}
//           ListEmptyComponent={
//             !loadingShops ? (
//               <View style={styles.noShop}>
//                 <Ionicons name="location-outline" size={48} color={theme.PRIMARY_COLOR} />
//                 <Text style={styles.emptyText}>Sorry, service is not available in your area yet.</Text>
//                 <TouchableOpacity style={styles.changeLocationBtn} onPress={() => navigation.navigate("locationScreen" as never)} accessibilityRole="button">
//                   <Text style={styles.changeLocationText}>Change Location</Text>
//                 </TouchableOpacity>
//                 <Text style={styles.comingSoonText}>Coming soon ClickTea at your nearby location</Text>
//               </View>
//             ) : (
//               <View style={{ padding: hp(6) }}>
//                 <ShopSkeleton />
//                 <ShopSkeleton />
//               </View>
//             )
//           }
//           onEndReachedThreshold={0.5}
//           onEndReached={handleLoadMore}
//           refreshControl={<RefreshControl refreshing={isFetching} onRefresh={onRefresh} tintColor={theme.PRIMARY_COLOR} />}
//           contentContainerStyle={{ paddingBottom: hp(10) }}
//           initialNumToRender={6}
//           maxToRenderPerBatch={8}
//           windowSize={7}
//           removeClippedSubviews={Platform.OS === "android"}
//           getItemLayout={getItemLayout}
//         />

//         <SideMenuModal visible={sideMenuVisible} onClose={() => setSideMenuVisible(false)} />
//       </View>

//       <FloatingCoffeeButton
//         animationSource={require("@/src/assets/animation/Coffee love.json")}
//         size={78}
//         offsetRight={18}
//         offsetBottom={20}
//         onPress={() => navigation.navigate("teaAndCoffeeScreen" as never)}
//         bob={true}
//         entranceDelay={120}
//         loop={true}
//         containerStyle={{
//           opacity: 0.6,
//           bottom: hp(15),
//           padding: 1,
//           backgroundColor: "white",
//           borderRadius: 50,
//           alignItems: "center",
//           justifyContent: "center",
//         }}
//       />
//     </SafeAreaProvider>
//   );
// };

// export default HomeScreen;

// /* ---------------- Styles ---------------- */
// /* (unchanged from your original file) */
// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: "#fff" },
//   container: { flex: 1, backgroundColor: "#fff" },

//   topHeaderBackground: {
//     paddingBottom: hp(4),
//     borderBottomLeftRadius: 15,
//     borderBottomRightRadius: 15,
//     overflow: "hidden",
//   },
//   topHeaderInner: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: wp(4),
//   },

//   greetingContainer: {
//     marginTop: hp(2),
//     alignItems: "center",
//   },
//   greetingText: {
//     fontSize: 24,
//     fontWeight: "700",
//     color: "#fff",
//   },
//   dailyMessageWrapper: {
//     marginTop: hp(1),
//     paddingHorizontal: wp(6),
//     width: "100%",
//     alignItems: "center",
//   },

//   dailyMessage: {
//     fontSize: TYPE.small,
//     color: "#fff",
//     textAlign: "center",
//     lineHeight: Math.round(TYPE.small * 1.35),
//     maxWidth: wp(86),
//     includeFontPadding: false,
//   },

//   locationRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginLeft: wp(2),
//   },
//   locationBadge: {
//     width: wp(11),
//     height: wp(11),
//     borderRadius: wp(5.5),
//     backgroundColor: "#fff",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   locationTitle: { fontSize: TYPE.h2, fontWeight: "700", color: "#ffffff" },
//   locationSubtitle: {
//     fontSize: TYPE.small,
//     color: "rgba(255,255,255,0.85)",
//     marginTop: 2,
//   },

//   searchRow: {
//     marginTop: hp(2),
//     marginHorizontal: wp(4),
//     backgroundColor: "white",
//     borderRadius: hp(1),
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: wp(3),
//     height: hp(6),
//   },
//   searchIcon: { marginRight: wp(2) },
//   searchInput: { flex: 1, height: "100%", justifyContent: "center" },
//   searchInputText: { fontSize: TYPE.body, color: "#333", paddingVertical: 0 },

//   tickerContainer: {
//     position: "absolute",
//     left: wp(3),
//     right: wp(3),
//     overflow: "hidden",
//     justifyContent: "flex-start",
//   },

//   placeholderText: {
//     color: "#999",
//     fontSize: TYPE.body,
//   },

//   categoryHeaderRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginTop: hp(1.2),
//     paddingHorizontal: wp(5),
//   },
//   sectionTitle: { fontSize: hp(2.4), fontWeight: "700", color: "#222" },
//   sectionTitleCompact: {
//     fontSize: hp(2.4),
//     fontWeight: "700",
//     color: "#222",
//     marginTop: hp(1.2),
//     paddingHorizontal: wp(5),
//   },
//   viewAllText: {
//     color: theme.PRIMARY_COLOR,
//     fontWeight: "700",
//     fontSize: TYPE.small,
//   },

//   categoryList: { paddingHorizontal: wp(4), paddingVertical: hp(1.2) },
//   popularItem: { width: wp(22), alignItems: "center" },
//   popularCircle: {
//     width: wp(20),
//     height: wp(20),
//     borderRadius: wp(4),
//     backgroundColor: "#eaeaea",
//     justifyContent: "center",
//     alignItems: "center",
//     overflow: "hidden",
//   },
//   popularImg: { width: "100%", height: "100%" },
//   popularName: {
//     fontSize: TYPE.small,
//     color: "#333",
//     textAlign: "center",
//     marginTop: hp(0.6),
//   },

//   shopCard: {
//     flexDirection: "row",
//     borderBottomWidth: 1,
//     marginHorizontal: wp(5),
//     borderColor: "#eee",
//     paddingVertical: hp(1.2),
//   },
//   shopImage: {
//     width: wp(20),
//     height: wp(20),
//     borderRadius: 8,
//     backgroundColor: "#f2f2f2",
//     marginTop: hp(0.5),
//   },
//   shopDetails: { flex: 1, padding: wp(3) },
//   shopTitleRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   shopName: {
//     fontSize: TYPE.body,
//     fontWeight: "700",
//     color: theme.PRIMARY_COLOR,
//     maxWidth: wp(55),
//   },
//   shopMeta: { flexDirection: "row", alignItems: "center", marginTop: hp(0.5) },
//   metaText: { fontSize: TYPE.small, color: "#666", marginLeft: 6 },
//   tagRow: { flexDirection: "row", flexWrap: "wrap", marginTop: hp(0.6) },
//   tag: {
//     backgroundColor: "#f2f2f2",
//     paddingHorizontal: wp(2),
//     paddingVertical: hp(0.4),
//     borderRadius: 8,
//     marginRight: wp(2),
//     fontSize: TYPE.small,
//     color: "#666",
//   },
//   viewMenuBtn: {
//     backgroundColor: theme.PRIMARY_COLOR,
//     paddingVertical: hp(0.8),
//     paddingHorizontal: wp(3.5),
//     borderRadius: 8,
//     marginTop: hp(0.8),
//     alignSelf: "flex-start",
//   },
//   viewMenuText: { color: "#fff", fontSize: TYPE.small, fontWeight: "700" },

//   statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
//   openBadge: { backgroundColor: "#e6f9ed" },
//   closedBadge: { backgroundColor: "#f0f0f0" },
//   statusText: { fontSize: TYPE.micro, color: "#333", fontWeight: "700" },

//   footerHero: {
//     paddingHorizontal: wp(4),
//     paddingTop: hp(2),
//     alignItems: "flex-start",
//     backgroundColor: "#fff",
//   },
//   footerHeroTitle: {
//     fontSize: TYPE.hero,
//     fontWeight: "900",
//     color: "#E0E0E0",
//     lineHeight: TYPE.hero * 1.05,
//   },
//   footerHeroSubtitle: {
//     fontSize: TYPE.body,
//     color: "#777",
//     marginTop: hp(0.8),
//   },

//   noShop: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },
//   emptyText: {
//     fontSize: TYPE.body,
//     color: "gray",
//     marginVertical: 10,
//     textAlign: "center",
//   },
//   changeLocationBtn: {
//     marginTop: 15,
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     backgroundColor: theme.PRIMARY_COLOR,
//     borderRadius: 8,
//   },
//   changeLocationText: {
//     color: "white",
//     fontSize: TYPE.small,
//     fontWeight: "700",
//   },
//   comingSoonText: {
//     marginTop: 20,
//     fontSize: TYPE.small,
//     color: "#888",
//     textAlign: "center",
//   },
//   popularPrice:{
//     color:"red"
//   }
// });
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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ParamListBase } from "@react-navigation/native";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useDebounce } from "use-debounce";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";

import apiClient from "@/src/api/client";
import theme from "@/src/assets/colors/theme";
import { hp, wp } from "@/src/assets/utils/responsive";
import { setSelectedShopId } from "@/src/Redux/Slice/selectedShopSlice";
import SideMenuModal from "@/src/Common/SlideMenuModal";
import ShopSkeleton from "@/src/components/skeltons/ShopSkeleton";
import CategorySkeleton from "@/src/components/skeltons/CategorySkeleton";
import CarouselBanner from "@/src/components/CarouselBanner";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import PopularSkeleton from "@/src/components/skeltons/PopularSkeleton";
import FloatingCoffeeButton from "@/src/components/Button/FloatingCoffeeButton";

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
  "Are you chai? Because you spice up my mornings 🌶️☕",
  "Are you sugar? Because you make my coffee sweet ☕🍬",
  "Like foam on cappuccino, you’re the highlight of my day ✨",
  "Snacks in 3 clicks? Faster than falling for you 😍",
  "Snacks delivered faster than my pickup lines 😏🍩",
  "I’ll bring the tea, you bring the gossip 😉",
  "Your smile + my snacks = the real combo meal 😍",
];

// stable default suggestions - don't use hooks at top level
const DEFAULT_SUGGESTIONS = ["tea", "coffee", "snacks", "chai", "cold coffee", "iced tea"];

const bannerData = [
  { image: require("@/src/assets/images/Cappaciuno Latte.jpg") },
  { image: require("@/src/assets/images/Cold Coffee.jpg") },
  { image: require("@/src/assets/images/Green Tea.jpg") },
  { image: require("@/src/assets/images/Iced tea.jpg") },
];

const INPUT_ITEM_HEIGHT = Math.round(hp(2.2));
const PAGE_TICKER_INTERVAL = 2500;

/* ---------------- API helpers with error handling ---------------- */
const getToken = async () => {
  try {
    return await AsyncStorage.getItem("authToken");
  } catch (err) {
    console.error("getToken error", err);
    return null;
  }
};

const fetchCategories = async (): Promise<CategoryType[]> => {
  try {
    const res = await apiClient.get("/api/category/categories-with-menus");
    const payload = Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : [];
    return payload;
  } catch (err) {
    console.error("fetchCategories error", err);
    return [];
  }
};

const fetchPopular = async (lat?: number, lng?: number): Promise<ItemType[]> => {
  if (!lat || !lng) return [];
  try {
    const res = await apiClient.get("/api/orders/popular-items", { params: { lat, lng } });
    const payload = Array.isArray(res?.data) ? res.data : res?.data?.popularItems ?? res?.data?.items ?? res?.data ?? [];
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
      params: { lat, lng, onlyOpen: true, limit: PAGE_SIZE, offset: pageParam, search: search || undefined },
    });
    const data = Array.isArray(res?.data) ? res.data : res?.data?.items ?? [];
    const total = Number(res?.data?.total ?? (Array.isArray(res?.data) ? res.data.length : 0)) || 0;
    return { data, nextOffset: data.length === 0 ? null : pageParam + PAGE_SIZE, total };
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

/* ---------------- ShopCard (memoized) ---------------- */
const ShopCard: React.FC<{ item: ShopType; onOpen: (id: number) => void }> = React.memo(({ item, onOpen }) => {
  const open = typeof item.isOpen === "boolean" ? item.isOpen : true;
  const eta = item.etaMinutes ?? null;
  const distance = item.distanceKm ?? null;
  const baseURL = apiClient.defaults.baseURL;

  return (
    <Pressable
      style={({ pressed }) => [styles.shopCard, { transform: [{ scale: pressed ? 0.98 : 1 }] }]}
      onPress={() => onOpen(item.id)}
      android_ripple={{ color: "#f2f2f2" }}
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.shopname} detail`}
    >
      <Image
        style={styles.shopImage}
        source={item.shopImage ? { uri: `${baseURL}/uploads/shops/${item.shopImage}` } : require("@/src/assets/images/onBoard1.png")}
        resizeMode="cover"
      />

      <View style={styles.shopDetails}>
        <View style={styles.shopTitleRow}>
          <Text style={styles.shopName} numberOfLines={1}>
            {item.shopname}
          </Text>
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

/* ---------------- Category item with spring tap ---------------- */
const CategoryItem = React.memo(function CategoryItem({ item, onPress }: { item: CategoryType; onPress: (c: CategoryType) => void }) {
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

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
              <Image source={{ uri: `${apiClient.defaults.baseURL}/uploads/categories/${item.categoryImage}` }} style={styles.popularImg} resizeMode="cover" />
            ) : (
              <Image source={require("@/src/assets/images/onBoard1.png")} style={styles.popularImg} />
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

/* ---------------- HomeHeader (memoized) - now contains inline ticker animation ---------------- */
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
  const limitedCategories = Array.isArray(categories) ? categories.slice(0, 7) : [];

  // TICKER: same animation as in ViewAllCategoryScreen
  const FONT_SIZE = Math.max(13, Math.round(wp(3.6)));
  const ITEM_HEIGHT = Math.round(hp(2.2));
  const tickerItems = useMemo(() => {
    // append first item to allow seamless reset
    if (!Array.isArray(DEFAULT_SUGGESTIONS) || DEFAULT_SUGGESTIONS.length === 0) return [];
    return [...DEFAULT_SUGGESTIONS, DEFAULT_SUGGESTIONS[0]];
  }, []);
  const tickerCount = tickerItems.length;
  const tickerIndexRef = useRef<number>(0);
  const tickerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const translateY = useSharedValue(0);
  const tickerAnimStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }), []);

  // start/stop ticker: pause when search has text (user typing) or when no items
  useEffect(() => {
    const start = () => {
      if (tickerIntervalRef.current) return;
      tickerIntervalRef.current = setInterval(() => {
        if (searchText?.trim().length > 0) return; // pause when user is searching
        const next = tickerIndexRef.current + 1;
        translateY.value = withTiming(-next * ITEM_HEIGHT, { duration: 420 });
        tickerIndexRef.current = next;
        if (next === tickerCount - 1) {
          // reset after animation to make seamless loop
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
        colors={["#562E19", "#943400", "#DE8C26"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.topHeaderBackground,
          {
            paddingTop:
              (insets.top || (Platform.OS === "android" ? StatusBar.currentHeight ?? 24 : 0)) + hp(2),
          },
        ]}
      >
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

        <View style={styles.topHeaderInner}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Pressable onPress={onMenuPress} hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}>
              <Ionicons name="menu-outline" size={ICON.large} color="#fff" />
            </Pressable>

            <TouchableOpacity style={styles.locationRow} onPress={() => navigation.navigate("locationScreen" as never)} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Open location selector">
              <View style={styles.locationBadge}>
                <Ionicons name="location-outline" size={hp(2)} color={theme.PRIMARY_COLOR} />
              </View>

              <View style={{ marginLeft: 10, maxWidth: wp(56) }}>
                <Text style={styles.locationTitle} numberOfLines={1}>
                  {location ? "Iskon Junction, Iskcon Ambli..." : "Select Location"}
                </Text>
                <Text style={styles.locationSubtitle} numberOfLines={1}>
                  {location ? `${location.latitude}, ${location.longitude}` : "Tap to choose"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onNotificationsPress} hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }} accessibilityRole="button">
            <Ionicons name="notifications-outline" size={ICON.large} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>{greeting}, Aarin</Text>

          <View style={styles.dailyMessageWrapper}>
            <Text style={styles.dailyMessage} numberOfLines={2} ellipsizeMode="tail" accessibilityLabel={`Daily message: ${dailyMessage}`}>
              {dailyMessage}
            </Text>
          </View>
        </View>

        {/* Search row */}
        <View style={styles.searchRow}>
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText("")} hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}>
              <Ionicons name="close-circle" size={ICON.small} />
            </TouchableOpacity>
          ) : (
            <Ionicons name="search" size={ICON.small} color="#999" style={styles.searchIcon} />
          )}

          <TouchableOpacity style={styles.searchInput} activeOpacity={1} onPress={() => navigation.navigate("searchScreen")} accessibilityRole="button" accessibilityLabel="Open search">
            <TextInput editable={false} pointerEvents="none" style={styles.searchInputText} value={searchText} onChangeText={setSearchText} returnKeyType="search" />

            {/* Inline animated ticker (non-interactive overlay) */}
            {!searchText && tickerItems.length > 0 ? (
              <View pointerEvents="none" style={[styles.tickerContainer, { height: ITEM_HEIGHT }]}>
                <View style={[styles.tickerClip, { height: ITEM_HEIGHT }]}>
                  <Animated.View style={[tickerAnimStyle]}>
                    {tickerItems.map((w, i) => (
                      <View key={String(w) + i} style={{ height: ITEM_HEIGHT, justifyContent: "center" }}>
                        <Text style={[styles.placeholderText, { fontSize: FONT_SIZE }]} numberOfLines={1}>
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

      {/* categories */}
      <View style={styles.categoryHeaderRow}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <TouchableOpacity onPress={() => navigation.navigate("viewAllCategoryScreen" as never)} accessibilityRole="button">
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
          renderItem={({ item }) => <CategoryItem item={item} onPress={onOpenCategory} />}
          contentContainerStyle={styles.categoryList}
        />
      )}

      <Text style={styles.sectionTitleCompact}>Nearby Vendors (within 1KM)</Text>
    </View>
  );
});

/* ---------------- HomeScreen ---------------- */
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
    if (currentHour < 12) return "Good Morning 🌞";
    if (currentHour < 18) return "Good Afternoon ☀️";
    return "Good Evening 🌙";
  }, []);

  const [greeting, setGreeting] = useState(getGreeting());
  useEffect(() => {
    const interval = setInterval(() => setGreeting(getGreeting()), 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [getGreeting]);

  // rotating daily message index
  useEffect(() => {
    const id = setInterval(() => setIndex((p) => (p + 1) % DAILY_MESSAGES.length), 7000);
    return () => clearInterval(id);
  }, []);

  // queries
  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5,
    retry: 1,
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

  const shops: ShopType[] = useMemo(() => (shopPages ? shopPages.pages.flatMap((p: any) => p.data) : []), [shopPages]);

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
      navigation.navigate("categoryDetailScreen" as never, { categoryId: c.categoryId, categoryName: c.categoryName } as never);
    },
    [navigation]
  );

  useEffect(() => {
    if (!lat || !lng) {
      navigation.replace("locationScreen");
    }
  }, [lat, lng, navigation]);

  /* ---------------- Header memoized element ---------------- */
  const HeaderElement = useMemo(() => {
    return (
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
        onNotificationsPress={() => navigation.navigate("notificationsScreen" as never)}
      />
    );
  }, [insets, location, navigation, searchText, greeting, index, categories, loadingCategories, handleOpenCategory]);

  /* ---------------- list helpers ---------------- */
  const renderShop = useCallback(({ item }: ListRenderItemInfo<ShopType>) => <ShopCard item={item} onOpen={handleOpenShop} />, [handleOpenShop]);
  const keyExtractor = useCallback((item: ShopType) => `shop-${item.id}`, []);
  const SHOP_CARD_HEIGHT = hp(20) + 16;
  const getItemLayout = useCallback((_data: any, index: number) => ({ length: SHOP_CARD_HEIGHT, offset: SHOP_CARD_HEIGHT * index, index }), []);

  /* ---------------- Footer (memoized) ---------------- */
  const FooterComponent = useMemo(
    () => (
      <View style={{ flex: 0.8 }}>
        <CarouselBanner data={bannerData} />
        <Text style={[styles.sectionTitle, { paddingHorizontal: wp(5), paddingTop: hp(1) }]}>Best Sellers</Text>
        {loadingBestSellers ? (
          <PopularSkeleton />
        ) : bestSellers.length > 0 ? (
          <FlatList
            data={bestSellers}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(it) => String(it.menuId)}
            renderItem={({ item }) => (
              <View style={styles.popularItem}>
                <View style={styles.popularCircle}>{item.imageUrl ? <Image source={{ uri: `${apiClient.defaults.baseURL}/uploads/menus/${item.imageUrl}` }} style={styles.popularImg} resizeMode="cover" /> : null}</View>
                <Text style={styles.popularName} numberOfLines={1}>
                  {item.menuName}
                </Text>
                <Text>{item.shopname}</Text>
                <Text style={styles.popularPrice}>₹{item.price ?? "—"}</Text>
              </View>
            )}
            contentContainerStyle={{ paddingLeft: wp(4), paddingVertical: hp(1) }}
          />
        ) : (
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text style={{ fontSize: 16, color: "#888" }}>No best sellers yet.</Text>
          </View>
        )}

        <View style={styles.footerHero}>
          <Text style={styles.footerHeroTitle}>Sip, Snack, Smile</Text>
          <Text style={styles.footerHeroSubtitle}>Brewing Happiness, One Cup at a Time.</Text>
        </View>
      </View>
    ),
    [loadingBestSellers, bestSellers]
  );

  return (
    <SafeAreaProvider style={styles.safe}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.container}>
        <FlatList
          data={shops}
          keyExtractor={keyExtractor}
          renderItem={renderShop}
          ListHeaderComponent={shops.length > 0 ? HeaderElement : null}
          ListFooterComponent={FooterComponent}
          ListEmptyComponent={
            !loadingShops ? (
              <View style={styles.noShop}>
                <Ionicons name="location-outline" size={48} color={theme.PRIMARY_COLOR} />
                <Text style={styles.emptyText}>Sorry, service is not available in your area yet.</Text>
                <TouchableOpacity style={styles.changeLocationBtn} onPress={() => navigation.navigate("locationScreen" as never)} accessibilityRole="button">
                  <Text style={styles.changeLocationText}>Change Location</Text>
                </TouchableOpacity>
                <Text style={styles.comingSoonText}>Coming soon ClickTea at your nearby location</Text>
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
    </SafeAreaProvider>
  );
};

export default HomeScreen;

/* ---------------- Styles ---------------- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, backgroundColor: "#fff" },

  topHeaderBackground: {
    paddingBottom: hp(4),
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    overflow: "hidden",
  },
  topHeaderInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp(4),
  },

  greetingContainer: {
    marginTop: hp(2),
    alignItems: "center",
  },
  greetingText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  dailyMessageWrapper: {
    marginTop: hp(1),
    paddingHorizontal: wp(6),
    width: "100%",
    alignItems: "center",
  },

  dailyMessage: {
    fontSize: TYPE.small,
    color: "#fff",
    textAlign: "center",
    lineHeight: Math.round(TYPE.small * 1.35),
    maxWidth: wp(86),
    includeFontPadding: false,
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
    borderRadius: hp(1),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(3),
    height: hp(6),
  },
  searchIcon: { marginRight: wp(2) },
  searchInput: { flex: 1, height: "100%", justifyContent: "center" },
  searchInputText: { fontSize: TYPE.body, color: "#333", paddingVertical: 0 },

  // ticker wrapper (clips the vertical stack)
  tickerContainer: {
    position: "absolute",
    left: wp(3),
    right: wp(3),
    overflow: "hidden",
    justifyContent: "flex-start",
  },

  tickerClip: {
    overflow: "hidden",
    justifyContent: "flex-start",
  },

  placeholderText: {
    color: "#999",
    fontSize: TYPE.body,
  },

  categoryHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: hp(1.2),
    paddingHorizontal: wp(5),
  },
  sectionTitle: { fontSize: hp(2.4), fontWeight: "700", color: "#222" },
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
    borderRadius: wp(4),
    backgroundColor: "#eaeaea",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  popularImg: { width: "100%", height: "100%" },
  popularName: {
    fontSize: TYPE.small,
    color: "#333",
    textAlign: "center",
    marginTop: hp(0.6),
  },

  shopCard: {
    flexDirection: "row",
    borderBottomWidth: 1,
    marginHorizontal: wp(5),
    borderColor: "#eee",
    paddingVertical: hp(1.2),
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
  viewMenuBtn: {
    backgroundColor: theme.PRIMARY_COLOR,
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(3.5),
    borderRadius: 8,
    marginTop: hp(0.8),
    alignSelf: "flex-start",
  },
  viewMenuText: { color: "#fff", fontSize: TYPE.small, fontWeight: "700" },

  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  openBadge: { backgroundColor: "#e6f9ed" },
  closedBadge: { backgroundColor: "#f0f0f0" },
  statusText: { fontSize: TYPE.micro, color: "#333", fontWeight: "700" },

  footerHero: {
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
    alignItems: "flex-start",
    backgroundColor: "#fff",
  },
  footerHeroTitle: {
    fontSize: TYPE.hero,
    fontWeight: "900",
    color: "#E0E0E0",
    lineHeight: TYPE.hero * 1.05,
  },
  footerHeroSubtitle: {
    fontSize: TYPE.body,
    color: "#777",
    marginTop: hp(0.8),
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
});
