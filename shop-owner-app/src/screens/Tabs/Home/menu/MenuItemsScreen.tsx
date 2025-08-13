import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { hp, wp } from "@/src/assets/utils/responsive";
import theme from "@/src/assets/colors/theme";
import { BASE_URL } from "@/api";
import CommonHeader2 from "@/src/Common/CommonHeader2";

const MenuItemScreen = () => {
  const [menus, setMenus] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const res = await axios.get(`${BASE_URL}/api/menu/my-menus`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMenus(res.data);
      } catch (err) {
        console.log("Fetch menus error", err);
        Alert.alert("Error", "Failed to load menu items");
      }
    })();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: `${BASE_URL}/uploads/menus/${item.imageUrl}` }}
        style={styles.image}
      />
      <View style={styles.details}>
        <Text style={styles.name}>{item.menuName}</Text>
        <Text style={styles.price}>₹ {item.price}</Text>
        <Text style={styles.ingredients}>{item.ingredients}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <CommonHeader2 title="Menu Items" />
      <FlatList
        data={menus}
     keyExtractor={(item, index) => (item?.id ? item.id.toString() : `menu-${index}`)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: hp(2) }}
      />
    </View>
  );
};

export default MenuItemScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    padding: hp(1.5),
    borderRadius: 10,
    marginBottom: hp(1.5),
    elevation: 2,
  },
  image: {
    width: wp(22),
    height: wp(22),
    borderRadius: 8,
    marginRight: wp(4),
  },
  details: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: hp(2.1),
    fontWeight: "bold",
    marginBottom: hp(0.5),
  },
  price: {
    fontSize: hp(1.8),
    color: theme.PRIMARY_COLOR,
    marginBottom: hp(0.5),
  },
  ingredients: {
    fontSize: hp(1.6),
    color: "#555",
  },
});
