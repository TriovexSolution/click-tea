// // import React, { useState, useMemo, useCallback } from "react";
// // import {
// //   View,
// //   Text,
// //   TouchableOpacity,
// //   StyleSheet,
// //   Alert,
// //   Image,
// //   Modal,
// //   FlatList,
// //   ActivityIndicator,
// //   RefreshControl,
// // } from "react-native";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import {
// //   CommonActions,
// //   ParamListBase,
// //   useNavigation,
// //   useFocusEffect,
// // } from "@react-navigation/native";
// // import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// // import Animated, { FadeInDown } from "react-native-reanimated";

// // import axiosClient from "@/src/assets/api/client";
// // import { BASE_URL } from "@/api";
// // import { hp } from "@/src/assets/utils/responsive";
// // import theme from "@/src/assets/colors/theme";
// // import { useAuth } from "@/src/context/authContext";

// // const randomAvatars = [
// //   "https://i.pravatar.cc/150?img=12",
// //   "https://i.pravatar.cc/150?img=24",
// //   "https://i.pravatar.cc/150?img=34",
// // ];

// // const HomeScreen = () => {
// //   const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
// //   const { signOut } = useAuth();

// //   const [categoryCount, setCategoryCount] = useState(0);
// //   const [menuCount, setMenuCount] = useState(0);
// //   const [profile, setProfile] = useState<any>(null);
// //   const [bestSellers, setBestSellers] = useState<any[]>([]);
// //   const [showSetupModal, setShowSetupModal] = useState(false);
// //   const [loading, setLoading] = useState(true);
// //   const [refreshing, setRefreshing] = useState(false);

// //   // 🔑 Logout handler
// //   const handleLogout = async () => {
// //     await signOut();
// //     navigation.dispatch(
// //       CommonActions.reset({
// //         index: 0,
// //         routes: [{ name: "signInScreen" }],
// //       })
// //     );
// //   };

// //   // 🔑 Fetch data
// //   const fetchData = async () => {
// //     try {
// //       if (!refreshing) setLoading(true);

// //       const setupStep = await AsyncStorage.getItem("setupStep");

// //       const [catRes, menuRes, profileRes, bestRes] = await Promise.all([
// //         axiosClient.get("/api/category/me"),
// //         axiosClient.get("/api/menu/me"),
// //         axiosClient.get("/api/profile"),
// //         axiosClient.get("/api/best-sellers/me"),
// //       ]);

// //       setCategoryCount(catRes.data.length || 0);
// //       setMenuCount(menuRes.data.length || 0);
// //       setProfile(profileRes.data || null);
// //       setBestSellers(bestRes.data || []);

// //       if (setupStep !== "complete") {
// //         if (!catRes.data.length || !menuRes.data.length) {
// //           setShowSetupModal(true);
// //         } else {
// //           await AsyncStorage.setItem("setupStep", "complete");
// //         }
// //       }
// //     } catch (err) {
// //       console.log("HomeScreen error:", err);
// //       Alert.alert("Error", "Could not load data. Please try again.");
// //     } finally {
// //       setLoading(false);
// //       setRefreshing(false);
// //     }
// //   };

// //   // Auto refresh on screen focus
// //   useFocusEffect(
// //     useCallback(() => {
// //       fetchData();
// //     }, [])
// //   );

// //   const onRefresh = useCallback(() => {
// //     setRefreshing(true);
// //     fetchData();
// //   }, []);

// //   const userImage =
// //     profile?.userImage ||
// //     randomAvatars[Math.floor(Math.random() * randomAvatars.length)];

// //   // Sections for FlatList
// //   const sections = useMemo(
// //     () => [
// //       {
// //         key: "header",
// //         render: () => (
// //           <Animated.View
// //             entering={FadeInDown.duration(500)}
// //             style={styles.headerRow}
// //           >
// //             <View>
// //               <Text style={styles.greet}>
// //                 Hi, {profile?.username || "User"} 👋
// //               </Text>
// //               <Text style={styles.subtext}>Welcome back to ClickTea!</Text>
// //             </View>
// //             <Image source={{ uri: userImage }} style={styles.avatar} />
// //           </Animated.View>
// //         ),
// //       },
// //       {
// //         key: "overview",
// //         render: () => (
// //           <Animated.View
// //             entering={FadeInDown.delay(100).duration(500)}
// //             style={styles.sectionCard}
// //           >
// //             <Text style={styles.sectionTitle}>🏪 Shop Overview</Text>
// //             <Text style={styles.detail}>Name: {profile?.shopName || "-"}</Text>
// //             <Text style={styles.detail}>
// //               Status: {profile?.isOpen ? "Open ✅" : "Closed ❌"}
// //             </Text>
// //             <Text style={styles.detail}>
// //               Address: {profile?.shopAddress || "N/A"}
// //             </Text>
// //           </Animated.View>
// //         ),
// //       },
// //       {
// //         key: "insights",
// //         render: () => (
// //           <Animated.View
// //             entering={FadeInDown.delay(200).duration(500)}
// //             style={styles.sectionCard}
// //           >
// //             <Text style={styles.sectionTitle}>📊 Insights</Text>
// //             <Text style={styles.detail}>📂 Categories: {categoryCount}</Text>
// //             <Text style={styles.detail}>🍽 Menu Items: {menuCount}</Text>
// //           </Animated.View>
// //         ),
// //       },
// //       {
// //         key: "actions",
// //         render: () => (
// //           <Animated.View
// //             entering={FadeInDown.delay(300).duration(500)}
// //             style={styles.actionRow}
// //           >
// //             <TouchableOpacity
// //               onPress={() => navigation.navigate("addCategoryScreen")}
// //               style={styles.actionBtn}
// //             >
// //               <Text style={styles.actionText}>+ Category</Text>
// //             </TouchableOpacity>
// //             <TouchableOpacity
// //               onPress={() => navigation.navigate("addMenuScreen")}
// //               style={[styles.actionBtn, { backgroundColor: theme.PRIMARY_COLOR }]}
// //             >
// //               <Text style={styles.actionText}>+ Menu</Text>
// //             </TouchableOpacity>
// //           </Animated.View>
// //         ),
// //       },
// //       {
// //         key: "bestSellers",
// //         render: () => (
// //           <Animated.View
// //             entering={FadeInDown.delay(400).duration(500)}
// //             style={styles.sectionCard}
// //           >
// //             <Text style={styles.sectionTitle}>⭐ Best Sellers</Text>
// //             {bestSellers.length === 0 ? (
// //               <Text style={styles.detail}>No best sellers yet</Text>
// //             ) : (
// //               bestSellers.map((item) => (
// //                 <View
// //                   key={item.id || item.menuId}
// //                   style={styles.bestSellerRow}
// //                 >
// //                   <Image
// //                     source={{
// //                       uri: item.imageUrl
// //                         ? `${BASE_URL}/uploads/menus/${item.imageUrl}`
// //                         : "https://via.placeholder.com/80",
// //                     }}
// //                     style={styles.bestSellerImg}
// //                   />
// //                   <Text style={styles.bestSellerText}>
// //                     {item.menuName} - ₹{item.price}
// //                   </Text>
// //                 </View>
// //               ))
// //             )}
// //             <TouchableOpacity
// //               onPress={() => navigation.navigate("manageBestSellerScreen")}
// //               style={[styles.actionBtn, { marginTop: hp(1) }]}
// //             >
// //               <Text style={styles.actionText}>Manage Best Sellers</Text>
// //             </TouchableOpacity>
// //           </Animated.View>
// //         ),
// //       },
// //     ],
// //     [profile, categoryCount, menuCount, bestSellers, userImage]
// //   );

// //   if (loading) {
// //     return (
// //       <View style={styles.loadingContainer}>
// //         <ActivityIndicator size="large" color={theme.PRIMARY_COLOR} />
// //         <Text>Loading...</Text>
// //       </View>
// //     );
// //   }

// //   return (
// //     <View style={{ flex: 1 }}>
// //       <FlatList
// //         contentContainerStyle={styles.container}
// //         data={sections}
// //         keyExtractor={(item) => item.key}
// //         renderItem={({ item }) => item.render()}
// //         refreshControl={
// //           <RefreshControl
// //             refreshing={refreshing}
// //             onRefresh={onRefresh}
// //             colors={[theme.PRIMARY_COLOR]}
// //           />
// //         }
// //         ListFooterComponent={
// //           <Modal visible={showSetupModal} transparent animationType="fade">
// //             <View style={styles.modalOverlay}>
// //               <View style={styles.modalBox}>
// //                 <Text style={styles.modalTitle}>🚧 Setup Incomplete</Text>
// //                 <Text style={styles.modalMessage}>
// //                   Please add at least 1 category and 1 menu item to continue.
// //                 </Text>
// //                 <TouchableOpacity
// //                   onPress={() => {
// //                     setShowSetupModal(false);
// //                     navigation.navigate("addCategoryScreen");
// //                   }}
// //                   style={styles.modalBtn}
// //                 >
// //                   <Text style={styles.modalBtnText}>Add Now</Text>
// //                 </TouchableOpacity>
// //               </View>
// //             </View>
// //           </Modal>
// //         }
// //       />

// //       <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
// //         <Text style={styles.logoutText}>Logout</Text>
// //       </TouchableOpacity>
// //     </View>
// //   );
// // };

// // export default HomeScreen;

// // const styles = StyleSheet.create({
// //   container: {
// //     padding: hp(2),
// //     backgroundColor: "#fff",
// //   },
// //   headerRow: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //     marginBottom: hp(2.5),
// //   },
// //   greet: {
// //     fontSize: hp(2.6),
// //     fontWeight: "bold",
// //   },
// //   subtext: {
// //     fontSize: hp(1.8),
// //     color: "gray",
// //   },
// //   avatar: {
// //     width: 50,
// //     height: 50,
// //     borderRadius: 25,
// //   },
// //   sectionCard: {
// //     backgroundColor: theme.PRIMARY_COLOR,
// //     padding: hp(2),
// //     borderRadius: 12,
// //     marginBottom: hp(2),
// //   },
// //   sectionTitle: {
// //     color: "#fff",
// //     fontSize: hp(2.2),
// //     fontWeight: "600",
// //     marginBottom: hp(1),
// //   },
// //   detail: {
// //     color: "#fff",
// //     fontSize: hp(1.8),
// //     marginBottom: 4,
// //   },
// //   actionRow: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     gap: 10,
// //     marginBottom: hp(2),
// //   },
// //   actionBtn: {
// //     flex: 1,
// //     backgroundColor: theme.SECONDARY_COLOR,
// //     padding: hp(1.5),
// //     borderRadius: 10,
// //     alignItems: "center",
// //   },
// //   actionText: {
// //     color: "#fff",
// //     fontWeight: "bold",
// //     fontSize: hp(2),
// //   },
// //   bestSellerRow: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     marginBottom: 8,
// //   },
// //   bestSellerImg: {
// //     width: 40,
// //     height: 40,
// //     borderRadius: 6,
// //     marginRight: 10,
// //   },
// //   bestSellerText: {
// //     color: "#fff",
// //     fontSize: hp(1.9),
// //   },
// //   modalOverlay: {
// //     flex: 1,
// //     backgroundColor: "rgba(0,0,0,0.5)",
// //     justifyContent: "center",
// //     alignItems: "center",
// //   },
// //   modalBox: {
// //     backgroundColor: "#fff",
// //     padding: 20,
// //     borderRadius: 10,
// //     width: "80%",
// //     alignItems: "center",
// //   },
// //   modalTitle: {
// //     fontSize: 18,
// //     fontWeight: "bold",
// //     marginBottom: 10,
// //   },
// //   modalMessage: {
// //     fontSize: 14,
// //     textAlign: "center",
// //     marginBottom: 20,
// //   },
// //   modalBtn: {
// //     backgroundColor: "#007AFF",
// //     paddingVertical: 10,
// //     paddingHorizontal: 25,
// //     borderRadius: 6,
// //   },
// //   modalBtnText: {
// //     color: "#fff",
// //     fontWeight: "600",
// //   },
// //   loadingContainer: {
// //     flex: 1,
// //     justifyContent: "center",
// //     alignItems: "center",
// //   },
// //   logoutBtn: {
// //     backgroundColor: "red",
// //     paddingVertical: 12,
// //     paddingHorizontal: 24,
// //     borderRadius: 8,
// //     margin: hp(2),
// //     alignItems: "center",
// //   },
// //   logoutText: {
// //     color: "white",
// //     fontSize: 16,
// //     fontWeight: "bold",
// //   },
// // });
// // HomeScreen.js
// import React, { useState, useCallback, useMemo } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
//   Switch,
//   FlatList,
//   ActivityIndicator,
//   RefreshControl,
//   Alert,
//   SafeAreaView,
// } from "react-native";
// import { useNavigation, useFocusEffect } from "@react-navigation/native";
// import axiosClient from "@/src/assets/api/client"; // your axios instance
// import theme from "@/src/assets/colors/theme";
// import { hp, wp } from "@/src/assets/utils/responsive";
// import { Ionicons, MaterialIcons } from "@expo/vector-icons"; // or react-native-vector-icons

// const StatCard = React.memo(({ title, value, ctaLabel, onPress, icon }) => (
//   <View style={styles.statCard}>
//     <View style={styles.statTop}>
//       <View style={styles.statIconWrap}>{icon}</View>
//       <Text style={styles.statValue}>{value}</Text>
//     </View>
//     <Text style={styles.statTitle}>{title}</Text>

//     <TouchableOpacity style={styles.statButton} onPress={onPress} activeOpacity={0.8}>
//       <Text style={styles.statButtonText}>{ctaLabel}</Text>
//     </TouchableOpacity>
//   </View>
// ));

// const OrderCard = React.memo(({ item, onCallPress, onPress }) => {
//   const statusColor =
//     item.status === "preparing" ? "#FFD980" : item.status === "ready" ? "#D4F8E8" : "#F0F0F0";
//   const statusTextColor =
//     item.status === "preparing" ? "#9A6F2E" : item.status === "ready" ? "#1B7A4B" : "#666";

//   return (
//     <TouchableOpacity style={styles.orderCard} onPress={() => onPress?.(item)} activeOpacity={0.9}>
//       <View style={styles.orderLeft}>
//         <View style={styles.orderRowTop}>
//           <Text style={styles.orderId}>{item.orderId}</Text>
//           <View style={[styles.statusPill, { backgroundColor: statusColor }]}>
//             <Text style={[styles.statusText, { color: statusTextColor }]}>{item.statusLabel}</Text>
//           </View>
//         </View>

//         <Text style={styles.orderCustomer}>{item.customerName}</Text>

//         <View style={styles.orderMeta}>
//           <Ionicons name="time-outline" size={14} color="#999" />
//           <Text style={styles.metaText}>{item.timeAgo}</Text>
//         </View>
//       </View>

//       <View style={styles.orderRight}>
//         <Text style={styles.orderAmount}>₹{item.amount}</Text>

//         <TouchableOpacity onPress={() => onCallPress?.(item)} style={styles.callBtn} activeOpacity={0.7}>
//           <MaterialIcons name="call" size={20} color={theme.PRIMARY_COLOR} />
//         </TouchableOpacity>
//       </View>
//     </TouchableOpacity>
//   );
// });

// const HomeScreen = () => {
//   const navigation = useNavigation();
//   const [profile, setProfile] = useState(null);
//   const [orders, setOrders] = useState([]);
//   const [ordersCount, setOrdersCount] = useState(0);
//   const [revenue, setRevenue] = useState(0);
//   const [isOpen, setIsOpen] = useState(true);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   // fetch data
// // Replace your fetchData with this in HomeScreen
// const fetchData = useCallback(async () => {
//   setRefreshing(true);
//   setLoading(true);
//   try {
//     // show axiosClient config for quick sanity check
//     try {
//       console.log("axios baseURL:", axiosClient.defaults?.baseURL);
//     } catch (e) { console.log("axiosClient inspect error", e); }

//     // request list - do them sequentially so we can see which fails
//     let profileRes, overviewRes, ordersRes;

//     // 1) profile
//     try {
//       profileRes = await axiosClient.get("/api/profile");
//       console.log("profile ok", profileRes?.status);
//       setProfile(profileRes.data || null);
//     } catch (err) {
//       console.warn("Failed /api/profile", extractAxiosErrorInfo(err));
//       Alert.alert("API error", `GET /api/profile → ${extractAxiosErrorInfo(err).short}`);
//       throw err; // stop further processing so you can fix it first
//     }

//     // 2) overview
//     try {
//       overviewRes = await axiosClient.get("/api/shops/overview");
//       console.log("overview ok", overviewRes?.status);
//       setOrdersCount(overviewRes.data?.ordersToday ?? 0);
//       setRevenue(overviewRes.data?.revenueToday ?? 0);
//     } catch (err) {
//       console.warn("Failed /api/shop/overview", extractAxiosErrorInfo(err));
//       Alert.alert("API error", `GET /api/shop/overview → ${extractAxiosErrorInfo(err).short}`);
//       throw err;
//     }

//     // 3) orders
//     try {
//       ordersRes = await axiosClient.get("/api/orders/shop-orders?limit=10");
//       console.log("orders ok", ordersRes?.status);
//       const normalized = (ordersRes.data || []).map((o) => ({
//         orderId: o.orderId || o.id || "ORD000",
//         status: o.status || "new",
//         statusLabel:
//           (o.status === "preparing" && "Preparing") ||
//           (o.status === "ready" && "Ready") ||
//           (o.status === "delivered" && "Delivered") ||
//           (o.status === "new" && "New") ||
//           o.status,
//         customerName: o.username || o.customerName || "Customer",
//         timeAgo: o.timeAgo || "2 mins ago",
//         amount: o.totalAmount ?? o.amount ?? 0,
//         phone: o.phone || o.userPhone || null,
//       }));
//       setOrders(normalized);
//     } catch (err) {
//       console.warn("Failed /api/orders/shop-orders", extractAxiosErrorInfo(err));
//       Alert.alert("API error", `GET /api/orders/shop-orders → ${extractAxiosErrorInfo(err).short}`);
//       throw err;
//     }

//   } catch (finalErr) {
//     // finalErr already alerted above; keep loading state handling below
//     console.warn("fetchData final error", finalErr);
//   } finally {
//     setLoading(false);
//     setRefreshing(false);
//   }
// }, []);

// function extractAxiosErrorInfo(err) {
//   // Prints helpful fields safely
//   const info = {
//     message: err?.message,
//     url: err?.config?.url,
//     method: err?.config?.method,
//     baseURL: err?.config?.baseURL || axiosClient.defaults?.baseURL,
//     status: err?.response?.status,
//     data: err?.response?.data,
//   };
//   // create a short message for Alerts
//   const short = info.status ? `${info.status} ${JSON.stringify(info.data)?.slice(0, 120)}` : info.message;
//   return { ...info, short };
// }

//   useFocusEffect(
//     React.useCallback(() => {
//       fetchData();
//     }, [fetchData])
//   );

//   const onToggleOpen = async (val) => {
//     // optimistic UI + persist
//     setIsOpen(val);
//     try {
//       await axiosClient.put("/api/shop/set-open", { isOpen: !!val }); // adjust endpoint
//     } catch (err) {
//       console.warn("Failed to update open status", err);
//       Alert.alert("Error", "Could not update shop status");
//       setIsOpen((p) => !p); // revert
//     }
//   };

//   const onAddItem = () => navigation.navigate("addMenuScreen");
//   const onViewOrders = () => navigation.navigate("ordersScreen");

//   const onCall = (item) => {
//     // open phone dialer (Linking) - keep simple here
//     Alert.alert("Call", `Call ${item.phone || "customer"} (not implemented)`);
//   };

//   const onPressOrder = (item) => navigation.navigate("orderDetailScreen", { orderId: item.orderId });

//   const listHeader = useMemo(
//     () => (
//       <View>
//         {/* Top header with shop name + toggle */}
//         <View style={styles.header}>
//           <View>
//             <Text style={styles.shopName}>{profile?.shopName || "Your Shop"}</Text>
//             <Text style={styles.shopLocation}>{profile?.address || "Koramangala, Bangalore"}</Text>
//           </View>
//           <View style={styles.openRow}>
//             <Text style={styles.openText}>{isOpen ? "Shop Open" : "Shop Closed"}</Text>
//             <Switch value={isOpen} onValueChange={onToggleOpen} thumbColor="#fff" trackColor={{ true: theme.PRIMARY_COLOR, false: "#ccc" }} />
//           </View>
//         </View>

//         {/* stats row */}
//         <View style={styles.statsRow}>
//           <StatCard
//             title="Orders Today"
//             value={ordersCount}
//             ctaLabel="Add Item"
//             onPress={onAddItem}
//             icon={<Ionicons name="receipt-outline" size={22} color="#333" />}
//           />
//           <StatCard
//             title="Today's Revenue"
//             value={`₹${revenue}`}
//             ctaLabel="View Order"
//             onPress={onViewOrders}
//             icon={<Ionicons name="cash-outline" size={22} color="#333" />}
//           />
//         </View>

//         <Text style={styles.sectionTitle}>Recent Orders</Text>
//       </View>
//     ),
//     [profile, isOpen, ordersCount, revenue, onAddItem, onViewOrders]
//   );

//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color={theme.PRIMARY_COLOR} />
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <FlatList
//         data={orders}
//         keyExtractor={(it) => String(it.orderId)}
//         ListHeaderComponent={listHeader}
//         renderItem={({ item }) => <OrderCard item={item} onCallPress={onCall} onPress={onPressOrder} />}
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} tintColor={theme.PRIMARY_COLOR} />}
//         contentContainerStyle={{ paddingBottom: hp(6) }}
//         ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
//         ListEmptyComponent={() => (
//           <View style={styles.emptyBox}>
//             <Text style={styles.emptyText}>No recent orders</Text>
//           </View>
//         )}
//       />

//       {/* Floating actions: Menu / Category quick shortcuts */}
//       <View style={styles.fabRow}>
//         <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate("categoriesScreen")}>
//           <Ionicons name="grid-outline" size={20} color="#fff" />
//           <Text style={styles.fabText}>Categories</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={[styles.fab, { backgroundColor: theme.PRIMARY_COLOR }]} onPress={() => navigation.navigate("menuScreen")}>
//           <Ionicons name="restaurant-outline" size={20} color="#fff" />
//           <Text style={styles.fabText}>Menu</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default HomeScreen;

// /* Styles */
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: wp(4), paddingTop: hp(1) },

//   header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: hp(2) },
//   shopName: { fontSize: hp(2.4), fontWeight: "700", color: "#111" },
//   shopLocation: { fontSize: hp(1.4), color: "#666", marginTop: 4 },

//   openRow: { alignItems: "center", justifyContent: "center" },
//   openText: { fontSize: hp(1.2), color: "#333", marginBottom: 6 },

//   statsRow: { flexDirection: "row", justifyContent: "space-between", gap: 12, marginBottom: hp(2) },
//   statCard: {
//     flex: 1,
//     backgroundColor: "#fff",
//     padding: hp(1.6),
//     borderRadius: 14,
//     marginRight: 8,
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOpacity: 0.06,
//     shadowRadius: 8,
//     shadowOffset: { width: 0, height: 4 },
//   },
//   statTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
//   statIconWrap: { width: 40, height: 40, borderRadius: 10, backgroundColor: "#f6f6f6", alignItems: "center", justifyContent: "center" },
//   statValue: { fontSize: hp(2), fontWeight: "700" },
//   statTitle: { fontSize: hp(1.3), color: "#666", marginTop: 8 },
//   statButton: { marginTop: 12, backgroundColor: "#6f4136", paddingVertical: 10, borderRadius: 10, alignItems: "center" },
//   statButtonText: { color: "#fff", fontWeight: "700" },

//   sectionTitle: { fontSize: hp(1.6), color: "#222", marginTop: hp(1), marginBottom: hp(1) },

//   orderCard: {
//     flexDirection: "row",
//     backgroundColor: "#fff",
//     padding: hp(1.2),
//     borderRadius: 12,
//     alignItems: "center",
//     elevation: 1,
//     shadowColor: "#000",
//     shadowOpacity: 0.04,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 6,
//     justifyContent: "space-between",
//   },
//   orderLeft: { flex: 1 },
//   orderRowTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
//   orderId: { fontWeight: "700", color: "#111" },
//   statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
//   statusText: { fontWeight: "600", fontSize: 12 },

//   orderCustomer: { marginTop: 6, color: "#333" },
//   orderMeta: { marginTop: 8, flexDirection: "row", alignItems: "center", gap: 6 },
//   metaText: { marginLeft: 6, color: "#999", fontSize: 12 },

//   orderRight: { alignItems: "flex-end", marginLeft: 12 },
//   orderAmount: { fontWeight: "800", color: "#111", marginBottom: 8 },
//   callBtn: { backgroundColor: "#F5F5F5", padding: 8, borderRadius: 8 },

//   fabRow: {
//     position: "absolute",
//     bottom: hp(2),
//     left: wp(4),
//     right: wp(4),
//     flexDirection: "row",
//     justifyContent: "space-between",
//     gap: 12,
//   },
//   fab: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 12,
//     borderRadius: 12,
//     backgroundColor: "#333",
//   },
//   fabText: { color: "#fff", marginLeft: 8, fontWeight: "700" },

//   emptyBox: { padding: 20, alignItems: "center" },
//   emptyText: { color: "#999" },

//   centered: { flex: 1, alignItems: "center", justifyContent: "center" },
// });
// // HomeScreen.js
// import React, { useCallback, useMemo, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Switch,
//   FlatList,
//   ActivityIndicator,
//   RefreshControl,
//   Alert,
//   SafeAreaView,
//   Image,
//   Linking,
//   Dimensions,
// } from "react-native";
// import { useNavigation, useFocusEffect } from "@react-navigation/native";
// import axiosClient from "@/src/assets/api/client";
// import theme from "@/src/assets/colors/theme";
// import { hp, wp } from "@/src/assets/utils/responsive";
// import { Ionicons, MaterialIcons } from "@expo/vector-icons";

// const windowWidth = Dimensions.get("window").width;

// const StatCard = React.memo(({ title, value, ctaLabel, onPress }) => (
//   <View style={styles.statCard}>
//     <View style={styles.statTop}>
//       <Text style={styles.statValue}>{value}</Text>
//       <Ionicons name="chevron-forward-circle" size={28} color="#bdbdbd" />
//     </View>
//     <Text style={styles.statTitle}>{title}</Text>

//     <TouchableOpacity style={styles.cardCta} onPress={onPress} activeOpacity={0.85}>
//       <Text style={styles.cardCtaText}>{ctaLabel}</Text>
//     </TouchableOpacity>
//   </View>
// ));

// const BestSellerItem = React.memo(({ item }) => {
//   return (
//     <View style={styles.bestCard}>
//       {item.imageUrl ? (
//         <Image source={{ uri: item.imageUrl }} style={styles.bestImg} />
//       ) : (
//         <View style={styles.bestImgPlaceholder}>
//           <Ionicons name="image-outline" size={28} color="#bbb" />
//         </View>
//       )}
//       <Text numberOfLines={1} style={styles.bestName}>{item.menuName || "Unknown"}</Text>
//       <Text style={styles.bestPrice}>₹{item.price ?? item.totalSoldPrice ?? "--"}</Text>
//     </View>
//   );
// });

// const OrderRow = React.memo(({ item, onCall, onPress }) => {
//   const bg =
//     item.status === "preparing" ? "#FFF6E6" : item.status === "ready" ? "#E9FFF2" : "#F5F5F7";
//   const textColor =
//     item.status === "preparing" ? "#9A6F2E" : item.status === "ready" ? "#1B7A4B" : "#666";
//   return (
//     <TouchableOpacity style={[styles.orderCard, { backgroundColor: "#fff" }]} onPress={() => onPress?.(item)}>
//       <View style={{ flex: 1 }}>
//         <View style={styles.rowBetween}>
//           <Text style={styles.orderId}>{item.orderId}</Text>
//           <View style={[styles.statusPill, { backgroundColor: bg }]}>
//             <Text style={[styles.statusText, { color: textColor }]}>{item.statusLabel}</Text>
//           </View>
//         </View>

//         <Text style={styles.orderCustomer}>{item.customerName}</Text>

//         <View style={styles.metaRow}>
//           <Ionicons name="time-outline" size={14} color="#999" />
//           <Text style={styles.metaText}>{item.timeAgo || "2 mins ago"}</Text>
//         </View>
//       </View>

//       <View style={{ alignItems: "flex-end", marginLeft: 12 }}>
//         <Text style={styles.orderAmount}>₹{item.amount}</Text>
//         <TouchableOpacity
//           style={styles.callBtn}
//           onPress={() => {
//             if (item.phone) {
//               Linking.openURL(`tel:${item.phone}`).catch(() => Alert.alert("Error", "Cannot start call"));
//             } else onCall?.(item);
//           }}
//         >
//           <MaterialIcons name="call" size={18} color={theme.PRIMARY_COLOR} />
//         </TouchableOpacity>
//       </View>
//     </TouchableOpacity>
//   );
// });

// const HomeScreen = () => {
//   const navigation = useNavigation();
//   const [profile, setProfile] = useState(null);
//   const [orders, setOrders] = useState([]);
//   const [ordersTodayCount, setOrdersTodayCount] = useState(0);
//   const [revenueToday, setRevenueToday] = useState(0);
//   const [bestSellers, setBestSellers] = useState([]);
//   const [isOpen, setIsOpen] = useState(true);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   function extractAxiosErrorInfo(err) {
//     const info = {
//       message: err?.message,
//       url: err?.config?.url,
//       method: err?.config?.method,
//       baseURL: err?.config?.baseURL || axiosClient.defaults?.baseURL,
//       status: err?.response?.status,
//       data: err?.response?.data,
//     };
//     const short = info.status ? `${info.status} ${JSON.stringify(info.data)?.slice(0, 120)}` : info.message;
//     return { ...info, short };
//   }

//   const computeTodayStatsFromOrders = useCallback((ordersList) => {
//     // Determine 'today' in server timezone (best effort: compare YYYY-MM-DD prefix)
//     const today = new Date().toISOString().slice(0, 10);
//     const todays = (ordersList || []).filter((o) => {
//       const created = o.created_at || o.createdAt || o.date || o.createdAtServer || o.timestamp;
//       if (!created) return false;
//       return String(created).slice(0, 10) === today;
//     });
//     const ordersCount = todays.length;
//     const revenue = todays.reduce((s, o) => s + Number(o.totalAmount || o.amount || 0), 0);
//     return { ordersCount, revenue };
//   }, []);

//   const fetchData = useCallback(async () => {
//     setRefreshing(true);
//     setLoading(true);
//     try {
//       console.log("axios baseURL:", axiosClient.defaults?.baseURL);

//       // 1) profile
//       let profileRes;
//       try {
//         profileRes = await axiosClient.get("/api/profile");
//         setProfile(profileRes.data || null);
//       } catch (err) {
//         console.warn("GET /api/profile failed", extractAxiosErrorInfo(err));
//         Alert.alert("API error", `Profile failed: ${extractAxiosErrorInfo(err).short}`);
//         // still continue to try other endpoints if profile fails
//       }

//       // 2) orders (recent)
//       let ordersRes;
//       try {
//         ordersRes = await axiosClient.get("/api/orders/shop-orders?limit=50");
//         const rawOrders = ordersRes.data || [];
//         // normalize
//         const normalized = rawOrders.map((o) => ({
//           orderId: o.orderId || o.id || `ORD${String(o.orderId || o.id || "").padStart(3, "0")}`,
//           status: o.status || "new",
//           statusLabel:
//             (o.status === "preparing" && "Preparing") ||
//             (o.status === "ready" && "Ready") ||
//             (o.status === "delivered" && "Delivered") ||
//             (o.status === "new" && "New") ||
//             (o.status || "New"),
//           customerName: o.username || o.customerName || o.userName || "Customer",
//           timeAgo: o.timeAgo,
//           amount: Number(o.totalAmount ?? o.amount ?? 0),
//           created_at: o.created_at || o.createdAt || o.date,
//           phone: o.phone || o.userPhone || null,
//         }));
//         setOrders(normalized);

//         // compute fallback stats (used if overview endpoint missing)
//         const { ordersCount, revenue } = computeTodayStatsFromOrders(rawOrders);
//         // set fallback values now; overview endpoint may overwrite below
//         setOrdersTodayCount(ordersCount);
//         setRevenueToday(revenue);
//       } catch (err) {
//         console.warn("GET /api/orders/shop-orders failed", extractAxiosErrorInfo(err));
//         Alert.alert("API error", `Orders failed: ${extractAxiosErrorInfo(err).short}`);
//       }

//       // 3) best sellers
//       try {
//         const bestRes = await axiosClient.get("/api/best-sellers/me");
//         // server might return { data: [...] } or array directly
//         const list = bestRes.data || [];
//         // normalize minimal fields
//         const normalizedBest = (Array.isArray(list) ? list : list.data || []).map((b) => ({
//           menuName: b.menuName || b.name,
//           imageUrl: b.imageUrl ? (b.imageUrl.startsWith("http") ? b.imageUrl : `${b.imageUrl}`) : (b.image ? b.image : null),
//           price: b.price ?? b.totalPrice ?? b.amount,
//         }));
//         setBestSellers(normalizedBest);
//       } catch (err) {
//         // not fatal — show "Not available" later
//         console.warn("GET /api/best-sellers/me failed", extractAxiosErrorInfo(err));
//         setBestSellers([]);
//       }

//       // 4) try overview endpoint (two possible paths, robust)
//       try {
//         // try older path first
//         let overviewRes;
//         try {
//           overviewRes = await axiosClient.get("/api/shop/overview");
//         } catch (e1) {
//           // try plural path
//           overviewRes = await axiosClient.get("/api/shops/overview");
//         }
//         if (overviewRes?.data) {
//           setOrdersTodayCount(overviewRes.data?.ordersToday ?? overviewRes?.data?.orders ?? ordersTodayCount);
//           setRevenueToday(overviewRes.data?.revenueToday ?? overviewRes?.data?.revenue ?? revenueToday);
//         }
//       } catch (err) {
//         // 404 or missing endpoint is expected sometimes; we already set fallback above
//         console.warn("Overview endpoint missing — using computed stats (OK).", extractAxiosErrorInfo(err));
//       }
//     } catch (err) {
//       console.warn("fetchData final error", err);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, [computeTodayStatsFromOrders]);

//   useFocusEffect(
//     React.useCallback(() => {
//       fetchData();
//     }, [fetchData])
//   );

//   const onToggleOpen = async (val) => {
//     setIsOpen(val);
//     try {
//       // attempt to persist (adjust endpoint if different)
//       await axiosClient.put("/api/shop/set-open", { isOpen: !!val });
//     } catch (err) {
//       console.warn("Failed to update open", extractAxiosErrorInfo(err));
//       Alert.alert("Error", "Could not update shop status");
//       setIsOpen((p) => !p);
//     }
//   };

//   const onAddMenu = () => navigation.navigate("addMenuScreen");
//   const onAddCategory = () => navigation.navigate("addCategoryScreen");
//   const onViewOrders = () => navigation.navigate("ordersScreen");
//   const onManageBest = () => navigation.navigate("manageBestSellerScreen");

//   const onCall = (item) => {
//     if (item.phone) {
//       Linking.openURL(`tel:${item.phone}`).catch(() => Alert.alert("Error", "Cannot start call"));
//     } else Alert.alert("No phone", "Customer phone not available");
//   };

//   const renderHeader = useMemo(() => {
//     return (
//       <>
//         <View style={styles.header}>
//           <View>
//             <Text style={styles.shopName}>{profile?.shopName || "Chai Point"}</Text>
//             <Text style={styles.shopLocation}>{profile?.shopAddress || "Koramangala, Bangalore"}</Text>
//           </View>

//           <View style={styles.openRow}>
//             <Text style={styles.openText}>{isOpen ? "Shop Open" : "Shop Closed"}</Text>
//             <Switch
//               value={isOpen}
//               onValueChange={onToggleOpen}
//               thumbColor="#fff"
//               trackColor={{ true: theme.PRIMARY_COLOR, false: "#ccc" }}
//             />
//           </View>
//         </View>

     
//         {/* 4 action buttons (outside card feel) */}
//         <View style={styles.actionsGrid}>
//           <TouchableOpacity style={styles.actionBtn} onPress={onAddMenu}>
//             <Ionicons name="restaurant" size={18} color="#fff" />
//             <Text style={styles.actionText}>Add Menu</Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={styles.actionBtn} onPress={onAddCategory}>
//             <Ionicons name="albums" size={18} color="#fff" />
//             <Text style={styles.actionText}>Add Category</Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#6f4136" }]} onPress={onViewOrders}>
//             <Ionicons name="list" size={18} color="#fff" />
//             <Text style={styles.actionText}>View Orders</Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#6f4136" }]} onPress={onManageBest}>
//             <Ionicons name="star" size={18} color="#fff" />
//             <Text style={styles.actionText}>Manage Best Sellers</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Best sellers */}
//         <View style={styles.bestHeaderRow}>
//           <Text style={styles.sectionTitle}>Best Sellers</Text>
//           <TouchableOpacity onPress={onManageBest}>
//             <Text style={styles.manageLink}>Manage</Text>
//           </TouchableOpacity>
//         </View>

//         {bestSellers && bestSellers.length > 0 ? (
//           <FlatList
//             data={bestSellers}
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             keyExtractor={(b, i) => `${b.menuName || i}-${i}`}
//             renderItem={({ item }) => <BestSellerItem item={item} />}
//             contentContainerStyle={{ paddingVertical: 8, paddingLeft: 4 }}
//           />
//         ) : (
//           <View style={styles.bestEmpty}>
//             <Text style={styles.bestEmptyText}>No best sellers available</Text>
//           </View>
//         )}

//         <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Recent Orders</Text>
//       </>
//     );
//   }, [profile, isOpen, ordersTodayCount, revenueToday, bestSellers]);

//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color={theme.PRIMARY_COLOR} />
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <FlatList
//         data={orders}
//         keyExtractor={(it) => String(it.orderId)}
//         ListHeaderComponent={renderHeader}
//         renderItem={({ item }) => <OrderRow item={item} onCall={onCall} onPress={() => navigation.navigate("orderDetailScreen", { orderId: item.orderId })} />}
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} tintColor={theme.PRIMARY_COLOR} />}
//         contentContainerStyle={{ paddingBottom: hp(8) }}
//         ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
//         ListEmptyComponent={() => (
//           <View style={styles.emptyBox}>
//             <Text style={styles.emptyText}>No recent orders</Text>
//           </View>
//         )}
//       />
//     </SafeAreaView>
//   );
// };

// export default HomeScreen;

// /* Styles */
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f7f7f9", paddingHorizontal: wp(4), paddingTop: hp(1) },

//   header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: hp(2) },
//   shopName: { fontSize: hp(2.6), fontWeight: "800", color: "#111" },
//   shopLocation: { fontSize: hp(1.4), color: "#666", marginTop: 4 },

//   openRow: { alignItems: "center", justifyContent: "center" },
//   openText: { fontSize: hp(1.2), color: "#333", marginBottom: 6 },

//   statsRow: { flexDirection: "row", justifyContent: "space-between", gap: 12, marginBottom: hp(2) },
//   statCard: {
//     flex: 1,
//     backgroundColor: "#fff",
//     padding: hp(1.6),
//     borderRadius: 14,
//     marginRight: 8,
//     elevation: 3,
//     shadowColor: "#000",
//     shadowOpacity: 0.06,
//     shadowRadius: 8,
//     shadowOffset: { width: 0, height: 4 },
//   },
//   statTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
//   statValue: { fontSize: hp(2.2), fontWeight: "800", color: "#111" },
//   statTitle: { fontSize: hp(1.2), color: "#666", marginTop: 8 },
//   cardCta: { marginTop: 12, backgroundColor: "#6f4136", paddingVertical: 10, borderRadius: 10, alignItems: "center" },
//   cardCtaText: { color: "#fff", fontWeight: "800" },

//   actionsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 10, marginTop: hp(1), marginBottom: hp(1) },
//   actionBtn: {
//     width: (windowWidth - wp(8) - 12) / 2, // two in a row with padding
//     backgroundColor: "#333",
//     paddingVertical: 12,
//     borderRadius: 12,
//     alignItems: "center",
//     marginBottom: 10,
//     flexDirection: "row",
//     justifyContent: "center",
//     gap: 8,
//   },
//   actionText: { color: "#fff", fontWeight: "700", marginLeft: 8 },

//   bestHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: hp(1) },
//   sectionTitle: { fontSize: hp(1.6), color: "#222" },
//   manageLink: { color: theme.PRIMARY_COLOR, fontWeight: "700" },

//   bestCard: {
//     width: 120,
//     height: 140,
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 10,
//     marginRight: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOpacity: 0.04,
//     shadowRadius: 6,
//     shadowOffset: { width: 0, height: 3 },
//   },
//   bestImg: { width: 80, height: 60, borderRadius: 8, marginBottom: 8, resizeMode: "cover" },
//   bestImgPlaceholder: { width: 80, height: 60, borderRadius: 8, backgroundColor: "#fafafa", alignItems: "center", justifyContent: "center", marginBottom: 8 },
//   bestName: { fontWeight: "700", fontSize: 13, color: "#111" },
//   bestPrice: { color: "#666", marginTop: 4 },

//   bestEmpty: { backgroundColor: "#fff", padding: 12, borderRadius: 12, alignItems: "center", marginTop: 8 },
//   bestEmptyText: { color: "#999" },

//   orderCard: {
//     flexDirection: "row",
//     backgroundColor: "#fff",
//     padding: hp(1.2),
//     borderRadius: 12,
//     alignItems: "center",
//     elevation: 1,
//     shadowColor: "#000",
//     shadowOpacity: 0.04,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 6,
//     justifyContent: "space-between",
//   },
//   rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
//   orderId: { fontWeight: "800", color: "#111" },
//   statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
//   statusText: { fontWeight: "700", fontSize: 12 },

//   orderCustomer: { marginTop: 6, color: "#333", fontWeight: "600" },
//   metaRow: { marginTop: 8, flexDirection: "row", alignItems: "center" },
//   metaText: { marginLeft: 6, color: "#999", fontSize: 12 },

//   orderRight: { alignItems: "flex-end", marginLeft: 12 },
//   orderAmount: { fontWeight: "900", color: "#111", marginBottom: 8 },
//   callBtn: { backgroundColor: "#F5F5F5", padding: 8, borderRadius: 8 },

//   emptyBox: { padding: 20, alignItems: "center" },
//   emptyText: { color: "#999" },

//   centered: { flex: 1, alignItems: "center", justifyContent: "center" },
// });

import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  SafeAreaView,
  Image,
  Linking,
  Dimensions,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import axiosClient from "@/src/assets/api/client";
import theme from "@/src/assets/colors/theme";
import { hp, wp } from "@/src/assets/utils/responsive";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const windowWidth = Dimensions.get("window").width;

const StatCard = React.memo(({ title, value }) => (
  <View style={styles.statCard}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </View>
));

const BestSellerItem = React.memo(({ item }) => {
  return (
    <View style={styles.bestCard}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.bestImg} />
      ) : (
        <View style={styles.bestImgPlaceholder}>
          <Ionicons name="image-outline" size={28} color="#bbb" />
        </View>
      )}
      <Text numberOfLines={1} style={styles.bestName}>{item.menuName || "Unknown"}</Text>
      <Text style={styles.bestPrice}>₹{item.price ?? item.totalSoldPrice ?? "--"}</Text>
    </View>
  );
});

const OrderRow = React.memo(({ item, onCall, onPress }) => {
  const bg =
    item.status === "preparing" ? "#FFF6E6" : item.status === "ready" ? "#E9FFF2" : "#F5F5F7";
  const textColor =
    item.status === "preparing" ? "#9A6F2E" : item.status === "ready" ? "#1B7A4B" : "#666";
  return (
    <TouchableOpacity style={[styles.orderCard, { backgroundColor: "#fff" }]} onPress={() => onPress?.(item)}>
      <View style={{ flex: 1 }}>
        <View style={styles.rowBetween}>
          <Text style={styles.orderId}>{item.orderId}</Text>
          <View style={[styles.statusPill, { backgroundColor: bg }]}>
            <Text style={[styles.statusText, { color: textColor }]}>{item.statusLabel}</Text>
          </View>
        </View>

        <Text style={styles.orderCustomer}>{item.customerName}</Text>

        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={14} color="#999" />
          <Text style={styles.metaText}>{item.timeAgo || "2 mins ago"}</Text>
        </View>
      </View>

      <View style={{ alignItems: "flex-end", marginLeft: 12 }}>
        <Text style={styles.orderAmount}>₹{item.amount}</Text>
        <TouchableOpacity
          style={styles.callBtn}
          onPress={() => {
            if (item.phone) {
              Linking.openURL(`tel:${item.phone}`).catch(() => Alert.alert("Error", "Cannot start call"));
            } else onCall?.(item);
          }}
        >
          <MaterialIcons name="call" size={18} color={theme.PRIMARY_COLOR} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});

const HomeScreen = () => {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersTodayCount, setOrdersTodayCount] = useState(0);
  const [revenueToday, setRevenueToday] = useState(0);
  const [bestSellers, setBestSellers] = useState([]);
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  function extractAxiosErrorInfo(err) {
    const info = {
      message: err?.message,
      url: err?.config?.url,
      method: err?.config?.method,
      baseURL: err?.config?.baseURL || axiosClient.defaults?.baseURL,
      status: err?.response?.status,
      data: err?.response?.data,
    };
    const short = info.status ? `${info.status} ${JSON.stringify(info.data)?.slice(0, 120)}` : info.message;
    return { ...info, short };
  }

  const computeTodayStatsFromOrders = useCallback((ordersList) => {
    // Determine 'today' in server timezone (best effort: compare YYYY-MM-DD prefix)
    const today = new Date().toISOString().slice(0, 10);
    const todays = (ordersList || []).filter((o) => {
      const created = o.created_at || o.createdAt || o.date || o.createdAtServer || o.timestamp;
      if (!created) return false;
      return String(created).slice(0, 10) === today;
    });
    const ordersCount = todays.length;
    const revenue = todays.reduce((s, o) => s + Number(o.totalAmount || o.amount || 0), 0);
    return { ordersCount, revenue };
  }, []);

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      console.log("axios baseURL:", axiosClient.defaults?.baseURL);

      // 1) profile
      let profileRes;
      try {
        profileRes = await axiosClient.get("/api/profile");
        setProfile(profileRes.data || null);
      } catch (err) {
        console.warn("GET /api/profile failed", extractAxiosErrorInfo(err));
        Alert.alert("API error", `Profile failed: ${extractAxiosErrorInfo(err).short}`);
        // still continue to try other endpoints if profile fails
      }

      // 2) orders (recent)
      let ordersRes;
      try {
        ordersRes = await axiosClient.get("/api/orders/shop-orders?limit=50");
        const rawOrders = ordersRes.data || [];
        // normalize
        const normalized = rawOrders.map((o) => ({
          orderId: o.orderId || o.id || `ORD${String(o.orderId || o.id || "").padStart(3, "0")}`,
          status: o.status || "new",
          statusLabel:
            (o.status === "preparing" && "Preparing") ||
            (o.status === "ready" && "Ready") ||
            (o.status === "delivered" && "Delivered") ||
            (o.status === "new" && "New") ||
            (o.status || "New"),
          customerName: o.username || o.customerName || o.userName || "Customer",
          timeAgo: o.timeAgo,
          amount: Number(o.totalAmount ?? o.amount ?? 0),
          created_at: o.created_at || o.createdAt || o.date,
          phone: o.phone || o.userPhone || null,
        }));
        setOrders(normalized);

        // compute fallback stats (used if overview endpoint missing)
        const { ordersCount, revenue } = computeTodayStatsFromOrders(rawOrders);
        // set fallback values now; overview endpoint may overwrite below
        setOrdersTodayCount(ordersCount);
        setRevenueToday(revenue);
      } catch (err) {
        console.warn("GET /api/orders/shop-orders failed", extractAxiosErrorInfo(err));
        Alert.alert("API error", `Orders failed: ${extractAxiosErrorInfo(err).short}`);
      }

      // 3) best sellers
      try {
        const bestRes = await axiosClient.get("/api/best-sellers/me");
        // server might return { data: [...] } or array directly
        const list = bestRes.data || [];
        // normalize minimal fields
        const normalizedBest = (Array.isArray(list) ? list : list.data || []).map((b) => ({
          menuName: b.menuName || b.name,
          imageUrl: b.imageUrl ? (b.imageUrl.startsWith("http") ? b.imageUrl : `${b.imageUrl}`) : (b.image ? b.image : null),
          price: b.price ?? b.totalPrice ?? b.amount,
        }));
        setBestSellers(normalizedBest);
      } catch (err) {
        // not fatal — show "Not available" later
        console.warn("GET /api/best-sellers/me failed", extractAxiosErrorInfo(err));
        setBestSellers([]);
      }

      // 4) try overview endpoint (two possible paths, robust)
      try {
        // try older path first
        let overviewRes;
        try {
          overviewRes = await axiosClient.get("/api/shop/overview");
        } catch (e1) {
          // try plural path
          overviewRes = await axiosClient.get("/api/shops/overview");
        }
        if (overviewRes?.data) {
          setOrdersTodayCount(overviewRes.data?.ordersToday ?? overviewRes?.data?.orders ?? ordersTodayCount);
          setRevenueToday(overviewRes.data?.revenueToday ?? overviewRes?.data?.revenue ?? revenueToday);
        }
      } catch (err) {
        // 404 or missing endpoint is expected sometimes; we already set fallback above
        console.warn("Overview endpoint missing — using computed stats (OK).", extractAxiosErrorInfo(err));
      }
    } catch (err) {
      console.warn("fetchData final error", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [computeTodayStatsFromOrders]);

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const onToggleOpen = async (val) => {
    setIsOpen(val);
    try {
      // attempt to persist (adjust endpoint if different)
      await axiosClient.put("/api/shop/set-open", { isOpen: !!val });
    } catch (err) {
      console.warn("Failed to update open", extractAxiosErrorInfo(err));
      Alert.alert("Error", "Could not update shop status");
      setIsOpen((p) => !p);
    }
  };

  const onAddMenu = () => navigation.navigate("addMenuScreen");
  const onAddCategory = () => navigation.navigate("addCategoryScreen");
  const onViewOrders = () => navigation.navigate("ordersScreen");
  const onManageBest = () => navigation.navigate("manageBestSellerScreen");

  const onCall = (item) => {
    if (item.phone) {
      Linking.openURL(`tel:${item.phone}`).catch(() => Alert.alert("Error", "Cannot start call"));
    } else Alert.alert("No phone", "Customer phone not available");
  };

  const renderHeader = useMemo(() => {
    return (
      <>
        <View style={styles.header}>
          <View>
            <Text style={styles.shopName}>{profile?.shopName || "Chai Point"}</Text>
            <Text style={styles.shopLocation}>{profile?.shopAddress || "Koramangala, Bangalore"}</Text>
          </View>

          <View style={styles.openRow}>
            <Text style={styles.openText}>{isOpen ? "Shop Open" : "Shop Closed"}</Text>
            <Switch
              value={isOpen}
              onValueChange={onToggleOpen}
              thumbColor="#fff"
              trackColor={{ true: theme.PRIMARY_COLOR, false: "#ccc" }}
            />
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatCard title="Orders Today" value={ordersTodayCount} />
          <StatCard title="Today's Revenue" value={`₹${revenueToday}`} />
        </View>

        {/* 4 action buttons (outside card feel) */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionBtn} onPress={onAddMenu}>
            <Ionicons name="restaurant" size={18} color="#fff" />
            <Text style={styles.actionText}>Add Menu</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={onAddCategory}>
            <Ionicons name="albums" size={18} color="#fff" />
            <Text style={styles.actionText}>Add Category</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={onViewOrders}>
            <Ionicons name="list" size={18} color="#fff" />
            <Text style={styles.actionText}>View Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={onManageBest}>
            <Ionicons name="star" size={18} color="#fff" />
            <Text style={styles.actionText}>Manage Best Sellers</Text>
          </TouchableOpacity>
        </View>

        {/* Best sellers */}
        <View style={styles.bestHeaderRow}>
          <Text style={styles.sectionTitle}>Best Sellers</Text>
          <TouchableOpacity onPress={onManageBest}>
            <Text style={styles.manageLink}>Manage</Text>
          </TouchableOpacity>
        </View>

        {bestSellers && bestSellers.length > 0 ? (
          <FlatList
            data={bestSellers}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(b, i) => `${b.menuName || i}-${i}`}
            renderItem={({ item }) => <BestSellerItem item={item} />}
            contentContainerStyle={{ paddingVertical: 8, paddingLeft: 4 }}
          />
        ) : (
          <View style={styles.bestEmpty}>
            <Text style={styles.bestEmptyText}>No best sellers available</Text>
          </View>
        )}

        <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Recent Orders</Text>
      </>
    );
  }, [profile, isOpen, ordersTodayCount, revenueToday, bestSellers]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.PRIMARY_COLOR} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(it) => String(it.orderId)}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => <OrderRow item={item} onCall={onCall} onPress={() => navigation.navigate("orderDetailScreen", { orderId: item.orderId })} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} tintColor={theme.PRIMARY_COLOR} />}
        contentContainerStyle={{ paddingBottom: hp(8) }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No recent orders</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;

/* Styles */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f9", paddingHorizontal: wp(4), paddingTop: hp(1) },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: hp(2) },
  shopName: { fontSize: hp(2.6), fontWeight: "800", color: "#111" },
  shopLocation: { fontSize: hp(1.4), color: "#666", marginTop: 4 },

  openRow: { alignItems: "center", justifyContent: "center" },
  openText: { fontSize: hp(1.2), color: "#333", marginBottom: 6 },

  statsRow: { flexDirection: "row", justifyContent: "space-between", gap: 12, marginBottom: hp(2) },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: hp(1.6),
    borderRadius: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  statValue: { fontSize: hp(2.2), fontWeight: "800", color: "#111" },
  statTitle: { fontSize: hp(1.2), color: "#666", marginTop: 8 },

  actionsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 10, marginTop: hp(1), marginBottom: hp(1) },
  actionBtn: {
    width: (windowWidth - wp(8) - 12) / 2, // two in a row with padding
    backgroundColor: "#6f4136",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  actionText: { color: "#fff", fontWeight: "700", marginLeft: 8 },

  bestHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: hp(1) },
  sectionTitle: { fontSize: hp(1.6), color: "#222" },
  manageLink: { color: theme.PRIMARY_COLOR, fontWeight: "700" },

  bestCard: {
    width: 120,
    height: 140,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  bestImg: { width: 80, height: 60, borderRadius: 8, marginBottom: 8, resizeMode: "cover" },
  bestImgPlaceholder: { width: 80, height: 60, borderRadius: 8, backgroundColor: "#fafafa", alignItems: "center", justifyContent: "center", marginBottom: 8 },
  bestName: { fontWeight: "700", fontSize: 13, color: "#111" },
  bestPrice: { color: "#666", marginTop: 4 },

  bestEmpty: { backgroundColor: "#fff", padding: 12, borderRadius: 12, alignItems: "center", marginTop: 8 },
  bestEmptyText: { color: "#999" },

  orderCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: hp(1.2),
    borderRadius: 12,
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    justifyContent: "space-between",
  },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  orderId: { fontWeight: "800", color: "#111" },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontWeight: "700", fontSize: 12 },

  orderCustomer: { marginTop: 6, color: "#333", fontWeight: "600" },
  metaRow: { marginTop: 8, flexDirection: "row", alignItems: "center" },
  metaText: { marginLeft: 6, color: "#999", fontSize: 12 },

  orderRight: { alignItems: "flex-end", marginLeft: 12 },
  orderAmount: { fontWeight: "900", color: "#111", marginBottom: 8 },
  callBtn: { backgroundColor: "#F5F5F5", padding: 8, borderRadius: 8 },

  emptyBox: { padding: 20, alignItems: "center" },
  emptyText: { color: "#999" },

  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
});