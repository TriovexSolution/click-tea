import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Pressable,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import CommonHeader from "@/src/Common/CommonHeader";

const { width } = Dimensions.get("window");

const offers = [
  { id: "1", title: "50% OFF on Pizza", subtitle: "Valid till 20 Sept" },
  { id: "2", title: "Free Coffee", subtitle: "On orders above ₹299" },
  { id: "3", title: "20% OFF Grocery", subtitle: "Valid till 25 Sept" },
  { id: "4", title: "Buy 1 Get 1 Burger", subtitle: "Weekend Special" },
  { id: "5", title: "Flat ₹100 OFF", subtitle: "Valid till 30 Sept" },
  { id: "6", title: "Free Dessert", subtitle: "On Dinner Orders" },
];

const gradients = [
  ["#ff9a9e", "#fad0c4"],
  ["#a18cd1", "#fbc2eb"],
  ["#f6d365", "#fda085"],
  ["#84fab0", "#8fd3f4"],
  ["#ffecd2", "#fcb69f"],
  ["#ff6a88", "#ff99ac"],
];

const TicketCard = ({ item, index }: any) => {
  const [pressed, setPressed] = useState(false);
  const gradientColors = gradients[index % gradients.length];

  return (
    <Pressable
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={({ pressed: isPressed }) => [
        styles.card,
        {
          transform: [{ scale: isPressed || pressed ? 1.05 : 1 }],
          shadowOpacity: isPressed || pressed ? 0.35 : 0.15,
          shadowRadius: isPressed || pressed ? 12 : 6,
        },
      ]}
    >
      {/* Left cutout */}
      <View style={styles.cutLeft} />
      {/* Right cutout */}
      <View style={styles.cutRight} />

      <LinearGradient colors={gradientColors} style={styles.gradient}>
        <View style={styles.content}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </View>

        {/* Dotted divider */}
        <View style={styles.dividerContainer}>
          {Array.from({ length: 20 }).map((_, i) => (
            <View key={i} style={styles.dash} />
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.code}>#OFFER{item.id}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
};

const OfferScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
  barStyle="dark-content"   // or "light-content" depending on your background
  backgroundColor="#F6F4F1" // same as your screen background
  translucent={false}       // false ensures the content is below status bar
/>

      <CommonHeader title="Offer"/>
      <FlatList
        data={offers}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <TicketCard item={item} index={index} />}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={{ padding: 16 }}
      />
    </SafeAreaView>
  );
};

export default OfferScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  card: {
    width: width / 2.2,
    height: 170,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: "#fff",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  gradient: {
    flex: 1,
    width: "100%",
    height: "100%",
    padding: 12,
    justifyContent: "space-between",
  },
  content: {
    alignItems: "center",
    marginTop: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  subtitle: { fontSize: 12, color: "#fff", marginTop: 4, textAlign: "center" },

  footer: {
    alignItems: "center",
    marginBottom: 8,
  },
  code: { fontSize: 12, color: "#fff", fontWeight: "600" },

  // Divider
  dividerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 8,
  },
  dash: {
    width: 6,
    height: 1,
    backgroundColor: "#fff",
    marginHorizontal: 2,
    opacity: 0.8,
  },

  // Cutouts for ticket shape
  cutLeft: {
    position: "absolute",
    left: -20,
    top: "45%",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f9f9f9",
    zIndex: 10,
  },
  cutRight: {
    position: "absolute",
    right: -20,
    top: "45%",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f9f9f9",
    zIndex: 10,
  },
});
