// src/screens/ChangeAddressScreen.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import CommonHeader from "@/src/Common/CommonHeader";
import { hp, wp } from "@/src/assets/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { getLocationFromStorage } from "@/src/assets/utils/locationStorage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "@/api";
import { useAddress } from "@/src/context/addressContext";

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
};

const getTokenFromStorage = async () => {
  try {
    return await AsyncStorage.getItem("authToken");
  } catch (err) {
    console.warn("getTokenFromStorage", err);
    return null;
  }
};

const ChangeAddressScreen = () => {
  const [selectedId, setSelectedId] = useState<string>("");
  const [tempSelectedAddress, setTempSelectedAddress] = useState<AddressItem | null>(null);
  const [savedLocation, setSavedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation();
  const { selectedAddress, setSelectedAddress, ready } = useAddress();

  // preselect existing global selected address
useEffect(() => {
  // wait for context to be ready (loaded from storage)
  if (ready && selectedAddress) {
    setSelectedId(selectedAddress.id);
    setTempSelectedAddress(selectedAddress as AddressItem);
  }
}, [selectedAddress, ready]);
  // load saved location (your helper)
  const loadSavedLocation = async () => {
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
  };

  // fetch addresses from API
  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getTokenFromStorage();
      if (!token) {
        // user not logged in — show empty or fallback
        setAddresses([]);
        setLoading(false);
        return;
      }
      const res = await axios.get(`${BASE_URL}/api/address/list`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });

      if (res.status === 200 && Array.isArray(res.data)) {
        setAddresses(res.data);
      } else {
        console.warn("Unexpected response from address list", res.status, res.data);
        setAddresses([]);
      }
    } catch (err) {
      console.warn("fetchAddresses error", err);
      Alert.alert("Error", "Failed to fetch addresses. Please try again.");
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // refresh on focus
  useFocusEffect(
    useCallback(() => {
      loadSavedLocation();
      fetchAddresses();
    }, [fetchAddresses])
  );

  // Persist the temp selection to global context when screen blurs (user navigates back)
  useFocusEffect(
    useCallback(() => {
      return () => {
        // blur
        if (tempSelectedAddress) {
          // setSelectedAddress handles persistence to AsyncStorage
          setSelectedAddress(tempSelectedAddress).catch((e) => console.warn("persist addr error", e));
        }
      };
    }, [tempSelectedAddress, setSelectedAddress])
  );

  // combine savedLocation (first item) with fetched addresses
  const allAddresses: AddressItem[] = savedLocation
    ? [
        {
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
        },
        ...addresses,
      ]
    : addresses;

  const onSelectAddress = (item: AddressItem) => {
    // single-select; allow switching; never toggle off to none via tap
    if (selectedId !== item.id) {
      setSelectedId(item.id);
      setTempSelectedAddress(item);
    }
  };

  const renderAddress = ({ item }: { item: AddressItem }) => {
    const isSelected = selectedId === item.id;

    const addressLine1 = `${item.houseNumber || ""}${item.houseNumber ? ", " : ""}${
      item.roadArea || ""
    }${item.roadArea ? ", " : ""}${item.city || ""}${item.state ? `, ${item.state}` : ""}${
      item.pincode ? ` - ${item.pincode}` : ""
    }`;
    const addressLine2 = item.landmark || "";

    return (
      <Pressable
        onPress={() => onSelectAddress(item)}
        style={[
          styles.addressCard,
          {
            backgroundColor: isSelected ? "#5C321D" : "#F5F5F5",
          },
        ]}
      >
        <View
          style={[
            styles.addressIcon,
            { backgroundColor: isSelected ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.05)" },
          ]}
        >
          <Ionicons
            name={
              item.id === "saved_location"
                ? "locate-outline"
                : item.addressType?.toLowerCase?.() === "home"
                ? "home"
                : "business"
            }
            size={hp(3)}
            color={isSelected ? "#FFF" : "#8E8E8E"}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[styles.addressType, { color: isSelected ? "#FFF" : "#333" }]}>
            {item.addressType}
          </Text>
          <Text style={[styles.addressLine1, { color: isSelected ? "#FFF" : "#666" }]}>
            {addressLine1}
          </Text>
          {addressLine2 ? (
            <Text style={[styles.addressLine2, { color: isSelected ? "#EEE" : "#999" }]}>
              {addressLine2}
            </Text>
          ) : null}
        </View>

        {isSelected && <Ionicons name="checkmark-circle" size={hp(3)} color="#FFF" style={{ marginLeft: wp(2) }} />}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <CommonHeader title="Change Address" />
      <Text style={styles.deliveryText}>Select Delivery Address</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#5C321D" style={{ marginTop: hp(5) }} />
      ) : (
        <FlatList
          data={allAddresses}
          renderItem={renderAddress}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: wp(4), paddingTop: hp(2), paddingBottom: hp(2) }}
          ItemSeparatorComponent={() => <View style={{ height: hp(1) }} />}
          ListEmptyComponent={() => (
            <Text style={{ textAlign: "center", marginTop: hp(5), color: "#999" }}>
              No addresses found.
            </Text>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.newAddressBtn}
        onPress={() => navigation.navigate("addNewAddressScreen" as never)}
        activeOpacity={0.8}
      >
        <Text style={styles.newAddressText}>Add New Address</Text>
      </TouchableOpacity>
    </View>
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
