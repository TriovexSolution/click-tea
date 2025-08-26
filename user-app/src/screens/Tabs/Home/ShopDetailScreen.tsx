// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
//   FlatList,
//   Dimensions,
//   Linking,
//   ActivityIndicator,
//   Modal,
//   Pressable,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { useSelector, useDispatch } from "react-redux";
// import axios from "axios";
// import { selectSelectedShopId } from "@/src/Redux/Slice/selectedShopSlice";
// import { BASE_URL } from "@/api";
// import { hp, wp } from "@/src/assets/utils/responsive";
// import CartIconWithBadge from "@/src/components/CartIconBadge";
// import {
//   addToCartAsync,
//   fetchCartAsync,
//   updateCartItemAsync,
// } from "@/src/Redux/Slice/cartSlice";
// import { getUserIdFromToken } from "@/src/assets/utils/getUserIdFromToken";
// import { useNavigation } from "@react-navigation/native";

// export default function RestaurantFlatListScreen() {
//   const shopId = useSelector(selectSelectedShopId);
//   const dispatch = useDispatch();
//   const navigation = useNavigation();

//   const [userId, setUserId] = useState(null);
//   const [shopData, setShopData] = useState(null);
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const [categoryMenus, setCategoryMenus] = useState([]);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [cartMap, setCartMap] = useState({});
// const cartItems = useSelector((state) => state.cart.items);
// // console.log(cartItems);

//   useEffect(() => {
//     fetchUser();
//   }, []);

//   useEffect(() => {
//     if (userId) {
//       dispatch(fetchCartAsync(userId));
//       fetchData();
//     }
//   }, [userId]);
// useEffect(() => {
//   if (cartItems && cartItems.length > 0) {
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
//   }
// }, [cartItems]);

//   const fetchUser = async () => {
//     const id = await getUserIdFromToken();
//     setUserId(id);
//   };

//   const fetchData = async () => {
//     try {
//       const shopRes = await axios.get(`${BASE_URL}/api/shops/detail/${shopId}`);
//       const categoryRes = await axios.get(`${BASE_URL}/api/category/public/${shopId}`);
//       setShopData(shopRes.data);
//       setCategories(categoryRes.data);
//     } catch (err) {
//       console.error("Fetch error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCategoryPress = async (category) => {
//     setSelectedCategory(category);
//     setModalVisible(true);
//     try {
//       const res = await axios.get(
//         `${BASE_URL}/api/menu/public/${shopId}/category/${category.categoryId}`
//       );
//       setCategoryMenus(res.data);
//     } catch (err) {
//       console.error("Failed to fetch menus:", err);
//     }
//   };

//   const handleAddQty = async (menu) => {
//     const existing = cartMap[menu.menuId];
//     const quantity = existing ? existing.quantity + 1 : 1;
//     const cartId = existing?.cartId;

//     if (!existing) {
//       try {
//         const res = await dispatch(
//           addToCartAsync({
//             userId,
//             shopId,
//             menuId: menu.menuId,
//             quantity: 1,
//             addons: [],
//             notes: "",
//           })
//         ).unwrap();

//         const newCartId = res.cartId;
//         setCartMap((prev) => ({
//           ...prev,
//           [menu.menuId]: { ...menu, quantity: 1, cartId: newCartId },
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

//   const handleRemoveQty = (menu) => {
//     const existing = cartMap[menu.menuId];
//     if (!existing) return;

//     const newQty = existing.quantity - 1;

//     if (newQty <= 0) {
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

//   const renderCategory = ({ item }) => (
//     <TouchableOpacity style={styles.categoryCard} onPress={() => handleCategoryPress(item)}>
//       <Image
//         source={{ uri: `${BASE_URL}/uploads/categories/${item.categoryImage}` }}
//         style={styles.categoryImage}
//       />
//       <Text style={styles.categoryName}>{item.categoryName}</Text>
//     </TouchableOpacity>
//   );

//   const renderMenuItem = ({ item }) => {
//     const cartQty = cartMap[item.menuId]?.quantity || 0;
//     // console.log(cartQty);

//     return (
//       <View key={item.menuId} style={styles.menuItem}>
//         <Image
//           source={{ uri: `${BASE_URL}/uploads/menus/${item.imageUrl}` }}
//           style={styles.menuImage}
//         />
//         <View style={{ flex: 1 }}>
//           <Text style={styles.menuName}>{item.menuName}</Text>
//           <Text style={styles.menuPrice}>₹{item.price}</Text>
//         </View>
//        {cartQty === 0 ? (

//   <TouchableOpacity style={styles.addBtn} onPress={() => handleAddQty(item)}>
//     <Text style={styles.addText}>+ ADD</Text>
//   </TouchableOpacity>
// ) : (
//   <View style={styles.qtyContainer}>
//     <TouchableOpacity onPress={() => handleRemoveQty(item)}>
//       <Ionicons name="remove-circle-outline" size={24} color="#007B55" />
//     </TouchableOpacity>
//     <Text style={{ marginHorizontal: 8 }}>{cartQty}</Text>
//     <TouchableOpacity onPress={() => handleAddQty(item)}>
//       <Ionicons name="add-circle-outline" size={24} color="#007B55" />
//     </TouchableOpacity>
//   </View>
// )}

//       </View>
//     );
//   };

//   if (loading || !shopData) {
//     return (
//       <View style={styles.loader}>
//         <ActivityIndicator size="large" color="#ff5a60" />
//       </View>
//     );
//   }

//   return (
//     <View style={{ flex: 1, backgroundColor: "white" }}>
//       {/* 🔙 Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Ionicons name="arrow-back" size={24} color="#333" />
//         </TouchableOpacity>
//         <View style={styles.headerIcons}>
//           <TouchableOpacity onPress={() => Linking.openURL("https://share.com")}>
//             <Ionicons name="share-social-outline" size={24} color="#333" style={styles.iconSpacing} />
//           </TouchableOpacity>
//           <TouchableOpacity>
//             <Ionicons name="heart-outline" size={24} color="#333" style={styles.iconSpacing} />
//           </TouchableOpacity>
//           <CartIconWithBadge />
//         </View>
//       </View>

//       <FlatList
//         ListHeaderComponent={
//           <>
//             <Image
//               source={{ uri: `${BASE_URL}/uploads/shops/${shopData.shopImage}` }}
//               style={styles.shopImage}
//             />
//             <Text style={styles.menuHeading}>Categories</Text>
//             <FlatList
//               data={categories}
//               renderItem={renderCategory}
//               keyExtractor={(item, index) => item.id?.toString() || index.toString()}
//               horizontal
//               showsHorizontalScrollIndicator={false}
//               contentContainerStyle={styles.horizontalList}
//             />
//           </>
//         }
//         data={[]}
//         renderItem={null}
//       />

//       {/* 🍽 Menu Modal */}
//       <Modal visible={modalVisible} transparent animationType="slide">
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>{selectedCategory?.categoryName}</Text>
//               <Pressable onPress={() => setModalVisible(false)}>
//                 <Ionicons name="close" size={24} color="#333" />
//               </Pressable>
//             </View>

//             <FlatList
//               data={categoryMenus}
//               keyExtractor={(item) => item.menuId.toString()}
//               renderItem={renderMenuItem}
//               contentContainerStyle={styles.modalContent}
//               ListEmptyComponent={<Text>No menu found.</Text>}
//             />
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   loader: { flex: 1, justifyContent: "center", alignItems: "center" },
//   header: {
//     flexDirection: "row",
//     padding: 12,
//     alignItems: "center",
//     justifyContent: "space-between",
//     backgroundColor: "#fff",
//     elevation: 2,
//   },
//   headerIcons: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   iconSpacing: {
//     marginRight: 12,
//   },
//   shopImage: { width: "100%", height: 200, backgroundColor: "##E8E8E8" },
//   menuHeading: { fontSize: 18, fontWeight: "bold", paddingHorizontal: 16, marginVertical: 8 },
//   horizontalList: { paddingLeft: 10, paddingBottom: 10 },
//   categoryCard: {
//     backgroundColor: "#f5f5f5",
//     padding: 12,
//     marginRight: 12,
//     borderRadius: 12,
//     alignItems: "center",
//     elevation: 2,
//     width: wp(28),
//   },
//   categoryImage: { height: hp(7), width: wp(14), resizeMode: "contain", marginBottom: 6 },
//   categoryName: { fontSize: 13, fontWeight: "600", textAlign: "center", color: "#333" },
//   modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
//   modalContainer: {
//     height: "80%",
//     backgroundColor: "white",
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     padding: 16,
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   modalTitle: { fontSize: 18, fontWeight: "bold" },
//   modalContent: { paddingBottom: 30 },
//   menuItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 16,
//     gap: 10,
//   },
//   menuImage: { width: 50, height: 50, borderRadius: 6 },
//   menuName: { fontWeight: "bold" },
//   menuPrice: { color: "#666" },
//   addBtn: {
//     backgroundColor: "#e6f4ea",
//     paddingVertical: 4,
//     paddingHorizontal: 10,
//     borderRadius: 20,
//   },
//   addText: { color: "#007B55", fontWeight: "600", fontSize: 13 },
//   qtyContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#e6f4ea",
//     borderRadius: 20,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//   },
// });
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  Image,
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
  const [shopData, setShopData] = useState(null);
  const [menuData, setMenuData] = useState([]);
  const [cartMap, setCartMap] = useState({});
  const navigation = useNavigation();
  const [cartLoaded, setCartLoaded] = useState(false);

  const dispatch = useDispatch();

  // Calculate total items directly from cartItems redux state
  const totalItems = cartItems.reduce(
    (acc, item) => acc + (item.quantity || 0),
    0
  );

  // Navigate to cart screen
  const goToCart = () => {
    navigation.navigate("cartScreen"); // Change if needed
  };

  // Update cartMap when cartItems update
  useEffect(() => {
    const map = {};
    cartItems.forEach((item) => {
      map[item.menuId] = {
        ...item.menu,
        quantity: item.quantity,
        cartId: item.cartId,
        addons: item.addons,
        notes: item.notes,
      };
    });
    setCartMap(map);
  //     console.log("cartItems in redux:", cartItems);
  // console.log("totalItems:", totalItems);
  }, [cartItems,totalItems]);

  const getToken = async () => {
    try {
      return await AsyncStorage.getItem("authToken");
    } catch {
      return null;
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/shops/detail/${shopId}`);
      setShopData(response.data);
    } catch (error) {
      console.log(error, "Fetch error");
    }
  };

  const fetchMenu = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(`${BASE_URL}/api/menu/public/${shopId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setMenuData(response.data);
    } catch (error) {
      console.log(error, "error fetching menu");
    }
  };

  useEffect(() => {
    fetchData();
    fetchMenu();

    (async () => {
     const id = await getUserIdFromToken();
if (id && shopId) {
  const resultAction = await dispatch(fetchCartAsync({ userId: id, shopId }));
  // console.log("fetchCartAsync result:", resultAction);
}
         setCartLoaded(true);  // <-- mark cart loaded here
    })();
  }, []);

  // Add quantity handler
  const handleAddQty = async (menu) => {
    const existing = cartMap[menu.menuId];
    const quantity = existing ? existing.quantity + 1 : 1;
    const cartId = existing?.cartId;

    if (!existing) {
      try {
        const res = await dispatch(
          addToCartAsync({
            userId: await AsyncStorage.getItem("userId"),
            shopId,
            menuId: menu.menuId,
            quantity: 1,
            addons: [],
            notes: "",
          })
        ).unwrap();

        setCartMap((prev) => ({
          ...prev,
          [menu.menuId]: { ...menu, quantity: 1, cartId: res.cartId },
        }));
      } catch (err) {
        console.error("Add to cart failed:", err);
      }
    } else {
      dispatch(
        updateCartItemAsync({
          cartId,
          quantity,
          addons: existing.addons || [],
          notes: existing.notes || "",
        })
      );

      setCartMap((prev) => ({
        ...prev,
        [menu.menuId]: { ...menu, quantity, cartId },
      }));
    }
  };

  // Remove quantity handler
  const handleRemoveQty = async (menu) => {
    const existing = cartMap[menu.menuId];
    if (!existing) return;

    const newQty = existing.quantity - 1;

    if (newQty <= 0) {
      dispatch(
        updateCartItemAsync({
          cartId: existing.cartId,
          quantity: 0,
          addons: existing.addons || [],
          notes: existing.notes || "",
        })
      );

      setCartMap((prev) => {
        const copy = { ...prev };
        delete copy[menu.menuId];
        return copy;
      });
    } else {
      dispatch(
        updateCartItemAsync({
          cartId: existing.cartId,
          quantity: newQty,
          addons: existing.addons || [],
          notes: existing.notes || "",
        })
      );

      setCartMap((prev) => ({
        ...prev,
        [menu.menuId]: { ...menu, quantity: newQty, cartId: existing.cartId },
      }));
    }
  };

  const renderItem = ({ item }) => {
    const cartQty = cartMap[item.menuId]?.quantity || 0;

    return (
      <Pressable style={styles.menuRow} onPress={()=>navigation.navigate("menuDetailScreen",{
        menuId: item.menuId
      })}>
        {item.imageUrl && (
          <Image
            source={{ uri: `${BASE_URL}/uploads/menus/${item.imageUrl}` }}
            style={{ borderRadius: 4, height: hp(10), width: wp(20) }}
          />
        )}
        <View style={styles.menuLeft}>
          <Text style={styles.menuName} numberOfLines={1}>
            {item.menuName}
          </Text>
          <Text style={styles.menuDescription} numberOfLines={1}>
            {item.ingredients || "Traditional Indian spiced tea with milk"}
          </Text>
          <Text style={styles.price}>₹{item.price}</Text>
        </View>

        {cartQty === 0 ? (
          <Pressable style={styles.addButton} onPress={() => handleAddQty(item)}>
            <Text style={styles.addButtonText}>+ Add</Text>
          </Pressable>
        ) : (
          <View style={styles.qtyContainer}>
            <Pressable onPress={() => handleRemoveQty(item)}>
              <Ionicons name="remove-circle-outline" size={24} color="#562E19" />
            </Pressable>
            <Text style={{ marginHorizontal: 8, color: "#A3A3A3" }}>{cartQty}</Text>
            <Pressable onPress={() => handleAddQty(item)}>
              <Ionicons name="add-circle-outline" size={24} color="#562E19" />
            </Pressable>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={{ paddingRight: wp(3) }}>
          <Ionicons name="chevron-back-outline" size={hp(3.5)} />
        </Pressable>
        <Text style={styles.shopName}>{shopData?.shopname || "Shop Detail"}</Text>
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
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: hp(10) }}>
            <Text style={{ color: "#888", fontSize: hp(2) }}>No menu available</Text>
          </View>
        }
      />

      { cartLoaded  && totalItems > 0 && (
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
  menuDescription: { fontSize: hp(1.2), color: "#A3A3A3", marginBottom: hp(0.7) },
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
  qtyContainer: { flexDirection: "row", alignItems: "center", marginTop: hp(4) },
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
  cartModalContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  cartModalText: {
    color: "white",
    fontSize: hp(2.2),
    fontWeight: "500",
  },
  cartItemCountText: {
    color: "white",
    fontWeight: "500",
    fontSize: hp(1.4),
    opacity: 0.8,
  },
});

export default ShopDetailScreen;
