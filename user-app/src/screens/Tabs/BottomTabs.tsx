
// import React from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Platform,
//   Image,
// } from "react-native";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import { Ionicons } from "@expo/vector-icons";
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withSpring,
//   withTiming,
// } from "react-native-reanimated";
// import { useSelector } from "react-redux";

// import theme from "@/src/assets/colors/theme";
// import { hp, wp } from "@/src/assets/utils/responsive";
// import HomeScreen from "./Home/HomeScreen";
// import OrdersScreen from "./Orders/OrdersScreen";
// import ProfileScreen from "./Profile/ProfileScreen";
// import CartScreen from "./Cart/CartScreen";
// import { selectCartCount } from "@/src/Redux/Slice/cartSlice";
// import CoinWalletScreen from "./Profile/CoinWallet/CoinWalletScreen";

// const Tab = createBottomTabNavigator();

// // ✅ Precalculate constants
// const TAB_HEIGHT = hp(8);
// const TAB_MARGIN = wp(4);
// const FLOAT_SIZE = wp(16);
// const FLOAT_RADIUS = FLOAT_SIZE / 2;
// const FLOAT_OFFSET = hp(3.5);

// // Floating center button (if needed later)
// const CustomTabBarButton = ({ children, onPress }: any) => {
//   const scale = useSharedValue(1);
//   const rotate = useSharedValue(0);

//   const animatedStyle = useAnimatedStyle(() => ({
//     transform: [
//       { scale: scale.value },
//       { rotate: `${rotate.value}deg` },
//       { translateY: -FLOAT_OFFSET },
//     ],
//     width: FLOAT_SIZE,
//     height: FLOAT_SIZE,
//     borderRadius: FLOAT_RADIUS,
//   }));

//   const handlePress = () => {
//     scale.value = withSpring(1.2, {}, () => {
//       scale.value = withSpring(1);
//     });
//     rotate.value = withTiming(360, { duration: 500 }, () => {
//       rotate.value = 0;
//     });
//     if (onPress) onPress();
//   };

//   return (
//     <Animated.View style={[styles.floatingButton, animatedStyle]}>
//       <TouchableOpacity onPress={handlePress} style={styles.centerTouchable}>
//         {children}
//       </TouchableOpacity>
//     </Animated.View>
//   );
// };

// // ✅ Wrapper for tabBarIcon (safe for hooks)
// const TabBarIcon = ({ route, focused }: { route: any; focused: boolean }) => {
//   const cartCount = useSelector(selectCartCount);

//   let iconName = "";
//   let label = "";

//   switch (route.name) {
//     case "Home":
//       iconName = "home-outline";
//       label = "Home";
//       break;
//     case "Cart":
//       iconName = "cart-outline";
//       label = "Cart";
//       break;
//     case "Orders":
//       iconName = "receipt-outline";
//       label = "Orders";
//       break;
//     case "Profile":
//       iconName = "person-outline";
//       label = "Profile";
//       break;
//   }

//   return (
//     <View style={focused ? styles.focusedTab : styles.defaultTab}>
//       <Ionicons
//         name={iconName}
//         size={hp(2.8)}
//         color={focused ? theme.PRIMARY_COLOR : "#ccc"}
//       />

//       {/* ✅ Badge for Cart */}
//       {route.name === "Cart" && cartCount > 0 && (
//         console.log(cartCount,"CarrtCaount"),
        
//         <View style={styles.badge}>
//           <Text style={styles.badgeText}>{cartCount}</Text>
//         </View>
//       )}

//       {focused && <Text style={styles.label}>{label}</Text>}
//     </View>
//   );
// };

// const BottomTabs = () => {

//   return (
//     <Tab.Navigator
//       screenOptions={({ route }) => ({
//         headerShown: false,
//         tabBarShowLabel: false,
//         tabBarStyle: [
//           styles.tabBarStyle,
         
//         ],
//         tabBarButton: (props) => (
//           <TouchableOpacity
//             {...props}
//             activeOpacity={1}
//             style={{
//               justifyContent: "center",
//               alignItems: "center",
//               marginTop: hp(0.5),
//             }}
//           />
//         ),
//        tabBarIcon: ({ focused }) => {
//       if (route.name === "Coin") {
//         return (
//           <Image
//             source={require("@/src/assets/images/12.png")}
//             style={{
//               width: hp(2.8),
//               height: hp(2.8),
//               // tintColor: focused ? theme.PRIMARY_COLOR : "#ccc", // optional tint
//               // resizeMode: "contain",
//             }}
//           />
//         );
//       }
//       return <TabBarIcon route={route} focused={focused} />;
//     },
//       })}
//     >
//       <Tab.Screen name="Home" component={HomeScreen} />
//       <Tab.Screen
//         name="Cart"
//         component={CartScreen}
//         options={{
//           // ✅ Hide bottom tab inside Cart
//           // tabBarStyle: { display: "none" },
//         }}
//       />
//       <Tab.Screen name="Orders" component={OrdersScreen} />
//       <Tab.Screen name="Coin" component={CoinWalletScreen} />
//       <Tab.Screen name="Profile" component={ProfileScreen} />
//     </Tab.Navigator>
//   );
// };

// export default BottomTabs;

// const styles = StyleSheet.create({
//   tabBarStyle: {
//     position: "absolute",
//     bottom: hp(0),
//     left: TAB_MARGIN,
//     right: TAB_MARGIN,
//     height: TAB_HEIGHT,
//     backgroundColor: "white",
//     paddingBottom: Platform.OS === "android" ? hp(0.6) : 0,
//     paddingTop: hp(1.4),
//     elevation: 10,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 4 },
//     shadowRadius: 6,
//     // borderTopWidth: 2,
//     paddingVertical: 25,
//     // borderColor:theme.PRIMARY_COLOR
//   },
//   floatingButton: {
//     top: -FLOAT_OFFSET,
//     borderWidth: 3,
//     borderColor: theme.PRIMARY_COLOR,
//     backgroundColor: "#fff",
//     elevation: 10,
//     shadowColor: "#943400",
//     shadowOpacity: 0.25,
//     shadowOffset: { width: 0, height: 4 },
//     shadowRadius: 10,
//   },
//   centerTouchable: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   focusedTab: {
//     width: wp(14),
//     height: hp(6),
//     borderRadius: 12,
//     backgroundColor: "#ffffff30",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: hp(0.3),
//     marginTop: hp(0.9),
//   },
//   defaultTab: {
//     alignItems: "center",
//     justifyContent: "center",
//     height: hp(6),
//   },
//   label: {
//     color: theme.PRIMARY_COLOR,
//     fontSize: hp(1.3),
//     fontWeight: "500",
//     marginTop: hp(0.2),
//     textAlign: "center",
//   },
//   badge: { 
//     position: "absolute",
//     top: hp(0.3),
//     left: wp(3),
//     backgroundColor: "red",
//     borderRadius: hp(1.2),
//     minWidth: hp(2.2),
//     height: hp(2.2),
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: wp(0.5),
//   },
//   badgeText: {
//     color: "#fff",
//     fontSize: hp(1.2),
//     fontWeight: "600",
//   },
// });

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSelector } from "react-redux";

import theme from "@/src/assets/colors/theme";
import { hp, wp } from "@/src/assets/utils/responsive";
import HomeScreen from "./Home/HomeScreen";
import OrdersScreen from "./Orders/OrdersScreen";
import ProfileScreen from "./Profile/ProfileScreen";
import CartScreen from "./Cart/CartScreen";
import CoinWalletScreen from "./Profile/CoinWallet/CoinWalletScreen";
import { selectCartCount } from "@/src/Redux/Slice/cartSlice";
import { ROUTES } from "@/src/assets/routes/route";

const Tab = createBottomTabNavigator();

// Preset layout constants
const TAB_HEIGHT = hp(8);
const TAB_MARGIN = wp(4);
const FLOAT_SIZE = wp(16);
const FLOAT_RADIUS = FLOAT_SIZE / 2;
const FLOAT_OFFSET = hp(3.5);

const CustomTabBarButton = ({ children, onPress }: any) => {
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
      { translateY: -FLOAT_OFFSET },
    ],
    width: FLOAT_SIZE,
    height: FLOAT_SIZE,
    borderRadius: FLOAT_RADIUS,
  }));

  const handlePress = () => {
    scale.value = withSpring(1.2, {}, () => {
      scale.value = withSpring(1);
    });
    rotate.value = withTiming(360, { duration: 500 }, () => {
      rotate.value = 0;
    });
    if (onPress) onPress();
  };

  return (
    <Animated.View style={[styles.floatingButton, animatedStyle]}>
      <TouchableOpacity onPress={handlePress} style={styles.centerTouchable}>
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

const TabBarIcon = ({ route, focused }: { route: any; focused: boolean }) => {
  const cartCount = useSelector(selectCartCount);

  let iconName = "";
  let label = "";

  switch (route.name) {
    case ROUTES.HOME:
      iconName = "home-outline";
      label = "Home";
      break;
    case ROUTES.CART:
      iconName = "cart-outline";
      label = "Cart";
      break;
    case ROUTES.ORDERS:
      iconName = "receipt-outline";
      label = "Orders";
      break;
    case ROUTES.PROFILE:
      iconName = "person-outline";
      label = "Profile";
      break;
    default:
      iconName = "ellipse-outline";
      label = "";
  }

  return (
    <View style={focused ? styles.focusedTab : styles.defaultTab}>
      <Ionicons
        name={iconName as any}
        size={hp(2.8)}
        color={focused ? theme.PRIMARY_COLOR : "#ccc"}
      />

      {route.name === ROUTES.CART && cartCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{cartCount}</Text>
        </View>
      )}

      {focused && <Text style={styles.label}>{label}</Text>}
    </View>
  );
};

const BottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: [styles.tabBarStyle],
        tabBarButton: (props) => (
          <TouchableOpacity
            {...props}
            activeOpacity={1}
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginTop: hp(0.5),
            }}
          />
        ),
        tabBarIcon: ({ focused }) => {
          // If you want a custom image for coin, check route.name match
          if (route.name === ROUTES.COIN_WALLET) {
            return (
              <Image
                source={require("@/src/assets/images/12.png")}
                style={{
                  width: hp(2.8),
                  height: hp(2.8),
                }}
              />
            );
          }
          return <TabBarIcon route={route} focused={focused} />;
        },
      })}
    >
      <Tab.Screen name={ROUTES.HOME} component={HomeScreen} />
      <Tab.Screen
        name={ROUTES.CART}
        component={CartScreen}
        options={{
          // hide tab if you want when inside Cart: tabBarStyle: { display: "none" }
        }}
      />
      <Tab.Screen name={ROUTES.ORDERS} component={OrdersScreen} />
      <Tab.Screen name={ROUTES.COIN_WALLET} component={CoinWalletScreen} />
      <Tab.Screen name={ROUTES.PROFILE} component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabs;

const styles = StyleSheet.create({
  tabBarStyle: {
    position: "absolute",
    bottom: hp(0),
    left: TAB_MARGIN,
    right: TAB_MARGIN,
    height: TAB_HEIGHT,
    backgroundColor: "white",
    paddingBottom: Platform.OS === "android" ? hp(0.6) : 0,
    paddingTop: hp(1.4),
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    paddingVertical: 25,
  },
  floatingButton: {
    top: -FLOAT_OFFSET,
    borderWidth: 3,
    borderColor: theme.PRIMARY_COLOR,
    backgroundColor: "#fff",
    elevation: 10,
    shadowColor: "#943400",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  centerTouchable: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  focusedTab: {
    width: wp(14),
    height: hp(6),
    borderRadius: 12,
    backgroundColor: "#ffffff30",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp(0.3),
    marginTop: hp(0.9),
  },
  defaultTab: {
    alignItems: "center",
    justifyContent: "center",
    height: hp(6),
  },
  label: {
    color: theme.PRIMARY_COLOR,
    fontSize: hp(1.3),
    fontWeight: "500",
    marginTop: hp(0.2),
    textAlign: "center",
  },
  badge: {
    position: "absolute",
    top: hp(0.3),
    left: wp(3),
    backgroundColor: "red",
    borderRadius: hp(1.2),
    minWidth: hp(2.2),
    height: hp(2.2),
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(0.5),
  },
  badgeText: {
    color: "#fff",
    fontSize: hp(1.2),
    fontWeight: "600",
  },
});
