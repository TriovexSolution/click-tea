// src/components/AppServices.tsx
import React from "react";
import { useSelector } from "react-redux";
import useRegisterPushAndSocket from "@/src/hooks/useRegisterPushAndSocket";
import useSocketNotifications from "@/src/hooks/useNotificationListner";

export default function AppServices({ children }: { children: React.ReactNode }) {
  const user = useSelector((s: any) => s.auth?.user ?? null);
  useRegisterPushAndSocket(user?.id ?? null, user?.role ?? null);
  useSocketNotifications(user?.id ?? null, user?.role ?? null);
  return <>{children}</>;
}
