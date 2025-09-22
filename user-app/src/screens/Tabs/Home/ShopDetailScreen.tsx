// // import React, {
// //   useCallback,
// //   useEffect,
// //   useMemo,
// //   useRef,
// //   useState,
// // } from "react";
// // import {
// //   Animated,
// //   Dimensions,
// //   FlatList,
// //   Modal,
// //   PanResponder,
// //   Pressable,
// //   View,
// //   SectionList,
// //   StatusBar,
// //   StyleSheet,
// //   Text,
// //   TextInput,
// //   Image,
// //   ActivityIndicator,
// // } from "react-native";
// // import { Ionicons } from "@expo/vector-icons";
// // import { useNavigation } from "@react-navigation/native";
// // import { useDispatch, useSelector, shallowEqual } from "react-redux";
// // import { hp, wp } from "@/src/assets/utils/responsive";
// // import CartIconWithBadge from "@/src/components/CartIconBadge";
// // import axiosClient from "@/src/api/client";
// // import { getUserIdFromToken } from "@/src/assets/utils/getUserIdFromToken";
// // import {
// //   addToCartAsync,
// //   fetchCartAsync,
// //   selectCartItems,
// //   updateCartItemAsync,
// // } from "@/src/Redux/Slice/cartSlice";
// // import { selectSelectedShopId } from "@/src/Redux/Slice/selectedShopSlice";
// // import { BASE_URL } from "@/api";
// // import { useSafeAreaInsets } from "react-native-safe-area-context";
// // import type { RootState } from "@/src/Redux/store";

// // const { width: SCREEN_W } = Dimensions.get("window");
// // const SWIPE_THRESHOLD = 60;
// // const CHIP_GAP = wp(3);

// // type SectionType = { title: string; categoryId: number; data: any[] };

// // /**
// //  * Small, memoized MenuRow component to avoid re-renders when unrelated state changes.
// //  * Receives only the props it needs and uses stable handlers passed from parent.
// //  */
// // const MenuRow = React.memo(function MenuRow({
// //   item,
// //   cartEntry,
// //   onAdd,
// //   onRemove,
// //   onOpenNote,
// //   isBest,
// //   localLoading,
// // }: {
// //   item: any;
// //   cartEntry: any | undefined;
// //   onAdd: (m: any) => void;
// //   onRemove: (m: any) => void;
// //   onOpenNote: (m: any) => void;
// //   isBest: boolean;
// //   localLoading: boolean;
// // }) {
// //   const cartQty = cartEntry?.quantity || 0;
// //   return (
// //     <View style={styles.menuRow}>
// //       <Pressable
// //         onPress={() => {
// //           /* navigate handled by parent if needed */
// //         }}
// //       >
// //         {item.imageUrl ? (
// //           <Image
// //             source={{ uri: `${BASE_URL}/uploads/menus/${item.imageUrl}` }}
// //             style={styles.menuImage}
// //           />
// //         ) : (
// //           <View style={styles.menuImagePlaceholder} />
// //         )}
// //       </Pressable>

// //       <View style={styles.menuLeft}>
// //         <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
// //           <Text style={styles.menuName} numberOfLines={1}>
// //             {item.menuName}
// //           </Text>
// //           {isBest ? (
// //             <View style={styles.bestBadge}>
// //               <Text style={styles.bestBadgeText}>BEST</Text>
// //             </View>
// //           ) : null}
// //         </View>

// //         <Text style={styles.menuDescription} numberOfLines={1}>
// //           {item.ingredients || "Traditional recipe"}
// //         </Text>
// //         <Text style={styles.price}>₹{item.price}</Text>

// //         {cartQty > 0 && (
// //           <View style={styles.noteRow}>
// //             {cartEntry?.notes ? (
// //               <>
// //                 <Text style={styles.savedNoteInline} numberOfLines={1}>
// //                   {cartEntry.notes}
// //                 </Text>
// //                 <Pressable
// //                   onPress={() => onOpenNote(item)}
// //                   hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
// //                 >
// //                   <Ionicons name="create-outline" size={18} color="#562E19" />
// //                 </Pressable>
// //               </>
// //             ) : (
// //               <Pressable
// //                 style={styles.noteButton}
// //                 onPress={() => onOpenNote(item)}
// //               >
// //                 <Text style={styles.noteButtonText}>Custom</Text>
// //               </Pressable>
// //             )}
// //           </View>
// //         )}
// //       </View>

// //       {cartQty === 0 ? (
// //         <Pressable
// //           style={styles.addButton}
// //           onPress={() => onAdd(item)}
// //           disabled={localLoading}
// //         >
// //           {localLoading ? (
// //             <ActivityIndicator color="#fff" />
// //           ) : (
// //             <Text style={styles.addButtonText}>+ Add</Text>
// //           )}
// //         </Pressable>
// //       ) : (
// //         <View style={styles.qtyContainer}>
// //           <Pressable
// //             onPress={() => onRemove(item)}
// //             disabled={localLoading}
// //             hitSlop={{ top: 6, left: 6, right: 6, bottom: 6 }}
// //           >
// //             <Ionicons name="remove-circle-outline" size={24} color="#562E19" />
// //           </Pressable>
// //           <Text style={{ marginHorizontal: 8, color: "#A3A3A3" }}>
// //             {cartQty}
// //           </Text>
// //           <Pressable
// //             onPress={() => onAdd(item)}
// //             disabled={localLoading}
// //             hitSlop={{ top: 6, left: 6, right: 6, bottom: 6 }}
// //           >
// //             <Ionicons name="add-circle-outline" size={24} color="#562E19" />
// //           </Pressable>
// //         </View>
// //       )}
// //     </View>
// //   );
// // });

// // const ChipItem = React.memo(function ChipItem({
// //   title,
// //   active,
// //   onPress,
// //   scaleValue,
// // }: {
// //   title: string;
// //   active: boolean;
// //   onPress: () => void;
// //   scaleValue: Animated.Value;
// // }) {
// //   const bg = active ? "#562E19" : "#fff";
// //   const color = active ? "#fff" : "#222";
// //   return (
// //     <Animated.View
// //       style={{ transform: [{ scale: scaleValue }], marginRight: CHIP_GAP }}
// //     >
// //       <Pressable
// //         onPress={onPress}
// //         style={[
// //           styles.chip,
// //           { backgroundColor: bg, borderColor: active ? "#562E19" : "#eee" },
// //         ]}
// //       >
// //         <Text style={[styles.chipText, { color }]} numberOfLines={1}>
// //           {title}
// //         </Text>
// //       </Pressable>
// //     </Animated.View>
// //   );
// // });

// // const ShopDetailScreenEnhanced: React.FC = () => {
// //   const navigation = useNavigation();
// //   const dispatch = useDispatch();
// //   const shopId = useSelector(selectSelectedShopId);
// //   const cartItems = useSelector(selectCartItems, shallowEqual);
// //   const profile = useSelector((s: RootState) => s.profile.data);
// //   const insets = useSafeAreaInsets();

// //   const [shopData, setShopData] = useState<any>(null);
// //   const [sections, setSections] = useState<SectionType[]>([]);
// //   const [bestSellerIds, setBestSellerIds] = useState<Set<number>>(new Set());
// //   const [loadingSections, setLoadingSections] = useState<boolean>(true);
// //   const [cartLoading, setCartLoading] = useState<boolean>(true);

// //   const [noteModalVisible, setNoteModalVisible] = useState(false);
// //   const [currentMenu, setCurrentMenu] = useState<any>(null);
// //   const [noteText, setNoteText] = useState("");

// //   const sectionListRef = useRef<SectionList<any>>(null);
// //   const chipsListRef = useRef<FlatList<any> | null>(null);
// //   const [activeIndex, setActiveIndex] = useState<number>(0);
// //   const activeIndexRef = useRef<number>(0);
// //   activeIndexRef.current = activeIndex;

// //   const chipScalesRef = useRef<Animated.Value[]>([]);
// //   const menuLoadingRef = useRef<Record<number, boolean>>({});

// //   // derived
// //   const totalItems = useMemo(
// //     () =>
// //       cartItems.reduce((acc: number, it: any) => acc + (it.quantity || 0), 0),
// //     [cartItems]
// //   );
// //   const totalPrice = useMemo(
// //     () =>
// //       cartItems.reduce(
// //         (acc: number, it: any) =>
// //           acc + Number(it.price || 0) * (it.quantity || 0),
// //         0
// //       ),
// //     [cartItems]
// //   );
// //   const cartMap = useMemo(() => {
// //     const m: Record<number, any> = {};
// //     cartItems.forEach((it: any) => {
// //       if (it?.menuId != null) m[Number(it.menuId)] = it;
// //     });
// //     return m;
// //   }, [cartItems]);

// //   // init scales when sections change
// //   useEffect(() => {
// //     chipScalesRef.current.length = 0;
// //     sections.forEach(() => chipScalesRef.current.push(new Animated.Value(1)));
// //   }, [sections]);

// //   const fetchShopDetail = useCallback(async () => {
// //     try {
// //       const res = await axiosClient.get(`/api/shops/detail/${shopId}`);
// //       setShopData(res.data ?? null);
// //     } catch (err) {
// //       // swallow, optionally surface toast
// //     }
// //   }, [shopId]);

// //   const fetchCategoriesWithMenus = useCallback(async () => {
// //     setLoadingSections(true);
// //     try {
// //       const res = await axiosClient.get("/api/category/categories-with-menus");
// //       const payload = Array.isArray(res?.data?.data)
// //         ? res.data.data
// //         : Array.isArray(res?.data)
// //         ? res.data
// //         : [];
// //       const shopSections = payload
// //         .filter(
// //           (c: any) =>
// //             Number(c.shop_id) === Number(shopId) || Number(c.is_global) === 1
// //         )
// //         .map((c: any) => ({
// //           title: c.categoryName ?? "Untitled",
// //           categoryId: c.categoryId,
// //           data: Array.isArray(c.menus) ? c.menus : [],
// //         }));
// //       setSections(shopSections);
// //       setActiveIndex(0);
// //     } catch (err) {
// //       setSections([]);
// //     } finally {
// //       setLoadingSections(false);
// //     }
// //   }, [shopId]);

// //   const fetchBestSellers = useCallback(async () => {
// //     try {
// //       const res = await axiosClient.get(`/api/best-sellers/shop/${shopId}`);
// //       const arr = Array.isArray(res?.data) ? res.data : [];
// //       setBestSellerIds(new Set(arr.map((r: any) => Number(r.menuId))));
// //     } catch (err) {
// //       setBestSellerIds(new Set());
// //     }
// //   }, [shopId]);

// //   // Fetch cart once profile.userId is available. This avoids racing with auth.
// //   const fetchCartSafe = useCallback(async () => {
// //     if (!shopId || !profile?.userId) return;
// //     setCartLoading(true);
// //     try {
// //       await dispatch(fetchCartAsync({ shopId })).unwrap();
// //     } catch (err) {
// //       // ignore - UI will reflect empty/failure
// //     } finally {
// //       setCartLoading(false);
// //     }
// //   }, [dispatch, shopId, profile?.userId]);

// //   useEffect(() => {
// //     if (!shopId) return;
// //     fetchShopDetail();
// //     fetchCategoriesWithMenus();
// //     fetchBestSellers();
// //   }, [shopId, fetchShopDetail, fetchCategoriesWithMenus, fetchBestSellers]);

// //   useEffect(() => {
// //     // when profile becomes available, load cart
// //     fetchCartSafe();
// //   }, [profile?.userId, fetchCartSafe]);

// //   // scrolling helpers
// //   const scrollToSectionIndex = useCallback(
// //     (index: number) => {
// //       if (!sections.length) return;
// //       const idx = Math.max(0, Math.min(index, sections.length - 1));
// //       sectionListRef.current?.scrollToLocation?.({
// //         sectionIndex: idx,
// //         itemIndex: 0,
// //         viewPosition: 0,
// //       });
// //       try {
// //         chipsListRef.current?.scrollToIndex?.({
// //           index: idx,
// //           viewPosition: 0.5,
// //         });
// //       } catch {}
// //       setActiveIndex(idx);
// //     },
// //     [sections]
// //   );

// //   const onViewableItemsChanged = useRef(
// //     ({ viewableItems }: { viewableItems: any[] }) => {
// //       if (!viewableItems || viewableItems.length === 0) return;
// //       const first = viewableItems.find((v) => v.section) ?? viewableItems[0];
// //       const sectionTitle = first?.section?.title;
// //       if (!sectionTitle) return;
// //       const idx = sections.findIndex((s) => s.title === sectionTitle);
// //       if (idx !== -1 && idx !== activeIndexRef.current) setActiveIndex(idx);
// //     }
// //   ).current;

// //   const viewabilityConfig = useRef({
// //     itemVisiblePercentThreshold: 40,
// //     minimumViewTime: 50,
// //   }).current;

// //   // animate chip scales when activeIndex changes
// //   useEffect(() => {
// //     chipScalesRef.current.forEach((val, i) => {
// //       Animated.spring(val, {
// //         toValue: i === activeIndex ? 1.06 : 1,
// //         useNativeDriver: true,
// //         speed: 20,
// //         bounciness: 6,
// //       }).start();
// //     });
// //     try {
// //       chipsListRef.current?.scrollToIndex?.({
// //         index: activeIndex,
// //         viewPosition: 0.5,
// //       });
// //     } catch {}
// //   }, [activeIndex]);

// //   const panResponder = useRef(
// //     PanResponder.create({
// //       onStartShouldSetPanResponder: () => false,
// //       onMoveShouldSetPanResponder: (_, gesture) =>
// //         Math.abs(gesture.dx) > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
// //       onPanResponderRelease: (_, gesture) => {
// //         const dx = gesture.dx;
// //         if (Math.abs(dx) < SWIPE_THRESHOLD) return;
// //         if (dx < 0) {
// //           const next = Math.min(
// //             sections.length - 1,
// //             activeIndexRef.current + 1
// //           );
// //           if (next !== activeIndexRef.current) scrollToSectionIndex(next);
// //         } else {
// //           const prev = Math.max(0, activeIndexRef.current - 1);
// //           if (prev !== activeIndexRef.current) scrollToSectionIndex(prev);
// //         }
// //       },
// //     })
// //   ).current;

// //   // menu loading locks
// //   const setMenuLoading = useCallback((menuId: number, v = true) => {
// //     menuLoadingRef.current[menuId] = v;
// //   }, []);
// //   const isMenuLoading = useCallback(
// //     (menuId: number) => !!menuLoadingRef.current[menuId],
// //     []
// //   );

// //   const handleAddQty = useCallback(
// //     async (menu: any) => {
// //       if (!menu?.menuId) return;
// //       const menuId = Number(menu.menuId);
// //       if (isMenuLoading(menuId)) return;
// //       setMenuLoading(menuId, true);
// //       try {
// //         const existing = cartMap[menuId];
// //         if (!existing) {
// //           const userId = profile?.userId ?? (await getUserIdFromToken());
// //           const payload = {
// //             userId: Number(userId),
// //             shopId,
// //             menuId,
// //             quantity: 1,
// //             addons: [],
// //             notes: "",
// //           };
// //           await dispatch(addToCartAsync(payload)).unwrap();
// //         } else {
// //           await dispatch(
// //             updateCartItemAsync({
// //               cartId: existing.cartId,
// //               quantity: existing.quantity + 1,
// //               addons: existing.addons || [],
// //               notes: existing.notes || "",
// //             })
// //           ).unwrap();
// //         }
// //         // refresh cart to ensure canonical state
// //         if (profile?.userId)
// //           await dispatch(fetchCartAsync({ shopId })).unwrap();
// //       } catch (err) {
// //         // optionally report error
// //       } finally {
// //         setMenuLoading(menuId, false);
// //       }
// //     },
// //     [dispatch, profile?.userId, shopId, cartMap, isMenuLoading, setMenuLoading]
// //   );

// //   const handleRemoveQty = useCallback(
// //     async (menu: any) => {
// //       if (!menu?.menuId) return;
// //       const menuId = Number(menu.menuId);
// //       if (isMenuLoading(menuId)) return;
// //       setMenuLoading(menuId, true);
// //       try {
// //         const existing = cartMap[menuId];
// //         if (!existing) return;
// //         const newQty = existing.quantity - 1;
// //         await dispatch(
// //           updateCartItemAsync({
// //             cartId: existing.cartId,
// //             quantity: newQty,
// //             addons: existing.addons || [],
// //             notes: newQty > 0 ? existing.notes || "" : "",
// //           })
// //         ).unwrap();
// //         if (profile?.userId)
// //           await dispatch(fetchCartAsync({ shopId })).unwrap();
// //       } catch (err) {
// //         // ignore
// //       } finally {
// //         setMenuLoading(menuId, false);
// //       }
// //     },
// //     [dispatch, profile?.userId, shopId, cartMap, isMenuLoading, setMenuLoading]
// //   );

// //   const handleSaveNote = useCallback(async () => {
// //     try {
// //       if (currentMenu && cartMap[Number(currentMenu.menuId)]) {
// //         const existing = cartMap[Number(currentMenu.menuId)];
// //         await dispatch(
// //           updateCartItemAsync({
// //             cartId: existing.cartId,
// //             quantity: existing.quantity,
// //             addons: existing.addons || [],
// //             notes: noteText || "",
// //           })
// //         ).unwrap();
// //         if (profile?.userId)
// //           await dispatch(fetchCartAsync({ shopId })).unwrap();
// //       }
// //     } catch (err) {
// //       // ignore
// //     } finally {
// //       setNoteModalVisible(false);
// //       setNoteText("");
// //     }
// //   }, [currentMenu, dispatch, noteText, cartMap, profile?.userId, shopId]);

// //   // render helpers (stable references)
// //   const renderMenuRow = useCallback(
// //     ({ item }: { item: any }) => {
// //       const menuId = Number(item.menuId);
// //       const cartEntry = cartMap[menuId];
// //       const isBest = bestSellerIds.has(menuId);
// //       const localLoading = isMenuLoading(menuId);
// //       return (
// //         <MenuRow
// //           item={item}
// //           cartEntry={cartEntry}
// //           onAdd={handleAddQty}
// //           onRemove={handleRemoveQty}
// //           onOpenNote={(m) => {
// //             setCurrentMenu(m);
// //             setNoteText(cartEntry?.notes || "");
// //             setNoteModalVisible(true);
// //           }}
// //           isBest={isBest}
// //           localLoading={localLoading}
// //         />
// //       );
// //     },
// //     [cartMap, bestSellerIds, handleAddQty, handleRemoveQty, isMenuLoading]
// //   );

// //   const renderSectionHeader = useCallback(
// //     ({ section }: any) => (
// //       <View style={styles.sectionHeader}>
// //         <Text style={styles.sectionHeaderTitle}>{section.title}</Text>
// //       </View>
// //     ),
// //     []
// //   );

// //   const renderChip = useCallback(
// //     ({ item, index }: { item: any; index: number }) => {
// //       const scaleVal = chipScalesRef.current[index] ?? new Animated.Value(1);
// //       const active = index === activeIndex;
// //       return (
// //         <ChipItem
// //           title={item.title}
// //           active={active}
// //           onPress={() => scrollToSectionIndex(index)}
// //           scaleValue={scaleVal}
// //         />
// //       );
// //     },
// //     [activeIndex, scrollToSectionIndex]
// //   );

// //   // avoid Math.random keys — rely on stable menuId
// //   const keyExtractor = useCallback(
// //     (item: any) => String(item.menuId ?? "-"),
// //     []
// //   );

// //   const goToCart = useCallback(
// //     () => (navigation as any).navigate("cartScreen"),
// //     [navigation]
// //   );

// //   return (
// //     <View style={[styles.container, { paddingTop: insets.top }]}>
// //       <StatusBar barStyle="dark-content" backgroundColor="#fff" />

// //       <View style={[styles.header, { paddingTop: 6 }]}>
// //         <Pressable
// //           onPress={() => (navigation as any).goBack()}
// //           style={{ paddingRight: wp(3) }}
// //         >
// //           <Ionicons name="chevron-back-outline" size={hp(3.5)} />
// //         </Pressable>
// //         <Text style={styles.shopName} numberOfLines={1}>
// //           {shopData?.shopname || "Shop"}
// //         </Text>
// //         <CartIconWithBadge />
// //       </View>

// //       <View style={styles.chipsWrapper}>
// //         {loadingSections ? (
// //           <ActivityIndicator color="#562E19" />
// //         ) : (
// //           <FlatList
// //             ref={(r) => (chipsListRef.current = r)}
// //             data={sections}
// //             renderItem={renderChip}
// //             keyExtractor={(it) => String(it.categoryId)}
// //             horizontal
// //             showsHorizontalScrollIndicator={false}
// //             contentContainerStyle={{
// //               paddingHorizontal: wp(4),
// //               marginTop: hp(2),
// //             }}
// //             initialNumToRender={8}
// //             maxToRenderPerBatch={12}
// //             windowSize={5}
// //             removeClippedSubviews
// //           />
// //         )}
// //       </View>

// //       <View style={styles.sectionListWrapper} {...panResponder.panHandlers}>
// //         {loadingSections || cartLoading ? (
// //           <View
// //             style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
// //           >
// //             <ActivityIndicator size="large" color="#562E19" />
// //           </View>
// //         ) : (
// //           <SectionList
// //             ref={sectionListRef}
// //             sections={sections}
// //             keyExtractor={keyExtractor}
// //             renderItem={renderMenuRow}
// //             renderSectionHeader={renderSectionHeader}
// //             onViewableItemsChanged={onViewableItemsChanged}
// //             viewabilityConfig={viewabilityConfig}
// //             contentContainerStyle={{
// //               paddingBottom: Math.max(insets.bottom, hp(14)),
// //             }}
// //             stickySectionHeadersEnabled={false}
// //             initialNumToRender={10}
// //             maxToRenderPerBatch={12}
// //             windowSize={7}
// //           />
// //         )}
// //       </View>

// //       {totalItems > 0 && (
// //         <Pressable
// //           style={[styles.cartBar, { bottom: Math.max(insets.bottom, hp(3)) }]}
// //           onPress={goToCart}
// //         >
// //           <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
// //             <View style={styles.cartIconWrap}>
// //               <Ionicons name="cart-outline" size={hp(3)} color="white" />
// //             </View>
// //             <View>
// //               <Text style={styles.cartText}>View Cart</Text>
// //               <Text style={styles.cartMeta}>
// //                 {totalItems} item{totalItems > 1 ? "s" : ""}
// //                 {/* • ₹{totalPrice.toFixed(0)} */}
// //               </Text>
// //             </View>
// //           </View>
// //           <Ionicons
// //             name="chevron-forward-outline"
// //             size={hp(3.2)}
// //             color="white"
// //           />
// //         </Pressable>
// //       )}

// //       <Modal
// //         visible={noteModalVisible}
// //         transparent
// //         animationType="slide"
// //         onRequestClose={() => setNoteModalVisible(false)}
// //       >
// //         <View style={styles.modalOverlay}>
// //           <View style={styles.modalContent}>
// //             <Text style={styles.modalTitle}>Custom</Text>
// //             <TextInput
// //               style={styles.noteInput}
// //               value={noteText}
// //               onChangeText={setNoteText}
// //               placeholder="e.g. No ginger, less sugar..."
// //               multiline
// //             />
// //             <View style={styles.modalActions}>
// //               <Pressable
// //                 style={[styles.modalBtn, { backgroundColor: "#ccc" }]}
// //                 onPress={() => setNoteModalVisible(false)}
// //               >
// //                 <Text>Cancel</Text>
// //               </Pressable>
// //               <Pressable
// //                 style={[styles.modalBtn, { backgroundColor: "#562E19" }]}
// //                 onPress={handleSaveNote}
// //               >
// //                 <Text style={{ color: "#fff" }}>Save</Text>
// //               </Pressable>
// //             </View>
// //           </View>
// //         </View>
// //       </Modal>
// //     </View>
// //   );
// // };

// // export default ShopDetailScreenEnhanced;

// // const styles = StyleSheet.create({
// //   container: { flex: 1, backgroundColor: "#fff" },
// //   header: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "space-between",
// //     paddingHorizontal: wp(3),
// //   },
// //   shopName: { fontWeight: "600", fontSize: hp(2.4), maxWidth: SCREEN_W * 0.6 },
// //   chipsWrapper: { height: hp(7), justifyContent: "center" },
// //   chip: {
// //     paddingHorizontal: wp(4),
// //     paddingVertical: hp(0.9),
// //     borderRadius: 999,
// //     borderWidth: 1,
// //     borderColor: "#eee",
// //     backgroundColor: "#fff",
// //     minWidth: wp(22),
// //     alignItems: "center",
// //     justifyContent: "center",
// //   },
// //   chipText: { fontSize: hp(1.5), fontWeight: "600" },
// //   sectionListWrapper: { flex: 1 },
// //   sectionHeader: {
// //     backgroundColor: "#fff",
// //     paddingHorizontal: wp(4),
// //     paddingVertical: hp(1),
// //   },
// //   sectionHeaderTitle: { fontSize: hp(1.8), fontWeight: "700" },
// //   menuRow: {
// //     flexDirection: "row",
// //     alignItems: "flex-start",
// //     paddingHorizontal: wp(4),
// //     paddingVertical: hp(1.4),
// //     borderBottomWidth: 1,
// //     borderBottomColor: "#E8E8E8",
// //   },
// //   menuImage: {
// //     width: wp(20),
// //     height: hp(10),
// //     borderRadius: 6,
// //     backgroundColor: "#f2f2f2",
// //   },
// //   menuImagePlaceholder: {
// //     width: wp(20),
// //     height: hp(10),
// //     borderRadius: 6,
// //     backgroundColor: "#f2f2f2",
// //   },
// //   menuLeft: { flex: 1, paddingLeft: wp(4), paddingRight: wp(2) },
// //   menuName: { fontWeight: "600", fontSize: hp(1.8) },
// //   menuDescription: { color: "#A3A3A3", marginTop: hp(0.3) },
// //   price: { marginTop: hp(0.6), fontWeight: "700" },
// //   addButton: {
// //     backgroundColor: "#4D392D",
// //     borderRadius: 6,
// //     paddingHorizontal: wp(4),
// //     paddingVertical: hp(0.8),
// //     alignSelf: "flex-start",
// //     marginTop: hp(8),
// //     minWidth: wp(18),
// //     alignItems: "center",
// //   },
// //   addButtonText: { color: "#fff", fontWeight: "700" },
// //   qtyContainer: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     marginTop: hp(8),
// //   },
// //   noteButton: {
// //     paddingVertical: hp(0.4),
// //     paddingHorizontal: wp(3),
// //     borderRadius: 4,
// //     backgroundColor: "#EFEFEF",
// //     marginTop: hp(0.8),
// //   },
// //   noteButtonText: { color: "#562E19", fontWeight: "500" },
// //   noteRow: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     gap: wp(2),
// //     marginTop: hp(0.6),
// //   },
// //   savedNoteInline: { fontSize: hp(1.35), color: "#562E19", flexShrink: 1 },
// //   bestBadge: {
// //     backgroundColor: "#FFD700",
// //     paddingHorizontal: 6,
// //     borderRadius: 6,
// //     marginLeft: wp(2),
// //   },
// //   bestBadgeText: { fontSize: hp(1.1), fontWeight: "700" },
// //   cartBar: {
// //     position: "absolute",
// //     left: wp(4),
// //     right: wp(4),
// //     backgroundColor: "#562E19",
// //     borderRadius: 12,
// //     paddingVertical: hp(1.2),
// //     paddingHorizontal: wp(4),
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "space-between",
// //     elevation: 8,
// //     shadowColor: "#562E19",
// //     shadowOpacity: 0.3,
// //     shadowRadius: 8,
// //     shadowOffset: { width: 0, height: 4 },
// //   },
// //   cartIconWrap: {
// //     width: hp(4.4),
// //     height: hp(4.4),
// //     borderRadius: 50,
// //     backgroundColor: "rgba(255,255,255,0.12)",
// //     alignItems: "center",
// //     justifyContent: "center",
// //   },
// //   cartText: { color: "#fff", fontWeight: "700", fontSize: hp(1.8) },
// //   cartMeta: { color: "#fff", opacity: 0.9, fontSize: hp(1.1) },
// //   modalOverlay: {
// //     flex: 1,
// //     backgroundColor: "rgba(0,0,0,0.35)",
// //     justifyContent: "center",
// //     alignItems: "center",
// //   },
// //   modalContent: {
// //     width: wp(86),
// //     backgroundColor: "#fff",
// //     borderRadius: 10,
// //     padding: wp(4),
// //   },
// //   modalTitle: { fontSize: hp(2), fontWeight: "700", marginBottom: hp(1) },
// //   noteInput: {
// //     borderWidth: 1,
// //     borderColor: "#ddd",
// //     borderRadius: 8,
// //     height: hp(12),
// //     textAlignVertical: "top",
// //     padding: wp(2),
// //   },
// //   modalActions: {
// //     flexDirection: "row",
// //     justifyContent: "flex-end",
// //     gap: wp(3),
// //     marginTop: hp(1),
// //   },
// //   modalBtn: {
// //     paddingVertical: hp(0.8),
// //     paddingHorizontal: wp(3),
// //     borderRadius: 6,
// //     alignItems: "center",
// //     justifyContent: "center",
// //   },
// // });
// // ShopDetailScreenEnhanced.tsx
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
// import { useDispatch, useSelector, shallowEqual } from "react-redux";
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
// import type { RootState } from "@/src/Redux/store";

// const { width: SCREEN_W } = Dimensions.get("window");
// const SWIPE_THRESHOLD = 60;
// const CHIP_GAP = wp(3);

// type SectionType = { title: string; categoryId: number; data: any[] };

// /* ---------- Small memoized child components ---------- */

// const MenuRow = React.memo(function MenuRow({
//   item,
//   cartEntry,
//   onAdd,
//   onRemove,
//   onOpenNote,
//   isBest,
//   localLoading,
// }: {
//   item: any;
//   cartEntry: any | undefined;
//   onAdd: (m: any) => void;
//   onRemove: (m: any) => void;
//   onOpenNote: (m: any) => void;
//   isBest: boolean;
//   localLoading: boolean;
// }) {
//   const cartQty = cartEntry?.quantity || 0;

//   return (
//     <View style={styles.menuRow}>
//       <Pressable
//         onPress={() => {
//           /* optional: open menu detail */
//         }}
//       >
//         {item.imageUrl ? (
//           <Image
//             source={{ uri: `${BASE_URL}/uploads/menus/${item.imageUrl}` }}
//             style={styles.menuImage}
//           />
//         ) : (
//           <View style={styles.menuImagePlaceholder} />
//         )}
//       </Pressable>

//       <View style={styles.menuLeft}>
//         <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
//           <Text style={styles.menuName} numberOfLines={1}>
//             {item.menuName}
//           </Text>

//           {isBest ? (
//             <View style={styles.bestBadge}>
//               <Text style={styles.bestBadgeText}>BEST</Text>
//             </View>
//           ) : null}
//         </View>

//         <Text style={styles.menuDescription} numberOfLines={1}>
//           {item.ingredients || "Traditional recipe"}
//         </Text>
//         <Text style={styles.price}>₹{item.price}</Text>

//         {cartQty > 0 && (
//           <View style={styles.noteRow}>
//             {cartEntry?.notes ? (
//               <>
//                 <Text style={styles.savedNoteInline} numberOfLines={1}>
//                   {cartEntry.notes}
//                 </Text>
//                 <Pressable
//                   onPress={() => onOpenNote(item)}
//                   hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
//                 >
//                   <Ionicons name="create-outline" size={18} color="#562E19" />
//                 </Pressable>
//               </>
//             ) : (
//               <Pressable
//                 style={styles.noteButton}
//                 onPress={() => onOpenNote(item)}
//               >
//                 <Text style={styles.noteButtonText}>Custom</Text>
//               </Pressable>
//             )}
//           </View>
//         )}
//       </View>

//       {cartQty === 0 ? (
//         <Pressable
//           style={styles.addButton}
//           onPress={() => onAdd(item)}
//           disabled={localLoading}
//           accessibilityRole="button"
//         >
//           {localLoading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.addButtonText}>+ Add</Text>
//           )}
//         </Pressable>
//       ) : (
//         <View style={styles.qtyContainer}>
//           <Pressable
//             onPress={() => onRemove(item)}
//             disabled={localLoading}
//             hitSlop={{ top: 6, left: 6, right: 6, bottom: 6 }}
//           >
//             <Ionicons name="remove-circle-outline" size={24} color="#562E19" />
//           </Pressable>
//           <Text style={{ marginHorizontal: 8, color: "#A3A3A3" }}>
//             {cartQty}
//           </Text>
//           <Pressable
//             onPress={() => onAdd(item)}
//             disabled={localLoading}
//             hitSlop={{ top: 6, left: 6, right: 6, bottom: 6 }}
//           >
//             <Ionicons name="add-circle-outline" size={24} color="#562E19" />
//           </Pressable>
//         </View>
//       )}
//     </View>
//   );
// });

// const ChipItem = React.memo(function ChipItem({
//   title,
//   active,
//   onPress,
//   scaleValue,
// }: {
//   title: string;
//   active: boolean;
//   onPress: () => void;
//   scaleValue: Animated.Value;
// }) {
//   const bg = active ? "#562E19" : "#fff";
//   const color = active ? "#fff" : "#222";
//   return (
//     <Animated.View
//       style={{ transform: [{ scale: scaleValue }], marginRight: CHIP_GAP }}
//     >
//       <Pressable
//         onPress={onPress}
//         style={[
//           styles.chip,
//           { backgroundColor: bg, borderColor: active ? "#562E19" : "#eee" },
//         ]}
//       >
//         <Text style={[styles.chipText, { color }]} numberOfLines={1}>
//           {title}
//         </Text>
//       </Pressable>
//     </Animated.View>
//   );
// });

// /* ---------- Main component ---------- */

// const ShopDetailScreenEnhanced: React.FC = () => {
//   const navigation = useNavigation();
//   const dispatch = useDispatch();
//   const shopId = useSelector(selectSelectedShopId);
//   const cartItems = useSelector(selectCartItems, shallowEqual);
//   const profile = useSelector((s: RootState) => s.profile.data);
//   const insets = useSafeAreaInsets();

//   const [shopData, setShopData] = useState<any>(null);
//   const [sections, setSections] = useState<SectionType[]>([]);
//   const [bestSellerIds, setBestSellerIds] = useState<Set<number>>(new Set());
//   const [loadingSections, setLoadingSections] = useState<boolean>(true);
//   const [cartLoading, setCartLoading] = useState<boolean>(true);

//   const [noteModalVisible, setNoteModalVisible] = useState(false);
//   const [currentMenu, setCurrentMenu] = useState<any>(null);
//   const [noteText, setNoteText] = useState("");

//   const sectionListRef = useRef<SectionList<any>>(null);
//   const chipsListRef = useRef<FlatList<any> | null>(null);
//   const [activeIndex, setActiveIndex] = useState<number>(0);
//   const activeIndexRef = useRef<number>(0);
//   activeIndexRef.current = activeIndex;

//   const chipScalesRef = useRef<Animated.Value[]>([]);
//   const menuLoadingRef = useRef<Record<number, boolean>>({});

//   // derived values
//   const totalItems = useMemo(
//     () =>
//       cartItems.reduce((acc: number, it: any) => acc + (it.quantity || 0), 0),
//     [cartItems]
//   );

//   // note: totalPrice uses item.price — it's informational here; snapshotPrice used on server
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
//     return m;
//   }, [cartItems]);

//   // initialize chip scales
//   useEffect(() => {
//     chipScalesRef.current.length = 0;
//     sections.forEach(() => chipScalesRef.current.push(new Animated.Value(1)));
//   }, [sections]);

//   /* ---------- API fetchers ---------- */
//   const fetchShopDetail = useCallback(async () => {
//     if (!shopId) return;
//     try {
//       const res = await axiosClient.get(`/api/shops/detail/${shopId}`);
//       setShopData(res.data ?? null);
//     } catch (err) {
//       // optionally show a toast
//     }
//   }, [shopId]);

//   const fetchCategoriesWithMenus = useCallback(async () => {
//     if (!shopId) return;
//     setLoadingSections(true);
//     try {
//       const res = await axiosClient.get("/api/category/categories-with-menus");
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
//       setActiveIndex(0);
//     } catch (err) {
//       setSections([]);
//     } finally {
//       setLoadingSections(false);
//     }
//   }, [shopId]);

//   const fetchBestSellers = useCallback(async () => {
//     if (!shopId) return;
//     try {
//       const res = await axiosClient.get(`/api/best-sellers/shop/${shopId}`);
//       const arr = Array.isArray(res?.data) ? res.data : [];
//       setBestSellerIds(new Set(arr.map((r: any) => Number(r.menuId))));
//     } catch (err) {
//       setBestSellerIds(new Set());
//     }
//   }, [shopId]);

//   // fetch cart for this shop only (uses your existing getUserCartByShop)
//   const fetchCartSafe = useCallback(async () => {
//     if (!shopId || !profile?.userId) return;
//     setCartLoading(true);
//     try {
//       await dispatch(fetchCartAsync({ shopId })).unwrap();
//     } catch (err) {
//       // ignore; UI shows empty state
//     } finally {
//       setCartLoading(false);
//     }
//   }, [dispatch, shopId, profile?.userId]);

//   useEffect(() => {
//     if (!shopId) return;
//     fetchShopDetail();
//     fetchCategoriesWithMenus();
//     fetchBestSellers();
//   }, [shopId, fetchShopDetail, fetchCategoriesWithMenus, fetchBestSellers]);

//   useEffect(() => {
//     // load cart only when profile is ready
//     fetchCartSafe();
//   }, [profile?.userId, fetchCartSafe]);

//   /* ---------- scrolling / chips helpers ---------- */
//   const scrollToSectionIndex = useCallback(
//     (index: number) => {
//       if (!sections.length) return;
//       const idx = Math.max(0, Math.min(index, sections.length - 1));
//       sectionListRef.current?.scrollToLocation?.({
//         sectionIndex: idx,
//         itemIndex: 0,
//         viewPosition: 0,
//       });
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

//   /* ---------- menu loading lock helpers ---------- */
//   const setMenuLoading = useCallback((menuId: number, v = true) => {
//     menuLoadingRef.current[menuId] = v;
//   }, []);
//   const isMenuLoading = useCallback(
//     (menuId: number) => !!menuLoadingRef.current[menuId],
//     []
//   );

//   /* ---------- add / remove / save note handlers ---------- */
//   const handleAddQty = useCallback(
//     async (menu: any) => {
//       if (!menu?.menuId) return;
//       const menuId = Number(menu.menuId);
//       if (isMenuLoading(menuId)) return;
//       setMenuLoading(menuId, true);
//       try {
//         const existing = cartMap[menuId];
//         if (!existing) {
//           const userId = profile?.userId ?? (await getUserIdFromToken());
//           const payload = {
//             userId: Number(userId),
//             shopId,
//             menuId,
//             quantity: 1,
//             addons: [],
//             notes: "",
//           };
//           await dispatch(addToCartAsync(payload)).unwrap();
//         } else {
//           await dispatch(
//             updateCartItemAsync({
//               cartId: existing.cartId,
//               quantity: existing.quantity + 1,
//               addons: existing.addons || [],
//               notes: existing.notes || "",
//             })
//           ).unwrap();
//         }
//         // if (profile?.userId) await dispatch(fetchCartAllAsync());unwrap();
//         if (profile?.userId) await dispatch(fetchCartAllAsync());
//       } catch (err) {
//         // optional: show error toast
//       } finally {
//         setMenuLoading(menuId, false);
//       }
//     },
//     [dispatch, profile?.userId, shopId, cartMap, isMenuLoading, setMenuLoading]
//   );

//   const handleRemoveQty = useCallback(
//     async (menu: any) => {
//       if (!menu?.menuId) return;
//       const menuId = Number(menu.menuId);
//       if (isMenuLoading(menuId)) return;
//       setMenuLoading(menuId, true);
//       try {
//         const existing = cartMap[menuId];
//         if (!existing) return;
//         const newQty = existing.quantity - 1;
//         await dispatch(
//           updateCartItemAsync({
//             cartId: existing.cartId,
//             quantity: newQty,
//             addons: existing.addons || [],
//             notes: newQty > 0 ? existing.notes || "" : "",
//           })
//         ).unwrap();
//         // if (profile?.userId) await dispatch(fetchCartAllAsync());.unwrap();
//         if (profile?.userId) await dispatch(fetchCartAllAsync());
//       } catch (err) {
//         // ignore
//       } finally {
//         setMenuLoading(menuId, false);
//       }
//     },
//     [dispatch, profile?.userId, shopId, cartMap, isMenuLoading, setMenuLoading]
//   );

//   const handleSaveNote = useCallback(async () => {
//     try {
//       if (currentMenu && cartMap[Number(currentMenu.menuId)]) {
//         const existing = cartMap[Number(currentMenu.menuId)];
//         await dispatch(
//           updateCartItemAsync({
//             cartId: existing.cartId,
//             quantity: existing.quantity,
//             addons: existing.addons || [],
//             notes: noteText || "",
//           })
//         ).unwrap();
//         if (profile?.userId) await dispatch(fetchCartAllAsync());
//         // if (profile?.userId) await dispatch(fetchCartAllAsync());.unwrap();
//       }
//     } catch (err) {
//       // ignore
//     } finally {
//       setNoteModalVisible(false);
//       setNoteText("");
//     }
//   }, [currentMenu, dispatch, noteText, cartMap, profile?.userId, shopId]);

//   /* ---------- rendering helpers ---------- */
//   const renderMenuRow = useCallback(
//     ({ item }: { item: any }) => {
//       const menuId = Number(item.menuId);
//       const cartEntry = cartMap[menuId];
//       const isBest = bestSellerIds.has(menuId);
//       const localLoading = isMenuLoading(menuId);
//       return (
//         <MenuRow
//           item={item}
//           cartEntry={cartEntry}
//           onAdd={handleAddQty}
//           onRemove={handleRemoveQty}
//           onOpenNote={(m) => {
//             setCurrentMenu(m);
//             setNoteText(cartEntry?.notes || "");
//             setNoteModalVisible(true);
//           }}
//           isBest={isBest}
//           localLoading={localLoading}
//         />
//       );
//     },
//     [cartMap, bestSellerIds, handleAddQty, handleRemoveQty, isMenuLoading]
//   );

//   const renderSectionHeader = useCallback(
//     ({ section }: any) => (
//       <View style={styles.sectionHeader}>
//         <Text style={styles.sectionHeaderTitle}>{section.title}</Text>
//       </View>
//     ),
//     []
//   );

//   const renderChip = useCallback(
//     ({ item, index }: { item: any; index: number }) => {
//       const scaleVal = chipScalesRef.current[index] ?? new Animated.Value(1);
//       const active = index === activeIndex;
//       return (
//         <ChipItem
//           title={item.title}
//           active={active}
//           onPress={() => scrollToSectionIndex(index)}
//           scaleValue={scaleVal}
//         />
//       );
//     },
//     [activeIndex, scrollToSectionIndex]
//   );

//   const keyExtractor = useCallback(
//     (item: any) => String(item.menuId ?? "-"),
//     []
//   );

//   const goToCart = useCallback(
//     () => (navigation as any).navigate("cartScreen"),
//     [navigation]
//   );

//   /* ---------- UI ---------- */
//   return (
//     <View style={[styles.container, { paddingTop: insets.top }]}>
//       <StatusBar barStyle="dark-content" backgroundColor="#fff" />

//       <View style={[styles.header, { paddingTop: 6 }]}>
//         <Pressable
//           onPress={() => (navigation as any).goBack()}
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
//             renderItem={renderChip}
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
//             removeClippedSubviews
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
//             keyExtractor={keyExtractor}
//             renderItem={renderMenuRow}
//             renderSectionHeader={renderSectionHeader}
//             onViewableItemsChanged={onViewableItemsChanged}
//             viewabilityConfig={viewabilityConfig}
//             contentContainerStyle={{
//               paddingBottom: Math.max(insets.bottom, hp(14)),
//             }}
//             stickySectionHeadersEnabled={false}
//             initialNumToRender={10}
//             maxToRenderPerBatch={12}
//             windowSize={7}
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
//                 {totalItems} item{totalItems > 1 ? "s" : ""}
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

// /* ---------- styles ---------- */
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
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { useNavigation, useFocusEffect } from "@react-navigation/native";
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
  // removeFromCartAsync // if you have a remove action, prefer to call it when qty -> 0
} from "@/src/Redux/Slice/cartSlice";
import { selectSelectedShopId } from "@/src/Redux/Slice/selectedShopSlice";
import { BASE_URL } from "@/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { RootState } from "@/src/Redux/store";

const { width: SCREEN_W } = Dimensions.get("window");
const SWIPE_THRESHOLD = 60;
const CHIP_GAP = wp(3);

type SectionType = { title: string; categoryId: number; data: any[] };

/* ---------- Small memoized child components ---------- */

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
      <Pressable
        onPress={() => {
          /* optional: open menu detail */
        }}
      >
        {item.imageUrl ? (
          <Image
            source={{ uri: `${BASE_URL}/uploads/menus/${item.imageUrl}` }}
            style={styles.menuImage}
          />
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
                <Pressable
                  onPress={() => onOpenNote(item)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Ionicons name="create-outline" size={18} color="#562E19" />
                </Pressable>
              </>
            ) : (
              <Pressable
                style={styles.noteButton}
                onPress={() => onOpenNote(item)}
              >
                <Text style={styles.noteButtonText}>Custom</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>

      {cartQty === 0 ? (
        <Pressable
          style={styles.addButton}
          onPress={() => onAdd(item)}
          disabled={localLoading}
          accessibilityRole="button"
        >
          {localLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.addButtonText}>+ Add</Text>}
        </Pressable>
      ) : (
        <View style={styles.qtyContainer}>
          <Pressable
            onPress={() => onRemove(item)}
            disabled={localLoading}
            hitSlop={{ top: 6, left: 6, right: 6, bottom: 6 }}
          >
            <Ionicons name="remove-circle-outline" size={24} color="#562E19" />
          </Pressable>
          <Text style={{ marginHorizontal: 8, color: "#A3A3A3" }}>{cartQty}</Text>
          <Pressable
            onPress={() => onAdd(item)}
            disabled={localLoading}
            hitSlop={{ top: 6, left: 6, right: 6, bottom: 6 }}
          >
            <Ionicons name="add-circle-outline" size={24} color="#562E19" />
          </Pressable>
        </View>
      )}
    </View>
  );
});

const ChipItem = React.memo(function ChipItem({
  title,
  active,
  onPress,
  scaleValue,
}: {
  title: string;
  active: boolean;
  onPress: () => void;
  scaleValue: Animated.Value;
}) {
  const bg = active ? "#562E19" : "#fff";
  const color = active ? "#fff" : "#222";
  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }], marginRight: CHIP_GAP }}>
      <Pressable
        onPress={onPress}
        style={[styles.chip, { backgroundColor: bg, borderColor: active ? "#562E19" : "#eee" }]}
      >
        <Text style={[styles.chipText, { color }]} numberOfLines={1}>
          {title}
        </Text>
      </Pressable>
    </Animated.View>
  );
});

/* ---------- Main component ---------- */

const ShopDetailScreenEnhanced: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const shopId = useSelector(selectSelectedShopId);
  const cartItems = useSelector(selectCartItems, shallowEqual);
  const profile = useSelector((s: RootState) => s.profile?.data);
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
  // <-- PRODUCTION FIX: use state for per-menu loading so UI re-renders correctly
  const [menuLoadingMap, setMenuLoadingMap] = useState<Record<number, boolean>>({});

  // derived values
  const totalItems = useMemo(() => cartItems.reduce((acc: number, it: any) => acc + (it.quantity || 0), 0), [cartItems]);
  const totalPrice = useMemo(
    () => cartItems.reduce((acc: number, it: any) => acc + Number(it.price || 0) * (it.quantity || 0), 0),
    [cartItems]
  );

  const cartMap = useMemo(() => {
    const m: Record<number, any> = {};
    cartItems.forEach((it: any) => {
      if (it?.menuId != null) m[Number(it.menuId)] = it;
    });
    return m;
  }, [cartItems]);

  // mounted guard
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // init chip scales
  useEffect(() => {
    chipScalesRef.current.length = 0;
    sections.forEach(() => chipScalesRef.current.push(new Animated.Value(1)));
  }, [sections]);

  /* ---------- API fetchers ---------- */
  const fetchShopDetail = useCallback(async () => {
    if (!shopId) return;
    try {
      const res = await axiosClient.get(`/api/shops/detail/${shopId}`);
      if (isMountedRef.current) setShopData(res.data ?? null);
    } catch (err) {
      // optional toast
    }
  }, [shopId]);

  const fetchCategoriesWithMenus = useCallback(async () => {
    if (!shopId) return;
    setLoadingSections(true);
    try {
      const res = await axiosClient.get("/api/category/categories-with-menus");
      const payload = Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : [];
      const shopSections = payload
        .filter((c: any) => Number(c.shop_id) === Number(shopId) || Number(c.is_global) === 1)
        .map((c: any) => ({
          title: c.categoryName ?? "Untitled",
          categoryId: c.categoryId,
          data: Array.isArray(c.menus) ? c.menus : [],
        }));
      if (isMountedRef.current) {
        setSections(shopSections);
        setActiveIndex(0);
      }
    } catch (err) {
      if (isMountedRef.current) setSections([]);
    } finally {
      if (isMountedRef.current) setLoadingSections(false);
    }
  }, [shopId]);

  const fetchBestSellers = useCallback(async () => {
    if (!shopId) return;
    try {
      const res = await axiosClient.get(`/api/best-sellers/shop/${shopId}`);
      const arr = Array.isArray(res?.data) ? res.data : [];
      if (isMountedRef.current) setBestSellerIds(new Set(arr.map((r: any) => Number(r.menuId))));
    } catch (err) {
      if (isMountedRef.current) setBestSellerIds(new Set());
    }
  }, [shopId]);

  const fetchCartSafe = useCallback(async () => {
    if (!shopId || !profile?.userId) return;
    setCartLoading(true);
    try {
      await dispatch(fetchCartAsync({ shopId })).unwrap();
    } catch (err) {
      // ignore
    } finally {
      if (isMountedRef.current) setCartLoading(false);
    }
  }, [dispatch, shopId, profile?.userId]);

  useEffect(() => {
    if (!shopId) return;
    fetchShopDetail();
    fetchCategoriesWithMenus();
    fetchBestSellers();
  }, [shopId, fetchShopDetail, fetchCategoriesWithMenus, fetchBestSellers]);

  useEffect(() => {
    fetchCartSafe();
  }, [profile?.userId, fetchCartSafe]);

  /* ---------- scrolling / chips helpers ---------- */
  const scrollToSectionIndex = useCallback(
    (index: number) => {
      if (!sections.length) return;
      const idx = Math.max(0, Math.min(index, sections.length - 1));
      sectionListRef.current?.scrollToLocation?.({ sectionIndex: idx, itemIndex: 0, viewPosition: 0 });
      try {
        chipsListRef.current?.scrollToIndex?.({ index: idx, viewPosition: 0.5 });
      } catch {}
      setActiveIndex(idx);
    },
    [sections]
  );

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: any[] }) => {
      if (!viewableItems || viewableItems.length === 0) return;
      const first = viewableItems.find((v) => v.section) ?? viewableItems[0];
      const sectionTitle = first?.section?.title;
      if (!sectionTitle) return;
      const idx = sections.findIndex((s) => s.title === sectionTitle);
      if (idx !== -1 && idx !== activeIndexRef.current) setActiveIndex(idx);
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 40,
    minimumViewTime: 50,
  }).current;

  useEffect(() => {
    chipScalesRef.current.forEach((val, i) => {
      Animated.spring(val, {
        toValue: i === activeIndex ? 1.06 : 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 6,
      }).start();
    });
    try {
      chipsListRef.current?.scrollToIndex?.({ index: activeIndex, viewPosition: 0.5 });
    } catch {}
  }, [activeIndex]);

  const panResponder = useRef(
    PanResponder.create({
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
    })
  ).current;

  /* ---------- menu loading helpers (PROD FIX) ---------- */
  const setMenuLoading = useCallback((menuId: number, v = true) => {
    setMenuLoadingMap((prev) => {
      if (prev[menuId] === v) return prev;
      return { ...prev, [menuId]: v };
    });
  }, []);

  const isMenuLoading = useCallback((menuId: number) => !!menuLoadingMap[menuId], [menuLoadingMap]);

  /* ---------- add / remove / save note handlers (PROD FIXes) ---------- */
  const handleAddQty = useCallback(
    async (menu: any) => {
      if (!menu?.menuId) return;
      const menuId = Number(menu.menuId);
      if (isMenuLoading(menuId)) return; // guard double-tap
      setMenuLoading(menuId, true);
      try {
        const existing = cartMap[menuId];
        if (!existing) {
          // add new
          const userId = profile?.userId ?? (await getUserIdFromToken());
          const payload = {
            userId: Number(userId),
            shopId,
            menuId,
            quantity: 1,
            addons: [],
            notes: "",
          };
          // addToCartAsync should update store; still re-fetch to make sure server canonical
          await dispatch(addToCartAsync(payload)).unwrap();
        } else {
          // update quantity +1
          await dispatch(
            updateCartItemAsync({
              cartId: existing.cartId,
              quantity: existing.quantity + 1,
              addons: existing.addons || [],
              notes: existing.notes || "",
            })
          ).unwrap();
        }
        // always re-fetch cart for consistency (production-grade)
        if (profile?.userId) await dispatch(fetchCartAsync({ shopId })).unwrap();
      } catch (err) {
        // optional: show toast with error
      } finally {
        if (isMountedRef.current) setMenuLoading(menuId, false);
      }
    },
    [dispatch, profile?.userId, shopId, cartMap, isMenuLoading, setMenuLoading]
  );

  const handleRemoveQty = useCallback(
    async (menu: any) => {
      if (!menu?.menuId) return;
      const menuId = Number(menu.menuId);
      if (isMenuLoading(menuId)) return;
      setMenuLoading(menuId, true);
      try {
        const existing = cartMap[menuId];
        if (!existing) return;
        const newQty = existing.quantity - 1;
        await dispatch(
          updateCartItemAsync({
            cartId: existing.cartId,
            quantity: newQty,
            addons: existing.addons || [],
            notes: newQty > 0 ? existing.notes || "" : "",
          })
        ).unwrap();
        // re-fetch to reflect deletion if server removed item when quantity=0
        if (profile?.userId) await dispatch(fetchCartAsync({ shopId })).unwrap();
      } catch (err) {
        // optional toast
      } finally {
        if (isMountedRef.current) setMenuLoading(menuId, false);
      }
    },
    [dispatch, profile?.userId, shopId, cartMap, isMenuLoading, setMenuLoading]
  );

  const handleSaveNote = useCallback(async () => {
    try {
      if (currentMenu && cartMap[Number(currentMenu.menuId)]) {
        const existing = cartMap[Number(currentMenu.menuId)];
        await dispatch(
          updateCartItemAsync({
            cartId: existing.cartId,
            quantity: existing.quantity,
            addons: existing.addons || [],
            notes: noteText || "",
          })
        ).unwrap();
        if (profile?.userId) await dispatch(fetchCartAsync({ shopId })).unwrap();
      }
    } catch (err) {
      // ignore
    } finally {
      setNoteModalVisible(false);
      setNoteText("");
    }
  }, [currentMenu, dispatch, noteText, cartMap, profile?.userId, shopId]);

  /* ---------- rendering helpers ---------- */
  const renderMenuRow = useCallback(
    ({ item }: { item: any }) => {
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
          onOpenNote={(m) => {
            setCurrentMenu(m);
            setNoteText(cartEntry?.notes || "");
            setNoteModalVisible(true);
          }}
          isBest={isBest}
          localLoading={localLoading}
        />
      );
    },
    [cartMap, bestSellerIds, handleAddQty, handleRemoveQty, isMenuLoading]
  );

  const renderSectionHeader = useCallback(({ section }: any) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderTitle}>{section.title}</Text>
    </View>
  ), []);

  const renderChip = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      const scaleVal = chipScalesRef.current[index] ?? new Animated.Value(1);
      const active = index === activeIndex;
      return <ChipItem title={item.title} active={active} onPress={() => scrollToSectionIndex(index)} scaleValue={scaleVal} />;
    },
    [activeIndex, scrollToSectionIndex]
  );

  const keyExtractor = useCallback((item: any) => String(item.menuId ?? "-"), []);

  const goToCart = useCallback(() => (navigation as any).navigate("cartScreen"), [navigation]);

  /* ---------- UI ---------- */
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={[styles.header, { paddingTop: 6 }]}>
        <Pressable onPress={() => (navigation as any).goBack()} style={{ paddingRight: wp(3) }}>
          <Ionicons name="chevron-back-outline" size={hp(3.5)} />
        </Pressable>
        <Text style={styles.shopName} numberOfLines={1}>
          {shopData?.shopname || "Shop"}
        </Text>
        <CartIconWithBadge />
      </View>

      <View style={styles.chipsWrapper}>
        {loadingSections ? (
          <ActivityIndicator color="#562E19" />
        ) : (
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
            removeClippedSubviews={false} // safer for animated chips
            getItemLayout={(_, index) => ({ length: wp(22) + CHIP_GAP, offset: (wp(22) + CHIP_GAP) * index, index })}
          />
        )}
      </View>

      <View style={styles.sectionListWrapper} {...panResponder.panHandlers}>
        {loadingSections || cartLoading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#562E19" />
          </View>
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
            // small safety: avoid weird blank cells
            removeClippedSubviews={false}
            // we don't call getItemLayout here because items have variable heights; SectionList handles it
          />
        )}
      </View>

      {totalItems > 0 && (
        <Pressable style={[styles.cartBar, { bottom: Math.max(insets.bottom, hp(3)) }]} onPress={goToCart}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={styles.cartIconWrap}>
              <Ionicons name="cart-outline" size={hp(3)} color="white" />
            </View>
            <View>
              <Text style={styles.cartText}>View Cart</Text>
              <Text style={styles.cartMeta}>
                {totalItems} item{totalItems > 1 ? "s" : ""} • ₹{Math.round(totalPrice)}
              </Text>
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
              <Pressable style={[styles.modalBtn, { backgroundColor: "#ccc" }]} onPress={() => setNoteModalVisible(false)}>
                <Text>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, { backgroundColor: "#562E19" }]} onPress={handleSaveNote}>
                <Text style={{ color: "#fff" }}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ShopDetailScreenEnhanced;

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(3),
  },
  shopName: { fontWeight: "600", fontSize: hp(2.4), maxWidth: SCREEN_W * 0.6 },
  chipsWrapper: { height: hp(7), justifyContent: "center" },
  chip: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.9),
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    minWidth: wp(22),
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: { fontSize: hp(1.5), fontWeight: "600" },
  sectionListWrapper: { flex: 1 },
  sectionHeader: {
    backgroundColor: "#fff",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
  },
  sectionHeaderTitle: { fontSize: hp(1.8), fontWeight: "700" },
  menuRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.4),
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  menuImage: {
    width: wp(20),
    height: hp(10),
    borderRadius: 6,
    backgroundColor: "#f2f2f2",
  },
  menuImagePlaceholder: {
    width: wp(20),
    height: hp(10),
    borderRadius: 6,
    backgroundColor: "#f2f2f2",
  },
  menuLeft: { flex: 1, paddingLeft: wp(4), paddingRight: wp(2) },
  menuName: { fontWeight: "600", fontSize: hp(1.8) },
  menuDescription: { color: "#A3A3A3", marginTop: hp(0.3) },
  price: { marginTop: hp(0.6), fontWeight: "700" },
  addButton: {
    backgroundColor: "#4D392D",
    borderRadius: 6,
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.8),
    alignSelf: "flex-start",
    marginTop: hp(8),
    minWidth: wp(18),
    alignItems: "center",
  },
  addButtonText: { color: "#fff", fontWeight: "700" },
  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(8),
  },
  noteButton: {
    paddingVertical: hp(0.4),
    paddingHorizontal: wp(3),
    borderRadius: 4,
    backgroundColor: "#EFEFEF",
    marginTop: hp(0.8),
  },
  noteButtonText: { color: "#562E19", fontWeight: "500" },
  noteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
    marginTop: hp(0.6),
  },
  savedNoteInline: { fontSize: hp(1.35), color: "#562E19", flexShrink: 1 },
  bestBadge: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 6,
    borderRadius: 6,
    marginLeft: wp(2),
  },
  bestBadgeText: { fontSize: hp(1.1), fontWeight: "700" },
  cartBar: {
    position: "absolute",
    left: wp(4),
    right: wp(4),
    backgroundColor: "#562E19",
    borderRadius: 12,
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(4),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 8,
    shadowColor: "#562E19",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  cartIconWrap: {
    width: hp(4.4),
    height: hp(4.4),
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  cartText: { color: "#fff", fontWeight: "700", fontSize: hp(1.8) },
  cartMeta: { color: "#fff", opacity: 0.9, fontSize: hp(1.1) },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: wp(86),
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: wp(4),
  },
  modalTitle: { fontSize: hp(2), fontWeight: "700", marginBottom: hp(1) },
  noteInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    height: hp(12),
    textAlignVertical: "top",
    padding: wp(2),
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: wp(3),
    marginTop: hp(1),
  },
  modalBtn: {
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(3),
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
});
