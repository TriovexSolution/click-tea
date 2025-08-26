// can be defined in same file or new file src/components/AppServices.tsx
import React from "react";
import { useSelector } from "react-redux";
import useRegisterPushAndSocket from "@/src/hooks/useRegisterPushAndSocket";
import useSocketNotifications from "../hooks/useNotificationListner.";
import useVendorNotifications from "@/src/hooks/useVendorNotifications";

export default function AppServices({ children }: { children: React.ReactNode }) {
  // IMPORTANT: this useSelector must be used after Provider is mounted
const user = useSelector((s:any)=> s.auth?.user ?? null);
useVendorNotifications(user?.id);

  return  <>{children}</>;
}
