// src/hooks/useRegisterPushAndSocket.ts
import { useEffect } from "react";
import notifications from "@/src/services/notification"; // your existing file
import socketService from "@/src/services/socketService";
import axiosClient from "../assets/api/client";

export default function useRegisterPushAndSocket(userId?: number | string | null, role?: string | null) {
  useEffect(() => {
    if (!userId) return;

    let mounted = true;

    (async () => {
      try {
        // request permission and obtain expo push token (or return cached)
        const expoPushToken = await notifications.registerForPushNotificationsAsync();
        if (!mounted) return;

        if (expoPushToken) {
          try {
            // Save token to backend (assumes axiosClient has auth header)
            await axiosClient.post("/api/notifications/register-push-token", {
              userId,
              expoPushToken,
            });
            console.log("Saved expo token to server:", expoPushToken);
          } catch (err) {
            console.warn("Failed to save token to server:", err);
          }
        } else {
          console.log("No expo push token (permission not granted?)");
        }
      } catch (err) {
        console.warn("registerForPushNotificationsAsync failed:", err);
      }

      // Connect socket and register user room
      try {
        socketService.connectSocket(); // idempotent
        socketService.registerUserOnSocket(userId, role);
        console.log("Socket register emitted", userId, role);
      } catch (err) {
        console.warn("Socket connect/register error:", err);
      }
    })();

    return () => {
      mounted = false;
      // don't disconnect socket here if you want a single global connection across the app
    };
  }, [userId, role]);
}
