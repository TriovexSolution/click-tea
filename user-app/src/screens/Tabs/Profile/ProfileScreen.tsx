import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  Alert,
  ListRenderItem,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { hp, wp } from "@/src/assets/utils/responsive";
import theme from "@/src/assets/colors/theme";
import { ParamListBase, useFocusEffect, useNavigation } from "@react-navigation/native";
import axios from "axios";
import { BASE_URL } from "@/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CommonHeader from "@/src/Common/CommonHeader";
import { userProfileDataType } from "@/src/assets/types/userDataType";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

/* ---------------- MENU CONFIG ---------------- */
type MenuItemType = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: string;
};

const MENU_ITEMS: MenuItemType[] = [
  { icon: "location-outline", label: "Address Book", route: "AddressBook" },
  { icon: "lock-closed-outline", label: "Change Password", route: "ChangePassword" },
  { icon: "time-outline", label: "Order History", route: "orderScreen" },
  { icon: "wallet-outline", label: "Coin Wallet", route: "Wallet" },
  { icon: "gift-outline", label: "Offer & Coupons", route: "Coupons" },
  { icon: "notifications-outline", label: "Manage Notifications", route: "Notifications" },
];

/* ---------------- MENU ITEM COMPONENT ---------------- */
const MenuItem = React.memo(
  ({ icon, label, onPress }: { icon: MenuItemType["icon"]; label: string; onPress: () => void }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.6}>
      <View style={styles.row}>
        <Ionicons name={icon} size={22} color={theme.PRIMARY_COLOR} style={{ marginRight: wp(3) }} />
        <Text style={styles.menuText}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#999" />
    </TouchableOpacity>
  )
);

const ProfileScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [profile, setProfile] = useState<userProfileDataType | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- Fetch Profile ---------------- */
  const fetchProfile = useCallback(async () => {
    const controller = new AbortController();
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return;

      const res = await axios.get(`${BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      setProfile(res.data);
    } catch (err: any) {
      if (err?.name !== "CanceledError") {
        console.error("Profile fetch error:", err?.response?.data ?? err);
      }
    } finally {
      setLoading(false);
    }
    return () => controller.abort();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const cleanup = fetchProfile();
      return () => {
        if (typeof cleanup === "function") cleanup();
      };
    }, [fetchProfile])
  );

  /* ---------------- Logout ---------------- */
  const handleLogout = useCallback(() => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("authToken");
          navigation.reset({ index: 0, routes: [{ name: "signInScreen" }] });
        },
      },
    ]);
  }, [navigation]);

  /* ---------------- Render Item ---------------- */
  const renderItem: ListRenderItem<MenuItemType> = useCallback(
    ({ item }) => (
      <MenuItem
        icon={item.icon}
        label={item.label}
        onPress={() => navigation.navigate(item.route as never)}
      />
    ),
    [navigation]
  );

  if (loading)
    return (
      <ActivityIndicator size="large" color={theme.PRIMARY_COLOR} style={{ flex: 1 }} />
    );

  return (
    <View style={styles.container}>
      <CommonHeader title="Profile" />

      {/* Profile Header */}
      <View style={styles.profileCard}>
        <Image
          source={{ uri: profile?.userImage || "https://i.pravatar.cc/150" }}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.name}>{profile?.username}</Text>
          <Text style={styles.subText}>{profile?.userPhone}</Text>
          <Text style={styles.subText}>{profile?.userEmail}</Text>
        </View>
      </View>

      {/* Menu Items */}
      <FlatList
        data={MENU_ITEMS}
        keyExtractor={(item) => item.label}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={
          <TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#E53935" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        }
        initialNumToRender={5}
        removeClippedSubviews
        maxToRenderPerBatch={6}
        windowSize={7}
        getItemLayout={(_, index) => ({
          length: hp(7),
          offset: hp(7) * index,
          index,
        })}
      />
    </View>
  );
};

export default ProfileScreen;

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: wp(5),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  avatar: {
    width: wp(16),
    height: wp(16),
    borderRadius: wp(8),
    marginRight: wp(4),
  },
  name: { fontSize: hp(2.2), fontWeight: "600", color: "#111" },
  subText: { fontSize: hp(1.8), color: "#666", marginTop: 2 },

  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: hp(2),
    paddingHorizontal: wp(5),
    backgroundColor: "#fff",
  },
  row: { flexDirection: "row", alignItems: "center" },
  menuText: { fontSize: hp(2), color: "#222" },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: "#eee", marginLeft: wp(12) },

  listContent: { paddingVertical: hp(1) },
  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: wp(5),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#eee",
    marginTop: hp(1),
  },
  logoutText: { marginLeft: wp(2), fontSize: hp(2), color: "#E53935", fontWeight: "500" },
});
