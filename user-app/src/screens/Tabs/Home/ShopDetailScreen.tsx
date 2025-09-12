// import React, { useEffect, useMemo, useState } from "react";
// import {
//   StyleSheet,
//   Text,
//   View,
//   FlatList,
//   Pressable,
//   Image,
//   Modal,
//   TextInput,
//   StatusBar,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { useNavigation } from "@react-navigation/native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";
// import { useDispatch, useSelector } from "react-redux";
// import { BASE_URL } from "@/api";
// import { selectSelectedShopId } from "@/src/Redux/Slice/selectedShopSlice";
// import {
//   addToCartAsync,
//   fetchCartAsync,
//   selectCartItems,
//   updateCartItemAsync,
// } from "@/src/Redux/Slice/cartSlice";
// import { hp, wp } from "@/src/assets/utils/responsive";
// import CartIconWithBadge from "@/src/components/CartIconBadge";
// import { getUserIdFromToken } from "@/src/assets/utils/getUserIdFromToken";
// import axiosClient from "@/src/api/client";
// import { SafeAreaView } from "react-native-safe-area-context";

// const ShopDetailScreen = () => {
//   const shopId = useSelector(selectSelectedShopId);
//   const cartItems = useSelector(selectCartItems);
//   const dispatch = useDispatch();
//   const navigation = useNavigation();

//   // modal
//   const [noteModalVisible, setNoteModalVisible] = useState(false);
//   const [currentMenu, setCurrentMenu] = useState<any>(null);
//   const [noteText, setNoteText] = useState("");

//   // shop + menu
//   const [shopData, setShopData] = useState<any>(null);
//   const [menuData, setMenuData] = useState<any[]>([]);
//   const [cartLoaded, setCartLoaded] = useState(false);

//   // fetch helpers
//   const getToken = async () => {
//     try {
//       return await AsyncStorage.getItem("authToken");
//     } catch {
//       return null;
//     }
//   };

//   const fetchData = async () => {
//     try {
//       const response = await axiosClient.get(
//         `${BASE_URL}/api/shops/detail/${shopId}`
//       );
//       setShopData(response.data);
//     } catch (error) {
//       console.log("Fetch shop error", error);
//     }
//   };

//   const fetchMenu = async () => {
//     try {
//       // const token = await getToken();
//       const response = await axiosClient.get(
//         `${BASE_URL}/api/menu/shop/${shopId}`,
//         // {
//         //   headers: token ? { Authorization: `Bearer ${token}` } : undefined,
//         // }
//       );
//       setMenuData(response.data);
//     } catch (error) {
//       console.log("Fetch menu error", error);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//     fetchMenu();

//     (async () => {
//       try {
//         const id = await getUserIdFromToken();
//         if (id && shopId) {
//           await dispatch(fetchCartAsync({ userId: id, shopId }));
//         }
//       } catch (err) {
//         console.error("Initial fetchCart error", err);
//       } finally {
//         setCartLoaded(true);
//       }
//     })();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [shopId]);

//   // totals
//   const totalItems = useMemo(
//     () =>
//       cartItems.reduce(
//         (acc: number, item: any) => acc + (item.quantity || 0),
//         0
//       ),
//     [cartItems]
//   );

//   // IMPORTANT: derive cartMap from the authoritative server items (cartItems)
//   // map: menuId -> cartItem (server shape)
//   const cartMap = useMemo(() => {
//     const map: Record<number, any> = {};
//     cartItems.forEach((it: any) => {
//       if (it && it.menuId != null) map[it.menuId] = it;
//     });
//     return map;
//   }, [cartItems]);

//   // ---------- Handlers (always await .unwrap() and check response) ----------

//   const handleAddQty = async (menu: any) => {
//     try {
//       const existing = cartMap[menu.menuId];
//       if (!existing) {
//         const userId = await AsyncStorage.getItem("userId");
//         const payload = {
//           userId: Number(userId),
//           shopId,
//           menuId: menu.menuId,
//           quantity: 1,
//           addons: [],
//           notes: "",
//         };
//         const added = await dispatch(addToCartAsync(payload)).unwrap();
//         // reducer will update cartItems
//       } else {
//         // update existing quantity
//         const res = await dispatch(
//           updateCartItemAsync({
//             cartId: existing.cartId,
//             quantity: existing.quantity + 1,
//             addons: existing.addons || [],
//             notes: existing.notes || "",
//           })
//         ).unwrap();

//         if (res?.deleted) {
//           // unexpected: server deleted item; re-sync
//           const id = await getUserIdFromToken();
//           if (id) await dispatch(fetchCartAsync({ userId: id, shopId }));
//         }
//       }
//     } catch (err) {
//       console.error("Add qty error:", err);
//       // fallback re-sync
//       try {
//         const id = await getUserIdFromToken();
//         if (id) await dispatch(fetchCartAsync({ userId: id, shopId }));
//       } catch {}
//     }
//   };

//   const handleRemoveQty = async (menu: any) => {
//     try {
//       const existing = cartMap[menu.menuId];
//       if (!existing) return;
//       const newQty = existing.quantity - 1;

//       const res = await dispatch(
//         updateCartItemAsync({
//           cartId: existing.cartId,
//           quantity: newQty,
//           addons: existing.addons || [],
//           notes: newQty > 0 ? existing.notes || "" : "", // clear notes when qty -> 0
//         })
//       ).unwrap();

//       console.log("remove result:", res);
//       if (res?.deleted) {
//         // reducer should remove, UI will reflect + Add
//       }
//       // if unexpected, re-sync
//       if (!res) {
//         const id = await getUserIdFromToken();
//         if (id) await dispatch(fetchCartAsync({ userId: id, shopId }));
//       }
//     } catch (err) {
//       console.error("Remove qty error:", err);
//       try {
//         const id = await getUserIdFromToken();
//         if (id) await dispatch(fetchCartAsync({ userId: id, shopId }));
//       } catch {}
//     }
//   };

//   const handleSaveNote = async () => {
//     try {
//       if (currentMenu && cartMap[currentMenu.menuId]) {
//         const existing = cartMap[currentMenu.menuId];
//         const res = await dispatch(
//           updateCartItemAsync({
//             cartId: existing.cartId,
//             quantity: existing.quantity,
//             addons: existing.addons || [],
//             notes: noteText || "",
//           })
//         ).unwrap();

//         console.log("save note result:", res);
//         if (!res || res.deleted) {
//           const id = await getUserIdFromToken();
//           if (id) await dispatch(fetchCartAsync({ userId: id, shopId }));
//         }
//       }
//     } catch (err) {
//       console.error("Save note error:", err);
//       try {
//         const id = await getUserIdFromToken();
//         if (id) await dispatch(fetchCartAsync({ userId: id, shopId }));
//       } catch {}
//     } finally {
//       setNoteText("");
//       setNoteModalVisible(false);
//     }
//   };

//   const goToCart = () => navigation.navigate("cartScreen");

//   // ---------- Render ----------

//   const renderItem = ({ item }: { item: any }) => {
//     const cartEntry = cartMap[item.menuId];
//     const cartQty = cartEntry?.quantity || 0;

//     return (
//       <View style={styles.menuRow}>
//         <Pressable
//           onPress={() =>
//             navigation.navigate("menuDetailScreen", { menuId: item.menuId })
//           }
//         >
//           {item.imageUrl && (
//             <Image
//               source={{ uri: `${BASE_URL}/uploads/menus/${item.imageUrl}` }}
//               style={{ borderRadius: 4, height: hp(10), width: wp(20) }}
//             />
//           )}
//         </Pressable>

//         <View style={styles.menuLeft}>
//           <Text style={styles.menuName} numberOfLines={1}>
//             {item.menuName}
//           </Text>

//           <Text style={styles.menuDescription} numberOfLines={1}>
//             {item.ingredients || "Traditional Indian spiced tea with milk"}
//           </Text>

//           <Text style={styles.price}>₹{item.price}</Text>

//           {cartQty > 0 && (
//             <View style={styles.noteRow}>
//               {cartEntry?.notes ? (
//                 <>
//                   <Text style={styles.savedNoteInline} numberOfLines={1}>
//                     {cartEntry.notes}
//                   </Text>
//                   <Pressable
//                     onPress={() => {
//                       setCurrentMenu(item);
//                       setNoteText(cartEntry.notes || "");
//                       setNoteModalVisible(true);
//                     }}
//                     hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
//                   >
//                     <Ionicons name="create-outline" size={18} color="#562E19" />
//                   </Pressable>
//                 </>
//               ) : (
//                 <Pressable
//                   style={styles.noteButton}
//                   onPress={() => {
//                     setCurrentMenu(item);
//                     setNoteText("");
//                     setNoteModalVisible(true);
//                   }}
//                 >
//                   <Text style={styles.noteButtonText}>Custom</Text>
//                 </Pressable>
//               )}
//             </View>
//           )}
//         </View>

//         {cartQty === 0 ? (
//           <Pressable
//             style={styles.addButton}
//             onPress={() => handleAddQty(item)}
//           >
//             <Text style={styles.addButtonText}>+ Add</Text>
//           </Pressable>
//         ) : (
//           <View style={styles.qtyContainer}>
//             <Pressable onPress={() => handleRemoveQty(item)}>
//               <Ionicons
//                 name="remove-circle-outline"
//                 size={24}
//                 color="#562E19"
//               />
//             </Pressable>
//             <Text style={{ marginHorizontal: 8, color: "#A3A3A3" }}>
//               {cartQty}
//             </Text>
//             <Pressable onPress={() => handleAddQty(item)}>
//               <Ionicons name="add-circle-outline" size={24} color="#562E19" />
//             </Pressable>
//           </View>
//         )}
//       </View>
//     );
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header */}
//       <StatusBar barStyle="dark-content" backgroundColor="#fff" />
//       <View style={styles.header}>
//         <Pressable
//           onPress={() => navigation.goBack()}
//           style={{ paddingRight: wp(3) }}
//         >
//           <Ionicons name="chevron-back-outline" size={hp(3.5)} />
//         </Pressable>

//         <Text style={styles.shopName}>
//           {shopData?.shopname || "Shop Detail"}
//         </Text>

//         <CartIconWithBadge />
//       </View>

//       <Text style={styles.menuTitle}>Menu</Text>
//       <View style={{ borderBottomWidth: 1, borderColor: "#E8E8E8" }} />

//       <FlatList
//         data={menuData}
//         renderItem={renderItem}
//         keyExtractor={(item) => item.menuId.toString()}
//         contentContainerStyle={{ paddingBottom: hp(3) }}
//         showsVerticalScrollIndicator={false}
//       />

//       {cartLoaded && totalItems > 0 && (
//         <Pressable style={styles.cartModal} onPress={goToCart}>
//           <View style={styles.cartModalContent}>
//             <View
//               style={{
//                 backgroundColor: "rgba(0,0,0,0.2)",
//                 borderRadius: 50,
//                 padding: 10,
//               }}
//             >
//               <Ionicons name="cart-outline" size={hp(3)} color="white" />
//             </View>
//             <View style={{ flexDirection: "column" }}>
//               <Text style={styles.cartModalText}>View Cart</Text>
//               <Text style={styles.cartItemCountText}>
//                 {totalItems} item{totalItems > 1 ? "s" : ""}
//               </Text>
//             </View>
//             <Ionicons
//               name="chevron-forward-outline"
//               size={hp(3.5)}
//               color={"white"}
//             />
//           </View>
//         </Pressable>
//       )}

//       {/* Note modal */}
//       <Modal
//         visible={noteModalVisible}
//         transparent
//         animationType="slide"
//         onRequestClose={() => setNoteModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Custom</Text>
//             <TextInput
//               style={styles.noteInput}
//               value={noteText}
//               onChangeText={setNoteText}
//               placeholder="e.g. No ginger, less sugar..."
//               multiline
//             />
//             <View style={styles.modalActions}>
//               <Pressable
//                 style={[styles.modalBtn, { backgroundColor: "#ccc" }]}
//                 onPress={() => setNoteModalVisible(false)}
//               >
//                 <Text>Cancel</Text>
//               </Pressable>
//               <Pressable
//                 style={[styles.modalBtn, { backgroundColor: "#562E19" }]}
//                 onPress={handleSaveNote}
//               >
//                 <Text style={{ color: "#fff" }}>Save</Text>
//               </Pressable>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff", paddingTop: hp(2) },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: hp(2),
//     marginHorizontal: wp(2),
//     justifyContent: "space-between",
//   },
//   shopName: { fontWeight: "600", fontSize: hp(2.5), letterSpacing: 0.5 },
//   menuTitle: {
//     fontWeight: "700",
//     fontSize: hp(2),
//     marginBottom: hp(1),
//     marginLeft: wp(4),
//   },
//   menuRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     paddingVertical: hp(1.5),
//     borderBottomWidth: 1,
//     borderBottomColor: "#E8E8E8",
//     paddingHorizontal: wp(4),
//   },
//   menuLeft: { flex: 1, paddingRight: wp(4), paddingLeft: wp(4) },
//   menuName: { fontWeight: "600", fontSize: hp(1.8), flexShrink: 1 },
//   menuDescription: {
//     fontSize: hp(1.2),
//     color: "#A3A3A3",
//     marginBottom: hp(0.7),
//   },
//   price: { fontWeight: "700", fontSize: hp(1.8), color: "#333" },
//   addButton: {
//     backgroundColor: "#4D392D",
//     borderRadius: 6,
//     paddingHorizontal: wp(4),
//     paddingVertical: hp(0.7),
//     justifyContent: "center",
//     alignItems: "center",
//     alignSelf: "flex-end",
//     marginTop: hp(4),
//   },
//   addButtonText: { color: "white", fontWeight: "600", fontSize: hp(1.6) },
//   qtyContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: hp(4),
//   },
//   noteButton: {
//     paddingVertical: hp(0.4),
//     paddingHorizontal: wp(3),
//     borderRadius: 4,
//     backgroundColor: "#EFEFEF",
//   },
//   noteButtonText: { fontSize: hp(1.4), color: "#562E19", fontWeight: "500" },
//   noteRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: wp(2),
//     marginTop: hp(0.5),
//   },
//   savedNoteInline: { fontSize: hp(1.4), color: "#562E19", flexShrink: 1 },
//   cartModal: {
//     position: "absolute",
//     bottom: hp(3),
//     backgroundColor: "#562E19",
//     borderRadius: 50,
//     paddingVertical: hp(1.3),
//     paddingHorizontal: wp(5),
//     elevation: 10,
//     shadowColor: "#562E19",
//     shadowOpacity: 0.7,
//     shadowRadius: 8,
//     shadowOffset: { width: 0, height: 3 },
//     width: wp(54),
//     alignSelf: "center",
//   },
//   cartModalContent: { flexDirection: "row", alignItems: "center", gap: 5 },
//   cartModalText: { color: "white", fontSize: hp(2.2), fontWeight: "500" },
//   cartItemCountText: {
//     color: "white",
//     fontWeight: "500",
//     fontSize: hp(1.4),
//     opacity: 0.8,
//   },
//   modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center" },
//   modalContent: {
//     width: wp(80),
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: wp(5),
//     elevation: 4,
//     borderWidth: 1,
//   },
//   modalTitle: { fontSize: hp(2), fontWeight: "600", marginBottom: hp(1) },
//   noteInput: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 6,
//     padding: 10,
//     height: hp(12),
//     textAlignVertical: "top",
//     marginBottom: hp(2),
//   },
//   modalActions: {
//     flexDirection: "row",
//     justifyContent: "flex-end",
//     gap: wp(3),
//   },
//   modalBtn: {
//     paddingHorizontal: wp(4),
//     paddingVertical: hp(1),
//     borderRadius: 6,
//   },
// });

// export default ShopDetailScreen;
// ShopDetailScreenEnhanced.tsx
// ShopDetailScreenEnhanced.tsx
// import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import {
//   Animated,
//   Dimensions,
//   FlatList,
//   Modal,
//   PanResponder,
//   Pressable,
//   View,
//   SectionList,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TextInput,
//   Image,
//   Platform,
//   ActivityIndicator,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { useNavigation } from "@react-navigation/native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useDispatch, useSelector } from "react-redux";
// import { hp, wp } from "@/src/assets/utils/responsive";
// import CartIconWithBadge from "@/src/components/CartIconBadge";
// import axiosClient from "@/src/api/client";
// import { getUserIdFromToken } from "@/src/assets/utils/getUserIdFromToken";
// import {
//   addToCartAsync,
//   fetchCartAsync,
//   selectCartItems,
//   updateCartItemAsync,
// } from "@/src/Redux/Slice/cartSlice";
// import { selectSelectedShopId } from "@/src/Redux/Slice/selectedShopSlice";
// import { BASE_URL } from "@/api";
// import { useSafeAreaInsets } from "react-native-safe-area-context";

// const { width: SCREEN_W } = Dimensions.get("window");
// const SWIPE_THRESHOLD = 60;
// const CHIP_GAP = wp(3);

// type SectionType = { title: string; categoryId: number; data: any[] };

// const ShopDetailScreenEnhanced: React.FC = () => {
//   const navigation = useNavigation();
//   const dispatch = useDispatch();
//   const shopId = useSelector(selectSelectedShopId);
//   const cartItems = useSelector(selectCartItems);
//   const insets = useSafeAreaInsets();

//   /* data */
//   const [shopData, setShopData] = useState<any>(null);
//   const [sections, setSections] = useState<SectionType[]>([]);
//   const [bestSellerIds, setBestSellerIds] = useState<Set<number>>(new Set());
//   const [loadingSections, setLoadingSections] = useState<boolean>(true);

//   /* note modal */
//   const [noteModalVisible, setNoteModalVisible] = useState(false);
//   const [currentMenu, setCurrentMenu] = useState<any>(null);
//   const [noteText, setNoteText] = useState("");

//   /* UI refs/state */
//   const sectionListRef = useRef<SectionList<any>>(null);
//   const chipsListRef = useRef<FlatList<any> | null>(null);
//   const [activeIndex, setActiveIndex] = useState<number>(0);
//   const activeIndexRef = useRef<number>(0);
//   activeIndexRef.current = activeIndex;

//   const chipScalesRef = useRef<Animated.Value[]>([]);

//   /* cart derived */
//   const totalItems = useMemo(() => cartItems.reduce((acc: number, it: any) => acc + (it.quantity || 0), 0), [cartItems]);
//   const totalPrice = useMemo(() => cartItems.reduce((acc: number, it: any) => acc + Number(it.price || 0) * (it.quantity || 0), 0), [cartItems]);
//   const cartMap = useMemo(() => {
//     const m: Record<number, any> = {};
//     cartItems.forEach((it: any) => {
//       if (it?.menuId != null) m[it.menuId] = it;
//     });
//     return m;
//   }, [cartItems]);

//   /* ---------------- Fetchers ---------------- */
//   const fetchShopDetail = useCallback(async () => {
//     try {
//       const res = await axiosClient.get(`/api/shops/detail/${shopId}`);
//       setShopData(res.data ?? null);
//     } catch (err) {
//       console.warn("fetchShopDetail error", err);
//     }
//   }, [shopId]);

//   const fetchCategoriesWithMenus = useCallback(async () => {
//     setLoadingSections(true);
//     try {
//       const res = await axiosClient.get("/api/category/categories-with-menus");
//       const payload = Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : [];
//       const shopSections = payload
//         .filter((c: any) => Number(c.shop_id) === Number(shopId) || Number(c.is_global) === 1)
//         .map((c: any) => ({ title: c.categoryName ?? "Untitled", categoryId: c.categoryId, data: Array.isArray(c.menus) ? c.menus : [] }));

//       setSections(shopSections);

//       // init chip scales (one Animated.Value per section)
//       chipScalesRef.current.length = 0;
//       shopSections.forEach(() => chipScalesRef.current.push(new Animated.Value(1)));

//       setActiveIndex(0);
//     } catch (err) {
//       console.warn("fetchCategoriesWithMenus error", err);
//       setSections([]);
//     } finally {
//       setLoadingSections(false);
//     }
//   }, [shopId]);

//   const fetchBestSellers = useCallback(async () => {
//     try {
//       const res = await axiosClient.get(`/api/best-sellers/shop/${shopId}`);
//       const arr = Array.isArray(res?.data) ? res.data : [];
//       setBestSellerIds(new Set(arr.map((r: any) => Number(r.menuId))));
//     } catch {
//       setBestSellerIds(new Set());
//     }
//   }, [shopId]);

//   useEffect(() => {
//     fetchShopDetail();
//     fetchCategoriesWithMenus();
//     fetchBestSellers();

//     (async () => {
//       try {
//         const id = await getUserIdFromToken();
//         if (id && shopId) await dispatch(fetchCartAsync({ userId: id, shopId }));
//       } catch (err) {
//         console.error("initial fetchCart error", err);
//       }
//     })();
//   }, [shopId, fetchShopDetail, fetchCategoriesWithMenus, fetchBestSellers, dispatch]);

//   /* ---------------- SectionList helpers ---------------- */
//   const scrollToSectionIndex = useCallback((index: number) => {
//     if (!sections.length) return;
//     const idx = Math.max(0, Math.min(index, sections.length - 1));
//     // SectionList scroll with fallback try/catch for safety
//     try {
//       sectionListRef.current?.scrollToLocation?.({ sectionIndex: idx, itemIndex: 0, viewPosition: 0 });
//     } catch (e) {
//       // fallback: scroll to top
//       sectionListRef.current?.scrollToLocation?.({ sectionIndex: idx, itemIndex: 0, viewPosition: 0 });
//     }
//     // center chip in chips list
//     try {
//       chipsListRef.current?.scrollToIndex?.({ index: idx, viewPosition: 0.5 });
//     } catch {}
//     setActiveIndex(idx);
//   }, [sections]);

//   const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: any[] }) => {
//     if (!viewableItems || viewableItems.length === 0) return;
//     const first = viewableItems.find((v) => v.section) ?? viewableItems[0];
//     const sectionTitle = first?.section?.title;
//     if (!sectionTitle) return;
//     const idx = sections.findIndex((s) => s.title === sectionTitle);
//     if (idx !== -1 && idx !== activeIndexRef.current) setActiveIndex(idx);
//   }).current;

//   const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 40, minimumViewTime: 50 }).current;

//   /* animate chip scales on activeIndex */
//   useEffect(() => {
//     chipScalesRef.current.forEach((val, i) => {
//       Animated.spring(val, { toValue: i === activeIndex ? 1.06 : 1, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
//     });
//     try {
//       chipsListRef.current?.scrollToIndex?.({ index: activeIndex, viewPosition: 0.5 });
//     } catch {}
//   }, [activeIndex]);

//   /* PanResponder for left/right swipe to jump sections */
//   const panResponder = useRef(
//     PanResponder.create({
//       onStartShouldSetPanResponder: () => false,
//       onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
//       onPanResponderRelease: (_, gesture) => {
//         const dx = gesture.dx;
//         if (Math.abs(dx) < SWIPE_THRESHOLD) return;
//         if (dx < 0) {
//           const next = Math.min(sections.length - 1, activeIndexRef.current + 1);
//           if (next !== activeIndexRef.current) scrollToSectionIndex(next);
//         } else {
//           const prev = Math.max(0, activeIndexRef.current - 1);
//           if (prev !== activeIndexRef.current) scrollToSectionIndex(prev);
//         }
//       },
//     })
//   ).current;

//   /* ---------------- Cart add/remove/note ---------------- */
//   const handleAddQty = useCallback(
//     async (menu: any) => {
//       try {
//         const existing = cartMap[menu.menuId];
//         if (!existing) {
//           const userId = await AsyncStorage.getItem("userId");
//           const payload = { userId: Number(userId), shopId, menuId: menu.menuId, quantity: 1, addons: [], notes: "" };
//           await dispatch(addToCartAsync(payload)).unwrap();
//         } else {
//           await dispatch(updateCartItemAsync({ cartId: existing.cartId, quantity: existing.quantity + 1, addons: existing.addons || [], notes: existing.notes || "" })).unwrap();
//         }
//       } catch (err) {
//         console.error("Add qty error:", err);
//         try {
//           const id = await getUserIdFromToken();
//           if (id) await dispatch(fetchCartAsync({ userId: id, shopId }));
//         } catch {}
//       }
//     },
//     [cartMap, dispatch, shopId]
//   );

//   const handleRemoveQty = useCallback(
//     async (menu: any) => {
//       try {
//         const existing = cartMap[menu.menuId];
//         if (!existing) return;
//         const newQty = existing.quantity - 1;
//         await dispatch(updateCartItemAsync({ cartId: existing.cartId, quantity: newQty, addons: existing.addons || [], notes: newQty > 0 ? existing.notes || "" : "" })).unwrap();
//       } catch (err) {
//         console.error("Remove qty error:", err);
//         try {
//           const id = await getUserIdFromToken();
//           if (id) await dispatch(fetchCartAsync({ userId: id, shopId }));
//         } catch {}
//       }
//     },
//     [cartMap, dispatch, shopId]
//   );

//   const handleSaveNote = useCallback(async () => {
//     try {
//       if (currentMenu && cartMap[currentMenu.menuId]) {
//         const existing = cartMap[currentMenu.menuId];
//         await dispatch(updateCartItemAsync({ cartId: existing.cartId, quantity: existing.quantity, addons: existing.addons || [], notes: noteText || "" })).unwrap();
//       }
//     } catch (err) {
//       console.error("Save note error:", err);
//     } finally {
//       setNoteModalVisible(false);
//       setNoteText("");
//     }
//   }, [cartMap, currentMenu, dispatch, noteText]);

//   /* ---------------- Render helpers ---------------- */
//   const renderMenuRow = useCallback(
//     ({ item }: { item: any }) => {
//       const cartEntry = cartMap[item.menuId];
//       const cartQty = cartEntry?.quantity || 0;
//       const isBest = bestSellerIds.has(Number(item.menuId));

//       return (
//         <View style={styles.menuRow}>
//           <Pressable onPress={() => navigation.navigate("menuDetailScreen" as never, { menuId: item.menuId })}>
//             {item.imageUrl ? <Image source={{ uri: `${BASE_URL}/uploads/menus/${item.imageUrl}` }} style={styles.menuImage} /> : <View style={styles.menuImagePlaceholder} />}
//           </Pressable>

//           <View style={styles.menuLeft}>
//             <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
//               <Text style={styles.menuName} numberOfLines={1}>{item.menuName}</Text>
//               {isBest ? (<View style={styles.bestBadge}><Text style={styles.bestBadgeText}>BEST</Text></View>) : null}
//             </View>

//             <Text style={styles.menuDescription} numberOfLines={1}>{item.ingredients || "Traditional recipe"}</Text>
//             <Text style={styles.price}>₹{item.price}</Text>

//             {cartQty > 0 && (
//               <View style={styles.noteRow}>
//                 {cartEntry?.notes ? (
//                   <>
//                     <Text style={styles.savedNoteInline} numberOfLines={1}>{cartEntry.notes}</Text>
//                     <Pressable onPress={() => { setCurrentMenu(item); setNoteText(cartEntry.notes || ""); setNoteModalVisible(true); }} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
//                       <Ionicons name="create-outline" size={18} color="#562E19" />
//                     </Pressable>
//                   </>
//                 ) : (
//                   <Pressable style={styles.noteButton} onPress={() => { setCurrentMenu(item); setNoteText(""); setNoteModalVisible(true); }}>
//                     <Text style={styles.noteButtonText}>Custom</Text>
//                   </Pressable>
//                 )}
//               </View>
//             )}
//           </View>

//           {cartQty === 0 ? (
//             <Pressable style={styles.addButton} onPress={() => handleAddQty(item)}><Text style={styles.addButtonText}>+ Add</Text></Pressable>
//           ) : (
//             <View style={styles.qtyContainer}>
//               <Pressable onPress={() => handleRemoveQty(item)}><Ionicons name="remove-circle-outline" size={24} color="#562E19" /></Pressable>
//               <Text style={{ marginHorizontal: 8, color: "#A3A3A3" }}>{cartQty}</Text>
//               <Pressable onPress={() => handleAddQty(item)}><Ionicons name="add-circle-outline" size={24} color="#562E19" /></Pressable>
//             </View>
//           )}
//         </View>
//       );
//     },
//     [bestSellerIds, cartMap, handleAddQty, handleRemoveQty, navigation]
//   );

//   const renderSectionHeader = useCallback(({ section }: any) => (
//     <View style={styles.sectionHeader}><Text style={styles.sectionHeaderTitle}>{section.title}</Text></View>
//   ), []);

//   const renderChip = useCallback(({ item, index }: { item: any; index: number }) => {
//     const scaleVal = chipScalesRef.current[index] ?? new Animated.Value(1);
//     const active = index === activeIndex;
//     const bg = active ? "#562E19" : "#fff";
//     const color = active ? "#fff" : "#222";

//     return (
//       <Animated.View style={{ transform: [{ scale: scaleVal }], marginRight: CHIP_GAP }}>
//         <Pressable onPress={() => scrollToSectionIndex(index)} style={[styles.chip, { backgroundColor: bg, borderColor: active ? "#562E19" : "#eee" }]}>
//           <Text style={[styles.chipText, { color }]} numberOfLines={1}>{item.title}</Text>
//         </Pressable>
//       </Animated.View>
//     );
//   }, [activeIndex, scrollToSectionIndex]);

//   /* Defensive ensure chips list sizes match */
//   useEffect(() => {
//     if (sections.length && chipScalesRef.current.length < sections.length) {
//       const toAdd = sections.length - chipScalesRef.current.length;
//       for (let i = 0; i < toAdd; i++) chipScalesRef.current.push(new Animated.Value(1));
//     }
//   }, [sections.length]);

//   const goToCart = useCallback(() => navigation.navigate("cartScreen" as never), [navigation]);

//   /* ---------------- Layout - note about safe area: we apply insets manually ---------------- */
//   return (
//     <View style={[styles.container, { paddingTop: insets.top }]}>
//       <StatusBar barStyle="dark-content" backgroundColor="#fff" />
//       {/* Header */}
//       <View style={[styles.header, { paddingTop: 6 }]}>
//         <Pressable onPress={() => navigation.goBack()} style={{ paddingRight: wp(3) }}>
//           <Ionicons name="chevron-back-outline" size={hp(3.5)} />
//         </Pressable>
//         <Text style={styles.shopName} numberOfLines={1}>{shopData?.shopname || "Shop"}</Text>
//         <CartIconWithBadge />
//       </View>

//       {/* Chips */}
//       <View style={styles.chipsWrapper}>
//         {loadingSections ? (
//           <ActivityIndicator color="#562E19" />
//         ) : (
//           <FlatList
//             ref={(r) => (chipsListRef.current = r)}
//             data={sections}
//             renderItem={({ item, index }) => renderChip({ item, index })}
//             keyExtractor={(it) => String(it.categoryId)}
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={{ paddingHorizontal: wp(4),marginTop:hp(2) }}
//             initialNumToRender={8}
//             maxToRenderPerBatch={12}
//             windowSize={5}
//           />
//         )}
//       </View>

//       {/* SectionList with panResponder for horizontal swipe */}
//       <View style={styles.sectionListWrapper} {...panResponder.panHandlers}>
//         {loadingSections ? (
//           <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//             <ActivityIndicator size="large" color="#562E19" />
//           </View>
//         ) : (
//           <SectionList
//             ref={sectionListRef}
//             sections={sections}
//             keyExtractor={(item: any) => String(item.menuId ?? Math.random())}
//             renderItem={renderMenuRow}
//             renderSectionHeader={renderSectionHeader}
//             onViewableItemsChanged={onViewableItemsChanged}
//             viewabilityConfig={viewabilityConfig}
//             contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, hp(14)) }}
//             stickySectionHeadersEnabled={false}
//           />
//         )}
//       </View>

//       {/* Floating cart (respect bottom inset) */}
//       {totalItems > 0 && (
//         <Pressable style={[styles.cartBar, { bottom: Math.max(insets.bottom, hp(3)) }]} onPress={goToCart}>
//           <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
//             <View style={styles.cartIconWrap}><Ionicons name="cart-outline" size={hp(3)} color="white" /></View>
//             <View>
//               <Text style={styles.cartText}>View Cart</Text>
//               <Text style={styles.cartMeta}>{totalItems} item{totalItems > 1 ? "s" : ""} • ₹{totalPrice.toFixed(0)}</Text>
//             </View>
//           </View>
//           <Ionicons name="chevron-forward-outline" size={hp(3.2)} color="white" />
//         </Pressable>
//       )}

//       {/* Note modal */}
//       <Modal visible={noteModalVisible} transparent animationType="slide" onRequestClose={() => setNoteModalVisible(false)}>
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Custom</Text>
//             <TextInput style={styles.noteInput} value={noteText} onChangeText={setNoteText} placeholder="e.g. No ginger, less sugar..." multiline />
//             <View style={styles.modalActions}>
//               <Pressable style={[styles.modalBtn, { backgroundColor: "#ccc" }]} onPress={() => setNoteModalVisible(false)}><Text>Cancel</Text></Pressable>
//               <Pressable style={[styles.modalBtn, { backgroundColor: "#562E19" }]} onPress={handleSaveNote}><Text style={{ color: "#fff" }}>Save</Text></Pressable>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// export default ShopDetailScreenEnhanced;

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff" },

//   header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: wp(3) },
//   shopName: { fontWeight: "600", fontSize: hp(2.4), maxWidth: SCREEN_W * 0.6 },

//   chipsWrapper: { height: hp(7), justifyContent: "center" },
//   chip: { paddingHorizontal: wp(4), paddingVertical: hp(0.9), borderRadius: 999, borderWidth: 1, borderColor: "#eee", backgroundColor: "#fff", minWidth: wp(22), alignItems: "center", justifyContent: "center" },
//   chipText: { fontSize: hp(1.5), fontWeight: "600" },

//   sectionListWrapper: { flex: 1 },

//   sectionHeader: { backgroundColor: "#fff", paddingHorizontal: wp(4), paddingVertical: hp(1) },
//   sectionHeaderTitle: { fontSize: hp(1.8), fontWeight: "700" },

//   menuRow: { flexDirection: "row", alignItems: "flex-start", paddingHorizontal: wp(4), paddingVertical: hp(1.4), borderBottomWidth: 1, borderBottomColor: "#E8E8E8" },
//   menuImage: { width: wp(20), height: hp(10), borderRadius: 6, backgroundColor: "#f2f2f2" },
//   menuImagePlaceholder: { width: wp(20), height: hp(10), borderRadius: 6, backgroundColor: "#f2f2f2" },

//   menuLeft: { flex: 1, paddingLeft: wp(4), paddingRight: wp(2) },
//   menuName: { fontWeight: "600", fontSize: hp(1.8) },
//   menuDescription: { color: "#A3A3A3", marginTop: hp(0.3) },
//   price: { marginTop: hp(0.6), fontWeight: "700" },

//   addButton: { backgroundColor: "#4D392D", borderRadius: 6, paddingHorizontal: wp(4), paddingVertical: hp(0.8), alignSelf: "flex-start", marginTop: hp(8) },
//   addButtonText: { color: "#fff", fontWeight: "700" },

//   qtyContainer: { flexDirection: "row", alignItems: "center", marginTop: hp(8) },

//   noteButton: { paddingVertical: hp(0.4), paddingHorizontal: wp(3), borderRadius: 4, backgroundColor: "#EFEFEF", marginTop: hp(0.8) },
//   noteButtonText: { color: "#562E19", fontWeight: "500" },
//   noteRow: { flexDirection: "row", alignItems: "center", gap: wp(2), marginTop: hp(0.6) },
//   savedNoteInline: { fontSize: hp(1.35), color: "#562E19", flexShrink: 1 },

//   bestBadge: { backgroundColor: "#FFD700", paddingHorizontal: 6, borderRadius: 6, marginLeft: wp(2) },
//   bestBadgeText: { fontSize: hp(1.1), fontWeight: "700" },

//   cartBar: { position: "absolute", left: wp(4), right: wp(4), backgroundColor: "#562E19", borderRadius: 12, paddingVertical: hp(1.2), paddingHorizontal: wp(4), flexDirection: "row", alignItems: "center", justifyContent: "space-between", elevation: 8, shadowColor: "#562E19", shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
//   cartIconWrap: { width: hp(4.4), height: hp(4.4), borderRadius: 50, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" },
//   cartText: { color: "#fff", fontWeight: "700", fontSize: hp(1.8) },
//   cartMeta: { color: "#fff", opacity: 0.9, fontSize: hp(1.1) },

//   modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", alignItems: "center" },
//   modalContent: { width: wp(86), backgroundColor: "#fff", borderRadius: 10, padding: wp(4) },
//   modalTitle: { fontSize: hp(2), fontWeight: "700", marginBottom: hp(1) },
//   noteInput: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, height: hp(12), textAlignVertical: "top", padding: wp(2) },
//   modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: wp(3), marginTop: hp(1) },
//   modalBtn: { paddingVertical: hp(0.8), paddingHorizontal: wp(3), borderRadius: 6, alignItems: "center", justifyContent: "center" },
// });
// ShopDetailScreenEnhanced.tsx
// import React, {
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";
// import {
//   Animated,
//   Dimensions,
//   FlatList,
//   Modal,
//   PanResponder,
//   Pressable,
//   View,
//   SectionList,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TextInput,
//   Image,
//   ActivityIndicator,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { useNavigation } from "@react-navigation/native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useDispatch, useSelector } from "react-redux";
// import { hp, wp } from "@/src/assets/utils/responsive";
// import CartIconWithBadge from "@/src/components/CartIconBadge";
// import axiosClient from "@/src/api/client";
// import { getUserIdFromToken } from "@/src/assets/utils/getUserIdFromToken";
// import {
//   addToCartAsync,
//   fetchCartAsync,
//   selectCartItems,
//   updateCartItemAsync,
// } from "@/src/Redux/Slice/cartSlice";
// import { selectSelectedShopId } from "@/src/Redux/Slice/selectedShopSlice";
// import { BASE_URL } from "@/api";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { RootState } from "@/src/Redux/store";

// const { width: SCREEN_W } = Dimensions.get("window");
// const SWIPE_THRESHOLD = 60;
// const CHIP_GAP = wp(3);

// type SectionType = { title: string; categoryId: number; data: any[] };

// /* ---------------- Screen ---------------- */
// const ShopDetailScreenEnhanced: React.FC = () => {
//   const navigation = useNavigation();
//   const dispatch = useDispatch();
//   const shopId = useSelector(selectSelectedShopId);
//   const cartItems = useSelector(selectCartItems);
//   const state = useSelector((state) => state); // Debug entire Redux state
//   const insets = useSafeAreaInsets();
//   const profile = useSelector((state: RootState) => state.profile.data);
//   // console.log(profile,"shop deatail");
  
//   // Debug shopId, userId, cartItems, and Redux state
//   // console.log("shopId:", shopId);
//   // console.log("cartItems:", JSON.stringify(cartItems, null, 2));
//   // console.log("Redux state:", JSON.stringify(state, null, 2));
//   useEffect(() => {
//     (async () => {
//       const userId = await getUserIdFromToken();
//       // console.log("userId from getUserIdFromToken:", userId);
//     })();
//   }, []);

//   /* data */
//   const [shopData, setShopData] = useState<any>(null);
//   const [sections, setSections] = useState<SectionType[]>([]);
//   const [bestSellerIds, setBestSellerIds] = useState<Set<number>>(new Set());
//   const [loadingSections, setLoadingSections] = useState<boolean>(true);
//   const [cartLoading, setCartLoading] = useState<boolean>(true);

//   /* note modal */
//   const [noteModalVisible, setNoteModalVisible] = useState(false);
//   const [currentMenu, setCurrentMenu] = useState<any>(null);
//   const [noteText, setNoteText] = useState("");

//   /* UI refs/state */
//   const sectionListRef = useRef<SectionList<any>>(null);
//   const chipsListRef = useRef<FlatList<any> | null>(null);
//   const [activeIndex, setActiveIndex] = useState<number>(0);
//   const activeIndexRef = useRef<number>(0);
//   activeIndexRef.current = activeIndex;

//   const chipScalesRef = useRef<Animated.Value[]>([]);

//   /* local per-menu loading map to prevent double taps */
//   const menuLoadingRef = useRef<Record<number, boolean>>({});

//   /* cart derived */
//   const totalItems = useMemo(
//     () =>
//       cartItems.reduce((acc: number, it: any) => acc + (it.quantity || 0), 0),
//     [cartItems]
//   );
//   const totalPrice = useMemo(
//     () =>
//       cartItems.reduce(
//         (acc: number, it: any) =>
//           acc + Number(it.price || 0) * (it.quantity || 0),
//         0
//       ),
//     [cartItems]
//   );
//   const cartMap = useMemo(() => {
//     const m: Record<number, any> = {};
//     cartItems.forEach((it: any) => {
//       if (it?.menuId != null) m[Number(it.menuId)] = it;
//     });
//     // console.log("cartMap:", JSON.stringify(m, null, 2));
//     return m;
//   }, [cartItems]);

//   /* ---------------- Fetchers ---------------- */
//   const fetchShopDetail = useCallback(async () => {
//     try {
//       const res = await axiosClient.get(`/api/shops/detail/${shopId}`);
//       // console.log(
//       //   "fetchShopDetail response:",
//       //   JSON.stringify(res.data, null, 2)
//       // );
//       setShopData(res.data ?? null);
//     } catch (err: any) {
//       console.warn("fetchShopDetail error", err);
//       // console.log("Failed to load shop details");
//     }
//   }, [shopId]);

//   const fetchCategoriesWithMenus = useCallback(async () => {
//     setLoadingSections(true);
//     try {
//       const res = await axiosClient.get("/api/category/categories-with-menus");
//       // console.log(
//       //   "fetchCategoriesWithMenus response:",
//       //   JSON.stringify(res.data, null, 2)
//       // );
//       const payload = Array.isArray(res?.data?.data)
//         ? res.data.data
//         : Array.isArray(res?.data)
//         ? res.data
//         : [];
//       const shopSections = payload
//         .filter(
//           (c: any) =>
//             Number(c.shop_id) === Number(shopId) || Number(c.is_global) === 1
//         )
//         .map((c: any) => ({
//           title: c.categoryName ?? "Untitled",
//           categoryId: c.categoryId,
//           data: Array.isArray(c.menus) ? c.menus : [],
//         }));

//       setSections(shopSections);
//       chipScalesRef.current.length = 0;
//       shopSections.forEach(() =>
//         chipScalesRef.current.push(new Animated.Value(1))
//       );
//       setActiveIndex(0);
//     } catch (err: any) {
//       console.warn("fetchCategoriesWithMenus error", err);
//       // console.log("Failed to load menu categories");
//       setSections([]);
//     } finally {
//       setLoadingSections(false);
//     }
//   }, [shopId]);

//   const fetchBestSellers = useCallback(async () => {
//     try {
//       const res = await axiosClient.get(`/api/best-sellers/shop/${shopId}`);
//       // console.log(
//       //   "fetchBestSellers response:",
//       //   JSON.stringify(res.data, null, 2)
//       // );
//       const arr = Array.isArray(res?.data) ? res.data : [];
//       setBestSellerIds(new Set(arr.map((r: any) => Number(r.menuId))));
//     } catch (err) {
//       console.warn("fetchBestSellers error", err);
//       setBestSellerIds(new Set());
//     }
//   }, [shopId]);

//   const fetchCartWithRetry = useCallback(async () => {
//     setCartLoading(true);
//     try { 
//       const userId = await profile?.userId
//       // console.log("fetchCartWithRetry params:", { userId, shopId });
//       if (!userId || !shopId) {
//         console.log("Invalid userId or shopId:", { userId, shopId });
//         return;
//       }
//       const result = await dispatch(fetchCartAsync({ shopId })).unwrap();
//       // console.log("fetchCartAsync result:", JSON.stringify(result, null, 2));
//     } catch (err) {
//       console.error("fetchCart error:", err);
//       console.log("Failed to fetch cart, retrying...");
//       setTimeout(async () => {
//         try {
//           const userId = await getUserIdFromToken();
//           // console.log("fetchCartWithRetry retry params:", { userId, shopId });
//           if (userId && shopId) {
//             const result = await dispatch(fetchCartAsync({ shopId })).unwrap();
//         // console.log(result);
        
//           }
//         } catch (retryErr) {
//           console.error("fetchCart retry error:", retryErr);
//           console.log("Failed to fetch cart after retry");
//         }
//       }, 1000);
//     } finally {
//       setCartLoading(false);
//     }
//   }, [dispatch, shopId]);

//   useEffect(() => {
//     if (shopId) {
//       // console.log("useEffect triggered with shopId:", shopId);
//       fetchShopDetail();
//       fetchCategoriesWithMenus();
//       fetchBestSellers();
//       fetchCartWithRetry();
//     } else {
//       console.log("shopId is invalid, cannot fetch data");
//     }
//   }, [
//     shopId,
//     fetchShopDetail,
//     fetchCategoriesWithMenus,
//     fetchBestSellers,
//     fetchCartWithRetry,
//   ]);

//   /* ---------------- SectionList helpers ---------------- */
//   const scrollToSectionIndex = useCallback(
//     (index: number) => {
//       if (!sections.length) return;
//       const idx = Math.max(0, Math.min(index, sections.length - 1));
//       try {
//         sectionListRef.current?.scrollToLocation?.({
//           sectionIndex: idx,
//           itemIndex: 0,
//           viewPosition: 0,
//         });
//       } catch {
//         // fallback: ignore
//       }
//       try {
//         chipsListRef.current?.scrollToIndex?.({
//           index: idx,
//           viewPosition: 0.5,
//         });
//       } catch {}
//       setActiveIndex(idx);
//     },
//     [sections]
//   );

//   const onViewableItemsChanged = useRef(
//     ({ viewableItems }: { viewableItems: any[] }) => {
//       if (!viewableItems || viewableItems.length === 0) return;
//       const first = viewableItems.find((v) => v.section) ?? viewableItems[0];
//       const sectionTitle = first?.section?.title;
//       if (!sectionTitle) return;
//       const idx = sections.findIndex((s) => s.title === sectionTitle);
//       if (idx !== -1 && idx !== activeIndexRef.current) setActiveIndex(idx);
//     }
//   ).current;

//   const viewabilityConfig = useRef({
//     itemVisiblePercentThreshold: 40,
//     minimumViewTime: 50,
//   }).current;

//   /* animate chip scales on activeIndex */
//   useEffect(() => {
//     chipScalesRef.current.forEach((val, i) => {
//       Animated.spring(val, {
//         toValue: i === activeIndex ? 1.06 : 1,
//         useNativeDriver: true,
//         speed: 20,
//         bounciness: 6,
//       }).start();
//     });
//     try {
//       chipsListRef.current?.scrollToIndex?.({
//         index: activeIndex,
//         viewPosition: 0.5,
//       });
//     } catch {}
//   }, [activeIndex]);

//   /* PanResponder for swipe */
//   const panResponder = useRef(
//     PanResponder.create({
//       onStartShouldSetPanResponder: () => false,
//       onMoveShouldSetPanResponder: (_, gesture) =>
//         Math.abs(gesture.dx) > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
//       onPanResponderRelease: (_, gesture) => {
//         const dx = gesture.dx;
//         if (Math.abs(dx) < SWIPE_THRESHOLD) return;
//         if (dx < 0) {
//           const next = Math.min(
//             sections.length - 1,
//             activeIndexRef.current + 1
//           );
//           if (next !== activeIndexRef.current) scrollToSectionIndex(next);
//         } else {
//           const prev = Math.max(0, activeIndexRef.current - 1);
//           if (prev !== activeIndexRef.current) scrollToSectionIndex(prev);
//         }
//       },
//     })
//   ).current;

//   /* ---------------- Cart actions with console logging ---------------- */
//   const setMenuLoading = (menuId: number, v = true) => {
//     menuLoadingRef.current[menuId] = v;
//   };
//   const isMenuLoading = (menuId: number) => !!menuLoadingRef.current[menuId];

//   const handleAddQty = useCallback(
//     async (menu: any) => {
//       if (!menu || !menu.menuId) return;
//       const menuId = Number(menu.menuId);
//       if (isMenuLoading(menuId)) return;
//       setMenuLoading(menuId, true);

//       try {
//         const existing = cartMap[menuId];
//         const userId = await getUserIdFromToken();
//         console.log("handleAddQty params:", {
//           userId,
//           shopId,
//           menuId,
//           existing,
//         });
//         if (!existing) {
//           const payload = {
//             userId: Number(userId),
//             shopId,
//             menuId,
//             quantity: 1,
//             addons: [],
//             notes: "",
//           };
//           await dispatch(addToCartAsync(payload)).unwrap();
//           console.log("Added to cart");
//         } else {
//           await dispatch(
//             updateCartItemAsync({
//               cartId: existing.cartId,
//               quantity: existing.quantity + 1,
//               addons: existing.addons || [],
//               notes: existing.notes || "",
//             })
//           ).unwrap();
//           console.log("Item already in cart — increased quantity");
//         }
//         try {
//           const id = await getUserIdFromToken();
//           if (id) {
//             const result = await dispatch(fetchCartAsync({ shopId })).unwrap();
//             console.log(
//               "fetchCartAsync after add:",
//               JSON.stringify(result, null, 2)
//             );
//           }
//         } catch {}
//       } catch (err: any) {
//         console.error("Add qty error:", err);
//         console.log(err?.message || "Failed to add item");
//         try {
//           const id = await getUserIdFromToken();
//           if (id) {
//             const result = await dispatch(fetchCartAsync({ shopId })).unwrap();
//             console.log(
//               "fetchCartAsync after error:",
//               JSON.stringify(result, null, 2)
//             );
//           }
//         } catch {}
//       } finally {
//         setMenuLoading(menuId, false);
//       }
//     },
//     [cartMap, dispatch, shopId]
//   );

//   const handleRemoveQty = useCallback(
//     async (menu: any) => {
//       if (!menu || !menu.menuId) return;
//       const menuId = Number(menu.menuId);
//       if (isMenuLoading(menuId)) return;
//       setMenuLoading(menuId, true);

//       try {
//         const existing = cartMap[menuId];
//         console.log("handleRemoveQty params:", { menuId, existing });
//         if (!existing) {
//           console.log("Item not in cart");
//           return;
//         }
//         const newQty = existing.quantity - 1;
//         const res = await dispatch(
//           updateCartItemAsync({
//             cartId: existing.cartId,
//             quantity: newQty,
//             addons: existing.addons || [],
//             notes: newQty > 0 ? existing.notes || "" : "",
//           })
//         ).unwrap();
//         console.log(
//           "updateCartItemAsync result:",
//           JSON.stringify(res, null, 2)
//         );
//         if (res?.deleted) {
//           console.log("Removed from cart");
//         } else {
//           console.log("Quantity updated");
//         }
//         try {
//           const id = await getUserIdFromToken();
//           if (id) {
//             const result = await dispatch(fetchCartAsync({ shopId })).unwrap();
//             console.log(
//               "fetchCartAsync after remove:",
//               JSON.stringify(result, null, 2)
//             );
//           }
//         } catch {}
//       } catch (err: any) {
//         console.error("Remove qty error:", err);
//         console.log(err?.message || "Failed to update quantity");
//         try {
//           const id = await getUserIdFromToken();
//           if (id) {
//             const result = await dispatch(fetchCartAsync({ shopId })).unwrap();
//             console.log(
//               "fetchCartAsync after error:",
//               JSON.stringify(result, null, 2)
//             );
//           }
//         } catch {}
//       } finally {
//         setMenuLoading(menuId, false);
//       }
//     },
//     [cartMap, dispatch, shopId]
//   );

//   const handleSaveNote = useCallback(async () => {
//     try {
//       if (currentMenu && cartMap[Number(currentMenu.menuId)]) {
//         const existing = cartMap[Number(currentMenu.menuId)];
//         console.log("handleSaveNote params:", {
//           menuId: currentMenu.menuId,
//           notes: noteText,
//         });
//         await dispatch(
//           updateCartItemAsync({
//             cartId: existing.cartId,
//             quantity: existing.quantity,
//             addons: existing.addons || [],
//             notes: noteText || "",
//           })
//         ).unwrap();
//         console.log("Notes saved");
//         try {
//           const id = await getUserIdFromToken();
//           if (id) {
//             const result = await dispatch(fetchCartAsync({ shopId })).unwrap();
//             console.log(
//               "fetchCartAsync after note save:",
//               JSON.stringify(result, null, 2)
//             );
//           }
//         } catch {}
//       } else {
//         console.log("Item not in cart");
//       }
//     } catch (err: any) {
//       console.error("Save note error:", err);
//       console.log(err?.message || "Failed to save note");
//     } finally {
//       setNoteModalVisible(false);
//       setNoteText("");
//     }
//   }, [cartMap, currentMenu, dispatch, noteText, shopId]);

//   /* ---------------- Render helpers ---------------- */
//   const renderMenuRow = useCallback(
//     ({ item }: { item: any }) => {
//       const menuId = Number(item.menuId);
//       const cartEntry = cartMap[menuId];
//       const cartQty = cartEntry?.quantity || 0;
//       const isBest = bestSellerIds.has(menuId);
//       const localLoading = isMenuLoading(menuId);

//       console.log(
//         `Menu ID: ${menuId}, Cart Entry:`,
//         cartEntry,
//         `Cart Qty: ${cartQty}`
//       );

//       return (
//         <View style={styles.menuRow}>
//           <Pressable
//             onPress={() =>
//               navigation.navigate("menuDetailScreen" as never, {
//                 menuId: item.menuId,
//               })
//             }
//           >
//             {item.imageUrl ? (
//               <Image
//                 source={{ uri: `${BASE_URL}/Uploads/menus/${item.imageUrl}` }}
//                 style={styles.menuImage}
//               />
//             ) : (
//               <View style={styles.menuImagePlaceholder} />
//             )}
//           </Pressable>

//           <View style={styles.menuLeft}>
//             <View
//               style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
//             >
//               <Text style={styles.menuName} numberOfLines={1}>
//                 {item.menuName}
//               </Text>
//               {isBest ? (
//                 <View style={styles.bestBadge}>
//                   <Text style={styles.bestBadgeText}>BEST</Text>
//                 </View>
//               ) : null}
//             </View>

//             <Text style={styles.menuDescription} numberOfLines={1}>
//               {item.ingredients || "Traditional recipe"}
//             </Text>
//             <Text style={styles.price}>₹{item.price}</Text>

//             {cartQty > 0 && (
//               <View style={styles.noteRow}>
//                 {cartEntry?.notes ? (
//                   <>
//                     <Text style={styles.savedNoteInline} numberOfLines={1}>
//                       {cartEntry.notes}
//                     </Text>
//                     <Pressable
//                       onPress={() => {
//                         setCurrentMenu(item);
//                         setNoteText(cartEntry.notes || "");
//                         setNoteModalVisible(true);
//                       }}
//                       hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
//                     >
//                       <Ionicons
//                         name="create-outline"
//                         size={18}
//                         color="#562E19"
//                       />
//                     </Pressable>
//                   </>
//                 ) : (
//                   <Pressable
//                     style={styles.noteButton}
//                     onPress={() => {
//                       setCurrentMenu(item);
//                       setNoteText("");
//                       setNoteModalVisible(true);
//                     }}
//                   >
//                     <Text style={styles.noteButtonText}>Custom</Text>
//                   </Pressable>
//                 )}
//               </View>
//             )}
//           </View>

//           {cartQty === 0 ? (
//             <Pressable
//               style={styles.addButton}
//               onPress={() => handleAddQty(item)}
//               disabled={localLoading}
//             >
//               {localLoading ? (
//                 <ActivityIndicator color="#fff" />
//               ) : (
//                 <Text style={styles.addButtonText}>+ Add</Text>
//               )}
//             </Pressable>
//           ) : (
//             <View style={styles.qtyContainer}>
//               <Pressable
//                 onPress={() => handleRemoveQty(item)}
//                 disabled={localLoading}
//                 hitSlop={{ top: 6, left: 6, right: 6, bottom: 6 }}
//               >
//                 <Ionicons
//                   name="remove-circle-outline"
//                   size={24}
//                   color="#562E19"
//                 />
//               </Pressable>
//               <Text style={{ marginHorizontal: 8, color: "#A3A3A3" }}>
//                 {cartQty}
//               </Text>
//               <Pressable
//                 onPress={() => handleAddQty(item)}
//                 disabled={localLoading}
//                 hitSlop={{ top: 6, left: 6, right: 6, bottom: 6 }}
//               >
//                 <Ionicons name="add-circle-outline" size={24} color="#562E19" />
//               </Pressable>
//             </View>
//           )}
//         </View>
//       );
//     },
//     [bestSellerIds, cartMap, handleAddQty, handleRemoveQty, navigation]
//   );

//   const renderSectionHeader = useCallback(({ section }: any) => {
//     return (
//       <View style={styles.sectionHeader}>
//         <Text style={styles.sectionHeaderTitle}>{section.title}</Text>
//       </View>
//     );
//   }, []);

//   const renderChip = useCallback(
//     ({ item, index }: { item: any; index: number }) => {
//       const scaleVal = chipScalesRef.current[index] ?? new Animated.Value(1);
//       const active = index === activeIndex;
//       const bg = active ? "#562E19" : "#fff";
//       const color = active ? "#fff" : "#222";

//       return (
//         <Animated.View
//           style={{ transform: [{ scale: scaleVal }], marginRight: CHIP_GAP }}
//         >
//           <Pressable
//             onPress={() => scrollToSectionIndex(index)}
//             style={[
//               styles.chip,
//               { backgroundColor: bg, borderColor: active ? "#562E19" : "#eee" },
//             ]}
//           >
//             <Text style={[styles.chipText, { color }]} numberOfLines={1}>
//               {item.title}
//             </Text>
//           </Pressable>
//         </Animated.View>
//       );
//     },
//     [activeIndex, scrollToSectionIndex]
//   );

//   useEffect(() => {
//     if (sections.length && chipScalesRef.current.length < sections.length) {
//       const toAdd = sections.length - chipScalesRef.current.length;
//       for (let i = 0; i < toAdd; i++)
//         chipScalesRef.current.push(new Animated.Value(1));
//     }
//   }, [sections.length]);

//   const goToCart = useCallback(
//     () => navigation.navigate("cartScreen" as never),
//     [navigation]
//   );

//   return (
//     <View style={[styles.container, { paddingTop: insets.top }]}>
//       <StatusBar barStyle="dark-content" backgroundColor="#fff" />
//       <View style={[styles.header, { paddingTop: 6 }]}>
//         <Pressable
//           onPress={() => navigation.goBack()}
//           style={{ paddingRight: wp(3) }}
//         >
//           <Ionicons name="chevron-back-outline" size={hp(3.5)} />
//         </Pressable>
//         <Text style={styles.shopName} numberOfLines={1}>
//           {shopData?.shopname || "Shop"}
//         </Text>
//         <CartIconWithBadge />
//       </View>
//       <View style={styles.chipsWrapper}>
//         {loadingSections ? (
//           <ActivityIndicator color="#562E19" />
//         ) : (
//           <FlatList
//             ref={(r) => (chipsListRef.current = r)}
//             data={sections}
//             renderItem={({ item, index }) => renderChip({ item, index })}
//             keyExtractor={(it) => String(it.categoryId)}
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={{
//               paddingHorizontal: wp(4),
//               marginTop: hp(2),
//             }}
//             initialNumToRender={8}
//             maxToRenderPerBatch={12}
//             windowSize={5}
//           />
//         )}
//       </View>
//       <View style={styles.sectionListWrapper} {...panResponder.panHandlers}>
//         {loadingSections || cartLoading ? (
//           <View
//             style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
//           >
//             <ActivityIndicator size="large" color="#562E19" />
//           </View>
//         ) : (
//           <SectionList
//             ref={sectionListRef}
//             sections={sections}
//             keyExtractor={(item: any) => String(item.menuId ?? Math.random())}
//             renderItem={renderMenuRow}
//             renderSectionHeader={renderSectionHeader}
//             onViewableItemsChanged={onViewableItemsChanged}
//             viewabilityConfig={viewabilityConfig}
//             contentContainerStyle={{
//               paddingBottom: Math.max(insets.bottom, hp(14)),
//             }}
//             stickySectionHeadersEnabled={false}
//           />
//         )}
//       </View>
//       {totalItems > 0 && (
//         <Pressable
//           style={[styles.cartBar, { bottom: Math.max(insets.bottom, hp(3)) }]}
//           onPress={goToCart}
//         >
//           <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
//             <View style={styles.cartIconWrap}>
//               <Ionicons name="cart-outline" size={hp(3)} color="white" />
//             </View>
//             <View>
//               <Text style={styles.cartText}>View Cart</Text>
//               <Text style={styles.cartMeta}>
//                 {totalItems} item{totalItems > 1 ? "s" : ""} • ₹
//                 {totalPrice.toFixed(0)}
//               </Text>
//             </View>
//           </View>
//           <Ionicons
//             name="chevron-forward-outline"
//             size={hp(3.2)}
//             color="white"
//           />
//         </Pressable>
//       )}
//       <Modal
//         visible={noteModalVisible}
//         transparent
//         animationType="slide"
//         onRequestClose={() => setNoteModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Custom</Text>
//             <TextInput
//               style={styles.noteInput}
//               value={noteText}
//               onChangeText={setNoteText}
//               placeholder="e.g. No ginger, less sugar..."
//               multiline
//             />
//             <View style={styles.modalActions}>
//               <Pressable
//                 style={[styles.modalBtn, { backgroundColor: "#ccc" }]}
//                 onPress={() => setNoteModalVisible(false)}
//               >
//                 <Text>Cancel</Text>
//               </Pressable>
//               <Pressable
//                 style={[styles.modalBtn, { backgroundColor: "#562E19" }]}
//                 onPress={handleSaveNote}
//               >
//                 <Text style={{ color: "#fff" }}>Save</Text>
//               </Pressable>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// export default ShopDetailScreenEnhanced;

// /* ---------------- Styles ---------------- */
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff" },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: wp(3),
//   },
//   shopName: { fontWeight: "600", fontSize: hp(2.4), maxWidth: SCREEN_W * 0.6 },
//   chipsWrapper: { height: hp(7), justifyContent: "center" },
//   chip: {
//     paddingHorizontal: wp(4),
//     paddingVertical: hp(0.9),
//     borderRadius: 999,
//     borderWidth: 1,
//     borderColor: "#eee",
//     backgroundColor: "#fff",
//     minWidth: wp(22),
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   chipText: { fontSize: hp(1.5), fontWeight: "600" },
//   sectionListWrapper: { flex: 1 },
//   sectionHeader: {
//     backgroundColor: "#fff",
//     paddingHorizontal: wp(4),
//     paddingVertical: hp(1),
//   },
//   sectionHeaderTitle: { fontSize: hp(1.8), fontWeight: "700" },
//   menuRow: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     paddingHorizontal: wp(4),
//     paddingVertical: hp(1.4),
//     borderBottomWidth: 1,
//     borderBottomColor: "#E8E8E8",
//   },
//   menuImage: {
//     width: wp(20),
//     height: hp(10),
//     borderRadius: 6,
//     backgroundColor: "#f2f2f2",
//   },
//   menuImagePlaceholder: {
//     width: wp(20),
//     height: hp(10),
//     borderRadius: 6,
//     backgroundColor: "#f2f2f2",
//   },
//   menuLeft: { flex: 1, paddingLeft: wp(4), paddingRight: wp(2) },
//   menuName: { fontWeight: "600", fontSize: hp(1.8) },
//   menuDescription: { color: "#A3A3A3", marginTop: hp(0.3) },
//   price: { marginTop: hp(0.6), fontWeight: "700" },
//   addButton: {
//     backgroundColor: "#4D392D",
//     borderRadius: 6,
//     paddingHorizontal: wp(4),
//     paddingVertical: hp(0.8),
//     alignSelf: "flex-start",
//     marginTop: hp(8),
//     minWidth: wp(18),
//     alignItems: "center",
//   },
//   addButtonText: { color: "#fff", fontWeight: "700" },
//   qtyContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: hp(8),
//   },
//   noteButton: {
//     paddingVertical: hp(0.4),
//     paddingHorizontal: wp(3),
//     borderRadius: 4,
//     backgroundColor: "#EFEFEF",
//     marginTop: hp(0.8),
//   },
//   noteButtonText: { color: "#562E19", fontWeight: "500" },
//   noteRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: wp(2),
//     marginTop: hp(0.6),
//   },
//   savedNoteInline: { fontSize: hp(1.35), color: "#562E19", flexShrink: 1 },
//   bestBadge: {
//     backgroundColor: "#FFD700",
//     paddingHorizontal: 6,
//     borderRadius: 6,
//     marginLeft: wp(2),
//   },
//   bestBadgeText: { fontSize: hp(1.1), fontWeight: "700" },
//   cartBar: {
//     position: "absolute",
//     left: wp(4),
//     right: wp(4),
//     backgroundColor: "#562E19",
//     borderRadius: 12,
//     paddingVertical: hp(1.2),
//     paddingHorizontal: wp(4),
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     elevation: 8,
//     shadowColor: "#562E19",
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     shadowOffset: { width: 0, height: 4 },
//   },
//   cartIconWrap: {
//     width: hp(4.4),
//     height: hp(4.4),
//     borderRadius: 50,
//     backgroundColor: "rgba(255,255,255,0.12)",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   cartText: { color: "#fff", fontWeight: "700", fontSize: hp(1.8) },
//   cartMeta: { color: "#fff", opacity: 0.9, fontSize: hp(1.1) },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.35)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalContent: {
//     width: wp(86),
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: wp(4),
//   },
//   modalTitle: { fontSize: hp(2), fontWeight: "700", marginBottom: hp(1) },
//   noteInput: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 8,
//     height: hp(12),
//     textAlignVertical: "top",
//     padding: wp(2),
//   },
//   modalActions: {
//     flexDirection: "row",
//     justifyContent: "flex-end",
//     gap: wp(3),
//     marginTop: hp(1),
//   },
//   modalBtn: {
//     paddingVertical: hp(0.8),
//     paddingHorizontal: wp(3),
//     borderRadius: 6,
//     alignItems: "center",
//     justifyContent: "center",
//   },
// });
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Modal,
  PanResponder,
  Pressable,
  View,
  SectionList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { hp, wp } from "@/src/assets/utils/responsive";
import CartIconWithBadge from "@/src/components/CartIconBadge";
import axiosClient from "@/src/api/client";
import { getUserIdFromToken } from "@/src/assets/utils/getUserIdFromToken";
import {
  addToCartAsync,
  fetchCartAsync,
  selectCartItems,
  updateCartItemAsync,
} from "@/src/Redux/Slice/cartSlice";
import { selectSelectedShopId } from "@/src/Redux/Slice/selectedShopSlice";
import { BASE_URL } from "@/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { RootState } from "@/src/Redux/store";

const { width: SCREEN_W } = Dimensions.get("window");
const SWIPE_THRESHOLD = 60;
const CHIP_GAP = wp(3);

type SectionType = { title: string; categoryId: number; data: any[] };

/**
 * Small, memoized MenuRow component to avoid re-renders when unrelated state changes.
 * Receives only the props it needs and uses stable handlers passed from parent.
 */
const MenuRow = React.memo(function MenuRow({
  item,
  cartEntry,
  onAdd,
  onRemove,
  onOpenNote,
  isBest,
  localLoading,
}: {
  item: any;
  cartEntry: any | undefined;
  onAdd: (m: any) => void;
  onRemove: (m: any) => void;
  onOpenNote: (m: any) => void;
  isBest: boolean;
  localLoading: boolean;
}) {
  const cartQty = cartEntry?.quantity || 0;
  return (
    <View style={styles.menuRow}>
      <Pressable onPress={() => { /* navigate handled by parent if needed */ }}>
        {item.imageUrl ? (
          <Image source={{ uri: `${BASE_URL}/uploads/menus/${item.imageUrl}` }} style={styles.menuImage} />
        ) : (
          <View style={styles.menuImagePlaceholder} />
        )}
      </Pressable>

      <View style={styles.menuLeft}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={styles.menuName} numberOfLines={1}>
            {item.menuName}
          </Text>
          {isBest ? (
            <View style={styles.bestBadge}>
              <Text style={styles.bestBadgeText}>BEST</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.menuDescription} numberOfLines={1}>
          {item.ingredients || "Traditional recipe"}
        </Text>
        <Text style={styles.price}>₹{item.price}</Text>

        {cartQty > 0 && (
          <View style={styles.noteRow}>
            {cartEntry?.notes ? (
              <>
                <Text style={styles.savedNoteInline} numberOfLines={1}>
                  {cartEntry.notes}
                </Text>
                <Pressable onPress={() => onOpenNote(item)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                  <Ionicons name="create-outline" size={18} color="#562E19" />
                </Pressable>
              </>
            ) : (
              <Pressable style={styles.noteButton} onPress={() => onOpenNote(item)}>
                <Text style={styles.noteButtonText}>Custom</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>

      {cartQty === 0 ? (
        <Pressable style={styles.addButton} onPress={() => onAdd(item)} disabled={localLoading}>
          {localLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.addButtonText}>+ Add</Text>}
        </Pressable>
      ) : (
        <View style={styles.qtyContainer}>
          <Pressable onPress={() => onRemove(item)} disabled={localLoading} hitSlop={{ top: 6, left: 6, right: 6, bottom: 6 }}>
            <Ionicons name="remove-circle-outline" size={24} color="#562E19" />
          </Pressable>
          <Text style={{ marginHorizontal: 8, color: "#A3A3A3" }}>{cartQty}</Text>
          <Pressable onPress={() => onAdd(item)} disabled={localLoading} hitSlop={{ top: 6, left: 6, right: 6, bottom: 6 }}>
            <Ionicons name="add-circle-outline" size={24} color="#562E19" />
          </Pressable>
        </View>
      )}
    </View>
  );
});

const ChipItem = React.memo(function ChipItem({ title, active, onPress, scaleValue }: { title: string; active: boolean; onPress: () => void; scaleValue: Animated.Value }) {
  const bg = active ? "#562E19" : "#fff";
  const color = active ? "#fff" : "#222";
  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }], marginRight: CHIP_GAP }}>
      <Pressable onPress={onPress} style={[styles.chip, { backgroundColor: bg, borderColor: active ? "#562E19" : "#eee" }]}>
        <Text style={[styles.chipText, { color }]} numberOfLines={1}>
          {title}
        </Text>
      </Pressable>
    </Animated.View>
  );
});

const ShopDetailScreenEnhanced: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const shopId = useSelector(selectSelectedShopId);
  const cartItems = useSelector(selectCartItems, shallowEqual);
  const profile = useSelector((s: RootState) => s.profile.data);
  const insets = useSafeAreaInsets();

  const [shopData, setShopData] = useState<any>(null);
  const [sections, setSections] = useState<SectionType[]>([]);
  const [bestSellerIds, setBestSellerIds] = useState<Set<number>>(new Set());
  const [loadingSections, setLoadingSections] = useState<boolean>(true);
  const [cartLoading, setCartLoading] = useState<boolean>(true);

  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [currentMenu, setCurrentMenu] = useState<any>(null);
  const [noteText, setNoteText] = useState("");

  const sectionListRef = useRef<SectionList<any>>(null);
  const chipsListRef = useRef<FlatList<any> | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const activeIndexRef = useRef<number>(0);
  activeIndexRef.current = activeIndex;

  const chipScalesRef = useRef<Animated.Value[]>([]);
  const menuLoadingRef = useRef<Record<number, boolean>>({});

  // derived
  const totalItems = useMemo(() => cartItems.reduce((acc: number, it: any) => acc + (it.quantity || 0), 0), [cartItems]);
  const totalPrice = useMemo(() => cartItems.reduce((acc: number, it: any) => acc + Number(it.price || 0) * (it.quantity || 0), 0), [cartItems]);
  const cartMap = useMemo(() => {
    const m: Record<number, any> = {};
    cartItems.forEach((it: any) => { if (it?.menuId != null) m[Number(it.menuId)] = it; });
    return m;
  }, [cartItems]);

  // init scales when sections change
  useEffect(() => {
    chipScalesRef.current.length = 0;
    sections.forEach(() => chipScalesRef.current.push(new Animated.Value(1)));
  }, [sections]);

  const fetchShopDetail = useCallback(async () => {
    try {
      const res = await axiosClient.get(`/api/shops/detail/${shopId}`);
      setShopData(res.data ?? null);
    } catch (err) {
      // swallow, optionally surface toast
    }
  }, [shopId]);

  const fetchCategoriesWithMenus = useCallback(async () => {
    setLoadingSections(true);
    try {
      const res = await axiosClient.get("/api/category/categories-with-menus");
      const payload = Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : [];
      const shopSections = payload.filter((c: any) => Number(c.shop_id) === Number(shopId) || Number(c.is_global) === 1)
        .map((c: any) => ({ title: c.categoryName ?? "Untitled", categoryId: c.categoryId, data: Array.isArray(c.menus) ? c.menus : [] }));
      setSections(shopSections);
      setActiveIndex(0);
    } catch (err) {
      setSections([]);
    } finally {
      setLoadingSections(false);
    }
  }, [shopId]);

  const fetchBestSellers = useCallback(async () => {
    try {
      const res = await axiosClient.get(`/api/best-sellers/shop/${shopId}`);
      const arr = Array.isArray(res?.data) ? res.data : [];
      setBestSellerIds(new Set(arr.map((r: any) => Number(r.menuId))));
    } catch (err) {
      setBestSellerIds(new Set());
    }
  }, [shopId]);

  // Fetch cart once profile.userId is available. This avoids racing with auth.
  const fetchCartSafe = useCallback(async () => {
    if (!shopId || !profile?.userId) return;
    setCartLoading(true);
    try {
      await dispatch(fetchCartAsync({ shopId })).unwrap();
    } catch (err) {
      // ignore - UI will reflect empty/failure
    } finally {
      setCartLoading(false);
    }
  }, [dispatch, shopId, profile?.userId]);

  useEffect(() => {
    if (!shopId) return;
    fetchShopDetail();
    fetchCategoriesWithMenus();
    fetchBestSellers();
  }, [shopId, fetchShopDetail, fetchCategoriesWithMenus, fetchBestSellers]);

  useEffect(() => {
    // when profile becomes available, load cart
    fetchCartSafe();
  }, [profile?.userId, fetchCartSafe]);

  // scrolling helpers
  const scrollToSectionIndex = useCallback((index: number) => {
    if (!sections.length) return;
    const idx = Math.max(0, Math.min(index, sections.length - 1));
    sectionListRef.current?.scrollToLocation?.({ sectionIndex: idx, itemIndex: 0, viewPosition: 0 });
    try { chipsListRef.current?.scrollToIndex?.({ index: idx, viewPosition: 0.5 }); } catch {}
    setActiveIndex(idx);
  }, [sections]);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: any[] }) => {
    if (!viewableItems || viewableItems.length === 0) return;
    const first = viewableItems.find((v) => v.section) ?? viewableItems[0];
    const sectionTitle = first?.section?.title;
    if (!sectionTitle) return;
    const idx = sections.findIndex((s) => s.title === sectionTitle);
    if (idx !== -1 && idx !== activeIndexRef.current) setActiveIndex(idx);
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 40, minimumViewTime: 50 }).current;

  // animate chip scales when activeIndex changes
  useEffect(() => {
    chipScalesRef.current.forEach((val, i) => {
      Animated.spring(val, { toValue: i === activeIndex ? 1.06 : 1, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
    });
    try { chipsListRef.current?.scrollToIndex?.({ index: activeIndex, viewPosition: 0.5 }); } catch {}
  }, [activeIndex]);

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
    onPanResponderRelease: (_, gesture) => {
      const dx = gesture.dx;
      if (Math.abs(dx) < SWIPE_THRESHOLD) return;
      if (dx < 0) {
        const next = Math.min(sections.length - 1, activeIndexRef.current + 1);
        if (next !== activeIndexRef.current) scrollToSectionIndex(next);
      } else {
        const prev = Math.max(0, activeIndexRef.current - 1);
        if (prev !== activeIndexRef.current) scrollToSectionIndex(prev);
      }
    },
  })).current;

  // menu loading locks
  const setMenuLoading = useCallback((menuId: number, v = true) => { menuLoadingRef.current[menuId] = v; }, []);
  const isMenuLoading = useCallback((menuId: number) => !!menuLoadingRef.current[menuId], []);

  const handleAddQty = useCallback(async (menu: any) => {
    if (!menu?.menuId) return;
    const menuId = Number(menu.menuId);
    if (isMenuLoading(menuId)) return;
    setMenuLoading(menuId, true);
    try {
      const existing = cartMap[menuId];
      if (!existing) {
        const userId = profile?.userId ?? await getUserIdFromToken();
        const payload = { userId: Number(userId), shopId, menuId, quantity: 1, addons: [], notes: "" };
        await dispatch(addToCartAsync(payload)).unwrap();
      } else {
        await dispatch(updateCartItemAsync({ cartId: existing.cartId, quantity: existing.quantity + 1, addons: existing.addons || [], notes: existing.notes || "" })).unwrap();
      }
      // refresh cart to ensure canonical state
      if (profile?.userId) await dispatch(fetchCartAsync({ shopId })).unwrap();
    } catch (err) {
      // optionally report error
    } finally {
      setMenuLoading(menuId, false);
    }
  }, [dispatch, profile?.userId, shopId, cartMap, isMenuLoading, setMenuLoading]);

  const handleRemoveQty = useCallback(async (menu: any) => {
    if (!menu?.menuId) return;
    const menuId = Number(menu.menuId);
    if (isMenuLoading(menuId)) return;
    setMenuLoading(menuId, true);
    try {
      const existing = cartMap[menuId];
      if (!existing) return;
      const newQty = existing.quantity - 1;
      await dispatch(updateCartItemAsync({ cartId: existing.cartId, quantity: newQty, addons: existing.addons || [], notes: newQty > 0 ? existing.notes || "" : "" })).unwrap();
      if (profile?.userId) await dispatch(fetchCartAsync({ shopId })).unwrap();
    } catch (err) {
      // ignore
    } finally {
      setMenuLoading(menuId, false);
    }
  }, [dispatch, profile?.userId, shopId, cartMap, isMenuLoading, setMenuLoading]);

  const handleSaveNote = useCallback(async () => {
    try {
      if (currentMenu && cartMap[Number(currentMenu.menuId)]) {
        const existing = cartMap[Number(currentMenu.menuId)];
        await dispatch(updateCartItemAsync({ cartId: existing.cartId, quantity: existing.quantity, addons: existing.addons || [], notes: noteText || "" })).unwrap();
        if (profile?.userId) await dispatch(fetchCartAsync({ shopId })).unwrap();
      }
    } catch (err) {
      // ignore
    } finally {
      setNoteModalVisible(false);
      setNoteText("");
    }
  }, [currentMenu, dispatch, noteText, cartMap, profile?.userId, shopId]);

  // render helpers (stable references)
  const renderMenuRow = useCallback(({ item }: { item: any }) => {
    const menuId = Number(item.menuId);
    const cartEntry = cartMap[menuId];
    const isBest = bestSellerIds.has(menuId);
    const localLoading = isMenuLoading(menuId);
    return (
      <MenuRow
        item={item}
        cartEntry={cartEntry}
        onAdd={handleAddQty}
        onRemove={handleRemoveQty}
        onOpenNote={(m) => { setCurrentMenu(m); setNoteText(cartEntry?.notes || ""); setNoteModalVisible(true); }}
        isBest={isBest}
        localLoading={localLoading}
      />
    );
  }, [cartMap, bestSellerIds, handleAddQty, handleRemoveQty, isMenuLoading]);

  const renderSectionHeader = useCallback(({ section }: any) => (
    <View style={styles.sectionHeader}><Text style={styles.sectionHeaderTitle}>{section.title}</Text></View>
  ), []);

  const renderChip = useCallback(({ item, index }: { item: any; index: number }) => {
    const scaleVal = chipScalesRef.current[index] ?? new Animated.Value(1);
    const active = index === activeIndex;
    return <ChipItem title={item.title} active={active} onPress={() => scrollToSectionIndex(index)} scaleValue={scaleVal} />;
  }, [activeIndex, scrollToSectionIndex]);

  // avoid Math.random keys — rely on stable menuId
  const keyExtractor = useCallback((item: any) => String(item.menuId ?? "-"), []);

  const goToCart = useCallback(() => (navigation as any).navigate("cartScreen"), [navigation]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}> 
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={[styles.header, { paddingTop: 6 }]}>
        <Pressable onPress={() => (navigation as any).goBack()} style={{ paddingRight: wp(3) }}>
          <Ionicons name="chevron-back-outline" size={hp(3.5)} />
        </Pressable>
        <Text style={styles.shopName} numberOfLines={1}>{shopData?.shopname || "Shop"}</Text>
        <CartIconWithBadge />
      </View>

      <View style={styles.chipsWrapper}>
        {loadingSections ? <ActivityIndicator color="#562E19" /> : (
          <FlatList
            ref={(r) => (chipsListRef.current = r)}
            data={sections}
            renderItem={renderChip}
            keyExtractor={(it) => String(it.categoryId)}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: wp(4), marginTop: hp(2) }}
            initialNumToRender={8}
            maxToRenderPerBatch={12}
            windowSize={5}
            removeClippedSubviews
          />
        )}
      </View>

      <View style={styles.sectionListWrapper} {...panResponder.panHandlers}>
        {loadingSections || cartLoading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}><ActivityIndicator size="large" color="#562E19" /></View>
        ) : (
          <SectionList
            ref={sectionListRef}
            sections={sections}
            keyExtractor={keyExtractor}
            renderItem={renderMenuRow}
            renderSectionHeader={renderSectionHeader}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, hp(14)) }}
            stickySectionHeadersEnabled={false}
            initialNumToRender={10}
            maxToRenderPerBatch={12}
            windowSize={7}
          />
        )}
      </View>

      {totalItems > 0 && (
        <Pressable style={[styles.cartBar, { bottom: Math.max(insets.bottom, hp(3)) }]} onPress={goToCart}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={styles.cartIconWrap}><Ionicons name="cart-outline" size={hp(3)} color="white" /></View>
            <View>
              <Text style={styles.cartText}>View Cart</Text>
              <Text style={styles.cartMeta}>{totalItems} item{totalItems>1?"s":""} • ₹{totalPrice.toFixed(0)}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward-outline" size={hp(3.2)} color="white" />
        </Pressable>
      )}

      <Modal visible={noteModalVisible} transparent animationType="slide" onRequestClose={() => setNoteModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Custom</Text>
            <TextInput style={styles.noteInput} value={noteText} onChangeText={setNoteText} placeholder="e.g. No ginger, less sugar..." multiline />
            <View style={styles.modalActions}>
              <Pressable style={[styles.modalBtn, { backgroundColor: "#ccc" }]} onPress={() => setNoteModalVisible(false)}><Text>Cancel</Text></Pressable>
              <Pressable style={[styles.modalBtn, { backgroundColor: "#562E19" }]} onPress={handleSaveNote}><Text style={{ color: "#fff" }}>Save</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ShopDetailScreenEnhanced;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: wp(3) },
  shopName: { fontWeight: "600", fontSize: hp(2.4), maxWidth: SCREEN_W * 0.6 },
  chipsWrapper: { height: hp(7), justifyContent: "center" },
  chip: { paddingHorizontal: wp(4), paddingVertical: hp(0.9), borderRadius: 999, borderWidth: 1, borderColor: "#eee", backgroundColor: "#fff", minWidth: wp(22), alignItems: "center", justifyContent: "center" },
  chipText: { fontSize: hp(1.5), fontWeight: "600" },
  sectionListWrapper: { flex: 1 },
  sectionHeader: { backgroundColor: "#fff", paddingHorizontal: wp(4), paddingVertical: hp(1) },
  sectionHeaderTitle: { fontSize: hp(1.8), fontWeight: "700" },
  menuRow: { flexDirection: "row", alignItems: "flex-start", paddingHorizontal: wp(4), paddingVertical: hp(1.4), borderBottomWidth: 1, borderBottomColor: "#E8E8E8" },
  menuImage: { width: wp(20), height: hp(10), borderRadius: 6, backgroundColor: "#f2f2f2" },
  menuImagePlaceholder: { width: wp(20), height: hp(10), borderRadius: 6, backgroundColor: "#f2f2f2" },
  menuLeft: { flex: 1, paddingLeft: wp(4), paddingRight: wp(2) },
  menuName: { fontWeight: "600", fontSize: hp(1.8) },
  menuDescription: { color: "#A3A3A3", marginTop: hp(0.3) },
  price: { marginTop: hp(0.6), fontWeight: "700" },
  addButton: { backgroundColor: "#4D392D", borderRadius: 6, paddingHorizontal: wp(4), paddingVertical: hp(0.8), alignSelf: "flex-start", marginTop: hp(8), minWidth: wp(18), alignItems: "center" },
  addButtonText: { color: "#fff", fontWeight: "700" },
  qtyContainer: { flexDirection: "row", alignItems: "center", marginTop: hp(8) },
  noteButton: { paddingVertical: hp(0.4), paddingHorizontal: wp(3), borderRadius: 4, backgroundColor: "#EFEFEF", marginTop: hp(0.8) },
  noteButtonText: { color: "#562E19", fontWeight: "500" },
  noteRow: { flexDirection: "row", alignItems: "center", gap: wp(2), marginTop: hp(0.6) },
  savedNoteInline: { fontSize: hp(1.35), color: "#562E19", flexShrink: 1 },
  bestBadge: { backgroundColor: "#FFD700", paddingHorizontal: 6, borderRadius: 6, marginLeft: wp(2) },
  bestBadgeText: { fontSize: hp(1.1), fontWeight: "700" },
  cartBar: { position: "absolute", left: wp(4), right: wp(4), backgroundColor: "#562E19", borderRadius: 12, paddingVertical: hp(1.2), paddingHorizontal: wp(4), flexDirection: "row", alignItems: "center", justifyContent: "space-between", elevation: 8, shadowColor: "#562E19", shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  cartIconWrap: { width: hp(4.4), height: hp(4.4), borderRadius: 50, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" },
  cartText: { color: "#fff", fontWeight: "700", fontSize: hp(1.8) },
  cartMeta: { color: "#fff", opacity: 0.9, fontSize: hp(1.1) },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: wp(86), backgroundColor: "#fff", borderRadius: 10, padding: wp(4) },
  modalTitle: { fontSize: hp(2), fontWeight: "700", marginBottom: hp(1) },
  noteInput: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, height: hp(12), textAlignVertical: "top", padding: wp(2) },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: wp(3), marginTop: hp(1) },
  modalBtn: { paddingVertical: hp(0.8), paddingHorizontal: wp(3), borderRadius: 6, alignItems: "center", justifyContent: "center" },
});
 