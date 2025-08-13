import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BASE_URL } from "@/api";
import theme from "@/src/assets/colors/theme";
import { hp, wp } from "@/src/assets/utils/responsive";
import { timeAgo } from "@/src/assets/utils/timeAgo";

const statusTabs = ["All", "pending", "Completed", "Cancelled"];

const OrdersScreen = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("All");

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const res = await axios.get(`${BASE_URL}/api/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
      setFilteredOrders(res.data);
    } catch (err) {
      console.error("❌ Error fetching orders:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const filterByStatus = (status: string) => {
    setSelectedStatus(status);
    if (status === "All") return setFilteredOrders(orders);
    setFilteredOrders(
      orders.filter(
        (o) => o.status.toLowerCase() === status.toLowerCase()
      )
    );
  };

  const cancelOrder = async (orderId: number) => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      const confirm = await new Promise((resolve) => {
        Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
          { text: "No", style: "cancel", onPress: () => resolve(false) },
          { text: "Yes", onPress: () => resolve(true) },
        ]);
      });

      if (!confirm) return;

      const res = await axios.put(
        `${BASE_URL}/api/orders/cancel/${orderId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const msg = res.data?.message || "Order cancelled.";
      Alert.alert(
        "Cancelled",
        `${msg}\n\nIf payment was made via ClickTea Coins, refund has been credited to your wallet.`
      );

      fetchMyOrders();
    } catch (err) {
      console.error("Cancel error:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to cancel order.");
    }
  };

  const reorder = async (order: any) => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      const cartItems = order.items.map((item: any) => ({
        menuId: item.menuId,
        quantity: item.quantity,
        addons: [],
        notes: "",
        shopId: order.shopId,
      }));

      await axios.post(
        `${BASE_URL}/api/cart/reorder`,
        { cartItems },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Success", "Items added to cart!");
    } catch (err) {
      console.error("Reorder error:", err.response?.data || err.message);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.orderCard}>
      <View style={styles.headerRow}>
        <Text style={styles.shopName}>{item.shop_name}</Text>
        <Text style={[styles.status, { textTransform: "capitalize" }]}>
          {item.status}
        </Text>
      </View>

      <View style={styles.itemRow}>
        <Image
          source={
            item.items[0]?.imageUrl
              ? { uri: `${BASE_URL}/uploads/menus/${item.items[0]?.imageUrl}` }
              : require("../../../assets/images/FirstLogo.jpg") // Optional fallback image
          }
          style={styles.image}
        />
        <View style={styles.itemInfo}>
          <Text style={styles.itemCount}>{item.itemCount} item(s)</Text>
          <Text style={styles.dateText}>
            ₹{item.totalAmount} • {timeAgo(item.created_at)}
          </Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        {item.status.toLowerCase() === "pending" && (
          <TouchableOpacity onPress={() => cancelOrder(item.orderId)}>
            <Text style={styles.cancelBtn}>Cancel</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => reorder(item)}>
          <Text style={styles.reorderBtn}>Reorder</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Orders</Text>

      <View style={styles.tabContainer}>
        {statusTabs.map((status) => (
          <TouchableOpacity
            key={status}
            onPress={() => filterByStatus(status)}
            style={[
              styles.tab,
              selectedStatus === status && styles.activeTab,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                selectedStatus === status && styles.activeTabText,
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.PRIMARY_COLOR} />
      ) : filteredOrders.length === 0 ? (
        <Text style={styles.noOrderText}>No orders found.</Text>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderItem}
          keyExtractor={(item) => item.orderId.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
};

export default OrdersScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  title: {
    fontSize: hp(2.6),
    fontWeight: "bold",
    marginBottom: 10,
    color: theme.PRIMARY_COLOR,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  activeTab: {
    backgroundColor: theme.PRIMARY_COLOR,
    borderColor: theme.PRIMARY_COLOR,
  },
  tabText: {
    fontSize: hp(1.7),
    color: "#555",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "600",
  },
  orderCard: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  shopName: {
    fontWeight: "bold",
    fontSize: hp(2.2),
    color: theme.PRIMARY_COLOR,
  },
  status: {
    fontSize: hp(1.7),
    color: "#888",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  image: {
    width: wp(18),
    height: wp(18),
    borderRadius: 10,
    marginRight: 10,
  },
  itemInfo: { flex: 1 },
  itemCount: {
    fontSize: hp(1.9),
    fontWeight: "500",
  },
  dateText: {
    fontSize: hp(1.6),
    color: "#777",
    marginTop: 2,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    color: "red",
    fontWeight: "600",
    fontSize: hp(1.7),
  },
  reorderBtn: {
    color: theme.PRIMARY_COLOR,
    fontWeight: "600",
    fontSize: hp(1.7),
  },
  noOrderText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: hp(2),
    color: "#999",
  },
});
