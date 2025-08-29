// OrderDetailsScreen.tsx
import React, { useCallback, useEffect, useRef, useState, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRoute } from "@react-navigation/native";
import { BASE_URL } from "@/api";
import { hp, wp } from "@/src/assets/utils/responsive";
import theme from "@/src/assets/colors/theme";
import CommonHeader from "@/src/Common/CommonHeader";
import { timeAgo } from "@/src/assets/utils/timeAgo";

// =======================
// Helpers
// =======================
const getStatusLabel = (status: string) => {
  switch (status) {
    case "ongoing":
      return "Preparing";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
    default:
      return status || "Unknown";
  }
};

// =======================
// Subcomponents
// =======================
const ItemRow = memo(({ item }: { item: any }) => (
  <View style={styles.itemRow}>
    <Image
      style={styles.itemImage}
      source={{ uri: `${BASE_URL}/uploads/menus/${item?.imageUrl}` }}
    />
    <View style={styles.itemMeta}>
      <Text style={styles.itemName}>{item?.menuName ?? "Unknown Item"}</Text>
      <Text style={styles.itemSub}>₹{(item?.price ?? 0).toFixed(2)} each</Text>
    </View>
    <Text style={styles.itemPrice}>
      ₹{((item?.quantity ?? 0) * (item?.price ?? 0)).toFixed(2)}
    </Text>
  </View>
));

// =======================
// Main Screen
// =======================
const OrderDetailsScreen = () => {
  const { orderId } = (useRoute().params || {}) as { orderId?: number };

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) {
      setError("Order ID not provided");
      setLoading(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");

      const res = await axios.get(`${BASE_URL}/api/orders/${orderId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal: controller.signal,
        timeout: 15000,
      });

      setOrder(res.data ?? {});
    } catch (err: any) {
      if (err?.name === "CanceledError" || axios.isCancel?.(err)) return;
      console.error("❌ Fetch error:", err?.response?.data ?? err);
      setError("Failed to load order details.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
    return () => abortRef.current?.abort();
  }, [fetchOrder]);

  // =======================
  // UI States
  // =======================
  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={theme.PRIMARY_COLOR} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <CommonHeader title="Order Details" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // =======================
  // Extract Order Data
  // =======================
  const items = order?.items ?? [];
  const shop = order?.shopname ?? order?.shop?.name ?? "Shop";
  const status = getStatusLabel(order?.status);
  const createdAt = order?.created_at ?? order?.createdAt;
  const totalAmount = order?.totalAmount ?? order?.total_amount ?? 0;
  const originalAmount =
    order?.originalAmount ?? order?.original_amount ?? totalAmount;

  // =======================
  // Render
  // =======================
  return (
    <View style={styles.container}>
      <CommonHeader title="Order Details" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: hp(6) }}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Card */}
        <View style={[styles.card, styles.summaryCard]}>
          <View style={styles.topRow}>
            <View>
              <Text style={styles.orderId}>#{order?.orderId ?? orderId}</Text>
              <Text style={styles.subText}>
                {shop} • {createdAt ? timeAgo(createdAt) : ""}
              </Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{status}</Text>
            </View>
          </View>
        </View>

        {/* Items Ordered */}
        <View style={[styles.card]}>
          <Text style={styles.sectionTitle}>Items Ordered</Text>
          <FlatList
            data={items}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => <ItemRow item={item} />}
            scrollEnabled={false}
          />
        </View>

        {/* Payment Card */}
        <View style={[styles.card]}>
          <Text style={styles.sectionTitle}>To Pay</Text>
          <View style={styles.payRow}>
            <View>
              <Text style={styles.strikeAmount}>
                ₹{originalAmount.toFixed(2)}
              </Text>
              <Text style={styles.finalAmount}>
                ₹{totalAmount.toFixed(2)}
              </Text>
            </View>
            {originalAmount > totalAmount && (
              <Text style={styles.savingText}>
                Saved ₹{(originalAmount - totalAmount).toFixed(0)}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default OrderDetailsScreen;

// =======================
// Styles
// =======================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { justifyContent: "center", alignItems: "center" },
  errorText: {
    textAlign: "center",
    marginTop: hp(4),
    color: "#d00",
    fontSize: hp(1.7),
  },

  card: {
    marginHorizontal: wp(5),
    marginTop: hp(2),
    borderRadius: 12,
    padding: wp(4),
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#F2F2F2",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },

  summaryCard: { backgroundColor: "#FFFBF0" },
  topRow: { flexDirection: "row", justifyContent: "space-between" },
  orderId: { fontSize: hp(2), fontWeight: "700", color: "#333" },
  subText: { fontSize: hp(1.4), color: "#777", marginTop: 4 },

  statusBadge: {
    minWidth: wp(20),
    height: hp(3.4),
    borderRadius: 20,
    backgroundColor: "#FFFBF0",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(3),
  },
  statusText: { fontSize: hp(1.4), color: "#6B6B6B", fontWeight: "500" },

  sectionTitle: { fontSize: hp(1.6), fontWeight: "600", marginBottom: hp(1) },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1),
    borderBottomWidth: 1,
    borderBottomColor: "#F4F4F4",
  },
  itemImage: {
    width: wp(12),
    height: wp(12),
    borderRadius: 8,
    marginRight: wp(3),
  },
  itemMeta: { flex: 1 },
  itemName: { fontSize: hp(1.6), fontWeight: "600", color: "#222" },
  itemSub: { fontSize: hp(1.3), color: "#999", marginTop: 2 },
  itemPrice: { fontSize: hp(1.5), fontWeight: "600", color: "#222" },

  payRow: { flexDirection: "row", justifyContent: "space-between" },
  strikeAmount: {
    fontSize: hp(1.3),
    color: "#999",
    textDecorationLine: "line-through",
  },
  finalAmount: { fontSize: hp(1.8), fontWeight: "700", color: "#000" },
  savingText: { color: "#13A452", fontWeight: "600", fontSize: hp(1.4) },
});
