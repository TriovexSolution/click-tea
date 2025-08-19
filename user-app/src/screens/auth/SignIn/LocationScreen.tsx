import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Linking
} from 'react-native';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { hp, wp } from '@/src/assets/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import theme from '@/src/assets/colors/theme';
import { useDispatch, useSelector } from 'react-redux';
import { getLocationFromStorage, saveLocationToStorage } from '@/src/assets/utils/locationStorage';
import { RootState } from '@/src/Redux/store';
import { setLocation } from '@/src/Redux/Slice/locationSlice';
import { useNavigation } from '@react-navigation/native';

const PRIMARY_COLOR = '#562E19';

const LocationScreen = () => {
  const dispatch = useDispatch();
  const location = useSelector((state: RootState) => state.location);
  const [loading, setLoading] = useState(true);
 const navigation = useNavigation();

  // const requestLocation = async () => {
  //   setLoading(true);
  //   try {
  //     const { status } = await Location.requestForegroundPermissionsAsync();
  //     if (status !== 'granted') {
  //       console.warn('Permission not granted');
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
  //   }
  //   setLoading(false);
  // };
const requestLocation = async () => {
  setLoading(true);
  try {
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      Alert.alert(
        "Enable Location",
        "Please turn on device location to continue.",
        [
          {
            text: "Go to Settings",
            onPress: () => {
              if (Platform.OS === "android") Linking.openSettings();
            },
          },
        ]
      );
      setLoading(false);
      return;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        "Permission Denied",
        "Location permission is required to continue.",
        [
          {
            text: "Retry",
            onPress: () => requestLocation(),
          },
          {
            text: "Cancel",
          },
        ]
      );
      setLoading(false);
      return;
    }

    const currentLoc = await Location.getCurrentPositionAsync({});
    const coords = {
      latitude: currentLoc.coords.latitude,
      longitude: currentLoc.coords.longitude,
    };
    dispatch(setLocation(coords));
    await saveLocationToStorage(coords.latitude, coords.longitude);

  } catch (err) {
    console.warn('Error fetching location', err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    const loadStoredLocation = async () => {
      const saved = await getLocationFromStorage();
      if (saved && Date.now() - saved.lastUpdated < 24 * 60 * 60 * 1000) {
        dispatch(setLocation({ latitude: saved.latitude, longitude: saved.longitude }));
        setLoading(false);
      } else {
        requestLocation();
      }
    };
    loadStoredLocation();
  }, []);

  // const handleProceed = () => {
  //   navigation.reset({
  //     index: 0,
  //     routes: [{ name: 'bottomTabScreen' }],
  //   });
  // };
const handleProceed = () => {
  if (!location.latitude || !location.longitude) {
    Alert.alert("Location Required", "Please enable location to proceed.");
    return;
  }
  navigation.reset({
    index: 0,
    routes: [{ name: "bottomTabScreen" }],
  });
};

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>Choose Location</Text>

      <View style={styles.mapBox}>
        {loading ? (
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        ) : location.latitude ? (
          <>
            {location.longitude !== null && location.latitude !== null && (
  <>
    <Text>Lat: {location.latitude.toFixed(6)}</Text>
    <Text>Lng: {location.longitude.toFixed(6)}</Text>
  </>
)}

          </>
        ) : (
          <Text style={styles.coordText}>Map Placeholder</Text>
        )}

        <View style={styles.searchWrapper}>
          <TextInput
            placeholder="Search for area, Street name..."
            placeholderTextColor="#333333"
            style={styles.searchInput}
          />
          <Ionicons size={hp(2.5)} name='search-outline' />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Recent Locations</Text>

        <View style={styles.locationItem}>
          <Ionicons size={hp(3)} name='location-outline' />
          <View>
            <Text style={styles.locationTitle}>Home</Text>
            <Text style={styles.locationSubtitle}>HRS Layout, Bangalore</Text>
          </View>
        </View>

        <View style={styles.locationItem}>
          <Ionicons size={hp(3)} name='location-outline' />
          <View>
            <Text style={styles.locationTitle}>Office</Text>
            <Text style={styles.locationSubtitle}>Electric City, Bangalore</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity onPress={requestLocation}>
        <Text style={styles.useCurrentText}>Use Current Location</Text>
      </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleProceed}>
      <Text style={styles.buttonText}>Proceed to Home</Text>
    </TouchableOpacity>
    </SafeAreaView>
  );
};

export default LocationScreen;

// your same styles here...


const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },

  title: {
    fontSize: hp(2.6),
    fontWeight: '600',
    marginHorizontal: wp(5),
    marginBottom: hp(1),
  paddingTop:hp(3)  
  },

  mapBox: {
    height: hp(30),
    backgroundColor: '#eee',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  coordText: { fontSize: hp(1.8), color: '#333' },

  searchWrapper: {
    position: 'absolute',
    top: hp(2),
    left: wp(5),
    right: wp(5),
    backgroundColor: '#fff',
    borderRadius: hp(3),
    paddingHorizontal: wp(4),
    height: hp(6),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: hp(1.5),
    color: '#000',
  },
  searchIcon: {
    fontSize: hp(2.2),
    marginLeft: wp(2),
  },

  content: {
    flex: 1,
    paddingHorizontal: wp(5),
  },
  sectionTitle: {
    fontSize: hp(2),
    fontWeight: '500',
    marginBottom: hp(1.5),
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1.5),
    gap:wp(2)
  },
  pinIcon: {
    fontSize: hp(2.4),
    marginRight: wp(2.5),
  },
  locationTitle: {
    fontSize: hp(1.9),
    fontWeight: '600',
  },
  locationSubtitle: {
    fontSize: hp(1.6),
    color: '#555',
  },
  useCurrentText: {
    textAlign: 'center',
    color: PRIMARY_COLOR,
    marginTop: hp(2.5),
    textDecorationLine: 'underline',
    fontWeight: '500',
    fontSize: hp(1.8),
    paddingBottom:hp(2)
  },

  button: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: hp(1.8),
    borderRadius: theme.COMMON_BORDER_RADIUS,
    alignItems: 'center',
    marginHorizontal: wp(5),
    marginBottom: hp(2),
  },
  buttonText: {
    color: '#fff',
    fontSize: hp(2),
    fontWeight: '600',
  },
});
