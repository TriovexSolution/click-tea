import React from "react";
import { View, ScrollView } from "react-native";
import { wp, hp } from "@/src/assets/utils/responsive";
import Shimmer from "@/src/components/Shimmer/Shimmer";

const CardHeight = Math.round(hp(12));

const OrdersSkeleton = ({ count = 4, sharedProgress }: { count?: number; sharedProgress?: any }) => {
  const items = Array.from({ length: count });

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: wp(5), paddingVertical: hp(2) }}>
      {items.map((_, i) => (
        <View
          key={i}
          style={{
            marginBottom: hp(1.5),
            borderRadius: 12,
            overflow: "hidden",
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: "#F2F2F2",
            padding: wp(3),
          }}
        >
          {/* header row */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Shimmer width={wp(35)} height={hp(2.2)} borderRadius={6} sharedProgress={sharedProgress} />
            <Shimmer width={wp(20)} height={hp(2)} borderRadius={12} sharedProgress={sharedProgress} />
          </View>

          {/* items lines */}
          <View style={{ marginTop: hp(1) }}>
            <Shimmer width="80%" height={hp(1.6)} borderRadius={6} sharedProgress={sharedProgress} style={{ marginBottom: hp(0.6) }} />
            <Shimmer width="60%" height={hp(1.6)} borderRadius={6} sharedProgress={sharedProgress} style={{ marginBottom: hp(0.6) }} />
          </View>

          {/* amount row */}
          <View style={{ marginTop: hp(1) }}>
            <Shimmer width={wp(25)} height={hp(1.8)} borderRadius={6} sharedProgress={sharedProgress} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

export default React.memo(OrdersSkeleton);
