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

// export default EnterShopDetailScreen;
import React, { useEffect, useState } from "react";
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
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";
import { BASE_URL } from "@/api";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

const EnterShopDetailScreen = () => {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
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

  const [marker, setMarker] = useState(null);
  const [region, setRegion] = useState(null);
  const [image, setImage] = useState(null);
  const [mapVisible, setMapVisible] = useState(false);
  const [loading, setLoading] = useState(false);
const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>()
  useEffect(() => {
    const loadLocation = async () => {
      const lat = await AsyncStorage.getItem("shop_lat");
      const lng = await AsyncStorage.getItem("shop_lng");

      if (lat && lng) {
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        const coords = { latitude, longitude };

        setMarker(coords);
        setRegion({
          ...coords,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } else {
        const loc = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    };

    loadLocation();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const file = result.assets[0];
      setImage(file);
    }
  };

  const centerToCurrentLocation = async () => {
    const loc = await Location.getCurrentPositionAsync({});
    setRegion({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const onSubmit = async (data) => {
    // console.log(data);
    
    const token = await AsyncStorage.getItem("authToken");
    if (!token) return Alert.alert("Auth Error", "Please login again");
    if (!marker) return Alert.alert("Location Missing", "Please select location");

    const formData = new FormData();
    formData.append("shopname", data.shopName);
    formData.append("shopDescription", data.shopDescription);
    formData.append("shopAddress", data.shopAddress);
    formData.append("building_name", data.buildingName);
    formData.append("latitude", marker.latitude.toString());
    formData.append("longitude", marker.longitude.toString());
    formData.append("phone", data.phone);
    formData.append("email", data.email);
    formData.append("country_code", "+91");
    formData.append("is_open", data.is_open ? "1" : "0");

    if (image) {
      formData.append("shopImage", {
        uri: image.uri,
        type: "image/jpeg",
        name: `shop_${Date.now()}.jpg`,
      });
    }

    try {
      const response = await axios.post(`${BASE_URL}/api/shops/create`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      // console.log(response.data);
      
//       if (response.status === 201) {
//         Alert.alert("Success", "Shop created successfully!");
//         await AsyncStorage.removeItem("shop_lat");
//         await AsyncStorage.removeItem("shop_lng");
//          await AsyncStorage.setItem("owner_id", response.data.owner_id.toString()); 
//          await AsyncStorage.setItem("setupStep", "shopCreated");
// navigation.replace("addCategoryScreen");
        
//       }
if (response.status === 201) {
  // Alert.alert("Success", "Shop created successfully!");

  await AsyncStorage.removeItem("shop_lat");
  await AsyncStorage.removeItem("shop_lng");
  // await AsyncStorage.setItem("owner_id", response.data.owner_id.toString());
  await AsyncStorage.setItem("shop_id", response.data.shop_id?.toString() ?? ""); // ← if returned

  await AsyncStorage.setItem("setupStep", "shopCreated");
  await AsyncStorage.setItem("shopDetailsAdded", "true");

  navigation.replace("bottamTabScreen"); // Go to HomeScreen (via tab)
}

    } catch (err) {
      console.log("Create shop error:", err.response?.data || err.message);
      Alert.alert("Error", err?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Enter Shop Details</Text>

      <Controller
        control={control}
        name="shopName"
        rules={{ required: "Shop name is required" }}
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} placeholder="Shop Name" value={value} onChangeText={onChange} />
        )}
      />
      {errors.shopName && <Text style={styles.error}>{errors.shopName.message}</Text>}

      <Text style={styles.label}>Shop Image</Text>
      <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.imagePreview} />
        ) : (
          <Text>Select Image</Text>
        )}
      </TouchableOpacity>

      <Controller
        control={control}
        name="shopDescription"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Description"
            value={value}
            onChangeText={onChange}
            multiline
          />
        )}
      />

      <Controller
        control={control}
        name="buildingName"
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} placeholder="Building Name" value={value} onChangeText={onChange} />
        )}
      />
      <Controller
        control={control}
        name="shopAddress"
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} placeholder="Address" value={value} onChangeText={onChange} />
        )}
      />

      <Controller
        control={control}
        name="phone"
        rules={{ required: "Phone number is required" }}
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} placeholder="Phone" keyboardType="phone-pad" value={value} onChangeText={onChange} />
        )}
      />
      {errors.phone && <Text style={styles.error}>{errors.phone.message}</Text>}

      <Controller
        control={control}
        name="email"
        rules={{ required: "Email is required" }}
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" value={value} onChangeText={onChange} />
        )}
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      <View style={styles.switchRow}>
        <Text style={styles.label}>Is Shop Open?</Text>
        <Controller
          control={control}
          name="is_open"
          render={({ field: { value, onChange } }) => <Switch value={value} onValueChange={onChange} />}
        />
      </View>

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

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit(onSubmit)} disabled={loading}>
        <Text style={styles.submitText}>{loading ? "Submitting..." : "Create Shop"}</Text>
      </TouchableOpacity>

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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 12 },
  label: { fontSize: 16, marginBottom: 8 },
  error: { color: "red", fontSize: 12, marginBottom: 8 },
  switchRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  submitBtn: { backgroundColor: "#007AFF", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 16, marginBottom: 40 },
  submitText: { color: "#fff", fontWeight: "bold" },
  imageBox: { height: 150, borderWidth: 1, borderColor: "#ccc", borderRadius: 10, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  imagePreview: { width: "100%", height: "100%", borderRadius: 10 },
  coords: { marginBottom: 16, fontStyle: "italic" },
  closeIcon: { position: "absolute", top: 40, right: 20, backgroundColor: "#fff", padding: 8, borderRadius: 20, elevation: 4 },
  gpsIcon: { position: "absolute", bottom: 40, right: 20, backgroundColor: "#fff", padding: 10, borderRadius: 30, elevation: 4 },
  loadingOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(255,255,255,0.6)", justifyContent: "center", alignItems: "center" },
});

export default EnterShopDetailScreen;


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
// } from "react-native";
// import { useForm, Controller } from "react-hook-form";
// import MapView, { Marker } from "react-native-maps";
// import * as Location from "expo-location";
// import axios from "axios";
// import { BASE_URL } from "@/api";
// import * as ImagePicker from "expo-image-picker";
// import { Image } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons } from "@expo/vector-icons";

// const EnterShopDetailScreen = () => {
//   const {
//     control,
//     handleSubmit,
//     setValue,
//     watch,
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

//   const addressInput = watch("shopAddress");

//   useEffect(() => {
//     (async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") {
//         Alert.alert("Permission denied", "Location permission is required");
//         return;
//       }

//       const loc = await Location.getCurrentPositionAsync({});
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
//       reverseGeocode(loc.coords.latitude, loc.coords.longitude);
//     })();
//   }, []);

//   useEffect(() => {
//     const delayDebounce = setTimeout(() => {
//       if (addressInput.length > 5) {
//         forwardGeocode(addressInput);
//       }
//     }, 1000);
//     return () => clearTimeout(delayDebounce);
//   }, [addressInput]);

//   const reverseGeocode = async (lat, lng) => {
//     try {
//       setLoading(true);
//       const result = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
//       if (result.length > 0) {
//         const addr = result[0];
//         const formattedAddress = `${addr.name}, ${addr.street || ""}, ${addr.city || ""}`;
//         setValue("shopAddress", formattedAddress);
//         if (addr.subregion || addr.district) {
//           setValue("buildingName", addr.subregion || addr.district);
//         }
//       }
//     } catch (error) {
//       console.log("Reverse geocoding failed:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const forwardGeocode = async (address) => {
//     try {
//       const result = await Location.geocodeAsync(address);
//       if (result.length > 0) {
//         const loc = result[0];
//         setRegion({
//           latitude: loc.latitude,
//           longitude: loc.longitude,
//           latitudeDelta: 0.01,
//           longitudeDelta: 0.01,
//         });
//         setMarker({ latitude: loc.latitude, longitude: loc.longitude });
//       }
//     } catch (err) {
//       console.log("Forward geocoding failed:", err);
//     }
//   };

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

//   const onSubmit = async (data) => {
//     const token = await AsyncStorage.getItem("authToken");
//     if (!token) return Alert.alert("Auth Error", "Please login again");
//     if (!marker) return Alert.alert("Location Missing", "Please select location");

//     const formData = new FormData();
//     formData.append("shopname", data.shopName);
//     formData.append("shopDescription", data.shopDescription);
//     formData.append("shopAddress", data.shopAddress);
//     formData.append("building_name", data.buildingName);
//     formData.append("latitude", marker.latitude.toString());
//     formData.append("longitude", marker.longitude.toString());
//     formData.append("phone", data.phone);
//     formData.append("email", data.email);
//     formData.append("country_code", "+91");
//     formData.append("is_open", data.is_open ? "1" : "0");

//     if (image) {
//       formData.append("shopImage", {
//         uri: image.uri,
//         type: "image/jpeg",
//         name: `shop_${Date.now()}.jpg`,
//       });
//     }

//     try {
//       const response = await axios.post(`${BASE_URL}/api/shops/create`, formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       if (response.status === 201) {
//         Alert.alert("Success", "Shop created successfully!");
//       }
//     } catch (err) {
//       console.log("Create shop error:", err.response?.data || err.message);
//       Alert.alert("Error", err?.response?.data?.message || "Something went wrong");
//     }
//   };

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
//           <TextInput style={[styles.input, { height: 80 }]} placeholder="Description" value={value} onChangeText={onChange} multiline />
//         )}
//       />
//    <Controller
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

//       {/* Mini Map Preview */}
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

//       <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit(onSubmit)}>
//         <Text style={styles.submitText}>Create Shop</Text>
//       </TouchableOpacity>

//       {/* Fullscreen Map Modal */}
      // <Modal visible={mapVisible} animationType="slide">
      //   <View style={{ flex: 1 }}>
      //     {region && (
      //       <MapView
      //         style={{ flex: 1 }}
      //         region={region}
      //         onPress={(e) => {
      //           const coord = e.nativeEvent.coordinate;
      //           setMarker(coord);
      //           reverseGeocode(coord.latitude, coord.longitude);
      //           setMapVisible(false);
      //         }}
      //       >
      //         {marker && <Marker coordinate={marker} />}
      //       </MapView>
      //     )}

      //     <TouchableOpacity onPress={() => setMapVisible(false)} style={styles.closeIcon}>
      //       <Ionicons name="close" size={28} color="#000" />
      //     </TouchableOpacity>

      //     <TouchableOpacity onPress={centerToCurrentLocation} style={styles.gpsIcon}>
      //       <Ionicons name="navigate" size={24} color="#007AFF" />
      //     </TouchableOpacity>

      //     {loading && (
      //       <View style={styles.loadingOverlay}>
      //         <ActivityIndicator size="large" color="#007AFF" />
      //       </View>
      //     )}
      //   </View>
      // </Modal>
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

// export default EnterShopDetailScreen;
      // <TouchableOpacity onPress={() => setMapVisible(true)}>
      //   <Text style={{ color: "#007AFF", marginBottom: 8 }}>🗺️ Open Full Map</Text>
      // </TouchableOpacity>

      // {marker && (
      //   <Text style={styles.coords}>📍 Lat: {marker.latitude.toFixed(6)}, Lng: {marker.longitude.toFixed(6)}</Text>
      // )}

      // <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit(onSubmit)}>
      //   <Text style={styles.submitText}>Create Shop</Text>
      // </TouchableOpacity>

      // {/* Fullscreen Map Modal */}
      // <Modal visible={mapVisible} animationType="slide">
      //   <View style={{ flex: 1 }}>
      //     {region && (
      //       <MapView
      //         style={{ flex: 1 }}
      //         region={region}
      //         onPress={(e) => {
      //           const coord = e.nativeEvent.coordinate;
      //           setMarker(coord);
      //           reverseGeocode(coord.latitude, coord.longitude);
      //           setMapVisible(false);
      //         }}
      //       >
      //         {marker && <Marker coordinate={marker} />}
      //       </MapView>
      //     )}

      //     <TouchableOpacity onPress={() => setMapVisible(false)} style={styles.closeIcon}>
      //       <Ionicons name="close" size={28} color="#000" />
      //     </TouchableOpacity>

      //     <TouchableOpacity onPress={centerToCurrentLocation} style={styles.gpsIcon}>
      //       <Ionicons name="navigate" size={24} color="#007AFF" />
      //     </TouchableOpacity>

      //     {loading && (
      //       <View style={styles.loadingOverlay}>
      //         <ActivityIndicator size="large" color="#007AFF" />
      //       </View>
      //     )}
      //   </View>
      // </Modal>