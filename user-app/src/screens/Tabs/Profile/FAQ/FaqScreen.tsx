// src/screens/FaqScreen.tsx
import React, { useEffect, useState, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TextInput,
  TouchableOpacity,
  Keyboard,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { hp, wp } from "@/src/assets/utils/responsive";
import CommonHeader from "@/src/Common/CommonHeader";
import { SafeAreaView } from "react-native-safe-area-context";

/* ===== Premium palette (consistent with T&C screen) ===== */
const PALETTE = {
  BG: "#F6F4F1",
  CARD: "#FFFFFF",
  HEADING: "#241F20",
  SUB: "#6B6B6B",
  ACCENT: "#B58840",
  DIV: "rgba(36,31,32,0.06)",
};

/* ===== FAQ content grouped into sections ===== */
const SECTIONS = [
  {
    title: "Orders & Delivery",
    data: [
      {
        id: "q1",
        q: "How do I place an order?",
        a: "Browse vendors near you, select items, add to cart, and proceed to checkout. You can pay immediately or use Pay Later if eligible.",
      },
      {
        id: "q2",
        q: "What are the delivery charges?",
        a: "Delivery charges vary by location and shop policy. You can view charges at checkout before confirming your order.",
      },
      {
        id: "q3",
        q: "How long does delivery take?",
        a: "Delivery times depend on shop prep and distance — typically 20–40 minutes.",
      },
    ],
  },
  {
    title: "Pay Later Feature",
    data: [
      {
        id: "q4",
        q: "How does Pay Later work?",
        a: "Pay Later lets eligible users place orders and pay at a later date according to our terms.",
      },
      {
        id: "q5",
        q: "Who is eligible for Pay Later?",
        a: "Eligibility depends on usage history, timely payments, and our internal credit checks.",
      },
    ],
  },
];

/* ===== Accordion item using Reanimated for height + rotation ===== */
type FaqItemProps = {
  id: string;
  question: string;
  answer: string;
  expanded: boolean;
  onToggle: (id: string) => void;
};

const FaqItem = memo(({ id, question, answer, expanded, onToggle }: FaqItemProps) => {
  const progress = useSharedValue(expanded ? 1 : 0);
  const measuredHeight = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(expanded ? 1 : 0, { duration: 320 });
  }, [expanded, progress]);

  // Animate height and opacity like T&C screen
  const bodyStyle = useAnimatedStyle(() => {
    const h = interpolate(progress.value, [0, 1], [0, measuredHeight.value + 5], Extrapolate.CLAMP);
    return { height: h, opacity: progress.value };
  });

  const chevronStyle = useAnimatedStyle(() => {
    const rotateDeg = interpolate(progress.value, [0, 1], [0, 180]);
    return { transform: [{ rotate: `${rotateDeg}deg` }] };
  });

  return (
    <View style={[styles.faqCard, expanded && styles.faqCardActive]}>
      <TouchableOpacity
        style={styles.faqHeader}
        activeOpacity={0.86}
        onPress={() => onToggle(id)}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.question}>{question}</Text>
        </View>
        <Animated.View style={chevronStyle}>
          <Ionicons name="chevron-forward" size={hp(2.4)} color={PALETTE.HEADING} />
        </Animated.View>
      </TouchableOpacity>

      {/* Animated body container */}
      <Animated.View style={[styles.faqBodyContainer, bodyStyle]} pointerEvents={expanded ? "auto" : "none"}>
        <View>
          <Text style={styles.answer}>{answer}</Text>
        </View>
      </Animated.View>

      {/* Off-screen measurer for natural height */}
      <View
        style={styles.measurer}
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          if (h > 0 && Math.abs(h - measuredHeight.value) > 1) {
            measuredHeight.value = h;
          }
        }}
      >
        <Text style={styles.answer}>{answer}</Text>
      </View>
    </View>
  );
});
FaqItem.displayName = "FaqItem";

/* ===== Main screen ===== */
const FaqScreen = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Filter sections by search query
  const filteredSections = SECTIONS.map((section) => {
    const filteredData = section.data.filter((item) => {
      const q = `${item.q} ${item.a}`.toLowerCase();
      return q.includes(search.trim().toLowerCase());
    });
    return { ...section, data: filteredData };
  }).filter((s) => s.data.length > 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: PALETTE.BG }]}>
            <StatusBar
        barStyle="dark-content"   // or "light-content" depending on your background
        backgroundColor="#F6F4F1" // same as your screen background
        translucent={false}       // false ensures the content is below status bar
      />
      <CommonHeader title="FAQs" />

      <View style={styles.content}>
        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={hp(2.2)} color={PALETTE.SUB} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for tea, coffee, snacks..."
            placeholderTextColor={PALETTE.SUB}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearch("");
                setExpandedId(null);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={hp(2)} color={PALETTE.SUB} />
            </TouchableOpacity>
          )}
        </View>

        <SectionList
          sections={filteredSections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: hp(6) }}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.category}>{title}</Text>
          )}
          renderItem={({ item }) => (
            <FaqItem
              id={item.id}
              question={item.q}
              answer={item.a}
              expanded={expandedId === item.id}
              onToggle={toggleExpand}
            />
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No FAQs found for "{search}"</Text>
            </View>
          )}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

export default FaqScreen;

/* ===== Styles ===== */
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: wp(4), paddingTop: hp(2), flex: 1 },

  /* Search */
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PALETTE.CARD,
    borderRadius: 12,
    paddingHorizontal: wp(3),
    height: hp(6),
    marginBottom: hp(2),
    borderWidth: 1,
    borderColor: PALETTE.DIV,
  },
  searchInput: { flex: 1, fontSize: hp(1.6), color: PALETTE.HEADING, marginLeft: wp(2) },

  /* Section title */
  category: {
    fontSize: hp(1.9),
    fontWeight: "700",
    color: PALETTE.HEADING,
    marginBottom: hp(1),
    marginTop: hp(2),
  },

  /* FAQ card */
  faqCard: {
    backgroundColor: PALETTE.CARD,
    borderRadius: 12,
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.6),
    marginBottom: hp(1.2),
    borderWidth: 1,
    borderColor: PALETTE.DIV,
    overflow: "hidden",
  },
  faqCardActive: { borderColor: PALETTE.ACCENT },

  faqHeader: { flexDirection: "row", alignItems: "center" },
  question: { fontSize: hp(1.75), fontWeight: "700", color: PALETTE.HEADING },
  chev: { fontSize: hp(2.2), color: PALETTE.HEADING },

  faqBodyContainer: { marginTop: hp(1), paddingBottom: hp(0.8) },
  answer: { fontSize: hp(1.55), color: PALETTE.SUB, lineHeight: hp(2.4) },

  measurer: {
    position: "absolute",
    left: -9999,
    top: -9999,
    opacity: 0,
    width: wp(100) - wp(8),
  },

  emptyBox: { padding: hp(2), alignItems: "center" },
  emptyText: { color: PALETTE.SUB },
});
