// AddMenuScreen.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Image,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Pressable,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { hp, wp } from "@/src/assets/utils/responsive";
import theme from "@/src/assets/colors/theme";
import { BASE_URL } from "@/api";
import * as ImagePicker from "expo-image-picker";
import CommonHeader2 from "@/src/Common/CommonHeader2";

// Reanimated v2
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeInDown,
  Layout,
} from "react-native-reanimated";

// gradient + icons
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import axiosClient from "@/src/assets/api/client";

/* ----- Portion options (labels only) ----- */
const PORTION_GROUPS = {
  HalfFull: {
    title: "Half / Full",
    options: [
      { key: "Half", label: "Half" },
      { key: "Full", label: "Full" },
    ],
  },
  Size: {
    title: "Size",
    options: [
      { key: "Small", label: "Small" },
      { key: "Medium", label: "Medium" },
      { key: "Large", label: "Large" },
    ],
  },
  Quantity: {
    title: "Quantity",
    options: [
      { key: "1pc", label: "1 pc" },
      { key: "2pcs", label: "2 pcs" },
      { key: "Plate", label: "Plate" },
    ],
  },
  Volume: {
    title: "Volume",
    options: [
      { key: "250ml", label: "250 ml" },
      { key: "500ml", label: "500 ml" },
      { key: "750ml", label: "750 ml" },
      { key: "1L", label: "1 L" },
    ],
  },
};

/* ------ Utilities ------ */
const isNumeric = (v: string) => !Number.isNaN(Number(v)) && v.trim() !== "";

type CategoryRaw = { id?: number | string; categoryId?: number | string; categoryName: string; categoryImage: string };
type Category = { idStr: string; categoryName: string; categoryImage: string; raw: CategoryRaw };

const AddMenuScreen: React.FC = () => {
  const navigation = useNavigation();

  // form
  const [menuName, setMenuName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<any>(null);

  // categories
  const [categoriesRaw, setCategoriesRaw] = useState<CategoryRaw[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [loadingCategories, setLoadingCategories] = useState(false);

  // variants selection
  const [selectedOptions, setSelectedOptions] = useState<Record<string, boolean>>({});
  const [customVariants, setCustomVariants] = useState<{ label: string; price: number; key: string }[]>(
    []
  );

  // previews
  const [menuItemsPreview, setMenuItemsPreview] = useState<
    { name: string; variants: { label: string; price: number; key: string }[] }[]
  >([]);

  // modals + submitting
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // help tooltip
  const [helpModalVisible, setHelpModalVisible] = useState(false);

  // custom size inputs
  const [customSizeValue, setCustomSizeValue] = useState("");
  const [customUnit, setCustomUnit] = useState<"ml" | "gm" | "pcs" | "plate">("ml");
  const [customPrice, setCustomPrice] = useState("");

  // Reanimated shared values for button feedback
  const addBtnScale = useSharedValue(1);
  const customBtnScale = useSharedValue(1);

  // modal scale values
  const customModalScale = useSharedValue(0);
  const imageModalScale = useSharedValue(0);

  // Parent scroll state (disable vertical scroll while user interacts with horizontal list)
  const [parentScrollEnabled, setParentScrollEnabled] = useState(true);

  useEffect(() => {
    (async () => {
      setLoadingCategories(true);
      const token = await AsyncStorage.getItem("authToken");
      try {
        const res = await axiosClient.get(`${BASE_URL}/api/category/me`, {
          // headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const data = Array.isArray(res.data) ? res.data : [];
        setCategoriesRaw(data);
        if (data.length > 0) {
          const first = data[0];
          const id = String((first as any).categoryId ?? (first as any).id ?? "");
          setSelectedCategoryId(id);
          // console.log("[DEBUG] initial selected category id:", id);
        }
      } catch (err) {
        console.warn("Error fetching categories", err);
        Alert.alert("Error", "Unable to fetch categories");
      } finally {
        setLoadingCategories(false);
      }
    })();
  }, []);

  // memoized normalized categories
  const categories = useMemo<Category[]>(
    () =>
      categoriesRaw.map((c) => {
        const raw = c;
        const idVal = String((raw as any).categoryId ?? (raw as any).id ?? "");
        return { idStr: idVal, categoryName: raw.categoryName, categoryImage: raw.categoryImage, raw };
      }),
    [categoriesRaw]
  );

  /* ----- reanimated styles ----- */
  const addBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(addBtnScale.value, { damping: 12, stiffness: 150 }) }],
  }));
  const customBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(customBtnScale.value, { damping: 12, stiffness: 150 }) }],
  }));

  const openModal = (sharedVal: typeof customModalScale) => {
    sharedVal.value = withTiming(1, { duration: 220 });
  };
  const closeModal = (sharedVal: typeof customModalScale, cb?: () => void) => {
    sharedVal.value = withTiming(0, { duration: 160 }, () => {
      cb && cb();
    });
  };
  const modalAnimatedStyle = (sharedVal: typeof customModalScale) =>
    useAnimatedStyle(() => ({
      transform: [{ scale: sharedVal.value || 0 }],
      opacity: sharedVal.value,
    }));

  /* ----- image pick ----- */
  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });
      if (!result.canceled) {
        setImage(result.assets[0]);
        // console.log("[DEBUG] picked image uri:", result.assets[0].uri);
      } else {
        console.log("[DEBUG] image pick cancelled");
      }
    } catch (err) {
      console.warn("Image pick error", err);
      Alert.alert("Error", "Could not pick image");
    }
  };

  /* ----- variant selection helpers ----- */
  const toggleOption = useCallback((key: string) => {
    setSelectedOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const removeCustomVariant = useCallback((key: string) => {
    setCustomVariants((prev) => prev.filter((v) => v.key !== key));
    setMenuItemsPreview((prev) =>
      prev.map((m) => ({
        ...m,
        variants: m.variants.filter((vv) => vv.key !== key),
      }))
    );
  }, []);

  /* Build variants from selected built-in options + custom variants.
     Price for built-in options uses base price (entered by vendor).
     Custom variants carry their own price.
  */
  const builtVariants = useMemo(() => {
    const base = Number(price || 0);
    const result: { label: string; price: number; key: string }[] = [];

    Object.keys(PORTION_GROUPS).forEach((gk) => {
      const group = (PORTION_GROUPS as any)[gk];
      group.options.forEach((opt: any) => {
        if (selectedOptions[opt.key]) {
          result.push({
            label: opt.label,
            price: Number(base.toFixed(2)),
            key: `${gk}_${opt.key}_${Date.now()}`,
          });
        }
      });
    });

    if (customVariants.length) result.unshift(...customVariants);

    if (result.length === 0) {
      result.push({ label: "", price: Number(base.toFixed(2)), key: `single_${Date.now()}` });
    }

    return result;
  }, [price, selectedOptions, customVariants]);

  /* ----- custom variant modal actions ----- */
  const openCustomModal = () => {
    setCustomModalVisible(true);
    requestAnimationFrame(() => openModal(customModalScale));
  };
  const closeCustomModal = () => {
    closeModal(customModalScale, () => setCustomModalVisible(false));
  };

  const handleAddCustomVariant = () => {
    if (!isNumeric(customSizeValue)) {
      Alert.alert("Validation", "Enter a valid size (number).");
      return;
    }
    if (!isNumeric(customPrice)) {
      Alert.alert("Validation", "Enter a valid price.");
      return;
    }
    const label = `${customSizeValue} ${customUnit}`;
    const variant = { label, price: Number(Number(customPrice).toFixed(2)), key: `custom_${label}_${Date.now()}` };
    setCustomVariants((prev) => [variant, ...prev]);
    setMenuItemsPreview((prev) => [
      { name: menuName.trim() || "Item", variants: [variant] },
      ...prev,
    ]);
    setCustomSizeValue("");
    setCustomPrice("");
    setCustomUnit("ml");
    closeCustomModal();
  };

  /* ----- Add Menu (send to backend) ----- */
  const handleAddMenu = async () => {
    // console.log("[DEBUG] handleAddMenu called", { menuName, price, selectedCategoryId, builtVariants });
    if (menuName.trim().length === 0) return Alert.alert("Validation", "Please enter menu name.");
    if (!isNumeric(price)) return Alert.alert("Validation", "Please enter valid base price.");
    if (!selectedCategoryId) return Alert.alert("Validation", "Please select category.");

    const variantsToSend = builtVariants.map((v) => ({ label: v.label, price: v.price }));
 const shopId = await AsyncStorage.getItem("shopId")
    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      const formData: any = new FormData();
      formData.append("menuName", menuName.trim());
      formData.append("categoryId", Number(selectedCategoryId));
      formData.append("price", price);
      formData.append("ingredients", ingredients.trim());
      formData.append("isAvailable", "1");
      formData.append("variants", JSON.stringify(variantsToSend));

    if (shopId) {
      formData.append("shopId", shopId); // send shopId if you have it
    }
      if (image) {
        formData.append("imageUrl", {
          uri: image.uri,
          name: `menu_${Date.now()}.jpg`,
          type: "image/jpeg",
        } as any);
      }

      const resp = await axiosClient.post('/api/menu', formData, {
        headers: {
          // Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "multipart/form-data",
          Accept:"application/json"
        },
      });
      // console.log("[DEBUG] add menu response:", resp?.data);
      setMenuItemsPreview((prev) => [
        { name: menuName.trim(), variants: builtVariants },
        ...prev,
      ]);

      // reset
      setMenuName("");
      setIngredients("");
      setPrice("");
      setImage(null);
      setSelectedOptions({});
      setCustomVariants([]);
      Alert.alert("Success", "Menu item added.");
    } catch (err) {
      console.error("Add menu failed", err);
      Alert.alert("Error", "Failed to add menu item");
    } finally {
      setSubmitting(false);
    }
  };

  /* ----- UI render helpers ----- */
  // stable press handler
  const onCategoryPress = useCallback((cat: Category) => {
    // console.log("[DEBUG] onCategoryPress:", cat.idStr, cat.categoryName);
    setSelectedCategoryId(cat.idStr);
  }, []);

  // handlers to disable parent scroll when interacting horizontally
  const onHorizontalTouchStart = useCallback(() => {
    // disable vertical scroll to avoid gesture conflicts
    setParentScrollEnabled(false);
  }, []);
  const onHorizontalTouchEnd = useCallback(() => {
    // re-enable after short delay to ensure scroll finished
    setTimeout(() => setParentScrollEnabled(true), 75);
  }, []);

  const renderCategory = useCallback(
    ({ item }: { item: Category }) => {
      const active = selectedCategoryId === item.idStr;

      return (
        <Pressable
          onPressIn={() => {
            // immediate feedback so selection registers even if touch slightly moves
            setSelectedCategoryId(item.idStr);
            // console.log("[DEBUG] onPressIn category:", item.idStr);
          }}
          onPress={() => {
            // console.log("[DEBUG] onPress category:", item.idStr);
            onCategoryPress(item);
          }}
          onTouchStart={onHorizontalTouchStart}
          onTouchEnd={onHorizontalTouchEnd}
          android_ripple={{ color: "rgba(0,0,0,0.06)" }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={({ pressed }) => [
            styles.categoryCard,
            active && styles.categoryCardActive,
            pressed && { opacity: 0.9 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Category ${item.categoryName}`}
        >
          <Image source={{ uri: `${BASE_URL}/uploads/categories/${item.categoryImage}` }} style={styles.categoryImage} resizeMode="cover" />
          <View style={styles.categoryOverlay}>
            <Text style={styles.categoryText}>{item.categoryName}</Text>
          </View>
          {active && (
            <View style={styles.selectedBadge}>
              <Ionicons name="checkmark-circle" size={22} color="#fff" />
            </View>
          )}
        </Pressable>
      );
    },
    [selectedCategoryId, onCategoryPress, onHorizontalTouchStart, onHorizontalTouchEnd]
  );

  const renderMenuPreview = useCallback(
    ({ item, index }: any) => {
      return (
        <Animated.View entering={FadeInDown.duration(260 + (index || 0) * 40)} layout={Layout.springify()} style={styles.menuItemWrapper}>
          <Text style={styles.bullet}>•</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.menuItemTitle]}>{item.name}</Text>
            <View style={styles.variantsRow}>
              {item.variants.map((v: any) => (
                <View key={v.key} style={styles.variantContainer}>
                  <Text style={styles.variantLabel}>{v.label ? v.label : "Standard"}</Text>
                  <View style={styles.variantPriceBadge}>
                    <Text style={styles.variantPriceText}>₹{Number(v.price).toFixed(0)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>
      );
    },
    []
  );

  const customModalAnimated = modalAnimatedStyle(customModalScale);
  const imageModalAnimated = modalAnimatedStyle(imageModalScale);

  const animatePressScale = (sharedVal: typeof addBtnScale, to: number) => {
    sharedVal.value = withTiming(to, { duration: 100 });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <CommonHeader2 title="Add Menu Items" />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" scrollEnabled={parentScrollEnabled}>
          <View style={styles.titleRow}>
            <Text style={styles.sectionLabel}>Select Category</Text>
            {/* small info icon opens help tooltip modal */}
            <TouchableOpacity onPress={() => setHelpModalVisible(true)} style={styles.infoIcon} accessibilityRole="button" accessibilityLabel="Help">
              <Ionicons name="information-circle-outline" size={22} color={theme.PRIMARY_COLOR} />
            </TouchableOpacity>
          </View>

          {loadingCategories ? (
            <ActivityIndicator size="small" color={theme.PRIMARY_COLOR} />
          ) : (
            <View style={{  paddingHorizontal: wp(4),
  paddingTop: hp(2),   // 👈 this adds gap above card
  paddingBottom: hp(1), /* keep space but small */ }}>
              <FlatList
                data={categories}
                horizontal
                nestedScrollEnabled
                keyExtractor={(item) => item.idStr}
                renderItem={renderCategory}
                showsHorizontalScrollIndicator={false}
                style={styles.categoryList}
                contentContainerStyle={{ paddingVertical: 2 }}
              />
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.fieldLabel}>Menu Item Name</Text>
            <TextInput placeholder="e.g. Tea" value={menuName} onChangeText={setMenuName} style={styles.input} returnKeyType="next" />

            <Text style={styles.fieldLabel}>Ingredients (optional)</Text>
            <TextInput placeholder="Tomato, Paneer, Spices..." value={ingredients} onChangeText={setIngredients} style={[styles.input, styles.textarea]} multiline />

            <Text style={styles.fieldLabel}>Base Price (enter once)</Text>
            <TextInput placeholder="0.00" value={price} onChangeText={(t) => setPrice(t.replace(/[^0-9.]/g, ""))} keyboardType="numeric" style={styles.input} />

            <Text style={[styles.fieldLabel, { marginTop: hp(0.8) }]}>Choose Portion Type</Text>
            <View style={styles.portionGroups}>
              {Object.keys(PORTION_GROUPS).map((groupKey) => {
                const group = (PORTION_GROUPS as any)[groupKey];
                return (
                  <View key={groupKey} style={styles.groupBlock}>
                    <Text style={styles.groupTitle}>{group.title}</Text>
                    <View style={styles.row}>
                      {group.options.map((opt: any) => {
                        const selected = !!selectedOptions[opt.key];
                        return (
                          <Pressable
                            key={opt.key}
                            onPress={() => toggleOption(opt.key)}
                            style={({ pressed }) => [
                              styles.optionBtn,
                              selected && styles.optionBtnActive,
                              pressed && { opacity: 0.8 },
                            ]}
                          >
                            <Text style={[styles.optionText, selected && styles.optionTextActive]}>{opt.label}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={styles.rowSpread}>
              <Animated.View style={customBtnStyle}>
                <Pressable
                  onPressIn={() => animatePressScale(customBtnScale, 0.96)}
                  onPressOut={() => animatePressScale(customBtnScale, 1)}
                  onPress={openCustomModal}
                  style={styles.customBtn}
                >
                  <Text style={styles.customBtnText}>
                    <Ionicons name="add-circle-outline" size={14} color="#111827" /> {"  "}
                    + Custom Size / Unit
                  </Text>
                </Pressable>
              </Animated.View>

              <Pressable
                onPressIn={() => animatePressScale(addBtnScale, 0.96)}
                onPressOut={() => animatePressScale(addBtnScale, 1)}
                onPress={handlePickImage}
                style={[styles.imageBoxSmall, { borderColor: image ? "#dbeafe" : "#e6e6ef" }]}
              >
                {image ? <Image source={{ uri: image.uri }} style={styles.smallImage} /> : <Text style={{ color: "#666" }}>Add Image</Text>}
              </Pressable>
            </View>

            <Animated.View style={[styles.addButtonWrap, addBtnStyle]}>
              <Pressable onPress={handleAddMenu} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
                <LinearGradient
                  colors={[theme.PRIMARY_COLOR, theme.SECONDARY_COLOR]}
                  start={[0, 0]}
                  end={[1, 1]}
                  style={[styles.primaryBtn, submitting && styles.primaryBtnDisabled]}
                >
                  {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Add Menu</Text>}
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </View>

          <View style={styles.listSection}>
            <Text style={styles.sectionTitle}>Preview - Added Items</Text>
            {menuItemsPreview.length === 0 ? (
              <Text style={styles.emptyText}>No menu items yet — add some above.</Text>
            ) : (
              <FlatList data={menuItemsPreview} keyExtractor={(item, idx) => `${item.name}-${idx}`} renderItem={renderMenuPreview} scrollEnabled={false} />
            )}
          </View>
<LinearGradient
                  colors={[theme.PRIMARY_COLOR, theme.SECONDARY_COLOR]}
                  start={[0, 0]}
                  end={[1, 1]}
                  style={[styles.primaryBtn, submitting && styles.primaryBtnDisabled,{marginTop:hp(2)}]}
                >

          <TouchableOpacity
            onPress={async () => {
              await AsyncStorage.setItem("isSetupComplete", "true");
              await AsyncStorage.setItem("setupStep", "complete");
              // @ts-ignore
              navigation.reset({ index: 0, routes: [{ name: "bottamTabScreen" }] });
            }}
            // style={styles.finishBtn}
          >
            <Text style={styles.finishBtnText}>Finish Setup</Text>
          </TouchableOpacity>
                </LinearGradient>

          <View style={{ height: hp(6) }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* image modal */}
      <Modal visible={imageModalVisible} transparent animationType="none" onRequestClose={() => closeModal(imageModalScale, () => setImageModalVisible(false))}>
        <View style={styles.modalBackdrop}>
          <Animated.View style={[styles.modalCard, imageModalAnimated]}>
            <Image source={{ uri: image?.uri }} style={styles.modalImage} resizeMode="contain" />
            <TouchableOpacity onPress={() => closeModal(imageModalScale, () => setImageModalVisible(false))} style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseText}><Ionicons name="close" color="#fff" /> Close</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* custom size modal */}
      {/* <Modal visible={customModalVisible} transparent animationType="none" onRequestClose={closeCustomModal}>
        <View style={styles.modalBackdrop}>
          <Animated.View style={[styles.customModalCard, customModalAnimated]}>
            <Text style={styles.fieldLabel}>Custom Size / Unit</Text>

            <View style={{ flexDirection: "row", alignItems: "center", marginTop: hp(0.5) }}>
              <TextInput placeholder="e.g. 750" value={customSizeValue} onChangeText={(t) => setCustomSizeValue(t.replace(/[^0-9.]/g, ""))} keyboardType="numeric" style={[styles.input, { flex: 1, marginRight: wp(2) }]} />
              <View style={styles.unitPicker}>
                {(["ml", "gm", "pcs", "plate"] as const).map((u) => (
                  <TouchableOpacity key={u} style={[styles.unitBtn, customUnit === u && styles.unitBtnActive]} onPress={() => setCustomUnit(u)}>
                    <Text style={[styles.unitText, customUnit === u && { color: "#fff" }]}>{u}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Text style={[styles.fieldLabel, { marginTop: hp(1) }]}>Custom Price</Text>
            <TextInput placeholder="e.g. 40.00" value={customPrice} onChangeText={(t) => setCustomPrice(t.replace(/[^0-9.]/g, ""))} keyboardType="numeric" style={styles.input} />

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: hp(1.5) }}>
              <TouchableOpacity onPress={closeCustomModal} style={styles.secondaryBtn}>
                <Text style={{ color: "#333" }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleAddCustomVariant} style={styles.primaryBtn}>
                <Text style={styles.btnText}>Add Variant</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal> */}

      {/* help tooltip modal */}
      {/* <Modal visible={helpModalVisible} transparent animationType="fade" onRequestClose={() => setHelpModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.helpCard}>
            <View style={styles.helpHeader}>
              <Text style={styles.helpTitle}>Quick help</Text>
              <TouchableOpacity onPress={() => setHelpModalVisible(false)}><Ionicons name="close" size={20} color="#374151" /></TouchableOpacity>
            </View>
            <Text style={styles.helpText}>Tap a category image to choose where this menu belongs. You can use the picture and label to recognise category quickly.</Text>

            <Text style={[styles.helpSub, { marginTop: hp(1) }]}>Examples</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: hp(1) }}>
              {categories.slice(0, 6).map((c) => (
                <View key={c.idStr} style={styles.helpExample}>
                  <Image source={{ uri: `${BASE_URL}/uploads/categories/${c.categoryImage}` }} style={styles.helpExampleImage} resizeMode="cover" />
                  <Text style={styles.helpExampleLabel}>{c.categoryName}</Text>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity onPress={() => setHelpModalVisible(false)} style={[styles.primaryBtn, { marginTop: hp(1.5) }]}>
              <Text style={styles.btnText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal> */}
<Modal
  visible={helpModalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setHelpModalVisible(false)}
>
  <View style={styles.helpBackdrop}>
    <View style={styles.helpSheet}>
      <View style={styles.helpHeader}>
        <Text style={styles.helpTitle}>Quick help</Text>
        <TouchableOpacity onPress={() => setHelpModalVisible(false)}>
          <Ionicons name="close-circle" size={30} color={theme.PRIMARY_COLOR} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: hp(2) }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.helpText}>
          Tap a category image to choose where this menu belongs. Use picture +
          label to recognise category quickly.
        </Text>

        <Text style={[styles.helpSub, { marginTop: hp(2) }]}>Examples</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: hp(1) }}
        >
          {categories.slice(0, 6).map((c) => (
            <View key={c.idStr} style={styles.helpExample}>
              <Image
                source={{ uri: `${BASE_URL}/uploads/categories/${c.categoryImage}` }}
                style={styles.helpExampleImage}
                resizeMode="cover"
              />
              <Text style={styles.helpExampleLabel}>{c.categoryName}</Text>
            </View>
          ))}
        </ScrollView>
      </ScrollView>

      <TouchableOpacity
        onPress={() => setHelpModalVisible(false)}
        style={[styles.primaryBtn, { marginTop: hp(1.5) }]}
      >
        <Text style={styles.btnText}>Got it</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>


    </SafeAreaView>
  );
};

export default AddMenuScreen;

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "white" },
  container: {
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
    paddingBottom: hp(4),
  },
  titleRow: { flexDirection: "row", alignItems: "center" },
  sectionLabel: { fontSize: hp(2), marginBottom: hp(1), color: "#111827", fontWeight: "700", flex: 1 },
  infoIcon: { padding: 6, marginLeft: 6 },

  categoryList: { marginBottom: hp(2) },
  categoryCard: {
    width: wp(26), // slightly larger for better touch target
    height: wp(26),
    borderRadius: 12,
    overflow: "hidden",
    marginRight: wp(3),
    backgroundColor: "#fff",
    elevation: 3,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  categoryCardActive: {
    borderWidth: 2,
    borderColor: theme.PRIMARY_COLOR,
    shadowColor: theme.PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  categoryImage: { width: "100%", height: "100%" },
  categoryOverlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  categoryText: { color: "#fff", fontSize: hp(1.3), textAlign: "center", fontWeight: "600" },
  selectedBadge: { position: "absolute", top: 8, right: 8, backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 12, padding: 2 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: hp(2),
    marginBottom: hp(5),
    elevation: 4,
  },
  fieldLabel: { fontSize: hp(1.6), color: "#111827", marginBottom: hp(0.6), fontWeight: "700" },
  input: {
    borderWidth: 1,
    borderColor: "#eef2ff",
    backgroundColor: "#fff",
    padding: hp(1.1),
    borderRadius: 10,
    marginBottom: hp(1.0),
    fontSize: hp(1.8),
  },
  textarea: { minHeight: hp(9), textAlignVertical: "top" },

  imageBoxSmall: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e6e6ef",
    backgroundColor: "#fff",
    paddingVertical: hp(1),
    paddingHorizontal: wp(3),
    alignItems: "center",
    justifyContent: "center",
  },
  smallImage: { width: 48, height: 48, borderRadius: 8 },

  primaryBtn: {
    backgroundColor: theme.PRIMARY_COLOR,
    paddingVertical: hp(1.1),
    paddingHorizontal: wp(6),
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnDisabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontWeight: "800", fontSize: hp(1.85) },

  portionGroups: { marginTop: hp(1) },
  groupBlock: { marginBottom: hp(1.2) },
  groupTitle: { fontSize: hp(1.5), fontWeight: "700", marginBottom: hp(0.6) },
  row: { flexDirection: "row", flexWrap: "wrap" },
  optionBtn: {
    borderWidth: 1,
    borderColor: "#e6eefc",
    borderRadius: 12,
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(3),
    marginRight: wp(2),
    marginBottom: hp(1),
    backgroundColor: "#fff",
    minWidth: wp(20),
    alignItems: "center",
  },
  optionBtnActive: { backgroundColor: theme.PRIMARY_COLOR, borderColor: theme.PRIMARY_COLOR },
  optionText: { fontSize: hp(1.6), color: "#111827" },
  optionTextActive: { color: "#fff", fontWeight: "800" },

  customBtn: {
    marginTop: hp(1),
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e1e1e6",
    paddingVertical: hp(0.9),
    paddingHorizontal: wp(3),
    borderRadius: 10,
  },
  customBtnText: { color: "#111827", fontSize: hp(1.6), fontWeight: "700" },

  rowSpread: { marginTop: hp(1.2), flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  addButtonWrap: { marginTop: hp(1.6) },

  listSection: { marginTop: hp(1) },
  sectionTitle: { fontWeight: "800", fontSize: hp(1.9), marginBottom: hp(1) },
  emptyText: { color: "#6b7280" },

  menuItemWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: hp(1.2),
    marginBottom: hp(1),
    elevation: 2,
  },
  bullet: { fontSize: hp(2.2), color: theme.PRIMARY_COLOR, marginRight: wp(3), marginTop: 6 },
  menuItemTitle: { fontSize: hp(1.95), fontWeight: "800", color: "#0f172a" },

  variantsRow: { flexDirection: "row", flexWrap: "wrap", marginTop: hp(0.6) },
  variantContainer: { backgroundColor: "#f1f5f9", borderRadius: 18, paddingVertical: hp(0.5), paddingHorizontal: wp(3), marginRight: wp(2), marginBottom: hp(1), flexDirection: "row", alignItems: "center" },
  variantLabel: { color: "#0f172a", fontWeight: "700", marginRight: 8 },
  variantPriceBadge: { backgroundColor: "#e0f2fe", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  variantPriceText: { color: "#0369a1", fontWeight: "900" },

  finishBtn: {
    backgroundColor: theme.SECONDARY_COLOR,
    paddingVertical: hp(1.3),
    borderRadius: 10,
    alignItems: "center",
    marginTop: hp(1.5),
  },
  finishBtnText: { color: "#fff", fontWeight: "700", fontSize: hp(1.9) },

  /* modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(4),
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: hp(2),
    elevation: 10,
    alignItems: "center",
  },
  modalImage: { width: "100%", height: hp(50) },
  modalCloseBtn: {
    marginTop: hp(1.5),
    backgroundColor: theme.PRIMARY_COLOR,
    paddingVertical: hp(0.9),
    paddingHorizontal: wp(8),
    borderRadius: 8,
  },
  modalCloseText: { color: "#fff", fontWeight: "700" },

  /* custom modal card smaller */
  customModalCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: hp(2),
    elevation: 12,
  },

  unitPicker: { flexDirection: "row", marginLeft: wp(2) },
  unitBtn: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.6),
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e6eefc",
    marginLeft: wp(1),
  },
  unitBtnActive: { backgroundColor: theme.PRIMARY_COLOR, borderColor: theme.PRIMARY_COLOR },
  unitText: { color: "#111827" },

  secondaryBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e6eefc",
    paddingVertical: hp(1),
    paddingHorizontal: wp(5),
    borderRadius: 8,
  },

  /* help modal */
helpBackdrop: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.45)",
  // justifyContent: "flex-end", // bottom sheet style
},
helpSheet: {
  // width: "70%",
  // maxHeight: "80%",
  backgroundColor: "white",
  borderTopLeftRadius: 18,
  borderTopRightRadius: 18,
  // padding: hp(2),
  height:"70%",
  width:wp(80),
  elevation:4
},
helpHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: hp(1),
},
  helpTitle: { fontWeight: "800", fontSize: hp(1.8) },
  helpText: { color: "#374151", marginTop: hp(0.5) },
  helpSub: { color: "#374151", fontWeight: "700" },
  helpExample: { width: wp(20), marginRight: wp(3), alignItems: "center" },
  helpExampleImage: { width: wp(20), height: wp(14), borderRadius: 8, backgroundColor: "#f3f4f6" },
  helpExampleLabel: { marginTop: hp(0.5), fontSize: hp(1.1), textAlign: "center" },
});
