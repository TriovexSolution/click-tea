// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   Pressable,
//   Image,
//   TextInput,
// } from "react-native";
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { BASE_URL } from "@/api";
// import * as Location from "expo-location";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons } from "@expo/vector-icons";
// import {
//   useNavigation,
//   ParamListBase,
// } from "@react-navigation/native";
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import theme from "@/src/assets/colors/theme";
// import { hp, wp } from "@/src/assets/utils/responsive";
// import DividerWithText from "@/src/Common/DividerWithText";
// import SideMenuModal from "@/src/Common/SlideMenuModal";
// import { useDispatch, useSelector } from "react-redux";
// import { setSelectedShopId } from "@/src/Redux/Slice/selectedShopSlice";
// interface datatype{
// building_name:string;
// distance:number;
//  id: number,
//   is_open: number,
//    latitude: string;
//    longitude:string;
//    priority: number;
//     shopImage: string;
//      shopname: string;
// }
// const HomeScreen = () => {
//   const [searchText, setSearchText] = useState("");
//   const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

//   const [currentLocation, setCurrentLocation] = useState(null);
//   const [shops, setShops] = useState<datatype[]>([]);
//   const [page, setPage] = useState(1);
//   const [total, setTotal] = useState(0);
//   const [latitude, setLatitude] = useState(null);
//   const [longitude, setLongitude] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [sideMenuVisible, setSideMenuVisible] = useState(false);
//   const dispatch = useDispatch();
// useEffect(()=>{
// fetchShops()
// },[])
//   const fetchShops = async () => {
//     const token = await AsyncStorage.getItem("authToken");
//     setLoading(true);
//     try {
//               const lat = await AsyncStorage.getItem("user_lat");
//       const lng = await AsyncStorage.getItem("user_lng");
//       const res = await axios.get(`${BASE_URL}/api/shops/nearby`, {
//         params: {
//           lat,
//           lng,
//           onlyOpen: true,
//           limit: 10,
//         },
//         headers: { Authorization: `Bearer ${token}` },
//       });

//         setShops(res.data);
//     } catch (error) {
//       console.error("Error fetching shops:", error.message);
//     }
//     setLoading(false);
//   };

//   const handleLoadMore = () => {
//     if (shops.length < total && !loading) {
//       setPage((prev) => prev + 1);
//     }
//   };

//     const AnimatedShopCard = ({ item }:{item:datatype}) => {
//   //  console.log(item);

//     return (
//       // <View >
//         <Pressable style={[styles.cardWrapper]}  onPress={() => {
//                     dispatch(setSelectedShopId(item.id));
//                     navigation.navigate("shopDetailScreen");
//                   }}>

//           <View style={styles.innerCard}>
//             <Image source={{ uri:`${BASE_URL}/uploads/shops/${item.shopImage}`  }} style={styles.shopImage} />

//             <View style={styles.infoOverlay}>
//               <View style={styles.locationRow}>
//                 <Ionicons name="location-sharp" size={14} color="#fff" />
//                 <Text style={styles.locationText} numberOfLines={1}>
//                   {item.building_name}
//                 </Text>
//               </View>
//               <TouchableOpacity style={styles.heartBtn}>
//                 <Ionicons name="heart-outline" size={18} color="#fff" />
//               </TouchableOpacity>
//             </View>

//             <View
//               style={[
//                 styles.badgeContainer,
//                 { bottom: hp(9), left: 8, zIndex: 10 },
//               ]}
//             >
//               <Text
//                 style={[
//                   styles.statusBadge,
//                   item.is_open === 1 ? styles.open : styles.closed,
//                 ]}
//               >
//                 {item.is_open === 1 ? "Open Now" : "Closed"}
//               </Text>
//             </View>

//             <View style={styles.shopDetails}>
//               <Text style={styles.shopName} numberOfLines={1}>
//                 {item.shopname}
//               </Text>
//               <Text style={styles.distance}>
//                 {item.distance?.toFixed(4)} km away
//               </Text>
//             </View>

//             <View style={styles.ratingRow}>
//               {[...Array(5)].map((_, i) => (
//                 <Ionicons
//                   key={i}
//                   name="star"
//                   size={12}
//                   color={i < 4 ? "#FFC107" : "#ddd"}
//                 />
//               ))}
//               <Text style={styles.reviewCount}>(808)</Text>
//             </View>
//           </View>
//         </Pressable>
//       // </View>
//     );
//   };
//     const renderItem = ({ item }: any) => (
//     <AnimatedShopCard item={item} />
//   );
//   const renderHeader = () => (
//     <View style={{ backgroundColor: "white" }}>
//       <View
//         style={{
//           flexDirection: "row",
//           justifyContent: "space-between",
//           alignItems: "center",

//           marginTop: hp(1),
//         }}
//       >
//         <View style={{ flexDirection: "row", alignItems: "center" }}>
//           <Ionicons
//             size={hp(3.5)}
//             color={theme.PRIMARY_COLOR}
//             name="location-outline"
//           />
//           <View style={{ marginLeft: wp(2) }}>
//             <Text
//               style={{
//                 color: "#943400",
//                 fontFamily: "InriaSerif-Regular",
//                 fontSize: hp(2.3),
//                 letterSpacing: 0.5,
//               }}
//             >
//               Ahmedabad
//             </Text>
//             <Text
//               style={{
//                 color: "#943400",
//                 fontSize: hp(1.3),
//                 marginTop: hp(-0.7),
//               }}
//             >
//               Iscon Char Rasta Previlon
//             </Text>
//           </View>
//         </View>
//         <Pressable>
//           <Ionicons
//             name="notifications-outline"
//             size={hp(3.5)}
//             color={theme.PRIMARY_COLOR}
//           />
//         </Pressable>
//       </View>
//       <View style={styles.searchRow}>
//         <Pressable onPress={() => setSideMenuVisible(true)}>
//           <Ionicons name="menu" color={theme.PRIMARY_COLOR} size={hp(3.5)}/>
//         </Pressable>
//         <Pressable

//           style={styles.searchBox}

//         >
//           <Ionicons
//             name="search"
//             size={hp(2)}
//             color={"#943400"}
//             style={{ marginRight: wp(2) }}
//           />
//           <TextInput
//             // onPress={() => navigation.navigate("searchScreen2")}
//                     pointerEvents="none"

//             placeholder="What are you looking for? ......"
//             placeholderTextColor={theme.PRIMARY_COLOR}
//             style={styles.searchInput}
//             value={searchText}
//             onChangeText={(text) => {
//               setPage(1);
//               setSearchText(text);
//             }}
//           />
//           {searchText.length > 0 && (
//             <Pressable
//               onPress={() => {
//                 setPage(1);
//                 setSearchText("");
//               }}
//             >
//               <Ionicons
//                 name="close-outline"
//                 size={hp(2)}
//                 color={theme.PRIMARY_COLOR}
//               />
//             </Pressable>
//           )}
//         </Pressable>
//       </View>
//       {/* <BannerCarousel /> */}
//       <DividerWithText text="Near By Shops" />
//       {shops.length === 0 ? (
//         <View style={styles.noShopContainer}>
//           <Text style={styles.noShopTitle}>No Nearby Shops Available</Text>
//           <Text style={styles.noShopSubtitle}>
//             Try changing your location or zooming out to explore more shops
//             around.
//           </Text>
//         </View>
//       ) : (
//         <FlatList
//           data={shops}
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           keyExtractor={(item, index) =>
//             item?.id ? item.id.toString() : index.toString()
//           }
//           renderItem={renderItem}
//         />
//       )}

//     </View>
//   );

//   return (

//     <View style={styles.container}>
// <FlatList
// data={[{}]}
// keyExtractor={(_,index)=>index.toString()}
// renderItem={()=>null}
// ListHeaderComponent={renderHeader}
// ListEmptyComponent={
//   <View style={{justifyContent:"center",alignItems:"center"}}>
//      <Text style={{color:"pink"}}>No items to display yet.</Text>
//   </View>
// }
// contentContainerStyle={{ paddingBottom: hp(15) }}/>
//       <SideMenuModal
//         visible={sideMenuVisible}
//         onClose={() => setSideMenuVisible(false)}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "white",
//     padding:wp(4)
//   },
//   cardWrapper: {
//     marginRight: 10,
//     width: 170,
//     borderRadius: 10,
//     borderColor: "#943400",
//     borderWidth: 1,
//     marginTop: hp(1.5),
//   },
//   innerCard: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     overflow: "hidden",
//     margin: 10,
//     marginTop: hp(1.3),
//   },
//   shopImage: {
//     height: hp(15),
//     width: "100%",
//     borderWidth: 2,
//     borderRadius: 10,
//     borderColor: "#943400",
//   },
//   infoOverlay: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     padding: 8,
//     backgroundColor: "rgba(0,0,0,0.3)",
//   },
//   locationRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     flex: 1,
//     marginBottom: hp(1.5),
//   },
//   locationText: {
//     color: "white",
//     fontSize: 12,
//     marginLeft: 4,
//     flexShrink: 1,
//   },
//   heartBtn: {
//     backgroundColor: "rgba(255,255,255,0.3)",
//     padding: 4,
//     borderRadius: 20,
//   },
//   shopDetails: {
//     flexDirection: "column",
//     justifyContent: "space-between",
//   },
//   shopName: {
//     fontSize: 15,
//     color: "#943400",
//     fontFamily: theme.PRIMARY_FONT_FAMILY,
//     paddingTop: hp(0.5),
//   },
//   distance: {
//     fontSize: 12,
//     color: theme.PRIMARY_COLOR,
//   },
//   ratingRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 10,
//     paddingLeft: wp(0.2),
//     paddingTop: hp(0.3),
//   },
//   reviewCount: {
//     fontSize: 11,
//     color: "#999",
//     marginLeft: 6,
//   },
//   badgeContainer: {
//     position: "absolute",
//     bottom: hp(7),
//     left: 8,
//     zIndex: 10,
//   },
//   statusBadge: {
//     fontSize: 11,
//     paddingVertical: 2,
//     paddingHorizontal: 8,
//     borderRadius: 12,
//     fontWeight: "600",
//     overflow: "hidden",
//     alignSelf: "flex-start",
//     color: "#fff",
//   },
//   open: {
//     backgroundColor: "#4CAF50",
//   },
//   closed: {
//     backgroundColor: "#F44336",
//   },
//     searchRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginTop: hp(1.5),
//     alignSelf: "center",
//     width: "100%",
//   },
//   searchBox: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "white",
//     borderRadius: 10,
//     borderWidth: hp(0.2),
//     borderColor: "#943400",
//     paddingHorizontal: wp(3),
//     height: hp(4.2),
//     width: "90%",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   searchInput: {
//     fontSize: 15,
//     color: theme.PRIMARY_COLOR,
//     paddingVertical: 0,
//     includeFontPadding: false,
//     textAlignVertical: "center",
//     paddingTop: hp(0.1),
//     fontFamily: theme.PRIMARY_FONT_FAMILY,
//     letterSpacing: 0.8,
//   },
//   noShopContainer: {
//     height: hp(8),
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     fontFamily: theme.PRIMARY_FONT_FAMILY,
//     marginTop: hp(1),
//   },
//   noShopTitle: {
//     fontSize: hp(1.5),
//     fontWeight: "bold",
//     color: "#444",
//     fontFamily: theme.PRIMARY_FONT_FAMILY,
//   },
//   noShopSubtitle: {
//     fontSize: hp(1.4),
//     color: "#777",
//     textAlign: "center",
//     fontFamily: theme.PRIMARY_FONT_FAMILY,
//   },
// });

// export default HomeScreen;

// src/screens/HomeScreen.tsx
// import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   Pressable,
//   Image,
//   TextInput,
//   ActivityIndicator,
//   RefreshControl,
//   Alert,
//   Platform,
//   NativeScrollEvent,
//   NativeSyntheticEvent,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useNavigation } from "@react-navigation/native";
// import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import type { ParamListBase } from "@react-navigation/native";
// import { useDispatch, useSelector } from "react-redux";
// import { useDebounce } from "use-debounce";
// import { Ionicons } from "@expo/vector-icons";

// import apiClient from "@/src/api/client"; // use the client above
// import theme from "@/src/assets/colors/theme";
// import { hp, wp } from "@/src/assets/utils/responsive";
// import { setSelectedShopId } from "@/src/Redux/Slice/selectedShopSlice";
// import SideMenuModal from "@/src/Common/SlideMenuModal";

// type RootState = any; // replace with your actual RootState
// type CategoryType = { categoryId: number; categoryName: string; categoryImage?: string | null };
// type ItemType = {
//   menuName: string | undefined; menuId: number; name?: string; price?: number; imageUrl?: string | null 
// };
// type ShopType = { id: number; shopname: string; shopImage?: string | null };

// const PAGE_SIZE = 10;

// const HomeScreen: React.FC = () => {
//   const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
//   const dispatch = useDispatch();
//   const location = useSelector((s: RootState) => s.location);

//   const lat = location?.latitude;
//   const lng = location?.longitude;

//   // UI state
//   const [searchText, setSearchText] = useState("");
//   const [sideMenuVisible, setSideMenuVisible] = useState(false);

//   // Data state
//   const [categories, setCategories] = useState<CategoryType[]>([]);
//   const [popularItems, setPopularItems] = useState<ItemType[]>([]);
//   const [shops, setShops] = useState<ShopType[]>([]);

//   // meta / loading state
//   const [page, setPage] = useState(1);
//   const [loadingCategories, setLoadingCategories] = useState(false);
//   const [loadingPopular, setLoadingPopular] = useState(false);
//   const [loadingShops, setLoadingShops] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [totalShops, setTotalShops] = useState<number | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   // debounced search
//   const [debouncedSearchText] = useDebounce(searchText, 500);

//   // AbortController refs for each request so we can cancel when needed
//   const categoriesAbort = useRef<AbortController | null>(null);
//   const popularAbort = useRef<AbortController | null>(null);
//   const shopsAbort = useRef<AbortController | null>(null);

//   // token cache - to avoid repeated AsyncStorage gets per request
//   const tokenRef = useRef<string | null>(null);
//   const getToken = useCallback(async () => {
//     if (tokenRef.current) return tokenRef.current;
//     try {
//       const t = await AsyncStorage.getItem("authToken");
//       tokenRef.current = t;
//       return t;
//     } catch {
//       return null;
//     }
//   }, []);

//   // Helper to build authorization header (nullable)
//   const buildAuthHeaders = useCallback(async () => {
//     const token = await getToken();
//     return token ? { Authorization: `Bearer ${token}` } : undefined;
//   }, [getToken]);

//   // Fetchers (cancel previous when re-run)
//   const fetchCategories = useCallback(async () => {
//     setLoadingCategories(true);
//     categoriesAbort.current?.abort();
//     categoriesAbort.current = new AbortController();
//     try {
//       const headers = await buildAuthHeaders();
//       const res = await apiClient.get("/api/category/categories-with-menus", {
//         headers,
//         signal: categoriesAbort.current.signal,
//       });
//       // API returns { data: [...] } in your original code — adapt defensively
//       const arr = Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : [];
//       setCategories(arr);
//     } catch (err: any) {
//       if (err?.name === "CanceledError") {
//         // cancelled - no need to surface to user
//       } else {
//         console.warn("categories fetch error", err?.response?.status ?? err.message);
//         setCategories([]);
//       }
//     } finally {
//       setLoadingCategories(false);
//     }
//   }, [buildAuthHeaders]);

//   const fetchPopularItems = useCallback(async () => {
//     if (!lat || !lng) return;
//     setLoadingPopular(true);
//     popularAbort.current?.abort();
//     popularAbort.current = new AbortController();
//     try {
//       const headers = await buildAuthHeaders();
//       const res = await apiClient.get("/api/orders/popular-items", {
//         params: { lat, lng },
//         headers,
//         signal: popularAbort.current.signal,
//       });
//       // Accept array or object with popularItems
//       const payload = Array.isArray(res?.data) ? res.data : res?.data?.popularItems ?? res?.data?.items ?? res?.data ?? [];
//       setPopularItems(Array.isArray(payload) ? payload : []);
//     } catch (err: any) {
//       if (err?.name === "CanceledError") {
//         // ignore
//       } else {
//         console.warn("popular items fetch error", err?.response?.status ?? err.message);
//         setPopularItems([]);
//       }
//     } finally {
//       setLoadingPopular(false);
//     }
//   }, [lat, lng, buildAuthHeaders]);

//   const fetchShops = useCallback(
//     async (pageToLoad = 1, append = false) => {
//       if (!lat || !lng) return;
//       setLoadingShops(true);
//       shopsAbort.current?.abort();
//       shopsAbort.current = new AbortController();

//       try {
//         const headers = await buildAuthHeaders();
//         const offset = (pageToLoad - 1) * PAGE_SIZE;
//         const res = await apiClient.get("/api/shops/nearby", {
//           params: {
//             lat,
//             lng,
//             onlyOpen: true,
//             limit: PAGE_SIZE,
//             offset,
//             search: debouncedSearchText || undefined,
//           },
//           headers,
//           signal: shopsAbort.current.signal,
//         });

//         // normalize response (support array or { items:[], total } shapes)
//         const data = Array.isArray(res?.data) ? res.data : res?.data?.items ?? [];
//         const total = Number(res?.data?.total ?? (Array.isArray(res?.data) ? res.data.length : null)) || null;

//         setTotalShops(total);
//         setShops(prev => (append ? [...prev, ...data] : data));
//         setPage(pageToLoad);
//       } catch (err: any) {
//         if (err?.name === "CanceledError") {
//           // ignore
//         } else {
//           console.error("Error fetching shops:", err?.response?.status ?? err.message);
//         }
//       } finally {
//         setLoadingShops(false);
//         setRefreshing(false);
//       }
//     },
//     [lat, lng, debouncedSearchText, buildAuthHeaders]
//   );

//   // Combined fetch triggered on mount and location changes
//   useEffect(() => {
//     if (!lat || !lng) {
//       // push to location screen once (don't block render)
//       navigation.replace("locationScreen" as never);
//       return;
//     }

//     // reset token cache each time location changes? not necessary but safe
//     tokenRef.current = tokenRef.current ?? null;

//     // fetch in parallel (but each has its own abort controller)
//     fetchCategories();
//     fetchPopularItems();
//     fetchShops(1, false);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [lat, lng]);

//   // When debounced search changes, refetch shops (page 1)
//   useEffect(() => {
//     if (!lat || !lng) return;
//     fetchShops(1, false);
//   }, [debouncedSearchText, lat, lng, fetchShops]);

//   // Refresh handler
//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     await Promise.allSettled([fetchShops(1, false), fetchCategories(), fetchPopularItems()]);
//     setRefreshing(false);
//   }, [fetchShops, fetchCategories, fetchPopularItems]);

//   const handleLoadMore = useCallback(() => {
//     if (loadingShops) return;
//     if (totalShops !== null && shops.length >= totalShops) return;
//     fetchShops(page + 1, true);
//   }, [loadingShops, totalShops, shops.length, page, fetchShops]);

//   const handleOpenShop = useCallback(
//     (shopId: number) => {
//       dispatch(setSelectedShopId(shopId));
//       navigation.navigate("shopDetailScreen" as never);
//     },
//     [dispatch, navigation]
//   );

//   // memoized renderers
// const RenderCategoryItem = useCallback(({ item }: { item: CategoryType }) => {
//   return (
//     <View style={styles.popularItem}>
//       <View style={styles.popularCircle}>
//         {item.categoryImage ? (
//           <Image
//             source={{ uri: `${apiClient.defaults.baseURL}/uploads/categories/${item.categoryImage}` }}
//             style={styles.popularImg} // 🔥 reuse same style as popularImg
//           />
//         ) : (
//           <Image
//             source={require("@/src/assets/images/onBoard1.png")}
//             style={styles.popularImg}
//           />
//         )}
//       </View>
//       <Text style={styles.popularName} numberOfLines={1}>
//         {item.categoryName}
//       </Text>
//     </View>
//   );
// }, []);


//   const RenderPopularItem = useCallback(({ item }: { item: ItemType }) => {
//     return (
//       <View style={styles.popularItem}>
//         <View style={styles.popularCircle}>
//           {item.imageUrl ? (
//             <Image source={{ uri: `${apiClient.defaults.baseURL}/uploads/menus/${item.imageUrl}` }} style={styles.popularImg} />
//           ) : null}
//         </View>
//         <Text style={styles.popularName} numberOfLines={1}>
//           {item.name ?? item.menuName}
//         </Text>
//         <Text style={styles.popularPrice}>₹{item.price ?? item.mPrice ?? "—"}</Text>
//       </View>
//     );
//   }, []);

//   const RenderShopCard = useCallback(({ item }: { item: ShopType }) => {
//     return (
//       <Pressable style={styles.shopCard} onPress={() => handleOpenShop(item.id)} accessibilityRole="button">
//         <Image
//           source={item.shopImage ? { uri: `${apiClient.defaults.baseURL}/uploads/shops/${item.shopImage}` } : require("@/src/assets/images/onBoard1.png")}
//           style={styles.shopImage}
//         />
//         <View style={styles.shopDetails}>
//           <Text style={styles.shopName}>{item.shopname}</Text>
//           <View style={styles.shopMeta}>
//             <Ionicons name="star" size={12} color="#FFC107" />
//             <Text style={styles.metaText}>4.5</Text>
//             <Text style={styles.metaText}> • 15-20 min</Text>
//           </View>
//           <View style={styles.tagRow}>
//             <Text style={styles.tag}>Masala Chai</Text>
//             <Text style={styles.tag}>Filter Coffee</Text>
//             <Text style={styles.tag}>Samosa</Text>
//           </View>
//           <TouchableOpacity style={styles.viewMenuBtn}>
//             <Text style={styles.viewMenuText}>View Menu</Text>
//           </TouchableOpacity>
//         </View>
//       </Pressable>
//     );
//   }, [handleOpenShop]);

//   const ListHeader = useMemo(() => {
//     const limitedCategories = Array.isArray(categories) ? categories.slice(0, 7) : [];
//     return (
//       <View>
//         <View style={styles.headerRow}>
//           <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
//             <Pressable onPress={() => setSideMenuVisible(true)}>
//               <Ionicons name="menu-outline" size={hp(3)} />
//             </Pressable>

//             <TouchableOpacity style={styles.locationRow} onPress={() => navigation.navigate("locationScreen" as never)}>
//               <Text style={styles.subLocation} numberOfLines={1}>
//                 {location ? `${location.latitude}, ${location.longitude}` : "Select Location"}
//               </Text>
//               <Ionicons name="chevron-down" size={18} color={theme.PRIMARY_COLOR} style={{ marginLeft: 4 }} />
//             </TouchableOpacity>
//           </View>

//           <Ionicons name="notifications-outline" size={hp(3)} color={theme.PRIMARY_COLOR} />
//         </View>

//         <View style={styles.searchRow}>
//           <TextInput placeholder="Search for tea, Coffee, Snacks..." style={styles.searchInput} placeholderTextColor="#999" value={searchText} onChangeText={setSearchText} returnKeyType="search" />
//           <Ionicons name="search" size={hp(1.8)} color="#999" style={styles.searchIcon} />
//         </View>

//         <View style={styles.categorySectionHeader}>
//           <Text style={styles.sectionTitle}>Categories</Text>
//           <TouchableOpacity onPress={() => navigation.navigate("viewAllCategoryScreen")}>
//             <Text style={styles.viewAllText}>View All</Text>
//           </TouchableOpacity>
//         </View>

//         {loadingCategories ? (
//           <ActivityIndicator size="small" color={theme.PRIMARY_COLOR} style={{ paddingVertical: hp(2) }} />
//         ) : (
//           <FlatList data={limitedCategories} horizontal showsHorizontalScrollIndicator={false} keyExtractor={(it) => String(it.categoryId)} renderItem={({ item }) => <RenderCategoryItem item={item} />} contentContainerStyle={styles.categoryList} />
//         )}

//         <Text style={styles.sectionTitle}>Popular Items</Text>
//         {loadingPopular ? (
//           <ActivityIndicator size="small" color={theme.PRIMARY_COLOR} style={{ paddingVertical: hp(2) }} />
//         ) : popularItems.length > 0 ? (
//           <FlatList data={popularItems} horizontal showsHorizontalScrollIndicator={false} keyExtractor={(it) => String((it as any).menuId ?? (it as any).id ?? Math.random())} renderItem={({ item }) => <RenderPopularItem item={item} />} contentContainerStyle={{ paddingLeft: wp(4), paddingVertical: hp(1) }} />
//         ) : (
//           <View style={{ padding: 20, alignItems: "center" }}>
//             <Text style={{ fontSize: 16, color: "#888" }}>No popular items available right now.</Text>
//           </View>
//         )}

//         <Text style={styles.sectionTitle}>Nearby Vendors (within 1KM)</Text>
//       </View>
//     );
//   }, [categories, loadingCategories, popularItems, loadingPopular, navigation, location, searchText, RenderCategoryItem, RenderPopularItem]);

//   // main render
//   return (
//     <View style={styles.container}>
//       {error ? <Text style={{ color: "red", textAlign: "center" }}>{error}</Text> : null}
//       <FlatList
//         data={shops}
//         keyExtractor={(item) => `${item.id}`}
//         renderItem={({ item }) => <RenderShopCard item={item} />}
//         ListHeaderComponent={shops.length > 0 ? ListHeader : null}
//         ListEmptyComponent={
//           !loadingShops ? (
//             <View style={styles.noShop}>
//               <Ionicons name="location-outline" size={48} color={theme.PRIMARY_COLOR} />
//               <Text style={styles.emptyText}>Sorry, service is not available in your area yet.</Text>
//               <TouchableOpacity style={styles.changeLocationBtn} onPress={() => navigation.navigate("locationScreen" as never)}>
//                 <Text style={styles.changeLocationText}>Change Location</Text>
//               </TouchableOpacity>
//               <Text style={styles.comingSoonText}>🚀 Coming soon ClickTea at your nearby location</Text>
//             </View>
//           ) : (
//             <ActivityIndicator size="large" color={theme.PRIMARY_COLOR} />
//           )
//         }
//         onEndReachedThreshold={0.5}
//         onEndReached={handleLoadMore}
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.PRIMARY_COLOR} />}
//         contentContainerStyle={{ paddingBottom: hp(10) }}
//       />
//       <SideMenuModal visible={sideMenuVisible} onClose={() => setSideMenuVisible(false)} />
//     </View>
//   );
// };

// export default HomeScreen;

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff" },
//   locationRow: { flexDirection: "row", alignItems: "center", maxWidth: wp(60) },
//   headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: wp(4), paddingTop: hp(2) },
//   greeting: { fontSize: hp(2.4), fontWeight: "600", color: theme.PRIMARY_COLOR },
//   subLocation: { fontSize: hp(1.5), color: "#666" },
//   emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 },
//   noShop: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
//   emptyText: { fontSize: 16, color: "gray", marginVertical: 10, textAlign: "center" },
//   changeLocationBtn: { marginTop: 15, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: theme.PRIMARY_COLOR, borderRadius: 8 },
//   changeLocationText: { color: "white", fontSize: 16, fontWeight: "bold" },
//   comingSoonText: { marginTop: 20, fontSize: 14, color: "#888", textAlign: "center" },

//   searchRow: { marginTop: hp(1.5), marginHorizontal: wp(4), backgroundColor: "#f2f2f2", borderRadius: hp(3), flexDirection: "row", alignItems: "center", paddingHorizontal: wp(3) },
//   searchInput: { flex: 1, height: hp(5), fontSize: hp(1.7), color: "#333" },
//   searchIcon: { marginLeft: wp(2) },

//   categoryList: { paddingHorizontal: wp(4), paddingVertical: hp(1.2) },
//   categoryItem: { width: wp(18), marginRight: wp(3), alignItems: "center" },
//   categoryImage: { width: wp(16), height: wp(16), borderRadius: wp(8), backgroundColor: "#f2f2f2" },
//   categoryName: { marginTop: hp(0.5), fontSize: hp(1.4), color: "#333", textAlign: "center" },

//   categorySectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: hp(1), marginRight: wp(4) },
//   sectionTitle: { fontSize: hp(2), fontWeight: "600", color: "#333", marginTop: hp(1), paddingHorizontal: wp(4) },
//   viewAllText: { color: theme.PRIMARY_COLOR, fontWeight: "600", fontSize: hp(1.6) },

//   popularItem: { width: wp(20), alignItems: "center", marginRight: wp(3) },
//   popularCircle: { width: wp(16), height: wp(16), borderRadius: wp(8), backgroundColor: "#eaeaea", justifyContent: "center", alignItems: "center" },
//   popularImg: { width: "100%", height: "100%", borderRadius: wp(8) },
//   popularName: { fontSize: hp(1.5), color: "#333", textAlign: "center" },
//   popularPrice: { fontSize: hp(1.3), color: "#666" },

//   shopCard: { flexDirection: "row", borderBottomWidth: 1, marginHorizontal: wp(4), borderColor: "#eee" },
//   shopImage: { width: wp(20), height: wp(20), borderRadius: 6, backgroundColor: "#f2f2f2", alignSelf: "flex-start", marginTop: hp(2) },
//   shopDetails: { flex: 1, padding: wp(3) },
//   shopName: { fontSize: hp(1.9), fontWeight: "600", color: theme.PRIMARY_COLOR },
//   shopMeta: { flexDirection: "row", alignItems: "center", marginTop: hp(0.5) },
//   metaText: { fontSize: hp(1.4), color: "#666", marginLeft: 4 },
//   tagRow: { flexDirection: "row", flexWrap: "wrap", marginTop: hp(0.6) },
//   tag: { backgroundColor: "#f2f2f2", paddingHorizontal: wp(2), paddingVertical: hp(0.4), borderRadius: 8, marginRight: wp(2), fontSize: hp(1.3), color: "#666" },
//   viewMenuBtn: { backgroundColor: theme.PRIMARY_COLOR, paddingVertical: hp(0.8), paddingHorizontal: wp(3), borderRadius: 8, marginTop: hp(0.8), alignSelf: "flex-start" },
//   viewMenuText: { color: "#fff", fontSize: hp(1.4), fontWeight: "600" },
// });
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
  Animated,
  Easing,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ParamListBase } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { useDebounce } from "use-debounce";
import { Ionicons } from "@expo/vector-icons";

import apiClient from "@/src/api/client"; // keep using your centralized client
import theme from "@/src/assets/colors/theme";
import { hp, wp } from "@/src/assets/utils/responsive";
import { setSelectedShopId } from "@/src/Redux/Slice/selectedShopSlice";
import SideMenuModal from "@/src/Common/SlideMenuModal";

// React Query
import { useQuery, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

// ---------- Types ----------
type RootState = any;
type CategoryType = { categoryId: number; categoryName: string; categoryImage?: string | null };
type ItemType = { menuName?: string; menuId?: number; name?: string; price?: number; imageUrl?: string | null };
type ShopType = {
  id: number;
  shopname: string;
  shopImage?: string | null;
  isOpen?: boolean; // optional fields used for badges
  etaMinutes?: number | null;
  distanceKm?: number | null;
};

const PAGE_SIZE = 10;

// ---------- Helpers ----------
const ICON = {
  small: hp(1.8),
  medium: hp(2.4),
  large: hp(3.0),
};

// lightweight shimmer/skeleton using Animated background interpolation
const Shimmer = ({ style }: { style?: any }) => {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [progress]);

  const backgroundColor = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["#eeeeee", "#dddddd", "#eeeeee"],
  });

  return <Animated.View style={[style, { backgroundColor }]} />;
};

// ---------- Skeletons ----------
const CategorySkeleton = () => (
  <View style={{ flexDirection: "row", paddingHorizontal: wp(4) }}>
    {Array.from({ length: 6 }).map((_, i) => (
      <View key={i} style={{ width: wp(18), marginRight: wp(3), alignItems: "center" }}>
        <Shimmer style={{ width: wp(16), height: wp(16), borderRadius: wp(8) }} />
        <Shimmer style={{ width: wp(12), height: hp(1.6), marginTop: hp(0.6), borderRadius: 4 }} />
      </View>
    ))}
  </View>
);

const PopularSkeleton = () => (
  <View style={{ flexDirection: "row", paddingLeft: wp(4) }}>
    {Array.from({ length: 4 }).map((_, i) => (
      <View key={i} style={{ width: wp(20), alignItems: "center", marginRight: wp(3) }}>
        <Shimmer style={{ width: wp(16), height: wp(16), borderRadius: wp(8) }} />
        <Shimmer style={{ width: wp(14), height: hp(1.6), marginTop: hp(0.6), borderRadius: 4 }} />
      </View>
    ))}
  </View>
);

const ShopSkeleton = () => (
  <View style={[styles.shopCard, { opacity: 0.9 }]}>
    <Shimmer style={[styles.shopImage, { borderRadius: 6 }]} />
    <View style={styles.shopDetails}>
      <Shimmer style={{ width: "50%", height: hp(2), borderRadius: 6 }} />
      <Shimmer style={{ width: "35%", height: hp(1.6), marginTop: hp(0.6), borderRadius: 6 }} />
      <View style={{ flexDirection: "row", marginTop: hp(0.8) }}>
        <Shimmer style={{ width: wp(18), height: hp(1.6), borderRadius: 6, marginRight: wp(2) }} />
        <Shimmer style={{ width: wp(14), height: hp(1.6), borderRadius: 6 }} />
      </View>
    </View>
  </View>
);

// ---------- Fetch wrappers with token header ----------
const getToken = async () => {
  try {
    return await AsyncStorage.getItem("authToken");
  } catch {
    return null;
  }
};

const fetchCategories = async () => {
  const token = await getToken();
  const res = await apiClient.get("/api/category/categories-with-menus", { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
  return Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : [];
};

const fetchPopular = async (lat: number, lng: number) => {
  if (!lat || !lng) return [];
  const token = await getToken();
  const res = await apiClient.get("/api/orders/popular-items", { params: { lat, lng }, headers: token ? { Authorization: `Bearer ${token}` } : undefined });
  const payload = Array.isArray(res?.data) ? res.data : res?.data?.popularItems ?? res?.data?.items ?? res?.data ?? [];
  // console.log(payload,"Payload");
  
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

  // normalize
  const data = Array.isArray(res?.data) ? res.data : res?.data?.items ?? [];
  const total = Number(res?.data?.total ?? (Array.isArray(res?.data) ? res.data.length : 0)) || 0;
  return { data, nextOffset: data.length === 0 ? null : offset + PAGE_SIZE, total };
};

// ---------- ShopCard (memoized) ----------
const ShopCard: React.FC<{ item: ShopType; onOpen: (id: number) => void }> = React.memo(({ item, onOpen }) => {
  const open = typeof item.isOpen === "boolean" ? item.isOpen : true;
  const eta = item.etaMinutes ?? null;
  const distance = item.distanceKm ?? null;
  return (
    <Pressable style={styles.shopCard} onPress={() => onOpen(item.id)} android_ripple={{ color: "#f2f2f2" }} accessibilityRole="button" accessibilityLabel={`Open ${item.shopname} detail`}>
      <Image
        style={styles.shopImage}
        source={
          item.shopImage
            ? { uri: `${apiClient.defaults.baseURL}/uploads/shops/${item.shopImage}` }
            : require("@/src/assets/images/onBoard1.png")
        }
        resizeMode="cover"
      />

      <View style={styles.shopDetails}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={styles.shopName}>{item.shopname}</Text>
          <View style={[styles.statusBadge, open ? styles.openBadge : styles.closedBadge]}>
            <Text style={[styles.statusText]}>{open ? "Open" : "Closed"}</Text>
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

// ---------- HomeScreen ----------
const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const dispatch = useDispatch();
  const location = useSelector((s: RootState) => s.location);
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

  // Popular
const { data: popularItems = [], isLoading: loadingPopular } = useQuery({
  queryKey: ["popular", lat, lng],
  queryFn: () => fetchPopular(lat, lng),
  enabled: !!lat && !!lng,
  staleTime: 1000 * 60,
  retry: 1,
});

  // Shops pagination with useInfiniteQuery
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
  queryFn: fetchShopsPage, // v5 will call this with { pageParam, queryKey, signal } automatically
  getNextPageParam: (last) => last.nextOffset,
  enabled: !!lat && !!lng,
  staleTime: 1000 * 30,
  cacheTime: 1000 * 60 * 5,
  retry: 1,
});

  const shops: ShopType[] = useMemo(() => (shopPages ? shopPages.pages.flatMap((p: any) => p.data) : []), [shopPages]);
  const totalShops = useMemo(() => (shopPages ? shopPages.pages[0]?.total ?? null : null), [shopPages]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
await Promise.allSettled([
  queryClient.invalidateQueries({ queryKey: ["shops"] }),
  queryClient.invalidateQueries({ queryKey: ["categories"] }),
  queryClient.invalidateQueries({ queryKey: ["popular"] }),
]);  }, [queryClient]);

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
      navigation.replace("locationScreen" as never);
    }
  }, [lat, lng, navigation]);

  // List header
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
              <Text style={styles.subLocation} numberOfLines={1}>{location ? `${location.latitude}, ${location.longitude}` : "Select Location"}</Text>
              <Ionicons name="chevron-down" size={18} color={theme.PRIMARY_COLOR} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>

          <Ionicons name="notifications-outline" size={ICON.large} color={theme.PRIMARY_COLOR} />
        </View>

        <View style={styles.searchRow}>
          <TouchableOpacity
        style={styles.searchInput}
        activeOpacity={1}
        onPress={() => navigation.navigate("searchScreen")} // Navigate on tap
      >
          <TextInput
            editable={false} // Disable typing here
          pointerEvents="none" // Ensure touches pass to TouchableOpacity
          placeholder="Search for tea, Coffee, Snacks..." style={styles.searchInput} placeholderTextColor="#999" value={searchText} onChangeText={setSearchText} returnKeyType="search" />

      </TouchableOpacity>
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={ICON.small} />
            </TouchableOpacity>
          ) : (
            <Ionicons name="search" size={ICON.small} color="#999" style={styles.searchIcon} />
          )}
        </View>

        <View style={styles.categorySectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity onPress={() => navigation.navigate("viewAllCategoryScreen")}> 
            <Text style={styles.viewAllText}>View All</Text> 
            </TouchableOpacity>
        </View>

        {loadingCategories ? <CategorySkeleton /> : (
          <FlatList data={limitedCategories} horizontal showsHorizontalScrollIndicator={false} keyExtractor={(it: any) => String(it.categoryId)} renderItem={({ item }) => (
            // console.log(item),
            
            <View style={styles.popularItem}>
              <View style={styles.popularCircle}>
                {item.categoryImage ? (
                  <Image source={{ uri: `${apiClient.defaults.baseURL}/uploads/categories/${item.categoryImage}` }} style={styles.popularImg} resizeMode="cover" />
                ) : (
                  <Image source={require("@/src/assets/images/onBoard1.png")} style={styles.popularImg} />
                )}
              </View>
              <Text style={styles.popularName} numberOfLines={1}>{item.categoryName}</Text>
            </View>
          )} contentContainerStyle={styles.categoryList} />
        )}

        <Text style={styles.sectionTitle}>Popular Items</Text>
        {loadingPopular ? <PopularSkeleton /> : popularItems.length > 0 ? (
          <FlatList data={popularItems} horizontal showsHorizontalScrollIndicator={false} keyExtractor={(it: any) => String((it as any).menuId ?? (it as any).id ?? Math.random())} renderItem={({ item }) => (
            console.log(item),
            
            <View style={styles.popularItem}>
              <View style={styles.popularCircle}>
                {item.imageUrl ? (
                  <Image source={{ uri: `${apiClient.defaults.baseURL}/uploads/menus/${item.imageUrl}` }} style={styles.popularImg} resizeMode="cover" />
                ) : null}
              </View>
              <Text style={styles.popularName} numberOfLines={1}>{item.name ?? item.menuName}</Text>
              <Text style={styles.popularPrice}>₹{item.price ?? item.mPrice ?? "—"}</Text>
            </View>
          )} contentContainerStyle={{ paddingLeft: wp(4), paddingVertical: hp(1) }} />
        ) : (
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text style={{ fontSize: 16, color: "#888" }}>No popular items available right now.</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Nearby Vendors (within 1KM)</Text>
      </View>
    );
  }, [categories, loadingCategories, popularItems, loadingPopular, navigation, location, searchText]);

  // getItemLayout optimization (if each card height is consistent)
  const SHOP_CARD_HEIGHT = hp(20) + 16;
  const getItemLayout = useCallback((_: any, index: number) => ({ length: SHOP_CARD_HEIGHT, offset: SHOP_CARD_HEIGHT * index, index }), []);

  return (
    <View style={styles.container}>
      <FlatList
        data={shops}
        keyExtractor={(item) => `${item.id}`}
        renderItem={({ item }) => <ShopCard item={item} onOpen={handleOpenShop} />}
        ListHeaderComponent={shops.length > 0 ? ListHeader : null}
        ListEmptyComponent={!loadingShops ? (
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
        )}
        onEndReachedThreshold={0.5}
        onEndReached={handleLoadMore}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={onRefresh} tintColor={theme.PRIMARY_COLOR} />}
        contentContainerStyle={{ paddingBottom: hp(10) }}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews
        getItemLayout={getItemLayout}
      />

      <SideMenuModal visible={sideMenuVisible} onClose={() => setSideMenuVisible(false)} />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  locationRow: { flexDirection: "row", alignItems: "center", maxWidth: wp(60) },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: wp(4), paddingTop: hp(2) },
  greeting: { fontSize: hp(2.4), fontWeight: "600", color: theme.PRIMARY_COLOR },
  subLocation: { fontSize: hp(1.5), color: "#666" },
  noShop: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  emptyText: { fontSize: 16, color: "gray", marginVertical: 10, textAlign: "center" },
  changeLocationBtn: { marginTop: 15, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: theme.PRIMARY_COLOR, borderRadius: 8 },
  changeLocationText: { color: "white", fontSize: 16, fontWeight: "bold" },
  comingSoonText: { marginTop: 20, fontSize: 14, color: "#888", textAlign: "center" },

  searchRow: { marginTop: hp(1.5), marginHorizontal: wp(4), backgroundColor: "#f2f2f2", borderRadius: hp(3), flexDirection: "row", alignItems: "center", paddingHorizontal: wp(3) },
  searchInput: { flex: 1, height: hp(5), fontSize: hp(1.7), color: "#333" },
  searchIcon: { marginLeft: wp(2) },

  categoryList: { paddingHorizontal: wp(4), paddingVertical: hp(1.2) },
  categoryItem: { width: wp(18), marginRight: wp(3), alignItems: "center" },
  categoryImage: { width: wp(16), height: wp(16), borderRadius: wp(8), backgroundColor: "#f2f2f2" },
  categoryName: { marginTop: hp(0.5), fontSize: hp(1.4), color: "#333", textAlign: "center" },

  categorySectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: hp(1), marginRight: wp(4) },
  sectionTitle: { fontSize: hp(2), fontWeight: "600", color: "#333", marginTop: hp(1), paddingHorizontal: wp(4) },
  viewAllText: { color: theme.PRIMARY_COLOR, fontWeight: "600", fontSize: hp(1.6) },

  popularItem: { width: wp(20), alignItems: "center", marginRight: wp(3) },
  popularCircle: { width: wp(16), height: wp(16), borderRadius: wp(8), backgroundColor: "#eaeaea", justifyContent: "center", alignItems: "center" },
  popularImg: { width: "100%", height: "100%", borderRadius: wp(8) },
  popularName: { fontSize: hp(1.5), color: "#333", textAlign: "center" },
  popularPrice: { fontSize: hp(1.3), color: "#666" },

  shopCard: { flexDirection: "row", borderBottomWidth: 1, marginHorizontal: wp(4), borderColor: "#eee", paddingVertical: hp(1.2) },
  shopImage: { width: wp(20), height: wp(20), borderRadius: 6, backgroundColor: "#f2f2f2", alignSelf: "flex-start", marginTop: hp(0.5) },
  shopDetails: { flex: 1, padding: wp(3) },
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
});
