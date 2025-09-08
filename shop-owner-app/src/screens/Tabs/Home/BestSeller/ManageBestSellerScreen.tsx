import React, { useEffect, useState } from "react";
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

const ManageBestSellerScreen = () => {
  const [menus, setMenus] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

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

      setMenus(menuRes.data);
      setBestSellers(bestRes.data.map((b: any) => b.menuId)); // now consistent with backend
    } catch (err: any) {
      console.log("BestSeller fetch error:", err.response?.data || err.message);
      Alert.alert("Error loading best sellers");
    } finally {
      setLoading(false);
    }
  };
const toggleBestSeller = async (menuId: number) => {
  try {
    if (bestSellers.includes(menuId)) {
      // remove
      await axiosClient.delete(`${BASE_URL}/api/best-sellers/${menuId}`);
    } else {
      // add
      await axiosClient.post(`${BASE_URL}/api/best-sellers`, { menuId });
    }

    // 🔑 Always refresh from backend after update
    const bestRes = await axiosClient.get(`${BASE_URL}/api/best-sellers/me`);
    setBestSellers(bestRes.data.map((b: any) => b.menuId));

  } catch (err: any) {
    console.log("Toggle error:", err.response?.data || err.message);  
    Alert.alert("Error updating best seller");
  }
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

      <FlatList
        data={menus}
        keyExtractor={(item) => item.menuId.toString()}
        renderItem={({ item }) => {
          const isBestSeller = bestSellers.includes(item.menuId);

          return (
            <View style={styles.card}>
              <Image
                source={{
                  uri: item.imageUrl
                    ? `${BASE_URL}/uploads/menus/${item.imageUrl}`
                    : "https://via.placeholder.com/80",
                }}
                style={styles.image}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.menuName}</Text>
                <Text style={styles.price}>₹ {item.price}</Text>
              </View>
              <TouchableOpacity
                style={[styles.btn, isBestSeller && { backgroundColor: "red" }]}
                onPress={() => toggleBestSeller(item.menuId)}
              >
                <Text style={styles.btnText}>
                  {isBestSeller ? "Remove" : "Add"}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
};

export default ManageBestSellerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: hp(2),
  },
  title: {
    fontSize: hp(2.4),
    fontWeight: "bold",
    marginBottom: hp(2),
    color: theme.PRIMARY_COLOR,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: hp(1.5),
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    marginBottom: hp(1.5),
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: hp(1.5),
  },
  name: {
    fontSize: hp(2),
    fontWeight: "600",
    color: "#333",
  },
  price: {
    fontSize: hp(1.8),
    color: "gray",
  },
  btn: {
    backgroundColor: theme.PRIMARY_COLOR,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
