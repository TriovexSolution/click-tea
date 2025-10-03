// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   TextInput,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   Switch,
// } from "react-native";
// import { useForm, Controller } from "react-hook-form";
// import MapView, { Marker } from "react-native-maps";
// import * as Location from "expo-location";
// import axios from "axios";
// import { BASE_URL } from "@/api"; // Update with your actual path
// import * as ImagePicker from "expo-image-picker";
// import { Image } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// type FormData = {
//   shopName: string;
//   shopDescription: string;
//   shopAddress: string;
//   buildingName: string;
//   phone: string;
//   email: string;
//   is_open: boolean;
// };

// const EnterShopDetailScreen = () => {
//   const {
//     control,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<FormData>({
//     defaultValues: {
//       shopName: "",
//       shopDescription: "",
//       shopAddress: "",
//       buildingName: "",
//       phone: "",
//       email: "",
//       is_open: true,
//     },
//   });

//   const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(null);
//   const [region, setRegion] = useState(null);
// const [image, setImage] = useState(null);
//   useEffect(() => {
//     (async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") {
//         Alert.alert("Permission denied", "Location permission is required");
//         return;
//       }

//       const loc = await Location.getCurrentPositionAsync({});
//       // console.log(loc,"loction");
      
//       setRegion({
//         latitude: loc.coords.latitude,
//         longitude: loc.coords.longitude,
//         latitudeDelta: 0.01,
//         longitudeDelta: 0.01,
//       });
//       setMarker({
//         latitude: loc.coords.latitude,
//         longitude: loc.coords.longitude,
//       });
//     })();
//   }, []);
// const pickImage = async () => {
//   const result = await ImagePicker.launchImageLibraryAsync({
//     mediaTypes: ImagePicker.MediaTypeOptions.Images,
//     allowsEditing: true,
//     quality: 1,
//   });

//   if (!result.canceled) {
//     const file = result.assets[0];
//     setImage(file);
//   }
// };
//   // const onSubmit = async (data: FormData) => {
//   //   if (!marker) {
//   //     Alert.alert("Location Required", "Please select a location on the map");
//   //     return;
//   //   }

//   //   const payload = {
//   //     shopname: data.shopName,
//   //     shopDescription: data.shopDescription,
//   //     shopAddress: data.shopAddress,
//   //     building_name: data.buildingName,
//   //     latitude: marker.latitude,
//   //     longitude: marker.longitude,
//   //     phone: data.phone,
//   //     email: data.email,
//   //     country_code: "+91",
//   //     is_open: data.is_open ? 1 : 0,
//   //   };

//   //   try {
//   //     const token = "your-auth-token"; // replace with real auth token
//   //     const response = await axios.post(`${BASE_URL}/api/shops`, payload, {
//   //       headers: {
//   //         Authorization: `Bearer ${token}`,
//   //       },
//   //     });

//   //     if (response.status === 201) {
//   //       Alert.alert("Success", "Shop created successfully");
//   //       // Navigate to next screen if needed
//   //     }
//   //   } catch (err) {
//   //     console.error("Create shop error:", err);
//   //     Alert.alert("Error", err?.response?.data?.message || "Something went wrong");
//   //   }
//   // };

// const onSubmit = async (data: FormData) => {
//     const token = await AsyncStorage.getItem("authToken");
//       if (!token) {
//     Alert.alert("Authentication error", "Please sign in again");
//     return;
//   }
//   if (!marker) {
//     Alert.alert("Select location first");
//     return;
//   }

//   const formData = new FormData();

//   formData.append("shopname", data.shopName);
//   formData.append("shopDescription", data.shopDescription);
//   formData.append("shopAddress", data.shopAddress);
//   formData.append("building_name", data.buildingName);
//   formData.append("latitude", marker.latitude.toString());
//   formData.append("longitude", marker.longitude.toString());
//   formData.append("phone", data.phone);
//   formData.append("email", data.email);
//   formData.append("country_code", "+91");
//   formData.append("is_open", data.is_open ? "1" : "0");

//   if (image) {
//     const file = {
//       uri: image.uri,
//       type: "image/jpeg",
//       name: `shop_${Date.now()}.jpg`,
//     };
//     formData.append("shopImage", file as any);
//   }

//   try {
//     const token = "your-auth-token"; // from login
//     const response = await axios.post(`${BASE_URL}/api/shops/create`, formData, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     if (response.status === 201) {
//       Alert.alert("Shop created successfully!");
//       // Navigate next
//     }
//   } catch (err) {
//     console.log("❌ Create shop error:", err.response?.data || err.message);
//     Alert.alert("Error", err?.response?.data?.message || "Something went wrong");
//   }
// };
//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.title}>Enter Shop Details</Text>

//       {/* Shop Name */}
//       <Controller
//         control={control}
//         name="shopName"
//         rules={{ required: "Shop name is required" }}
//         render={({ field: { onChange, value } }) => (
//           <TextInput style={styles.input} placeholder="Shop Name" value={value} onChangeText={onChange} />
//         )}
//       />
//       {errors.shopName && <Text style={styles.error}>{errors.shopName.message}</Text>}

// {/*Shop Image*/}
// <Text style={styles.label}>Shop Image</Text>
// <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
//   {image ? (
//     <Image source={{ uri: image.uri }} style={styles.imagePreview} />
//   ) : (
//     <Text>Select Image</Text>
//   )}
// </TouchableOpacity>

//       {/* Shop Description */}
//       <Controller
//         control={control}
//         name="shopDescription"
//         render={({ field: { onChange, value } }) => (
//           <TextInput
//             style={[styles.input, { height: 80 }]}
//             placeholder="Shop Description"
//             value={value}
//             onChangeText={onChange}
//             multiline
//           />
//         )}
//       />

//       {/* Shop Address */}
//       <Controller
//         control={control}
//         name="shopAddress"
//         render={({ field: { onChange, value } }) => (
//           <TextInput style={styles.input} placeholder="Shop Address" value={value} onChangeText={onChange} />
//         )}
//       />

//       {/* Building Name */}
//       <Controller
//         control={control}
//         name="buildingName"
//         render={({ field: { onChange, value } }) => (
//           <TextInput style={styles.input} placeholder="Building Name" value={value} onChangeText={onChange} />
//         )}
//       />

//       {/* Phone */}
//       <Controller
//         control={control}
//         name="phone"
//         rules={{ required: "Phone number is required" }}
//         render={({ field: { onChange, value } }) => (
//           <TextInput
//             style={styles.input}
//             placeholder="Phone Number"
//             keyboardType="phone-pad"
//             value={value}
//             onChangeText={onChange}
//           />
//         )}
//       />
//       {errors.phone && <Text style={styles.error}>{errors.phone.message}</Text>}

//       {/* Email */}
//       <Controller
//         control={control}
//         name="email"
//         rules={{ required: "Email is required" }}
//         render={({ field: { onChange, value } }) => (
//           <TextInput style={styles.input} placeholder="Email Address" keyboardType="email-address" value={value} onChangeText={onChange} />
//         )}
//       />
//       {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

//       {/* is_open */}
//       <View style={styles.switchRow}>
//         <Text style={styles.label}>Is Shop Open?</Text>
//         <Controller
//           control={control}
//           name="is_open"
//           render={({ field: { value, onChange } }) => (
//             <Switch value={value} onValueChange={onChange} />
//           )}
//         />
//       </View>

//       {/* Google Map */}
//       <Text style={styles.label}>Select Location:</Text>
//       {region && (
//         <MapView
//           style={styles.map}
//           region={region}
//           onPress={(e) => setMarker(e.nativeEvent.coordinate)}
//         >
//           {marker && <Marker coordinate={marker} />}
//         </MapView>
//       )}

//       {marker && (
//         <Text style={styles.coords}>
//           📍 Lat: {marker.latitude.toFixed(6)}, Lng: {marker.longitude.toFixed(6)}
//         </Text>
//       )}

//       {/* Submit Button */}
//       <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit(onSubmit)}>
//         <Text style={styles.submitText}>Create Shop</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 16, backgroundColor: "#fff" },
//   title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 12,
//   },
//   label: {
//     fontSize: 16,
//     marginBottom: 8,
//   },
//   error: {
//     color: "red",
//     fontSize: 12,
//     marginBottom: 8,
//   },
//   switchRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 16,
//   },
//   map: {
//     height: 200,
//     borderRadius: 10,
//     marginBottom: 12,
//   },
//   coords: {
//     marginBottom: 16,
//     fontStyle: "italic",
//   },
//   submitBtn: {
//     backgroundColor: "#007AFF",
//     padding: 14,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 16,
//     marginBottom: 40,
//   },
//   submitText: {
//     color: "#fff",
//     fontWeight: "bold",
//   },
//   imageBox: {
//   height: 150,
//   borderWidth: 1,
//   borderColor: "#ccc",
//   borderRadius: 10,
//   justifyContent: "center",
//   alignItems: "center",
//   marginBottom: 12,
// },
// imagePreview: {
//   width: "100%",
//   height: "100%",
//   borderRadius: 10,
// },

// });

// // export default EnterShopDetailScreen;
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   TextInput,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   Switch,
//   Modal,
//   ActivityIndicator,
//   Image,
// } from "react-native";
// import { useForm, Controller } from "react-hook-form";
// import MapView, { Marker } from "react-native-maps";
// import * as Location from "expo-location";
// import axios from "axios";
// import { BASE_URL } from "@/api";
// import * as ImagePicker from "expo-image-picker";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons } from "@expo/vector-icons";
// import { ParamListBase, useNavigation } from "@react-navigation/native";
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import axiosClient from "@/src/assets/api/client";

// const EnterShopDetailScreen = () => {
//   const {
//     control,
//     handleSubmit,
//     setValue,
//     formState: { errors },
//   } = useForm({
//     defaultValues: {
//       shopName: "",
//       shopDescription: "",
//       shopAddress: "",
//       buildingName: "",
//       phone: "",
//       email: "",
//       is_open: true,
//     },
//   });

//   const [marker, setMarker] = useState(null);
//   const [region, setRegion] = useState(null);
//   const [image, setImage] = useState(null);
//   const [mapVisible, setMapVisible] = useState(false);
//   const [loading, setLoading] = useState(false);
// const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>()
//   useEffect(() => {
//     const loadLocation = async () => {
//       const lat = await AsyncStorage.getItem("shop_lat");
//       const lng = await AsyncStorage.getItem("shop_lng");
// // console.log(lat);

//       if (lat && lng) {
//         const latitude = parseFloat(lat);
//         const longitude = parseFloat(lng);
//         const coords = { latitude, longitude };

//         setMarker(coords);
//         setRegion({
//           ...coords,
//           latitudeDelta: 0.01,
//           longitudeDelta: 0.01,
//         });
//       } else {
//         const loc = await Location.getCurrentPositionAsync({});
//         setRegion({
//           latitude: loc.coords.latitude,
//           longitude: loc.coords.longitude,
//           latitudeDelta: 0.01,
//           longitudeDelta: 0.01,
//         });
//       }
//     };

//     loadLocation();
//   }, []);

//   const pickImage = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       quality: 1,
//     });

//     if (!result.canceled) {
//       const file = result.assets[0];
//       setImage(file);
//     }
//   };

//   const centerToCurrentLocation = async () => {
//     const loc = await Location.getCurrentPositionAsync({});
//     setRegion({
//       latitude: loc.coords.latitude,
//       longitude: loc.coords.longitude,
//       latitudeDelta: 0.01,
//       longitudeDelta: 0.01,
//     });
//   };

// const onSubmit = async (data) => {
//   if (!marker) return Alert.alert("Location Missing", "Please select a location");

//   try {
//     const userId = await AsyncStorage.getItem("userId");
//     if (!userId) {
//       throw new Error("User ID not found in storage");
//     }

//     const formData = new FormData();
//     formData.append("shopname", data.shopName);
//     formData.append("shopDescription", data.shopDescription);
//     formData.append("shopAddress", data.shopAddress);
//     formData.append("building_name", data.buildingName || "");
//     formData.append("latitude", marker.latitude.toString());
//     formData.append("longitude", marker.longitude.toString());
//     formData.append("phone", data.phone);
//     formData.append("email", data.email);
//     formData.append("country_code", "+91");
//     formData.append("is_open", data.is_open ? "1" : "0");
//     formData.append("owner_id", userId); // Add owner_id

//     if (image) {
//       formData.append("shopImage", {
//         uri: image.uri,
//         type: "image/jpeg",
//         name: `shop_${Date.now()}.jpg`,
//       });
//     }

//     const response = await axiosClient.post("/api/shops/create", formData, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//         Accept: "application/json",
//       },
//     });

//     if (response.status === 201) {
//       const { shop_id } = response.data;
//       if (!shop_id) {
//         throw new Error("Shop ID not returned from server");
//       }

//       await AsyncStorage.multiRemove(["shop_lat", "shop_lng"]);
//       await AsyncStorage.setItem("shop_id", shop_id.toString());
//       await AsyncStorage.setItem("setupStep", "shopCreated");
//       await AsyncStorage.setItem("shopDetailsAdded", "true");
//       setShopId(Number(shop_id)); // Update AuthContext

//       navigation.replace("bottamTabScreen");
//     }
//   } catch (err: any) {
//     console.error("Shop creation error:", {
//       message: err.message,
//       response: err.response?.data,
//       status: err.response?.status,
//       request: err.request,
//     });
//     const errorMessage = err.response?.data?.message || "Failed to create shop. Please check your network and try again.";
//     Alert.alert("Error", errorMessage);
//   }
// };


//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.title}>Enter Shop Details</Text>

//       <Controller
//         control={control}
//         name="shopName"
//         rules={{ required: "Shop name is required" }}
//         render={({ field: { onChange, value } }) => (
//           <TextInput style={styles.input} placeholder="Shop Name" value={value} onChangeText={onChange} />
//         )}
//       />
//       {errors.shopName && <Text style={styles.error}>{errors.shopName.message}</Text>}

//       <Text style={styles.label}>Shop Image</Text>
//       <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
//         {image ? (
//           <Image source={{ uri: image.uri }} style={styles.imagePreview} />
//         ) : (
//           <Text>Select Image</Text>
//         )}
//       </TouchableOpacity>

//       <Controller
//         control={control}
//         name="shopDescription"
//         render={({ field: { onChange, value } }) => (
//           <TextInput
//             style={[styles.input, { height: 80 }]}
//             placeholder="Description"
//             value={value}
//             onChangeText={onChange}
//             multiline
//           />
//         )}
//       />

//       <Controller
//         control={control}
//         name="buildingName"
//         render={({ field: { onChange, value } }) => (
//           <TextInput style={styles.input} placeholder="Building Name" value={value} onChangeText={onChange} />
//         )}
//       />
//       <Controller
//         control={control}
//         name="shopAddress"
//         render={({ field: { onChange, value } }) => (
//           <TextInput style={styles.input} placeholder="Address" value={value} onChangeText={onChange} />
//         )}
//       />

//       <Controller
//         control={control}
//         name="phone"
//         rules={{ required: "Phone number is required" }}
//         render={({ field: { onChange, value } }) => (
//           <TextInput style={styles.input} placeholder="Phone" keyboardType="phone-pad" value={value} onChangeText={onChange} />
//         )}
//       />
//       {errors.phone && <Text style={styles.error}>{errors.phone.message}</Text>}

//       <Controller
//         control={control}
//         name="email"
//         rules={{ required: "Email is required" }}
//         render={({ field: { onChange, value } }) => (
//           <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" value={value} onChangeText={onChange} />
//         )}
//       />
//       {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

//       <View style={styles.switchRow}>
//         <Text style={styles.label}>Is Shop Open?</Text>
//         <Controller
//           control={control}
//           name="is_open"
//           render={({ field: { value, onChange } }) => <Switch value={value} onValueChange={onChange} />}
//         />
//       </View>

//       {region && (
//         <View style={{ height: 150, borderRadius: 10, overflow: "hidden", marginBottom: 8 }}>
//           <MapView style={{ flex: 1 }} region={region} pointerEvents="none">
//             {marker && <Marker coordinate={marker} />}
//           </MapView>
//           <TouchableOpacity
//             onPress={() => setMapVisible(true)}
//             style={{ position: "absolute", bottom: 10, right: 10, backgroundColor: "#fff", padding: 8, borderRadius: 8 }}
//           >
//             <Text>📍 Expand</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit(onSubmit)} disabled={loading}>
//         <Text style={styles.submitText}>{loading ? "Submitting..." : "Create Shop"}</Text>
//       </TouchableOpacity>

//       <Modal visible={mapVisible} animationType="slide">
//         <View style={{ flex: 1 }}>
//           {region && (
//             <MapView
//               style={{ flex: 1 }}
//               region={region}
//               onPress={(e) => {
//                 const coord = e.nativeEvent.coordinate;
//                 setMarker(coord);
//                 setMapVisible(false);
//               }}
//             >
//               {marker && <Marker coordinate={marker} />}
//             </MapView>
//           )}

//           <TouchableOpacity onPress={() => setMapVisible(false)} style={styles.closeIcon}>
//             <Ionicons name="close" size={28} color="#000" />
//           </TouchableOpacity>

//           <TouchableOpacity onPress={centerToCurrentLocation} style={styles.gpsIcon}>
//             <Ionicons name="navigate" size={24} color="#007AFF" />
//           </TouchableOpacity>

//           {loading && (
//             <View style={styles.loadingOverlay}>
//               <ActivityIndicator size="large" color="#007AFF" />
//             </View>
//           )}
//         </View>
//       </Modal>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 16, backgroundColor: "#fff" },
//   title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
//   input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 12 },
//   label: { fontSize: 16, marginBottom: 8 },
//   error: { color: "red", fontSize: 12, marginBottom: 8 },
//   switchRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
//   submitBtn: { backgroundColor: "#007AFF", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 16, marginBottom: 40 },
//   submitText: { color: "#fff", fontWeight: "bold" },
//   imageBox: { height: 150, borderWidth: 1, borderColor: "#ccc", borderRadius: 10, justifyContent: "center", alignItems: "center", marginBottom: 12 },
//   imagePreview: { width: "100%", height: "100%", borderRadius: 10 },
//   coords: { marginBottom: 16, fontStyle: "italic" },
//   closeIcon: { position: "absolute", top: 40, right: 20, backgroundColor: "#fff", padding: 8, borderRadius: 20, elevation: 4 },
//   gpsIcon: { position: "absolute", bottom: 40, right: 20, backgroundColor: "#fff", padding: 10, borderRadius: 30, elevation: 4 },
//   loadingOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(255,255,255,0.6)", justifyContent: "center", alignItems: "center" },
// });

// export default EnterShopDetailScreen; 1 oct code working code 
// EnterShopDetailScreen.js
// import React, { useEffect, useRef, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   TextInput,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   Switch,
//   Modal,
//   ActivityIndicator,
//   Image,
//   Dimensions,
//   Animated,
//   KeyboardAvoidingView,
//   Platform,
// } from "react-native";
// import { useForm, Controller } from "react-hook-form";
// import MapView, { Marker } from "react-native-maps";
// import * as Location from "expo-location";
// import * as ImagePicker from "expo-image-picker";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons } from "@expo/vector-icons";
// import { useNavigation } from "@react-navigation/native";
// import axiosClient from "@/src/assets/api/client";

// const { width: SCREEN_WIDTH } = Dimensions.get("window");

// const EnterShopDetailScreen = () => {
//   const navigation = useNavigation();

//   // react-hook-form
//   const {
//     control,
//     handleSubmit,
//     trigger,
//     formState: { errors },
//     getValues,
//   } = useForm({
//     defaultValues: {
//       shopName: "",
//       shopDescription: "",
//       shopAddress: "",
//       buildingName: "",
//       phone: "",
//       email: "",
//       is_open: true,
//     },
//   });

//   // Steps
//   const [step, setStep] = useState(0); // 0,1,2
//   const TOTAL_STEPS = 3;

//   // map & marker
//   const [region, setRegion] = useState(null);
//   const [marker, setMarker] = useState(null);
//   const [mapVisible, setMapVisible] = useState(false);

//   // image
//   const [image, setImage] = useState(null);

//   // loading
//   const [loading, setLoading] = useState(false);

//   // animation
//   const translateX = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     Animated.spring(translateX, {
//       toValue: -step * SCREEN_WIDTH,
//       useNativeDriver: true,
//       speed: 20,
//       bounciness: 6,
//     }).start();
//   }, [step, translateX]);

//   // try to load saved lat/lng or device location
//   useEffect(() => {
//     (async () => {
//       try {
//         const lat = await AsyncStorage.getItem("shop_lat");
//         const lng = await AsyncStorage.getItem("shop_lng");
//         if (lat && lng) {
//           const latitude = parseFloat(lat);
//           const longitude = parseFloat(lng);
//           const coords = { latitude, longitude };
//           setMarker(coords);
//           setRegion({ ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 });
//         } else {
//           const loc = await Location.getCurrentPositionAsync({});
//           setRegion({
//             latitude: loc.coords.latitude,
//             longitude: loc.coords.longitude,
//             latitudeDelta: 0.01,
//             longitudeDelta: 0.01,
//           });
//         }
//       } catch (e) {
//         console.warn("Location error:", e);
//       }
//     })();
//   }, []);

//   const pickImage = async () => {
//     try {
//       const res = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: true,
//         quality: 0.8,
//       });
//       if (!res.canceled) {
//         setImage(res.assets[0]);
//       }
//     } catch (e) {
//       console.warn("ImagePicker error", e);
//     }
//   };

//   const centerToCurrentLocation = async () => {
//     try {
//       const loc = await Location.getCurrentPositionAsync({});
//       setRegion({
//         latitude: loc.coords.latitude,
//         longitude: loc.coords.longitude,
//         latitudeDelta: 0.01,
//         longitudeDelta: 0.01,
//       });
//     } catch (e) {
//       console.warn("Center location error", e);
//     }
//   };

//   // fields per step (for validation)
//   const stepFields = [
//     ["shopName", "phone", "email"], // step 0: basic
//     ["shopAddress", "buildingName", "shopDescription"], // step 1: location
//     [], // step 2: media/status (no required fields)
//   ];

//   const onNext = async () => {
//     const fields = stepFields[step] || [];
//     if (fields.length > 0) {
//       const valid = await trigger(fields);
//       if (!valid) return;
//     }
//     if (step < TOTAL_STEPS - 1) setStep((s) => s + 1);
//   };

//   const onBack = () => {
//     if (step > 0) setStep((s) => s - 1);
//   };

//   const onSubmit = async (data) => {
//     if (!marker) {
//       return Alert.alert("Select Location", "Please choose your shop location on the map (expand map and tap).");
//     }

//     try {
//       setLoading(true);
//       const userId = await AsyncStorage.getItem("userId");
//       if (!userId) throw new Error("User ID not found in storage");

//       const formData = new FormData();
//       formData.append("shopname", data.shopName);
//       formData.append("shopDescription", data.shopDescription || "");
//       formData.append("shopAddress", data.shopAddress || "");
//       formData.append("building_name", data.buildingName || "");
//       formData.append("latitude", marker.latitude.toString());
//       formData.append("longitude", marker.longitude.toString());
//       formData.append("phone", data.phone || "");
//       formData.append("email", data.email || "");
//       formData.append("country_code", "+91");
//       formData.append("is_open", data.is_open ? "1" : "0");
//       formData.append("owner_id", userId);

//       if (image) {
//         formData.append("shopImage", {
//           uri: image.uri,
//           type: "image/jpeg",
//           name: `shop_${Date.now()}.jpg`,
//         });
//       }

//       const response = await axiosClient.post("/api/shops/create", formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           Accept: "application/json",
//         },
//       });

//       if (response.status === 201 || response.status === 200) {
//         const shop_id = response.data?.shop_id;
//         if (shop_id) {
//           await AsyncStorage.multiRemove(["shop_lat", "shop_lng"]);
//           await AsyncStorage.setItem("shop_id", shop_id.toString());
//           await AsyncStorage.setItem("setupStep", "shopCreated");
//           await AsyncStorage.setItem("shopDetailsAdded", "true");
//         }
//         navigation.replace("bottamTabScreen");
//       } else {
//         Alert.alert("Error", "Failed to create shop. Please try again.");
//       }
//     } catch (err) {
//       console.error("Create shop error:", err?.response ?? err);
//       const message = err?.response?.data?.message || err?.message || "Failed to create shop.";
//       Alert.alert("Error", message.toString());
//     } finally {
//       setLoading(false);
//     }
//   };

//   // small UI helpers
//   const renderStepIndicator = () => (
//     <View style={styles.header}>
//       <Text style={styles.title}>Shop Details</Text>
//       <Text style={styles.stepText}>Step {step + 1} of {TOTAL_STEPS}</Text>
//       <View style={styles.progressContainer}>
//         <View style={styles.progressBackground}>
//           <View style={[styles.progressFill, { width: `${((step + 1) / TOTAL_STEPS) * 100}%` }]} />
//         </View>
//       </View>
//     </View>
//   );

//   return (
//     <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
//       <View style={styles.container}>
//         {renderStepIndicator()}

//         <View style={{ flex: 1, overflow: "hidden" }}>
//           <Animated.View
//             style={{
//               flexDirection: "row",
//               width: SCREEN_WIDTH * TOTAL_STEPS,
//               transform: [{ translateX }],
//             }}
//           >
//             {/* Step 1 - Basic Info */}
//             <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
//               <Text style={styles.sectionTitle}>Basic Information</Text>
//               <Text style={styles.sectionSub}>Tell us about your business</Text>

//               <Controller
//                 control={control}
//                 name="shopName"
//                 rules={{ required: "Shop name is required" }}
//                 render={({ field: { onChange, value } }) => (
//                   <TextInput
//                     style={styles.input}
//                     placeholder="Enter your shop name"
//                     value={value}
//                     onChangeText={onChange}
//                   />
//                 )}
//               />
//               {errors.shopName && <Text style={styles.error}>{errors.shopName.message}</Text>}

//               <Controller
//                 control={control}
//                 name="phone"
//                 rules={{ required: "Phone number is required" }}
//                 render={({ field: { onChange, value } }) => (
//                   <TextInput
//                     style={styles.input}
//                     placeholder="Phone"
//                     keyboardType="phone-pad"
//                     value={value}
//                     onChangeText={onChange}
//                   />
//                 )}
//               />
//               {errors.phone && <Text style={styles.error}>{errors.phone.message}</Text>}

//               <Controller
//                 control={control}
//                 name="email"
//                 rules={{
//                   required: "Email is required",
//                   pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" },
//                 }}
//                 render={({ field: { onChange, value } }) => (
//                   <TextInput
//                     style={styles.input}
//                     placeholder="Email"
//                     keyboardType="email-address"
//                     autoCapitalize="none"
//                     value={value}
//                     onChangeText={onChange}
//                   />
//                 )}
//               />
//               {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
//             </ScrollView>

//             {/* Step 2 - Location Details */}
//             <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
//               <Text style={styles.sectionTitle}>Location Details</Text>
//               <Text style={styles.sectionSub}>Where is your business located?</Text>

//               <Text style={styles.smallLabel}>Selected City</Text>
//               <View style={styles.readonlyBox}>
//                 <Text>Bangalore, Karnataka</Text>
//               </View>

//               <Controller
//                 control={control}
//                 name="shopAddress"
//                 rules={{ required: "Address is required" }}
//                 render={({ field: { onChange, value } }) => (
//                   <TextInput
//                     style={styles.input}
//                     placeholder="Your Address"
//                     value={value}
//                     onChangeText={onChange}
//                   />
//                 )}
//               />
//               {errors.shopAddress && <Text style={styles.error}>{errors.shopAddress.message}</Text>}

//               <Controller
//                 control={control}
//                 name="buildingName"
//                 render={({ field: { onChange, value } }) => (
//                   <TextInput style={styles.input} placeholder="Shop no." value={value} onChangeText={onChange} />
//                 )}
//               />

//               <Controller
//                 control={control}
//                 name="shopDescription"
//                 render={({ field: { onChange, value } }) => (
//                   <TextInput
//                     style={[styles.input, { height: 100 }]}
//                     placeholder="Business Description"
//                     value={value}
//                     onChangeText={onChange}
//                     multiline
//                   />
//                 )}
//               />
//             </ScrollView>

//             {/* Step 3 - Operating Hours / Media (we only use fields you already have) */}
//             <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
//               <Text style={styles.sectionTitle}>Operating Hours & Media</Text>
//               <Text style={styles.sectionSub}>When is your business open? Add photo for profile</Text>

//               <Text style={styles.smallLabel}>Shop Image</Text>
//               <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
//                 {image ? (
//                   <Image source={{ uri: image.uri }} style={styles.imagePreview} />
//                 ) : (
//                   <View style={{ alignItems: "center" }}>
//                     <Ionicons name="camera" size={24} />
//                     <Text style={{ marginTop: 6 }}>Add Shop Photos</Text>
//                     <Text style={{ color: "#888", fontSize: 12 }}>Upload photos later from your profile</Text>
//                   </View>
//                 )}
//               </TouchableOpacity>

//               <View style={styles.switchRow}>
//                 <Text style={styles.label}>Is Shop Open?</Text>
//                 <Controller
//                   control={control}
//                   name="is_open"
//                   render={({ field: { value, onChange } }) => <Switch value={value} onValueChange={onChange} />}
//                 />
//               </View>

//               <Text style={[styles.smallLabel, { marginTop: 8 }]}>Location Preview</Text>
//               {region && (
//                 <View style={{ height: 150, borderRadius: 10, overflow: "hidden", marginBottom: 8 }}>
//                   <MapView style={{ flex: 1 }} region={region} pointerEvents="none">
//                     {marker && <Marker coordinate={marker} />}
//                   </MapView>
//                   <TouchableOpacity
//                     onPress={() => setMapVisible(true)}
//                     style={{ position: "absolute", bottom: 10, right: 10, backgroundColor: "#fff", padding: 8, borderRadius: 8 }}
//                   >
//                     <Text>📍 Expand</Text>
//                   </TouchableOpacity>
//                 </View>
//               )}
//             </ScrollView>
//           </Animated.View>
//         </View>

//         {/* footer with Back / Continue (brown) */}
//         <View style={styles.footer}>
//           <View style={styles.footerRow}>
//             {step > 0 ? (
//               <TouchableOpacity onPress={onBack} style={styles.backBtn}>
//                 <Text style={styles.backText}>Back</Text>
//               </TouchableOpacity>
//             ) : (
//               <View style={{ width: 80 }} />
//             )}

//             {step < TOTAL_STEPS - 1 ? (
//               <TouchableOpacity onPress={onNext} style={styles.continueBtn}>
//                 <Text style={styles.continueText}>Continue</Text>
//               </TouchableOpacity>
//             ) : (
//               <TouchableOpacity onPress={handleSubmit(onSubmit)} style={styles.continueBtn} disabled={loading}>
//                 <Text style={styles.continueText}>{loading ? "Submitting..." : "Continue"}</Text>
//               </TouchableOpacity>
//             )}
//           </View>
//         </View>

//         {/* Map modal */}
//         <Modal visible={mapVisible} animationType="slide">
//           <View style={{ flex: 1 }}>
//             {region && (
//               <MapView
//                 style={{ flex: 1 }}
//                 region={region}
//                 onPress={(e) => {
//                   const coord = e.nativeEvent.coordinate;
//                   setMarker(coord);
//                   setMapVisible(false);
//                 }}
//               >
//                 {marker && <Marker coordinate={marker} />}
//               </MapView>
//             )}

//             <TouchableOpacity onPress={() => setMapVisible(false)} style={styles.closeIcon}>
//               <Ionicons name="close" size={28} color="#000" />
//             </TouchableOpacity>

//             <TouchableOpacity onPress={centerToCurrentLocation} style={styles.gpsIcon}>
//               <Ionicons name="navigate" size={24} color="#007AFF" />
//             </TouchableOpacity>

//             {loading && (
//               <View style={styles.loadingOverlay}>
//                 <ActivityIndicator size="large" color="#007AFF" />
//               </View>
//             )}
//           </View>
//         </Modal>
//       </View>
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff" },
//   header: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 8, backgroundColor: "#fff" },
//   title: { fontSize: 20, fontWeight: "700" },
//   stepText: { marginTop: 6, color: "#666" },
//   progressContainer: { marginTop: 10, paddingRight: 18 },
//   progressBackground: { height: 6, backgroundColor: "#eee", borderRadius: 6, overflow: "hidden" },
//   progressFill: { height: 6, backgroundColor: "#6a3b26" },

//   page: { width: SCREEN_WIDTH, padding: 18, paddingBottom: 140 },
//   sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
//   sectionSub: { color: "#666", marginBottom: 12 },
//   smallLabel: { color: "#777", marginBottom: 6 },
//   readonlyBox: { borderRadius: 8, borderWidth: 1, borderColor: "#eee", padding: 12, marginBottom: 12, backgroundColor: "#fafafa" },

//   input: { borderWidth: 1, borderColor: "#e6e6e6", borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: "#fff" },
//   error: { color: "red", fontSize: 12, marginBottom: 8 },

//   imageBox: { height: 150, borderWidth: 1, borderColor: "#e6e6e6", borderRadius: 10, justifyContent: "center", alignItems: "center", marginBottom: 12, backgroundColor: "#fff" },
//   imagePreview: { width: "100%", height: "100%", borderRadius: 10 },

//   switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 8 },
//   label: { fontSize: 16 },

//   footer: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "#fff", padding: 16, borderTopWidth: 1, borderColor: "#eee" },
//   footerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },

//   backBtn: { width: 80, padding: 12, alignItems: "center" },
//   backText: { color: "#555" },

//   continueBtn: {
//     flex: 1,
//     backgroundColor: "#6a3b26",
//     padding: 14,
//     borderRadius: 8,
//     alignItems: "center",
//     marginLeft: 12,
//   },
//   continueText: { color: "#fff", fontWeight: "700" },

//   closeIcon: { position: "absolute", top: Platform.OS === "ios" ? 50 : 20, right: 20, backgroundColor: "#fff", padding: 8, borderRadius: 20, elevation: 4 },
//   gpsIcon: { position: "absolute", bottom: 40, right: 20, backgroundColor: "#fff", padding: 10, borderRadius: 30, elevation: 4 },

//   loadingOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(255,255,255,0.6)", justifyContent: "center", alignItems: "center" },
// });

// export default EnterShopDetailScreen;
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
  Modal,
  ActivityIndicator,
  Image,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axiosClient from "@/src/assets/api/client";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const statesData = {
  Gujarat: ["Ahmedabad", "Surat", "Vadodara"],
  Maharashtra: ["Mumbai", "Pune", "Nagpur"],
  Karnataka: ["Bengaluru", "Mysuru", "Mangalore"],
  Delhi: ["New Delhi", "North Delhi", "South Delhi"],
};

const EnterShopDetailScreen = () => {
  const navigation = useNavigation();

  // react-hook-form
  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors },
    getValues,
    setValue,
  } = useForm({
    defaultValues: {
      shopName: "",
      shopDescription: "",
      shopAddress: "",
      buildingName: "",
      phone: "",
      email: "",
      is_open: true,
    },
  });

  // Steps
  const [step, setStep] = useState(0); // 0,1,2
  const TOTAL_STEPS = 3;

  // map & marker
  const [region, setRegion] = useState(null);
  const [marker, setMarker] = useState(null);
  const [mapVisible, setMapVisible] = useState(false);

  // image
  const [image, setImage] = useState(null);

  // loading
  const [loading, setLoading] = useState(false);

  // animation
  const translateX = useRef(new Animated.Value(0)).current;

  // State/City modal UI state (UI-only; not added to form fields)
  const [stateModalVisible, setStateModalVisible] = useState(false);
  const [stateStage, setStateStage] = useState("state"); // "state" | "city"
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: -step * SCREEN_WIDTH,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  }, [step, translateX]);

  // try to load saved lat/lng or device location
  useEffect(() => {
    (async () => {
      try {
        const lat = await AsyncStorage.getItem("shop_lat");
        const lng = await AsyncStorage.getItem("shop_lng");
        if (lat && lng) {
          const latitude = parseFloat(lat);
          const longitude = parseFloat(lng);
          const coords = { latitude, longitude };
          setMarker(coords);
          setRegion({ ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 });
        } else {
          const loc = await Location.getCurrentPositionAsync({});
          setRegion({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      } catch (e) {
        console.warn("Location error:", e);
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      if (!res.canceled) {
        setImage(res.assets[0]);
      }
    } catch (e) {
      console.warn("ImagePicker error", e);
    }
  };

  const centerToCurrentLocation = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (e) {
      console.warn("Center location error", e);
    }
  };

  // fields per step (for validation)
  const stepFields = [
    ["shopName", "phone", "email"], // step 0: basic
    ["shopAddress", "buildingName", "shopDescription"], // step 1: location
    [], // step 2: media/status (no required fields)
  ];

  const onNext = async () => {
    const fields = stepFields[step] || [];
    if (fields.length > 0) {
      const valid = await trigger(fields);
      if (!valid) return;
    }
    if (step < TOTAL_STEPS - 1) setStep((s) => s + 1);
  };

  const onBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  // Header back icon for stepping back
  const headerBack = () => {
    if (step > 0) {
      return (
        <TouchableOpacity style={styles.headerBackRight} onPress={onBack}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
      );
    }
    return null;
  };

  const onSubmit = async (data) => {
    if (!marker) {
      return Alert.alert("Select Location", "Please choose your shop location on the map (expand map and tap).");
    }

    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) throw new Error("User ID not found in storage");

      const formData = new FormData();
      formData.append("shopname", data.shopName);
      formData.append("shopDescription", data.shopDescription || "");
      formData.append("shopAddress", data.shopAddress || "");
      formData.append("building_name", data.buildingName || "");
      formData.append("latitude", marker.latitude.toString());
      formData.append("longitude", marker.longitude.toString());
      formData.append("phone", data.phone || "");
      formData.append("email", data.email || "");
      formData.append("country_code", "+91");
      formData.append("is_open", data.is_open ? "1" : "0");
      formData.append("owner_id", userId);

      if (image) {
        formData.append("shopImage", {
          uri: image.uri,
          type: "image/jpeg",
          name: `shop_${Date.now()}.jpg`,
        });
      }

      const response = await axiosClient.post("/api/shops/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
      });

      if (response.status === 201 || response.status === 200) {
        const shop_id = response.data?.shop_id;
        if (shop_id) {
          await AsyncStorage.multiRemove(["shop_lat", "shop_lng"]);
          await AsyncStorage.setItem("shop_id", shop_id.toString());
          await AsyncStorage.setItem("setupStep", "shopCreated");
          await AsyncStorage.setItem("shopDetailsAdded", "true");
        }
        navigation.replace("bottamTabScreen");
      } else {
        Alert.alert("Error", "Failed to create shop. Please try again.");
      }
    } catch (err) {
      console.error("Create shop error:", err?.response ?? err);
      const message = err?.response?.data?.message || err?.message || "Failed to create shop.";
      Alert.alert("Error", message.toString());
    } finally {
      setLoading(false);
    }
  };

  // State/City modal flow handlers
  const openStateModal = () => {
    setStateStage("state");
    setStateModalVisible(true);
  };

  const onSelectState = (st) => {
    setSelectedState(st);
    setStateStage("city");
  };

  const onSelectCity = (city) => {
    setSelectedCity(city);
    setStateModalVisible(false);
    // Optional: you can inject city into shopAddress if you want:
    // const currentAddress = getValues("shopAddress") || "";
    // setValue("shopAddress", currentAddress ? `${currentAddress}, ${city}` : city);
  };

  const renderStateModalContent = () => {
    if (stateStage === "state") {
      return (
        <>
          <Text style={styles.modalTitle}>Select State</Text>
          <ScrollView>
            {Object.keys(statesData).map((st) => (
              <TouchableOpacity key={st} style={styles.modalItem} onPress={() => onSelectState(st)}>
                <Text style={styles.modalItemText}>{st}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      );
    } else {
      // city stage
      const cities = statesData[selectedState] || [];
      return (
        <>
          <View style={styles.modalHeaderRow}>
            <TouchableOpacity onPress={() => setStateStage("state")}>
              <Ionicons name="chevron-back" size={22} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { marginLeft: 12 }]}>{selectedState}</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView>
            {cities.map((c) => (
              <TouchableOpacity key={c} style={styles.modalItem} onPress={() => onSelectCity(c)}>
                <Text style={styles.modalItemText}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      );
    }
  };

  // small UI helpers
  const renderStepIndicator = () => (
    <View style={styles.headerRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Shop Details</Text>
        <Text style={styles.stepText}>Step {step + 1} of {TOTAL_STEPS}</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View style={[styles.progressFill, { width: `${((step + 1) / TOTAL_STEPS) * 100}%` }]} />
          </View>
        </View>
      </View>
  
      {/* back button on the right */}
      {headerBack()}
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <View style={styles.container}>
        {renderStepIndicator()}

        <View style={{ flex: 1, overflow: "hidden" }}>
          <Animated.View
            style={{
              flexDirection: "row",
              width: SCREEN_WIDTH * TOTAL_STEPS,
              transform: [{ translateX }],
            }}
          >
            {/* Step 1 - Basic Info */}
            <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
              <Text style={styles.sectionTitle}>Basic Information</Text>
              <Text style={styles.sectionSub}>Tell us about your business</Text>

              <Controller
                control={control}
                name="shopName"
                rules={{ required: "Shop name is required" }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your shop name"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
              {errors.shopName && <Text style={styles.error}>{errors.shopName.message}</Text>}

              <Controller
                control={control}
                name="phone"
                rules={{ required: "Phone number is required" }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Phone"
                    keyboardType="phone-pad"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
              {errors.phone && <Text style={styles.error}>{errors.phone.message}</Text>}

              <Controller
                control={control}
                name="email"
                rules={{
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" },
                }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
              {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
            </ScrollView>

            {/* Step 2 - Location Details */}
            <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
              <Text style={styles.sectionTitle}>Location Details</Text>
              <Text style={styles.sectionSub}>Where is your business located?</Text>

              <Text style={styles.smallLabel}>Selected City</Text>
              <TouchableOpacity onPress={openStateModal} activeOpacity={0.8} style={styles.readonlyBox}>
                <Text>{selectedCity ? `${selectedCity}, ${selectedState}` : "Select state & city"}</Text>
              </TouchableOpacity>

              <Controller
                control={control}
                name="shopAddress"
                rules={{ required: "Address is required" }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Your Address"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
              {errors.shopAddress && <Text style={styles.error}>{errors.shopAddress.message}</Text>}

              <Controller
                control={control}
                name="buildingName"
                render={({ field: { onChange, value } }) => (
                  <TextInput style={styles.input} placeholder="Shop no." value={value} onChangeText={onChange} />
                )}
              />

              <Controller
                control={control}
                name="shopDescription"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, { height: 100 }]}
                    placeholder="Business Description"
                    value={value}
                    onChangeText={onChange}
                    multiline
                  />
                )}
              />
            </ScrollView>

            {/* Step 3 - Operating Hours / Media */}
            <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
              <Text style={styles.sectionTitle}>Operating Hours & Media</Text>
              <Text style={styles.sectionSub}>When is your business open? Add photo for profile</Text>

              <Text style={styles.smallLabel}>Shop Image</Text>
              <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
                {image ? (
                  <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                ) : (
                  <View style={{ alignItems: "center" }}>
                    <Ionicons name="camera" size={24} />
                    <Text style={{ marginTop: 6 }}>Add Shop Photos</Text>
                    <Text style={{ color: "#888", fontSize: 12 }}>Upload photos later from your profile</Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.switchRow}>
                <Text style={styles.label}>Is Shop Open?</Text>
                <Controller
                  control={control}
                  name="is_open"
                  render={({ field: { value, onChange } }) => <Switch value={value} onValueChange={onChange} />}
                />
              </View>

              <Text style={[styles.smallLabel, { marginTop: 8 }]}>Location Preview</Text>
              {region && (
                <View style={{ height: 150, borderRadius: 10, overflow: "hidden", marginBottom: 8 }}>
                  <MapView style={{ flex: 1 }} region={region} pointerEvents="none">
                    {marker && <Marker coordinate={marker} />}
                  </MapView>
                  <TouchableOpacity
                    onPress={() => setMapVisible(true)}
                    style={{ position: "absolute", bottom: 10, right: 10, backgroundColor: "#fff", padding: 8, borderRadius: 8 }}
                  >
                    <Text>📍 Expand</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </Animated.View>
        </View>

        {/* footer with Back / Continue (brown) */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            {step > 0 ? (
              <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ width: 80 }} />
            )}

            {step < TOTAL_STEPS - 1 ? (
              <TouchableOpacity onPress={onNext} style={styles.continueBtn}>
                <Text style={styles.continueText}>Continue</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleSubmit(onSubmit)} style={styles.continueBtn} disabled={loading}>
                <Text style={styles.continueText}>{loading ? "Submitting..." : "Continue"}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Map modal */}
        <Modal visible={mapVisible} animationType="slide">
          <View style={{ flex: 1 }}>
            {region && (
              <MapView
                style={{ flex: 1 }}
                region={region}
                onPress={(e) => {
                  const coord = e.nativeEvent.coordinate;
                  setMarker(coord);
                  setMapVisible(false);
                }}
              >
                {marker && <Marker coordinate={marker} />}
              </MapView>
            )}

            <TouchableOpacity onPress={() => setMapVisible(false)} style={styles.closeIcon}>
              <Ionicons name="close" size={28} color="#000" />
            </TouchableOpacity>

            <TouchableOpacity onPress={centerToCurrentLocation} style={styles.gpsIcon}>
              <Ionicons name="navigate" size={24} color="#007AFF" />
            </TouchableOpacity>

            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#007AFF" />
              </View>
            )}
          </View>
        </Modal>

        {/* State/City modal */}
        <Modal visible={stateModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              {renderStateModalContent()}
              <TouchableOpacity
                onPress={() => setStateModalVisible(false)}
                style={{ marginTop: 12, alignSelf: "center", padding: 8 }}
              >
                <Text style={{ color: "#007AFF" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 8,
    backgroundColor: "#fff",
  },
  headerBackRight: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  title: { fontSize: 20, fontWeight: "700" },
  stepText: { marginTop: 6, color: "#666" },
  progressContainer: { marginTop: 10, paddingRight: 18 },
  progressBackground: { height: 6, backgroundColor: "#eee", borderRadius: 6, overflow: "hidden" },
  progressFill: { height: 6, backgroundColor: "#6a3b26" },

  page: { width: SCREEN_WIDTH, padding: 18, paddingBottom: 140 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  sectionSub: { color: "#666", marginBottom: 12 },
  smallLabel: { color: "#777", marginBottom: 6 },
  readonlyBox: { borderRadius: 8, borderWidth: 1, borderColor: "#eee", padding: 12, marginBottom: 12, backgroundColor: "#fafafa" },

  input: { borderWidth: 1, borderColor: "#e6e6e6", borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: "#fff" },
  error: { color: "red", fontSize: 12, marginBottom: 8 },

  imageBox: { height: 150, borderWidth: 1, borderColor: "#e6e6e6", borderRadius: 10, justifyContent: "center", alignItems: "center", marginBottom: 12, backgroundColor: "#fff" },
  imagePreview: { width: "100%", height: "100%", borderRadius: 10 },

  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 8 },
  label: { fontSize: 16 },

  footer: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "#fff", padding: 16, borderTopWidth: 1, borderColor: "#eee" },
  footerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },

  backBtn: { width: 80, padding: 12, alignItems: "center" },
  backText: { color: "#555" },

  continueBtn: {
    flex: 1,
    backgroundColor: "#6a3b26",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 12,
  },
  continueText: { color: "#fff", fontWeight: "700" },

  closeIcon: { position: "absolute", top: Platform.OS === "ios" ? 50 : 20, right: 20, backgroundColor: "#fff", padding: 8, borderRadius: 20, elevation: 4 },
  gpsIcon: { position: "absolute", bottom: 40, right: 20, backgroundColor: "#fff", padding: 10, borderRadius: 30, elevation: 4 },

  loadingOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(255,255,255,0.6)", justifyContent: "center", alignItems: "center" },

  /* Modal styles */
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", paddingHorizontal: 20 },
  modalContainer: { backgroundColor: "#fff", borderRadius: 12, maxHeight: "70%", padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  modalItem: { paddingVertical: 12, borderBottomWidth: 1, borderColor: "#f0f0f0" },
  modalItemText: { fontSize: 16 },
  modalHeaderRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },

});

export default EnterShopDetailScreen;

