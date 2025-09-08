import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  SectionList,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BASE_URL } from "@/api";
import theme from "@/src/assets/colors/theme";
import { hp, wp } from "@/src/assets/utils/responsive";
import { useNavigation } from "@react-navigation/native";
import CommonHeader from "@/src/Common/CommonHeader";
import { timeAgo } from "@/src/assets/utils/timeAgo";
import axiosClient from "@/src/api/client";
import { LinearGradient } from "expo-linear-gradient";

/**
 * Helper: normalize status values from server.
 * If server returns empty string / null, fallback to 'preparing'.
 */
const normalizeStatus = (s) => {
  const st = (s ?? "").toString().trim();
  return st || "preparing";
};

/**
 * Display-friendly label (capitalize first letter)
 */
const labelize = (s) => {
  if (!s) return "";
  const t = s.toString();
  return t.charAt(0).toUpperCase() + t.slice(1);
};

/**
 * OrderCard (memoized)
 * Props: item, ongoing (boolean), onCancel (fn), onView(fn)
 */
const OrderCard = React.memo(({ item, ongoing, onCancel, onView }) => {
  const status = normalizeStatus(item.status);
  const statusColor =
    status === "delivered"
      ? "#E6FBE7"
      : status === "cancelled"
      ? "#FFECEC"
      : "#FFFBF0";

  return (
    <View style={[styles.orderCard, { backgroundColor: ongoing ? statusColor : "#fff" }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.orderId}>#{item.orderId}</Text>
          <Text style={styles.subText}>
            {item.shopname} • {timeAgo(item.created_at)}
          </Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{labelize(status)}</Text>
        </View>
      </View>

      {/* Items (safe) */}
      <View style={{ marginVertical: hp(0.5) }}>
        {Array.isArray(item.items) && item.items.length > 0 ? (
          item.items.map((i, idx) => (
            <Text key={idx} style={styles.itemText}>
              {i.quantity}x {i.menuName}
            </Text>
          ))
        ) : (
          <Text style={styles.itemText}>No items</Text>
        )}
      </View>

      {/* Amount */}
      <Text style={styles.amountText}>₹{item.totalAmount}</Text>

      {/* Estimated time only for ongoing */}
      {ongoing && <Text style={styles.estimatedText}>Estimated delivery: 15 mins</Text>}

      {/* Buttons */}
      <View style={styles.buttonRow}>
        {ongoing && (
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: "#F66" }]}
            onPress={() => onCancel(item.orderId)}
          >
            <Text style={[styles.btnText, { color: "#F33" }]}>Cancel</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onView(item.orderId)}
        >
          <Text style={styles.btnText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const OrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      const res = await axiosClient.get(`${BASE_URL}/api/orders/my-orders`, {
        // headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ Error fetching orders:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  }, []);

const cancelOrder = async (orderId: number) => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    const confirm = await new Promise((resolve) => {
      Alert.alert(
        "Cancel Order",
        "Are you sure you want to cancel this order?",
        [
          { text: "No", style: "cancel", onPress: () => resolve(false) },
          { text: "Yes", onPress: () => resolve(true) },
        ]
      );
    });

    if (!confirm) return;

    const res = await axiosClient.put(
      `${BASE_URL}/api/orders/cancel/${orderId}`,
      {},
      // { headers: { Authorization: `Bearer ${token}` } }
    );

    // Server returns { message, refunded, refundAmount, newCoinBalance }
    const data = res.data || {};
    if (data.refunded) {
      // Show informative alert with action to view Wallet
      Alert.alert(
        "Order Cancelled",
        `₹${Number(data.refundAmount).toFixed(2)} has been credited to your ClickTea Coins. You can use these coins to purchase anything in the app.`,
        [
          { text: "OK", style: "default", onPress: () => fetchMyOrders() },
          { text: "Open Wallet", onPress: () => navigation.navigate("coinWalletScreen") },
        ]
      );
    } else {
      Alert.alert("Cancelled", data.message || "Order cancelled successfully.");
      // refresh list
      fetchMyOrders();
    }
  } catch (err: any) {
    console.error("Cancel error:", err.response?.data || err.message);
    const msg = err.response?.data?.message || "Failed to cancel order.";
    Alert.alert("Error", msg);
  }
};


  // navigation to details
  const goToDetails = useCallback(
    (orderId) => navigation.navigate("orderDetailScreen", { orderId }),
    [navigation]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMyOrders();
    setRefreshing(false);
  }, [fetchMyOrders]);

  // Derive ongoing (preparing) and past orders, memoized
  const sections = useMemo(() => {
    const normalized = orders.map((o) => ({ ...o, _status: normalizeStatus(o.status) }));
    const ongoing = normalized.filter((o) => o._status === "preparing");
    const past = normalized.filter((o) => o._status !== "preparing");
    const sec = [];
    if (ongoing.length) sec.push({ title: "Ongoing", data: ongoing });
    if (past.length) sec.push({ title: "All Orders", data: past });
    return sec;
  }, [orders]);

  return (
    <View style={styles.container}>
      <CommonHeader title="Order History" />
{/* <LinearGradient colors={['#79e3fe', '#635df8', '#42385D']} // Define your gradient colors 
style={{ height: StatusBar.currentHeight }} // Adjust height to match status bar 
start={{ x: 0, y: 0 }} // Optional: define start point of the gradient
 end={{ x: 1, y: 0 }} // Optional: define end point of the gradient 
 >
  <StatusBar translucent={true} backgroundColor={'transparent'} barStyle="light-content" />
</LinearGradient> */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color={theme.PRIMARY_COLOR}
          style={{ marginTop: hp(10) }}
        />
      ) : orders.length === 0 ? (
        <Text style={styles.noOrderText}>No orders found.</Text>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => `${item.orderId}`}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionTitle}>{title}</Text>
          )}
          renderItem={({ item }) => (
            <OrderCard
              item={item}
              ongoing={item._status === "preparing"}
              onCancel={cancelOrder}
              onView={goToDetails}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: wp(5), paddingBottom: hp(10) }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.PRIMARY_COLOR]}
              tintColor={theme.PRIMARY_COLOR}
            />
          }
          ListEmptyComponent={<Text style={styles.noOrderText}>No orders found.</Text>}
        />
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
    marginTop: hp(1.5),
  },
  orderCard: {
    borderRadius: 12,
    padding: wp(4),
    marginBottom: hp(1.5),
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#F2F2F2",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  orderId: { fontSize: hp(2), fontWeight: "700", color: "#333" },
  subText: { fontSize: hp(1.5), color: "#888", marginTop: hp(0.3) },
  statusBadge: {
    minWidth: wp(20),
    height: hp(3.5),
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ECECEC",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(2),
  },
  statusText: { fontSize: hp(1.5), color: "#444", fontWeight: "500" },
  itemText: { fontSize: hp(1.7), color: "#333", marginBottom: hp(0.4) },
  amountText: { fontSize: hp(1.9), fontWeight: "600", marginTop: hp(0.5) },
  estimatedText: {
    fontSize: hp(1.4),
    color: "#666",
    marginTop: hp(0.8),
    backgroundColor: "rgba(86, 46, 25, 0.07)",
    paddingVertical: hp(0.3),
    paddingHorizontal: wp(2),
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: hp(1.2),
  },
  actionBtn: {
    paddingVertical: hp(0.6),
    paddingHorizontal: wp(3),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ECECEC",
    marginLeft: wp(2),
  },
  btnText: { color: "#333", fontWeight: "500", fontSize: hp(1.6) },
  noOrderText: {
    textAlign: "center",
    marginTop: hp(4),
    fontSize: hp(2),
    color: "#999",
  },
});
