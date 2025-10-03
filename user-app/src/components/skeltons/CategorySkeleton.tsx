// // src/components/skeletons/CategorySkeleton.tsx
// import React from "react";
// import { View, StyleSheet } from "react-native";

// const CategorySkeleton = () => {
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

// export default CategorySkeleton;
// src/components/skeltons/CategorySkeleton.tsx
import React from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { wp, hp } from "@/src/assets/utils/responsive";
import Shimmer from "../Shimmer/Shimmer";

const PILL_W = wp(24);
const PILL_H = hp(3.6);

const CategorySkeleton = ({ sharedProgress, count = 6 }: any) => {
  return (
    <View style={{ paddingHorizontal: wp(4), paddingVertical: hp(1) }}>
      <FlatList
        horizontal
        data={Array.from({ length: count })}
        keyExtractor={(_, i) => String(i)}
        showsHorizontalScrollIndicator={false}
        renderItem={() => <Shimmer width={PILL_W} height={PILL_H} borderRadius={PILL_H / 2} style={{ marginRight: wp(3) }} sharedProgress={sharedProgress} />}
      />
    </View>
  );
};

export default React.memo(CategorySkeleton);
