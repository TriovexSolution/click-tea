// import React, { useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Linking,
//   Platform,
//   Animated,
//   Image,
//   StatusBar,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { hp, wp } from "@/src/assets/utils/responsive";
// import CommonHeader from "@/src/Common/CommonHeader";
// import { LinearGradient } from "expo-linear-gradient";
// import { Ionicons } from "@expo/vector-icons";
// import theme from "@/src/assets/colors/theme";

// const BRAND_PRIMARY = "#6A3D2C"; // deep coffee
// const BRAND_ACCENT = "#F7A27E"; // warm accent
// const CARD_BG = "#ffffff";

// const AboutUsScreen: React.FC = () => {
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 600,
//       useNativeDriver: true,
//     }).start();
//   }, [fadeAnim]);

//   const openMail = () => Linking.openURL("mailto:support@triovex.com");
//   const openPhone = () => Linking.openURL("tel:9104605682");
//   const openMap = () => {
//     const query = Platform.select({
//       ios: "maps:0,0?q=Koramangala,Bangalore",
//       android: "geo:0,0?q=Koramangala,Bangalore",
//     });
//     if (query) Linking.openURL(query);
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//               <StatusBar
//           barStyle="dark-content"   // or "light-content" depending on your background
//           backgroundColor="#F6F4F1" // same as your screen background
//           translucent={false}       // false ensures the content is below status bar
//         />
//       <CommonHeader title="About Us" />

//       <Animated.View style={[styles.bannerWrap, { opacity: fadeAnim }] }>
//         <LinearGradient
//           colors={[BRAND_PRIMARY, "#8B4A36"]}
//           start={[0, 0]}
//           end={[1, 1]}
//           style={styles.banner}
//         >
//           <View style={styles.brandRow}>
//             <View style={styles.logoCircle}>
//               <Image
//                 source={require("@/src/assets/images/splashImage.jpg")}
//                 style={styles.logo}
//                 resizeMode="cover"
//               />
//             </View>
//             <View style={styles.brandTextWrap}>
//               <Text style={styles.brandTitle}>Click Tea</Text>
//               <Text style={styles.brandSubtitle}>Tea & Coffee, delivered fast</Text>
//             </View>
//           </View>
//         </LinearGradient>
//       </Animated.View>

//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingBottom: hp(4), paddingTop: hp(2) }}
//       >
//         <View style={styles.cardElevated}>
//           <Text style={styles.heading}>Our Mission</Text>
//           <Text style={styles.text}>
//             We make it effortless to enjoy the best tea and coffee from local
//             vendors — fast delivery, secure payments, and delightful mobile
//             experiences. We focus on speed, simplicity, and reliability while
//             supporting small businesses.
//           </Text>
//         </View>

//         <View style={styles.impactSection}>
//           <Text style={[styles.sectionTitle,{paddingHorizontal: wp(4),}]}>Our Impact</Text>
//           <View style={styles.impactRow}>
//             <View style={styles.impactCard}>
//               <View style={styles.impactIconWrap}>
//                 <Text style={styles.impactIcon}>👥</Text>
//               </View>
//               <Text style={styles.impactNumber}>200+</Text>
//               <Text style={styles.impactLabel}>Partner Vendors</Text>
//             </View>

//             <View style={styles.impactCard}>
//               <View style={styles.impactIconWrap}>
//                 <Text style={styles.impactIcon}>📦</Text>
//               </View>
//               <Text style={styles.impactNumber}>1M+</Text>
//               <Text style={styles.impactLabel}>Orders Delivered</Text>
//             </View>
//           </View>
//         </View>

//         <View style={styles.cardElevated}>
//           <Text style={styles.sectionTitle}>Get in Touch</Text>

//           <View style={styles.contactRow}>
//             <TouchableOpacity style={styles.contactBtn} onPress={openMail}>
//                 <Ionicons style={styles.contactEmoji} color={theme.PRIMARY_COLOR} size={hp(3)} name="mail-outline" />
//               <Text style={styles.contactText}>support@triovex.com</Text>
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.contactBtn} onPress={openPhone}>
//               <Ionicons style={styles.contactEmoji} color={theme.PRIMARY_COLOR} size={hp(3)} name="call-outline"/>
//               <Text style={styles.contactText}>+91 9104605682</Text>
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.contactBtn} onPress={openMap}>
//               <Ionicons style={styles.contactEmoji} color={theme.PRIMARY_COLOR} size={hp(3)} name="pin-outline"/>
//               <Text style={styles.contactText}>Koramangala, Bangalore</Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         <Text style={styles.footer}>© 2025 BrewDash. All rights reserved.</Text>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default AboutUsScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F5F5F7",
//     // paddingHorizontal: wp(4),
//   },
//   bannerWrap: {
//     marginTop: hp(1),
     
//   },
//   banner: {
//     height: hp(18),
//     borderRadius: 14,
//     padding: wp(4),
//     justifyContent: "center",
//     shadowColor: "#000",
//     shadowOpacity: 0.15,
//     shadowRadius: 12,
//     // elevation: 8,
//     marginHorizontal: wp(4),
//   },
//   brandRow: { flexDirection: "row", alignItems: "center" },
//   logoCircle: {
//     width: hp(11),
//     height: hp(11),
//     borderRadius: hp(11) / 2,
//     backgroundColor: BRAND_ACCENT,
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: wp(4),
//     shadowColor: "#000",
//     shadowOpacity: 0.18,
//     shadowRadius: 8,
//     // elevation: 6,
//   },
//   logo: { width: hp(9), height: hp(9), borderRadius: hp(9) / 2 },
//   brandTextWrap: {},
//   brandTitle: { fontSize: hp(2.6), fontWeight: "800", color: "#fff" },
//   brandSubtitle: { fontSize: hp(1.5), color: "#FCEDE0", marginTop: hp(0.5) },

//   cardElevated: {
//     backgroundColor: CARD_BG,
//     borderRadius: 12,
//     padding: hp(2),
//     marginVertical: hp(1.2),
//     shadowColor: "#000",
//     shadowOpacity: 0.06,
//     shadowRadius: 10,
//     elevation: 4,
//     marginHorizontal: wp(4),
//   },
//   heading: {
//     fontSize: hp(2.2),
//     fontWeight: "700",
//     color: "#2b2b2b",
//     marginBottom: hp(0.6),
    
//   },
//   text: { fontSize: hp(1.75), color: "#555", lineHeight: hp(2.6) },

//   impactSection: { marginVertical: hp(1) },
//   sectionTitle: { fontSize: hp(1.9), fontWeight: "700", color: "#333", marginBottom: hp(1), },
//   impactRow: { flexDirection: "row", justifyContent: "space-between",marginHorizontal: wp(3), },
//   impactCard: {
//     flex: 1,
//     backgroundColor: CARD_BG,
//     borderRadius: 12,
//     padding: hp(2),
//     marginHorizontal: wp(1),
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOpacity: 0.04,
//     shadowRadius: 6,
//     elevation: 3,
//   },
//   impactIconWrap: {
//     width: hp(9),
//     height: hp(9),
//     borderRadius: hp(9) / 2,
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: hp(0.6),
//     backgroundColor: "rgba(247,162,126,0.12)",
//   },
//   impactIcon: { fontSize: hp(3) },
//   impactNumber: { fontSize: hp(2.2), fontWeight: "800", marginTop: hp(0.3) },
//   impactLabel: { fontSize: hp(1.5), color: "#666", marginTop: hp(0.4) },

//   contactRow: { marginTop: hp(1), rowGap: hp(1) },
//   contactBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: hp(1),
//   },
//   contactEmoji: { marginRight: wp(3) },
//   contactText: { fontSize: hp(1.7), color: "#333" },

//   footer: { textAlign: "center", fontSize: hp(1.4), color: "#9a9a9a", marginTop: hp(3) },
// });
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  Animated,
  Image,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { hp, wp } from "@/src/assets/utils/responsive";
import CommonHeader from "@/src/Common/CommonHeader";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import theme from "@/src/assets/colors/theme";
import SafeAreaContainer from "@/src/components/SafeAreaContainer";

const BRAND_PRIMARY = "#6A3D2C"; // deep coffee
const BRAND_ACCENT = "#F7A27E"; // warm accent
const CARD_BG = "#ffffff";

const AboutUsScreen: React.FC = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const openMail = () => Linking.openURL("mailto:support@triovex.com");
  const openPhone = () => Linking.openURL("tel:9104605682");
  const openMap = () => {
    const query = Platform.select({
      ios: "maps:0,0?q=Koramangala,Bangalore",
      android: "geo:0,0?q=Koramangala,Bangalore",
    });
    if (query) Linking.openURL(query);
  };

  return (
    <SafeAreaContainer >
              <StatusBar
          barStyle="dark-content"   // or "light-content" depending on your background
          backgroundColor="#fff" // same as your screen background
          translucent={false}       // false ensures the content is below status bar
        />
      <CommonHeader title="About Us" />

      <Animated.View style={[styles.bannerWrap, { opacity: fadeAnim }] }>
        <LinearGradient
          colors={[BRAND_PRIMARY, "#8B4A36"]}
          start={[0, 0]}
          end={[1, 1]}
          style={styles.banner}
        >
          <View style={styles.brandRow}>
            <View style={styles.logoCircle}>
              <Image
                source={require("@/src/assets/images/splashImage.jpg")}
                style={styles.logo}
                resizeMode="cover"
              />
            </View>
            <View style={styles.brandTextWrap}>
              <Text style={styles.brandTitle}>Click Tea</Text>
              <Text style={styles.brandSubtitle}>Tea & Coffee, delivered fast</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: hp(4), paddingTop: hp(2) }}
      >
        <View style={styles.cardElevated}>
          <Text style={styles.heading}>Our Mission</Text>
          <Text style={styles.text}>
            We make it effortless to enjoy the best tea and coffee from local
            vendors — fast delivery, secure payments, and delightful mobile
            experiences. We focus on speed, simplicity, and reliability while
            supporting small businesses.
          </Text>
        </View>

        <View style={styles.impactSection}>
          <Text style={[styles.sectionTitle,{paddingHorizontal: wp(4),}]}>Our Impact</Text>
          <View style={styles.impactRow}>
            <View style={styles.impactCard}>
              <View style={styles.impactIconWrap}>
                <Text style={styles.impactIcon}>👥</Text>
              </View>
              <Text style={styles.impactNumber}>200+</Text>
              <Text style={styles.impactLabel}>Partner Vendors</Text>
            </View>

            <View style={styles.impactCard}>
              <View style={styles.impactIconWrap}>
                <Text style={styles.impactIcon}>📦</Text>
              </View>
              <Text style={styles.impactNumber}>1M+</Text>
              <Text style={styles.impactLabel}>Orders Delivered</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardElevated}>
          <Text style={styles.sectionTitle}>Get in Touch</Text>

          <View style={styles.contactRow}>
            <TouchableOpacity style={styles.contactBtn} onPress={openMail}>
                <Ionicons style={styles.contactEmoji} color={theme.PRIMARY_COLOR} size={hp(3)} name="mail-outline" />
              <Text style={styles.contactText}>support@triovex.com</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactBtn} onPress={openPhone}>
              <Ionicons style={styles.contactEmoji} color={theme.PRIMARY_COLOR} size={hp(3)} name="call-outline"/>
              <Text style={styles.contactText}>+91 9104605682</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactBtn} onPress={openMap}>
              <Ionicons style={styles.contactEmoji} color={theme.PRIMARY_COLOR} size={hp(3)} name="pin-outline"/>
              <Text style={styles.contactText}>Koramangala, Bangalore</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.footer}>© 2025 BrewDash. All rights reserved.</Text>
      </ScrollView>
    </SafeAreaContainer>
  );
};

export default AboutUsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
    // paddingHorizontal: wp(4),
  },
  bannerWrap: {
    marginTop: hp(1),
     
  },
  banner: {
    height: hp(18),
    borderRadius: 14,
    padding: wp(4),
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    // elevation: 8,
    marginHorizontal: wp(4),
  },
  brandRow: { flexDirection: "row", alignItems: "center" },
  logoCircle: {
    width: hp(11),
    height: hp(11),
    borderRadius: hp(11) / 2,
    backgroundColor: BRAND_ACCENT,
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(4),
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    // elevation: 6,
  },
  logo: { width: hp(9), height: hp(9), borderRadius: hp(9) / 2 },
  brandTextWrap: {},
  brandTitle: { fontSize: hp(2.6), fontWeight: "800", color: "#fff" },
  brandSubtitle: { fontSize: hp(1.5), color: "#FCEDE0", marginTop: hp(0.5) },

  cardElevated: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: hp(2),
    marginVertical: hp(1.2),
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
    marginHorizontal: wp(4),
  },
  heading: {
    fontSize: hp(2.2),
    fontWeight: "700",
    color: "#2b2b2b",
    marginBottom: hp(0.6),
    
  },
  text: { fontSize: hp(1.75), color: "#555", lineHeight: hp(2.6) },

  impactSection: { marginVertical: hp(1) },
  sectionTitle: { fontSize: hp(1.9), fontWeight: "700", color: "#333", marginBottom: hp(1), },
  impactRow: { flexDirection: "row", justifyContent: "space-between",marginHorizontal: wp(3), },
  impactCard: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: hp(2),
    marginHorizontal: wp(1),
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 3,
  },
  impactIconWrap: {
    width: hp(9),
    height: hp(9),
    borderRadius: hp(9) / 2,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(0.6),
    backgroundColor: "rgba(247,162,126,0.12)",
  },
  impactIcon: { fontSize: hp(3) },
  impactNumber: { fontSize: hp(2.2), fontWeight: "800", marginTop: hp(0.3) },
  impactLabel: { fontSize: hp(1.5), color: "#666", marginTop: hp(0.4) },

  contactRow: { marginTop: hp(1), rowGap: hp(1) },
  contactBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1),
  },
  contactEmoji: { marginRight: wp(3) },
  contactText: { fontSize: hp(1.7), color: "#333" },

  footer: { textAlign: "center", fontSize: hp(1.4), color: "#9a9a9a", marginTop: hp(3) },
});
