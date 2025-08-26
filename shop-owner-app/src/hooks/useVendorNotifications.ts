// // src/hooks/useVendorNotifications.ts
// import { useEffect } from "react";
// import socketService from "@/src/services/socketService";
// import notificationsService from "@/src/services/notification";

// export default function useVendorNotifications(vendorId?: number | string | null) {
//   useEffect(() => {
//     if (!vendorId) return;

//     socketService.connectSocket();
//     socketService.registerUserOnSocket(vendorId, "shop_owner");

//     const onOrderPlaced = (payload: any) => {
//       console.log("Vendor socket order:placed", payload);
//       notificationsService.presentLocalNotification({
//         title: "New Order Received",
//         body: payload.short || `Order #${payload.orderId} placed.`,
//         data: payload,
//       });
//       // optionally refresh vendor orders list here (call your GET /api/orders/shop-orders)
//     };

//     const onOrderStatusUpdated = (payload: any) => {
//       console.log("Vendor socket order:statusUpdated", payload);
//       notificationsService.presentLocalNotification({
//         title: "Order Update",
//         body: payload.short || `Order #${payload.orderId} is ${payload.status}`,
//         data: payload,
//       });
//     };

//     socketService.onSocket("order:placed", onOrderPlaced);
//     socketService.onSocket("order:statusUpdated", onOrderStatusUpdated);

//     return () => {
//       socketService.offSocket("order:placed", onOrderPlaced);
//       socketService.offSocket("order:statusUpdated", onOrderStatusUpdated);
//       // keep socket connection for app lifetime
//     };
//   }, [vendorId]);
// }
// src/hooks/useVendorNotifications.ts
import { useEffect } from "react";
import socketService from "@/src/services/socketService";
import notificationsService from "@/src/services/notification";

export default function useVendorNotifications(vendorId?: number | string | null, onNewOrder?: () => void) {
  useEffect(() => {
    if (!vendorId) return;

    socketService.connectSocket();
    socketService.registerUserOnSocket(vendorId, "shop_owner");

    const onOrderPlaced = (payload: any) => {
      console.log("Vendor socket order:placed", payload);
      notificationsService.presentLocalNotification({
        title: "New Order Received",
        body: `Order #${payload.orderId} placed.`,
        data: payload,
      });

      // ✅ refresh orders if callback passed
      if (onNewOrder) onNewOrder();
    };

    const onOrderStatusUpdated = (payload: any) => {
      console.log("Vendor socket order:statusUpdated", payload);
      notificationsService.presentLocalNotification({
        title: "Order Update",
        body: `Order #${payload.orderId} is ${payload.status}`,
        data: payload,
      });
    };

    socketService.onSocket("order:placed", onOrderPlaced);
    socketService.onSocket("order:statusUpdated", onOrderStatusUpdated);

    return () => {
      socketService.offSocket("order:placed", onOrderPlaced);
      socketService.offSocket("order:statusUpdated", onOrderStatusUpdated);
    };
  }, [vendorId, onNewOrder]);
}
