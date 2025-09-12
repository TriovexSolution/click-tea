// src/hooks/useNetworkStatus.ts
import { useEffect, useState } from "react";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";

export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  return isConnected;
};
