// import React, { useState, useEffect } from 'react';
// import {
//   View, Text, TextInput, StyleSheet, TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   Platform,
//   Linking
// } from 'react-native';
// import * as Location from 'expo-location';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { hp, wp } from '@/src/assets/utils/responsive';
// import { Ionicons } from '@expo/vector-icons';
// import theme from '@/src/assets/colors/theme';
// import { useDispatch, useSelector } from 'react-redux';
// import { getLocationFromStorage, saveLocationToStorage } from '@/src/assets/utils/locationStorage';
// import { RootState } from '@/src/Redux/store';
// import { setLocation } from '@/src/Redux/Slice/locationSlice';
// import { useNavigation } from '@react-navigation/native';

// const PRIMARY_COLOR = '#562E19';

// const LocationScreen = () => {
//   const dispatch = useDispatch();
//   const location = useSelector((state: RootState) => state.location);
//   const [loading, setLoading] = useState(true);
//  const navigation = useNavigation();

//   // const requestLocation = async () => {
//   //   setLoading(true);
//   //   try {
//   //     const { status } = await Location.requestForegroundPermissionsAsync();
//   //     if (status !== 'granted') {
//   //       console.warn('Permission not granted');
//   //       setLoading(false);
//   //       return;
//   //     }
//   //     const currentLoc = await Location.getCurrentPositionAsync({});
//   //     const coords = {
//   //       latitude: currentLoc.coords.latitude,
//   //       longitude: currentLoc.coords.longitude,
//   //     };
//   //     dispatch(setLocation(coords));
//   //     await saveLocationToStorage(coords.latitude, coords.longitude);
//   //   } catch (err) {
//   //     console.warn('Error fetching location', err);
//   //   }
//   //   setLoading(false);
//   // };
// const requestLocation = async () => {
//   setLoading(true);
//   try {
//     const servicesEnabled = await Location.hasServicesEnabledAsync();
//     if (!servicesEnabled) {
//       Alert.alert(
//         "Enable Location",
//         "Please turn on device location to continue.",
//         [
//           {
//             text: "Go to Settings",
//             onPress: () => {
//               if (Platform.OS === "android") Linking.openSettings();
//             },
//           },
//         ]
//       );
//       setLoading(false);
//       return;
//     }

//     const { status } = await Location.requestForegroundPermissionsAsync();
//     if (status !== 'granted') {
//       Alert.alert(
//         "Permission Denied",
//         "Location permission is required to continue.",
//         [
//           {
//             text: "Retry",
//             onPress: () => requestLocation(),
//           },
//           {
//             text: "Cancel",
//           },
//         ]
//       );
//       setLoading(false);
//       return;
//     }

//     const currentLoc = await Location.getCurrentPositionAsync({});
//     const coords = {
//       latitude: currentLoc.coords.latitude,
//       longitude: currentLoc.coords.longitude,
//     };
//     dispatch(setLocation(coords));
//     await saveLocationToStorage(coords.latitude, coords.longitude);

//   } catch (err) {
//     console.warn('Error fetching location', err);
//   } finally {
//     setLoading(false);
//   }
// };

//   useEffect(() => {
//     const loadStoredLocation = async () => {
//       const saved = await getLocationFromStorage();
//       if (saved && Date.now() - saved.lastUpdated < 24 * 60 * 60 * 1000) {
//         dispatch(setLocation({ latitude: saved.latitude, longitude: saved.longitude }));
//         setLoading(false);
//       } else {
//         requestLocation();
//       }
//     };
//     loadStoredLocation();
//   }, []);

//   // const handleProceed = () => {
//   //   navigation.reset({
//   //     index: 0,
//   //     routes: [{ name: 'bottomTabScreen' }],
//   //   });
//   // };
// const handleProceed = () => {
//   if (!location.latitude || !location.longitude) {
//     Alert.alert("Location Required", "Please enable location to proceed.");
//     return;
//   }
//   navigation.reset({
//     index: 0,
//     routes: [{ name: "bottomTabScreen" }],
//   });
// };

//   return (
//     <SafeAreaView style={styles.safe}>
//       <Text style={styles.title}>Choose Location</Text>

//       <View style={styles.mapBox}>
//         {loading ? (
//           <ActivityIndicator size="large" color={PRIMARY_COLOR} />
//         ) : location.latitude ? (
//           <>
//             {location.longitude !== null && location.latitude !== null && (
//   <>
//     <Text>Lat: {location.latitude.toFixed(6)}</Text>
//     <Text>Lng: {location.longitude.toFixed(6)}</Text>
//   </>
// )}

//           </>
//         ) : (
//           <Text style={styles.coordText}>Map Placeholder</Text>
//         )}

//         <View style={styles.searchWrapper}>
//           <TextInput
//             placeholder="Search for area, Street name..."
//             placeholderTextColor="#333333"
//             style={styles.searchInput}
//           />
//           <Ionicons size={hp(2.5)} name='search-outline' />
//         </View>
//       </View>

//       <View style={styles.content}>
//         <Text style={styles.sectionTitle}>Recent Locations</Text>

//         <View style={styles.locationItem}>
//           <Ionicons size={hp(3)} name='location-outline' />
//           <View>
//             <Text style={styles.locationTitle}>Home</Text>
//             <Text style={styles.locationSubtitle}>HRS Layout, Bangalore</Text>
//           </View>
//         </View>

//         <View style={styles.locationItem}>
//           <Ionicons size={hp(3)} name='location-outline' />
//           <View>
//             <Text style={styles.locationTitle}>Office</Text>
//             <Text style={styles.locationSubtitle}>Electric City, Bangalore</Text>
//           </View>
//         </View>
//       </View>

//       <TouchableOpacity onPress={requestLocation}>
//         <Text style={styles.useCurrentText}>Use Current Location</Text>
//       </TouchableOpacity>

//           <TouchableOpacity style={styles.button} onPress={handleProceed}>
//       <Text style={styles.buttonText}>Proceed to Home</Text>
//     </TouchableOpacity>
//     </SafeAreaView>
//   );
// };

// export default LocationScreen;

// // your same styles here...


// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: '#fff' },

//   title: {
//     fontSize: hp(2.6),
//     fontWeight: '600',
//     marginHorizontal: wp(5),
//     marginBottom: hp(1),
//   paddingTop:hp(3)  
//   },

//   mapBox: {
//     height: hp(30),
//     backgroundColor: '#eee',
//     position: 'relative',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: hp(2),
//   },
//   coordText: { fontSize: hp(1.8), color: '#333' },

//   searchWrapper: {
//     position: 'absolute',
//     top: hp(2),
//     left: wp(5),
//     right: wp(5),
//     backgroundColor: '#fff',
//     borderRadius: hp(3),
//     paddingHorizontal: wp(4),
//     height: hp(6),
//     flexDirection: 'row',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: hp(1.5),
//     color: '#000',
//   },
//   searchIcon: {
//     fontSize: hp(2.2),
//     marginLeft: wp(2),
//   },

//   content: {
//     flex: 1,
//     paddingHorizontal: wp(5),
//   },
//   sectionTitle: {
//     fontSize: hp(2),
//     fontWeight: '500',
//     marginBottom: hp(1.5),
//   },
//   locationItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: hp(1.5),
//     gap:wp(2)
//   },
//   pinIcon: {
//     fontSize: hp(2.4),
//     marginRight: wp(2.5),
//   },
//   locationTitle: {
//     fontSize: hp(1.9),
//     fontWeight: '600',
//   },
//   locationSubtitle: {
//     fontSize: hp(1.6),
//     color: '#555',
//   },
//   useCurrentText: {
//     textAlign: 'center',
//     color: PRIMARY_COLOR,
//     marginTop: hp(2.5),
//     textDecorationLine: 'underline',
//     fontWeight: '500',
//     fontSize: hp(1.8),
//     paddingBottom:hp(2)
//   },

//   button: {
//     backgroundColor: PRIMARY_COLOR,
//     paddingVertical: hp(1.8),
//     borderRadius: theme.COMMON_BORDER_RADIUS,
//     alignItems: 'center',
//     marginHorizontal: wp(5),
//     marginBottom: hp(2),
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: hp(2),
//     fontWeight: '600',
//   },
// });

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
  Keyboard,
} from "react-native";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import { hp, wp } from "@/src/assets/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import theme from "@/src/assets/colors/theme";
import { useDispatch, useSelector } from "react-redux";
import { getLocationFromStorage, saveLocationToStorage } from "@/src/assets/utils/locationStorage";
import type { RootState } from "@/src/Redux/store";
import { setLocation } from "@/src/Redux/Slice/locationSlice";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ROUTES } from "@/src/assets/routes/route";

/**
 * Production-ready LocationScreen
 * - Robust permission handling
 * - Services check + guide to settings
 * - Persist & reuse stored location (TTL 24h)
 * - Debounce/dedupe taps
 * - Square search bar
 *
 * TODO:
 * - Replace search input with a real Places autocomplete (Google Places / Mapbox)
 * - Replace Map placeholder with react-native-maps (and marker)
 * - Add reverse geocoding to show address string from coords
 */

type Nav = NativeStackNavigationProp<Record<string, object | undefined>>;

const PRIMARY_COLOR = "#562E19";
const LOCATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const LocationScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<Nav>();
  const storedLocation = useSelector((s: RootState) => s.location);

  const [loading, setLoading] = useState<boolean>(true);
  const [requesting, setRequesting] = useState<boolean>(false); // user toggled a request
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [focused, setFocused] = useState<boolean>(false);

  const lastRequestRef = useRef<number>(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Try to load cached location (if recent), otherwise request fresh permission/location
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const saved = await getLocationFromStorage();
        if (!mountedRef.current || cancelled) return;

        if (saved && Date.now() - (saved.lastUpdated ?? 0) < LOCATION_TTL_MS) {
          dispatch(setLocation({ latitude: saved.latitude, longitude: saved.longitude }));
          setLoading(false);
          return;
        }

        // No recent saved location -> attempt a permission flow silently
        await requestLocation({ silent: true });
      } catch (err) {
        // fallback to interactive request below
        if (mountedRef.current) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // small helper to open app settings (both iOS/Android)
  const openAppSettings = useCallback(() => {
    try {
      Linking.openSettings?.();
    } catch {
      // as a fallback for iOS older versions:
      const url = Platform.OS === "ios" ? "app-settings:" : "package:";
      Linking.openURL(url).catch(() => {});
    }
  }, []);

  /**
   * requestLocation
   * - silent: if true, we won't prompt alerts and won't show permission modal flash (best-effort)
   * - uses Expo Location APIs; handles device services off + denied permissions
   */
  const requestLocation = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      // prevent accidental multi-taps
      const now = Date.now();
      if (now - lastRequestRef.current < 700) return;
      lastRequestRef.current = now;

      setRequesting(true);
      setError(null);

      try {
        // Check if device location services are enabled
        const servicesEnabled = await Location.hasServicesEnabledAsync();
        if (!servicesEnabled) {
          if (!silent) {
            Alert.alert(
              "Enable Location Services",
              "Please turn on device location services to continue.",
              [
                {
                  text: "Open Settings",
                  onPress: () => {
                    openAppSettings();
                  },
                },
                { text: "Cancel", style: "cancel" },
              ]
            );
          }
          setRequesting(false);
          setLoading(false);
          return;
        }

        // Request permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          if (!silent) {
            Alert.alert(
              "Location Permission Required",
              "Please allow location access so we can show nearby vendors.",
              [
                {
                  text: "Open Settings",
                  onPress: () => openAppSettings(),
                },
                { text: "Cancel", style: "cancel" },
              ]
            );
          }
          setRequesting(false);
          setLoading(false);
          return;
        }

        // Get last known position quickly, then try to fetch current for best accuracy
        const last = await Location.getLastKnownPositionAsync();
        if (last && mountedRef.current) {
          const coords = { latitude: last.coords.latitude, longitude: last.coords.longitude };
          dispatch(setLocation(coords));
          await saveLocationToStorage(coords.latitude, coords.longitude);
        }

        // Attempt to get current location (may take longer)
        const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest, maximumAge: 5000, timeout: 10000 });
        if (mountedRef.current && current?.coords) {
          const coords = { latitude: current.coords.latitude, longitude: current.coords.longitude };
          dispatch(setLocation(coords));
          await saveLocationToStorage(coords.latitude, coords.longitude);
        }
      } catch (err: any) {
        console.warn("requestLocation error:", err?.message ?? err);
        if (!silent) {
          setError("Unable to get location. Please try again.");
        }
      } finally {
        if (mountedRef.current) {
          setRequesting(false);
          setLoading(false);
        }
      }
    },
    [dispatch, openAppSettings]
  );

  // Proceed: ensure we have coordinates then navigate to home (and reset stack)
  const handleProceed = useCallback(() => {
    const lat = (storedLocation && storedLocation.latitude) || null;
    const lng = (storedLocation && storedLocation.longitude) || null;

    if (!lat || !lng) {
      Alert.alert("Location Required", "Please enable location to proceed.");
      return;
    }

    navigation.reset({
      index: 0,
      routes: [{ name: ROUTES.BOTTOM_TABS }],
    });
  }, [navigation, storedLocation]);

  // Handler for "Use Current Location" press
  const onUseCurrent = useCallback(() => {
    Keyboard.dismiss();
    requestLocation({ silent: false });
  }, [requestLocation]);

  // Optional: placeholder search submit (replace with Places autocomplete in production)
  const onSearchSubmit = useCallback(() => {
    Keyboard.dismiss();
    if (!searchQuery.trim()) return;
    // TODO: implement geocoding/autocomplete service (Google / Mapbox)
    Alert.alert("Search", `Search for "${searchQuery}".\n\nIn production replace this with a places autocomplete.`);
  }, [searchQuery]);

  const lat = storedLocation?.latitude ?? null;
  const lng = storedLocation?.longitude ?? null;

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>Choose Location</Text>

      <View style={styles.mapBox} accessible accessibilityLabel="Map area">
        {loading || requesting ? (
          <View style={{ alignItems: "center" }}>
            <ActivityIndicator size="large" color={PRIMARY_COLOR} />
            <Text style={{ marginTop: hp(1), color: "#333" }}>{requesting ? "Getting current location..." : "Loading…"}</Text>
          </View>
        ) : lat && lng ? (
          <View style={{ alignItems: "center" }}>
            {/* TODO: replace this placeholder with a MapView and a marker */}
            <Text style={{ fontWeight: "700", color: "#222" }}>Location found</Text>
            <Text style={styles.coordText}>Lat: {lat.toFixed(6)}</Text>
            <Text style={styles.coordText}>Lng: {lng.toFixed(6)}</Text>
          </View>
        ) : (
          <Text style={styles.coordText}>Map Placeholder</Text>
        )}

        {/* square search bar */}
        <View style={styles.searchWrapper}>
          <TextInput
            placeholder="Search for area, street name..."
            placeholderTextColor="#7f7a8b"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={onSearchSubmit}
            returnKeyType="search"
            style={styles.searchInput}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            accessibilityLabel="Search location"
            testID="location-search-input"
          />
          <TouchableOpacity
            onPress={onSearchSubmit}
            accessibilityRole="button"
            accessibilityLabel="Search"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="search-outline" size={hp(2.5)} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Recent Locations</Text>

        <View style={styles.locationItem}>
          <Ionicons size={hp(3)} name="home-outline" color={PRIMARY_COLOR} />
          <View style={{ marginLeft: wp(3) }}>
            <Text style={styles.locationTitle}>Home</Text>
            <Text style={styles.locationSubtitle}>HRS Layout, Bangalore</Text>
          </View>
        </View>

        <View style={styles.locationItem}>
          <Ionicons size={hp(3)} name="briefcase-outline" color={PRIMARY_COLOR} />
          <View style={{ marginLeft: wp(3) }}>
            <Text style={styles.locationTitle}>Office</Text>
            <Text style={styles.locationSubtitle}>Electric City, Bangalore</Text>
          </View>
        </View>

        {error ? (
          <Text style={{ color: "#B00020", marginTop: hp(1) }} accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}
      </View>

      <TouchableOpacity
        onPress={onUseCurrent}
        style={styles.useCurrentBtn}
        accessibilityRole="button"
        accessibilityLabel="Use current location"
        disabled={requesting}
      >
        {requesting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.useCurrentText}>Use Current Location</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, !(lat && lng) ? styles.buttonDisabled : null]}
        onPress={handleProceed}
        accessibilityRole="button"
        accessibilityLabel="Proceed to home"
        disabled={!(lat && lng)}
      >
        <Text style={styles.buttonText}>Proceed to Home</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default LocationScreen;

/* ---------------- Styles ---------------- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },

  title: {
    fontSize: hp(2.6),
    fontWeight: "600",
    marginHorizontal: wp(5),
    marginBottom: hp(1),
    paddingTop: hp(3),
  },

  mapBox: {
    height: hp(30),
    backgroundColor: "#eee",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(2),
    marginHorizontal: wp(4),
    borderRadius: 8,
    overflow: "hidden",
  },
  coordText: { fontSize: hp(1.8), color: "#333", marginTop: hp(0.4) },

  // square search bar (smaller radius for "square" appearance)
  searchWrapper: {
    position: "absolute",
    top: hp(2),
    left: wp(6),
    right: wp(6),
    backgroundColor: "#fff",
    borderRadius: 8, // square-ish corners
    paddingHorizontal: wp(3),
    height: hp(6),
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: hp(1.6),
    color: "#000",
    paddingVertical: 0,
  },

  content: {
    flex: 1,
    paddingHorizontal: wp(5),
    marginTop: hp(1),
  },
  sectionTitle: {
    fontSize: hp(2),
    fontWeight: "500",
    marginBottom: hp(1.5),
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(1.5),
    gap: wp(2),
  },
  locationTitle: {
    fontSize: hp(1.9),
    fontWeight: "600",
  },
  locationSubtitle: {
    fontSize: hp(1.6),
    color: "#555",
  },

  useCurrentBtn: {
    marginHorizontal: wp(5),
    marginTop: hp(2),
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: hp(1.4),
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  useCurrentText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: hp(1.9),
  },

  button: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: hp(1.8),
    borderRadius: theme.COMMON_BORDER_RADIUS ?? 12,
    alignItems: "center",
    marginHorizontal: wp(5),
    marginBottom: hp(2),
    marginTop: hp(2),
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontSize: hp(2),
    fontWeight: "600",
  },
});
