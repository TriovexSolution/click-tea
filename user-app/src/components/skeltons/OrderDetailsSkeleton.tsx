import React from "react";
import { View } from "react-native";
import { wp, hp } from "@/src/assets/utils/responsive";
import Shimmer from "@/src/components/Shimmer/Shimmer";

const OrderDetailsSkeleton = ({ sharedProgress }: { sharedProgress?: any }) => {
  return (
    <View style={{ paddingHorizontal: wp(5), paddingTop: hp(2) }}>
      {/* summary */}
      <View style={{ borderRadius: 12, padding: wp(4), backgroundColor: "#fff", borderWidth: 1, borderColor: "#F2F2F2" }}>
        <Shimmer width={wp(40)} height={hp(2.4)} borderRadius={6} sharedProgress={sharedProgress} />
        <View style={{ height: hp(0.5) }} />
        <Shimmer width={wp(25)} height={hp(1.8)} borderRadius={8} sharedProgress={sharedProgress} />
      </View>

      {/* items */}
      <View style={{ marginTop: hp(2) }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <View
            key={i}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: hp(1.2),
              borderBottomWidth: 1,
              borderBottomColor: "#F4F4F4",
            }}
          >
            <Shimmer width={wp(12)} height={wp(12)} borderRadius={8} sharedProgress={sharedProgress} />
            <View style={{ width: wp(3) }} />
            <View style={{ flex: 1 }}>
              <Shimmer width="60%" height={hp(1.6)} borderRadius={6} sharedProgress={sharedProgress} />
              <View style={{ height: hp(0.6) }} />
              <Shimmer width="30%" height={hp(1.4)} borderRadius={6} sharedProgress={sharedProgress} />
            </View>
            <Shimmer width={wp(20)} height={hp(1.6)} borderRadius={6} sharedProgress={sharedProgress} />
          </View>
        ))}
      </View>

      {/* payment summary */}
      <View style={{ marginTop: hp(2), borderRadius: 12, padding: wp(4), backgroundColor: "#fff", borderWidth: 1, borderColor: "#F2F2F2" }}>
        <Shimmer width={wp(30)} height={hp(2)} borderRadius={6} sharedProgress={sharedProgress} />
        <View style={{ height: hp(0.6) }} />
        <Shimmer width={wp(20)} height={hp(2.6)} borderRadius={6} sharedProgress={sharedProgress} />
      </View>
    </View>
  );
};

export default React.memo(OrderDetailsSkeleton);
