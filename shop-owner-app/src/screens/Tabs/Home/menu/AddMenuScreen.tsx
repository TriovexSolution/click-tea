// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   TouchableOpacity,
//   FlatList,
//   Alert,
//   Image,
// } from "react-native";
// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useNavigation } from "@react-navigation/native";
// import { hp, wp } from "@/src/assets/utils/responsive";
// import theme from "@/src/assets/colors/theme";
// import { BASE_URL } from "@/api";
// import * as ImagePicker from "expo-image-picker";
// import CommonHeader2 from "@/src/Common/CommonHeader2";

// const AddMenuScreen = () => {
//   const [menuName, setMenuName] = useState("");
//   const [ingredients, setIngredients] = useState("");
//   const [price, setPrice] = useState("");
//   const [image, setImage] = useState(null);
//   const [menuItems, setMenuItems] = useState<string[]>([]);
//   const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
//   const [categories, setCategories] = useState<
//     { id: string; categoryName: string; categoryImage: string }[]
//   >([]);
//   const navigation = useNavigation();

//   const handlePickImage = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       quality: 0.7,
//     });

//     if (!result.canceled) {
//       setImage(result.assets[0]);
//     }
//   };

//   useEffect(() => {
//     (async () => {
//       const token = await AsyncStorage.getItem("authToken");
//       try {
//         const res = await axios.get(`${BASE_URL}/api/category/my-categories`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         // console.log(res.data);

//         setCategories(res.data);
//         if (res.data.length > 0) {
//           setSelectedCategoryId(res.data[0].id);
//         }
//       } catch (err) {
//         console.log("Error fetching categories", err);
//         Alert.alert("Error", "Unable to fetch categories");
//       }
//     })();
//   }, []);

//   const handleAddMenu = async () => {
//     if (!menuName.trim() || !price || !ingredients.trim()) {
//       Alert.alert("Validation", "Please fill all fields.");
//       return;
//     }

//     try {
//       const token = await AsyncStorage.getItem("authToken");
//       const formData = new FormData();

//       formData.append("menuName", menuName);
//       formData.append("categoryId", selectedCategoryId);
//       formData.append("price", price);
//       formData.append("ingredients", ingredients);
//       formData.append("isAvailable", "1");

//       if (image) {
//         formData.append("imageUrl", {
//           uri: image.uri,
//           name: `cat_${Date.now()}.jpg`,
//           type: "image/jpeg",
//         } as any);
//       }

//       await axios.post(`${BASE_URL}/api/menu/create`, formData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       setMenuItems((prev) => [...prev, menuName]);
//       setMenuName("");
//       setPrice("");
//       setIngredients("");
//       // setImage(null);

//       Alert.alert("Success", "Menu item added.");
//     } catch (err) {
//       console.log("Add menu failed", err);
//       Alert.alert("Error", "Failed to add menu item");
//     }
//   };

//   const completeSetup = async () => {
//     await AsyncStorage.setItem("isSetupComplete", "true");
//     navigation.reset({
//       index: 0,
//       routes: [{ name: "bottamTabScreen" }],
//     });
//   };

//   return (
//     <View style={styles.container}>
//       {/* <Text style={styles.heading}>Add Menu Items</Text> */}
// <CommonHeader2 title="Add Menu Items"/>
//       <Text style={styles.label}>Select Category:</Text>
//       <FlatList
//         data={categories}
//         horizontal
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={({ item }) => (
//         <TouchableOpacity
//   onPress={() => setSelectedCategoryId(item.id)}
//   style={[
//     styles.categoryCardCompact,
//     selectedCategoryId === item.id && styles.activeCategoryCard,
//   ]}
// >
//   <Image
//     source={{ uri: `${BASE_URL}/uploads/categories/${item.categoryImage}` }}
//     style={styles.categoryImageBackground}
//     resizeMode="cover"
//   />
//   <View style={styles.overlay}>
//     <Text style={styles.overlayText}>{item.categoryName}</Text>
//   </View>
// </TouchableOpacity>

//         )}
//         showsHorizontalScrollIndicator={false}
//         style={{ marginBottom: hp(2) }}
//       />

//       <TextInput
//         placeholder="Menu Item Name"
//         value={menuName}
//         onChangeText={setMenuName}
//         style={styles.input}
//       />

//       <TextInput
//         placeholder="Ingredients"
//         value={ingredients}
//         onChangeText={setIngredients}
//         style={styles.input}
//       />

//       <TextInput
//         placeholder="Price"
//         value={price}
//         onChangeText={setPrice}
//         keyboardType="numeric"
//         style={styles.input}
//       />

//       <TouchableOpacity
//         onPress={handlePickImage}
//         style={[styles.addBtn, { backgroundColor: "#aaa" }]}
//       >
//         <Text style={styles.btnText}>Pick Image</Text>
//       </TouchableOpacity>
// {image && (
//   <View style={styles.previewContainer}>
//     <Image source={{ uri: image.uri }} style={styles.previewImage} />
//   </View>
// )}

//       <TouchableOpacity onPress={handleAddMenu} style={styles.addBtn}>
//         <Text style={styles.btnText}>Add Menu</Text>
//       </TouchableOpacity>

//       <FlatList
//         data={menuItems}
//         keyExtractor={(item, index) => `${item}-${index}`}
//         renderItem={({ item }) => (
//           <View style={styles.menuItemWrapper}>
//             <Text style={styles.bullet}>•</Text>
//             <Text style={styles.menuItem}>{item}</Text>
//           </View>
//         )}
//       />

//       <TouchableOpacity onPress={completeSetup} style={styles.finishBtn}>
//         <Text style={styles.btnText}>Finish Setup</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// export default AddMenuScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     // padding: hp(2),
//     backgroundColor: "#fff",
//   },
//   heading: {
//     fontSize: hp(2.4),
//     fontWeight: "bold",
//     marginBottom: hp(2),
//   },
//   label: {
//     fontSize: hp(1.8),
//     marginBottom: hp(1),
//     color: "#444",
//     marginLeft:wp(5)
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     padding: hp(1.2),
//     borderRadius: theme.PRIMARY_BORDER_RADIUS,
//     marginBottom: hp(1.5),
//     marginHorizontal:wp(4)
//   },
//   categoryBtn: {
//     borderWidth: 1,
//     borderColor: "#999",
//     padding: hp(1),
//     borderRadius: 8,
//     marginRight: hp(1),
//       marginHorizontal:wp(4)
//   },
//   activeCategory: {
//     backgroundColor: theme.PRIMARY_COLOR,
//     borderColor: theme.PRIMARY_COLOR,
//   },
//   categoryText: {
//     color: "#333",
//   },
//   activeText: {
//     color: "#fff",
//     fontWeight: "bold",
//   },
//   addBtn: {
//     backgroundColor: theme.PRIMARY_COLOR,
//     padding: hp(1.5),
//     borderRadius: theme.PRIMARY_BORDER_RADIUS,
//     marginBottom: hp(2),
//       marginHorizontal:wp(4)
//   },
//   finishBtn: {
//     backgroundColor: theme.SECONDARY_COLOR,
//     padding: hp(1.5),
//     borderRadius: theme.PRIMARY_BORDER_RADIUS,
//     marginTop: hp(2),
//       marginHorizontal:wp(4)
//   },
//   btnText: {
//     textAlign: "center",
//     color: "#fff",
//     fontWeight: "bold",
//   },
//   menuItem: {
//     fontSize: hp(2),
//   },
//   menuItemWrapper: {
//    flexDirection: "row",
//   alignItems: "center",
//   justifyContent: "space-between",
//   padding: hp(1),
//   backgroundColor: "#fff",
//   borderRadius: 8,
//   elevation: 1,
//   marginBottom: hp(1),
//   },
//   bullet: {
//     fontSize: hp(2.2),
//     marginRight: hp(1),
//     color: theme.PRIMARY_COLOR,
//   },
//   categoryImage: {
//     height: hp(5),
//     width: wp(15),
//   },
//   categoryCard: {
//   width: wp(30),
//   marginRight: wp(3),
//   alignItems: "center",
//   borderRadius: 12,
//   padding: hp(1),
//   backgroundColor: "#f5f5f5",
//   shadowColor: "#000",
//   shadowOffset: { width: 0, height: 1 },
//   shadowOpacity: 0.2,
//   shadowRadius: 3,
//   elevation: 3,
// },
// categoryImageCard: {
//   width: wp(25),
//   height: wp(25),
//   borderRadius: 12,
//   marginBottom: hp(1),
// },
// categoryName: {
//   fontSize: hp(1.6),
//   fontWeight: "600",
//   textAlign: "center",
// },
// previewContainer: {
//   alignSelf: "center",
//   marginBottom: hp(2),
// },
// previewImage: {
//   width: wp(60),
//   height: wp(60),
//   borderRadius: 12,
//   borderWidth: 1, 
//   borderColor: "#ccc",
// },
// categoryCardCompact: {
//   width: wp(22),
//   height: wp(22),
//   borderRadius: 10,
//   overflow: "hidden",
//   marginRight: wp(3),
//   elevation: 3,
//   backgroundColor: "#eee",
//   marginLeft:wp(4)
// },

// activeCategoryCard: {
//   borderWidth: 2,
//   borderColor: theme.PRIMARY_COLOR,
// },

// categoryImageBackground: {
//   width: "100%",
//   height: "100%",
// },

// overlay: {
//   position: "absolute",
//   bottom: 0,
//   width: "100%",
//   backgroundColor: "rgba(0,0,0,0.4)",
//   paddingVertical: 4,
//   paddingHorizontal: 5,
// },

// overlayText: {
//   color: "#fff",
//   fontSize: hp(1.3),
//   fontWeight: "600",
//   textAlign: "center",
// },

  

// });
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Image,
  Modal,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { hp, wp } from "@/src/assets/utils/responsive";
import theme from "@/src/assets/colors/theme";
import { BASE_URL } from "@/api";
import * as ImagePicker from "expo-image-picker";
import CommonHeader2 from "@/src/Common/CommonHeader2";

const AddMenuScreen = () => {
  const [menuName, setMenuName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [menuItems, setMenuItems] = useState<string[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [categories, setCategories] = useState<
    { id: string; categoryName: string; categoryImage: string }[]
  >([]);
  const navigation = useNavigation();

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("authToken");
      try {
        const res = await axios.get(`${BASE_URL}/api/category/my-categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(res.data);
        if (res.data.length > 0) {
          setSelectedCategoryId(res.data[0].id);
        }
      } catch (err) {
        console.log("Error fetching categories", err);
        Alert.alert("Error", "Unable to fetch categories");
      }
    })();
  }, []);

  const handleAddMenu = async () => {
    if (!menuName.trim() || !price || !ingredients.trim()) {
      Alert.alert("Validation", "Please fill all fields.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("authToken");
      const formData = new FormData();

      formData.append("menuName", menuName);
      formData.append("categoryId", selectedCategoryId);
      formData.append("price", price);
      formData.append("ingredients", ingredients);
      formData.append("isAvailable", "1");

      if (image) {
        formData.append("imageUrl", {
          uri: image.uri,
          name: `menu_${Date.now()}.jpg`,
          type: "image/jpeg",
        } as any);
      }

      await axios.post(`${BASE_URL}/api/menu/create`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMenuItems((prev) => [...prev, menuName]);
      setMenuName("");
      setPrice("");
      setIngredients("");
      setImage(null);

      Alert.alert("Success", "Menu item added.");
    } catch (err) {
      console.log("Add menu failed", err);
      Alert.alert("Error", "Failed to add menu item");
    }
  };
const completeSetup = async () => {
  await AsyncStorage.setItem("isSetupComplete", "true");
  await AsyncStorage.setItem("setupStep", "complete"); // ✅ Add this too
  navigation.reset({
    index: 0,
    routes: [{ name: "bottamTabScreen" }],
  });
};

  return (
    <View style={styles.container}>
      <CommonHeader2 title="Add Menu Items" />

      <Text style={styles.label}>Select Category:</Text>
      <FlatList
        data={categories}
        horizontal
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedCategoryId(item.id)}
            style={[
              styles.categoryCardCompact,
              selectedCategoryId === item.id && styles.activeCategoryCard,
            ]}
          >
            <Image
              source={{ uri: `${BASE_URL}/uploads/categories/${item.categoryImage}` }}
              style={styles.categoryImageBackground}
              resizeMode="cover"
            />
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>{item.categoryName}</Text>
            </View>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: hp(2) }}
      />

      <TextInput
        placeholder="Menu Item Name"
        value={menuName}
        onChangeText={setMenuName}
        style={styles.input}
      />

      <TextInput
        placeholder="Ingredients"
        value={ingredients}
        onChangeText={setIngredients}
        style={styles.input}
      />

      <TextInput
        placeholder="Price"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        style={styles.input}
      />

      <TouchableOpacity onPress={handlePickImage} style={styles.imageBox}>
        {image ? (
          <TouchableOpacity onPress={() => setImageModalVisible(true)}>
            <Image source={{ uri: image.uri }} style={styles.imagePreview} />
          </TouchableOpacity>
        ) : (
          <Text>📷 Pick Menu Image</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleAddMenu} style={styles.addBtn}>
        <Text style={styles.btnText}>➕ Add Menu</Text>
      </TouchableOpacity>

      <FlatList
        data={menuItems}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.menuItemWrapper}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.menuItem}>{item}</Text>
          </View>
        )}
      />

      <TouchableOpacity onPress={completeSetup} style={styles.finishBtn}>
        <Text style={styles.btnText}>Finish Setup</Text>
      </TouchableOpacity>

      {/* Simple modal preview like AddCategoryScreen */}
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

export default AddMenuScreen;
const styles = StyleSheet.create({
  container: {
  flex: 1,
  backgroundColor: "white",
},
label: {
  fontSize: hp(1.8),
  marginBottom: hp(1),
  color: "#444",
  marginLeft: wp(5),
},
input: {
  borderWidth: 1,
  borderColor: "#ccc",
  backgroundColor: "#fff",
  padding: hp(1.2),
  borderRadius: theme.PRIMARY_BORDER_RADIUS,
  marginBottom: hp(1.5),
  marginHorizontal: wp(4),
  fontSize: hp(1.9),
  elevation: 1,
},
addBtn: {
  backgroundColor: theme.PRIMARY_COLOR,
  padding: hp(1.5),
  borderRadius: theme.PRIMARY_BORDER_RADIUS,
  marginBottom: hp(2),
  marginHorizontal: wp(4),
  elevation: 2,
},
finishBtn: {
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
menuItemWrapper: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#fff",
  borderRadius: 12,
  padding: hp(1.2),
  marginHorizontal: wp(4),
  marginBottom: hp(1),
  elevation: 1,
},
bullet: {
  fontSize: hp(2.2),
  color: theme.PRIMARY_COLOR,
  marginRight: wp(2),
},
menuItem: {
  fontSize: hp(2),
  flex: 1,
},
categoryCardCompact: {
  width: wp(22),
  height: wp(22),
  borderRadius: 10,
  overflow: "hidden",
  marginRight: wp(3),
  elevation: 3,
  backgroundColor: "#eee",
  marginLeft: wp(4),
},
activeCategoryCard: {
  borderWidth: 2,
  borderColor: theme.PRIMARY_COLOR,
},
categoryImageBackground: {
  width: "100%",
  height: "100%",
},
overlay: {
  position: "absolute",
  bottom: 0,
  width: "100%",
  backgroundColor: "rgba(0,0,0,0.4)",
  paddingVertical: 4,
  paddingHorizontal: 5,
},
overlayText: {
  color: "#fff",
  fontSize: hp(1.3),
  fontWeight: "600",
  textAlign: "center",
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

})