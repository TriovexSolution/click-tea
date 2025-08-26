// src/hooks/useSocketNotifications.ts
import { useEffect } from "react";
import socketService from "@/src/services/socketService";
import notificationsService from "@/src/services/notification";

export default function useSocketNotifications(userId?: number | string | null, role?: string | null) {
  useEffect(() => {
    if (!userId) return;

    socketService.connectSocket();
    socketService.registerUserOnSocket(userId, role);

    // handlers
    const onOrderPlaced = (payload: any) => {
      console.log("socket order:placed", payload);
      notificationsService.presentLocalNotification({
        title: "New Order Received",
        body: `Order #${payload.orderId} placed.`,
        data: payload,
      });
    };

    const onOrderStatusUpdated = (payload: any) => {
      console.log("socket order:statusUpdated", payload);
      notificationsService.presentLocalNotification({
        title: "Order Update",
        body: `Order #${payload.orderId} is now ${payload.status}`,
        data: payload,
      });
    };

    // Register listeners
    socketService.onSocket("order:placed", onOrderPlaced);
    socketService.onSocket("order:statusUpdated", onOrderStatusUpdated);

    return () => {
      socketService.offSocket("order:placed", onOrderPlaced);
      socketService.offSocket("order:statusUpdated", onOrderStatusUpdated);
      // do not disconnect socket here unless you want to tear down connection on screen unmount
    };
  }, [userId, role]);
}
