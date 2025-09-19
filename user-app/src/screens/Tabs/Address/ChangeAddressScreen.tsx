// // src/screens/ChangeAddressScreen.tsx
// import React, { useState, useEffect, useCallback } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Pressable,
//   FlatList,
//   TouchableOpacity,
//   Alert,
//   ActivityIndicator,
// } from "react-native";
// import CommonHeader from "@/src/Common/CommonHeader";
// import { hp, wp } from "@/src/assets/utils/responsive";
// import { Ionicons } from "@expo/vector-icons";
// import { getLocationFromStorage } from "@/src/assets/utils/locationStorage";
// import { useNavigation, useFocusEffect } from "@react-navigation/native";
// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { BASE_URL } from "@/api";
// import { useAddress } from "@/src/context/addressContext";
// import axiosClient from "@/src/api/client";
// import { SafeAreaView } from "react-native-safe-area-context";

// type AddressItem = {
//   id: string;
//   addressType: string;
//   fullName?: string;
//   phoneNumber?: string;
//   pincode?: string;
//   state?: string;
//   city?: string;
//   houseNumber?: string;
//   roadArea?: string;
//   landmark?: string;
// };

// const getTokenFromStorage = async () => {
//   try {
//     return await AsyncStorage.getItem("authToken");
//   } catch (err) {
//     console.warn("getTokenFromStorage", err);
//     return null;
//   }
// };

// const ChangeAddressScreen = () => {
//   const [selectedId, setSelectedId] = useState<string>("");
//   const [tempSelectedAddress, setTempSelectedAddress] = useState<AddressItem | null>(null);
//   const [savedLocation, setSavedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
//   const [addresses, setAddresses] = useState<AddressItem[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const navigation = useNavigation();
//   const { selectedAddress, setSelectedAddress, ready } = useAddress();

//   // preselect existing global selected address
// useEffect(() => {
//   // wait for context to be ready (loaded from storage)
//   if (ready && selectedAddress) {
//     setSelectedId(selectedAddress.id);
//     setTempSelectedAddress(selectedAddress as AddressItem);
//   }
// }, [selectedAddress, ready]);
//   // load saved location (your helper)
//   const loadSavedLocation = async () => {
//     try {
//       const location = await getLocationFromStorage();
//       if (location && typeof location.latitude === "number" && typeof location.longitude === "number") {
//         setSavedLocation({ latitude: location.latitude, longitude: location.longitude });
//       } else {
//         setSavedLocation(null);
//       }
//     } catch (err) {
//       console.warn("loadSavedLocation failed", err);
//       setSavedLocation(null);
//     }
//   };

//   // fetch addresses from API
//   const fetchAddresses = useCallback(async () => {
//     setLoading(true);
//     try {
//       const token = await getTokenFromStorage();
//       if (!token) {
//         // user not logged in — show empty or fallback
//         setAddresses([]);
//         setLoading(false);
//         return;
//       }
//       const res = await axiosClient.get("/api/address/list", {
//    timeout: 10000, 
//       // signal: controller.signal as any,
//        });

//       if (res.status === 200 && Array.isArray(res.data)) {
//         setAddresses(res.data);
//       } else {
//         console.warn("Unexpected response from address list", res.status, res.data);
//         setAddresses([]);
//       }
//     } catch (err) {
//       console.warn("fetchAddresses error", err);
//       Alert.alert("Error", "Failed to fetch addresses. Please try again.");
//       setAddresses([]);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // refresh on focus
//   useFocusEffect(
//     useCallback(() => {
//       loadSavedLocation();
//       fetchAddresses();
//     }, [fetchAddresses])
//   );

//   // Persist the temp selection to global context when screen blurs (user navigates back)
//   useFocusEffect(
//     useCallback(() => {
//       return () => {
//         // blur
//         if (tempSelectedAddress) {
//           // setSelectedAddress handles persistence to AsyncStorage
//           setSelectedAddress(tempSelectedAddress).catch((e) => console.warn("persist addr error", e));
//         }
//       };
//     }, [tempSelectedAddress, setSelectedAddress])
//   );

//   // combine savedLocation (first item) with fetched addresses
//   const allAddresses: AddressItem[] = savedLocation
//     ? [
//         {
//           id: "saved_location",
//           addressType: "Current Location",
//           fullName: "",
//           phoneNumber: "",
//           pincode: "",
//           state: "",
//           city: `Lat: ${savedLocation.latitude.toFixed(6)}`,
//           houseNumber: `Lng: ${savedLocation.longitude.toFixed(6)}`,
//           roadArea: "",
//           landmark: "",
//         },
//         ...addresses,
//       ]
//     : addresses;

//   const onSelectAddress = (item: AddressItem) => {
//     // single-select; allow switching; never toggle off to none via tap
//     if (selectedId !== item.id) {
//       setSelectedId(item.id);
//       setTempSelectedAddress(item);
//     }
//   };

//   const renderAddress = ({ item }: { item: AddressItem }) => {
//     const isSelected = selectedId === item.id;

//     const addressLine1 = `${item.houseNumber || ""}${item.houseNumber ? ", " : ""}${
//       item.roadArea || ""
//     }${item.roadArea ? ", " : ""}${item.city || ""}${item.state ? `, ${item.state}` : ""}${
//       item.pincode ? ` - ${item.pincode}` : ""
//     }`;
//     const addressLine2 = item.landmark || "";

//     return (
//       <Pressable
//         onPress={() => onSelectAddress(item)}
//         style={[
//           styles.addressCard,
//           {
//             backgroundColor: isSelected ? "#5C321D" : "#F5F5F5",
//           },
//         ]}
//       >
//         <View
//           style={[
//             styles.addressIcon,
//             { backgroundColor: isSelected ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.05)" },
//           ]}
//         >
//           <Ionicons
//             name={
//               item.id === "saved_location"
//                 ? "locate-outline"
//                 : item.addressType?.toLowerCase?.() === "home"
//                 ? "home"
//                 : "business"
//             }
//             size={hp(3)}
//             color={isSelected ? "#FFF" : "#8E8E8E"}
//           />
//         </View>

//         <View style={{ flex: 1 }}>
//           <Text style={[styles.addressType, { color: isSelected ? "#FFF" : "#333" }]}>
//             {item.addressType}
//           </Text>
//           <Text style={[styles.addressLine1, { color: isSelected ? "#FFF" : "#666" }]}>
//             {addressLine1}
//           </Text>
//           {addressLine2 ? (
//             <Text style={[styles.addressLine2, { color: isSelected ? "#EEE" : "#999" }]}>
//               {addressLine2}
//             </Text>
//           ) : null}
//         </View>

//         {isSelected && <Ionicons name="checkmark-circle" size={hp(3)} color="#FFF" style={{ marginLeft: wp(2) }} />}
//       </Pressable>
//     );
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <CommonHeader title="Change Address" />
//       <Text style={styles.deliveryText}>Select Delivery Address</Text>

//       {loading ? (
//         <ActivityIndicator size="large" color="#5C321D" style={{ marginTop: hp(5) }} />
//       ) : (
//         <FlatList
//           data={allAddresses}
//           renderItem={renderAddress}
//           keyExtractor={(item) => item.id}
//           contentContainerStyle={{ paddingHorizontal: wp(4), paddingTop: hp(2), paddingBottom: hp(2) }}
//           ItemSeparatorComponent={() => <View style={{ height: hp(1) }} />}
//           ListEmptyComponent={() => (
//             <Text style={{ textAlign: "center", marginTop: hp(5), color: "#999" }}>
//               No addresses found.
//             </Text>
//           )}
//         />
//       )}

//       <TouchableOpacity
//         style={styles.newAddressBtn}
//         onPress={() => navigation.navigate("addNewAddressScreen" as never)}
//         activeOpacity={0.8}
//       >
//         <Text style={styles.newAddressText}>Add New Address</Text>
//       </TouchableOpacity>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff" },
//   deliveryText: { paddingTop: hp(3), marginHorizontal: wp(6), fontSize: hp(2), fontWeight: "500" },
//   addressCard: {
//     flexDirection: "row",
//     padding: hp(2.5),
//     borderRadius: hp(1.5),
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.06,
//     shadowRadius: 4,
//     elevation: 1,
//   },
//   addressIcon: {
//     width: wp(10),
//     height: wp(10),
//     borderRadius: wp(5),
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: wp(3),
//   },
//   addressType: { fontSize: hp(2.0), fontWeight: "700" },
//   addressLine1: { fontSize: hp(1.7), marginTop: hp(0.3) },
//   addressLine2: { fontSize: hp(1.5), marginTop: hp(0.3) },
//   newAddressBtn: {
//     backgroundColor: "#5C321D",
//     marginHorizontal: wp(6),
//     marginVertical: hp(4),
//     paddingVertical: hp(2),
//     borderRadius: hp(1.5),
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   newAddressText: { color: "#FFF", fontSize: hp(2.0), fontWeight: "600" },
// });

// export default ChangeAddressScreen;
// src/screens/ChangeAddressScreen.tsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  RefreshControl,
  StatusBar,
} from "react-native";
import CommonHeader from "@/src/Common/CommonHeader";
import { hp, wp } from "@/src/assets/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { getLocationFromStorage } from "@/src/assets/utils/locationStorage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAddress } from "@/src/context/addressContext";
import axiosClient from "@/src/api/client";
import { SafeAreaView } from "react-native-safe-area-context";

type AddressItem = {
  id: string;
  addressType: string;
  fullName?: string;
  phoneNumber?: string;
  pincode?: string;
  state?: string;
  city?: string;
  houseNumber?: string;
  roadArea?: string;
  landmark?: string;
  // internal display fields used to speed up rendering
  _line1?: string;
  _line2?: string;
  _isSavedLocation?: boolean;
};

/** Small memoized address card to avoid re-render churn */
const AddressCard = React.memo(
  ({
    item,
    onPress,
    selected,
  }: {
    item: AddressItem;
    onPress: (it: AddressItem) => void;
    selected: boolean;
  }) => {
    return (
      <Pressable
        onPress={() => onPress(item)}
        style={[
          styles.addressCard,
          { backgroundColor: selected ? "#5C321D" : "#F5F5F5" },
        ]}
      >
        <View
          style={[
            styles.addressIcon,
            {
              backgroundColor: selected
                ? "rgba(255,255,255,0.3)"
                : "rgba(0,0,0,0.05)",
            },
          ]}
        >
          <Ionicons
            name={
              item._isSavedLocation
                ? "locate-outline"
                : item.addressType?.toLowerCase?.() === "home"
                ? "home"
                : "business"
            }
            size={hp(3)}
            color={selected ? "#FFF" : "#8E8E8E"}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[styles.addressType, { color: selected ? "#FFF" : "#333" }]}>
            {item.addressType}
          </Text>
          <Text
            style={[styles.addressLine1, { color: selected ? "#FFF" : "#666" }]}
            numberOfLines={2}
          >
            {item._line1}
          </Text>
          {item._line2 ? (
            <Text
              style={[styles.addressLine2, { color: selected ? "#EEE" : "#999" }]}
              numberOfLines={1}
            >
              {item._line2}
            </Text>
          ) : null}
        </View>

        {selected && (
          <Ionicons
            name="checkmark-circle"
            size={hp(3)}
            color="#FFF"
            style={{ marginLeft: wp(2) }}
          />
        )}
      </Pressable>
    );
  },
  (prev, next) => {
    // shallow compare selection and id only — prevents re-render when other unrelated props change
    return prev.item.id === next.item.id && prev.selected === next.selected;
  }
);

const ChangeAddressScreen = () => {
  const [selectedId, setSelectedId] = useState<string>("");
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [savedLocation, setSavedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const navigation = useNavigation();
  const { selectedAddress, setSelectedAddress, ready } = useAddress();

  const fetchAbortRef = useRef<AbortController | null>(null);

  // Preselect from context when ready
  useEffect(() => {
    if (ready && selectedAddress) {
      setSelectedId(selectedAddress.id);
    }
  }, [ready, selectedAddress]);

  // Load saved GPS location (if any)
  const loadSavedLocation = useCallback(async () => {
    try {
      const location = await getLocationFromStorage();
      if (location && typeof location.latitude === "number" && typeof location.longitude === "number") {
        setSavedLocation({ latitude: location.latitude, longitude: location.longitude });
      } else {
        setSavedLocation(null);
      }
    } catch (err) {
      console.warn("loadSavedLocation failed", err);
      setSavedLocation(null);
    }
  }, []);

  // Fetch addresses from API using axiosClient (interceptors attach token)
  const fetchAddresses = useCallback(async (signal?: AbortSignal) => {
    setLoading((s) => (signal ? s : true));
    try {
      const res = await axiosClient.get("/api/address/list", {
        timeout: 10000,
        signal: signal as any,
      });

      const data = Array.isArray(res.data) ? res.data : res.data?.data ?? res.data?.items ?? [];
      // sanitize and add precomputed display fields to each address
      const mapped: AddressItem[] = (data as AddressItem[]).map((a: any) => {
        const line1 = `${a.houseNumber || ""}${a.houseNumber ? ", " : ""}${a.roadArea || ""}${a.roadArea ? ", " : ""}${a.city || ""}${a.state ? `, ${a.state}` : ""}${a.pincode ? ` - ${a.pincode}` : ""}`.trim();
        const line2 = (a.landmark || "").trim();
        return { ...a, _line1: line1, _line2: line2, _isSavedLocation: false };
      });

      setAddresses(mapped);
    } catch (err: any) {
      if (!(err?.name === "CanceledError" || err?.message === "canceled")) {
        console.warn("fetchAddresses error", err);
        Alert.alert("Error", "Failed to fetch addresses. Please try again.");
        setAddresses([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Compose list containing savedLocation first (if present)
  const allAddresses = useMemo(() => {
    if (!savedLocation) return addresses;
    const saved: AddressItem = {
      id: "saved_location",
      addressType: "Current Location",
      fullName: "",
      phoneNumber: "",
      pincode: "",
      state: "",
      city: `Lat: ${savedLocation.latitude.toFixed(6)}`,
      houseNumber: `Lng: ${savedLocation.longitude.toFixed(6)}`,
      roadArea: "",
      landmark: "",
      _line1: `Lat: ${savedLocation.latitude.toFixed(6)}, Lng: ${savedLocation.longitude.toFixed(6)}`,
      _line2: "",
      _isSavedLocation: true,
    };
    return [saved, ...addresses];
  }, [savedLocation, addresses]);

  // refresh handler for pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadSavedLocation();
    // abort any previous
    fetchAbortRef.current?.abort();
    const controller = new AbortController();
    fetchAbortRef.current = controller;
    fetchAddresses(controller.signal);
  }, [fetchAddresses, loadSavedLocation]);

  // initial load + focus refresh
  useFocusEffect(
    useCallback(() => {
      loadSavedLocation();
      // abort previous fetch if any
      fetchAbortRef.current?.abort();
      const controller = new AbortController();
      fetchAbortRef.current = controller;
      fetchAddresses(controller.signal);

      return () => {
        // clean up abort controller on blur
        fetchAbortRef.current?.abort();
      };
    }, [fetchAddresses, loadSavedLocation])
  );

  // onSelect: update selection locally and persist immediately via context
  const onSelectAddress = useCallback(
    async (item: AddressItem) => {
      try {
        setSelectedId(item.id);
        await setSelectedAddress(item); // persist via context (handles AsyncStorage inside)
      } catch (err) {
        console.warn("setSelectedAddress failed", err);
        Alert.alert("Error", "Could not select address. Please try again.");
      }
    },
    [setSelectedAddress]
  );

  // navigation helpers
  const goAddNew = useCallback(() => navigation.navigate("addNewAddressScreen" as never), [navigation]);

  // small performance helpers for FlatList
  const keyExtractor = useCallback((it: AddressItem) => it.id, []);
  const getItemLayout = useCallback(
    (_data: any, index: number) => ({
      length: hp(12) + hp(1), // approximate row height
      offset: (hp(12) + hp(1)) * index,
      index,
    }),
    []
  );

  return (
    <SafeAreaView style={styles.container}>
            <StatusBar
        barStyle="dark-content"   // or "light-content" depending on your background
        backgroundColor="#F6F4F1" // same as your screen background
        translucent={false}       // false ensures the content is below status bar
      />
      <CommonHeader title="Change Address" />
      <Text style={styles.deliveryText}>Select Delivery Address</Text>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#5C321D" style={{ marginTop: hp(5) }} />
      ) : (
        <FlatList
          data={allAddresses}
          renderItem={({ item }) => (
            <AddressCard item={item} onPress={onSelectAddress} selected={selectedId === item.id} />
          )}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ paddingHorizontal: wp(4), paddingTop: hp(2), paddingBottom: hp(2) }}
          ItemSeparatorComponent={() => <View style={{ height: hp(1) }} />}
          ListEmptyComponent={() => (
            <Text style={{ textAlign: "center", marginTop: hp(5), color: "#999" }}>
              No addresses found.
            </Text>
          )}
          initialNumToRender={6}
          windowSize={8}
          removeClippedSubviews={Platform.OS === "android"}
          getItemLayout={getItemLayout}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5C321D" />}
        />
      )}

      <TouchableOpacity style={styles.newAddressBtn} onPress={goAddNew} activeOpacity={0.8}>
        <Text style={styles.newAddressText}>Add New Address</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  deliveryText: { paddingTop: hp(3), marginHorizontal: wp(6), fontSize: hp(2), fontWeight: "500" },
  addressCard: {
    flexDirection: "row",
    padding: hp(2.5),
    borderRadius: hp(1.5),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  addressIcon: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(3),
  },
  addressType: { fontSize: hp(2.0), fontWeight: "700" },
  addressLine1: { fontSize: hp(1.7), marginTop: hp(0.3) },
  addressLine2: { fontSize: hp(1.5), marginTop: hp(0.3) },
  newAddressBtn: {
    backgroundColor: "#5C321D",
    marginHorizontal: wp(6),
    marginVertical: hp(4),
    paddingVertical: hp(2),
    borderRadius: hp(1.5),
    justifyContent: "center",
    alignItems: "center",
  },
  newAddressText: { color: "#FFF", fontSize: hp(2.0), fontWeight: "600" },
});

export default ChangeAddressScreen;
