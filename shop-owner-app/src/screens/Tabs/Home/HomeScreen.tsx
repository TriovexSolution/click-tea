import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { hp } from "@/src/assets/utils/responsive";
import theme from "@/src/assets/colors/theme";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import { BASE_URL } from "@/api";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";

const randomAvatars = [
  "https://i.pravatar.cc/150?img=12",
  "https://i.pravatar.cc/150?img=24",
  "https://i.pravatar.cc/150?img=34",
];

const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [categoryCount, setCategoryCount] = useState(0);
  const [menuCount, setMenuCount] = useState(0);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const setupStep = await AsyncStorage.getItem("setupStep");

      const [catRes, menuRes, profileRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/category/my-categories`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/api/menu/my-menus`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setCategoryCount(catRes.data.length);
      setMenuCount(menuRes.data.length);
      setProfile(profileRes.data);

      if (setupStep !== "complete") {
        if (catRes.data.length === 0 || menuRes.data.length === 0) {
          setShowSetupModal(true);
        } else {
          await AsyncStorage.setItem("setupStep", "complete");
        }
      }
    } catch (err) {
      console.log("HomeScreen error:", err);
      Alert.alert("Error loading data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const userImage = profile?.userImage || randomAvatars[Math.floor(Math.random() * randomAvatars.length)];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.PRIMARY_COLOR} />
        <Text>Loading...</Text>
      </View>
    );
  }

  const sections = [
    {
      key: "header",
      render: () => (
        <Animated.View entering={FadeInDown.duration(500)} style={styles.headerRow}>
          <View>
            <Text style={styles.greet}>Hi, {profile?.username || "User"} 👋</Text>
            <Text style={styles.subtext}>Welcome to ClickTea!</Text>
          </View>
          <Image source={{ uri: userImage }} style={styles.avatar} />
        </Animated.View>
      ),
    },
    {
      key: "overview",
      render: () => (
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🏪 Shop Overview</Text>
          <Text style={styles.detail}>Name: {profile?.shopName || "-"}</Text>
          <Text style={styles.detail}>Status: {profile?.isOpen ? "Open" : "Closed"}</Text>
          <Text style={styles.detail}>Address: {profile?.shopAddress || "N/A"}</Text>
        </Animated.View>
      ),
    },
    {
      key: "insights",
      render: () => (
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>📊 Insights</Text>
          <Text style={styles.detail}>📂 Categories: {categoryCount}</Text>
          <Text style={styles.detail}>🍽 Menu Items: {menuCount}</Text>
        </Animated.View>
      ),
    },
    {
      key: "actions",
      render: () => (
        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.actionRow}>
          <TouchableOpacity
            onPress={() => navigation.navigate("addCategoryScreen")}
            style={styles.actionBtn}
          >
            <Text style={styles.actionText}>+ Category</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("addMenuScreen")}
            style={[styles.actionBtn, { backgroundColor: theme.PRIMARY_COLOR }]}
          >
            <Text style={styles.actionText}>+ Menu</Text>
          </TouchableOpacity>
        </Animated.View>
      ),
    },
  ];

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={sections}
      keyExtractor={(item) => item.key}
      renderItem={({ item }) => item.render()}
      ListFooterComponent={() => (
        <Modal visible={showSetupModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>🚧 Setup Incomplete</Text>
              <Text style={styles.modalMessage}>
                Please add at least 1 category and 1 menu item to continue.
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowSetupModal(false);
                  navigation.navigate("addCategoryScreen");
                }}
                style={styles.modalBtn}
              >
                <Text style={styles.modalBtnText}>Add Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    />
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    padding: hp(2),
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(2.5),
  },
  greet: {
    fontSize: hp(2.6),
    fontWeight: "bold",
  },
  subtext: {
    fontSize: hp(1.8),
    color: "gray",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  sectionCard: {
    backgroundColor: theme.PRIMARY_COLOR,
    padding: hp(2),
    borderRadius: 12,
    marginBottom: hp(2),
  },
  sectionTitle: {
    color: "#fff",
    fontSize: hp(2.2),
    fontWeight: "600",
    marginBottom: hp(1),
  },
  detail: {
    color: "#fff",
    fontSize: hp(1.8),
    marginBottom: 4,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: hp(2),
  },
  actionBtn: {
    flex: 1,
    backgroundColor: theme.SECONDARY_COLOR,
    padding: hp(1.5),
    borderRadius: 10,
    alignItems: "center",
  },
  actionText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: hp(2),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  modalBtn: {  
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 6,
  },
  modalBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
}); 