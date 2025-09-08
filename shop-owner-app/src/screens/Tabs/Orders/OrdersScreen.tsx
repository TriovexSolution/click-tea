import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
  LayoutAnimation,
  UIManager,
  Platform,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BASE_URL } from "@/api";
import { hp } from "@/src/assets/utils/responsive";
import theme from "@/src/assets/colors/theme";
import { useSelector } from "react-redux";
import axiosClient from "@/src/assets/api/client";


const STATUS_OPTIONS = ["pending", "preparing", "ready", "delivered", "cancelled","ongoing"];

const OrderCard = ({ item, onUpdateStatus }:any) => {
  const [selectedStatus, setSelectedStatus] = useState(item.status);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const userId = useSelector((s: any) => s.auth.user?.id);
  
  const toggleDetails = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setDetailsVisible(!detailsVisible);
  };

  return (
    <View style={styles.orderCard}>
      <Text style={styles.orderId}>🆔 Order ID: #{item.orderId}</Text>
      <Text>🕒 {new Date(item.created_at).toLocaleString()}</Text>
      <Text>👤 User: {item.username}</Text>
      <Text>💰 Payment: {item.payment_type}</Text>
      <Text>🛒 Total Items: {item.items?.length || 0} | ₹{item.totalAmount}</Text>

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={styles.label}>📦 Status:</Text>
        <TouchableOpacity onPress={() => setDropdownVisible(true)} style={styles.dropdown}>
          <Text style={styles.dropdownText}>{selectedStatus} {dropdownVisible ? "⬆️" : "⬇️"}</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={dropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setDropdownVisible(false)}>
          <View style={styles.dropdownList}>
            {STATUS_OPTIONS.map((status) => (
              <TouchableOpacity
                key={status}
                onPress={() => {
                  setSelectedStatus(status);
                  setDropdownVisible(false);
                }}
                style={styles.dropdownItem}
              >
                <Text>📌 {status}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      <TouchableOpacity onPress={toggleDetails} style={styles.toggleDetailBtn}>
        <Text style={{ color: theme.PRIMARY_COLOR }}>
          {detailsVisible ? "🔽 Hide Details" : "🔼 Show Details"}
        </Text>
      </TouchableOpacity>

      {detailsVisible && item.items?.map(({itm, i}:any) => {
        const totalAddonPrice = itm.addons?.reduce(({acc, cur}:any) => acc + (parseFloat(cur.price || 0)), 0);
        return (
          <View key={i} style={styles.itemBox}>
            <Image
              source={{ uri: `${BASE_URL}/uploads/menus/${itm.imageUrl}` }}
              style={styles.menuImage}
            />
            <View style={styles.itemDetails}>
              <Text style={styles.menuName}>{itm.menuName}</Text>
              <Text>Qty: {itm.quantity} × ₹{itm.price}</Text>
              <Text style={styles.subTotal}>Subtotal: ₹{itm.subtotal}</Text>
              {!!itm.addons?.length && (
                <Text style={styles.addonText}>
                  Addons: {itm.addons.map(a => a.name || a).join(", ")} | Total: ₹{totalAddonPrice.toFixed(2)}
                </Text>
              )}
            </View>
          </View>
        );
      })}

      <TouchableOpacity
        style={styles.statusBtn}
         onPress={() => onUpdateStatus({ orderId: item.orderId, newStatus: selectedStatus })}
      >
        <Text style={styles.statusBtnText}>🔁 Change Status</Text>
      </TouchableOpacity>
    </View>
  );
};

const OrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const LIMIT = 10;

  useEffect(() => {
    fetchOrders(1, selectedStatusFilter, true);
  }, [selectedStatusFilter]);

  const fetchOrders = async (page, status = "all", reset = false) => {
    try {
      if (reset) setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      const { data: profile } = await axiosClient.get(`${BASE_URL}/api/profile`, {
        // headers: { Authorization: `Bearer ${token}` },
      });
      const shopId = profile.shopId;
      if (!shopId) return Alert.alert("No Shop Found");

      let url = `${BASE_URL}/api/orders/shop-orders?shopId=${shopId}&page=${page}&limit=${LIMIT}`;
      if (status !== "all") url += `&status=${status}`;

      const { data } = await axiosClient.get(url, {
        // headers: { Authorization: `Bearer ${token}` },
      });
// console.log(data);

      reset ? setOrders(data) : setOrders((prev) => [...prev, ...data]);
      setHasMore(data.length === LIMIT);
      setCurrentPage(page);
    } catch (err) {
      console.error("Fetch error", err);
      Alert.alert("Error", "Could not load orders");
    } finally {
      if (reset) setLoading(false);
    } 
  };

  const updateStatus = async ({orderId, newStatus}:any) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      await axiosClient.put(
        `${BASE_URL}/api/orders/status/${orderId}`,
        { status: newStatus },
        // { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert("Success", "Order status updated");
      fetchOrders(1, selectedStatusFilter, true);
    } catch (err) {
      console.error("Update status error", err);
      Alert.alert("Error", "Failed to update status");
    }
  };
const onRefresh = async () => {
  setRefreshing(true);
await fetchOrders(1, selectedStatusFilter, true);
  setRefreshing(false);
};

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <TouchableOpacity
        style={styles.loadMoreBtn}
        onPress={() => fetchOrders(currentPage + 1, selectedStatusFilter)}
      >
        <Text style={styles.statusBtnText}>Load More</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color={theme.PRIMARY_COLOR}
        style={{ marginTop: hp(4) }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.stickyHeader}>
        <Text style={styles.heading}>📦 Your Orders</Text>

        <View style={styles.filterRow}>
          {["all", ...STATUS_OPTIONS].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterBtn,
                selectedStatusFilter === status && { backgroundColor: theme.PRIMARY_COLOR },
              ]}
              onPress={() => setSelectedStatusFilter(status)}
            >
              <Text style={{ color: selectedStatusFilter === status ? "white" : "black" }}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {orders.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: hp(4), fontSize: hp(2) }}>
          😕 No orders found.
        </Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item, index) => item?.orderId?.toString?.() || `order-${index}`}
          renderItem={({ item }) => (
            <OrderCard item={item} onUpdateStatus={updateStatus} />
          )}
          ListFooterComponent={renderFooter}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
                <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={[theme.PRIMARY_COLOR]} // Android
      tintColor={theme.PRIMARY_COLOR} // iOS
    />
          }
        />
      )}
    </View>
  );
};

export default OrdersScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  stickyHeader: { padding: hp(2), backgroundColor: "#fff", zIndex: 1 },
  heading: { fontSize: hp(2.4), fontWeight: "bold", marginBottom: hp(1.5) },
  orderCard: {
    padding: hp(1.5),
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: hp(1.2),
    marginHorizontal: hp(2),
    backgroundColor: "#f9f9f9",
  },
  orderId: { fontSize: hp(2), fontWeight: "bold", marginBottom: hp(0.5) },
  label: { marginTop: 8 },
  dropdown: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    backgroundColor: "#f0f0f0",
  },
  dropdownText: { fontSize: 14, color: "#333" },
  dropdownList: {
    backgroundColor: "#fff",
    marginHorizontal: 30,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownItem: { paddingVertical: 10 },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  itemBox: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "center",
  },
  menuImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  itemDetails: { marginLeft: 10, flex: 1 },
  menuName: { fontWeight: "600" },
  subTotal: { fontStyle: "italic" },
  addonText: { fontSize: hp(1.7), color: "#555" },
  statusBtn: {
    backgroundColor: theme.PRIMARY_COLOR,
    padding: 10,
    marginTop: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  statusBtnText: { color: "white", fontWeight: "bold" },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  filterBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    marginRight: 6,
    marginBottom: 6,
  },
  loadMoreBtn: {
    backgroundColor: theme.PRIMARY_COLOR,
    padding: 10,
    marginVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    marginHorizontal: hp(2),
  },
  toggleDetailBtn: {
    alignItems: "center",
    marginTop: 10,
  },
});
