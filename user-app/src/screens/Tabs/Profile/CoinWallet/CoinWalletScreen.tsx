import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { hp, wp } from "@/src/assets/utils/responsive";
import theme from "@/src/assets/colors/theme";
import { LinearGradient } from "expo-linear-gradient";
import CommonHeader from "@/src/Common/CommonHeader";
import { useAuth } from "@/src/context/authContext";
import axiosClient from "@/src/api/client";

const CoinWalletScreen = () => {
  const { token } = useAuth();

  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
 
  // Replace these with checkout data
  const mockShopId = 1;
  const mockOrder = {
    totalAmount: 240,  
    shopId: mockShopId,
    cartItems: [{ menuId: 5, quantity: 2, price: 120 }],
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const balanceRes = await axiosClient.get("/api/coin/balance", {
        // headers: { Authorization: `Bearer ${token}` },
      });

      const historyRes = await axiosClient.get("/api/coin/history", {
        // headers: { Authorization: `Bearer ${token}` },
      });

      setBalance(balanceRes.data.coin || 0);
      setTransactions(historyRes.data || []);
    } catch (err: any) {
      console.error("Wallet fetch error:", err.response?.data || err.message);
      Alert.alert("Error", err.response?.data?.message || "Failed to load wallet");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    try {
      setShowModal(false);
      setLoading(true);

      const res = await axiosClient.post(
        "/api/coin/pay",
        mockOrder,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("✅ Success", res.data.message || "Payment successful");
      fetchWalletData();
    } catch (err: any) {
      console.error("Payment error:", err.response?.data || err.message);
      Alert.alert("❌ Error", err.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const renderTransaction = ({ item }: any) => (
    <View style={styles.txnRow}>
      <Ionicons
        name={item.type === "debit" ? "arrow-down-circle" : "arrow-up-circle"}
        size={22}
        color={item.type === "debit" ? "red" : "green"}
      />
      <View style={{ flex: 1, marginLeft: wp(3) }}>
        <Text style={styles.txnReason}>{item.reason}</Text>
        <Text style={styles.txnDate}>{item.createdAt?.slice(0, 10)}</Text>
      </View>
      <Text style={[styles.txnAmount, { color: item.type === "debit" ? "red" : "green" }]}>
        {item.type === "debit" ? "-" : "+"} {item.amount} 🪙
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={theme.PRIMARY_COLOR} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CommonHeader title="Coin Wallet" />

      {/* 🔹 Wallet Balance Card */}
      <LinearGradient colors={["#4facfe", "#00f2fe"]} style={styles.balanceCard}>
        <Text style={styles.balanceText}>{balance} 🪙</Text>
        <Text style={styles.subText}>Available Coins</Text>
      </LinearGradient>

      {/* 🔹 Quick Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="send" size={22} color={theme.PRIMARY_COLOR} />
          <Text style={styles.actionText}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="gift" size={22} color={theme.PRIMARY_COLOR} />
          <Text style={styles.actionText}>Redeem</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setShowModal(true)}>
          <Ionicons name="card" size={22} color={theme.PRIMARY_COLOR} />
          <Text style={styles.actionText}>Pay</Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 Transaction History */}
      <Text style={styles.sectionTitle}>Transaction History</Text>
      {transactions.length === 0 ? (
        <View style={styles.emptyState}>
          <Image
            source={{ uri: "https://cdn-icons-png.flaticon.com/512/4076/4076549.png" }}
            style={{ width: wp(30), height: wp(30), marginBottom: hp(1) }}
          />
          <Text style={styles.emptyText}>No coins available yet</Text>
          <TouchableOpacity style={styles.ctaBtn}>
            <Text style={styles.ctaText}>Earn Coins by Ordering</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTransaction}
          contentContainerStyle={{ paddingBottom: hp(10) }}
        />
      )}

      {/* 🔹 Confirm Payment Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Confirm Payment</Text>
            <Text style={styles.modalText}>Shop: Coffee House</Text>
            <Text style={styles.modalText}>Order Total: {mockOrder.totalAmount} Coins</Text>
            <Text style={styles.modalText}>This will deduct from your wallet</Text>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalBtn, { backgroundColor: "red" }]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, { backgroundColor: theme.PRIMARY_COLOR }]}
                onPress={handleConfirmPayment}
              >
                <Text style={styles.modalBtnText}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CoinWalletScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff",  },

  // Balance Card
  balanceCard: {
    borderRadius: 15,
    padding: hp(3),
    alignItems: "center",
    marginVertical: hp(3),
    marginHorizontal:wp(5),
  },
  balanceText: { fontSize: 36, fontWeight: "bold", color: "#fff" },
  subText: { color: "#fff", fontSize: 14, marginTop: 5 },

  // Actions
  actionsRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: hp(2) },
  actionBtn: { alignItems: "center" },
  actionText: { marginTop: 5, fontSize: 12, fontWeight: "600", color: theme.PRIMARY_COLOR },

  // Transaction History
  sectionTitle: { fontSize: 16, fontWeight: "600", marginVertical: hp(1),marginHorizontal:wp(5) },
  txnRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1.2),
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
    marginHorizontal:wp(5)
  },
  txnReason: { fontSize: 14, fontWeight: "500" },
  txnDate: { fontSize: 12, color: "#777" },
  txnAmount: { fontSize: 14, fontWeight: "700" },

  // Empty State
  emptyState: { alignItems: "center", marginTop: hp(5) },
  emptyText: { fontSize: 14, color: "#555", marginBottom: hp(2) },
  ctaBtn: {
    backgroundColor: theme.PRIMARY_COLOR,
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
    borderRadius: 8,
  },
  ctaText: { color: "#fff", fontWeight: "600" },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    padding: hp(3),
    borderRadius: 12,
    width: "80%",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: hp(1) },
  modalText: { fontSize: 14, marginVertical: hp(0.5) },
  modalActions: { flexDirection: "row", justifyContent: "space-between", marginTop: hp(2) },
  modalBtn: { paddingVertical: hp(1.2), paddingHorizontal: wp(5), borderRadius: 6 },
  modalBtnText: { color: "#fff", fontWeight: "600" },
});
