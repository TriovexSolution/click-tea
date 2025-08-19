import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { checkAvailability } from "@/src/Redux/Slice/serviceAvailablilitySlice";
import { RootState } from "@/src/Redux/store";
import { useNavigation } from "@react-navigation/native";
import NearestShopModal from "@/src/assets/Modals/NearestShopModal";

const AvailabilityGate = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const { latitude, longitude } = useSelector((s: RootState) => s.location);
  const { serviceable, checking } = useSelector((s: RootState) => s.service);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (latitude && longitude) {
      dispatch(checkAvailability({ lat: latitude, lng: longitude }) as any);
    }
  }, [latitude, longitude]);

  useEffect(() => {
    if (!latitude || !longitude) {
      navigation.replace("locationScreen");
    } else if (serviceable === false) {
      navigation.replace("serviceNotAvailable");
    } else if (serviceable === true) {
      setShowModal(true); // show modal
    }
  }, [latitude, longitude, serviceable]);

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text>Checking service availability...</Text>
      </View>
    );
  }

  return <NearestShopModal visible={showModal} />;
};

export default AvailabilityGate;
