// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   FlatList,
//   Image,
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import { hp, wp } from "@/src/assets/utils/responsive";
// import theme from "@/src/assets/colors/theme";
// import axios from "axios";
// import { BASE_URL } from "@/api";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as ImagePicker from "expo-image-picker";
// import CommonHeader2 from "@/src/Common/CommonHeader2";

// const AddCategoryScreen = () => {
//   const [categoryName, setCategoryName] = useState("");
//   const [categories, setCategories] = useState<string[]>([]);
//   const [image, setImage] = useState(null);
//   const navigation = useNavigation();

//   const handlePickImage = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       quality: 1,
//     });

//     if (!result.canceled) {
//       setImage(result.assets[0]);
//     }
//   };

//   const handleAddCategory = async () => {
//     if (!categoryName.trim()) {
//       Alert.alert("Validation", "Category name cannot be empty.");
//       return;
//     }

//     try {
//       const token = await AsyncStorage.getItem("authToken");
//       const formData = new FormData();

//       formData.append("categoryName", categoryName);

//       if (image) {
//         formData.append("categoryImage", {
//           uri: image.uri,
//           name: `cat_${Date.now()}.jpg`,
//           type: "image/jpeg",
//         } as any);
//       }

//       const res = await axios.post(`${BASE_URL}/api/category/create`, formData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "multipart/form-data",
//         },
//       });
// // console.log(res.data);

//       setCategories(prev => [...prev, categoryName]);
//       setCategoryName("");
//       setImage(null);

//     } catch (err) {
//       console.log("❌ Add category failed", err.response?.data || err.message);
//       Alert.alert("Error", err.response?.data?.message || "Failed to add category");
//     }
//   };

//   const goNext = () => {
//     // if (categories.length === 0) {
//     //   Alert.alert("Add at least one category before continuing.");
//     //   return;
//     // }
//     navigation.navigate("addMenuScreen");
//   };

//   return (
//     <View style={styles.container}>
//       {/* <Text style={styles.title}>Add Categories</Text> */}
// <CommonHeader2 title="Add Categories"/>
//       <TextInput
//         placeholder="Enter Category Name"
//         value={categoryName}
//         onChangeText={setCategoryName}
//         style={styles.input}
//       />

//       <TouchableOpacity onPress={handlePickImage} style={styles.imageBox}>
//         {image ? (
//           <Image source={{ uri: image.uri }} style={styles.imagePreview} resizeMode="contain"/>
//         ) : (
//           <Text>📷 Pick Category Image</Text>
//         )}
//       </TouchableOpacity>

//       <TouchableOpacity onPress={handleAddCategory} style={styles.addBtn}>
//         <Text style={styles.btnText}>➕ Add Category</Text>
//       </TouchableOpacity>

//       <FlatList
//         data={categories}
//         keyExtractor={(item, index) => index.toString()}
//         renderItem={({ item }) => <Text style={styles.categoryItem}>• {item}</Text>}
//       />

//       <TouchableOpacity onPress={goNext} style={styles.nextBtn}>
//         <Text style={styles.btnText}>Next → Add Menu</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// export default AddCategoryScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     // padding: hp(2),
//     backgroundColor: "#fff",
//   },
//   title: {
//     fontSize: hp(2.4),
//     fontWeight: "bold",
//     marginBottom: hp(2),
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     padding: hp(1.2),
//     borderRadius: theme.PRIMARY_BORDER_RADIUS,
//     marginBottom: hp(1.5),
//     marginHorizontal:wp(4)
//   },
//   imageBox: {
//     // borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: theme.PRIMARY_BORDER_RADIUS,
//     // height: 150,
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: hp(1.5),
//     // backgroundColor:"red"
//   },
//   imagePreview: {
//     width:wp(50),
//     height: hp(23),
//     borderRadius: 20,
//     alignSelf:"flex-start"
//   },
//   addBtn: {
//     backgroundColor: theme.PRIMARY_COLOR,
//     padding: hp(1.5),
//     borderRadius: theme.PRIMARY_BORDER_RADIUS,
//     marginBottom: hp(2),
//     marginHorizontal:wp(4)
//   },
//   nextBtn: {
//     backgroundColor: theme.SECONDARY_COLOR,
//     padding: hp(1.5),
//     borderRadius: theme.PRIMARY_BORDER_RADIUS,
//     marginTop: hp(4),
//         marginHorizontal:wp(4)
//   },
//   btnText: {
//     textAlign: "center",
//     color: "#fff",
//     fontWeight: "bold",
//     marginHorizontal:wp(4)
//   },
//   categoryItem: {
//     fontSize: hp(2),
//     paddingVertical: hp(0.5),
//   },
// });
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  Image,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { hp, wp } from "@/src/assets/utils/responsive";
import theme from "@/src/assets/colors/theme";
import axios from "axios";
import { BASE_URL } from "@/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import CommonHeader2 from "@/src/Common/CommonHeader2";

const AddCategoryScreen = () => {
  const [categoryName, setCategoryName] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [image, setImage] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const navigation = useNavigation();
  const flatListRef = useRef(null);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleAddCategory = async () => {
    if (!categoryName.trim()) {
      Alert.alert("Validation", "Category name cannot be empty.");
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      const formData = new FormData();

      formData.append("categoryName", categoryName);
      if (image) {
        formData.append("categoryImage", {
          uri: image.uri,
          name: `cat_${Date.now()}.jpg`,
          type: "image/jpeg",
        } as any);
      }

      const res = await axios.post(`${BASE_URL}/api/category/create`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const newCategory = {
        name: categoryName,
        image: image?.uri || null,
      };

      setCategories(prev => [...prev, newCategory]);
      setCategoryName("");
      setImage(null);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 300);
    } catch (err) {
      console.log("❌ Add category failed", err.response?.data || err.message);
      Alert.alert("Error", err.response?.data?.message || "Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = (index: number) => {
    Alert.alert("Confirm", "Delete this category?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setCategories(prev => prev.filter((_, i) => i !== index));
        },
      },
    ]);
  };

  const goNext = () => {
    navigation.navigate("addMenuScreen");
  };

  return (
    <View style={styles.container}>
      <CommonHeader2 title="Add Categories" />

      <TextInput
        placeholder="Enter Category Name"
        value={categoryName}
        onChangeText={setCategoryName}
        style={styles.input}
      />

      <TouchableOpacity onPress={handlePickImage} style={styles.imageBox}>
        {image ? (
          <TouchableOpacity onPress={() => setImageModalVisible(true)}>
            <Image source={{ uri: image.uri }} style={styles.imagePreview} />
          </TouchableOpacity>
        ) : (
          <Text>📷 Pick Category Image</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleAddCategory} style={styles.addBtn} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>➕ Add Category</Text>
        )}
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={categories}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.categoryItem}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.categoryImage} />
            ) : (
              <View style={styles.categoryImagePlaceholder}>
                <Text>📁</Text>
              </View>
            )}
            <Text style={styles.categoryText}>{item.name}</Text>
            <TouchableOpacity onPress={() => handleDeleteCategory(index)}>
              <Text style={styles.deleteText}>✖</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity onPress={goNext} style={styles.nextBtn}>
        <Text style={styles.btnText}>Next → Add Menu</Text>
      </TouchableOpacity>

      {/* Simple Modal Preview without zoom */}
      <Modal visible={imageModalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalBackground}
            onPress={() => setImageModalVisible(false)}
          >
            <Image source={{ uri: image?.uri }} style={styles.modalImage} resizeMode="contain" />
            <TouchableOpacity
              onPress={() => setImageModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close ✖</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default AddCategoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#fff",
    padding: hp(1.2),
    borderRadius: theme.PRIMARY_BORDER_RADIUS,
    marginBottom: hp(1.5),
    marginHorizontal: wp(4),
    fontSize: hp(1.9),
    elevation: 1,
  },
  imageBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D1D1D1",
    backgroundColor: "#fff",
    padding: hp(1.5),
    marginHorizontal: wp(4),
    marginBottom: hp(2),
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  imagePreview: {
    width: wp(80),
    height: hp(20),
    borderRadius: 12,
  },
  addBtn: {
    backgroundColor: theme.PRIMARY_COLOR,
    padding: hp(1.5),
    borderRadius: theme.PRIMARY_BORDER_RADIUS,
    marginBottom: hp(1.5),
    marginHorizontal: wp(4),
    elevation: 2,
  },
  nextBtn: {
    backgroundColor: theme.SECONDARY_COLOR,
    padding: hp(1.5),
    borderRadius: theme.PRIMARY_BORDER_RADIUS,
    marginTop: hp(2),
    marginHorizontal: wp(4),
    elevation: 2,
  },
  btnText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "bold",
    fontSize: hp(2),
  },
  categoryItem: {
    backgroundColor: "#fff",
    marginHorizontal: wp(4),
    marginVertical: hp(1),
    padding: hp(1),
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
  },
  categoryText: {
    fontSize: hp(2),
    color: "#333",
    flex: 1,
    marginLeft: wp(2),
  },
  categoryImage: {
    width: wp(15),
    height: wp(15),
    borderRadius: 8,
  },
  categoryImagePlaceholder: {
    width: wp(15),
    height: wp(15),
    borderRadius: 8,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteText: {
    fontSize: hp(2),
    color: "red",
    paddingHorizontal: wp(2),
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: wp(100),
    height: hp(100),
  },
  modalImage: {
    width: wp(90),
    height: hp(60),
  },
  closeButton: {
    marginTop: hp(2),
    backgroundColor: "#fff",
    paddingVertical: hp(1),
    paddingHorizontal: wp(6),
    borderRadius: 10,
    elevation: 4,
  },
  closeButtonText: {
    color: "#333",
    fontWeight: "bold",
    fontSize: hp(2),
  },
});
