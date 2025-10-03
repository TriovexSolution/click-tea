// src/components/skeltons/ShopsSkeletonList.tsx
import React, { useRef, useState } from "react";
import { FlatList } from "react-native";
import ShopSkeleton from "./ShopSkeleton";
import { useGlobalShimmer } from "../Shimmer/GlobalShimmerProvider";

type Props = { count?: number; itemHeight?: number };

const ShopsSkeletonList: React.FC<Props> = ({ count = 6, itemHeight = Math.round( (20 * 2) + 16 ) }) => {
  // Use global shimmer progress
  const { progress } = useGlobalShimmer();
  const [visibleSet, setVisibleSet] = useState<Set<number>>(new Set());
  const viewabilityConfig = { itemVisiblePercentThreshold: 30 };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    const s = new Set<number>();
    viewableItems.forEach((v: any) => {
      if (typeof v.index === "number") s.add(v.index);
    });
    setVisibleSet(s);
  });

  return (
    <FlatList
      data={Array.from({ length: count })}
      keyExtractor={(_, i) => `skeleton-${i}`}
      renderItem={({ index }) => (
        <ShopSkeleton
          animate={visibleSet.has(index)}
          sharedProgress={visibleSet.has(index) ? progress : undefined}
        />
      )}
      initialNumToRender={3}
      maxToRenderPerBatch={4}
      windowSize={5}
      onViewableItemsChanged={onViewableItemsChanged.current}
      viewabilityConfig={viewabilityConfig}
      getItemLayout={(_d, index) => ({ length: itemHeight, offset: itemHeight * index, index })}
    />
  );
};

export default ShopsSkeletonList;
// Notes

// visibleSet keeps only visible indexes animated.

// getItemLayout helps with initial scroll performance (pass correct itemHeight).