// // src/components/skeletons/ShopSkeleton.tsx
// import React from "react";
// import { View, StyleSheet } from "react-native";

// const ShopSkeleton = () => {
//   return (
//     <View style={styles.container}>
//       <View style={styles.image} />
//       <View style={styles.text} />
//       <View style={styles.textSmall} />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     margin: 10,
//     padding: 10,
//     borderRadius: 10,
//     backgroundColor: "#f2f2f2",
//   },
//   image: {
//     height: 100,
//     borderRadius: 8,
//     backgroundColor: "#e0e0e0",
//     marginBottom: 10,
//   },
//   text: {
//     height: 20,
//     borderRadius: 5,
//     backgroundColor: "#e0e0e0",
//     marginBottom: 5,
//   },
//   textSmall: {
//     height: 15,
//     borderRadius: 5,
//     backgroundColor: "#e0e0e0",
//     width: "60%",
//   },
// });

// export default ShopSkeleton;
// src/components/skeltons/ShopSkeleton.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { hp, wp } from "@/src/assets/utils/responsive";
import Shimmer from "../Shimmer/Shimmer";

const IMAGE_W = wp(20);
const IMAGE_H = wp(20);

type Props = {
  animate?: boolean;
  sharedProgress?: any;
  style?: any;
};

const ShopSkeleton: React.FC<Props> = ({ animate = true, sharedProgress, style }) => {
  return (
    <View style={[styles.row, style]}>
      <Shimmer width={IMAGE_W} height={IMAGE_H} borderRadius={8} animate={animate} sharedProgress={sharedProgress} style={styles.image} />
      <View style={styles.right}>
        <Shimmer width="60%" height={hp(2.2)} borderRadius={6} animate={animate} sharedProgress={sharedProgress} />
        <View style={{ height: 8 }} />
        <Shimmer width="40%" height={hp(1.6)} borderRadius={6} animate={animate} sharedProgress={sharedProgress} />
        <View style={{ height: 10 }} />
        <View style={styles.tagsRow}>
          <Shimmer width={wp(12)} height={hp(1.4)} borderRadius={8} animate={animate} sharedProgress={sharedProgress} />
          <View style={{ width: 8 }} />
          <Shimmer width={wp(12)} height={hp(1.4)} borderRadius={8} animate={animate} sharedProgress={sharedProgress} />
        </View>
      </View>
    </View>
  );
};

export default React.memo(ShopSkeleton);

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: wp(4), paddingVertical: hp(1.2), borderBottomWidth: 1, borderColor: "#F2F2F2" },
  image: { marginRight: wp(3) },
  right: { flex: 1, paddingLeft: wp(1) },
  tagsRow: { flexDirection: "row", marginTop: hp(0.2) },
});
// Notes

// Sizes match your ShopCard so when you swap to actual content there’s no jump.