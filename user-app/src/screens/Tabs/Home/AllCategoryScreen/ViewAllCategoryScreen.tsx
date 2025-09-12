// // ViewAllCategoryScreen.tsx
// import React, {
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   Pressable,
//   Image,
//   ActivityIndicator,
//   SafeAreaView,
//   StatusBar,
//   TextInput,
//   RefreshControl,
//   Platform,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import axios from "axios";
// import { hp, wp } from "@/src/assets/utils/responsive";
// import theme from "@/src/assets/colors/theme";
// import { BASE_URL } from "@/api";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import type { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
// import CommonHeader from "@/src/Common/CommonHeader";
// import CommonSearchBar from "@/src/Common/CommonSearchBar";
// import { ParamListBase, useNavigation } from "@react-navigation/native";
// import axiosClient from "@/src/api/client";

// /** --- Types --- **/
// type MenuItem = {
//   menuId: number;
//   menuName?: string;
//   imageUrl?: string;
//   price?: string;
//   isAvailable?: number;
// };

// export type CategoryType = {
//   categoryId: number;
//   categoryName: string;
//   categoryImage?: string;
//   menus?: MenuItem[];
//   is_global?: number;
//   shop_id?: number;
// };

// type RootStackParamList = {
//   ViewAllCategory: undefined;
//   CategoryDetail: { categoryId: number; categoryName?: string } | undefined;
// };

// type Props = NativeStackScreenProps<RootStackParamList, "ViewAllCategory">;

// /** --- Memoized category card to avoid re-renders --- **/
// const CategoryCard = React.memo(
//   ({
//     item,
//     selected,
//     onPress,
//   }: {
//     item: CategoryType;
//     selected: boolean;
//     onPress: (id: number, name?: string) => void;
//   }) => {
//     const [imgFailed, setImgFailed] = useState(false);

//     return (
//       <Pressable
//         onPress={() => onPress(item.categoryId, item.categoryName)}
//         android_ripple={{ color: "rgba(0,0,0,0.04)" }}
//         style={[styles.categoryCard, selected && styles.categoryCardSelected]}
//         accessibilityRole="button"
//         accessibilityLabel={`Category ${item.categoryName}`}
//       >
//         <Image
//           source={
//             !imgFailed && item.categoryImage
//               ? { uri: `${BASE_URL}/uploads/categories/${item.categoryImage}` }
//               : require("@/src/assets/images/onBoard1.png")
//           }
//           style={styles.categoryImage}
//           resizeMode="contain"
//           onError={() => setImgFailed(true)}
//         />
//         <Text style={styles.categoryTitle} numberOfLines={1}>
//           {item.categoryName}
//         </Text>

//         {/* optional subtitle: first menu name (if exists) */}
//         {item.menus && item.menus.length > 0 ? (
//           <Text style={styles.categorySubtitle} numberOfLines={1}>
//             {/* {item.menus[0].menuName ?? ""} */}
//           add shope side
//           </Text>
//         ) : null}

//         <Text style={styles.categoryCount}>
//           {item.menus?.length ?? 0} items
//         </Text>
//       </Pressable>
//     );
//   },
//   // only re-render when id, menus length or selection changes
//   (prev, next) =>
//     prev.item.categoryId === next.item.categoryId &&
//     prev.item.menus?.length === next.item.menus?.length &&
//     prev.selected === next.selected
// );

// /** --- Screen --- **/
// const ViewAllCategoryScreen = () => {
//   const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>()
//   const [categories, setCategories] = useState<CategoryType[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);

//   // search handling (debounced)
//   const [query, setQuery] = useState("");
//   const [debouncedQuery, setDebouncedQuery] = useState("");
//   useEffect(() => {
//     const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
//     return () => clearTimeout(t);
//   }, [query]);

//   const tokenRef = useRef<string | null>(null);
//   const cancelSourceRef = useRef(axiosClient.CancelToken.source());

//   // selection (for blue border like your design)
//   const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
//     null
//   );

//   // get token once and cache in ref
//   const loadToken = useCallback(async () => {
//     try {
//       const t = await AsyncStorage.getItem("authToken");
//       tokenRef.current = t;
//       return t;
//     } catch {
//       tokenRef.current = null;
//       return null;
//     }
//   }, []);

//   const fetchCategories = useCallback(
//     async (isRefresh = false) => {
//       if (!isRefresh) setLoading(true);
//       try {
//         // ensure token is loaded
//         if (tokenRef.current === null) {
//           await loadToken();
//         }
//         cancelSourceRef.current = axiosClient.CancelToken.source();

//         const res = await axiosClient.get(
//           `${BASE_URL}/api/category/categories-with-menus`,
//           {
//             // headers: tokenRef.current
//             //   ? { Authorization: `Bearer ${tokenRef.current}` }
//             //   : undefined,
//             cancelToken: cancelSourceRef.current.token,
//             timeout: 15000,
//           }
//         );
// // console.log(res.data);

//         // Validate response shape
//         const data = Array.isArray(res?.data?.data) ? res.data.data : [];
//         // console.log(data);
        
//         setCategories(data);
//       } catch (err: any) {
//         if (!axiosClient.isCancel(err)) {
//           console.warn("fetchCategories error:", err?.message ?? err);
//         }
//       } finally {
//         if (isRefresh) setRefreshing(false);
//         else setLoading(false);
//       }
//     },
//     [loadToken]
//   );

//   useEffect(() => {
//     fetchCategories();

//     return () => {
//       // cancel pending requests on unmount
//       cancelSourceRef.current?.cancel("Component unmounted");
//     };
//   }, [fetchCategories]);

//   // pull to refresh
//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     // cancel any running request and create new token
//     cancelSourceRef.current.cancel("User initiated refresh");
//     cancelSourceRef.current = axiosClient.CancelToken.source();
//     fetchCategories(true);
//   }, [fetchCategories]);

//   // memoized filtered list
//   const filteredCategories = useMemo(() => {
//     const q = debouncedQuery.toLowerCase();
//     if (!q) return categories;
//     return categories.filter((c) =>
//       (c.categoryName ?? "").toLowerCase().includes(q)
//     );
//   }, [categories, debouncedQuery]);

//   // press handler - memoized so child don't re-render unnecessarily
//   const onPressCategory = useCallback(
//     (id: number, name?: string) => {
//       setSelectedCategoryId(id);
//       // navigate to category detail (adjust route if different)
//       navigation.navigate("categoryDetailScreen", { categoryId: id, categoryName: name });
//     },
//     [navigation]
//   );

//   // renderItem (use stable function)
//   const renderItem = useCallback(
//     ({ item }: { item: CategoryType }) => (
//       <CategoryCard
//         item={item}
//         selected={selectedCategoryId === item.categoryId}
//         onPress={onPressCategory}
//       />
//     ),
//     [onPressCategory, selectedCategoryId]
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar
//         barStyle="dark-content"
//         backgroundColor="#fff"
//         translucent={false}
//       />
//       {/* Header */}
// <CommonHeader title="All Categories" />

// <View style={{marginHorizontal:wp(4),marginTop:hp(1.5)}}>

//       {/* Search Bar */}
// <CommonSearchBar
//   value={query}
//   onChangeText={setQuery}
//   placeholder="Search for tea, Coffee, Snacks..."
  
// />
// </View>

//       {loading && categories.length === 0 ? (
//         <ActivityIndicator
//           size="large"
//           color={theme.PRIMARY_COLOR}
//           style={{ marginTop: hp(8) }}
//         />
//       ) : (
//         <FlatList
//           data={filteredCategories}
//           keyExtractor={(item) => item.categoryId.toString()}
//           renderItem={renderItem}
//           numColumns={2}
//           columnWrapperStyle={styles.columnWrapper}
//           contentContainerStyle={styles.listContent}
//           showsVerticalScrollIndicator={false}
//           initialNumToRender={6}
//           maxToRenderPerBatch={6}
//           windowSize={7}
//           removeClippedSubviews={Platform.OS === "android"}
//           updateCellsBatchingPeriod={50}
//           refreshControl={
//             <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//           }
//           ListEmptyComponent={() =>
//             !loading ? (
//               <View style={styles.emptyContainer}>
//                 <Text style={styles.emptyText}>No categories found</Text>
//               </View>
//             ) : null
//           }
//         />
//       )}
//     </SafeAreaView>
//   );
// };

// export default ViewAllCategoryScreen;

// /** --- Styles --- **/
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff" },

//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: wp(4),
//     paddingVertical: hp(1.5),
//     backgroundColor: "#fff",
//   },
//   headerTitle: {
//     fontSize: hp(2.4),
//     fontWeight: "600",
//     marginLeft: wp(3),
//     color: theme.PRIMARY_COLOR,
//   },

//   searchContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#F2F2F2",
//     marginHorizontal: wp(4),
//     borderRadius: wp(3),
//     paddingHorizontal: wp(3),
//     marginTop: hp(1.5),
//     height: hp(5.5),
//   },
//   searchInput: {
//     flex: 1,
//     marginLeft: wp(2),
//     fontSize: hp(1.8),
//     color: "#333",
//     paddingVertical: 0,
//   },

//   listContent: {
//     paddingHorizontal: wp(4),
//     paddingTop: hp(2),
//     paddingBottom: hp(10),
//   },

//   columnWrapper: {
//     justifyContent: "space-between",
//     marginBottom: hp(1),
//   },

//   categoryCard: {
//     width: wp(42),
//     backgroundColor: "#FAFAFA",
//     borderRadius: wp(3),
//     paddingVertical: hp(2),
//     marginBottom: hp(2),
//     alignItems: "center",
//     justifyContent: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 3,
//     elevation: 2,
//     borderWidth: 1,
//     borderColor: "transparent",
//   },
//   categoryCardSelected: {
//     borderColor: theme.PRIMARY_COLOR, // blue outline
//     borderWidth: 2,
//     shadowOpacity: 0.08,
//   },

//   categoryImage: {
//     width: wp(20),
//     height: wp(20),
//     marginBottom: hp(1),
//   },
//   categoryTitle: {
//     fontSize: hp(2),
//     fontWeight: "600",
//     color: "#333",
//   },
//   categorySubtitle: {
//     fontSize: hp(1.6),
//     color: "#888",
//     marginTop: hp(0.5),
//   },
//   categoryCount: {
//     fontSize: hp(1.5),
//     color: theme.PRIMARY_COLOR,
//     marginTop: hp(0.5),
//   },

//   emptyContainer: {
//     paddingTop: hp(6),
//     alignItems: "center",
//   },
//   emptyText: {
//     color: "#666",
//     fontSize: hp(1.8),
//   },
// });
// src/screens/ViewAllCategoryScreen.tsx
// import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   Pressable,
//   Image,
//   ActivityIndicator,
//   SafeAreaView,
//   StatusBar,
//   RefreshControl,
//   Platform,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import axios from "axios";
// import { hp, wp } from "@/src/assets/utils/responsive";
// import theme from "@/src/assets/colors/theme";
// import { BASE_URL } from "@/api";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import { ParamListBase, useNavigation } from "@react-navigation/native";
// import axiosClient from "@/src/api/client";
// import CommonHeader from "@/src/Common/CommonHeader";
// import CommonSearchBar from "@/src/Common/CommonSearchBar";
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withSpring,
//   withTiming,
//   Easing,
// } from "react-native-reanimated";
// import { LinearGradient } from "expo-linear-gradient";

// /* ---------------- Types ---------------- */
// export type MenuItem = {
//   menuId: number;
//   menuName?: string;
//   imageUrl?: string;
//   price?: string;
//   isAvailable?: number;
// };

// export type CategoryType = {
//   categoryId: number;
//   categoryName: string;
//   categoryImage?: string;
//   menus?: MenuItem[];
//   is_global?: number;
//   shop_id?: number;
// };

// /* ---------------- Constants ---------------- */
// const CARD_SPACING = wp(4);
// const CARD_WIDTH = Math.round((wp(100) - CARD_SPACING * 3) / 2); // two columns with side paddings
// const PLACEHOLDER_IMAGE = require("@/src/assets/images/onBoard1.png");

// /* ---------------- CategoryCard (memoized + animated) ---------------- */
// const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// const CategoryCard: React.FC<{
//   item: CategoryType;
//   selected?: boolean;
//   onPress: (c: CategoryType) => void;
// }> = React.memo(({ item, selected = false, onPress }) => {
//   const scale = useSharedValue(1);

//   const aStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: scale.value }],
//   }), []);

//   const handlePressIn = () => {
//     scale.value = withSpring(0.96, { stiffness: 400, damping: 20 });
//   };
//   const handlePressOut = () => {
//     scale.value = withSpring(1, { stiffness: 350, damping: 20 });
//   };
//   const handlePress = () => {
//     // small tap feedback: quick brighten (we animate a local opacity via timing)
//     scale.value = withTiming(0.98, { duration: 120, easing: Easing.out(Easing.quad) }, () => {
//       scale.value = withSpring(1, { stiffness: 380, damping: 20 });
//     });
//     onPress(item);
//   };

//   return (
//     <AnimatedPressable
//       onPressIn={handlePressIn}
//       onPressOut={handlePressOut}
//       onPress={handlePress}
//       style={[styles.categoryCard, selected && styles.categoryCardSelected]}
//       accessibilityRole="button"
//       accessibilityLabel={`Category ${item.categoryName}`}
//     >
//       <Animated.View style={[aStyle, { width: CARD_WIDTH, alignItems: "center" }]}>
//         <LinearGradient
//           colors={["rgba(255,255,255,0.98)", "rgba(250,245,240,0.98)"]}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 1 }}
//           style={styles.cardInner}
//         >
//           <Image
//             source={
//               item.categoryImage
//                 ? { uri: `${BASE_URL}/uploads/categories/${item.categoryImage}` }
//                 : PLACEHOLDER_IMAGE
//             }
//             style={styles.categoryImage}
//             resizeMode="cover"
//             accessible
//             accessibilityLabel={`${item.categoryName} image`}
//             onError={() => {}}
//           />

//           <Text style={styles.categoryTitle} numberOfLines={1}>
//             {item.categoryName}
//           </Text>

//           <Text style={styles.categoryCount}>{(item.menus?.length ?? 0) + " items"}</Text>
//         </LinearGradient>
//       </Animated.View>
//     </AnimatedPressable>
//   );
// }, (a, b) => (
//   a.item.categoryId === b.item.categoryId &&
//   (a.item.menus?.length ?? 0) === (b.item.menus?.length ?? 0) &&
//   a.selected === b.selected
// ));

// CategoryCard.displayName = "CategoryCard";

// /* ---------------- Screen ---------------- */
// const ViewAllCategoryScreen: React.FC = () => {
//   const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

//   const [categories, setCategories] = useState<CategoryType[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [refreshing, setRefreshing] = useState<boolean>(false);

//   const [query, setQuery] = useState<string>("");
//   const [debouncedQuery, setDebouncedQuery] = useState<string>("");
//   // simple debounce using timeout
//   useEffect(() => {
//     const id = setTimeout(() => setDebouncedQuery(query.trim()), 300);
//     return () => clearTimeout(id);
//   }, [query]);

//   const cancelRef = useRef(axiosClient.CancelToken.source());
//   const tokenRef = useRef<string | null>(null);

//   // selected highlight
//   const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

//   // load token if needed (kept for future auth)
//   useEffect(() => {
//     (async () => {
//       try {
//         tokenRef.current = await AsyncStorage.getItem("authToken");
//       } catch {
//         tokenRef.current = null;
//       }
//     })();
//   }, []);

//   const fetchCategories = useCallback(async (opts: { refresh?: boolean } = {}) => {
//     if (!opts.refresh) setLoading(true);
//     try {
//       // cancel previous
//       cancelRef.current?.cancel?.("new-request");
//       cancelRef.current = axiosClient.CancelToken.source();

//       const res = await axiosClient.get("/api/category/categories-with-menus", {
//         cancelToken: cancelRef.current.token,
//         timeout: 15000,
//       });

//       // normalize payload (server sometimes nests under data)
//       const payload = Array.isArray(res?.data?.data)
//         ? res.data.data
//         : Array.isArray(res?.data)
//         ? res.data
//         : [];

//       setCategories(payload);
//     } catch (err: any) {
//       if (!axios.isCancel(err)) {
//         console.warn("fetchCategories error:", err?.message ?? err);
//       }
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchCategories();
//     return () => {
//       cancelRef.current?.cancel?.("component-unmount");
//     };
//   }, [fetchCategories]);

//   // pull-to-refresh
//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     cancelRef.current?.cancel?.("user-refresh");
//     cancelRef.current = axiosClient.CancelToken.source();
//     fetchCategories({ refresh: true });
//   }, [fetchCategories]);

//   // filtered categories
//   const filtered = useMemo(() => {
//     const q = debouncedQuery.toLowerCase();
//     if (!q) return categories;
//     return categories.filter((c) => (c.categoryName ?? "").toLowerCase().includes(q));
//   }, [categories, debouncedQuery]);

//   // handlers
//   const onPressCategory = useCallback((cat: CategoryType) => {
//     setSelectedCategoryId(cat.categoryId);
//     navigation.navigate("categoryDetailScreen" as never, { categoryId: cat.categoryId, categoryName: cat.categoryName } as never);
//   }, [navigation]);

//   const renderItem = useCallback(({ item }: { item: CategoryType }) => (
//     <CategoryCard item={item} selected={selectedCategoryId === item.categoryId} onPress={onPressCategory} />
//   ), [onPressCategory, selectedCategoryId]);

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar backgroundColor="#fff" barStyle="dark-content" translucent={false} />

//       <CommonHeader
//         title="All Categories"
//         // optional: show back button by default; CommonHeader should handle it
//       />

//       <View style={{ paddingHorizontal: wp(4), marginTop: hp(1) }}>
//         <CommonSearchBar
//           value={query}
//           onChangeText={setQuery}
//           placeholder="Search categories, snacks, tea..."
//           showClear
//           // enableTicker={false}
//           // containerStyle={{}}
//         />
//       </View>

//       {loading && categories.length === 0 ? (
//         <View style={styles.centered}>
//           <ActivityIndicator size="large" color={theme.PRIMARY_COLOR} />
//         </View>
//       ) : (
//         <FlatList
//           data={filtered}
//           renderItem={renderItem}
//           keyExtractor={(it) => String(it.categoryId)}
//           numColumns={2}
//           columnWrapperStyle={styles.columnWrapper}
//           contentContainerStyle={styles.listContent}
//           showsVerticalScrollIndicator={false}
//           initialNumToRender={6}
//           maxToRenderPerBatch={8}
//           windowSize={9}
//           removeClippedSubviews={Platform.OS === "android"}
//           updateCellsBatchingPeriod={50}
//           refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.PRIMARY_COLOR} />}
//           ListEmptyComponent={() =>
//             !loading ? (
//               <View style={styles.emptyContainer}>
//                 <Image source={PLACEHOLDER_IMAGE} style={styles.emptyIllustration} resizeMode="contain" />
//                 <Text style={styles.emptyText}>No categories found</Text>
//                 <Text style={styles.emptySub}>Try a different search or check back later</Text>
//               </View>
//             ) : null
//           }
//         />
//       )}
//     </SafeAreaView>
//   );
// };

// export default ViewAllCategoryScreen;

// /* ---------------- Styles ---------------- */
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff" },

//   centered: { flex: 1, alignItems: "center", justifyContent: "center" },

//   listContent: {
//     paddingHorizontal: CARD_SPACING,
//     paddingTop: hp(2),
//     paddingBottom: hp(6),
//   },
//   columnWrapper: {
//     justifyContent: "space-between",
//     marginBottom: hp(1.6),
//   },

//   categoryCard: {
//     width: CARD_WIDTH,
//     borderRadius: wp(3),
//     overflow: "hidden",
//     alignItems: "center",
//     justifyContent: "flex-start",
//   },
//   categoryCardSelected: {
//     borderWidth: 2,
//     borderColor: theme.PRIMARY_COLOR,
//     shadowColor: theme.PRIMARY_COLOR,
//     shadowOpacity: 0.08,
//     shadowRadius: 8,
//     elevation: 3,
//   },

//   cardInner: {
//     width: "100%",
//     paddingVertical: hp(2),
//     alignItems: "center",
//     justifyContent: "flex-start",
//   },

//   categoryImage: {
//     width: CARD_WIDTH * 0.66,
//     height: CARD_WIDTH * 0.66,
//     borderRadius: wp(3),
//     marginBottom: hp(1),
//     backgroundColor: "#f6f6f6",
//   },
//   categoryTitle: {
//     fontSize: hp(2.0),
//     fontWeight: "700",
//     color: "#222",
//     textAlign: "center",
//   },
//   categoryCount: {
//     fontSize: hp(1.5),
//     color: theme.PRIMARY_COLOR,
//     marginTop: hp(0.6),
//     fontWeight: "700",
//   },

//   emptyContainer: {
//     paddingTop: hp(10),
//     alignItems: "center",
//   },
//   emptyIllustration: {
//     width: wp(40),
//     height: wp(34),
//     marginBottom: hp(2),
//     tintColor: "#ccc",
//   },
//   emptyText: {
//     fontSize: hp(2.0),
//     color: "#444",
//     fontWeight: "700",
//   },
//   emptySub: {
//     marginTop: hp(1),
//     fontSize: hp(1.6),
//     color: "#777",
//   },
// });
// ViewAllCategoryScreen.tsx
// import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   Pressable,
//   Image,
//   ActivityIndicator,
//   StatusBar,
//   RefreshControl,
//   Platform,
//   TextInput,
//   useWindowDimensions,
//   Keyboard,
//   SafeAreaView,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import axios from "axios";
// import { hp, wp } from "@/src/assets/utils/responsive";
// import theme from "@/src/assets/colors/theme";
// import { BASE_URL } from "@/api";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import { ParamListBase, useNavigation } from "@react-navigation/native";
// import axiosClient from "@/src/api/client";
// import CommonHeader from "@/src/Common/CommonHeader";
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   withSpring,
//   Easing,
// } from "react-native-reanimated";
// import { LinearGradient } from "expo-linear-gradient";
// import CommonStatusHeader from "@/src/Common/CommonStatusHeader";

// /* ---------------- Types ---------------- */
// export type MenuItem = {
//   menuId: number;
//   menuName?: string;
//   imageUrl?: string;
//   price?: string;
//   isAvailable?: number;
// };

// export type CategoryType = {
//   categoryId: number;
//   categoryName: string;
//   categoryImage?: string;
//   menus?: MenuItem[];
//   is_global?: number;
//   shop_id?: number;
// };

// /* ---------------- Constants ---------------- */
// const CARD_SPACING = wp(4);
// const CARD_WIDTH = Math.round((wp(100) - CARD_SPACING * 3) / 2); // two columns with side paddings
// const PLACEHOLDER_IMAGE = require("@/src/assets/images/onBoard1.png");

// /* ---------------- CategoryCard (memoized + animated) ---------------- */
// const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// const CategoryCard: React.FC<{
//   item: CategoryType;
//   selected?: boolean;
//   onPress: (c: CategoryType) => void;
// }> = React.memo(
//   ({ item, selected = false, onPress }) => {
//     const scale = useSharedValue(1);
//     const aStyle = useAnimatedStyle(
//       () => ({
//         transform: [{ scale: scale.value }],
//       }),
//       []
//     );

//     const handlePressIn = () => {
//       scale.value = withSpring(0.96, { stiffness: 400, damping: 20 });
//     };
//     const handlePressOut = () => {
//       scale.value = withSpring(1, { stiffness: 350, damping: 20 });
//     };
//     const handlePress = () => {
//       scale.value = withTiming(0.98, { duration: 120, easing: Easing.out(Easing.quad) }, () => {
//         scale.value = withSpring(1, { stiffness: 380, damping: 20 });
//       });
//       onPress(item);
//     };

//     return (
//       <AnimatedPressable
//         onPressIn={handlePressIn}
//         onPressOut={handlePressOut}
//         onPress={handlePress}
//         style={[styles.categoryCard, selected && styles.categoryCardSelected]}
//         accessibilityRole="button"
//         accessibilityLabel={`Category ${item.categoryName}`}
//       >
//         <Animated.View style={[aStyle, { width: CARD_WIDTH, alignItems: "center" }]}>
//           <LinearGradient
//             colors={["rgba(255,255,255,0.98)", "rgba(250,245,240,0.98)"]}
//             start={{ x: 0, y: 0 }}
//             end={{ x: 1, y: 1 }}
//             style={styles.cardInner}
//           >
//             <Image
//               source={
//                 item.categoryImage ? { uri: `${BASE_URL}/uploads/categories/${item.categoryImage}` } : PLACEHOLDER_IMAGE
//               }
//               style={styles.categoryImage}
//               resizeMode="cover"
//               accessible
//               accessibilityLabel={`${item.categoryName} image`}
//               onError={() => {}}
//             />

//             <Text style={styles.categoryTitle} numberOfLines={1}>
//               {item.categoryName}
//             </Text>

//             <Text style={styles.categoryCount}>{(item.menus?.length ?? 0) + " items"}</Text>
//           </LinearGradient>
//         </Animated.View>
//       </AnimatedPressable>
//     );
//   },
//   (a, b) =>
//     a.item.categoryId === b.item.categoryId &&
//     (a.item.menus?.length ?? 0) === (b.item.menus?.length ?? 0) &&
//     a.selected === b.selected
// );

// CategoryCard.displayName = "CategoryCard";

// /* ---------------- Screen ---------------- */
// const ViewAllCategoryScreen: React.FC = () => {
//   const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
//   const { width } = useWindowDimensions();

//   // Responsive sizes (keeps your original look but scales)
//   const FONT_SIZE = Math.max(13, Math.round(wp(3.6)));
//   const INPUT_ITEM_HEIGHT = Math.round(hp(2.6));
//   const ITEM_IMAGE_SIZE = Math.round(hp(5.2));

//   const [categories, setCategories] = useState<CategoryType[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [refreshing, setRefreshing] = useState<boolean>(false);

//   const [query, setQuery] = useState<string>("");
//   const [debouncedQuery, setDebouncedQuery] = useState<string>("");
//   useEffect(() => {
//     const id = setTimeout(() => setDebouncedQuery(query.trim()), 300);
//     return () => clearTimeout(id);
//   }, [query]);

//   const cancelRef = useRef(axiosClient.CancelToken.source());
//   const tokenRef = useRef<string | null>(null);

//   const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

//   useEffect(() => {
//     (async () => {
//       try {
//         tokenRef.current = await AsyncStorage.getItem("authToken");
//       } catch {
//         tokenRef.current = null;
//       }
//     })();
//   }, []);

//   const fetchCategories = useCallback(async (opts: { refresh?: boolean } = {}) => {
//     if (!opts.refresh) setLoading(true);
//     try {
//       cancelRef.current?.cancel?.("new-request");
//       cancelRef.current = axiosClient.CancelToken.source();

//       const res = await axiosClient.get("/api/category/categories-with-menus", {
//         cancelToken: cancelRef.current.token,
//         timeout: 15000,
//       });

//       const payload = Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : [];
//       setCategories(payload);
//     } catch (err: any) {
//       if (!axios.isCancel(err)) {
//         console.warn("fetchCategories error:", err?.message ?? err);
//       }
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchCategories();
//     return () => cancelRef.current?.cancel?.("component-unmount");
//   }, [fetchCategories]);

//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     cancelRef.current?.cancel?.("user-refresh");
//     cancelRef.current = axiosClient.CancelToken.source();
//     fetchCategories({ refresh: true });
//   }, [fetchCategories]);

//   const filtered = useMemo(() => {
//     const q = debouncedQuery.toLowerCase();
//     if (!q) return categories;
//     return categories.filter((c) => (c.categoryName ?? "").toLowerCase().includes(q));
//   }, [categories, debouncedQuery]);

//   const onPressCategory = useCallback(
//     (cat: CategoryType) => {
//       setSelectedCategoryId(cat.categoryId);
//       navigation.navigate("categoryDetailScreen" as never, { categoryId: cat.categoryId, categoryName: cat.categoryName } as never);
//     },
//     [navigation]
//   );

//   const renderItem = useCallback(
//     ({ item }: { item: CategoryType }) => (
//       <CategoryCard item={item} selected={selectedCategoryId === item.categoryId} onPress={onPressCategory} />
//     ),
//     [onPressCategory, selectedCategoryId]
//   );

//   /* ---------------- Search ticker animation (same as SearchScreen) ---------------- */
//   const tickerItems = useMemo(() => [...["tea", "coffee", "snacks", "chai", "cold coffee", "iced tea"], "tea"], []);
//   const tickerCount = tickerItems.length;
//   const tickerIndexRef = useRef<number>(0);
//   const tickerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const translateY = useSharedValue(0);
//   const tickerAnimStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }), []);

//   const inputRef = useRef<TextInput | null>(null);
//   const [focused, setFocused] = useState(false);

//   useEffect(() => {
//     const start = () => {
//       if (tickerIntervalRef.current) return;
//       tickerIntervalRef.current = setInterval(() => {
//         if (query.trim().length > 0 || focused) return;
//         const next = tickerIndexRef.current + 1;
//         translateY.value = withTiming(-next * INPUT_ITEM_HEIGHT, { duration: 420 });
//         tickerIndexRef.current = next;
//         if (next === tickerCount - 1) {
//           // reset after animation to make seamless loop
//           setTimeout(() => {
//             tickerIndexRef.current = 0;
//             translateY.value = withTiming(0, { duration: 0 });
//           }, 420 + 20);
//         }
//       }, 2500);
//     };
//     start();
//     return () => {
//       if (tickerIntervalRef.current) {
//         clearInterval(tickerIntervalRef.current);
//         tickerIntervalRef.current = null;
//       }
//     };
//   }, [translateY, query, focused, INPUT_ITEM_HEIGHT, tickerCount]);

//   useEffect(() => {
//     return () => {
//       if (tickerIntervalRef.current) {
//         clearInterval(tickerIntervalRef.current);
//         tickerIntervalRef.current = null;
//       }
//     };
//   }, []);

//   // ensure TextInput focuses on first tap (defensive)
//   const handleInputTouch = useCallback(() => {
//     inputRef.current?.focus();
//   }, []);

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* <StatusBar backgroundColor="#fff" barStyle="dark-content" translucent={false} /> */}


//       {/* <CommonHeader title="All Categories" /> */}
//       <CommonStatusHeader   title="All Categories" bgColor="#F5DEB3"/>
//       {/* Search area with animated ticker inside input (non-interactive) */}
//       <View style={{ paddingHorizontal: wp(5), marginTop: hp(2) }}>
//         <View style={styles.searchCard}>
//           <Ionicons name="search" size={Math.round(FONT_SIZE * 1.05)} color="#7e6b9a" style={{ marginRight: 8 }} />
//           <View style={{ flex: 1 }}>
//             <TextInput
//               ref={inputRef}
//               value={query}
//               onChangeText={setQuery}
//               // placeholder="Search categories, snacks, tea..."
//               placeholderTextColor="#7f7a8b"
//               style={[styles.searchInput, { fontSize: FONT_SIZE }]}
//               returnKeyType="search"
//               onSubmitEditing={() => {
//                 // allow user to submit by keyboard -- we already have debounce outside
//                 Keyboard.dismiss();
//               }}
//               onFocus={() => setFocused(true)}
//               onBlur={() => setFocused(false)}
//               onTouchStart={handleInputTouch}
//               underlineColorAndroid="transparent"
//               autoCorrect={false}
//               autoCapitalize="none"
//             />

//             {/* ticker overlay: non-interactive so taps reach TextInput */}
//             {!query.trim() && !focused ? (
//               <View pointerEvents="none" style={[styles.tickerTouch, { top: Platform.OS === "android" ? 8 : 9, bottom: Platform.OS === "android" ? 10 : 9 }]}>
//                 <View style={[styles.tickerClip, { height: INPUT_ITEM_HEIGHT }]}>
//                   <Animated.View style={[tickerAnimStyle]}>
//                     {tickerItems.map((w, i) => (
//                       <View key={w + i} style={{ height: INPUT_ITEM_HEIGHT, justifyContent: "center" }}>
//                         <Text style={[styles.tickerText, { fontSize: FONT_SIZE }]} numberOfLines={1}>
//                           {w}
//                         </Text>
//                       </View>
//                     ))}
//                   </Animated.View>
//                 </View>
//               </View>
//             ) : null}
//           </View>

//           {query ? (
//             <Pressable
//               onPress={() => {
//                 setQuery("");
//               }}
//               accessibilityRole="button"
//               style={{ marginLeft: 8 }}
//             >
//               <Ionicons name="close-circle" size={Math.round(FONT_SIZE * 1.1)} color="#7e6b9a" />
//             </Pressable>
//           ) : null}
//         </View>
//       </View>

//       {loading && categories.length === 0 ? (
//         <View style={styles.centered}>
//           <ActivityIndicator size="large" color={theme.PRIMARY_COLOR} />
//         </View>
//       ) : (
//         <FlatList
//           data={filtered}
//           renderItem={renderItem}
//           keyExtractor={(it) => String(it.categoryId)}
//           numColumns={2}
//           columnWrapperStyle={styles.columnWrapper}
//           contentContainerStyle={styles.listContent}
//           showsVerticalScrollIndicator={false}
//           initialNumToRender={6}
//           maxToRenderPerBatch={8}
//           windowSize={9}
//           removeClippedSubviews={Platform.OS === "android"}
//           updateCellsBatchingPeriod={50}
//           refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.PRIMARY_COLOR} />}
//           ListEmptyComponent={() =>
//             !loading ? (
//               <View style={styles.emptyContainer}>
//                 <Image source={PLACEHOLDER_IMAGE} style={styles.emptyIllustration} resizeMode="contain" />
//                 <Text style={styles.emptyText}>No categories found</Text>
//                 <Text style={styles.emptySub}>Try a different search or check back later</Text>
//               </View>
//             ) : null
//           }
//           keyboardShouldPersistTaps="handled"
//         />
//       )}
//     </SafeAreaView>
//   );
// };

// export default ViewAllCategoryScreen;

// /* ---------------- Styles ---------------- */
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff", },

//   centered: { flex: 1, alignItems: "center", justifyContent: "center" },

//   listContent: {
//     paddingHorizontal: CARD_SPACING,
//     paddingTop: hp(2),
//     paddingBottom: hp(6),
//   },
//   columnWrapper: {
//     justifyContent: "space-between",
//     marginBottom: hp(1.6),
//   },

//   categoryCard: {
//     width: CARD_WIDTH,
//     borderRadius: wp(3),
//     overflow: "hidden",
//     alignItems: "center",
//     justifyContent: "flex-start",
//   },
//   categoryCardSelected: {
//     borderWidth: 2,
//     borderColor: theme.PRIMARY_COLOR,
//     shadowColor: theme.PRIMARY_COLOR,
//     shadowOpacity: 0.08,
//     shadowRadius: 8,
//     elevation: 3,
//   },

//   cardInner: {
//     width: "100%",
//     paddingVertical: hp(2),
//     alignItems: "center",
//     justifyContent: "flex-start",
//   },

//   categoryImage: {
//     width: CARD_WIDTH * 0.66,
//     height: CARD_WIDTH * 0.66,
//     borderRadius: wp(3),
//     marginBottom: hp(1),
//     backgroundColor: "#f6f6f6",
//   },
//   categoryTitle: {
//     fontSize: hp(2.0),
//     fontWeight: "700",
//     color: "#222",
//     textAlign: "center",
//   },
//   categoryCount: {
//     fontSize: hp(1.5),
//     color: theme.PRIMARY_COLOR,
//     marginTop: hp(0.6),
//     fontWeight: "700",
//   },

//   emptyContainer: {
//     paddingTop: hp(10),
//     alignItems: "center",
//   },
//   emptyIllustration: {
//     width: wp(40),
//     height: wp(34),
//     marginBottom: hp(2),
//     tintColor: "#ccc",
//   },
//   emptyText: {
//     fontSize: hp(2.0),
//     color: "#444",
//     fontWeight: "700",
//   },
//   emptySub: {
//     marginTop: hp(1),
//     fontSize: hp(1.6),
//     color: "#777",
//   },

//   /* search card (matches previous look) */
//   searchCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     borderRadius: hp(1),
//     paddingHorizontal: 12,
//     paddingVertical: Platform.OS === "android" ? 12 : 14,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.06,
//     shadowRadius: 6,
//     elevation: 3,
//   },
//   searchInput: {
//     flex: 1,
//     paddingVertical: 0,
//     color: "#222",
//   },

//   /* ticker */
//   tickerTouch: {
//     position: "absolute",
//  left: 20,
//     right: 14,
//     justifyContent: "center",
//   },
//   tickerClip: {
//     overflow: "hidden",
//     justifyContent: "flex-start",
//   },
//   tickerText: {
//     color: "#7f7a8b",
//   },

//   /* leftover */
//   sectionHeader: {
//     paddingVertical: 8,
//     backgroundColor: "#fff",
//     paddingHorizontal: 12,
//   },
//   sectionTitle: { fontWeight: "700", color: "#222" },
//   item: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderBottomWidth: 0.5,
//     borderColor: "#eee",
//     paddingHorizontal: 12,
//   },
//   itemImage: {
//     borderRadius: 8,
//     backgroundColor: "#ddd",
//   },
//   itemPlaceholder: {
//     borderRadius: 8,
//     backgroundColor: "#eee",
//   },
//   itemText: { marginLeft: 12, flex: 1 },
//   itemTitle: { fontWeight: "600" },
//   itemSubtitle: { color: "#777", marginTop: 2 },
// });
// ViewAllCategoryScreen.tsx
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

