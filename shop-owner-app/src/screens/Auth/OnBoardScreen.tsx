// import {
//   View,
//   Text,
//   StyleSheet,
//   ImageBackground,
//   Pressable,
//   Alert,
// } from "react-native";
// import React from "react";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { hp, wp } from "@/src/assets/utils/responsive";
// import theme from "@/src/assets/colors/theme";
// import { ParamListBase, useNavigation } from "@react-navigation/native";
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const OnBoardScreen = () => {
//   const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
//   const pressMe =async() =>{
// const token = await AsyncStorage.getItem("authToken")
//    if (!token) {
//       Alert.alert("Login Required", "Please login to continue.",[
//         {text:"Ok",onPress:()=>navigation.push("signInScreen")}
//       ]);
//       return;
//     }
//         navigation.navigate('enterShopDetailScreen')
//   }
//   return (
//     <SafeAreaView style={styles.container}>
//       <ImageBackground
//         source={{
//           uri: "https://i.pinimg.com/736x/57/e1/14/57e114f83e455f1c6d565fa6c6839963.jpg",
//         }}
//         style={{ height: "100%", width: "auto" }}
//       >
//         <Pressable style={styles.clickTeaBtn} onPress={()=>pressMe()}>
//           <Text style={styles.clickTeaText}>ClickTea</Text>
//         </Pressable>
//       </ImageBackground>
//     </SafeAreaView>
//   );
// };
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     // backgroundColor:"white"
//   },
//   clickTeaBtn: {
//     backgroundColor: theme.PRIMARY_COLOR,
//     padding: hp(2.4),
//     bottom: hp(9),
//     position: "absolute",
//     alignSelf: "center",
//     borderRadius: theme.PRIMARY_BORDER_RADIUS,
//     paddingHorizontal: wp(15),
//   },
//   clickTeaText: {
//     fontSize: hp(2.4),
//     color: "white",
//     fontFamily: theme.PRIMARY_FONT_FAMILY,
//     letterSpacing: 0.5,
//   },
// });
// export default OnBoardScreen;
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
  Alert,
  Platform,
  Linking,
  AppState,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { hp, wp } from "@/src/assets/utils/responsive";
import theme from "@/src/assets/colors/theme";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

const OnBoardScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [loading, setLoading] = useState(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", async nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        await checkLocationPermissionSilently();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const checkLocationPermissionSilently = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== "granted") return;

      const locationServicesEnabled = await Location.hasServicesEnabledAsync();
      if (!locationServicesEnabled) return;

      await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
    } catch (e) {
      console.log("Silent check failed:", e);
    }
  };

// const pressMe = async () => {
//   setLoading(true);
//   await Location.requestForegroundPermissionsAsync(); // this use for saftey

//   try {
//     const { status } = await Location.getForegroundPermissionsAsync();

//     if (status !== "granted") {
//       setLoading(false);
//       Alert.alert("Permission Required", "Please enable location permission.");
//       return;
//     }

//     const locationServicesEnabled = await Location.hasServicesEnabledAsync();
//     if (!locationServicesEnabled) {
//       setLoading(false);
//       Alert.alert("Enable Location", "Please enable location service.");
//       return;
//     }

//     const location = await Location.getCurrentPositionAsync({
//       accuracy: Location.Accuracy.Low,
//       timeout: 2000,
//     });

//     await AsyncStorage.setItem("shop_lat", location.coords.latitude.toString());
//     await AsyncStorage.setItem("shop_lng", location.coords.longitude.toString());

//     const token = await AsyncStorage.getItem("authToken");
//     if (!token) {
//       setLoading(false);
//       return navigation.replace("signInScreen");
//     }

//     const owner_id = await AsyncStorage.getItem("owner_id");
// // console.log(owner_id,"owner");
// const setupStep = await AsyncStorage.getItem("setupStep");
// // console.log(setupStep);

//     setLoading(false);
// if (!owner_id) {
//   return navigation.navigate("enterShopDetailScreen");
// }

// switch (setupStep) {
//   case "shopCreated":
//     return navigation.navigate("addCategoryScreen");
//   case "categoryCreated":
//     return navigation.navigate("addMenuScreen");
//   case "complete":
//     return navigation.reset({
//       index: 0,
//       routes: [{ name: "bottamTabScreen" }],
//     });
//   default:
//     return navigation.navigate("enterShopDetailScreen");
// }
//   } catch (err) {
//     console.log("pressMe error:", err);
//     setLoading(false);
//     Alert.alert("Error", "Something went wrong.");
//   }
// };
// const pressMe = async () => {
//   setLoading(true);
//   await Location.requestForegroundPermissionsAsync();

//   try {
//     const { status } = await Location.getForegroundPermissionsAsync();

//     if (status !== "granted") {
//       setLoading(false);
//       Alert.alert("Permission Required", "Please enable location permission.");
//       return;
//     }

//     const locationServicesEnabled = await Location.hasServicesEnabledAsync();
//     if (!locationServicesEnabled) {
//       setLoading(false);
//       Alert.alert("Enable Location", "Please enable location service.");
//       return;
//     }

//     const location = await Location.getCurrentPositionAsync({
//       accuracy: Location.Accuracy.Low,
//       timeout: 2000,
//     });

//     await AsyncStorage.setItem("shop_lat", location.coords.latitude.toString());
//     await AsyncStorage.setItem("shop_lng", location.coords.longitude.toString());

//     const token = await AsyncStorage.getItem("authToken");
//     if (!token) {
//       setLoading(false);
//       return navigation.replace("signInScreen");
//     }

//     setLoading(false);
//     navigation.navigate("enterShopDetailScreen"); // Always go to shop detail after location
//   } catch (err) {
//     console.log("pressMe error:", err);
//     setLoading(false);
//     Alert.alert("Error", "Something went wrong.");
//   }
// };
const pressMe = async () => {
  setLoading(true);
  await Location.requestForegroundPermissionsAsync();

  try {
    const { status } = await Location.getForegroundPermissionsAsync();

    if (status !== "granted") {
      setLoading(false);
      Alert.alert("Permission Required", "Please enable location permission.");
      return;
    }

    const locationServicesEnabled = await Location.hasServicesEnabledAsync();
    if (!locationServicesEnabled) {
      setLoading(false);
      Alert.alert("Enable Location", "Please enable location service.");
      return;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Low,
      timeout: 2000,
    });

    await AsyncStorage.setItem("shop_lat", location.coords.latitude.toString());
    await AsyncStorage.setItem("shop_lng", location.coords.longitude.toString());

    const token = await AsyncStorage.getItem("authToken");
    // console.log(token);
    
    if (!token) {
      setLoading(false);
      return navigation.replace("signInScreen");
    }

//     const owner_id = await AsyncStorage.getItem("owner_id");
// console.log(owner_id,"owner");
const shop_id = await AsyncStorage.getItem("shop_id");
console.log(shop_id);

if (!shop_id) {
  return navigation.navigate("enterShopDetailScreen");
}

    setLoading(false);

    // 🔁 First time user → go to shop detail
    // if (!owner_id) {
    //   return navigation.navigate("enterShopDetailScreen");
    // }

    // ✅ Otherwise always go to HomeScreen (setup modal will handle next steps)
    return navigation.reset({
      index: 0,
      routes: [{ name: "bottamTabScreen" }], 
    });

  } catch (err) {
    console.log("pressMe error:", err);
    setLoading(false);
    Alert.alert("Error", "Something went wrong.");
  }
};



  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={{
          uri: "https://i.pinimg.com/736x/57/e1/14/57e114f83e455f1c6d565fa6c6839963.jpg",
        }}
        style={{ height: "100%", width: "auto" }}
      >
        <Pressable
          style={[
            styles.clickTeaBtn,
            loading && { opacity: 0.5 }, // dim if loading
          ]}
          onPress={pressMe}
          disabled={loading}
        >
          <Text style={styles.clickTeaText}>ClickTea</Text>
        </Pressable>

        {loading && (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Checking location...</Text>
            </View>
          </View>
        )}
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  clickTeaBtn: {
    backgroundColor: theme.PRIMARY_COLOR,
    padding: hp(2.4),
    bottom: hp(9),
    position: "absolute",
    alignSelf: "center",
    borderRadius: theme.PRIMARY_BORDER_RADIUS,
    paddingHorizontal: wp(15),
  },
  clickTeaText: {
    fontSize: hp(2.4),
    color: "white",
    fontFamily: theme.PRIMARY_FONT_FAMILY,
    letterSpacing: 0.5,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 10,
  },
  loadingBox: {
    padding: hp(2),
    backgroundColor: "#333",
    borderRadius: 12,
    alignItems: "center",
  },
  loadingText: {
    marginTop: hp(1),
    color: "#fff",
    fontSize: hp(2),
  },
});

export default OnBoardScreen;
