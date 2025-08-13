import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { hp } from "@/src/assets/utils/responsive";
import theme from "@/src/assets/colors/theme";

const DividerWithText = ({
  text = "",
  textStyle = {},
  lineColor = theme.PRIMARY_COLOR,
}) => {
  return (
    <View style={styles.container}>
      <View style={[styles.line, { backgroundColor: lineColor }]} />
      <Text style={[styles.text, textStyle]}>{text}</Text>
      <View style={[styles.line, { backgroundColor: lineColor }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(1.5),
  },
  line: {
    flex: 1,
    height: 1,
  },
  text: {
  fontSize: 15,
    color: "#943400",
    fontFamily: theme.PRIMARY_FONT_FAMILY,
    marginHorizontal: 10
  },
});

export default DividerWithText;
      //  <View
      //     style={{
      //       flexDirection: "row",
      //       alignItems: "center",
      //       marginTop: hp(1.5),
      //     }}
      //   >
      //     <View
      //       style={{
      //         flex: 1,
      //         height: 1,
      //         backgroundColor: theme.NEW_PRIMARY_COLOR,
      //       }}
      //     />

      //     <Text style={[styles.mainAllHometext, { marginHorizontal: 10 }]}>
      //       Recommended Shops
      //     </Text>

      //     <View
      //       style={{
      //         flex: 1,
      //         height: 1,
      //         backgroundColor: theme.NEW_PRIMARY_COLOR,
      //       }}
      //     />
      //   </View>