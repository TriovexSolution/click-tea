// TermsAndConditionsScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { hp, wp } from "@/src/assets/utils/responsive";
import CommonHeader from "@/src/Common/CommonHeader";
import { LinearGradient } from "expo-linear-gradient";

/* ===== Premium palette ===== */
const PALETTE = {
  BG: "#F6F4F1", // soft ivory
  CARD: "#FFFFFF",
  HEADING: "#241F20", // deep charcoal
  SUB: "#6B6B6B",
  ACCENT: "#B58840", // warm gold
  DIV: "rgba(36,31,32,0.06)",
};

/* ===== Content ===== */
const sections = [
  {
    heading: "1. Service Description",
    text: "BrewDash provides delivery services for tea, coffee, and snacks. Users agree to order responsibly and use services fairly.",
  },
  {
    heading: "2. User Responsibilities",
    text: "Users must provide accurate information, ensure timely payments, and avoid misuse of the platform. Violations may result in suspension.",
  },
  {
    heading: "3. Payment Terms",
    text: "Payments can be made via cards, wallets, or coins. Users must maintain sufficient balance for transactions.",
  },
  {
    heading: "4. Cancellation & Refund Policy",
    text: "Orders may be canceled before preparation. Refunds are processed within 5–7 business days to the original method.",
  },
  {
    heading: "5. Privacy & Data Protection",
    text: "Your privacy is important. We handle personal data securely in accordance with our Privacy Policy.",
  },
  {
    heading: "6. Limitation of Liability",
    text: "We are not responsible for delays, cancellations, or third-party issues beyond our control.",
  },
  {
    heading: "7. Changes to Terms",
    text: "We may update terms occasionally. Continued use of the app means acceptance of updated terms.",
  },
  {
    heading: "8. Contact Us",
    text: "Email: support@brewdash.com\nPhone: +91 80-1234-5678\nAddress: Koramangala, Bangalore, India",
  },
];

/* ===== AccordionItem: measures its content off-screen and animates height ===== */
type AccordionItemProps = {
  item: { heading: string; text: string };
  isOpen: boolean;
  onPress: () => void;
};

const AccordionItem: React.FC<AccordionItemProps> = ({ item, isOpen, onPress }) => {
  // progress: 0 closed -> 1 open
  const progress = useSharedValue(isOpen ? 1 : 0);
  // measured height of content (px)
  const measuredHeight = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(isOpen ? 1 : 0, { duration: 320 });
  }, [isOpen, progress]);

  // animated style: interpolate height between 0 and measuredHeight
   const animatedBodyStyle = useAnimatedStyle(() => {
    const h = interpolate(
      progress.value,
      [0, 1],
      [0, measuredHeight.value + 5], // buffer to avoid cut
      Extrapolate.CLAMP
    );
    return { height: h, opacity: progress.value };
  });
  const chevronStyle = useAnimatedStyle(() => {
    const rotateDeg = interpolate(progress.value, [0, 1], [0, 180]);
    return {
      transform: [{ rotate: `${rotateDeg}deg` }],
    };
  });

  return (
    <View style={styles.sectionCard}>
      <TouchableOpacity style={styles.sectionHeader} activeOpacity={0.86} onPress={onPress}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heading}>{item.heading}</Text>
          {/* <Text numberOfLines={1} ellipsizeMode="tail" style={styles.preview}>
            {item.text}
          </Text> */}
        </View>

        <Animated.View style={chevronStyle}>
          <Text style={styles.chev}>▾</Text>
        </Animated.View>
      </TouchableOpacity>

      {/* Animated clipping container */}
      <Animated.View style={[styles.sectionBodyContainer, animatedBodyStyle]} pointerEvents={isOpen ? "auto" : "none"}>
        <View>
          <Text style={styles.text}>{item.text}</Text>
        </View>
      </Animated.View>

      {/* Off-screen measuring view: invisible but rendered so we get natural height */}
      <View
        style={styles.measurer}
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          // only update if height differs and > 0
          if (h > 0 && Math.abs(h - measuredHeight.value) > 1) {
            measuredHeight.value = h;
          }
        }}
      >
        <Text style={styles.text}>{item.text}</Text>
      </View>
    </View>
  );
};

/* ===== Main Screen ===== */
const TermsAndCondition: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [query, setQuery] = useState("");

  // banner fade using Reanimated
  const bannerProgress = useSharedValue(0);
  useEffect(() => {
    bannerProgress.value = withTiming(1, { duration: 480 });
  }, [bannerProgress]);
  const bannerStyle = useAnimatedStyle(() => ({
    opacity: bannerProgress.value,
    transform: [{ translateY: interpolate(bannerProgress.value, [0, 1], [8, 0]) }],
  }));

  const filtered = sections.filter((s) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return `${s.heading} ${s.text}`.toLowerCase().indexOf(q) > -1;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: PALETTE.BG }]}>
            <StatusBar
        barStyle="dark-content"   // or "light-content" depending on your background
        backgroundColor="#F6F4F1" // same as your screen background
        translucent={false}       // false ensures the content is below status bar
      />
      <CommonHeader title="Terms & Conditions" />

      <Animated.View style={[styles.topGradient, bannerStyle]} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: hp(6) }}>
        <View style={styles.wrapper}>
          {/* Search */}
          <View style={styles.searchWrap}>
            <TextInput
              placeholder="Search terms..."
              value={query}
              onChangeText={setQuery}
              style={styles.searchInput}
              placeholderTextColor={PALETTE.SUB}
            />
            <Text style={styles.date}>Last updated: December 30, 2024</Text>
          </View>

          {/* Accordion list */}
          <View style={styles.accordionWrap}>
            {filtered.map((section, idx) => (
              <AccordionItem
                key={idx}
                item={section}
                isOpen={openIndex === idx}
                onPress={() => setOpenIndex((prev) => (prev === idx ? null : idx))}
              />
            ))}

            {filtered.length === 0 && (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No terms found for "{query}"</Text>
              </View>
            )}
          </View>

          <Text style={styles.footer}>© 2025 BrewDash. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsAndCondition;

/* ===== Styles ===== */
const styles = StyleSheet.create({
  container: { flex: 1 },
  topGradient: { height: hp(2), backgroundColor: PALETTE.BG },
  wrapper: { paddingHorizontal: wp(4), paddingTop: hp(2) },

  searchWrap: { marginBottom: hp(1) },
  searchInput: {
    backgroundColor: PALETTE.CARD,
    borderRadius: 14,
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(4),
    fontSize: hp(1.6),
    borderWidth: 1,
    borderColor: PALETTE.DIV,
  },
  date: { marginTop: hp(1), fontSize: hp(1.4), color: PALETTE.SUB,paddingHorizontal:wp(1) },

  accordionWrap: { marginTop: hp(2) },
  sectionCard: {
    backgroundColor: PALETTE.CARD,
    borderRadius: 12,
    marginBottom: hp(1.2),
    overflow: "hidden",
    borderWidth: 1,
    borderColor: PALETTE.DIV,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(3),
  },
  heading: { fontSize: hp(1.95), fontWeight: "700", color: PALETTE.HEADING, marginBottom: hp(0.25) },
  preview: { fontSize: hp(1.2), color: PALETTE.SUB, opacity: 0.85 },

  chev: { fontSize: hp(2.2), color: PALETTE.SUB },

  sectionBodyContainer: {
    paddingHorizontal: wp(3),
    paddingBottom: hp(1.4),
    overflow: "hidden",
    backgroundColor: PALETTE.CARD,
  },
  text: { fontSize: hp(1.), color: PALETTE.SUB, lineHeight: hp(2.6) },

  // invisible measurer used to capture natural content height
  measurer: {
    position: "absolute",
    left: -9999,
    top: -9999,
    opacity: 0,
    // ensure text wraps with same max width as visible container
    width: wp(100) - wp(8), // account for wrapper horizontal padding
  },

  emptyBox: { padding: hp(2), alignItems: "center" },
  emptyText: { color: PALETTE.SUB },

  footer: { textAlign: "center", fontSize: hp(1.4), color: PALETTE.SUB, marginTop: hp(3) },
});
