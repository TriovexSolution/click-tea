// src/services/notifications.ts
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosClient from "../api/client";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const PUSH_TOKEN_KEY = "expoPushToken";

export async function createAndroidNotificationChannel() {
  if (Device.osName === "Android") {
    try {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    } catch (err) {
      console.warn("Error creating channel", err);
    }
  }
}

/**
 * Ask permission and return Expo push token (string) or null
 * also persists locally in AsyncStorage to avoid repeated requests.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  try {
    await createAndroidNotificationChannel();

    const saved = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
    if (saved) return saved;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Push notifications permission not granted");
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
    return token;
  } catch (err) {
    console.error("registerForPushNotificationsAsync error:", err);
    return null;
  }
}

/**
 * Save token to your backend. Assumes axiosClient includes auth header.
 */
export async function saveTokenToServer(userId: number | string, expoPushToken: string | null) {
  if (!expoPushToken) return false;
  try {
    await axiosClient.post("/api/notifications/register-push-token", {
      userId,
      expoPushToken,
    });
    return true;
  } catch (err) {
    console.error("saveTokenToServer error:", err);
    return false;
  }
}

/**
 * Show an immediate local notification on the device (used when socket event arrives).
 */
export async function presentLocalNotification({ title, body, data = {} }: { title: string; body: string; data?: any; }) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data },
      trigger: null, // show immediately
    });
  } catch (err) {
    console.error("presentLocalNotification error:", err);
  }
}

export default {
  registerForPushNotificationsAsync,
  saveTokenToServer,
  presentLocalNotification,
  createAndroidNotificationChannel,
};
