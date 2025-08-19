// export const BASE_URL ="https://b054-2401-4900-78fd-400b-5d4f-e666-981d-f1eb.ngrok-free.app" // add here for testing ngrock api
import { Platform } from 'react-native';

const LOCAL_WIFI_IP = '192.168.1.14'; // ← replace this with your actual IP
const PORT = 5000;

// Add Automatically set BASE_URL based on platform
export const BASE_URL =
  Platform.OS === 'android'
    ? `http://${LOCAL_WIFI_IP}:${PORT}` // Android device or emulator
    : `http://localhost:${PORT}`;       // iOS simulator
