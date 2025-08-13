import React, { useEffect, useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableWithoutFeedback,
  Image,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { hp, wp } from "@/src/assets/utils/responsive";
import theme from "@/src/assets/colors/theme";
import { BASE_URL } from "@/api";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";

type CategoryType = {
  categoryId: number;
  categoryName: string;
  categoryImage?: string;
};


const ViewAllCategoryScreen= ({ navigation }) => {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(false);

  const getToken = async () => {
    try {
      return await AsyncStorage.getItem("authToken");
    } catch {
      return null;
    }
  };
  // Shared value for scale
  const scale = useSharedValue(1);

  // Animated style for scaling
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
         const token = await getToken();
      const res = await axios.get(`${BASE_URL}/api/category/categories-with-menus`,{
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      
      setCategories(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.warn("Error fetching categories:", err.message);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const renderCategoryItem = ({ item }: { item: CategoryType }) => (
    <TouchableWithoutFeedback>
      <View style={styles.categoryItem}>
        <Image
          source={
            item.categoryImage
              ? { uri: `${BASE_URL}/uploads/categories/${item.categoryImage}` }
              : require("@/src/assets/images/onBoard1.png")
          }
          style={styles.categoryImage}
        />
        <Text style={styles.categoryName} numberOfLines={1}>
          {item.categoryName}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Sticky Header */}
      <View style={styles.header}>
        <TouchableWithoutFeedback
          onPress={() => navigation.goBack()}
          onPressIn={() => {
            scale.value = withSpring(0.8, { damping: 10, stiffness: 150 });
          }}
          onPressOut={() => {
            scale.value = withSpring(1, { damping: 10, stiffness: 150 });
          }}
        >
          <Animated.View style={[styles.backButton, animatedStyle]}>
            <Ionicons
              name="chevron-back-outline"
              size={hp(3)}
              color={theme.PRIMARY_COLOR}
            />
          </Animated.View>
        </TouchableWithoutFeedback>
        <Text style={styles.headerTitle}>All Categories</Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={theme.PRIMARY_COLOR}
          style={{ marginTop: hp(10) }}
        />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item, index) =>
            item.categoryId.toString() + "_" + index
          }
          renderItem={renderCategoryItem}
          contentContainerStyle={styles.listContent}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[0]} // for sticky headers if you want to add more later
        />
      )}
    </SafeAreaView>
  );
};

export default ViewAllCategoryScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
  },
  backButton: {
    paddingRight: wp(4),
    paddingVertical: hp(0.5),
  },
  headerTitle: {
    fontSize: hp(2.5),
    fontWeight: "600",
    color: theme.PRIMARY_COLOR,
  },

  listContent: {
    paddingHorizontal: wp(3),
    paddingTop: hp(2),
    paddingBottom: hp(10),
  },

  categoryItem: {
    flex: 1 / 3,
    margin: wp(4) / 2,
    alignItems: "center",
  },
  categoryImage: {
    width: wp(22),
    height: wp(22),
    borderRadius: wp(11),
    backgroundColor: "#f2f2f2",
  },
  categoryName: {
    marginTop: hp(0.7),
    fontSize: hp(1.6),
    color: "#333",
    textAlign: "center",
  },
});
