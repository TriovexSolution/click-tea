import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BASE_URL } from "@/api";
import theme from "@/src/assets/colors/theme";
import { hp, wp } from "@/src/assets/utils/responsive";
import { useNavigation } from "@react-navigation/native";
import CommonHeader from "@/src/Common/CommonHeader";
import { timeAgo } from "@/src/assets/utils/timeAgo";

const OrdersScreen = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => { 
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      const res = await axios.get(`${BASE_URL}/api/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data || []);
    } catch (err) {
      console.error("❌ Error fetching orders:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
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

      await axios.put(
        `${BASE_URL}/api/orders/cancel/${orderId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Cancelled", "Order cancelled successfully.");
      fetchMyOrders();
    } catch (err) {
      console.error("Cancel error:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to cancel order.");
    }
  };
  const onRefresh = async () => {
  setRefreshing(true);
  await fetchMyOrders(); // call your existing fetch function
  setRefreshing(false);
};


  const renderOrderCard = (item: any, ongoing = false) => (
    <View
      style={[
        styles.orderCard,
        ongoing && { backgroundColor: "#FFFBF0" },
      ]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.orderId}>#{item.orderId}</Text>
          <Text style={styles.subText}>
            {item.shopname} • {timeAgo(item.created_at)}
          </Text>
        </View>

        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            {item.status === "ongoing" ? "Preparing" : item.status}
          </Text>
        </View>
      </View>

      {/* Items */}
      <View style={{ marginVertical: 6 }}>
        {item.items.map((i: any, idx: number) => (
          <Text key={idx} style={styles.itemText}>
            {i.quantity}x {i.menuName}
          </Text>
        ))}
      </View>

      {/* Amount */}
      <Text style={styles.amountText}>₹{item.totalAmount}</Text>

      {/* Estimated time only for ongoing */}
      {ongoing && (
        <Text style={styles.estimatedText}>Estimated delivery: 15 mins</Text>
      )}

      {/* Buttons */}
      <View style={styles.buttonRow}>
        {ongoing && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => cancelOrder(item.orderId)}
          >
            <Text style={styles.btnText}>Cancel Order</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() =>
            navigation.navigate("orderDetailScreen", { orderId: item.orderId })
          }
        >
          <Text style={styles.btnText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Separate ongoing vs all
  const ongoingOrders = orders.filter((o) => o.status === "ongoing");
  const pastOrders = orders.filter((o) => o.status !== "ongoing");

  return (
    <View style={styles.container}>
      <CommonHeader title={"Order History"} />

      {loading ? (
        <ActivityIndicator
          size="large"
          color={theme.PRIMARY_COLOR}
          style={{ marginTop: hp(10) }}
        />
      ) : orders.length === 0 ? (
        <Text style={styles.noOrderText}>No orders found.</Text>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: hp(10), paddingHorizontal: wp(5) }}
          showsVerticalScrollIndicator={false}
          refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={[theme.PRIMARY_COLOR]} // Android
      tintColor={theme.PRIMARY_COLOR} // iOS
    />
  }
        >
          {/* Ongoing */}
          {ongoingOrders.length > 0 && (
            <View style={{ marginBottom: hp(2) }}>
              <Text style={styles.sectionTitle}>Ongoing</Text>
              {ongoingOrders.map((o, idx) => (
                <View key={idx}>{renderOrderCard(o, true)}</View>
              ))}
            </View>
          )}

          {/* All Orders */}
          <Text style={styles.sectionTitle}>All Orders</Text>
          {pastOrders.length === 0 ? (
            <Text style={styles.noOrderText}>No past orders.</Text>
          ) : (
            pastOrders.map((o, idx) => (
              <View key={idx}>{renderOrderCard(o)}</View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default OrdersScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  sectionTitle: {
    fontSize: hp(2),
    fontWeight: "600",
    color: "#000",
    marginBottom: hp(1),
    marginTop: hp(1),
  },
  orderCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#F2F2F2",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between" },
  orderId: { fontSize: hp(2), fontWeight: "700", color: "#333" },
  subText: { fontSize: hp(1.5), color: "#888", marginTop: 2 },
  statusBadge: {
      minWidth: wp(20),            // fixed width so it looks consistent
    height: hp(3.5),             // fixed height for capsule shape
    borderRadius: 20,
    backgroundColor: "#FFFBF0",
    borderWidth: 1,
    borderColor: "#ECECEC",
    justifyContent: "center",    // center text vertically
    alignItems: "center",        // center text horizontally
    paddingHorizontal: 10,
  },
  statusText: { fontSize: hp(1.5), color: "#444", fontWeight: "500" },
  itemText: { fontSize: hp(1.7), color: "#333", marginBottom: 3 },
  amountText: { fontSize: hp(1.9), fontWeight: "600", marginTop: 4 },
  estimatedText: {
    fontSize: hp(1.4),
    color: "#666",
    marginTop: 6,
    backgroundColor: "rgba(86, 46, 25, 0.07)",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ECECEC",
    marginLeft: 8,
  },
  btnText: { color: "#333", fontWeight: "500", fontSize: hp(1.6) },
  noOrderText: {
    textAlign: "center",
    marginTop: hp(4),
    fontSize: hp(2),
    color: "#999",
  },
});
