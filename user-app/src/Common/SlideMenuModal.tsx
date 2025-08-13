import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  TouchableOpacity,
  FlatList,
  Modal,
} from "react-native";
import { BlurView } from "expo-blur";
import Ionicons from "@expo/vector-icons/Ionicons";
import { hp, wp } from "@/src/assets/utils/responsive";
import theme from "@/src/assets/colors/theme";
import { LinearGradient } from "expo-linear-gradient";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

interface MenuItem {
  label: string;
  icon: string;
  screen: string;
}

const menuItems: MenuItem[] = [
  { label: "Home", icon: "home-outline", screen: "userTabScreen" },
  { label: "Orders", icon: "receipt-outline", screen: "orderScreen" },
  { label: "Shops", icon: "storefront-outline", screen: "Shops" },
  { label: "Subscription", icon: "card-outline", screen: "subscriptionScreen" },
  { label: "About", icon: "information-circle-outline", screen: "aboutScreen" },
  { label: "Rate App", icon: "star-outline", screen: "rateAppScreen" },
  { label: "Share App", icon: "share-social-outline", screen: "shareAppScreen" },
  { label: "Logout", icon: "log-out-outline", screen: "loginScreen" },
];

const SideMenuModal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />

      <View style={styles.centeredView}>
        <View style={styles.menuContainer}>
          {/* Header with Logo and Close */}
          <View style={styles.menuHeader}>
            <View style={styles.logoContainer}>
              <Image
                source={{
                  uri: "https://static.vecteezy.com/system/resources/previews/002/686/081/non_2x/breakfast-tea-cup-appetizing-delicious-food-icon-flat-on-white-background-free-vector.jpg",
                }}
                style={styles.logoImage}
              />
              <View style={{ marginLeft: wp(2) }}>
                <Text style={styles.logoTextMain}>CLICK</Text>
                <Text style={styles.logoTextMain}>TEA</Text>
                <Text style={styles.logoSubText}>Just click and get tea</Text>
              </View>
            </View>

            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close-outline" size={28} color="#000" />
            </Pressable>
          </View>

          {/* Menu Items */}
          <FlatList
            data={menuItems}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.menuWrapper}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  onClose();
                  navigation.navigate(item.screen as never);
                }}
              >
                <LinearGradient
                  colors={["#fff", "#f0f0f0"]}
                  style={{
                    borderRadius: 12,
                    padding: 6,
                    marginRight: wp(3),
                  }}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={hp(2.5)}
                    color={theme.PRIMARY_COLOR}
                  />
                </LinearGradient>
                <Text style={styles.menuText}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

export default SideMenuModal;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingTop: hp(5),
  },
  menuContainer: {
    width: wp(65),
    height: "82%",
    backgroundColor: "white",
    paddingTop: hp(6),
    paddingHorizontal: wp(5),
    borderRadius: wp(5),
    shadowColor: "#943400",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
    marginVertical: hp(5),
    marginLeft: wp(3),
    borderWidth: 1,
    borderColor: "#943400",
  },
  menuWrapper: {
    flexDirection: "column",
    marginTop: hp(3),
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(3.2),
  },
  menuText: {
    fontSize: hp(2.1),
    color: theme.PRIMARY_COLOR,
    marginLeft: wp(2),
    fontWeight: "500",
  },
  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImage: {
    height: hp(7),
    width: hp(7),
    borderRadius: hp(1.5),
  },
  logoTextMain: {
    color: "red",
    fontSize: hp(3),
    fontWeight: "bold",
    lineHeight: hp(3.2),
  },
  logoSubText: {
    fontSize: hp(1.2),
    color: "#555",
    fontWeight: "600",
    fontStyle: "italic",
  },
  closeBtn: {
    padding: hp(0.5),
  },
});
