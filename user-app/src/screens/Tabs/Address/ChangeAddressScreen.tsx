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
import { getUserIdFromToken } from "@/src/assets/utils/getUserIdFromToken";

type AddressItem = {
  id: string;
  addressType: string;
  fullName: string;
  phoneNumber: string;
  pincode: string;
  state: string;
  city: string;
  houseNumber?: string;
  roadArea?: string;
  landmark?: string;
};

const ChangeAddressScreen = () => {
  const [selectedId, setSelectedId] = useState<string>("");
  const [savedLocation, setSavedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation();

  // Get stored token for auth header
  const getToken = async () => {
    try {
      return await AsyncStorage.getItem("authToken");
    } catch {
      return null;
    }
  };

  // Load saved location from local storage
  const loadSavedLocation = async () => {
    try {
      const location = await getLocationFromStorage();
      if (
        location &&
        typeof location.latitude === "number" &&
        typeof location.longitude === "number"
      ) {
        setSavedLocation({ latitude: location.latitude, longitude: location.longitude });
      }
    } catch (e) {
      Alert.alert("Error", "Failed to load saved location");
    }
  };

  // Fetch addresses from API
  const fetchAddresses = async () => {
    setLoading(true);
    try {
     const token = await getToken(); 
    if (!token) {
      Alert.alert("Error", "User is not logged in");
      setLoading(false);
      return;
    }
      const response = await axios.get(`${BASE_URL}/api/address/list`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (response.status === 200 && Array.isArray(response.data)) {
        setAddresses(response.data);
      } else {
        Alert.alert("Error", "Failed to fetch addresses");
      }
    } catch (error) {
      Alert.alert("Error", "Network error or unauthorized");
    } finally {
      setLoading(false);
    }
  };

  // Use focus effect to refresh addresses whenever screen is focused
  useFocusEffect(
    useCallback(() => {
      loadSavedLocation();
      fetchAddresses();
    }, [])
  );

  // Combine saved location (if any) with fetched addresses
  const allAddresses = savedLocation
    ? [
        {
          id: "saved_location",
          addressType: "Saved Location",
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

  const renderAddress = ({ item }: { item: AddressItem }) => {
    const isSelected = selectedId === item.id;
    const isDisabled = !isSelected && selectedId !== "";

    // Format addressLine1 and addressLine2 for display
    const addressLine1 = `${item.houseNumber || ""}${item.houseNumber ? ", " : ""}${item.roadArea || ""}${item.roadArea ? ", " : ""}${item.city}, ${item.state} - ${item.pincode}`;
    const addressLine2 = item.landmark || "";

    return (
      <Pressable
        onPress={() => {
          if (isDisabled) return;
          setSelectedId(isSelected ? "" : item.id);
        }}
        disabled={isDisabled}
        style={[
          styles.addressCard,
          {
            backgroundColor: isSelected ? "#5C321D" : "#F5F5F5",
            opacity: isDisabled ? 0.5 : 1,
          },
        ]}
      >
        <View
          style={[
            styles.addressIcon,
            { backgroundColor: isSelected ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.1)" },
          ]}
        >
          <Ionicons
            name={
              item.id === "saved_location"
                ? "locate-outline"
                : item.addressType.toLowerCase() === "home"
                ? "home"
                : "business"
            }
            size={hp(3)}
            color={isSelected ? "#FFF" : "#8E8E8E"}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[styles.addressType, { color: isSelected ? "#FFF" : "#4A4A4A" }]}>
            {item.addressType}
          </Text>
          <Text style={[styles.addressLine1, { color: isSelected ? "#FFF" : "#6E6E6E" }]}>
            {addressLine1}
          </Text>
          <Text style={[styles.addressLine2, { color: isSelected ? "#D3D3D3" : "#B0B0B0" }]}>
            {addressLine2}
          </Text>
        </View>

        {isSelected && (
          <Ionicons
            name="checkmark-circle"
            size={hp(3)}
            color="#FFF"
            style={{ marginLeft: wp(2) }}
          />
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <CommonHeader title={"Change Address"} />
      <Text style={styles.deliveryText}>Select Delivery Address</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#5C321D" style={{ marginTop: hp(5) }} />
      ) : (
        <FlatList
          data={allAddresses}
          renderItem={renderAddress}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: wp(4), paddingTop: hp(2) }}
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
        onPress={() => navigation.navigate("addNewAddressScreen")}
        activeOpacity={0.8}
      >
        <Text style={styles.newAddressText}>New Address</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  deliveryText: {
    paddingTop: hp(3),
    marginHorizontal: wp(6),
    fontSize: hp(2),
    fontWeight: "500",
  },
  addressCard: {
    flexDirection: "row",
    padding: hp(2.5),
    borderRadius: hp(1.5),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addressIcon: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(3),
  },
  addressType: {
    fontSize: hp(2.2),
    fontWeight: "bold",
  },
  addressLine1: {
    fontSize: hp(1.8),
    marginTop: hp(0.3),
  },
  addressLine2: {
    fontSize: hp(1.5),
    marginTop: hp(0.3),
  },
  newAddressBtn: {
    backgroundColor: "#5C321D",
    marginHorizontal: wp(6),
    marginVertical: hp(4),
    paddingVertical: hp(2),
    borderRadius: hp(1.5),
    justifyContent: "center",
    alignItems: "center",
  },
  newAddressText: {
    color: "#FFF",
    fontSize: hp(2.2),
    fontWeight: "600",
  },
});

export default ChangeAddressScreen;
