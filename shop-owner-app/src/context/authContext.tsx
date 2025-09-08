import React, { createContext, useEffect, useState, ReactNode, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { store } from "@/src/Redux/store";
import { clearAuthTokens, registerOnAuthFailure, setAuthTokens } from "../assets/api/client";
import { fetchUserProfile } from "../Redux/slice/profileSlice";

type AuthContextType = {
  isLoading: boolean;
  isLoggedIn: boolean;
  userId: number | null;
  token: string | null;
  shopId: number | null;
  signIn: (token: string, userId?: number, shopId?: number | null, refreshToken?: string | null) => Promise<void>;
  signOut: () => Promise<void>;
};

const defaultValue: AuthContextType = {
  isLoading: true,
  isLoggedIn: false,
  userId: null,
  token: null,
  shopId: null,
  signIn: async () => {},
  signOut: async () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultValue);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [shopId, setShopId] = useState<number | null>(null);

  useEffect(() => {
    registerOnAuthFailure(() => {
      signOut().catch((e) => console.warn("signOut after auth failure:", e));
    });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const storedToken = await AsyncStorage.getItem("authToken");
        const storedUserId = await AsyncStorage.getItem("userId");
        const storedShopId = await AsyncStorage.getItem("shop_id");
        const storedRefresh = await AsyncStorage.getItem("refreshToken");

        if (storedToken) {
          setToken(storedToken);
          setIsLoggedIn(true);
          await setAuthTokens({ accessToken: storedToken, refreshToken: storedRefresh ?? null });

          if (storedUserId) setUserId(Number(storedUserId));
          if (storedShopId) setShopId(Number(storedShopId)); // Handle null shopId
          // Fetch profile to validate data
          await store.dispatch(fetchUserProfile() as any);
        }
      } catch (err) {
        console.warn("Auth restore error:", err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const signIn = async (newToken: string, newUserId?: number, newShopId?: number | null, newRefreshToken?: string | null) => {
    try {
      await AsyncStorage.setItem("authToken", newToken);
      if (newUserId !== undefined) {
        await AsyncStorage.setItem("userId", String(newUserId));
        setUserId(newUserId);
      }
      if (newShopId !== undefined) {
        await AsyncStorage.setItem("shop_id", String(newShopId ?? ""));
        setShopId(newShopId ?? null);
      }
      if (newRefreshToken) {
        await AsyncStorage.setItem("refreshToken", newRefreshToken);
      }

      setToken(newToken);
      setIsLoggedIn(true);
      await setAuthTokens({ accessToken: newToken, refreshToken: newRefreshToken ?? null });

      // Fetch profile after sign-in
      await store.dispatch(fetchUserProfile() as any);
    } catch (err) {
      console.error("signIn error:", err);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await clearAuthTokens();
      await AsyncStorage.removeItem("userId");
      await AsyncStorage.removeItem("shop_id");
      await AsyncStorage.removeItem("refreshToken");
      setToken(null);
      setUserId(null);
      setShopId(null);
      setIsLoggedIn(false);
    } catch (err) {
      console.error("signOut error:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoading, isLoggedIn, userId, token, shopId, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);