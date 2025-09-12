// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   StyleSheet,
//   Image,
//   Alert,
// } from "react-native";
// import axiosClient from "@/src/assets/api/client";
// import { BASE_URL } from "@/api";
// import { hp } from "@/src/assets/utils/responsive";
// import theme from "@/src/assets/colors/theme";

// const ManageBestSellerScreen = () => {
//   const [menus, setMenus] = useState<any[]>([]);
//   const [bestSellers, setBestSellers] = useState<number[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     try {
//       setLoading(true);

//       const [menuRes, bestRes] = await Promise.all([
//         axiosClient.get(`${BASE_URL}/api/menu/me`),
//         axiosClient.get(`${BASE_URL}/api/best-sellers/me`),
//       ]);

//       setMenus(menuRes.data);
//       setBestSellers(bestRes.data.map((b: any) => b.menuId)); // now consistent with backend
//     } catch (err: any) {
//       console.log("BestSeller fetch error:", err.response?.data || err.message);
//       Alert.alert("Error loading best sellers");
//     } finally {
//       setLoading(false);
//     }
//   };
// const toggleBestSeller = async (menuId: number) => {
//   try {
//     if (bestSellers.includes(menuId)) {
//       // remove
//       await axiosClient.delete(`${BASE_URL}/api/best-sellers/${menuId}`);
//     } else {
//       // add
//       await axiosClient.post(`${BASE_URL}/api/best-sellers`, { menuId });
//     }

//     // 🔑 Always refresh from backend after update
//     const bestRes = await axiosClient.get(`${BASE_URL}/api/best-sellers/me`);
//     setBestSellers(bestRes.data.map((b: any) => b.menuId));

//   } catch (err: any) {
//     console.log("Toggle error:", err.response?.data || err.message);  
//     Alert.alert("Error updating best seller");
//   }
// };


//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color={theme.PRIMARY_COLOR} />
//         <Text>Loading menus...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>🍵 Manage Best Sellers</Text>

//       <FlatList
//         data={menus}
//         keyExtractor={(item) => item.menuId.toString()}
//         renderItem={({ item }) => {
//           const isBestSeller = bestSellers.includes(item.menuId);

//           return (
//             <View style={styles.card}>
//               <Image
//                 source={{
//                   uri: item.imageUrl
//                     ? `${BASE_URL}/uploads/menus/${item.imageUrl}`
//                     : "https://via.placeholder.com/80",
//                 }}
//                 style={styles.image}
//               />
//               <View style={{ flex: 1 }}>
//                 <Text style={styles.name}>{item.menuName}</Text>
//                 <Text style={styles.price}>₹ {item.price}</Text>
//               </View>
//               <TouchableOpacity
//                 style={[styles.btn, isBestSeller && { backgroundColor: "red" }]}
//                 onPress={() => toggleBestSeller(item.menuId)}
//               >
//                 <Text style={styles.btnText}>
//                   {isBestSeller ? "Remove" : "Add"}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           );
//         }}
//       />
//     </View>
//   );
// };

// export default ManageBestSellerScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     padding: hp(2),
//   },
//   title: {
//     fontSize: hp(2.4),
//     fontWeight: "bold",
//     marginBottom: hp(2),
//     color: theme.PRIMARY_COLOR,
//   },
//   card: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: hp(1.5),
//     backgroundColor: "#f8f8f8",
//     borderRadius: 10,
//     marginBottom: hp(1.5),
//   },
//   image: {
//     width: 60,
//     height: 60,
//     borderRadius: 8,
//     marginRight: hp(1.5),
//   },
//   name: {
//     fontSize: hp(2),
//     fontWeight: "600",
//     color: "#333",
//   },
//   price: {
//     fontSize: hp(1.8),
//     color: "gray",
//   },
//   btn: {
//     backgroundColor: theme.PRIMARY_COLOR,
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//   },
//   btnText: {
//     color: "#fff",
//     fontWeight: "600",
//   },
//   center: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });
// import React, { useEffect, useState, useCallback } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   StyleSheet,
//   Image,
//   Alert,
// } from "react-native";
// import axiosClient from "@/src/assets/api/client";
// import { BASE_URL } from "@/api";
// import { hp } from "@/src/assets/utils/responsive";
// import theme from "@/src/assets/colors/theme";
// import { Ionicons } from "@expo/vector-icons";

// /**
//  * ManageBestSellerScreen
//  *
//  * - Existing best-seller Add/Remove logic preserved.
//  * - NEW: UI-only highlight feature (star) for tea/coffee items.
//  *   - Up to 2 highlights selectable.
//  *   - Toggle on/off by tapping star.
//  *   - Shows selected count in subtitle.
//  */

// const MAX_HIGHLIGHTS = 2;

// const ManageBestSellerScreen = () => {
//   const [menus, setMenus] = useState<any[]>([]);
//   const [bestSellers, setBestSellers] = useState<number[]>([]);
//   const [highlightedIds, setHighlightedIds] = useState<number[]>([]); // allow up to 2
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     try {
//       setLoading(true);

//       const [menuRes, bestRes] = await Promise.all([
//         axiosClient.get(`${BASE_URL}/api/menu/me`),
//         axiosClient.get(`${BASE_URL}/api/best-sellers/me`),
//       ]);

//       setMenus(menuRes.data || []);
//       setBestSellers((bestRes.data || []).map((b: any) => b.menuId));
//       // NOTE: If you persist highlight selection server-side, fetch that here and setHighlightedIds(...)
//     } catch (err: any) {
//       console.log("BestSeller fetch error:", err.response?.data || err.message);
//       Alert.alert("Error loading best sellers");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleBestSeller = async (menuId: number) => {
//     try {
//       if (bestSellers.includes(menuId)) {
//         await axiosClient.delete(`${BASE_URL}/api/best-sellers/${menuId}`);
//       } else {
//         await axiosClient.post(`${BASE_URL}/api/best-sellers`, { menuId });
//       }

//       const bestRes = await axiosClient.get(`${BASE_URL}/api/best-sellers/me`);
//       setBestSellers((bestRes.data || []).map((b: any) => b.menuId));
//     } catch (err: any) {
//       console.log("Toggle error:", err.response?.data || err.message);
//       Alert.alert("Error updating best seller");
//     }
//   };

//   // UI-only highlight toggle (max 2)
//   const toggleHighlight = useCallback(
//     (menuId: number) => {
//       // if already selected -> remove
//       if (highlightedIds.includes(menuId)) {
//         setHighlightedIds((prev) => prev.filter((id) => id !== menuId));
//         // TODO: call backend to remove highlight if persisted: axiosClient.delete(`/api/highlight/${menuId}`)
//         return;
//       }

//       // if not selected and have space -> add
//       if (highlightedIds.length < MAX_HIGHLIGHTS) {
//         setHighlightedIds((prev) => [...prev, menuId]);
//         // TODO: call backend to add highlight if persisted: axiosClient.post('/api/highlight', { menuId })
//         return;
//       }

//       // otherwise show message
//       Alert.alert(
//         `Limit reached`,
//         `You can highlight up to ${MAX_HIGHLIGHTS} items only. Unselect one to add another.`,
//       );
//     },
//     [highlightedIds]
//   );

//   // helper to detect tea/coffee menu (basic string check like you used)
//   const isTeaCoffeeItem = (name?: string) => {
//     if (!name) return false;
//     const n = name.toLowerCase();
//     return n.includes("tea") || n.includes("coffee");
//   };

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color={theme.PRIMARY_COLOR} />
//         <Text>Loading menus...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>🍵 Manage Best Sellers</Text>

//       {/* Subtitle shows how many highlights are selected */}
//       <Text style={styles.subTitle}>
//         ⭐ Highlight up to {MAX_HIGHLIGHTS} Tea / Coffee items — Selected{" "}
//         {highlightedIds.length}/{MAX_HIGHLIGHTS}
//       </Text>

//       <FlatList
//         data={menus}
//         keyExtractor={(item) => item.menuId.toString()}
//         renderItem={({ item }) => {
//           const isBestSeller = bestSellers.includes(item.menuId);
//           const isTeaCoffee = isTeaCoffeeItem(item.menuName);
//           const isHighlighted = highlightedIds.includes(item.menuId);

//           return (
//             <View style={styles.card}>
//               <Image
//                 source={{
//                   uri: item.imageUrl
//                     ? `${BASE_URL}/uploads/menus/${item.imageUrl}`
//                     : "https://via.placeholder.com/80",
//                 }}
//                 style={styles.image}
//               />

//               <View style={{ flex: 1 }}>
//                 <Text style={styles.name}>{item.menuName}</Text>
//                 <Text style={styles.price}>₹ {item.price}</Text>
//               </View>

//               {/* Only show star icon for tea/coffee items */}
//               {isTeaCoffee && (
//                 <TouchableOpacity
//                   onPress={() => toggleHighlight(item.menuId)}
//                   style={styles.starWrapper}
//                   accessibilityRole="button"
//                   accessibilityLabel={
//                     isHighlighted ? "Unhighlight item" : "Highlight item"
//                   }
//                 >
//                   <Ionicons
//                     name={isHighlighted ? "star" : "star-outline"}
//                     size={26}
//                     color={isHighlighted ? "gold" : "#9aa0a6"}
//                   />
//                 </TouchableOpacity>
//               )}

//               <TouchableOpacity
//                 style={[
//                   styles.btn,
//                   isBestSeller ? styles.btnRemove : styles.btnAdd,
//                 ]}
//                 onPress={() => toggleBestSeller(item.menuId)}
//                 accessibilityRole="button"
//                 accessibilityLabel={
//                   isBestSeller ? "Remove from best sellers" : "Add to best sellers"
//                 }
//               >
//                 <Text style={styles.btnText}>
//                   {isBestSeller ? "Remove" : "Add"}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           );
//         }}
//         ListEmptyComponent={
//           <View style={{ padding: 20, alignItems: "center" }}>
//             <Text style={{ color: "#666" }}>No menus available</Text>
//           </View>
//         }
//         contentContainerStyle={{ paddingBottom: hp(6) }}
//       />
//     </View>
//   );
// };

// export default ManageBestSellerScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     padding: hp(2),
//   },
//   title: {
//     fontSize: hp(2.4),
//     fontWeight: "bold",
//     marginBottom: hp(1),
//     color: theme.PRIMARY_COLOR,
//   },
//   subTitle: {
//     fontSize: hp(1.8),
//     fontWeight: "500",
//     marginBottom: hp(1.6),
//     color: "#555",
//   },
//   card: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: hp(1.5),
//     backgroundColor: "#f8f8f8",
//     borderRadius: 10,
//     marginBottom: hp(1.2),
//   },
//   image: {
//     width: 60,
//     height: 60,
//     borderRadius: 8,
//     marginRight: hp(1.5),
//     backgroundColor: "#eee",
//   },
//   name: {
//     fontSize: hp(2),
//     fontWeight: "600",
//     color: "#333",
//   },
//   price: {
//     fontSize: hp(1.8),
//     color: "gray",
//   },
//   starWrapper: {
//     marginRight: 12,
//     padding: 4,
//     borderRadius: 6,
//     // optional touch effect background:
//     // backgroundColor: 'rgba(0,0,0,0.02)'
//   },
//   btn: {
//     paddingVertical: 8,
//     paddingHorizontal: 14,
//     borderRadius: 8,
//   },
//   btnAdd: {
//     backgroundColor: theme.PRIMARY_COLOR,
//   },
//   btnRemove: {
//     backgroundColor: "#d9534f", // red for remove
//   },
//   btnText: {
//     color: "#fff",
//     fontWeight: "600",
//   },
//   center: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });
// ManageBestSellerScreen.js
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import axiosClient from "@/src/assets/api/client";
import { BASE_URL } from "@/api";
import { hp } from "@/src/assets/utils/responsive";
import theme from "@/src/assets/colors/theme";
import { Ionicons } from "@expo/vector-icons";

const MAX_HIGHLIGHTS = 2;

const ManageBestSellerScreen = () => {
  const [menus, setMenus] = useState([]);
  const [bestSellers, setBestSellers] = useState([]); // array of menuId
  const [highlightedIds, setHighlightedIds] = useState([]); // up to 2 selections (UI)
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [menuRes, bestRes] = await Promise.all([
        axiosClient.get(`${BASE_URL}/api/menu/me`),
        axiosClient.get(`${BASE_URL}/api/best-sellers/me`),
      ]);
      setMenus(Array.isArray(menuRes.data) ? menuRes.data : []);
      setBestSellers(Array.isArray(bestRes.data) ? bestRes.data.map((b) => b.menuId) : []);
      // Highlight state is UI-only here. If you saved highlight server-side, fetch it and setHighlightedIds(...)
    } catch (err) {
      console.warn("fetchData error", err?.response?.data || err?.message || err);
      Alert.alert("Error", "Failed to load menus. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // single add/remove legacy endpoints
  const toggleBestSeller = async (menuId) => {
    try {
      setSaving(true);
      if (bestSellers.includes(menuId)) {
        await axiosClient.delete(`${BASE_URL}/api/best-sellers/${menuId}`);
      } else {
        await axiosClient.post(`${BASE_URL}/api/best-sellers`, { menuId });
      }
      // refresh
      const bestRes = await axiosClient.get(`${BASE_URL}/api/best-sellers/me`);
      setBestSellers(Array.isArray(bestRes.data) ? bestRes.data.map((b) => b.menuId) : []);
    } catch (err) {
      console.warn("toggleBestSeller error", err?.response?.data || err?.message || err);
      Alert.alert("Error", "Failed to update best sellers");
    } finally {
      setSaving(false);
    }
  };

  // Save highlighted IDs in bulk (the simple approach you wanted)
  const saveHighlights = async () => {
    if (highlightedIds.length === 0) {
      Alert.alert("No selection", "Select up to 2 tea/coffee items to save.");
      return;
    }

    Alert.alert(
      "Confirm",
      `Apply ${highlightedIds.length} highlighted item(s) as best sellers? This will unset best sellers for other items.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Apply",
          onPress: async () => {
            try {
              setSaving(true);
              const res = await axiosClient.post(`${BASE_URL}/api/best-sellers/bulk`, {
                menuIds: highlightedIds,
              });
              if (res?.data?.success) {
                // refreshed list from response? if response returns bestMenuIds you can use it.
                const bestRes = await axiosClient.get(`${BASE_URL}/api/best-sellers/me`);
                setBestSellers(Array.isArray(bestRes.data) ? bestRes.data.map((b) => b.menuId) : []);
                setHighlightedIds([]); // clear selection after apply
                Alert.alert("Success", "Best sellers updated.");
              } else {
                // fallback refresh
                await fetchData();
                setHighlightedIds([]);
                Alert.alert("Success", "Best sellers updated.");
              }
            } catch (err) {
              console.warn("saveHighlights error", err?.response?.data || err?.message || err);
              Alert.alert("Error", "Failed to apply highlights.");
            } finally {
              setSaving(false);
            }
          },
        },
      ],
    );
  };

  const toggleHighlight = useCallback(
    (menuId) => {
      if (highlightedIds.includes(menuId)) {
        setHighlightedIds((p) => p.filter((id) => id !== menuId));
        return;
      }
      if (highlightedIds.length < MAX_HIGHLIGHTS) {
        setHighlightedIds((p) => [...p, menuId]);
        return;
      }
      Alert.alert("Limit reached", `You can highlight up to ${MAX_HIGHLIGHTS} items.`);
    },
    [highlightedIds],
  );

  const isTeaCoffee = (name) => {
    if (!name) return false;
    const n = name.toLowerCase();
    return n.includes("tea") || n.includes("coffee");
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.PRIMARY_COLOR} />
        <Text>Loading menus...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍵 Manage Best Sellers</Text>
      <Text style={styles.subTitle}>
        ⭐ Select up to {MAX_HIGHLIGHTS} Tea / Coffee items — Selected {highlightedIds.length}/{MAX_HIGHLIGHTS}
      </Text>

      {/* Save Highlights button shows only when selection exists */}
      {highlightedIds.length > 0 && (
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.7 }]}
          onPress={saveHighlights}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>{saving ? "Saving..." : `Save highlights (${highlightedIds.length})`}</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={menus}
        keyExtractor={(item) => String(item.menuId)}
        renderItem={({ item }) => {
          
          const isBest = bestSellers.includes(item.menuId);
          const teaCoffee = isTeaCoffee(item.menuName);
          const highlighted = highlightedIds.includes(item.menuId);
// console.log(highlighted);

          return (
            <View style={styles.card}>
              <Image
                source={{
                  uri: item.imageUrl ? `${BASE_URL}/uploads/menus/${item.imageUrl}` : "https://via.placeholder.com/80",
                }}
                style={styles.image}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.menuName}</Text>
                <Text style={styles.price}>₹ {item.price}</Text>
              </View>

              {teaCoffee && (
                <TouchableOpacity
                  onPress={() => toggleHighlight(item.menuId)}
                  style={styles.starWrapper}
                >
                  <Ionicons name={highlighted ? "star" : "star-outline"} size={26} color={highlighted ? "gold" : "#9aa0a6"} />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => toggleBestSeller(item.menuId)}
                style={[styles.btn, isBest ? styles.btnRemove : styles.btnAdd]}
                disabled={saving}
              >
                <Text style={styles.btnText}>{isBest ? "Remove" : "Add"}</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={<View style={{ padding: 20, alignItems: "center" }}><Text style={{ color: "#666" }}>No menus available</Text></View>}
        contentContainerStyle={{ paddingBottom: hp(6) }}
      />
    </View>
  );
};

export default ManageBestSellerScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: hp(2) },
  title: { fontSize: hp(2.4), fontWeight: "bold", marginBottom: hp(1), color: theme.PRIMARY_COLOR },
  subTitle: { fontSize: hp(1.8), fontWeight: "500", marginBottom: hp(1.6), color: "#555" },
  saveBtn: { backgroundColor: "#4a90e2", paddingVertical: 10, borderRadius: 8, marginBottom: hp(1.2), alignItems: "center" },
  saveBtnText: { color: "#fff", fontWeight: "700" },
  card: { flexDirection: "row", alignItems: "center", padding: hp(1.5), backgroundColor: "#f8f8f8", borderRadius: 10, marginBottom: hp(1.2) },
  image: { width: 60, height: 60, borderRadius: 8, marginRight: hp(1.5), backgroundColor: "#eee" },
  name: { fontSize: hp(2), fontWeight: "600", color: "#333" },
  price: { fontSize: hp(1.8), color: "gray" },
  starWrapper: { marginRight: 12, padding: 4, borderRadius: 6 },
  btn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  btnAdd: { backgroundColor: theme.PRIMARY_COLOR },
  btnRemove: { backgroundColor: "#d9534f" },
  btnText: { color: "#fff", fontWeight: "600" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
