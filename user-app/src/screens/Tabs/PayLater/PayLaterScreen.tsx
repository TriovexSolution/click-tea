import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  TextInput,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import axiosClient from "@/src/api/client";
import { BASE_URL } from "@/api";
import theme from "@/src/assets/colors/theme";
import { hp, wp } from "@/src/assets/utils/responsive";
import CommonHeader from "@/src/Common/CommonHeader";
import { useNavigation } from "@react-navigation/native";

type ShopRow = {
  shopId: number;
  shopname?: string;
  shopImage?: string | null;
  phone?: string;
  pendingOrders?: number;
  amount?: number;
};

const ShopCard = React.memo(({ item, onPress }: any) => {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)}>
      <View style={{ flex: 1 }}>
        <Text style={styles.shopName}>{item.shopname || "Shop"}</Text>
        <Text style={styles.subText}>{item.phone || ""}</Text>
        <Text style={styles.smallText}>{(item.pendingOrders ?? 0) + " order pending"}</Text>
      </View>

      <View style={styles.rightCol}>
        <Text style={styles.amount}>₹{Number(item.amount || 0).toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
});

const PayLaterScreen = () => {
  const [rows, setRows] = useState<ShopRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const navigation = useNavigation();
  const abortRef = useRef<AbortController | null>(null);

  const fetchPayLater = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      const res = await axiosClient.get(`/api/orders/my-pay-later`, {
        // headers if needed
        signal: controller.signal,
        timeout: 15000,
      });
      // res.data expected to be array of pay_later objects each with shops array
      // Flatten: we show per-shop rows (latest payLater first)
      const out: ShopRow[] = [];
      if (Array.isArray(res.data)) {
        for (const p of res.data) {
          if (Array.isArray(p.shops)) {
            for (const s of p.shops) {
              out.push({
                shopId: s.shopId,
                shopname: s.shopname,
                shopImage: s.shopImage,
                phone: s.phone || s.phone || "",
                pendingOrders: Number(s.pendingOrders || 0),
                amount: Number(s.amount || 0),
                payLaterId: p.payLaterId, // keep for navigation
              } as any);
            }
          }
        }
      }
      setRows(out);
    } catch (err: any) {
      console.error("fetchPayLater error:", err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayLater();
    return () => abortRef.current?.abort();
  }, [fetchPayLater]);

  const filtered = useMemo(() => {
    if (!q) return rows;
    const lq = q.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (r.shopname || "").toLowerCase().includes(lq) ||
        (r.phone || "").toLowerCase().includes(lq)
    );
  }, [rows, q]);

  const openSingle = (row: any) => {
    // navigate to single pay later; we need payLaterId and shopId
    const payLaterId = row.payLaterId;
    navigation.navigate("singlePayLaterScreen" as never, {
      payLaterId,
      shopId: row.shopId,
      shopname: row.shopname,
    } as never);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <CommonHeader title="Pending Payments" />

      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search User or Shop"
          value={q}
          onChangeText={setQ}
          style={styles.searchInput}
          returnKeyType="search"
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.PRIMARY_COLOR} style={{ marginTop: hp(10) }} />
      ) : filtered.length === 0 ? (
        <Text style={styles.empty}>No pending payments</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(it: any) => `${it.payLaterId || 0}-${it.shopId}`}
          renderItem={({ item }) => <ShopCard item={item} onPress={openSingle} />}
          contentContainerStyle={{ paddingHorizontal: wp(5), paddingBottom: hp(10), paddingTop: hp(2) }}
        />
      )}
    </SafeAreaView>
  );
};

export default PayLaterScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  searchRow: { paddingHorizontal: wp(5), marginTop: hp(1) },
  searchInput: {
    height: hp(5.5),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#F1F1F1",
    paddingHorizontal: wp(3),
    backgroundColor: "#FAFAFA",
    fontSize: hp(1.8),
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: wp(4),
    marginBottom: hp(1.5),
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#F2F2F2",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  shopName: { fontSize: hp(2), fontWeight: "700", color: "#222" },
  subText: { fontSize: hp(1.5), color: "#888", marginTop: hp(0.3) },
  smallText: { fontSize: hp(1.4), color: "#aaa", marginTop: hp(0.6) },
  rightCol: { alignItems: "flex-end" },
  amount: { fontWeight: "700", fontSize: hp(1.9), color: "#333" },
  empty: { textAlign: "center", marginTop: hp(6), color: "#999", fontSize: hp(2) },
});
