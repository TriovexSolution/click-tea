import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StatusBar,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import axiosClient from "@/src/api/client";
import { BASE_URL } from "@/api";
import theme from "@/src/assets/colors/theme";
import { hp, wp } from "@/src/assets/utils/responsive";
import CommonHeader from "@/src/Common/CommonHeader";
import { useRoute, useNavigation } from "@react-navigation/native";
import { timeAgo } from "@/src/assets/utils/timeAgo";

type OrderItem = {
  menuId?: number;
  menuName?: string;
  quantity?: number;
  unitPrice?: number;
  subtotal?: number;
};

type OrderRow = {
  orderId: number;
  totalAmount: number;
  created_at: string;
  status?: string;
  items?: OrderItem[];
};

const OrderMini = React.memo(({ order }: { order: OrderRow }) => {
  return (
    <View style={styles.orderBox}>
      <View style={styles.orderHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.orderId}>#{order.orderId}</Text>
          <Text style={styles.orderDate}>{timeAgo(order.created_at)}</Text>
        </View>
        <Text style={styles.orderAmount}>₹{Number(order.totalAmount || 0).toFixed(2)}</Text>
      </View>

      <View style={{ marginTop: hp(0.8) }}>
        {order.items?.length ? (
          order.items.map((it: any, i: number) => (
            <Text key={i} style={styles.itemText}>
              {it.quantity}x {it.menuName}{" "}
              <Text style={{ color: "#666" }}>• ₹{Number(it.subtotal ?? it.price ?? 0).toFixed(2)}</Text>
            </Text>
          ))
        ) : (
          <Text style={styles.itemText}>No items</Text>
        )}
      </View>
    </View>
  );
});

const SinglePayLaterScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { payLaterId, shopId, shopname } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ orders?: OrderRow[]; total_amount?: number } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchSingle = useCallback(async () => {
    if (!payLaterId || !shopId) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      const res = await axiosClient.get(
        `${BASE_URL}/api/orders/my-pay-later/${payLaterId}/shop/${shopId}`,
        { signal: controller.signal, timeout: 15000 }
      );
      setData(res.data);
    } catch (err: any) {
      console.error("fetchSinglePayLater error:", err?.response?.data || err);
      // optional: show friendly message
    } finally {
      setLoading(false);
    }
  }, [payLaterId, shopId]);

  useEffect(() => {
    fetchSingle();
    return () => abortRef.current?.abort();
  }, [fetchSingle]);

  const totalPending = useMemo(() => {
    if (!data) return 0;
    // prefer server total_amount if provided
    if (data.total_amount !== undefined && data.total_amount !== null) return Number(data.total_amount);
    return Number((data.orders || []).reduce((acc: number, o: any) => acc + Number(o.totalAmount || 0), 0).toFixed(2));
  }, [data]);

  const proceedToPayment = useCallback(async () => {
    if (!payLaterId || !shopId) return;
    if (totalPending <= 0) {
      Alert.alert("Nothing to pay", "Total pending is ₹0.");
      return;
    }

    Alert.alert(
      "Proceed to Payment",
      `Pay ₹${totalPending.toFixed(2)} for ${shopname || "this shop"}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Proceed",
          onPress: async () => {
            setLoading(true);
            try {
              const token = await AsyncStorage.getItem("authToken");
              // This endpoint should: insert pay_later_payments row, mark related orders as is_paid=1, and mark pay_later row as paid if all settled.
              const res = await axiosClient.post(
                `${BASE_URL}/api/orders/pay-later/settle`,
                { payLaterId, shopId, amount: totalPending },
                { timeout: 20000 }
              );
              Alert.alert("Success", res?.data?.message || "Payment recorded.");
              // after success, navigate back (or refresh upstream lists)
              navigation.goBack();
            } catch (err: any) {
              console.error("settle error:", err?.response?.data || err);
              Alert.alert("Payment failed", (err?.response?.data?.message) || "Try again.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }, [payLaterId, shopId, totalPending, shopname, navigation]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <CommonHeader title={shopname || "Pay Later"} onBack={() => navigation.goBack()} />

      {loading ? (
        <ActivityIndicator size="large" color={theme.PRIMARY_COLOR} style={{ marginTop: hp(10) }} />
      ) : !data ? (
        <Text style={styles.empty}>No data</Text>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Payment Summary</Text>
            <Text style={styles.summaryAmount}>₹{Number(data.total_amount ?? totalPending).toFixed(2)}</Text>
            <Text style={styles.summarySub}>{(data.orders?.length || 0) + " Order Pending"}</Text>
          </View>

          <Text style={styles.sectionTitle}>Pending Orders</Text>

          <FlatList
            data={data.orders || []}
            keyExtractor={(it: any) => `${it.orderId}`}
            renderItem={({ item }) => <OrderMini order={item} />}
            contentContainerStyle={{ paddingHorizontal: wp(5), paddingBottom: hp(14) }}
            ListEmptyComponent={<Text style={styles.empty}>No pending orders</Text>}
          />

          {/* Sticky footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Total: ₹{totalPending.toFixed(2)}</Text>
            <TouchableOpacity style={styles.payBtn} onPress={proceedToPayment} disabled={loading || totalPending <= 0}>
              <Text style={styles.payBtnText}>Proceed to Payment • ₹{totalPending.toFixed(2)}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default SinglePayLaterScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  summaryCard: {
    margin: wp(5),
    borderRadius: 12,
    padding: wp(4),
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#F2F2F2",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  summaryTitle: { fontSize: hp(1.6), color: "#666" },
  summaryAmount: { fontSize: hp(2.1), fontWeight: "700", marginTop: hp(0.5) },
  summarySub: { marginTop: hp(0.5), color: "#999", fontSize: hp(1.4) },
  sectionTitle: {
    paddingHorizontal: wp(5),
    fontSize: hp(1.9),
    fontWeight: "700",
    color: "#222",
    marginTop: hp(1),
    marginBottom: hp(0.5),
  },
  orderBox: {
    borderRadius: 12,
    padding: wp(4),
    marginBottom: hp(1.2),
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#F2F2F2",
  },
  orderHeader: { flexDirection: "row", alignItems: "center" },
  orderId: { fontSize: hp(1.8), fontWeight: "700", color: "#333" },
  orderDate: { color: "#999", fontSize: hp(1.3), marginTop: hp(0.2) },
  orderAmount: { fontWeight: "700", fontSize: hp(1.6), color: "#333" },
  itemText: { color: "#444", marginTop: hp(0.4), fontSize: hp(1.5) },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: wp(4),
    borderTopWidth: 1,
    borderColor: "#EEE",
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerText: { fontSize: hp(1.7), fontWeight: "700", color: "#222" },
  payBtn: {
    backgroundColor: "#5A2E1A",
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(4),
    borderRadius: 8,
    minWidth: wp(50),
    alignItems: "center",
  },
  payBtnText: { color: "#fff", fontWeight: "700", fontSize: hp(1.6) },
  empty: { textAlign: "center", marginTop: hp(6), color: "#999", fontSize: hp(2) },
});
