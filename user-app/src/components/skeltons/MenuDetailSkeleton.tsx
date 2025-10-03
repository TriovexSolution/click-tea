import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { hp, wp } from "@/src/assets/utils/responsive"; // keep your helpers
import ShimmerDiagonal from "./ShimmerDiagonal";

/**
 * A skeleton that resembles your Product Details screen:
 * - Large hero shimmer
 * - Title/subtitle lines
 * - Meta row placeholders
 * - Two small feature cards
 * - Accordion-like cards (title + small lines)
 *
 * Use while your API is loading.
 */

const MenuDetailSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* hero */}
      <View style={styles.heroWrapper}>
        <ShimmerDiagonal height={hp(28)} borderRadius={12} highlightWidth={200} duration={1000} tilt={18} />
      </View>

      {/* info block */}
      <View style={styles.info}>
        <View style={{ width: "65%" }}>
          <ShimmerDiagonal height={hp(3.2)} borderRadius={6} highlightWidth={120} duration={900} />
        </View>
        <View style={{ height: hp(1.2) }} />
        <View style={{ width: "40%" }}>
          <ShimmerDiagonal height={hp(2)} borderRadius={6} highlightWidth={100} duration={900} />
        </View>

        {/* meta row */}
        <View style={styles.metaRow}>
          <ShimmerDiagonal height={hp(3.2)} width={wp(22)} borderRadius={8} highlightWidth={90} duration={900} />
          <ShimmerDiagonal height={hp(3.2)} width={wp(22)} borderRadius={8} highlightWidth={90} duration={900} />
          <ShimmerDiagonal height={hp(3.2)} width={wp(18)} borderRadius={8} highlightWidth={90} duration={900} />
        </View>

        {/* price */}
        <View style={{ marginTop: hp(1.2), width: "35%" }}>
          <ShimmerDiagonal height={hp(3.6)} borderRadius={8} highlightWidth={120} duration={900} />
        </View>
      </View>

      {/* feature row */}
      <View style={styles.featureRow}>
        <ShimmerDiagonal width={wp(44)} height={hp(8)} borderRadius={10} highlightWidth={140} />
        <ShimmerDiagonal width={wp(44)} height={hp(8)} borderRadius={10} highlightWidth={140} />
      </View>

      {/* accordion/card placeholders */}
      <View style={styles.card}>
        <ShimmerDiagonal height={hp(3.2)} borderRadius={6} width={"55%"} />
        <View style={{ height: hp(1) }} />
        <ShimmerDiagonal height={hp(2.4)} borderRadius={6} width={"90%"} />
        <View style={{ height: hp(0.8) }} />
        <ShimmerDiagonal height={hp(2.4)} borderRadius={6} width={"75%"} />
      </View>

      <View style={{ height: hp(12) }} />
    </View>
  );
};

export default MenuDetailSkeleton;

const styles = StyleSheet.create({
  container: { paddingHorizontal: wp(4), paddingTop: hp(1.5), backgroundColor: "#fff" },
  heroWrapper: { marginBottom: hp(2) },
  info: { paddingBottom: hp(1) },
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginTop: hp(1.2) },
  featureRow: { flexDirection: "row", justifyContent: "space-between", marginTop: hp(2) },
  card: {
    marginTop: hp(2),
    borderRadius: 10,
    backgroundColor: "#fff",
    paddingVertical: hp(1),
    paddingHorizontal: wp(1),
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
});
