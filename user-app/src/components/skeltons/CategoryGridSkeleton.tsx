// src/components/skeltons/CategoryGridSkeleton.tsx
import React, { useMemo } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { hp, wp } from "@/src/assets/utils/responsive";
import { useGlobalShimmer } from "../Shimmer/GlobalShimmerProvider";
import Shimmer from "../Shimmer/Shimmer";

// Use same sizes as ViewAllCategoryScreen
const CARD_SPACING = wp(4);
const CARD_WIDTH = Math.round((wp(100) - CARD_SPACING * 3) / 2);
const IMAGE_SIZE = Math.round(CARD_WIDTH * 0.66);

type Props = {
  columns?: number;
  rows?: number;
  style?: any;
};

const CategoryGridSkeleton: React.FC<Props> = ({ columns = 2, rows = 4, style }) => {
  const { progress } = (() => {
    try {
      return useGlobalShimmer();
    } catch {
      return { progress: undefined as any, disabled: true };
    }
  })();

  // number of items = rows * columns
  const count = useMemo(() => Math.max(1, columns * rows), [columns, rows]);
  const data = useMemo(() => Array.from({ length: count }), [count]);

  return (
    <FlatList
      data={data}
      keyExtractor={(_, i) => `cat-skel-${i}`}
      numColumns={columns}
      showsVerticalScrollIndicator={false}
      columnWrapperStyle={styles.columnWrapper}
      contentContainerStyle={[styles.container, style]}
      renderItem={({ index }) => {
        // for two-column grid make margins consistent
        const isRight = index % columns === columns - 1;
        return (
          <View style={[styles.card, isRight ? { marginLeft: CARD_SPACING } : null]}>
            <Shimmer
              width={IMAGE_SIZE}
              height={IMAGE_SIZE}
              borderRadius={wp(3)}
              sharedProgress={progress}
              style={styles.image}
            />
            <View style={{ height: hp(0.8) }} />
            <Shimmer width="70%" height={hp(2.0)} borderRadius={6} sharedProgress={progress} />
            <View style={{ height: hp(0.6) }} />
            <Shimmer width="40%" height={hp(1.6)} borderRadius={6} sharedProgress={progress} />
          </View>
        );
      }}
      scrollEnabled={false}
    />
  );
};

export default React.memo(CategoryGridSkeleton);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: CARD_SPACING,
    paddingTop: hp(2),
    paddingBottom: hp(4),
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: hp(1.6),
  },
  card: {
    width: CARD_WIDTH,
    alignItems: "center",
    borderRadius: wp(3),
    overflow: "hidden",
  },
  image: {
    backgroundColor: "#f2f2f2",
    marginBottom: hp(0.6),
  },
});

// Why this component

// Matches CategoryCard layout: same CARD_WIDTH, image proportion and paddings.

// Uses useGlobalShimmer() for the single shared animation.

// scrollEnabled={false} so the skeleton scroll behavior is controlled by parent FlatList when used as ListEmptyComponent or in header.