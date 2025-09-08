// src/components/AppServices.tsx
import React from "react";
import { useSelector } from "react-redux";


export default function AppServices({ children }: { children: React.ReactNode }) {
  const user = useSelector((s: any) => s.auth?.user ?? null);

  return <>{children}</>;
}
