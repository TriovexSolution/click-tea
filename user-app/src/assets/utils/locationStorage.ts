// src/utils/locationStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCATION_KEY = 'USER_LOCATION';

export const saveLocationToStorage = async (latitude: number, longitude: number) => {
  const data = {
    latitude,
    longitude,
    lastUpdated: Date.now(),
  };
  await AsyncStorage.setItem(LOCATION_KEY, JSON.stringify(data));
};

export const getLocationFromStorage = async () => {
  const value = await AsyncStorage.getItem(LOCATION_KEY);
  return value ? JSON.parse(value) : null;
};

export const clearLocationFromStorage = async () => {
  await AsyncStorage.removeItem(LOCATION_KEY);
};
