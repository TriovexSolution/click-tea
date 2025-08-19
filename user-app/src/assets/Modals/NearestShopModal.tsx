import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/src/Redux/store";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { hp, wp } from "@/src/assets/utils/responsive";

const NearestShopModal = ({ visible }: { visible: boolean }) => {
  const navigation = useNavigation<any>();
  const { nearestShop } = useSelector((state: RootState) => state.service);

  const scale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 12 });
    } else {
      scale.value = withTiming(0);
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }));

  if (!nearestShop) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <Animated.View style={[styles.modalContainer, animatedStyle]}>
          <Text style={styles.title}>Service Available!</Text>
          <Text style={styles.shopName}>{nearestShop.shopname}</Text>
          <Text style={styles.distance}>
            {nearestShop.distance.toFixed(2)} km away
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.replace("bottomTabScreen")}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default NearestShopModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#00000055",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: wp(80),
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: wp(5),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: hp(3),
    fontWeight: "bold",
    marginBottom: hp(1.5),
  },
  shopName: {
    fontSize: hp(2.5),
    fontWeight: "600",
    marginBottom: hp(0.8),
  },
  distance: {
    fontSize: hp(2),
    color: "#555",
    marginBottom: hp(2.5),
  },
  button: {
    backgroundColor: "#ff6600",
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(10),
    borderRadius: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: hp(2),
    fontWeight: "600",
  },
});
