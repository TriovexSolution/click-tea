// ViewAllCategoryScreen.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  TextInput,
  RefreshControl,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { hp, wp } from "@/src/assets/utils/responsive";
import theme from "@/src/assets/colors/theme";
import { BASE_URL } from "@/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import CommonHeader from "@/src/Common/CommonHeader";
import CommonSearchBar from "@/src/Common/CommonSearchBar";
import { ParamListBase, useNavigation } from "@react-navigation/native";

/** --- Types --- **/
type MenuItem = {
  menuId: number;
  menuName?: string;
  imageUrl?: string;
  price?: string;
  isAvailable?: number;
};

export type CategoryType = {
  categoryId: number;
  categoryName: string;
  categoryImage?: string;
  menus?: MenuItem[];
  is_global?: number;
  shop_id?: number;
};

type RootStackParamList = {
  ViewAllCategory: undefined;
  CategoryDetail: { categoryId: number; categoryName?: string } | undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "ViewAllCategory">;

/** --- Memoized category card to avoid re-renders --- **/
const CategoryCard = React.memo(
  ({
    item,
    selected,
    onPress,
  }: {
    item: CategoryType;
    selected: boolean;
    onPress: (id: number, name?: string) => void;
  }) => {
    const [imgFailed, setImgFailed] = useState(false);

    return (
      <Pressable
        onPress={() => onPress(item.categoryId, item.categoryName)}
        android_ripple={{ color: "rgba(0,0,0,0.04)" }}
        style={[styles.categoryCard, selected && styles.categoryCardSelected]}
        accessibilityRole="button"
        accessibilityLabel={`Category ${item.categoryName}`}
      >
        <Image
          source={
            !imgFailed && item.categoryImage
              ? { uri: `${BASE_URL}/uploads/categories/${item.categoryImage}` }
              : require("@/src/assets/images/onBoard1.png")
          }
          style={styles.categoryImage}
          resizeMode="contain"
          onError={() => setImgFailed(true)}
        />
        <Text style={styles.categoryTitle} numberOfLines={1}>
          {item.categoryName}
        </Text>

        {/* optional subtitle: first menu name (if exists) */}
        {item.menus && item.menus.length > 0 ? (
          <Text style={styles.categorySubtitle} numberOfLines={1}>
            {/* {item.menus[0].menuName ?? ""} */}
          add shope side
          </Text>
        ) : null}

        <Text style={styles.categoryCount}>
          {item.menus?.length ?? 0} items
        </Text>
      </Pressable>
    );
  },
  // only re-render when id, menus length or selection changes
  (prev, next) =>
    prev.item.categoryId === next.item.categoryId &&
    prev.item.menus?.length === next.item.menus?.length &&
    prev.selected === next.selected
);

/** --- Screen --- **/
const ViewAllCategoryScreen: React.FC<Props> = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>()
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // search handling (debounced)
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const tokenRef = useRef<string | null>(null);
  const cancelSourceRef = useRef(axios.CancelToken.source());

  // selection (for blue border like your design)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );

  // get token once and cache in ref
  const loadToken = useCallback(async () => {
    try {
      const t = await AsyncStorage.getItem("authToken");
      tokenRef.current = t;
      return t;
    } catch {
      tokenRef.current = null;
      return null;
    }
  }, []);

  const fetchCategories = useCallback(
    async (isRefresh = false) => {
      if (!isRefresh) setLoading(true);
      try {
        // ensure token is loaded
        if (tokenRef.current === null) {
          await loadToken();
        }
        cancelSourceRef.current = axios.CancelToken.source();

        const res = await axios.get(
          `${BASE_URL}/api/category/categories-with-menus`,
          {
            headers: tokenRef.current
              ? { Authorization: `Bearer ${tokenRef.current}` }
              : undefined,
            cancelToken: cancelSourceRef.current.token,
            timeout: 15000,
          }
        );

        // Validate response shape
        const data = Array.isArray(res?.data?.data) ? res.data.data : [];
        setCategories(data);
      } catch (err: any) {
        if (!axios.isCancel(err)) {
          console.warn("fetchCategories error:", err?.message ?? err);
        }
      } finally {
        if (isRefresh) setRefreshing(false);
        else setLoading(false);
      }
    },
    [loadToken]
  );

  useEffect(() => {
    fetchCategories();

    return () => {
      // cancel pending requests on unmount
      cancelSourceRef.current?.cancel("Component unmounted");
    };
  }, [fetchCategories]);

  // pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // cancel any running request and create new token
    cancelSourceRef.current.cancel("User initiated refresh");
    cancelSourceRef.current = axios.CancelToken.source();
    fetchCategories(true);
  }, [fetchCategories]);

  // memoized filtered list
  const filteredCategories = useMemo(() => {
    const q = debouncedQuery.toLowerCase();
    if (!q) return categories;
    return categories.filter((c) =>
      (c.categoryName ?? "").toLowerCase().includes(q)
    );
  }, [categories, debouncedQuery]);

  // press handler - memoized so child don't re-render unnecessarily
  const onPressCategory = useCallback(
    (id: number, name?: string) => {
      setSelectedCategoryId(id);
      // navigate to category detail (adjust route if different)
      navigation.navigate("categoryDetailScreen", { categoryId: id, categoryName: name });
    },
    [navigation]
  );

  // renderItem (use stable function)
  const renderItem = useCallback(
    ({ item }: { item: CategoryType }) => (
      <CategoryCard
        item={item}
        selected={selectedCategoryId === item.categoryId}
        onPress={onPressCategory}
      />
    ),
    [onPressCategory, selectedCategoryId]
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
        translucent={false}
      />
      {/* Header */}
<CommonHeader title="All Categories" />

<View style={{marginHorizontal:wp(4),marginTop:hp(1.5)}}>

      {/* Search Bar */}
<CommonSearchBar
  value={query}
  onChangeText={setQuery}
  placeholder="Search for tea, Coffee, Snacks..."
/>
</View>

      {loading && categories.length === 0 ? (
        <ActivityIndicator
          size="large"
          color={theme.PRIMARY_COLOR}
          style={{ marginTop: hp(8) }}
        />
      ) : (
        <FlatList
          data={filteredCategories}
          keyExtractor={(item) => item.categoryId.toString()}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={7}
          removeClippedSubviews={Platform.OS === "android"}
          updateCellsBatchingPeriod={50}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={() =>
            !loading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No categories found</Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

export default ViewAllCategoryScreen;

/** --- Styles --- **/
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: hp(2.4),
    fontWeight: "600",
    marginLeft: wp(3),
    color: theme.PRIMARY_COLOR,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    marginHorizontal: wp(4),
    borderRadius: wp(3),
    paddingHorizontal: wp(3),
    marginTop: hp(1.5),
    height: hp(5.5),
  },
  searchInput: {
    flex: 1,
    marginLeft: wp(2),
    fontSize: hp(1.8),
    color: "#333",
    paddingVertical: 0,
  },

  listContent: {
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
    paddingBottom: hp(10),
  },

  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: hp(1),
  },

  categoryCard: {
    width: wp(42),
    backgroundColor: "#FAFAFA",
    borderRadius: wp(3),
    paddingVertical: hp(2),
    marginBottom: hp(2),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "transparent",
  },
  categoryCardSelected: {
    borderColor: theme.PRIMARY_COLOR, // blue outline
    borderWidth: 2,
    shadowOpacity: 0.08,
  },

  categoryImage: {
    width: wp(20),
    height: wp(20),
    marginBottom: hp(1),
  },
  categoryTitle: {
    fontSize: hp(2),
    fontWeight: "600",
    color: "#333",
  },
  categorySubtitle: {
    fontSize: hp(1.6),
    color: "#888",
    marginTop: hp(0.5),
  },
  categoryCount: {
    fontSize: hp(1.5),
    color: theme.PRIMARY_COLOR,
    marginTop: hp(0.5),
  },

  emptyContainer: {
    paddingTop: hp(6),
    alignItems: "center",
  },
  emptyText: {
    color: "#666",
    fontSize: hp(1.8),
  },
});
