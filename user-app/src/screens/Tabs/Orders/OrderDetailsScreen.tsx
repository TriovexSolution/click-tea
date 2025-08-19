// OrderDetailsScreen.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation, useRoute } from "@react-navigation/native";
import { BASE_URL } from "@/api";
import { hp, wp } from "@/src/assets/utils/responsive";
import theme from "@/src/assets/colors/theme";
import CommonHeader from "@/src/Common/CommonHeader";
import { timeAgo } from "@/src/assets/utils/timeAgo";

type RouteParams = {
  orderId?: string | number;
};

const OrderDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = (route.params || {}) as RouteParams;

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Abort controller ref to cancel requests on unmount / re-fetch
  const abortRef = useRef<AbortController | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) {
      setError("Order ID not provided");
      setLoading(false);
      return;
    }

    // cancel any previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);
      setError(null);

      const token = await AsyncStorage.getItem("authToken");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await axios.get(`${BASE_URL}/api/orders/${orderId}`, {
        headers,
        signal: controller.signal,
        timeout: 15000, // small timeout to avoid hanging requests
      });

      // keep original structure assumption (your code used res.data)
      setOrder(res.data);
    } catch (err: any) {
      // if request was aborted, ignore setting error
      if (err?.name === "CanceledError" || axios.isCancel?.(err)) {
        console.log("Order fetch cancelled");
        return;
      }

      console.error("Error fetching order details:", err?.response?.data ?? err);
      setError("Failed to load order details.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();

    return () => {
      // cleanup: cancel pending request when component unmounts
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const renderItemRow = useCallback(
    (itm: any, i: number) => (
      <View key={i} style={styles.itemRow}>
        <Image
          style={styles.itemImagePlaceholder}
          source={{
            uri: `${BASE_URL}/uploads/menus/${itm.imageUrl}`,
          }}
        />
        <View style={styles.itemMeta}>
          <Text style={styles.itemName}>{itm.menuName}</Text>
          <Text style={styles.itemSub}>₹{(itm.price ?? 0).toFixed(2)} each</Text>
        </View>
        <Text style={styles.itemPrice}>₹{(itm.quantity * (itm.price ?? 0)).toFixed(2)}</Text>
      </View>
    ),
    []
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={theme.PRIMARY_COLOR} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <CommonHeader title="Order Details" />
        <View style={{ padding: wp(5) }}>
          <Text style={{ color: "#d00", textAlign: "center" }}>{error}</Text>
        </View>
      </View>
    );
  }

  // fallback shape if API returns different structure
  const items = order?.items ?? [];
  const shop = order?.shopname ?? order?.shop?.name ?? "Shop";
  const status = order?.status ?? "unknown";
  const createdAt = order?.created_at ?? order?.createdAt;
  const totalAmount = order?.totalAmount ?? order?.total_amount ?? 0;
  const originalAmount = order?.originalAmount ?? order?.original_amount ?? totalAmount + (order?.discount ?? 0);

  return (
    <View style={styles.container}>
      <CommonHeader title="Order Details" />

      <ScrollView contentContainerStyle={{ paddingBottom: hp(8) }} showsVerticalScrollIndicator={false}>
        {/* Top summary card */}
        <View style={[styles.card, styles.topCard]}>
          <View style={styles.topHeaderRow}>
            <View>
              <Text style={styles.topOrderId}>#{order?.orderId ?? orderId}</Text>
              <Text style={styles.topShopText}>
                {shop} • {createdAt ? timeAgo(createdAt) : ""}
              </Text>
            </View>

            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {status === "ongoing" ? "Preparing" : status}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>Yesterday, 6:45 </Text>
            <Text style={styles.metaText}>Delivered in 22 minutes</Text>
          </View>
        </View>

        {/* Items Ordered (blue border box) */}
        <View style={[styles.card, styles.itemsCard]}>
          <Text style={styles.sectionTitle}>Items Ordered</Text>

          <View style={styles.itemsBox}>
            {items.length === 0 ? (
              <Text style={{ color: "#666" }}>No items</Text>
            ) : (
              items.map((itm: any, idx: number) => renderItemRow(itm, idx))
            )}
          </View>
        </View>

        {/* To Pay card */}
        <View style={[styles.card, styles.payCard]}>
          <View style={styles.payRow}>
            <View>
              <Text style={styles.smallLabel}>To Pay</Text>
              <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
                <Text style={styles.originalAmount}>₹{originalAmount?.toFixed(2)}</Text>
                <Text style={styles.finalAmount}>  ₹{totalAmount?.toFixed(2)}</Text>
              </View>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.savingText}>Saving { (originalAmount - totalAmount).toFixed(0) }</Text>
            </View>
          </View>
        </View>

        {/* Delivery Details */}
        <View style={[styles.card, styles.infoCard]}>
          <Text style={styles.infoTitle}>Delivery Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Home</Text>
            <Text style={styles.infoValue}>HRS Layout, Bangalore</Text>
          </View>
        </View>

        {/* Payment Details */}
        <View style={[styles.card, styles.infoCard]}>
          <Text style={styles.infoTitle}>Payment Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment Method</Text>
            <Text style={styles.infoValue}>{order?.paymentMethod ?? order?.payment?.method ?? "UPI"}</Text>
          </View>
        </View>

        {/* Spacer */}
        <View style={{ height: hp(4) }} />
      </ScrollView>
    </View>
  );
};

export default OrderDetailsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  card: {
    marginHorizontal: wp(5),
    marginTop: hp(2),
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#F2F2F2",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },

  topCard: {
    backgroundColor: "#FFFBF0",
    borderColor: "#FFF0D6",
  },
  topHeaderRow: { flexDirection: "row", justifyContent: "space-between" },
  topOrderId: { fontSize: hp(2), fontWeight: "700", color: "#333" },
  topShopText: { fontSize: hp(1.4), color: "#888", marginTop: 6 },

  statusBadge: {
    minWidth: wp(22),
    height: hp(3.6),
    borderRadius: 20,
    backgroundColor: "#FFFBF0",
    borderWidth: 1,
    borderColor: "#ECECEC",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  statusText: { fontSize: hp(1.4), color: "#6B6B6B", fontWeight: "500" },

  metaRow: { flexDirection: "row", justifyContent: "flex-start", marginTop: hp(2) },
  metaText: { color: "#777", marginRight: wp(4), fontSize: hp(1.35) },

  sectionTitle: { fontSize: hp(1.6), fontWeight: "600", marginBottom: hp(1.2), color: "#222" },

  itemsCard: {
    paddingBottom: 6,
  },
  itemsBox: {
    borderRadius: 14,
    padding: 10,
    backgroundColor: "#fff",
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1),
    borderBottomWidth: 1,
    borderBottomColor: "#F4F4F4",
  },
  itemImagePlaceholder: {
    width: wp(12),
    height: wp(12),
    borderRadius: 8,
    marginRight: wp(3),
  },
  itemMeta: { flex: 1 },
  itemName: { fontSize: hp(1.7), fontWeight: "600", color: "#222" },
  itemSub: { fontSize: hp(1.3), color: "#999", marginTop: 4 },
  itemPrice: { fontSize: hp(1.6), fontWeight: "600", color: "#222" },

  payCard: {},
  payRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  smallLabel: { fontSize: hp(1.3), color: "#777", marginBottom: 6 },
  originalAmount: { fontSize: hp(1.3), color: "#999", textDecorationLine: "line-through" },
  finalAmount: { fontSize: hp(1.9), fontWeight: "700", color: "#000" },
  savingText: { color: "#13A452", fontWeight: "600" },

  infoCard: {},
  infoTitle: { fontSize: hp(1.4), color: "#666", marginBottom: hp(0.8) },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  infoLabel: { fontSize: hp(1.6), fontWeight: "600", color: "#222" },
  infoValue: { fontSize: hp(1.4), color: "#666" },
});
