// src/components/skeltons/CarouselSkeleton.tsx
import React from "react";
import { View } from "react-native";
import { wp, hp } from "@/src/assets/utils/responsive";
import Shimmer from "../Shimmer/Shimmer";

const HeroHeight = Math.round(hp(20));

const CarouselSkeleton = ({ sharedProgress }: any) => {
  return (
    <View style={{ paddingHorizontal: wp(4), paddingVertical: hp(1) }}>
      <Shimmer width="100%" height={HeroHeight} borderRadius={12} sharedProgress={sharedProgress} />
    </View>
  );
};

export default React.memo(CarouselSkeleton);
