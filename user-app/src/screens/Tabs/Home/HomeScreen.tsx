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
import React, { useCallback, useEffect, useState } from "react";
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
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ParamListBase } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { useDebounce } from "use-debounce";
import theme from "@/src/assets/colors/theme";
import { BASE_URL } from "@/api";
import { Ionicons } from "@expo/vector-icons";
import { hp, wp } from "@/src/assets/utils/responsive";
import { setSelectedShopId } from "@/src/Redux/Slice/selectedShopSlice";

// Types (adjust these according to your real types)
type CategoryType = {
  categoryId: number;
  categoryName: string;
  categoryImage?: string;
};
type ItemType = {
  id: number;
  name: string;
  price: number;
  image?: string;
};
type ShopType = {
  id: number;
  shopname: string;
  shopImage?: string;
};


const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const dispatch = useDispatch();
  const location = useSelector((s: any) => s.location); // Replace `any` with RootState if defined
  const lat = location?.latitude;
  const lng = location?.longitude;

  const [searchText, setSearchText] = useState("");
  const [sideMenuVisible, setSideMenuVisible] = useState(false);

  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [popularItems, setPopularItems] = useState<ItemType[]>([]);
  const [shops, setShops] = useState<ShopType[]>([]);

  const [page, setPage] = useState(1);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingPopular, setLoadingPopular] = useState(false);
  const [loadingShops, setLoadingShops] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const [totalShops, setTotalShops] = useState<number | null>(null);

  // Debounce searchText to avoid rapid API calls
  const [debouncedSearchText] = useDebounce(searchText, 500);

  const getToken = async () => {
    try {
      return await AsyncStorage.getItem("authToken");
    } catch {
      return null;
    }
  };

  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    const token = await getToken();
    try {
      const res = await axios.get(`${BASE_URL}/api/category/categories-with-menus`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setCategories(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.warn("categories fetch error", err);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  const fetchPopularItems = useCallback(async () => {
    if (!lat || !lng) return;
    setLoadingPopular(true);
    const token = await getToken();
    try {
      const res = await axios.get(`${BASE_URL}/api/orders/popular-items`, {
        params: { lat, lng },
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setPopularItems(res.data || []);
    } catch (err) {
      console.warn("popular items fetch error", err);
      setPopularItems([]);
    } finally {
      setLoadingPopular(false);
    }
  }, [lat, lng]);

  const fetchShops = useCallback(
    async (pageToLoad = 1, append = false) => {
      if (!lat || !lng) return;
      setLoadingShops(true);
      const token = await getToken();
      try {
        const res = await axios.get(`${BASE_URL}/api/shops/nearby`, {
          params: {
            lat,
            lng,
            onlyOpen: true,
            limit: 10,
            page: pageToLoad,
            q: debouncedSearchText || undefined,
          },
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.items || [];
        const total =
          res.data.total || (Array.isArray(res.data) ? data.length : null);
        setTotalShops(total);
        setShops((prev) => (append ? [...prev, ...data] : data));
        setPage(pageToLoad);
      } catch (err) {
        console.error("Error fetching shops:", err);
      } finally {
        setLoadingShops(false);
        setRefreshing(false);
      }
    },
    [lat, lng, debouncedSearchText]
  );

  // On mount and lat/lng changes: fetch all data in parallel
  useEffect(() => {
    if (!lat || !lng) return;
    fetchCategories();
    fetchPopularItems();
    fetchShops(1, false);
  }, [lat, lng, fetchCategories, fetchPopularItems, fetchShops]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchShops(1, false);
    await fetchCategories();
    await fetchPopularItems();
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (loadingShops) return;
    if (totalShops !== null && shops.length >= totalShops) return;
    fetchShops(page + 1, true);
  };

  const handleOpenShop = (shopId: number) => {
    dispatch(setSelectedShopId(shopId));
    navigation.navigate("shopDetailScreen" as never);
  };

  // Memoized renderers for performance
  const RenderCategoryItem = React.memo(({ item }: { item: CategoryType }) => (
    <TouchableOpacity style={styles.categoryItem}>
      <Image
        source={
          item.categoryImage
            ? { uri: `${BASE_URL}/uploads/categories/${item.categoryImage}` }
            : require("@/src/assets/images/onBoard1.png")
        }
        style={styles.categoryImage}
      />
      <Text style={styles.categoryName} numberOfLines={1}>
        {item.categoryName}
      </Text>
    </TouchableOpacity>
  ));

  const RenderPopularItem = React.memo(({ item }: { item: ItemType }) => (
    <View style={styles.popularItem}>
      <View style={styles.popularCircle}>
        {item.image && (
          <Image
            source={{ uri: `${BASE_URL}/uploads/items/${item.image}` }}
            style={styles.popularImg}
          />
        )}
      </View>
      <Text style={styles.popularName} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.popularPrice}>₹{item.price}</Text>
    </View>
  ));

  const RenderShopCard = React.memo(({ item }: { item: ShopType }) => (
    <Pressable style={styles.shopCard} onPress={() => handleOpenShop(item.id)}>
      <Image
        source={
          item.shopImage
            ? { uri: `${BASE_URL}/uploads/shops/${item.shopImage}` }
            : require("@/src/assets/images/onBoard1.png")
        }
        style={styles.shopImage}
      />
      <View style={styles.shopDetails}>
        <Text style={styles.shopName}>{item.shopname}</Text>
        <View style={styles.shopMeta}>
          <Ionicons name="star" size={12} color="#FFC107" />
          <Text style={styles.metaText}>4.5</Text>
          <Text style={styles.metaText}> • 15-20 min</Text>
        </View>
        <View style={styles.tagRow}>
          <Text style={styles.tag}>Masala Chai</Text>
          <Text style={styles.tag}>Filter Coffee</Text>
          <Text style={styles.tag}>Samosa</Text>
        </View>
        <TouchableOpacity style={styles.viewMenuBtn}>
          <Text style={styles.viewMenuText}>View Menu</Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  ));

  const ListHeader = () => {
    const limitedCategories = Array.isArray(categories)
      ? categories.slice(0, 7)
      : [];

    return (
      <View>
        {/* Greeting & Location */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Good Morning!</Text>
            <Text style={styles.subLocation}>Koramangala, Bangalore</Text>
          </View>
          <Ionicons
            name="notifications-outline"
            size={hp(3)}
            color={theme.PRIMARY_COLOR}
          />
        </View>

        {/* Search Bar */}
        <View style={styles.searchRow}>
          <TextInput
            placeholder="Search for tea, Coffee, Snacks..."
            style={styles.searchInput}
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
          />
          <Ionicons
            name="search"
            size={hp(2.4)}
            color="#999"
            style={styles.searchIcon}
          />
        </View>

        {/* Categories Section */}
        <View style={styles.categorySectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("viewAllCategoryScreen")}
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {loadingCategories ? (
          <ActivityIndicator
            size="small"
            color={theme.PRIMARY_COLOR}
            style={{ paddingVertical: hp(2) }}
          />
        ) : (
          <FlatList
            data={limitedCategories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.categoryId.toString()}
            renderItem={({ item }) => <RenderCategoryItem item={item} />}
            contentContainerStyle={styles.categoryList}
          />
        )}

        {/* Popular Items Section */}
        <Text style={styles.sectionTitle}>Popular Items</Text>
        {loadingPopular ? (
          <ActivityIndicator
            size="small"
            color={theme.PRIMARY_COLOR}
            style={{ paddingVertical: hp(2) }}
          />
        ) : popularItems.length > 0 ? (
          <FlatList
            data={popularItems}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(i) => `${i.id}`}
            renderItem={({ item }) => <RenderPopularItem item={item} />}
            contentContainerStyle={{ paddingLeft: wp(4), paddingVertical: hp(1) }}
          />
        ) : (
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text style={{ fontSize: 16, color: "#888" }}>
              No popular items available right now.
            </Text>
          </View>
        )}

        {/* Vendors Section */}
        <Text style={styles.sectionTitle}>Nearby Vendors (within 1KM)</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={shops}
        keyExtractor={(item) => `${item.id}`}
        renderItem={({ item }) => <RenderShopCard item={item} />}
        ListHeaderComponent={<ListHeader />}
        ListEmptyComponent={
          !loadingShops ? (
            <View style={styles.noShop}>
              <Text>No Nearby Shops Available</Text>
            </View>
          ) : (
            <ActivityIndicator size="large" color={theme.PRIMARY_COLOR} />
          )
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: hp(10) }}
      />
      {/* Replace with your actual side menu */}
      {/* <SideMenuModal visible={sideMenuVisible} onClose={() => setSideMenuVisible(false)} /> */}
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
  },
  greeting: {
    fontSize: hp(2.4),
    fontWeight: "600",
    color: theme.PRIMARY_COLOR,
  },
  subLocation: { fontSize: hp(1.5), color: "#666" },

  searchRow: {
    marginTop: hp(1.5),
    marginHorizontal: wp(4),
    backgroundColor: "#f2f2f2",
    borderRadius: hp(3),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(3),
  },
  searchInput: {
    flex: 1,
    height: hp(5),
    fontSize: hp(1.7),
    color: "#333",
  },
  searchIcon: { marginLeft: wp(2) },

  categoryList: { paddingHorizontal: wp(4), paddingVertical: hp(1.2) },
  categoryItem: {
    width: wp(18),
    marginRight: wp(3),
    alignItems: "center",
  },
  categoryImage: {
    width: wp(16),
    height: wp(16),
    borderRadius: wp(8),
    backgroundColor: "#f2f2f2",
  },
  categoryName: {
    marginTop: hp(0.5),
    fontSize: hp(1.4),
    color: "#333",
    textAlign: "center",
  },

  categorySectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: hp(1),
    marginRight: wp(4),
  },
  sectionTitle: {
    fontSize: hp(2),
    fontWeight: "600",
    color: "#333",
    marginTop: hp(1),
    paddingHorizontal: wp(4),
  },
  viewAllText: {
    color: theme.PRIMARY_COLOR,
    fontWeight: "600",
    fontSize: hp(1.6),
  },

  popularItem: { width: wp(20), alignItems: "center", marginRight: wp(3) },
  popularCircle: {
    width: wp(16),
    height: wp(16),
    borderRadius: wp(8),
    backgroundColor: "#eaeaea",
    marginBottom: hp(0.8),
    justifyContent: "center",
    alignItems: "center",
  },
  popularImg: { width: "100%", height: "100%", borderRadius: wp(8) },
  popularName: { fontSize: hp(1.5), color: "#333", textAlign: "center" },
  popularPrice: { fontSize: hp(1.3), color: "#666" },

  shopCard: {
    flexDirection: "row",
    borderBottomWidth:1,
    marginHorizontal: wp(4),
    // marginVertical: hp(1),
    // backgroundColor: "#fff",
    // borderRadius: 10,
    // borderWidth: 1,
    borderColor: "#eee",
    // alignItems:"center"
    // overflow: "hidden",
    // elevation: 2, // subtle shadow on Android
    // shadowColor: "#000", // shadow for iOS
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.2,
    // shadowRadius: 2,
  },
  shopImage: { width: wp(20), height: wp(20),borderRadius:6, backgroundColor: "#f2f2f2",alignSelf:"flex-start",marginTop:hp(2) },
  shopDetails: { flex: 1, padding: wp(3) },
  shopName: {
    fontSize: hp(1.9),
    fontWeight: "600",
    color: theme.PRIMARY_COLOR,
  },
  shopMeta: { flexDirection: "row", alignItems: "center", marginTop: hp(0.5) },
  metaText: { fontSize: hp(1.4), color: "#666", marginLeft: 4 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", marginTop: hp(0.6) },
  tag: {
    backgroundColor: "#f2f2f2",
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.4),
    borderRadius: 8,
    marginRight: wp(2),
    fontSize: hp(1.3),
    color: "#666",
  },
  viewMenuBtn: {
    backgroundColor: theme.PRIMARY_COLOR,
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(3),
    borderRadius: 8,
    marginTop: hp(0.8),
    alignSelf: "flex-start",
  },
  viewMenuText: { color: "#fff", fontSize: hp(1.4), fontWeight: "600" },

  noShop: { padding: hp(4), alignItems: "center" },
});
