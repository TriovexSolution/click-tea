// import React, { useEffect, useState } from "react";
// import {
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   View,
//   FlatList,
//   Pressable,
//   Image,
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

// const ShopDetailScreen = () => {
//   const shopId = useSelector(selectSelectedShopId);
//   const cartItems = useSelector(selectCartItems);
//   const [shopData, setShopData] = useState(null);
//   const [menuData, setMenuData] = useState([]);
//   const [cartMap, setCartMap] = useState({});
//   const navigation = useNavigation();
//   const [cartLoaded, setCartLoaded] = useState(false);

//   const dispatch = useDispatch();

//   // Calculate total items directly from cartItems redux state
//   const totalItems = cartItems.reduce(
//     (acc, item) => acc + (item.quantity || 0),
//     0
//   );

//   // Navigate to cart screen
//   const goToCart = () => {
//     navigation.navigate("cartScreen"); // Change if needed
//   };

//   // Update cartMap when cartItems update
//   useEffect(() => {
//     const map = {};
//     cartItems.forEach((item) => {
//       map[item.menuId] = {
//         ...item.menu,
//         quantity: item.quantity,
//         cartId: item.cartId,
//         addons: item.addons,
//         notes: item.notes,
//       };
//     });
//     setCartMap(map);
//     //     console.log("cartItems in redux:", cartItems);
//     // console.log("totalItems:", totalItems);
//   }, [cartItems, totalItems]);

//   const getToken = async () => {
//     try {
//       return await AsyncStorage.getItem("authToken");
//     } catch {
//       return null;
//     }
//   };

//   const fetchData = async () => {
//     try {
//       const response = await axios.get(
//         `${BASE_URL}/api/shops/detail/${shopId}`
//       );
//       setShopData(response.data);
//     } catch (error) {
//       console.log(error, "Fetch error");
//     }
//   };

//   const fetchMenu = async () => {
//     try {
//       const token = await getToken();
//       const response = await axios.get(
//         `${BASE_URL}/api/menu/public/${shopId}`,
//         {
//           headers: token ? { Authorization: `Bearer ${token}` } : undefined,
//         }
//       );
//       setMenuData(response.data);
//     } catch (error) {
//       console.log(error, "error fetching menu");
//     }
//   };

//   useEffect(() => {
//     fetchData();
//     fetchMenu();

//     (async () => {
//       const id = await getUserIdFromToken();
//       if (id && shopId) {
//         const resultAction = await dispatch(
//           fetchCartAsync({ userId: id, shopId })
//         );
//         // console.log("fetchCartAsync result:", resultAction);
//       }
//       setCartLoaded(true); // <-- mark cart loaded here
//     })();
//   }, []);

//   // Add quantity handler
//   const handleAddQty = async (menu) => {
//     const existing = cartMap[menu.menuId];
//     const quantity = existing ? existing.quantity + 1 : 1;
//     const cartId = existing?.cartId;

//     if (!existing) {
//       try {
//         const res = await dispatch(
//           addToCartAsync({
//             userId: await AsyncStorage.getItem("userId"),
//             shopId,
//             menuId: menu.menuId,
//             quantity: 1,
//             addons: [],
//             notes: "",
//           })
//         ).unwrap();

//         setCartMap((prev) => ({
//           ...prev,
//           [menu.menuId]: { ...menu, quantity: 1, cartId: res.cartId },
//         }));
//       } catch (err) {
//         console.error("Add to cart failed:", err);
//       }
//     } else {
//       dispatch(
//         updateCartItemAsync({
//           cartId,
//           quantity,
//           addons: existing.addons || [],
//           notes: existing.notes || "",
//         })
//       );

//       setCartMap((prev) => ({
//         ...prev,
//         [menu.menuId]: { ...menu, quantity, cartId },
//       }));
//     }
//   };

//   // Remove quantity handler
//   const handleRemoveQty = async (menu) => {
//     const existing = cartMap[menu.menuId];
//     if (!existing) return;

//     const newQty = existing.quantity - 1;

//     if (newQty <= 0) {
//       dispatch(
//         updateCartItemAsync({
//           cartId: existing.cartId,
//           quantity: 0,
//           addons: existing.addons || [],
//           notes: existing.notes || "",
//         })
//       );

//       setCartMap((prev) => {
//         const copy = { ...prev };
//         delete copy[menu.menuId];
//         return copy;
//       });
//     } else {
//       dispatch(
//         updateCartItemAsync({
//           cartId: existing.cartId,
//           quantity: newQty,
//           addons: existing.addons || [],
//           notes: existing.notes || "",
//         })
//       );

//       setCartMap((prev) => ({
//         ...prev,
//         [menu.menuId]: { ...menu, quantity: newQty, cartId: existing.cartId },
//       }));
//     }
//   };

//   const renderItem = ({ item }) => {
//     const cartQty = cartMap[item.menuId]?.quantity || 0;

//     return (
//       <Pressable
//         style={styles.menuRow}
//         onPress={() =>
//           navigation.navigate("menuDetailScreen", {
//             menuId: item.menuId,
//           })
//         }
//       >
//         {item.imageUrl && (
//           <Image
//             source={{ uri: `${BASE_URL}/uploads/menus/${item.imageUrl}` }}
//             style={{ borderRadius: 4, height: hp(10), width: wp(20) }}
//           />
//         )}
//         <View style={styles.menuLeft}>
//           <Text style={styles.menuName} numberOfLines={1}>
//             {item.menuName}
//           </Text>
//           <Text style={styles.menuDescription} numberOfLines={1}>
//             {item.ingredients || "Traditional Indian spiced tea with milk"}
//           </Text>
//           <Text style={styles.price}>₹{item.price}</Text>
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
//       </Pressable>
//     );
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header */}
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
//         ListEmptyComponent={
//           <View style={{ alignItems: "center", marginTop: hp(10) }}>
//             <Text style={{ color: "#888", fontSize: hp(2) }}>
//               No menu available
//             </Text>
//           </View>
//         }
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
//     width: wp(52),
//     alignSelf: "center",
//   },
//   cartModalContent: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 5,
//   },
//   cartModalText: {
//     color: "white",
//     fontSize: hp(2.2),
//     fontWeight: "500",
//   },
//   cartItemCountText: {
//     color: "white",
//     fontWeight: "500",
//     fontSize: hp(1.4),
//     opacity: 0.8,
//   },
// });

// export default ShopDetailScreen;
import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  Image,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "@/api";
import { selectSelectedShopId } from "@/src/Redux/Slice/selectedShopSlice";
import {
  addToCartAsync,
  fetchCartAsync,
  selectCartItems,
  updateCartItemAsync,
} from "@/src/Redux/Slice/cartSlice";
import { hp, wp } from "@/src/assets/utils/responsive";
import CartIconWithBadge from "@/src/components/CartIconBadge";
import { getUserIdFromToken } from "@/src/assets/utils/getUserIdFromToken";

const ShopDetailScreen = () => {
  const shopId = useSelector(selectSelectedShopId);
  const cartItems = useSelector(selectCartItems);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  // modal
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [currentMenu, setCurrentMenu] = useState<any>(null);
  const [noteText, setNoteText] = useState("");

  // shop + menu
  const [shopData, setShopData] = useState<any>(null);
  const [menuData, setMenuData] = useState<any[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);

  // fetch helpers
  const getToken = async () => {
    try {
      return await AsyncStorage.getItem("authToken");
    } catch {
      return null;
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/shops/detail/${shopId}`
      );
      setShopData(response.data);
    } catch (error) {
      console.log("Fetch shop error", error);
    }
  };

  const fetchMenu = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(
        `${BASE_URL}/api/menu/public/${shopId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );
      setMenuData(response.data);
    } catch (error) {
      console.log("Fetch menu error", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchMenu();

    (async () => {
      try {
        const id = await getUserIdFromToken();
        if (id && shopId) {
          await dispatch(fetchCartAsync({ userId: id, shopId }));
        }
      } catch (err) {
        console.error("Initial fetchCart error", err);
      } finally {
        setCartLoaded(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopId]);

  // totals
  const totalItems = useMemo(
    () =>
      cartItems.reduce(
        (acc: number, item: any) => acc + (item.quantity || 0),
        0
      ),
    [cartItems]
  );

  // IMPORTANT: derive cartMap from the authoritative server items (cartItems)
  // map: menuId -> cartItem (server shape)
  const cartMap = useMemo(() => {
    const map: Record<number, any> = {};
    cartItems.forEach((it: any) => {
      if (it && it.menuId != null) map[it.menuId] = it;
    });
    return map;
  }, [cartItems]);

  // ---------- Handlers (always await .unwrap() and check response) ----------

  const handleAddQty = async (menu: any) => {
    try {
      const existing = cartMap[menu.menuId];
      if (!existing) {
        const userId = await AsyncStorage.getItem("userId");
        const payload = {
          userId: Number(userId),
          shopId,
          menuId: menu.menuId,
          quantity: 1,
          addons: [],
          notes: "",
        };
        const added = await dispatch(addToCartAsync(payload)).unwrap();
        console.log("addToCart result:", added); // added should be cartItem
        // reducer will update cartItems
      } else {
        // update existing quantity
        const res = await dispatch(
          updateCartItemAsync({
            cartId: existing.cartId,
            quantity: existing.quantity + 1,
            addons: existing.addons || [],
            notes: existing.notes || "",
          })
        ).unwrap();

        console.log("update after add result:", res);
        if (res?.deleted) {
          // unexpected: server deleted item; re-sync
          const id = await getUserIdFromToken();
          if (id) await dispatch(fetchCartAsync({ userId: id, shopId }));
        }
      }
    } catch (err) {
      console.error("Add qty error:", err);
      // fallback re-sync
      try {
        const id = await getUserIdFromToken();
        if (id) await dispatch(fetchCartAsync({ userId: id, shopId }));
      } catch {}
    }
  };

  const handleRemoveQty = async (menu: any) => {
    try {
      const existing = cartMap[menu.menuId];
      if (!existing) return;
      const newQty = existing.quantity - 1;

      const res = await dispatch(
        updateCartItemAsync({
          cartId: existing.cartId,
          quantity: newQty,
          addons: existing.addons || [],
          notes: newQty > 0 ? existing.notes || "" : "", // clear notes when qty -> 0
        })
      ).unwrap();

      console.log("remove result:", res);
      if (res?.deleted) {
        // reducer should remove, UI will reflect + Add
      }
      // if unexpected, re-sync
      if (!res) {
        const id = await getUserIdFromToken();
        if (id) await dispatch(fetchCartAsync({ userId: id, shopId }));
      }
    } catch (err) {
      console.error("Remove qty error:", err);
      try {
        const id = await getUserIdFromToken();
        if (id) await dispatch(fetchCartAsync({ userId: id, shopId }));
      } catch {}
    }
  };

  const handleSaveNote = async () => {
    try {
      if (currentMenu && cartMap[currentMenu.menuId]) {
        const existing = cartMap[currentMenu.menuId];
        const res = await dispatch(
          updateCartItemAsync({
            cartId: existing.cartId,
            quantity: existing.quantity,
            addons: existing.addons || [],
            notes: noteText || "",
          })
        ).unwrap();

        console.log("save note result:", res);
        if (!res || res.deleted) {
          const id = await getUserIdFromToken();
          if (id) await dispatch(fetchCartAsync({ userId: id, shopId }));
        }
      }
    } catch (err) {
      console.error("Save note error:", err);
      try {
        const id = await getUserIdFromToken();
        if (id) await dispatch(fetchCartAsync({ userId: id, shopId }));
      } catch {}
    } finally {
      setNoteText("");
      setNoteModalVisible(false);
    }
  };

  const goToCart = () => navigation.navigate("cartScreen");

  // ---------- Render ----------

  const renderItem = ({ item }: { item: any }) => {
    const cartEntry = cartMap[item.menuId];
    const cartQty = cartEntry?.quantity || 0;

    return (
      <View style={styles.menuRow}>
        <Pressable
          onPress={() =>
            navigation.navigate("menuDetailScreen", { menuId: item.menuId })
          }
        >
          {item.imageUrl && (
            <Image
              source={{ uri: `${BASE_URL}/uploads/menus/${item.imageUrl}` }}
              style={{ borderRadius: 4, height: hp(10), width: wp(20) }}
            />
          )}
        </Pressable>

        <View style={styles.menuLeft}>
          <Text style={styles.menuName} numberOfLines={1}>
            {item.menuName}
          </Text>

          <Text style={styles.menuDescription} numberOfLines={1}>
            {item.ingredients || "Traditional Indian spiced tea with milk"}
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
                    onPress={() => {
                      setCurrentMenu(item);
                      setNoteText(cartEntry.notes || "");
                      setNoteModalVisible(true);
                    }}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Ionicons name="create-outline" size={18} color="#562E19" />
                  </Pressable>
                </>
              ) : (
                <Pressable
                  style={styles.noteButton}
                  onPress={() => {
                    setCurrentMenu(item);
                    setNoteText("");
                    setNoteModalVisible(true);
                  }}
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
            onPress={() => handleAddQty(item)}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </Pressable>
        ) : (
          <View style={styles.qtyContainer}>
            <Pressable onPress={() => handleRemoveQty(item)}>
              <Ionicons
                name="remove-circle-outline"
                size={24}
                color="#562E19"
              />
            </Pressable>
            <Text style={{ marginHorizontal: 8, color: "#A3A3A3" }}>
              {cartQty}
            </Text>
            <Pressable onPress={() => handleAddQty(item)}>
              <Ionicons name="add-circle-outline" size={24} color="#562E19" />
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={{ paddingRight: wp(3) }}
        >
          <Ionicons name="chevron-back-outline" size={hp(3.5)} />
        </Pressable>

        <Text style={styles.shopName}>
          {shopData?.shopname || "Shop Detail"}
        </Text>

        <CartIconWithBadge />
      </View>

      <Text style={styles.menuTitle}>Menu</Text>
      <View style={{ borderBottomWidth: 1, borderColor: "#E8E8E8" }} />

      <FlatList
        data={menuData}
        renderItem={renderItem}
        keyExtractor={(item) => item.menuId.toString()}
        contentContainerStyle={{ paddingBottom: hp(3) }}
        showsVerticalScrollIndicator={false}
      />

      {cartLoaded && totalItems > 0 && (
        <Pressable style={styles.cartModal} onPress={goToCart}>
          <View style={styles.cartModalContent}>
            <View
              style={{
                backgroundColor: "rgba(0,0,0,0.2)",
                borderRadius: 50,
                padding: 10,
              }}
            >
              <Ionicons name="cart-outline" size={hp(3)} color="white" />
            </View>
            <View style={{ flexDirection: "column" }}>
              <Text style={styles.cartModalText}>View Cart</Text>
              <Text style={styles.cartItemCountText}>
                {totalItems} item{totalItems > 1 ? "s" : ""}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={hp(3.5)}
              color={"white"}
            />
          </View>
        </Pressable>
      )}

      {/* Note modal */}
      <Modal
        visible={noteModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNoteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Custom</Text>
            <TextInput
              style={styles.noteInput}
              value={noteText}
              onChangeText={setNoteText}
              placeholder="e.g. No ginger, less sugar..."
              multiline
            />
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalBtn, { backgroundColor: "#ccc" }]}
                onPress={() => setNoteModalVisible(false)}
              >
                <Text>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, { backgroundColor: "#562E19" }]}
                onPress={handleSaveNote}
              >
                <Text style={{ color: "#fff" }}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: hp(2) },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(2),
    marginHorizontal: wp(2),
    justifyContent: "space-between",
  },
  shopName: { fontWeight: "600", fontSize: hp(2.5), letterSpacing: 0.5 },
  menuTitle: {
    fontWeight: "700",
    fontSize: hp(2),
    marginBottom: hp(1),
    marginLeft: wp(4),
  },
  menuRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
    paddingHorizontal: wp(4),
  },
  menuLeft: { flex: 1, paddingRight: wp(4), paddingLeft: wp(4) },
  menuName: { fontWeight: "600", fontSize: hp(1.8), flexShrink: 1 },
  menuDescription: {
    fontSize: hp(1.2),
    color: "#A3A3A3",
    marginBottom: hp(0.7),
  },
  price: { fontWeight: "700", fontSize: hp(1.8), color: "#333" },
  addButton: {
    backgroundColor: "#4D392D",
    borderRadius: 6,
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.7),
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
    marginTop: hp(4),
  },
  addButtonText: { color: "white", fontWeight: "600", fontSize: hp(1.6) },
  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(4),
  },
  noteButton: {
    paddingVertical: hp(0.4),
    paddingHorizontal: wp(3),
    borderRadius: 4,
    backgroundColor: "#EFEFEF",
  },
  noteButtonText: { fontSize: hp(1.4), color: "#562E19", fontWeight: "500" },
  noteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
    marginTop: hp(0.5),
  },
  savedNoteInline: { fontSize: hp(1.4), color: "#562E19", flexShrink: 1 },
  cartModal: {
    position: "absolute",
    bottom: hp(3),
    backgroundColor: "#562E19",
    borderRadius: 50,
    paddingVertical: hp(1.3),
    paddingHorizontal: wp(5),
    elevation: 10,
    shadowColor: "#562E19",
    shadowOpacity: 0.7,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    width: wp(52),
    alignSelf: "center",
  },
  cartModalContent: { flexDirection: "row", alignItems: "center", gap: 5 },
  cartModalText: { color: "white", fontSize: hp(2.2), fontWeight: "500" },
  cartItemCountText: {
    color: "white",
    fontWeight: "500",
    fontSize: hp(1.4),
    opacity: 0.8,
  },
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalContent: {
    width: wp(80),
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: wp(5),
    elevation: 4,
    borderWidth: 1,
  },
  modalTitle: { fontSize: hp(2), fontWeight: "600", marginBottom: hp(1) },
  noteInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    height: hp(12),
    textAlignVertical: "top",
    marginBottom: hp(2),
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: wp(3),
  },
  modalBtn: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: 6,
  },
});

export default ShopDetailScreen;
