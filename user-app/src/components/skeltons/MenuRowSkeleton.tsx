// src/components/skeltons/MenuRowSkeleton.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { hp, wp } from "@/src/assets/utils/responsive";
import Shimmer from "../Shimmer/Shimmer";

const IMAGE_SIZE_W = wp(18);
const IMAGE_SIZE_H = wp(18);
const ROW_HEIGHT = hp(12);

const MenuRowSkeleton: React.FC<{ style?: any }> = ({ style }) => {
  return (
    <View style={[styles.row, style]}>
      <View style={styles.left}>
        <Shimmer width={IMAGE_SIZE_W} height={IMAGE_SIZE_H} borderRadius={wp(2)} />
      </View>

      <View style={styles.center}>
        <Shimmer width="70%" height={hp(2.2)} borderRadius={6} style={{ marginBottom: hp(0.6) }} />
        <Shimmer width="100%" height={hp(1.6)} borderRadius={6} style={{ marginBottom: hp(0.6) }} />
        <Shimmer width="40%" height={hp(1.8)} borderRadius={6} />
      </View>

      <View style={styles.right}>
        <Shimmer width={wp(18)} height={hp(2.4)} borderRadius={6} />
        <Shimmer width={wp(18)} height={hp(3.2)} borderRadius={8} style={{ marginTop: hp(1) }} />
      </View>
    </View>
  );
};

export default React.memo(MenuRowSkeleton);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(1),
  },
  left: {
    width: IMAGE_SIZE_W,
    height: IMAGE_SIZE_H,
    borderRadius: wp(2),
    backgroundColor: "#fff",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  center: { flex: 1, marginLeft: wp(3), justifyContent: "center" },
  right: { width: wp(28), alignItems: "flex-end", justifyContent: "center" },
});
