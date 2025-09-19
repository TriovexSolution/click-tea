import React, { useCallback, useEffect, useRef, useState, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  RefreshControl,
  StatusBar,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { hp, wp } from "@/src/assets/utils/responsive";
import theme from "@/src/assets/colors/theme";
import CommonHeader from "@/src/Common/CommonHeader";
import { timeAgo } from "@/src/assets/utils/timeAgo";
import axiosClient from "@/src/api/client";
import { BASE_URL } from "@/api";
import { SafeAreaView } from "react-native-safe-area-context";

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
// near top imports add useState if not already imported:
// import React, { useCallback, useEffect, useRef, useState, memo } from "react";

const ItemRow = memo(({ item }: { item: any }) => {
  const [imgFailed, setImgFailed] = useState(false);

  const imageSource =
    !imgFailed && item?.imageUrl
      ? { uri: `${BASE_URL}/uploads/menus/${item.imageUrl}` }
      : require("@/src/assets/images/onBoard1.png");

  const unitPrice = Number(item?.price ?? 0);
  const qty = Number(item?.quantity ?? 0);
  const subtotal = unitPrice * qty;

  return (
    <View style={styles.itemRow}>
      <Image
        style={styles.itemImage}
        source={imageSource}
        onError={() => setImgFailed(true)}
        accessibilityLabel={item?.menuName ?? "item image"}
      />

      <View style={styles.itemMeta}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item?.menuName ?? "Unknown Item"}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.unitPrice}>₹{unitPrice.toFixed(2)}</Text>

          {/* qty badge near unit price */}
          <View style={styles.qtyBadge} accessibilityRole="text" accessibilityLabel={`Quantity ${qty}`}>
            <Text style={styles.qtyBadgeText}>×{qty}</Text>
          </View>

          {/* optional small separator + per-item descriptor */}
          <Text style={styles.itemSub}> each</Text>
        </View>
      </View>

      <Text style={styles.itemPrice}>₹{subtotal.toFixed(2)}</Text>
    </View>
  );
});


// =======================
// Main Screen
// =======================
const OrderDetailsScreen = () => {
  const { orderId } = (useRoute().params || {}) as { orderId?: number };

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  // Fetch order details
  const fetchOrder = useCallback(
    async (isRefresh = false) => {
      if (!orderId) {
        setError("Order ID not provided");
        setLoading(false);
        return;
      }

      if (!isRefresh) setLoading(true);
      else setRefreshing(true);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await axiosClient.get(`/api/orders/${orderId}`, {
          signal: controller.signal,
          timeout: 10000,
        });
// console.log(res.data);

        setOrder(res.data ?? {});
        setError(null);
      } catch (err: any) {
        if (err?.name === "CanceledError") return;
        console.error("❌ Fetch error:", err?.response?.data ?? err);
        setError("Failed to load order details.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [orderId]
  );

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
        <StatusBar
          barStyle="dark-content" // or "light-content" depending on your background
          backgroundColor="#F6F4F1" // same as your screen background
          translucent={false} // false ensures the content is below status bar
        />
        <CommonHeader title="Order Details" />
        <View style={[styles.center, { flex: 1 }]}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.retry} onPress={() => fetchOrder()}>
            Tap to retry
          </Text>
        </View>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <CommonHeader title="Order Details" />
        <View style={[styles.center, { flex: 1 }]}>
          <Text style={styles.errorText}>No order details available.</Text>
        </View>
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
    <SafeAreaView style={styles.container}>
      <CommonHeader title="Order Details" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: hp(6) }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchOrder(true)}
            colors={[theme.PRIMARY_COLOR]}
          />
        }
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
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Items Ordered</Text>
          <FlatList
            data={items}
            keyExtractor={(item, i) =>
              `${item?.menuId || item?.id || "itm"}-${i}`
            }
            renderItem={({ item }) => <ItemRow item={item} />}
            scrollEnabled={false}
            removeClippedSubviews
            initialNumToRender={6}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        </View>

        {/* Payment Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>To Pay</Text>
          <View style={styles.payRow}>
            <View>
              {originalAmount > totalAmount && (
                <Text style={styles.strikeAmount}>
                  ₹{originalAmount.toFixed(2)}
                </Text>
              )}
              <Text style={styles.finalAmount}>₹{totalAmount.toFixed(2)}</Text>
            </View>
            {originalAmount > totalAmount && (
              <Text style={styles.savingText}>
                Saved ₹{(originalAmount - totalAmount).toFixed(0)}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    marginTop: hp(2),
    color: "#d00",
    fontSize: hp(1.7),
  },
  retry: {
    marginTop: hp(1),
    color: theme.PRIMARY_COLOR,
    fontSize: hp(1.6),
    fontWeight: "600",
  },
// inside StyleSheet.create({...})
priceRow: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: hp(0.4),
},

unitPrice: {
  fontSize: hp(1.3),
  fontWeight: "600",
  color: "#222",
},

qtyBadge: {
  marginLeft: wp(2),
  backgroundColor: "#F4F4F6",
  borderRadius: 8,
  paddingHorizontal: wp(2),
  paddingVertical: hp(0.25),
  justifyContent: "center",
  alignItems: "center",
},

qtyBadgeText: {
  fontSize: hp(1.2),
  color: "#333",
  fontWeight: "600",
},

// small descriptor text like 'each'
itemSub: {
  fontSize: hp(1.2),
  color: "#999",
  marginLeft: wp(2),
},

// optionally adjust itemImage if needed
itemImage: {
  width: wp(12),
  height: wp(12),
  borderRadius: 8,
  marginRight: wp(3),
  backgroundColor: "#f6f6f6",
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
    backgroundColor: "#FFF5D1",
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
